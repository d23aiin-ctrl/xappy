import Foundation
import Combine
import os.log

/// Implementation of AuthRepositoryProtocol for JanSeva
final class AuthRepository: AuthRepositoryProtocol, @unchecked Sendable {
    private let logger = Logger(subsystem: "com.xappy.ai", category: "AuthRepository")

    private let remoteDataSource: AuthRemoteDataSourceProtocol
    private let keychainManager: KeychainManager

    private let authStateSubject = CurrentValueSubject<AuthState, Never>(.unknown)
    private var currentUser: User?
    private var credentials: AuthCredentials?

    var authStatePublisher: AnyPublisher<AuthState, Never> {
        authStateSubject.eraseToAnyPublisher()
    }

    var currentAuthState: AuthState {
        authStateSubject.value
    }

    init(
        remoteDataSource: AuthRemoteDataSourceProtocol,
        keychainManager: KeychainManager
    ) {
        self.remoteDataSource = remoteDataSource
        self.keychainManager = keychainManager

        Task {
            await checkStoredCredentials()
        }
    }

    func signIn(phoneNumber: String, password: String) async throws -> User {
        let masked = redactedIdentifier(phoneNumber)
        logger.info("Auth sign-in start (badge: \(masked, privacy: .public))")

        do {
            let response = try await remoteDataSource.signIn(phoneNumber: phoneNumber, password: password)

            let credentials = AuthMapper.toCredentials(response)

            self.credentials = credentials

            // Store tokens in keychain
            try await keychainManager.saveTokens(
                access: credentials.accessToken,
                refresh: credentials.refreshToken ?? ""
            )

            // Store phone number for quick re-login
            try await keychainManager.savePhoneNumber(phoneNumber)

            let user = try await resolveUser(from: response)
            authStateSubject.send(.authenticated(user))
            logger.info("Auth sign-in success (userId: \(user.id, privacy: .public), role: \(user.role.rawValue, privacy: .public))")
            return user
        } catch {
            logger.error("Auth sign-in failed (badge: \(masked, privacy: .public)) error: \(error.localizedDescription, privacy: .public)")
            throw error
        }
    }

    func sendOTP(phoneNumber: String) async throws {
        let masked = redactedIdentifier(phoneNumber)
        logger.info("Auth OTP send start (phone: \(masked, privacy: .public))")

        do {
            try await remoteDataSource.sendOTP(phoneNumber: phoneNumber)
            logger.info("Auth OTP send success (phone: \(masked, privacy: .public))")
        } catch {
            logger.error("Auth OTP send failed (phone: \(masked, privacy: .public)) error: \(error.localizedDescription, privacy: .public)")
            throw error
        }
    }

    func verifyOTP(phoneNumber: String, otp: String) async throws -> User {
        let masked = redactedIdentifier(phoneNumber)
        logger.info("Auth OTP verify start (phone: \(masked, privacy: .public))")

        do {
            let response = try await remoteDataSource.verifyOTP(phoneNumber: phoneNumber, otp: otp)

            let credentials = AuthMapper.toCredentials(response)

            self.credentials = credentials

            // Store tokens in keychain
            try await keychainManager.saveTokens(
                access: credentials.accessToken,
                refresh: credentials.refreshToken ?? ""
            )

            let user = try await resolveUser(from: response)
            authStateSubject.send(.authenticated(user))
            logger.info("Auth OTP verify success (userId: \(user.id, privacy: .public), role: \(user.role.rawValue, privacy: .public))")
            return user
        } catch {
            logger.error("Auth OTP verify failed (phone: \(masked, privacy: .public)) error: \(error.localizedDescription, privacy: .public)")
            throw error
        }
    }

    func signOut() async throws {
        logger.info("Auth sign-out start")
        try await remoteDataSource.signOut()

        currentUser = nil
        credentials = nil

        // Clear keychain
        try await keychainManager.clearTokens()

        authStateSubject.send(.unauthenticated)
        logger.info("Auth sign-out success")
    }

    func setUnauthenticated() {
        currentUser = nil
        credentials = nil
        authStateSubject.send(.unauthenticated)
    }

    func refreshToken() async throws -> AuthCredentials {
        logger.info("Auth token refresh start")
        guard let refreshToken = try await keychainManager.getRefreshToken() else {
            throw DomainError.tokenExpired
        }

        let response = try await remoteDataSource.refreshToken(refreshToken: refreshToken)
        let newCredentials = AuthMapper.toCredentials(response)

        self.credentials = newCredentials

        // Update keychain
        try await keychainManager.saveTokens(
            access: newCredentials.accessToken,
            refresh: newCredentials.refreshToken ?? refreshToken
        )

        logger.info("Auth token refresh success")
        return newCredentials
    }

    func isAuthenticated() -> Bool {
        if case .authenticated = currentAuthState {
            return true
        }
        return false
    }

    func getCurrentUser() -> User? {
        currentUser
    }

    func fetchCurrentUser() async throws -> User {
        let userDTO = try await remoteDataSource.getCurrentUser()
        let user = AuthMapper.toDomain(userDTO)
        self.currentUser = user
        authStateSubject.send(.authenticated(user))
        return user
    }

    // MARK: - Private

    private func checkStoredCredentials() async {
        let hasTokens = await keychainManager.hasTokens()
        if hasTokens {
            // Try to fetch current user to validate tokens
            do {
                let userDTO = try await remoteDataSource.getCurrentUser()
                let user = AuthMapper.toDomain(userDTO)
                self.currentUser = user
                authStateSubject.send(.authenticated(user))
            } catch {
                // Tokens invalid, clear them
                try? await keychainManager.clearTokens()
                authStateSubject.send(.unauthenticated)
            }
        } else {
            authStateSubject.send(.unauthenticated)
        }
    }

    private func resolveUser(from response: XappyAuthResponseDTO) async throws -> User {
        if let dto = response.user {
            let user = AuthMapper.toDomain(dto)
            self.currentUser = user
            return user
        }

        let userDTO = try await remoteDataSource.getCurrentUser()
        let user = AuthMapper.toDomain(userDTO)
        self.currentUser = user
        return user
    }

    private func redactedIdentifier(_ value: String, visibleSuffix: Int = 4) -> String {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else {
            return "<empty>"
        }
        if trimmed.count <= visibleSuffix {
            return String(repeating: "*", count: trimmed.count)
        }
        let suffix = trimmed.suffix(visibleSuffix)
        return String(repeating: "*", count: trimmed.count - visibleSuffix) + suffix
    }
}
