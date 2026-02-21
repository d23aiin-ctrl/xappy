//
//  OhGrtTests.swift
//  OhGrtTests
//
//  Created by pawan singh on 12/12/25.
//

import Testing
import Foundation
@testable import OhGrt

// MARK: - Message Model Tests

struct MessageTests {

    @Test func messageInitialization() async throws {
        let conversationId = UUID()
        let message = Message(
            conversationId: conversationId,
            role: "user",
            content: "Hello, world!",
            category: "chat"
        )

        #expect(message.conversationId == conversationId)
        #expect(message.role == "user")
        #expect(message.content == "Hello, world!")
        #expect(message.category == "chat")
        #expect(message.isSynced == false)
    }

    @Test func messageIsUser() async throws {
        let userMessage = Message(
            conversationId: UUID(),
            role: "user",
            content: "Test"
        )

        let assistantMessage = Message(
            conversationId: UUID(),
            role: "assistant",
            content: "Test"
        )

        #expect(userMessage.isUser == true)
        #expect(userMessage.isAssistant == false)
        #expect(assistantMessage.isUser == false)
        #expect(assistantMessage.isAssistant == true)
    }

    @Test func messageFactoryUserMessage() async throws {
        let conversationId = UUID()
        let message = Message.userMessage(
            conversationId: conversationId,
            content: "User content"
        )

        #expect(message.role == "user")
        #expect(message.content == "User content")
        #expect(message.conversationId == conversationId)
    }

    @Test func messageFactoryAssistantMessage() async throws {
        let conversationId = UUID()
        let message = Message.assistantMessage(
            conversationId: conversationId,
            content: "Assistant response",
            category: "weather"
        )

        #expect(message.role == "assistant")
        #expect(message.content == "Assistant response")
        #expect(message.category == "weather")
    }
}

// MARK: - Conversation Model Tests

struct ConversationTests {

    @Test func conversationInitialization() async throws {
        let id = UUID()
        let conversation = Conversation(
            id: id,
            title: "Test Chat",
            tools: ["weather", "pdf"]
        )

        #expect(conversation.id == id)
        #expect(conversation.title == "Test Chat")
        #expect(conversation.tools == ["weather", "pdf"])
        #expect(conversation.messages.isEmpty)
    }

    @Test func conversationPreviewNoMessages() async throws {
        let conversation = Conversation()
        #expect(conversation.preview == "No messages")
    }

    @Test func conversationMessageCount() async throws {
        let conversation = Conversation()
        #expect(conversation.messageCount == 0)
    }
}

// MARK: - API Error Tests

struct APIErrorTests {

    @Test func errorDescriptions() async throws {
        #expect(APIError.invalidURL.errorDescription == "Invalid URL")
        #expect(APIError.invalidResponse.errorDescription == "Invalid server response")
        #expect(APIError.notAuthenticated.errorDescription == "Not authenticated")
        #expect(APIError.tokenExpired.errorDescription == "Session expired. Please sign in again.")
        #expect(APIError.sslPinningFailed.errorDescription == "SSL certificate verification failed")
    }

    @Test func httpErrorDescription() async throws {
        let error = APIError.httpError(statusCode: 404, data: nil)
        #expect(error.errorDescription == "HTTP error: 404")
    }

    @Test func serverErrorDescription() async throws {
        let error = APIError.serverError(message: "Something went wrong")
        #expect(error.errorDescription == "Something went wrong")
    }

    @Test func isAuthErrorForNotAuthenticated() async throws {
        #expect(APIError.notAuthenticated.isAuthError == true)
        #expect(APIError.tokenExpired.isAuthError == true)
    }

    @Test func isAuthErrorFor401() async throws {
        let error = APIError.httpError(statusCode: 401, data: nil)
        #expect(error.isAuthError == true)
    }

    @Test func isAuthErrorForNon401() async throws {
        let error = APIError.httpError(statusCode: 500, data: nil)
        #expect(error.isAuthError == false)
    }

    @Test func isAuthErrorForOtherErrors() async throws {
        #expect(APIError.invalidURL.isAuthError == false)
        #expect(APIError.invalidResponse.isAuthError == false)
        #expect(APIError.sslPinningFailed.isAuthError == false)
    }
}

// MARK: - API Endpoint Tests

struct APIEndpointTests {

    @Test func endpointPaths() async throws {
        #expect(APIEndpoint.badgeLogin.path.contains("badge-login"))
        #expect(APIEndpoint.refreshToken.path.contains("refresh"))
        #expect(APIEndpoint.logout.path.contains("logout"))
        #expect(APIEndpoint.me.path.contains("me"))
        #expect(APIEndpoint.chatSend.path.contains("chat"))
        #expect(APIEndpoint.conversations.path.contains("conversations"))
        #expect(APIEndpoint.tools.path.contains("tools"))
        #expect(APIEndpoint.providers.path.contains("providers"))
        #expect(APIEndpoint.health.path.contains("health"))
    }

