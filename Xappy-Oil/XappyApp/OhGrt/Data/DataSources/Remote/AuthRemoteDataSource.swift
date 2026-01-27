import Foundation
import UIKit

/// Protocol for remote authentication data source
protocol AuthRemoteDataSourceProtocol: Sendable {
    func signIn(phoneNumber: String, password: String) async throws -> XappyAuthResponseDTO
    func sendOTP(phoneNumber: String) async throws
    func verifyOTP(phoneNumber: String, otp: String) async throws -> XappyAuthResponseDTO
    func signOut() async throws
    func refreshToken(refreshToken: String) async throws -> TokenRefreshResponseDTO
    func getCurrentUser() async throws -> XappyUserDTO
}

/// Remote data source for JanSeva authentication operations
final class AuthRemoteDataSource: AuthRemoteDataSourceProtocol, @unchecked Sendable {
    private let apiClient: APIClient

    init(apiClient: APIClient) {
        self.apiClient = apiClient
    }

    /// Sign in with badge number and PIN
    func signIn(phoneNumber: String, password: String) async throws -> XappyAuthResponseDTO {
        let request = BadgeLoginRequestDTO(badgeNumber: phoneNumber, pin: password)
        return try await apiClient.request(endpoint: .login, body: request, requiresAuth: false)
    }

    /// Send OTP to phone number
    func sendOTP(phoneNumber: String) async throws {
        let request = OTPSendRequestDTO(phoneNumber: phoneNumber)
        let _: EmptyResponse = try await apiClient.request(endpoint: .otpSend, body: request, requiresAuth: false)
    }

    /// Verify OTP and get auth tokens
    func verifyOTP(phoneNumber: String, otp: String) async throws -> XappyAuthResponseDTO {
        let request = OTPVerifyRequestDTO(phoneNumber: phoneNumber, otp: otp)
        return try await apiClient.request(endpoint: .otpVerify, body: request, requiresAuth: false)
    }

    /// Sign out (invalidate tokens on server)
    func signOut() async throws {
        // Best effort - don't fail if server is unreachable
        do {
            let _: EmptyResponse = try await apiClient.request(endpoint: .logout)
        } catch {
            // Ignore errors - we still want to clear local state
        }
    }

    /// Refresh access token
    func refreshToken(refreshToken: String) async throws -> TokenRefreshResponseDTO {
        let request = TokenRefreshRequestDTO(refreshToken: refreshToken)
        return try await apiClient.request(endpoint: .refreshToken, body: request, requiresAuth: false)
    }

    /// Get current user profile
    func getCurrentUser() async throws -> XappyUserDTO {
        return try await apiClient.request(endpoint: .me)
    }
}

// Note: BadgeLoginRequestDTO is defined in AuthDTO.swift
