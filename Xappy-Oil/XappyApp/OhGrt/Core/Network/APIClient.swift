import Foundation
import os.log

private let logger = Logger(subsystem: "com.xappy.ai", category: "APIClient")

/// Main API client for communicating with the backend
@MainActor
class APIClient {
    /// Shared singleton instance
    static let shared = APIClient()

    /// Base URL for the API
    private let baseURL: URL

    /// URLSession with SSL pinning
    private let session: URLSession

    /// Request interceptor for headers and auth
    private let interceptor: RequestInterceptor

    /// JSON decoder with date handling
    private let decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        decoder.dateDecodingStrategy = .custom { decoder in
            let container = try decoder.singleValueContainer()
            let dateString = try container.decode(String.self)

            // Try ISO8601 with fractional seconds
            let formatter = ISO8601DateFormatter()
            formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let date = formatter.date(from: dateString) {
                return date
            }

            // Try without fractional seconds
            formatter.formatOptions = [.withInternetDateTime]
            if let date = formatter.date(from: dateString) {
                return date
            }

            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Cannot decode date: \(dateString)"
            )
        }
        return decoder
    }()

    /// JSON encoder
    private let encoder: JSONEncoder = {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        return encoder
    }()

    /// Flag to prevent infinite refresh loops
    private var isRefreshing = false

    /// Maximum retry attempts for transient failures
    private let maxRetryAttempts: Int

    private init() {
        // Use environment-based configuration
        self.baseURL = AppConfig.shared.apiBaseURL
        self.maxRetryAttempts = AppConfig.shared.maxRetryAttempts

        // Use SSL pinning session with configured timeout
        self.session = URLSession.pinnedSession(timeoutInterval: AppConfig.shared.requestTimeout)
        self.interceptor = RequestInterceptor()

        AppConfig.shared.debugLog("APIClient initialized with base URL: \(baseURL)")
    }

    /// Calculate delay for exponential backoff
    private func retryDelay(attempt: Int) -> UInt64 {
        // Exponential backoff: 1s, 2s, 4s, etc. with jitter
        let baseDelay = pow(2.0, Double(attempt))
        let jitter = Double.random(in: 0...0.5)
        let delaySeconds = min(baseDelay + jitter, 30.0) // Max 30 seconds
        return UInt64(delaySeconds * 1_000_000_000)
    }

    /// Check if an error is retryable
    private func isRetryableError(_ error: Error) -> Bool {
        if let urlError = error as? URLError {
            switch urlError.code {
            case .timedOut, .networkConnectionLost, .notConnectedToInternet:
                return true
            default:
                return false
            }
        }
        return false
    }

    /// Check if an HTTP status code is retryable
    private func isRetryableStatus(_ statusCode: Int) -> Bool {
        // Retry on server errors (5xx) except 501 (Not Implemented)
        return statusCode >= 500 && statusCode != 501
    }

    private func shouldRedactLogs(for endpoint: APIEndpoint) -> Bool {
        switch endpoint {
        case .login, .otpSend, .otpVerify, .refreshToken, .register:
            return true
        default:
            return false
        }
    }

    /// Make an API request with automatic retry for transient failures
    /// - Parameters:
    ///   - endpoint: The API endpoint
    ///   - body: Optional request body (Encodable)
    ///   - requiresAuth: Whether auth is required (defaults to endpoint's setting)
    ///   - retryCount: Current retry attempt (internal use)
    /// - Returns: Decoded response
    func request<T: Decodable>(
        endpoint: APIEndpoint,
        body: (any Encodable)? = nil,
        requiresAuth: Bool? = nil,
        retryCount: Int = 0
    ) async throws -> T {
        // Check network connectivity before making request
        if !OfflineManager.shared.isOnline {
            logger.warning("Network unavailable for request to \(endpoint.path)")

            // Check if this request type can be queued for later
            if let encodedBody = try? body.flatMap({ try encoder.encode($0) }),
               OfflineManager.shared.shouldQueueRequest(endpoint: endpoint.path) {
                OfflineManager.shared.queueRequest(
                    endpoint: endpoint.path,
                    method: endpoint.method.rawValue,
                    body: encodedBody
                )
                throw APIError.offline(queued: true)
            }

            throw APIError.offline(queued: false)
        }

        let authRequired = requiresAuth ?? endpoint.requiresAuth

        // Build URL
        let url = baseURL.appendingPathComponent(endpoint.path)
        var request = URLRequest(url: url)
        request.httpMethod = endpoint.method.rawValue

        // Encode body if provided, or use empty JSON for POST/PUT
        if let body = body {
            do {
                request.httpBody = try encoder.encode(body)
            } catch {
                throw APIError.encodingError(error)
            }
        } else if endpoint.method == .post || endpoint.method == .put {
            // Some servers require a body for POST/PUT requests
            request.httpBody = "{}".data(using: .utf8)
        }

        // Add headers via interceptor
        do {
            request = try await interceptor.intercept(request, requiresAuth: authRequired)
        } catch {
            throw error
        }

        // Log request
        AppConfig.shared.debugLog("📤 REQUEST: \(endpoint.method.rawValue) \(url.absoluteString)")
        if let body = request.httpBody, let bodyString = String(data: body, encoding: .utf8) {
            if shouldRedactLogs(for: endpoint) {
                AppConfig.shared.debugLog("📤 BODY: <redacted>")
            } else {
                AppConfig.shared.debugLog("📤 BODY: \(bodyString)")
            }
        }

        // Make request with retry logic
        let (data, response): (Data, URLResponse)
        do {
            (data, response) = try await session.data(for: request)
        } catch {
            // Check if we should retry network errors
            if isRetryableError(error) && retryCount < maxRetryAttempts {
                AppConfig.shared.debugLog("Retrying request after network error (attempt \(retryCount + 1))")
                try await Task.sleep(nanoseconds: retryDelay(attempt: retryCount))
                return try await self.request(
                    endpoint: endpoint,
                    body: body,
                    requiresAuth: authRequired,
                    retryCount: retryCount + 1
                )
            }
            throw APIError.networkError(error)
        }

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        // Log response
        let responseString = String(data: data, encoding: .utf8) ?? "Unable to decode"
        if shouldRedactLogs(for: endpoint) {
            AppConfig.shared.debugLog("📥 RESPONSE [\(httpResponse.statusCode)]: <redacted>")
        } else {
            AppConfig.shared.debugLog("📥 RESPONSE [\(httpResponse.statusCode)]: \(responseString)")
        }

        // Handle 401 - try token refresh once
        if httpResponse.statusCode == 401 && authRequired && !isRefreshing {
            isRefreshing = true
            defer { isRefreshing = false }

            do {
                try await TokenRefresher.shared.refreshIfNeeded()
                // Retry the request (don't count this as a retry attempt)
                return try await self.request(endpoint: endpoint, body: body, requiresAuth: authRequired, retryCount: 0)
            } catch {
                throw APIError.tokenExpired
            }
        }

        // Check for retryable server errors
        if isRetryableStatus(httpResponse.statusCode) && retryCount < maxRetryAttempts {
            AppConfig.shared.debugLog("Retrying request after server error \(httpResponse.statusCode) (attempt \(retryCount + 1))")
            try await Task.sleep(nanoseconds: retryDelay(attempt: retryCount))
            return try await self.request(
                endpoint: endpoint,
                body: body,
                requiresAuth: authRequired,
                retryCount: retryCount + 1
            )
        }

        // Check for errors
        guard (200...299).contains(httpResponse.statusCode) else {
            // Try to decode error message
            if let errorResponse = try? decoder.decode(ServerErrorResponse.self, from: data) {
                throw APIError.serverError(message: errorResponse.errorMessage)
            }
            throw APIError.httpError(statusCode: httpResponse.statusCode, data: data)
        }

        // Decode response
        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            let detailedError: String
            if let decodingError = error as? DecodingError {
                detailedError = String(describing: decodingError)
            } else {
                detailedError = error.localizedDescription
            }
            let rawLog = shouldRedactLogs(for: endpoint) ? "<redacted>" : responseString
            AppConfig.shared.debugLog(
                "Decoding error for \(endpoint.path): \(detailedError). Raw: \(rawLog)"
            )
            throw APIError.decodingError(error)
        }
    }

    /// Make a request without expecting a response body
    func requestVoid(
        endpoint: APIEndpoint,
        body: (any Encodable)? = nil,
        requiresAuth: Bool? = nil
    ) async throws {
        let _: EmptyResponse = try await request(endpoint: endpoint, body: body, requiresAuth: requiresAuth)
    }

    /// Download raw data from an endpoint (for file exports)
    /// - Parameters:
    ///   - endpoint: The API endpoint
    ///   - requiresAuth: Whether auth is required (defaults to endpoint's setting)
    /// - Returns: Raw data from the response
    func downloadData(
        endpoint: APIEndpoint,
        requiresAuth: Bool? = nil
    ) async throws -> Data {
        // Check network connectivity
        if !OfflineManager.shared.isOnline {
            throw APIError.offline(queued: false)
        }

        let authRequired = requiresAuth ?? endpoint.requiresAuth

        // Build URL
        let url = baseURL.appendingPathComponent(endpoint.path)
        var request = URLRequest(url: url)
        request.httpMethod = endpoint.method.rawValue

        // Add headers via interceptor
        request = try await interceptor.intercept(request, requiresAuth: authRequired)

        AppConfig.shared.debugLog("📤 DOWNLOAD REQUEST: \(endpoint.method.rawValue) \(url.absoluteString)")

        let (data, response): (Data, URLResponse)
        do {
            (data, response) = try await session.data(for: request)
        } catch {
            throw APIError.networkError(error)
        }

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        AppConfig.shared.debugLog("📥 DOWNLOAD RESPONSE [\(httpResponse.statusCode)]: \(data.count) bytes")

        guard (200...299).contains(httpResponse.statusCode) else {
            if let errorResponse = try? decoder.decode(ServerErrorResponse.self, from: data) {
                throw APIError.serverError(message: errorResponse.errorMessage)
            }
            throw APIError.httpError(statusCode: httpResponse.statusCode, data: data)
        }

        return data
    }
}