    @Test func endpointMethods() async throws {
        #expect(APIEndpoint.badgeLogin.method == .post)
        #expect(APIEndpoint.refreshToken.method == .post)
        #expect(APIEndpoint.chatSend.method == .post)
        #expect(APIEndpoint.me.method == .get)
        #expect(APIEndpoint.chatHistory(conversationId: "test").method == .get)
        #expect(APIEndpoint.tools.method == .get)
        #expect(APIEndpoint.providers.method == .get)
    }

    @Test func endpointRequiresAuth() async throws {
        #expect(APIEndpoint.badgeLogin.requiresAuth == false)
        #expect(APIEndpoint.otpSend.requiresAuth == false)
        #expect(APIEndpoint.health.requiresAuth == false)
        #expect(APIEndpoint.me.requiresAuth == true)
        #expect(APIEndpoint.chatSend.requiresAuth == true)
        #expect(APIEndpoint.tools.requiresAuth == true)
        #expect(APIEndpoint.providers.requiresAuth == true)
    }

    @Test func dynamicEndpointPaths() async throws {
        #expect(APIEndpoint.disconnectProvider(provider: "slack").path.contains("slack"))
        #expect(APIEndpoint.providerOAuthStart(provider: "github").path.contains("github"))
        #expect(APIEndpoint.providerOAuthExchange(provider: "github").path.contains("github"))
    }
}

// MARK: - API Models Tests

struct APIModelsTests {

    @Test func chatSendRequestEncoding() async throws {
        let request = ChatSendRequest(
            message: "Hello",
            conversationId: UUID(),
            tools: ["weather", "pdf"]
        )

        #expect(request.message == "Hello")
        #expect(request.tools?.count == 2)
    }

    @Test func providerConnectRequestEncoding() async throws {
        let request = ProviderConnectRequest(
            provider: "jira",
            secret: "api-token",
            displayName: "Work Jira",
            config: ["base_url": "https://example.atlassian.net"]
        )

        #expect(request.provider == "jira")
        #expect(request.secret == "api-token")
        #expect(request.displayName == "Work Jira")
        #expect(request.config?["base_url"] == "https://example.atlassian.net")
    }

    @Test func toolInfoIdentifiable() async throws {
        let tool = ToolInfo(name: "weather", description: "Get weather info")
        #expect(tool.id == "weather")
        #expect(tool.name == "weather")
    }

    @Test func providerInfoIdentifiable() async throws {
        let provider = ProviderInfo(
            name: "github",
            displayName: "GitHub",
            authType: "oauth",
            connected: true
        )
        #expect(provider.id == "github")
        #expect(provider.connected == true)
    }
}

// MARK: - Keychain Error Tests

struct KeychainErrorTests {

    @Test func keychainErrorDescriptions() async throws {
        #expect(KeychainError.encodingFailed.errorDescription == "Failed to encode data for keychain")
        #expect(KeychainError.decodingFailed.errorDescription == "Failed to decode data from keychain")
    }

    @Test func keychainSaveFailedDescription() async throws {
        let error = KeychainError.saveFailed(status: -25300)
        #expect(error.errorDescription?.contains("-25300") == true)
    }

    @Test func keychainRetrieveFailedDescription() async throws {
        let error = KeychainError.retrieveFailed(status: -25291)
        #expect(error.errorDescription?.contains("-25291") == true)
    }
}

// MARK: - Token Refresh Error Tests

struct TokenRefreshErrorTests {

    @Test func noRefreshTokenError() async throws {
        let error = TokenRefreshError.noRefreshToken
        #expect(error.errorDescription?.contains("No refresh token") == true)
    }

    @Test func refreshFailedError() async throws {
        let underlyingError = APIError.networkError(URLError(.notConnectedToInternet))
        let error = TokenRefreshError.refreshFailed(underlyingError)
        #expect(error.errorDescription?.contains("Failed to refresh") == true)
    }
}

// MARK: - Auth Error Tests

struct AuthErrorTests {

    @Test func authErrorDescriptions() async throws {
        #expect(AuthError.invalidBadgeNumber.errorDescription?.contains("badge") == true)
        #expect(AuthError.invalidPin.errorDescription?.contains("PIN") == true)
        #expect(AuthError.invalidOTP.errorDescription?.contains("OTP") == true)
        #expect(AuthError.accountLocked.errorDescription?.contains("locked") == true)
        #expect(AuthError.networkError.errorDescription?.contains("Network") == true)
    }
}

// MARK: - Server Error Response Tests

struct ServerErrorResponseTests {

    @Test func serverErrorResponseDecoding() async throws {
        let json = """
        {"detail": "User not found", "message": "Error occurred"}
        """.data(using: .utf8)!

        let decoder = JSONDecoder()
        let response = try decoder.decode(ServerErrorResponse.self, from: json)

        #expect(response.detail == "User not found")
        #expect(response.message == "Error occurred")
        #expect(response.errorMessage == "User not found") // detail takes precedence
    }

