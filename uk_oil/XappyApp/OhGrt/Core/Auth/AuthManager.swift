import Foundation
import SwiftUI
import Combine
import SwiftData
import os.log

private let logger = Logger(subsystem: "com.xappy.ai", category: "AuthManager")

/// Main authentication manager for JanSeva
@MainActor
class AuthManager: ObservableObject {
    /// Shared singleton instance
    static let shared = AuthManager()

    /// Whether the user is authenticated
    @Published var isAuthenticated = false

    /// Current user information
    @Published var currentUser: XappyUserInfo?

    /// Loading state for auth operations
    @Published var isLoading = false

    /// Error message to display
    @Published var errorMessage: String?

    /// Stored phone number for quick re-login
    @Published var storedPhoneNumber: String?

    private init() {
        checkAuthState()
    }

    /// Check if user has valid stored tokens
    func checkAuthState() {
        // In development mode, skip auth checks (backend requires database)
        // if AppConfig.shared.isDevelopment {
        //     logger.info("Skipping auth check in development mode")
        //     return
        // }

        Task {
            // Check for stored phone number
            if let phone = try? await KeychainManager.shared.getPhoneNumber() {
                await MainActor.run {
                    self.storedPhoneNumber = phone
                }
            }

            let hasTokens = await KeychainManager.shared.hasTokens()
            await MainActor.run {
                self.isAuthenticated = hasTokens
            }

            if hasTokens {
                // Try to fetch user profile
                await fetchUserProfile()
            }
        }
    }

    /// Sign in with phone number and password
    func signIn(phoneNumber: String, password: String) async {
        isLoading = true
        errorMessage = nil

        defer {
            Task { @MainActor in
                self.isLoading = false
            }
        }

        do {
            let response: XappyAuthResponseDTO = try await APIClient.shared.signIn(
                phoneNumber: phoneNumber,
                password: password
            )

            // Save tokens to keychain
            try await KeychainManager.shared.saveTokens(
                access: response.accessToken,
                refresh: response.refreshToken ?? ""
            )

            // Save phone number for quick re-login
            try await KeychainManager.shared.savePhoneNumber(phoneNumber)

            if let user = response.user {
                // Save user role
                try await KeychainManager.shared.saveUserRole(user.role)
                await MainActor.run {
                    self.currentUser = XappyUserInfo(from: user)
                }
            }

            await MainActor.run {
                self.isAuthenticated = true
                self.storedPhoneNumber = phoneNumber
            }

            logger.info("Login successful for \(self.redactedIdentifier(phoneNumber), privacy: .public)")

        } catch {
            logger.error("Login failed: \(error.localizedDescription)")
            await MainActor.run {
                self.errorMessage = error.localizedDescription
            }
        }
    }

    /// Send OTP to phone number
    func sendOTP(phoneNumber: String) async throws {
        isLoading = true
        errorMessage = nil

        defer {
            Task { @MainActor in
                self.isLoading = false
            }
        }

        do {
            try await APIClient.shared.sendOTP(phoneNumber: phoneNumber)
            logger.info("OTP sent to \(self.redactedIdentifier(phoneNumber), privacy: .public)")
        } catch {
            logger.error("Failed to send OTP: \(error.localizedDescription)")
            await MainActor.run {
                self.errorMessage = error.localizedDescription
            }
            throw error
        }
    }

