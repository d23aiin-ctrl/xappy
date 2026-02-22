//
//  AuthManagerTests.swift
//  OhGrtTests
//
//  Tests for AuthManager functionality
//

import Testing
import Foundation
@testable import OhGrt

// MARK: - AuthManager State Tests

struct AuthManagerStateTests {

    @Test func sharedInstanceExists() async throws {
        await MainActor.run {
            let manager = AuthManager.shared
            #expect(manager != nil)
        }
    }

    @Test func initialLoadingState() async throws {
        await MainActor.run {
            let manager = AuthManager.shared
            // isLoading should be false when no operation is in progress
            #expect(manager.isLoading == false)
        }
    }

    @Test func errorMessageInitiallyNil() async throws {
        await MainActor.run {
            let manager = AuthManager.shared
            // Clear any previous error for test
            manager.errorMessage = nil
            #expect(manager.errorMessage == nil)
        }
    }
}

// MARK: - User Tests

struct UserModelTests {

    @Test func userInitialization() async throws {
        let user = User(
            id: "user-123",
            fullName: "Test User",
            role: .worker,
            phoneNumber: "+1234567890",
            siteName: "Test Site",
            siteId: "site-1",
            createdAt: Date()
        )

        #expect(user.id == "user-123")
        #expect(user.fullName == "Test User")
        #expect(user.role == .worker)
    }

    @Test func userWithNilOptionals() async throws {
        let user = User(
            id: "user-456",
            fullName: "Minimal User",
            role: .citizen,
            phoneNumber: nil,
            siteName: nil,
            siteId: nil,
            createdAt: Date()
        )

        #expect(user.id == "user-456")
        #expect(user.phoneNumber == nil)
        #expect(user.siteName == nil)
    }

    @Test func userRoleValues() async throws {
        // Test all user roles exist
        let roles: [UserRole] = [.citizen, .representative, .admin, .superAdmin, .worker, .supervisor]
        #expect(roles.count == 6)
    }
}

// MARK: - AuthError Tests

struct AuthErrorDetailTests {

    @Test func allAuthErrorsHaveDescriptions() async throws {
        let errors: [AuthError] = [
            .invalidPhoneNumber,
            .invalidPassword,
            .invalidOTP,
            .accountLocked,
            .networkError
        ]

        for error in errors {
            #expect(error.errorDescription != nil)
            #expect(!error.errorDescription!.isEmpty)
        }
    }

    @Test func authErrorConformsToLocalizedError() async throws {
        let error: LocalizedError = AuthError.invalidPhoneNumber
        #expect(error.errorDescription != nil)
    }

    @Test func authErrorInvalidPhoneNumber() async throws {
        let error = AuthError.invalidPhoneNumber
        #expect(error.errorDescription?.contains("phone") == true)
    }

    @Test func authErrorInvalidPassword() async throws {
        let error = AuthError.invalidPassword
        #expect(error.errorDescription?.contains("password") == true)
    }

    @Test func authErrorInvalidOTP() async throws {
        let error = AuthError.invalidOTP
        #expect(error.errorDescription?.contains("OTP") == true)
    }

    @Test func authErrorAccountLocked() async throws {
        let error = AuthError.accountLocked
        #expect(error.errorDescription?.contains("locked") == true)
    }

    @Test func authErrorNetworkError() async throws {
        let error = AuthError.networkError
        #expect(error.errorDescription?.contains("Network") == true)
    }
}