    @Test func serverErrorResponseFallbackToMessage() async throws {
        let json = """
        {"message": "Something went wrong"}
        """.data(using: .utf8)!

        let decoder = JSONDecoder()
        let response = try decoder.decode(ServerErrorResponse.self, from: json)

        #expect(response.detail == nil)
        #expect(response.errorMessage == "Something went wrong")
    }

    @Test func serverErrorResponseUnknownError() async throws {
        let json = """
        {}
        """.data(using: .utf8)!

        let decoder = JSONDecoder()
        let response = try decoder.decode(ServerErrorResponse.self, from: json)

        #expect(response.errorMessage == "Unknown error")
    }
}

// MARK: - User Tests

struct UserTests {

    @Test func userInitialization() async throws {
        let user = User(
            id: "user-123",
            badgeNumber: "EMP001",
            fullName: "Test User",
            role: .worker,
            phoneNumber: nil,
            siteName: nil,
            siteId: nil,
            department: nil,
            jobTitle: nil,
            createdAt: Date()
        )

        #expect(user.id == "user-123")
        #expect(user.badgeNumber == "EMP001")
        #expect(user.fullName == "Test User")
        #expect(user.role == .worker)
    }
}

// MARK: - HTTP Method Tests

struct HTTPMethodTests {

    @Test func httpMethodRawValues() async throws {
        #expect(HTTPMethod.get.rawValue == "GET")
        #expect(HTTPMethod.post.rawValue == "POST")
        #expect(HTTPMethod.put.rawValue == "PUT")
        #expect(HTTPMethod.delete.rawValue == "DELETE")
    }
}

// MARK: - Date Decoding Tests

struct DateDecodingTests {

    @Test func dateDecodingWithFractionalSeconds() async throws {
        let json = """
        {"createdAt": "2025-01-15T10:30:45.123Z"}
        """.data(using: .utf8)!

        struct TestModel: Decodable {
            let createdAt: Date
        }

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .custom { decoder in
            let container = try decoder.singleValueContainer()
            let dateString = try container.decode(String.self)

            let formatter = ISO8601DateFormatter()
            formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let date = formatter.date(from: dateString) {
                return date
            }

            formatter.formatOptions = [.withInternetDateTime]
            if let date = formatter.date(from: dateString) {
                return date
            }

            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Cannot decode date"
            )
        }

        let model = try decoder.decode(TestModel.self, from: json)
        #expect(model.createdAt != nil)
    }

    @Test func dateDecodingWithoutFractionalSeconds() async throws {
        let json = """
        {"createdAt": "2025-01-15T10:30:45Z"}
        """.data(using: .utf8)!

        struct TestModel: Decodable {
            let createdAt: Date
        }

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .custom { decoder in
            let container = try decoder.singleValueContainer()
            let dateString = try container.decode(String.self)

            let formatter = ISO8601DateFormatter()
            formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let date = formatter.date(from: dateString) {
                return date
            }

            formatter.formatOptions = [.withInternetDateTime]
            if let date = formatter.date(from: dateString) {
                return date
            }

            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Cannot decode date"
            )
        }

        let model = try decoder.decode(TestModel.self, from: json)
        #expect(model.createdAt != nil)
    }
}

// MARK: - Request Interceptor Tests

struct RequestInterceptorTests {

    @Test func generateNonceLength() async throws {
        let interceptor = RequestInterceptor()
        let nonce = await interceptor.generateNonce()

        // Base64 encoded 32 bytes should be 44 characters
        #expect(nonce.count == 44)
    }

    @Test func generateNonceUniqueness() async throws {
        let interceptor = RequestInterceptor()
        let nonce1 = await interceptor.generateNonce()
        let nonce2 = await interceptor.generateNonce()

        #expect(nonce1 != nonce2)
    }

    @Test func generateRequestIdFormat() async throws {
        let interceptor = RequestInterceptor()
        let requestId = await interceptor.generateRequestId()

        // Should be a valid UUID string
        #expect(UUID(uuidString: requestId) != nil)
    }

    @Test func currentTimestampFormat() async throws {
        let interceptor = RequestInterceptor()
        let timestamp = await interceptor.currentTimestamp()

        // Should be convertible to Double
        #expect(Double(timestamp) != nil)

        // Should be a recent timestamp
        let timestampValue = Double(timestamp)!
        let now = Date().timeIntervalSince1970
        #expect(abs(timestampValue - now) < 5) // Within 5 seconds
    }
}

// MARK: - SSL Pinning Tests

struct SSLPinningTests {

    @Test func pinnedSessionCreation() async throws {
        let session = URLSession.pinnedSession()
        #expect(session.configuration.timeoutIntervalForRequest == 30)
        #expect(session.configuration.timeoutIntervalForResource == 60)
    }

    @Test func pinnedSessionCustomTimeout() async throws {
        let session = URLSession.pinnedSession(timeoutInterval: 15)
        #expect(session.configuration.timeoutIntervalForRequest == 15)
    }
}
