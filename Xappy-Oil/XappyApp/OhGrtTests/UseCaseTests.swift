//
//  UseCaseTests.swift
//  OhGrtTests
//
//  Tests for domain use cases
//

import Testing
import Foundation
import Combine
@testable import OhGrt

// MARK: - SignInUseCase Tests

struct SignInUseCaseTests {

    @Test func signInCallsRepositoryWithCorrectArgs() async throws {
        let mockRepo = MockAuthRepository()
        let useCase = SignInUseCase(authRepository: mockRepo)

        _ = try await useCase.execute(phoneNumber: "+1234567890", password: "pass123")

        #expect(mockRepo.signInCallCount == 1)
        #expect(mockRepo.signInPhoneNumber == "+1234567890")
        #expect(mockRepo.signInPassword == "pass123")
    }

    @Test func signInReturnsUser() async throws {
        let mockRepo = MockAuthRepository()
        let expectedUser = User(id: "u1", fullName: "Test", role: .supervisor)
        mockRepo.signInResult = .success(expectedUser)

        let useCase = SignInUseCase(authRepository: mockRepo)
        let user = try await useCase.execute(phoneNumber: "phone", password: "pass")

        #expect(user.id == "u1")
        #expect(user.fullName == "Test")
    }

    @Test func signInPropagatesError() async throws {
        let mockRepo = MockAuthRepository()
        mockRepo.signInResult = .failure(DomainError.invalidCredentials)

        let useCase = SignInUseCase(authRepository: mockRepo)

        await #expect(throws: DomainError.self) {
            _ = try await useCase.execute(phoneNumber: "phone", password: "pass")
        }
    }
}

// MARK: - SendOTPUseCase Tests

struct SendOTPUseCaseTests {

    @Test func sendOTPCallsRepository() async throws {
        let mockRepo = MockAuthRepository()
        let useCase = SendOTPUseCase(authRepository: mockRepo)

        try await useCase.execute(phoneNumber: "+919876543210")

        #expect(mockRepo.sendOTPCallCount == 1)
        #expect(mockRepo.sendOTPPhoneNumber == "+919876543210")
    }

    @Test func sendOTPPropagatesError() async throws {
        let mockRepo = MockAuthRepository()
        mockRepo.sendOTPResult = .failure(DomainError.networkUnavailable)

        let useCase = SendOTPUseCase(authRepository: mockRepo)

        await #expect(throws: DomainError.self) {
            try await useCase.execute(phoneNumber: "+1234567890")
        }
    }
}

// MARK: - VerifyOTPUseCase Tests

struct VerifyOTPUseCaseTests {

    @Test func verifyOTPCallsRepository() async throws {
        let mockRepo = MockAuthRepository()
        let useCase = VerifyOTPUseCase(authRepository: mockRepo)

        _ = try await useCase.execute(phoneNumber: "+1234567890", otp: "123456")

        #expect(mockRepo.verifyOTPCallCount == 1)
        #expect(mockRepo.verifyOTPPhoneNumber == "+1234567890")
        #expect(mockRepo.verifyOTPCode == "123456")
    }

    @Test func verifyOTPReturnsUser() async throws {
        let mockRepo = MockAuthRepository()
        let expectedUser = User(id: "u2", fullName: "OTP User", role: .citizen)
        mockRepo.verifyOTPResult = .success(expectedUser)

        let useCase = VerifyOTPUseCase(authRepository: mockRepo)
        let user = try await useCase.execute(phoneNumber: "phone", otp: "1234")

        #expect(user.id == "u2")
    }

    @Test func verifyOTPPropagatesError() async throws {
        let mockRepo = MockAuthRepository()
        mockRepo.verifyOTPResult = .failure(DomainError.authenticationFailed("Invalid OTP"))

        let useCase = VerifyOTPUseCase(authRepository: mockRepo)

        await #expect(throws: DomainError.self) {
            _ = try await useCase.execute(phoneNumber: "phone", otp: "wrong")
        }
    }
}

