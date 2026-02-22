//
//  MockAuthRepository.swift
//  OhGrtTests
//
//  Mock implementations for testing
//

import Foundation
import Combine
@testable import OhGrt

// MARK: - MockAuthRepository

final class MockAuthRepository: AuthRepositoryProtocol, @unchecked Sendable {
    // Call tracking
    var signInCallCount = 0
    var signInPhoneNumber: String?
    var signInPassword: String?
    var sendOTPCallCount = 0
    var sendOTPPhoneNumber: String?
    var verifyOTPCallCount = 0
    var verifyOTPPhoneNumber: String?
    var verifyOTPCode: String?
    var signOutCallCount = 0
    var refreshTokenCallCount = 0
    var fetchCurrentUserCallCount = 0
    var setUnauthenticatedCallCount = 0

    // Configurable return values
    var signInResult: Result<User, Error> = .success(
        User(id: "test-user", fullName: "Test User", role: .citizen)
    )
    var sendOTPResult: Result<Void, Error> = .success(())
    var verifyOTPResult: Result<User, Error> = .success(
        User(id: "test-user", fullName: "Test User", role: .citizen)
    )
    var signOutResult: Result<Void, Error> = .success(())
    var refreshTokenResult: Result<AuthCredentials, Error> = .success(
        AuthCredentials(accessToken: "new-token", refreshToken: "new-refresh", expiresAt: nil)
    )
    var fetchCurrentUserResult: Result<User, Error> = .success(
        User(id: "test-user", fullName: "Test User", role: .citizen)
    )
    var isAuthenticatedValue = false
    var currentUserValue: User? = nil

    // Publisher
    private let authStateSubject = CurrentValueSubject<AuthState, Never>(.unknown)

    var authStatePublisher: AnyPublisher<AuthState, Never> {
        authStateSubject.eraseToAnyPublisher()
    }

    var currentAuthState: AuthState {
        authStateSubject.value
    }

    func setAuthState(_ state: AuthState) {
        authStateSubject.send(state)
    }

    func signIn(phoneNumber: String, password: String) async throws -> User {
        signInCallCount += 1
        signInPhoneNumber = phoneNumber
        signInPassword = password
        return try signInResult.get()
    }

    func sendOTP(phoneNumber: String) async throws {
        sendOTPCallCount += 1
        sendOTPPhoneNumber = phoneNumber
        try sendOTPResult.get()
    }

    func verifyOTP(phoneNumber: String, otp: String) async throws -> User {
        verifyOTPCallCount += 1
        verifyOTPPhoneNumber = phoneNumber
        verifyOTPCode = otp
        return try verifyOTPResult.get()
    }

    func signOut() async throws {
        signOutCallCount += 1
        try signOutResult.get()
    }

    func setUnauthenticated() {
        setUnauthenticatedCallCount += 1
        authStateSubject.send(.unauthenticated)
    }

    func refreshToken() async throws -> AuthCredentials {
        refreshTokenCallCount += 1
        return try refreshTokenResult.get()
    }

    func isAuthenticated() -> Bool {
        isAuthenticatedValue
    }

    func getCurrentUser() -> User? {
        currentUserValue
    }

    func fetchCurrentUser() async throws -> User {
        fetchCurrentUserCallCount += 1
        return try fetchCurrentUserResult.get()
    }
}

// MARK: - MockChatRepository

final class MockChatRepository: ChatRepositoryProtocol, @unchecked Sendable {
    var sendMessageCallCount = 0
    var lastMessage: String?
    var lastConversationId: UUID?
    var lastTools: [String]?
    var lastLocation: LocationDTO?
    var lastFieldUpdates: [FieldUpdateDTO]?

    var sendMessageResult: Result<ChatMessage, Error> = .success(
        ChatMessage(conversationId: UUID(), content: "AI response", role: .assistant)
    )

    func sendMessage(
        _ message: String,
        conversationId: UUID,
        tools: [String],
        location: LocationDTO?,
        fieldUpdates: [FieldUpdateDTO]?
    ) async throws -> ChatMessage {
        sendMessageCallCount += 1
        lastMessage = message
        lastConversationId = conversationId
        lastTools = tools
        lastLocation = location
        lastFieldUpdates = fieldUpdates
        return try sendMessageResult.get()
    }

    func streamMessage(
        _ message: String,
        conversationId: UUID,
        tools: [String]
    ) -> AsyncThrowingStream<String, Error> {
        AsyncThrowingStream { continuation in
            continuation.finish()
        }
    }
}

// MARK: - MockConversationRepository

final class MockConversationRepository: ConversationRepositoryProtocol, @unchecked Sendable {
    var getAllConversationsCallCount = 0
    var getConversationCallCount = 0
    var createConversationCallCount = 0
    var updateConversationCallCount = 0
    var deleteConversationCallCount = 0
    var getMessagesCallCount = 0
    var saveMessageCallCount = 0
    var deleteMessagesCallCount = 0

    var lastSavedMessage: ChatMessage?
    var lastUpdatedConversation: ChatConversation?
    var lastGetConversationId: UUID?

    var allConversationsResult: Result<[ChatConversation], Error> = .success([])
    var getConversationResult: Result<ChatConversation, Error> = .success(
        ChatConversation(title: "Test")
    )
    var createConversationResult: Result<ChatConversation, Error> = .success(
        ChatConversation(title: "New")
    )
    var getMessagesResult: Result<[ChatMessage], Error> = .success([])
    var saveMessageResult: Result<Void, Error> = .success(())
    var updateConversationResult: Result<Void, Error> = .success(())
    var deleteConversationResult: Result<Void, Error> = .success(())
    var deleteMessagesResult: Result<Void, Error> = .success(())

    private let conversationsSubject = CurrentValueSubject<[ChatConversation], Never>([])

    var conversationsPublisher: AnyPublisher<[ChatConversation], Never> {
        conversationsSubject.eraseToAnyPublisher()
    }

    func getAllConversations() async throws -> [ChatConversation] {
        getAllConversationsCallCount += 1
        return try allConversationsResult.get()
    }

    func getConversation(id: UUID) async throws -> ChatConversation {
        getConversationCallCount += 1
        lastGetConversationId = id
        return try getConversationResult.get()
    }

    func createConversation(title: String, tools: [String]) async throws -> ChatConversation {
        createConversationCallCount += 1
        return try createConversationResult.get()
    }

    func updateConversation(_ conversation: ChatConversation) async throws {
        updateConversationCallCount += 1
        lastUpdatedConversation = conversation
        try updateConversationResult.get()
    }

    func deleteConversation(id: UUID) async throws {
        deleteConversationCallCount += 1
        try deleteConversationResult.get()
    }

    func getMessages(conversationId: UUID) async throws -> [ChatMessage] {
        getMessagesCallCount += 1
        return try getMessagesResult.get()
    }

    func saveMessage(_ message: ChatMessage) async throws {
        saveMessageCallCount += 1
        lastSavedMessage = message
        try saveMessageResult.get()
    }

    func deleteMessages(conversationId: UUID) async throws {
        deleteMessagesCallCount += 1
        try deleteMessagesResult.get()
    }
}

// MARK: - MockObserveAuthStateUseCase

final class MockObserveAuthStateUseCase: ObserveAuthStateUseCaseProtocol, @unchecked Sendable {
    private let subject: CurrentValueSubject<AuthState, Never>

    init(initialState: AuthState = .unknown) {
        self.subject = CurrentValueSubject(initialState)
    }

    func execute() -> AnyPublisher<AuthState, Never> {
        subject.eraseToAnyPublisher()
    }

    func send(_ state: AuthState) {
        subject.send(state)
    }
}
