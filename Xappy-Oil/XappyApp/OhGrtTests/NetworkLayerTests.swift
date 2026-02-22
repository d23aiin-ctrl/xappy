//
//  NetworkLayerTests.swift
//  OhGrtTests
//
//  Tests for network layer components
//

import Testing
import Foundation
@testable import OhGrt

// MARK: - RequestInterceptor Extended Tests

struct RequestInterceptorExtendedTests {

    @Test func multipleNoncesAreUnique() async throws {
        let interceptor = RequestInterceptor()
        var nonces: Set<String> = []

        for _ in 0..<100 {
            let nonce = await interceptor.generateNonce()
            nonces.insert(nonce)
        }

        // All 100 nonces should be unique
        #expect(nonces.count == 100)
    }

    @Test func multipleRequestIdsAreUnique() async throws {
        let interceptor = RequestInterceptor()
        var ids: Set<String> = []

        for _ in 0..<100 {
            let requestId = await interceptor.generateRequestId()
            ids.insert(requestId)
        }

        // All 100 IDs should be unique
        #expect(ids.count == 100)
    }

    @Test func timestampIsReasonable() async throws {
        let interceptor = RequestInterceptor()
        let timestamp = await interceptor.currentTimestamp()
        let timestampValue = Double(timestamp)!

        // Should be after January 1, 2020
        let jan2020: TimeInterval = 1577836800
        #expect(timestampValue > jan2020)

        // Should be before January 1, 2100
        let jan2100: TimeInterval = 4102444800
        #expect(timestampValue < jan2100)
    }
}

// MARK: - APIClient Configuration Tests

struct APIClientConfigTests {

    @Test func sharedInstanceExists() async throws {
        await MainActor.run {
            let client = APIClient.shared
            #expect(client != nil)
        }
    }
}

// MARK: - URLSession Pinning Tests

struct URLSessionPinningTests {

    @Test func pinnedSessionHasCorrectConfiguration() async throws {
        let session = URLSession.pinnedSession()

        // Check timeout settings
        #expect(session.configuration.timeoutIntervalForRequest == 30)
        #expect(session.configuration.timeoutIntervalForResource == 60)
    }

    @Test func pinnedSessionWithCustomTimeout() async throws {
        let customTimeout: TimeInterval = 45
        let session = URLSession.pinnedSession(timeoutInterval: customTimeout)

        #expect(session.configuration.timeoutIntervalForRequest == customTimeout)
    }

    @Test func multiplePinnedSessionsAreIndependent() async throws {
        let session1 = URLSession.pinnedSession(timeoutInterval: 10)
        let session2 = URLSession.pinnedSession(timeoutInterval: 20)

        #expect(session1.configuration.timeoutIntervalForRequest == 10)
        #expect(session2.configuration.timeoutIntervalForRequest == 20)
    }
}

// MARK: - HTTPMethod Tests

struct HTTPMethodExtendedTests {

    @Test func allMethodsExist() async throws {
        let methods: [HTTPMethod] = [.get, .post, .put, .delete]

        #expect(methods.count == 4)
    }

    @Test func methodsAreUppercase() async throws {
        #expect(HTTPMethod.get.rawValue == HTTPMethod.get.rawValue.uppercased())
        #expect(HTTPMethod.post.rawValue == HTTPMethod.post.rawValue.uppercased())
        #expect(HTTPMethod.put.rawValue == HTTPMethod.put.rawValue.uppercased())
        #expect(HTTPMethod.delete.rawValue == HTTPMethod.delete.rawValue.uppercased())
    }
}

// MARK: - API Endpoint Extended Tests

struct APIEndpointExtendedTests {

    @Test func authEndpointsHavePaths() async throws {
        let endpoints: [APIEndpoint] = [
            .login,
            .otpSend,
            .otpVerify,
            .refreshToken,
            .logout,
            .me,
            .register,
        ]

        for endpoint in endpoints {
            #expect(!endpoint.path.isEmpty)
            #expect(endpoint.path.hasPrefix("/"))
        }
    }

    @Test func chatEndpointsHavePaths() async throws {
        let endpoints: [APIEndpoint] = [
            .chatSend,
            .chatHistory(conversationId: "test-id"),
            .chatClassify,
            .chatDemo,
            .chatDemoSession(sessionId: "sess-1"),
        ]

        for endpoint in endpoints {
            #expect(!endpoint.path.isEmpty)
            #expect(endpoint.path.hasPrefix("/"))
        }
    }

