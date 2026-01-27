import Foundation

/// Protocol for remote chat data source (JanSeva)
protocol ChatRemoteDataSourceProtocol: Sendable {
    func sendMessage(_ request: ChatRequestDTO) async throws -> ChatResponseDTO
    func streamMessage(_ request: ChatRequestDTO) -> AsyncThrowingStream<String, Error>
}

/// Demo session response DTO
private struct DemoSessionResponseDTO: Codable {
    let sessionId: String
    let expiresAt: String?
    let language: String?
}

/// Demo chat request DTO
private struct DemoChatRequestDTO: Codable {
    let message: String
    let sessionId: String?
    let language: String?
}

/// Remote data source for JanSeva chat operations
final class ChatRemoteDataSource: ChatRemoteDataSourceProtocol, @unchecked Sendable {
    private let apiClient: APIClient

    /// Cached demo session ID for development mode
    private static var demoSessionId: String?

    init(apiClient: APIClient) {
        self.apiClient = apiClient
    }

    /// Check if we have a valid auth token
    private func hasAuthToken() async -> Bool {
        do {
            let token = try await KeychainManager.shared.getAccessToken()
            return token != nil
        } catch {
            return false
        }
    }

    /// Get or create a demo session for anonymous chat
    private func getDemoSessionId() async throws -> String {
        // Return cached session if available
        if let sessionId = ChatRemoteDataSource.demoSessionId {
            return sessionId
        }

        // Create new demo session
        let response: DemoSessionResponseDTO = try await apiClient.request(
            endpoint: .chatDemo,
            requiresAuth: false
        )

        ChatRemoteDataSource.demoSessionId = response.sessionId
        AppConfig.shared.debugLog("Created demo session: \(response.sessionId)")
        return response.sessionId
    }

    func sendMessage(_ request: ChatRequestDTO) async throws -> ChatResponseDTO {
        AppConfig.shared.debugLog("sendMessage called with: \(request.message)")

        // In development mode without auth, use demo chat endpoint
        if AppConfig.shared.isDevelopment {
            let hasToken = await hasAuthToken()
            AppConfig.shared.debugLog("Development mode, hasToken: \(hasToken)")
            if !hasToken {
                AppConfig.shared.debugLog("Using demo chat endpoint")
                return try await sendDemoMessage(request)
            }
        }

        // Use authenticated endpoint
        AppConfig.shared.debugLog("Using authenticated chat endpoint")
        let response: ChatResponseDTO = try await apiClient.request(
            endpoint: .chatSend,
            body: request
        )

        return response
    }

    /// Send message using demo chat endpoint (no auth required)
    private func sendDemoMessage(_ request: ChatRequestDTO) async throws -> ChatResponseDTO {
        AppConfig.shared.debugLog("sendDemoMessage called")
        let sessionId = try await getDemoSessionId()
        AppConfig.shared.debugLog("Got session ID: \(sessionId)")

        let demoRequest = DemoChatRequestDTO(
            message: request.message,
            sessionId: sessionId,
            language: nil
        )

        AppConfig.shared.debugLog("Sending demo chat request...")
        let response: ChatResponseDTO = try await apiClient.request(
            endpoint: .chatDemoSession(sessionId: sessionId),
            body: demoRequest,
            requiresAuth: false
        )
        AppConfig.shared.debugLog("Got response: \(response.content)")

        return response
    }

    func streamMessage(_ request: ChatRequestDTO) -> AsyncThrowingStream<String, Error> {
        AsyncThrowingStream { continuation in
            Task {
                do {
                    // For now, fallback to regular request
                    // TODO: Implement SSE streaming
                    let response: ChatResponseDTO = try await apiClient.request(
                        endpoint: .chatSend,
                        body: request
                    )

                    continuation.yield(response.content)
                    continuation.finish()
                } catch {
                    continuation.finish(throwing: error)
                }
            }
        }
    }
}
