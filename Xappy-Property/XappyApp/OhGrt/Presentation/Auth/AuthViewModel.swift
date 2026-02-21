import Foundation
import Combine
import SwiftUI

/// Login mode for JanSeva authentication
enum LoginMode {
    case password   // Phone + Password login
    case otp        // Phone OTP login
}

/// ViewModel for JanSeva authentication screens
@MainActor
final class AuthViewModel: ObservableObject {
    // MARK: - Published Properties

    @Published private(set) var authState: AuthState = .unknown
    @Published private(set) var isLoading = false
    @Published private(set) var error: String?
    @Published var showError = false

    // Login form state
    @Published var loginMode: LoginMode = .password
    @Published var phoneNumber = ""
    @Published var password = ""
    @Published var otpCode = ""
    @Published var showOTPInput = false

    // Stored phone number for quick re-login
    @Published var storedPhoneNumber: String?

    // MARK: - Use Cases

    private let authRepository: AuthRepositoryProtocol
    private let observeAuthStateUseCase: ObserveAuthStateUseCaseProtocol

    // MARK: - Private Properties

    private var cancellables = Set<AnyCancellable>()

    // MARK: - Computed Properties

    var isAuthenticated: Bool {
        if case .authenticated = authState {
            return true
        }
        return false
    }

    var currentUser: User? {
        if case .authenticated(let user) = authState {
            return user
        }
        return nil
    }

    var canSubmitPassword: Bool {
        phoneNumber.count >= 1 && password.count >= 4
    }

    var canSubmitOTP: Bool {
        phoneNumber.count >= 10 && otpCode.count >= 4
    }

    var canSendOTP: Bool {
        phoneNumber.count >= 10
    }

    // MARK: - Initialization

    init(
        authRepository: AuthRepositoryProtocol,
        observeAuthStateUseCase: ObserveAuthStateUseCaseProtocol
    ) {
        self.authRepository = authRepository
        self.observeAuthStateUseCase = observeAuthStateUseCase

        setupObservers()
        loadStoredPhoneNumber()
    }

    // MARK: - Public Methods

    /// Sign in with phone number and password
    func signIn() {
        Task {
            phoneNumber = phoneNumber.trimmingCharacters(in: .whitespacesAndNewlines)
            password = password.trimmingCharacters(in: .whitespacesAndNewlines)
            await performSignIn()
        }
    }

    /// Send OTP to phone number
    func sendOTP() {
        Task {
            phoneNumber = phoneNumber.trimmingCharacters(in: .whitespacesAndNewlines)
            await performSendOTP()
        }
    }

    /// Verify OTP and sign in
    func verifyOTP() {
        Task {
            phoneNumber = phoneNumber.trimmingCharacters(in: .whitespacesAndNewlines)
            otpCode = otpCode.trimmingCharacters(in: .whitespacesAndNewlines)
            await performVerifyOTP()
        }
    }

    /// Sign out
    func signOut() {
        Task {
            await performSignOut()
        }
    }

    /// Clear error state
    func clearError() {
        error = nil
        showError = false
    }

    /// Switch login mode
    func switchLoginMode(to mode: LoginMode) {
        loginMode = mode
        clearFormFields()
        clearError()
    }

    /// Use stored phone number for quick re-login
    func useStoredPhoneNumber() {
        if let phone = storedPhoneNumber {
            phoneNumber = phone
        }
    }

    /// Development mode login - bypasses authentication
    /// Only available in DEBUG builds
    func devModeLogin() {
        #if DEBUG
        // Create a mock user for development testing
        let mockUser = User(
            id: UUID().uuidString,
            fullName: "Dev User",
            role: .supervisor,
            phoneNumber: "DEV-001",
            siteName: "Development Site",
            siteId: "dev-site"
        )
        authState = .authenticated(mockUser)
        AuthManager.shared.devModeLogin()
        #endif
    }

    // MARK: - Private Methods

    private func setupObservers() {
        observeAuthStateUseCase.execute()
            .receive(on: DispatchQueue.main)
            .sink { [weak self] state in
                DispatchQueue.main.async {
                    self?.authState = state
                }
            }
            .store(in: &cancellables)
    }

    private func loadStoredPhoneNumber() {
        Task {
            if let phone = try? await KeychainManager.shared.getPhoneNumber(), !phone.isEmpty {
                await MainActor.run {
                    self.storedPhoneNumber = phone
                    self.phoneNumber = phone
                }
            }
        }
    }

    private func performSignIn() async {
        guard canSubmitPassword else {
            error = "Please enter your badge number and PIN"
            showError = true
            return
        }

        isLoading = true
        error = nil

        do {
            let user = try await authRepository.signIn(phoneNumber: phoneNumber, password: password)
            authState = .authenticated(user)
            clearFormFields()
        } catch let domainError as DomainError {
            error = domainError.localizedDescription
            showError = true
        } catch {
            self.error = error.localizedDescription
            showError = true
        }

        isLoading = false
    }

    private func performSendOTP() async {
        guard canSendOTP else {
            error = "Please enter a valid phone number"
            showError = true
            return
        }

        isLoading = true
        error = nil

        do {
            try await authRepository.sendOTP(phoneNumber: phoneNumber)
            showOTPInput = true
        } catch let domainError as DomainError {
            error = domainError.localizedDescription
            showError = true
        } catch {
            self.error = error.localizedDescription
            showError = true
        }

        isLoading = false
    }

    private func performVerifyOTP() async {
        guard canSubmitOTP else {
            error = "Please enter the OTP code"
            showError = true
            return
        }

        isLoading = true
        error = nil

        do {
            let user = try await authRepository.verifyOTP(phoneNumber: phoneNumber, otp: otpCode)
            authState = .authenticated(user)
            clearFormFields()
        } catch let domainError as DomainError {
            error = domainError.localizedDescription
            showError = true
        } catch {
            self.error = error.localizedDescription
            showError = true
        }

        isLoading = false
    }

    private func performSignOut() async {
        isLoading = true

        do {
            try await authRepository.signOut()
            authState = .unauthenticated
        } catch let domainError as DomainError {
            error = domainError.localizedDescription
            showError = true
        } catch {
            self.error = error.localizedDescription
            showError = true
        }

        isLoading = false
    }

    private func clearFormFields() {
        password = ""
        otpCode = ""
        showOTPInput = false
    }
}