    @Test func safetyReportEndpointsHavePaths() async throws {
        let endpoints: [APIEndpoint] = [
            .safetyReports,
            .safetyReportsMy,
            .safetyReportsPending,
            .safetyReport(id: "rpt-1"),
            .createSafetyReport,
            .acknowledgeReport(id: "rpt-1"),
            .closeReport(id: "rpt-1"),
            .escalateReport(id: "rpt-1"),
            .assignReport(id: "rpt-1"),
            .reportTimeline(id: "rpt-1"),
            .safetyReportsDashboard,
            .safetyReportsSummary,
        ]

        for endpoint in endpoints {
            #expect(!endpoint.path.isEmpty)
            #expect(endpoint.path.hasPrefix("/"))
        }
    }

    @Test func agentEndpointsHavePaths() async throws {
        let endpoints: [APIEndpoint] = [
            .agentChat,
            .agentConversations,
            .agentConversationMessages(conversationId: "conv-1"),
            .agentConversationClose(conversationId: "conv-1"),
        ]

        for endpoint in endpoints {
            #expect(!endpoint.path.isEmpty)
            #expect(endpoint.path.hasPrefix("/"))
        }
    }

    @Test func dashboardEndpointsHavePaths() async throws {
        let endpoints: [APIEndpoint] = [
            .dashboardStats,
            .safetyAnalyticsDashboard,
            .safetyAnalyticsTrends,
            .safetyAnalyticsKpis,
        ]

        for endpoint in endpoints {
            #expect(!endpoint.path.isEmpty)
        }
    }

    @Test func siteAndUserEndpointsHavePaths() async throws {
        let endpoints: [APIEndpoint] = [
            .sites,
            .sitesMy,
            .site(id: "s1"),
            .siteWorkers(siteId: "s1"),
            .users,
            .user(id: "u1"),
        ]

        for endpoint in endpoints {
            #expect(!endpoint.path.isEmpty)
            #expect(endpoint.path.hasPrefix("/"))
        }
    }

    @Test func approvalEndpointsHavePaths() async throws {
        let endpoints: [APIEndpoint] = [
            .approvalsPending,
            .approvalAcknowledge(reportId: "rpt-1"),
            .approvalClose(reportId: "rpt-1"),
            .approvalEscalate(reportId: "rpt-1"),
            .approvalHistory(reportId: "rpt-1"),
        ]

        for endpoint in endpoints {
            #expect(!endpoint.path.isEmpty)
            #expect(endpoint.path.hasPrefix("/"))
        }
    }

    @Test func analyticsEndpointsHavePaths() async throws {
        let endpoints: [APIEndpoint] = [
            .analyticsDashboard(timeRange: "30d"),
            .analyticsSiteComparison(timeRange: "30d"),
            .analyticsTopReporters(timeRange: "30d", limit: 10),
            .analyticsExportCSV(timeRange: "30d"),
            .analyticsExportExcel(timeRange: "30d"),
            .analyticsExportAuditPack(timeRange: "30d"),
            .analyticsBreakdownType,
            .analyticsBreakdownStatus,
            .analyticsBreakdownPriority,
        ]

        for endpoint in endpoints {
            #expect(!endpoint.path.isEmpty)
        }
    }

    @Test func postEndpointsUsePostMethod() async throws {
        let postEndpoints: [APIEndpoint] = [
            .login,
            .otpSend,
            .otpVerify,
            .refreshToken,
            .logout,
            .register,
            .createSafetyReport,
            .chatSend,
            .chatClassify,
            .chatDemo,
            .agentChat,
            .acknowledgeReport(id: "x"),
            .closeReport(id: "x"),
            .escalateReport(id: "x"),
            .assignReport(id: "x"),
        ]

        for endpoint in postEndpoints {
            #expect(endpoint.method == .post, "Expected \(endpoint) to be POST")
        }
    }

    @Test func getEndpointsUseGetMethod() async throws {
        let getEndpoints: [APIEndpoint] = [
            .me,
            .chatHistory(conversationId: "test-id"),
            .health,
            .safetyReports,
            .safetyReportsMy,
            .safetyReportsPending,
            .safetyReport(id: "x"),
            .reportTimeline(id: "x"),
            .agentConversations,
            .agentConversationMessages(conversationId: "x"),
            .dashboardStats,
            .sites,
            .sitesMy,
            .users,
            .approvalsPending,
        ]

        for endpoint in getEndpoints {
            #expect(endpoint.method == .get, "Expected \(endpoint) to be GET")
        }
    }

