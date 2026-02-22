//
//  UserEntityTests.swift
//  OhGrtTests
//
//  Tests for User, UserRole, AuthState, AuthCredentials domain entities
//

import Testing
import Foundation
@testable import OhGrt

// MARK: - User Entity Tests

struct UserEntityTests {

    @Test func userDisplayNameReturnsFullName() {
        let user = User(id: "u1", fullName: "John Doe")
        #expect(user.displayName == "John Doe")
    }

    @Test func userIsSupervisorOrAboveForCitizen() {
        let user = User(id: "u1", fullName: "Citizen", role: .citizen)
        #expect(user.isSupervisorOrAbove == false)
    }

    @Test func userIsSupervisorOrAboveForWorker() {
        let user = User(id: "u1", fullName: "Worker", role: .worker)
        #expect(user.isSupervisorOrAbove == false)
    }

    @Test func userIsSupervisorOrAboveForSupervisor() {
        let user = User(id: "u1", fullName: "Supervisor", role: .supervisor)
        #expect(user.isSupervisorOrAbove == true)
    }

    @Test func userIsSupervisorOrAboveForAdmin() {
        let user = User(id: "u1", fullName: "Admin", role: .admin)
        #expect(user.isSupervisorOrAbove == true)
    }

    @Test func userIsSupervisorOrAboveForRepresentative() {
        let user = User(id: "u1", fullName: "Rep", role: .representative)
        #expect(user.isSupervisorOrAbove == true)
    }

    @Test func userIsSupervisorOrAboveForSuperAdmin() {
        let user = User(id: "u1", fullName: "SuperAdmin", role: .superAdmin)
        #expect(user.isSupervisorOrAbove == true)
    }

    @Test func userEquatable() {
        let date = Date()
        let user1 = User(id: "u1", fullName: "User", role: .citizen, createdAt: date)
        let user2 = User(id: "u1", fullName: "User", role: .citizen, createdAt: date)

        #expect(user1 == user2)
    }

    @Test func userDefaultRole() {
        let user = User(id: "u1", fullName: "Default")
        #expect(user.role == .citizen)
    }

    @Test func userOptionalFields() {
        let user = User(id: "u1", fullName: "Test", phoneNumber: "+1234", email: "test@test.com",
                        status: "active", siteName: "Site A", siteId: "s1")

        #expect(user.phoneNumber == "+1234")
        #expect(user.email == "test@test.com")
        #expect(user.status == "active")
        #expect(user.siteName == "Site A")
        #expect(user.siteId == "s1")
    }
}

// MARK: - UserRole Tests

struct UserRoleTests {

    @Test func userRoleRawValues() {
        #expect(UserRole.citizen.rawValue == "citizen")
        #expect(UserRole.representative.rawValue == "representative")
        #expect(UserRole.admin.rawValue == "admin")
        #expect(UserRole.superAdmin.rawValue == "super_admin")
        #expect(UserRole.worker.rawValue == "worker")
        #expect(UserRole.supervisor.rawValue == "supervisor")
    }

    @Test func userRoleDisplayNames() {
        #expect(UserRole.citizen.displayName == "Citizen")
        #expect(UserRole.representative.displayName == "Representative")
        #expect(UserRole.admin.displayName == "Admin")
        #expect(UserRole.superAdmin.displayName == "Super Admin")
        #expect(UserRole.worker.displayName == "Worker")
        #expect(UserRole.supervisor.displayName == "Supervisor")
    }

    @Test func userRoleCaseIterable() {
        #expect(UserRole.allCases.count == 6)
    }

    @Test func userRoleInitFromStringValid() {
        let role = UserRole(from: "supervisor")
        #expect(role == .supervisor)
    }

    @Test func userRoleInitFromStringInvalid() {
        let role = UserRole(from: "unknown_role")
        #expect(role == .citizen)
    }

    @Test func userRoleIsSupervisorOrAbove() {
        #expect(UserRole.citizen.isSupervisorOrAbove == false)
        #expect(UserRole.worker.isSupervisorOrAbove == false)
        #expect(UserRole.representative.isSupervisorOrAbove == true)
        #expect(UserRole.admin.isSupervisorOrAbove == true)
        #expect(UserRole.superAdmin.isSupervisorOrAbove == true)
        #expect(UserRole.supervisor.isSupervisorOrAbove == true)
    }
}

// MARK: - AuthState Tests

struct AuthStateTests {

    @Test func authStateUnknown() {
        let state = AuthState.unknown
        #expect(state == .unknown)
    }

    @Test func authStateAuthenticated() {
        let user = User(id: "u1", fullName: "Test")
        let state = AuthState.authenticated(user)

        if case .authenticated(let u) = state {
            #expect(u.id == "u1")
        } else {
            #expect(Bool(false), "Expected authenticated state")
        }
    }

    @Test func authStateUnauthenticated() {
        let state = AuthState.unauthenticated
        #expect(state == .unauthenticated)
    }

    @Test func authStateEquatable() {
        let date = Date()
        let user = User(id: "u1", fullName: "Test", createdAt: date)
        #expect(AuthState.authenticated(user) == AuthState.authenticated(user))
        #expect(AuthState.unknown == AuthState.unknown)
        #expect(AuthState.unauthenticated == AuthState.unauthenticated)
        #expect(AuthState.unknown != AuthState.unauthenticated)
    }
}

// MARK: - AuthCredentials Tests

struct AuthCredentialsTests {

    @Test func credentialsStoresTokens() {
        let creds = AuthCredentials(accessToken: "access", refreshToken: "refresh", expiresAt: nil)

        #expect(creds.accessToken == "access")
        #expect(creds.refreshToken == "refresh")
        #expect(creds.expiresAt == nil)
    }

    @Test func credentialsWithExpiration() {
        let futureDate = Date().addingTimeInterval(3600)
        let creds = AuthCredentials(accessToken: "token", refreshToken: nil, expiresAt: futureDate)

        #expect(creds.expiresAt != nil)
        #expect(creds.expiresAt! > Date())
    }

    @Test func credentialsOptionalRefreshToken() {
        let creds = AuthCredentials(accessToken: "token-only", refreshToken: nil, expiresAt: nil)

        #expect(creds.accessToken == "token-only")
        #expect(creds.refreshToken == nil)
    }
}