    /// Verify OTP and sign in
    func verifyOTP(phoneNumber: String, otp: String) async {
        isLoading = true
        errorMessage = nil

        defer {
            Task { @MainActor in
                self.isLoading = false
            }
        }

        do {
            let response: XappyAuthResponseDTO = try await APIClient.shared.verifyOTP(
                phoneNumber: phoneNumber,
                otp: otp
            )

            // Save tokens to keychain
            try await KeychainManager.shared.saveTokens(
                access: response.accessToken,
                refresh: response.refreshToken ?? ""
            )

            if let user = response.user {
                // Save user role
                try await KeychainManager.shared.saveUserRole(user.role)
                await MainActor.run {
                    self.currentUser = XappyUserInfo(from: user)
                }
            }

            await MainActor.run {
                self.isAuthenticated = true
            }

            logger.info("OTP verification successful")

        } catch {
            logger.error("OTP verification failed: \(error.localizedDescription)")
            await MainActor.run {
                self.errorMessage = error.localizedDescription
            }
        }
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

    /// Development mode login - bypasses authentication
    /// Only available in DEBUG builds
    func devModeLogin() {
        #if DEBUG
        logger.info("Dev mode login - bypassing authentication")
        isAuthenticated = true
        currentUser = XappyUserInfo(
            id: UUID().uuidString,
            fullName: "Dev User",
            role: "supervisor",
            phoneNumber: "DEV-001",
            email: nil,
            siteName: "Development Site",
            siteId: "dev-site"
        )
        #endif
    }

    /// Fetch current user profile from backend
    func fetchUserProfile() async {
        // In development mode, skip profile fetch (backend requires database)
        if AppConfig.shared.isDevelopment {
            logger.info("Skipping profile fetch in development mode")
            return
        }

        do {
            let user: XappyUserDTO = try await APIClient.shared.request(endpoint: .me)
            await MainActor.run {
                self.currentUser = XappyUserInfo(from: user)
            }
            logger.debug("User profile fetched successfully")
        } catch {
            logger.error("Failed to fetch user profile: \(error.localizedDescription)")
            // If profile fetch fails, tokens might be invalid
            if case APIError.tokenExpired = error {
                await signOut()
            }
        }
    }

    /// Sign out
    func signOut() async {
        isLoading = true

        do {
            // Notify backend (best effort)
            try? await APIClient.shared.requestVoid(endpoint: .logout)

            // Clear all local data
            try await KeychainManager.shared.clearAllData()
            clearLocalData()

            await MainActor.run {
                self.isAuthenticated = false
                self.currentUser = nil
                self.isLoading = false
                // Keep badge number for quick re-login
            }

            logger.info("Sign out successful")

        } catch {
            logger.error("Sign out error: \(error.localizedDescription)")
            await MainActor.run {
                self.isLoading = false
                self.errorMessage = error.localizedDescription
            }
        }
    }

    /// Clear stored phone number (full logout)
    func clearStoredPhoneNumber() async {
        do {
            try await KeychainManager.shared.savePhoneNumber("")
            await MainActor.run {
                self.storedPhoneNumber = nil
            }
        } catch {
            logger.error("Failed to clear phone number: \(error.localizedDescription)")
        }
    }

    private func clearLocalData() {
        do {
            let container = try ModelContainer(for: Message.self, Conversation.self)
            let context = ModelContext(container)
            let messages = try context.fetch(FetchDescriptor<Message>())
            let conversations = try context.fetch(FetchDescriptor<Conversation>())
            messages.forEach { context.delete($0) }
            conversations.forEach { context.delete($0) }
            try context.save()
            logger.debug("Cleared local chat data")
        } catch {
            logger.error("Failed to clear local data: \(error.localizedDescription)")
        }
    }
}

// MARK: - Supporting Types

/// JanSeva User information for display
struct XappyUserInfo: Identifiable {
    let id: String
    let fullName: String
    let role: String
    let phoneNumber: String?
    let email: String?
    let siteName: String?
    let siteId: String?

    init(from dto: XappyUserDTO) {
        self.id = dto.id
        self.fullName = dto.fullName
        self.role = dto.role
        self.phoneNumber = dto.phoneNumber
        self.email = dto.email
        self.siteName = dto.siteName
        self.siteId = dto.siteId
    }

    /// Convenience init for development mode
    init(id: String, fullName: String, role: String, phoneNumber: String?, email: String?, siteName: String?, siteId: String?) {
        self.id = id
        self.fullName = fullName
        self.role = role
        self.phoneNumber = phoneNumber
        self.email = email
        self.siteName = siteName
        self.siteId = siteId
    }

    /// Display name for UI
    var displayName: String {
        fullName
    }

    /// Role display name
    var roleDisplayName: String {
        XappyUserRole(rawValue: role)?.displayName ?? role.capitalized
    }

    /// Whether user has supervisor-level access
    var isSupervisorOrAbove: Bool {
        XappyUserRole(rawValue: role)?.isSupervisorOrAbove ?? false
    }
}

/// Authentication errors
enum AuthError: LocalizedError {
    case invalidPhoneNumber
    case invalidPassword
    case invalidOTP
    case accountLocked
    case networkError

    var errorDescription: String? {
        switch self {
        case .invalidPhoneNumber:
            return "Invalid phone number"
        case .invalidPassword:
            return "Invalid password"
        case .invalidOTP:
            return "Invalid OTP code"
        case .accountLocked:
            return "Account is locked. Please contact support."
        case .networkError:
            return "Network error. Please check your connection."
        }
    }
}
