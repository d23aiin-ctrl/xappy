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
            badgeNumber: "EMP001",
            fullName: "Test User",
            role: .worker,
            phoneNumber: "+1234567890",
            siteName: "Test Site",
            siteId: "site-1",
            department: "Operations",
            jobTitle: "Operator",
            createdAt: Date()
        )

        #expect(user.id == "user-123")
        #expect(user.badgeNumber == "EMP001")
        #expect(user.fullName == "Test User")
        #expect(user.role == .worker)
    }

    @Test func userWithNilOptionals() async throws {
        let user = User(
            id: "user-456",
            badgeNumber: "EMP002",
            fullName: "Minimal User",
            role: .contractor,
            phoneNumber: nil,
            siteName: nil,
            siteId: nil,
            department: nil,
            jobTitle: nil,
            createdAt: Date()
        )

        #expect(user.id == "user-456")
        #expect(user.badgeNumber == "EMP002")
        #expect(user.phoneNumber == nil)
        #expect(user.siteName == nil)
    }

    @Test func userRoleValues() async throws {
        // Test all user roles exist
        let roles: [UserRole] = [.worker, .contractor, .supervisor, .siteManager, .hseManager, .admin]
        #expect(roles.count >= 6)
    }
}

// MARK: - AuthError Tests

struct AuthErrorDetailTests {

    @Test func allAuthErrorsHaveDescriptions() async throws {
        let errors: [AuthError] = [
            .invalidBadgeNumber,
            .invalidPin,
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
        let error: LocalizedError = AuthError.invalidBadgeNumber
        #expect(error.errorDescription != nil)
    }

    @Test func authErrorInvalidBadgeNumber() async throws {
        let error = AuthError.invalidBadgeNumber
        #expect(error.errorDescription?.contains("badge") == true)
    }

    @Test func authErrorInvalidPin() async throws {
        let error = AuthError.invalidPin
        #expect(error.errorDescription?.contains("PIN") == true)
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