    @Test func updateProfileUsesPut() async throws {
        #expect(APIEndpoint.updateProfile.method == .put)
    }

    @Test func authEndpointsDontRequireAuth() async throws {
        #expect(APIEndpoint.login.requiresAuth == false)
        #expect(APIEndpoint.otpSend.requiresAuth == false)
        #expect(APIEndpoint.otpVerify.requiresAuth == false)
        #expect(APIEndpoint.register.requiresAuth == false)
        #expect(APIEndpoint.health.requiresAuth == false)
        #expect(APIEndpoint.chatDemo.requiresAuth == false)
        #expect(APIEndpoint.chatDemoSession(sessionId: "s").requiresAuth == false)
    }

    @Test func protectedEndpointsRequireAuth() async throws {
        #expect(APIEndpoint.me.requiresAuth == true)
        #expect(APIEndpoint.chatSend.requiresAuth == true)
        #expect(APIEndpoint.agentChat.requiresAuth == true)
        #expect(APIEndpoint.safetyReports.requiresAuth == true)
        #expect(APIEndpoint.dashboardStats.requiresAuth == true)
        #expect(APIEndpoint.sites.requiresAuth == true)
        #expect(APIEndpoint.users.requiresAuth == true)
    }

    @Test func dynamicEndpointPathsContainIds() async throws {
        #expect(APIEndpoint.safetyReport(id: "rpt-123").path.contains("rpt-123"))
        #expect(APIEndpoint.chatHistory(conversationId: "conv-99").path.contains("conv-99"))
        #expect(APIEndpoint.user(id: "user-1").path.contains("user-1"))
        #expect(APIEndpoint.site(id: "site-1").path.contains("site-1"))
        #expect(APIEndpoint.siteWorkers(siteId: "site-2").path.contains("site-2"))
    }

    @Test func loginPathContainsBadgeLogin() async throws {
        #expect(APIEndpoint.login.path.contains("badge-login"))
    }

    @Test func otpPathsContainOtp() async throws {
        #expect(APIEndpoint.otpSend.path.contains("otp"))
        #expect(APIEndpoint.otpVerify.path.contains("otp"))
    }

    @Test func healthPathContainsHealth() async throws {
        #expect(APIEndpoint.health.path.contains("health"))
    }
}

// MARK: - Server Error Response Extended Tests

struct ServerErrorResponseExtendedTests {

    @Test func emptyJSONReturnsUnknown() async throws {
        let json = "{}".data(using: .utf8)!
        let decoder = JSONDecoder()
        let response = try decoder.decode(ServerErrorResponse.self, from: json)

        #expect(response.errorMessage == "Unknown error")
    }

    @Test func detailTakesPrecedenceOverMessage() async throws {
        let json = """
        {"detail": "Specific error", "message": "General error"}
        """.data(using: .utf8)!

        let decoder = JSONDecoder()
        let response = try decoder.decode(ServerErrorResponse.self, from: json)

        #expect(response.errorMessage == "Specific error")
    }

    @Test func messageFallbackWhenNoDetail() async throws {
        let json = """
        {"message": "Only message present"}
        """.data(using: .utf8)!

        let decoder = JSONDecoder()
        let response = try decoder.decode(ServerErrorResponse.self, from: json)

        #expect(response.errorMessage == "Only message present")
    }

    @Test func serverErrorResponseWithFieldErrors() async throws {
        let json = """
        {
            "error": "VALIDATION_ERROR",
            "message": "Validation failed",
            "details": {
                "errors": [
                    {"field": "phone", "message": "Invalid format"}
                ]
            }
        }
        """.data(using: .utf8)!

        let decoder = JSONDecoder()
        let response = try decoder.decode(ServerErrorResponse.self, from: json)

        #expect(response.isValidationError == true)
        #expect(response.errorMessage.contains("phone"))
    }

    @Test func serverErrorResponseErrorCode() async throws {
        let json = """
        {"error": "RATE_LIMIT_EXCEEDED", "message": "Too many requests"}
        """.data(using: .utf8)!

        let decoder = JSONDecoder()
        let response = try decoder.decode(ServerErrorResponse.self, from: json)

        #expect(response.errorCode == "RATE_LIMIT_EXCEEDED")
        #expect(response.isRateLimitError == true)
    }