// MARK: - Convenience Methods

extension APIClient {
    /// Send a chat message
    func sendMessage(
        _ message: String,
        conversationId: UUID? = nil,
        tools: [String]? = nil
    ) async throws -> ChatSendResponse {
        let request = ChatSendRequest(message: message, conversationId: conversationId, tools: tools)
        return try await self.request(endpoint: .chatSend, body: request)
    }

    /// Get chat history
    func getChatHistory(conversationId: String? = nil, limit: Int = 50) async throws -> ChatHistoryResponse {
        let historyURL = baseURL.appendingPathComponent("/chat/history")
        guard var urlComponents = URLComponents(string: historyURL.absoluteString) else {
            throw APIError.invalidURL
        }

        var queryItems: [URLQueryItem] = [URLQueryItem(name: "limit", value: String(limit))]
        if let convId = conversationId {
            queryItems.append(URLQueryItem(name: "conversation_id", value: convId))
        }
        urlComponents.queryItems = queryItems

        guard let url = urlComponents.url else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = HTTPMethod.get.rawValue

        request = try await interceptor.intercept(request, requiresAuth: true)

        let (data, response): (Data, URLResponse)
        do {
            (data, response) = try await session.data(for: request)
        } catch {
            throw APIError.networkError(error)
        }

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            if let errorResponse = try? decoder.decode(ServerErrorResponse.self, from: data) {
                throw APIError.serverError(message: errorResponse.errorMessage)
            }
            throw APIError.httpError(statusCode: httpResponse.statusCode, data: data)
        }

