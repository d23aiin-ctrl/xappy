import Foundation

/// Use case for signing in with phone number and password
protocol SignInUseCaseProtocol: Sendable {
    func execute(phoneNumber: String, password: String) async throws -> User
}

final class SignInUseCase: SignInUseCaseProtocol, @unchecked Sendable {
    private let authRepository: AuthRepositoryProtocol

    init(authRepository: AuthRepositoryProtocol) {
        self.authRepository = authRepository
    }

    func execute(phoneNumber: String, password: String) async throws -> User {
        try await authRepository.signIn(phoneNumber: phoneNumber, password: password)
    }
}

/// Use case for sending OTP
protocol SendOTPUseCaseProtocol: Sendable {
    func execute(phoneNumber: String) async throws
}

final class SendOTPUseCase: SendOTPUseCaseProtocol, @unchecked Sendable {
    private let authRepository: AuthRepositoryProtocol

    init(authRepository: AuthRepositoryProtocol) {
        self.authRepository = authRepository
    }

    func execute(phoneNumber: String) async throws {
        try await authRepository.sendOTP(phoneNumber: phoneNumber)
    }
}

/// Use case for verifying OTP
protocol VerifyOTPUseCaseProtocol: Sendable {
    func execute(phoneNumber: String, otp: String) async throws -> User
}

final class VerifyOTPUseCase: VerifyOTPUseCaseProtocol, @unchecked Sendable {
    private let authRepository: AuthRepositoryProtocol

    init(authRepository: AuthRepositoryProtocol) {
        self.authRepository = authRepository
    }

    func execute(phoneNumber: String, otp: String) async throws -> User {
        try await authRepository.verifyOTP(phoneNumber: phoneNumber, otp: otp)
    }
}

// MARK: - Legacy aliases for compatibility
typealias SignInWithBadgeUseCaseProtocol = SignInUseCaseProtocol
typealias SignInWithBadgeUseCase = SignInUseCase
typealias SignInWithGoogleUseCaseProtocol = SignInUseCaseProtocol
typealias SignInWithGoogleUseCase = SignInUseCase