// MARK: - SignOutUseCase Tests

struct SignOutUseCaseTests {

    @Test func signOutCallsRepository() async throws {
        let mockRepo = MockAuthRepository()
        let useCase = SignOutUseCase(authRepository: mockRepo)

        try await useCase.execute()

        #expect(mockRepo.signOutCallCount == 1)
    }

    @Test func signOutPropagatesError() async throws {
        let mockRepo = MockAuthRepository()
        mockRepo.signOutResult = .failure(DomainError.networkUnavailable)

        let useCase = SignOutUseCase(authRepository: mockRepo)

        await #expect(throws: DomainError.self) {
            try await useCase.execute()
        }
    }
}

// MARK: - ObserveAuthStateUseCase Tests

struct ObserveAuthStateUseCaseTests {

    @Test func observeReturnsPublisher() async throws {
        let mockRepo = MockAuthRepository()
        let useCase = ObserveAuthStateUseCase(authRepository: mockRepo)

        var receivedStates: [AuthState] = []
        let cancellable = useCase.execute()
            .sink { state in
                receivedStates.append(state)
            }

        // Initial state is .unknown
        #expect(receivedStates.count >= 1)

        let user = User(id: "u1", fullName: "Test")
        mockRepo.setAuthState(.authenticated(user))

        // Give time for publisher to emit
        try await Task.sleep(nanoseconds: 50_000_000)

        #expect(receivedStates.contains(.authenticated(user)))

        cancellable.cancel()
    }
}

// MARK: - SendMessageUseCase Tests

struct SendMessageUseCaseTests {

    @Test func sendMessageCallsChatRepository() async throws {
        let mockChat = MockChatRepository()
        let mockConv = MockConversationRepository()
        let convId = UUID()

        let expectedResponse = ChatMessage(conversationId: convId, content: "Response", role: .assistant)
        mockChat.sendMessageResult = .success(expectedResponse)

        let conversation = ChatConversation(id: convId, title: "Test")
        mockConv.getConversationResult = .success(conversation)

        let useCase = SendMessageUseCase(chatRepository: mockChat, conversationRepository: mockConv)
        let result = try await useCase.execute(
            message: "Hello",
            conversationId: convId,
            tools: ["safety"],
            location: nil,
            fieldUpdates: nil
        )

        #expect(mockChat.sendMessageCallCount == 1)
        #expect(mockChat.lastMessage == "Hello")
        #expect(mockChat.lastConversationId == convId)
        #expect(mockChat.lastTools == ["safety"])
        #expect(result.content == "Response")
    }

    @Test func sendMessageSavesUserAndAIMessages() async throws {
        let mockChat = MockChatRepository()
        let mockConv = MockConversationRepository()
        let convId = UUID()

        let conversation = ChatConversation(id: convId, title: "Test")
        mockConv.getConversationResult = .success(conversation)
        mockChat.sendMessageResult = .success(
            ChatMessage(conversationId: convId, content: "AI reply", role: .assistant)
        )

        let useCase = SendMessageUseCase(chatRepository: mockChat, conversationRepository: mockConv)
        _ = try await useCase.execute(message: "Test msg", conversationId: convId, tools: [], location: nil, fieldUpdates: nil)

        // Should save user message + AI message
        #expect(mockConv.saveMessageCallCount == 2)
        // Should update conversation
        #expect(mockConv.updateConversationCallCount == 1)
    }

