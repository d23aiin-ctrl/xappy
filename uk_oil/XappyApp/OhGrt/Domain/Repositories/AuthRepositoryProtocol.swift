import Foundation
import Combine

/// Protocol defining JanSeva authentication repository operations
/// Implemented by Data layer, used by Domain Use Cases
protocol AuthRepositoryProtocol: Sendable {
    /// Current authentication state publisher
    var authStatePublisher: AnyPublisher<AuthState, Never> { get }

    /// Current authentication state
    var currentAuthState: AuthState { get }

    /// Sign in with phone number and password
    /// - Parameters:
    ///   - phoneNumber: User's phone number
    ///   - password: User's password
    /// - Returns: Authenticated user
    /// - Throws: DomainError on failure
    func signIn(phoneNumber: String, password: String) async throws -> User

    /// Send OTP to phone number
    /// - Parameter phoneNumber: Phone number to send OTP to
    /// - Throws: DomainError on failure
    func sendOTP(phoneNumber: String) async throws

    /// Verify OTP and sign in
    /// - Parameters:
    ///   - phoneNumber: Phone number that received OTP
    ///   - otp: OTP code to verify
    /// - Returns: Authenticated user
    /// - Throws: DomainError on failure
    func verifyOTP(phoneNumber: String, otp: String) async throws -> User

    /// Sign out current user
    /// - Throws: DomainError on failure
    func signOut() async throws

    /// Clear auth state without network calls
    func setUnauthenticated()

    /// Refresh authentication token
    /// - Returns: New credentials
    /// - Throws: DomainError on failure
    func refreshToken() async throws -> AuthCredentials

    /// Check if user is authenticated
    /// - Returns: true if authenticated
    func isAuthenticated() -> Bool

    /// Get current user
    /// - Returns: Current user or nil
    func getCurrentUser() -> User?

    /// Fetch current user from server
    /// - Returns: Current user
    /// - Throws: DomainError on failure
    func fetchCurrentUser() async throws -> User
}