    @Test func serverErrorResponseAuthError() async throws {
        let json = """
        {"error": "AUTH_ERROR", "message": "Invalid token"}
        """.data(using: .utf8)!

        let decoder = JSONDecoder()
        let response = try decoder.decode(ServerErrorResponse.self, from: json)

        #expect(response.isAuthError == true)
    }

    @Test func serverErrorResponseDefaultErrorCode() async throws {
        let json = "{}".data(using: .utf8)!

        let decoder = JSONDecoder()
        let response = try decoder.decode(ServerErrorResponse.self, from: json)

        #expect(response.errorCode == "UNKNOWN_ERROR")
    }
}

// MARK: - APIError Extended Tests

struct APIErrorExtendedTests {

    @Test func httpErrorWithData() async throws {
        let errorData = """
        {"detail": "Not found"}
        """.data(using: .utf8)

        let error = APIError.httpError(statusCode: 404, data: errorData)

        #expect(error.errorDescription?.contains("404") == true)
    }

    @Test func is4xxError() async throws {
        for statusCode in 400..<500 {
            let error = APIError.httpError(statusCode: statusCode, data: nil)
            // 401 is auth error
            if statusCode == 401 {
                #expect(error.isAuthError == true)
            } else {
                #expect(error.isAuthError == false)
            }
        }
    }

    @Test func is5xxNotAuthError() async throws {
        for statusCode in 500..<600 {
            let error = APIError.httpError(statusCode: statusCode, data: nil)
            #expect(error.isAuthError == false)
        }
    }

    @Test func offlineErrorIsOffline() async throws {
        let queuedError = APIError.offline(queued: true)
        let notQueuedError = APIError.offline(queued: false)

        #expect(queuedError.isOfflineError == true)
        #expect(notQueuedError.isOfflineError == true)
    }

    @Test func offlineQueuedDescription() async throws {
        let queued = APIError.offline(queued: true)
        let notQueued = APIError.offline(queued: false)

        #expect(queued.errorDescription?.contains("will be sent") == true)
        #expect(notQueued.errorDescription?.contains("check your network") == true)
    }

    @Test func networkErrorWithNotConnected() async throws {
        let urlError = URLError(.notConnectedToInternet)
        let error = APIError.networkError(urlError)

        #expect(error.isOfflineError == true)
        #expect(error.isAuthError == false)
    }

    @Test func networkErrorWithConnectionLost() async throws {
        let urlError = URLError(.networkConnectionLost)
        let error = APIError.networkError(urlError)

        #expect(error.isOfflineError == true)
    }

    @Test func networkErrorOtherIsNotOffline() async throws {
        let urlError = URLError(.timedOut)
        let error = APIError.networkError(urlError)

        #expect(error.isOfflineError == false)
    }

    @Test func allAPIErrorsHaveDescriptions() async throws {
        let errors: [APIError] = [
            .invalidURL,
            .invalidResponse,
            .httpError(statusCode: 500, data: nil),
            .decodingError(NSError(domain: "test", code: 0)),
            .encodingError(NSError(domain: "test", code: 0)),
            .networkError(URLError(.timedOut)),
            .notAuthenticated,
            .tokenExpired,
            .sslPinningFailed,
            .serverError(message: "test"),
            .offline(queued: true),
            .offline(queued: false),
        ]

        for error in errors {
            #expect(error.errorDescription != nil)
            #expect(!error.errorDescription!.isEmpty)
        }
    }

    @Test func sslPinningFailedIsNotAuth() async throws {
        #expect(APIError.sslPinningFailed.isAuthError == false)
        #expect(APIError.sslPinningFailed.isOfflineError == false)
    }

    @Test func decodingErrorDescription() async throws {
        let underlyingError = NSError(domain: "decode", code: 1, userInfo: [NSLocalizedDescriptionKey: "bad json"])
        let error = APIError.decodingError(underlyingError)

        #expect(error.errorDescription?.contains("decode") == true || error.errorDescription?.contains("bad json") == true)
    }

    @Test func encodingErrorDescription() async throws {
        let underlyingError = NSError(domain: "encode", code: 1, userInfo: [NSLocalizedDescriptionKey: "encode fail"])
        let error = APIError.encodingError(underlyingError)

        #expect(error.errorDescription?.contains("encode") == true)
    }
}