    @Test func sendMessageThrowsOnEmptyMessage() async throws {
        let mockChat = MockChatRepository()
        let mockConv = MockConversationRepository()

        let useCase = SendMessageUseCase(chatRepository: mockChat, conversationRepository: mockConv)

        await #expect(throws: DomainError.self) {
            _ = try await useCase.execute(message: "   ", conversationId: UUID(), tools: [], location: nil, fieldUpdates: nil)
        }
    }

    @Test func sendMessageAllowsEmptyMessageWithFieldUpdates() async throws {
        let mockChat = MockChatRepository()
        let mockConv = MockConversationRepository()
        let convId = UUID()

        let conversation = ChatConversation(id: convId, title: "Test")
        mockConv.getConversationResult = .success(conversation)
        mockChat.sendMessageResult = .success(
            ChatMessage(conversationId: convId, content: "Updated", role: .assistant)
        )

        let useCase = SendMessageUseCase(chatRepository: mockChat, conversationRepository: mockConv)
        let result = try await useCase.execute(
            message: "",
            conversationId: convId,
            tools: [],
            location: nil,
            fieldUpdates: [FieldUpdateDTO(fieldName: "title", value: "Fire")]
        )

        #expect(result.content == "Updated")
        // Should only save AI message (no user message when empty)
        #expect(mockConv.saveMessageCallCount == 1)
    }
}

// MARK: - GetToolsUseCase Tests

struct GetToolsUseCaseTests {

    @Test func getToolsReturnsDefaultTools() async throws {
        let mockChat = MockChatRepository()
        let useCase = GetToolsUseCase(chatRepository: mockChat)

        let tools = try await useCase.execute()

        #expect(!tools.isEmpty)
    }
}

// MARK: - GetProvidersUseCase Tests

struct GetProvidersUseCaseTests {

    @Test func getProvidersReturnsEmpty() async throws {
        let mockChat = MockChatRepository()
        let useCase = GetProvidersUseCase(chatRepository: mockChat)

        let providers = try await useCase.execute()

        #expect(providers.isEmpty)
    }
}

// MARK: - GetConversationsUseCase Tests

struct GetConversationsUseCaseTests {

    @Test func getConversationsCallsRepository() async throws {
        let mockConv = MockConversationRepository()
        let conversations = [
            ChatConversation(title: "Conv 1"),
            ChatConversation(title: "Conv 2"),
        ]
        mockConv.allConversationsResult = .success(conversations)

        let useCase = GetConversationsUseCase(conversationRepository: mockConv)
        let result = try await useCase.execute()

        #expect(result.count == 2)
        #expect(mockConv.getAllConversationsCallCount == 1)
    }
}

// MARK: - CreateConversationUseCase Tests

struct CreateConversationUseCaseTests {

    @Test func createConversationCallsRepository() async throws {
        let mockConv = MockConversationRepository()
        let useCase = CreateConversationUseCase(conversationRepository: mockConv)

        _ = try await useCase.execute(title: "New Chat", tools: ["safety"])

        #expect(mockConv.createConversationCallCount == 1)
    }

    @Test func createConversationUsesDefaultTitleWhenEmpty() async throws {
        let mockConv = MockConversationRepository()
        let useCase = CreateConversationUseCase(conversationRepository: mockConv)

        _ = try await useCase.execute(title: "", tools: [])

        #expect(mockConv.createConversationCallCount == 1)
    }
}

// MARK: - DeleteConversationUseCase Tests

struct DeleteConversationUseCaseTests {

    @Test func deleteConversationDeletesMessagesFirst() async throws {
        let mockConv = MockConversationRepository()
        let useCase = DeleteConversationUseCase(conversationRepository: mockConv)
        let convId = UUID()

        try await useCase.execute(conversationId: convId)

        #expect(mockConv.deleteMessagesCallCount == 1)
        #expect(mockConv.deleteConversationCallCount == 1)
    }
}

// MARK: - GetMessagesUseCase Tests

struct GetMessagesUseCaseTests {

    @Test func getMessagesCallsRepository() async throws {
        let mockConv = MockConversationRepository()
        let messages = [
            ChatMessage(conversationId: UUID(), content: "Hello", role: .user),
            ChatMessage(conversationId: UUID(), content: "Hi!", role: .assistant),
        ]
        mockConv.getMessagesResult = .success(messages)

        let useCase = GetMessagesUseCase(conversationRepository: mockConv)
        let result = try await useCase.execute(conversationId: UUID())

        #expect(result.count == 2)
    }
}