        return try decoder.decode(ChatHistoryResponse.self, from: data)
    }

    // MARK: - JanSeva Authentication

    /// Sign in with badge number and PIN
    func signIn(phoneNumber: String, password: String) async throws -> XappyAuthResponseDTO {
        let request = BadgeLoginRequestDTO(badgeNumber: phoneNumber, pin: password)
        return try await self.request(endpoint: .login, body: request, requiresAuth: false)
    }

    /// Send OTP to phone number
    func sendOTP(phoneNumber: String) async throws {
        let request = OTPSendRequestDTO(phoneNumber: phoneNumber)
        let _: EmptyResponse = try await self.request(endpoint: .otpSend, body: request, requiresAuth: false)
    }

    /// Verify OTP and get auth tokens
    func verifyOTP(phoneNumber: String, otp: String) async throws -> XappyAuthResponseDTO {
        let request = OTPVerifyRequestDTO(phoneNumber: phoneNumber, otp: otp)
        return try await self.request(endpoint: .otpVerify, body: request, requiresAuth: false)
    }

    /// Refresh access token
    func refreshAccessToken(refreshToken: String) async throws -> TokenRefreshResponseDTO {
        let request = TokenRefreshRequestDTO(refreshToken: refreshToken)
        return try await self.request(endpoint: .refreshToken, body: request, requiresAuth: false)
    }

    // MARK: - Profile

    /// Get current user profile
    func getProfile() async throws -> UserResponse {
        return try await request(endpoint: .me)
    }

    /// Update user profile
    func updateProfile(_ profile: ProfileUpdateRequest) async throws -> UserResponse {
        return try await request(endpoint: .updateProfile, body: profile)
    }

    // MARK: - Safety Reports (JanSeva)

    /// Get safety reports list
    func getSafetyReports() async throws -> ReportsListResponseDTO {
        return try await request(endpoint: .safetyReports)
    }

    /// Get user's own safety reports
    func getMySafetyReports() async throws -> ReportsListResponseDTO {
        return try await request(endpoint: .safetyReportsMy)
    }

    /// Get safety report detail by ID
    func getSafetyReport(id: String) async throws -> ReportDetailDTO {
        return try await request(endpoint: .safetyReport(id: id))
    }

    /// Acknowledge a safety report
    func acknowledgeSafetyReport(id: String, notes: String? = nil) async throws -> ReportDTO {
        let body = AcknowledgeReportRequestDTO(notes: notes)
        return try await request(endpoint: .acknowledgeReport(id: id), body: body)
    }

    /// Close a safety report
    func closeSafetyReport(id: String, resolution: String, notes: String? = nil) async throws -> ReportDTO {
        let body = CloseReportRequestDTO(resolution: resolution, notes: notes)
        return try await request(endpoint: .closeReport(id: id), body: body)
    }

    /// Get safety report timeline/audit trail
    func getSafetyReportTimeline(id: String) async throws -> [TimelineEventDTO] {
        return try await request(endpoint: .reportTimeline(id: id))
    }

    // MARK: - Dashboard Stats (JanSeva)

    /// Get user dashboard stats
    func getDashboardStats() async throws -> DashboardStatsDTO {
        return try await request(endpoint: .dashboardStats)
    }

    /// Get safety analytics dashboard
    func getSafetyAnalyticsDashboard() async throws -> SafetyAnalyticsDashboardDTO {
        return try await request(endpoint: .safetyAnalyticsDashboard)
    }

    /// Get safety analytics trends
    func getSafetyAnalyticsTrends() async throws -> SafetyAnalyticsTrendsDTO {
        return try await request(endpoint: .safetyAnalyticsTrends)
    }

    /// Get safety analytics KPIs
    func getSafetyAnalyticsKPIs() async throws -> SafetyAnalyticsKPIsDTO {
        return try await request(endpoint: .safetyAnalyticsKpis)
    }
}

// MARK: - Dashboard DTOs (JanSeva)

struct DashboardStatsDTO: Codable {
    let totalReports: Int?
    let pendingReports: Int?
    let resolvedReports: Int?

    enum CodingKeys: String, CodingKey {
        case totalReports = "total_reports"
        case pendingReports = "pending_reports"
        case resolvedReports = "resolved_reports"
    }
}

struct SafetyAnalyticsDashboardDTO: Codable {}
struct SafetyAnalyticsTrendsDTO: Codable {}
struct SafetyAnalyticsKPIsDTO: Codable {}
