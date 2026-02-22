//
//  KeychainManagerTests.swift
//  OhGrtTests
//
//  Tests for KeychainManager
//

import Testing
import Foundation
@testable import OhGrt

struct KeychainManagerTests {

    // MARK: - Token Management

    @Test func saveAndGetAccessToken() async throws {
        let manager = KeychainManager.shared

        try await manager.saveTokens(access: "test-access-token", refresh: "test-refresh-token")
        let accessToken = try await manager.getAccessToken()
        let refreshToken = try await manager.getRefreshToken()

        #expect(accessToken == "test-access-token")
        #expect(refreshToken == "test-refresh-token")

        // Cleanup
        try await manager.clearTokens()
    }

    @Test func clearTokensRemovesStoredTokens() async throws {
        let manager = KeychainManager.shared

        try await manager.saveTokens(access: "to-clear", refresh: "to-clear-refresh")
        try await manager.clearTokens()

        let accessToken = try await manager.getAccessToken()
        let refreshToken = try await manager.getRefreshToken()

        #expect(accessToken == nil)
        #expect(refreshToken == nil)
    }

    @Test func hasTokensReturnsTrueWhenStored() async throws {
        let manager = KeychainManager.shared

        try await manager.saveTokens(access: "a", refresh: "r")
        let hasTokens = await manager.hasTokens()

        #expect(hasTokens == true)

        // Cleanup
        try await manager.clearTokens()
    }

    @Test func hasTokensReturnsFalseWhenCleared() async throws {
        let manager = KeychainManager.shared

        try await manager.clearTokens()
        let hasTokens = await manager.hasTokens()

        #expect(hasTokens == false)
    }

    // MARK: - User ID Management

    @Test func saveAndGetUserId() async throws {
        let manager = KeychainManager.shared

        try await manager.saveUserId("user-123")
        let userId = try await manager.getUserId()

        #expect(userId == "user-123")

        // Cleanup
        try await manager.clearAllData()
    }

    // MARK: - Phone Number Management

    @Test func saveAndGetPhoneNumber() async throws {
        let manager = KeychainManager.shared

        try await manager.savePhoneNumber("+1234567890")
        let phone = try await manager.getPhoneNumber()

        #expect(phone == "+1234567890")

        // Cleanup
        try await manager.clearAllData()
    }

    // MARK: - User Role Management

    @Test func saveAndGetUserRole() async throws {
        let manager = KeychainManager.shared

        try await manager.saveUserRole("supervisor")
        let role = try await manager.getUserRole()

        #expect(role == "supervisor")

        // Cleanup
        try await manager.clearAllData()
    }

    // MARK: - Clear All Data

    @Test func clearAllDataRemovesEverything() async throws {
        let manager = KeychainManager.shared

        try await manager.saveTokens(access: "a", refresh: "r")
        try await manager.saveUserId("u1")
        try await manager.savePhoneNumber("+1234567890")
        try await manager.saveUserRole("admin")

        try await manager.clearAllData()

        let accessToken = try await manager.getAccessToken()
        let refreshToken = try await manager.getRefreshToken()
        let userId = try await manager.getUserId()
        let phone = try await manager.getPhoneNumber()
        let role = try await manager.getUserRole()

        #expect(accessToken == nil)
        #expect(refreshToken == nil)
        #expect(userId == nil)
        #expect(phone == nil)
        #expect(role == nil)
    }

    // MARK: - Overwrite Existing Values

    @Test func savingTokensOverwritesPrevious() async throws {
        let manager = KeychainManager.shared

        try await manager.saveTokens(access: "old-access", refresh: "old-refresh")
        try await manager.saveTokens(access: "new-access", refresh: "new-refresh")

        let accessToken = try await manager.getAccessToken()
        let refreshToken = try await manager.getRefreshToken()

        #expect(accessToken == "new-access")
        #expect(refreshToken == "new-refresh")

        // Cleanup
        try await manager.clearAllData()
    }

    // MARK: - OAuth State Management

    @Test func oauthStateSaveAndRetrieve() async throws {
        let manager = KeychainManager.shared

        try await manager.saveOAuthState("state-123", for: "github")
        let state = try await manager.getOAuthState(for: "github")

        #expect(state == "state-123")

        // Cleanup
        try await manager.removeOAuthState(for: "github")
    }

    @Test func validateAndClearOAuthStateValid() async throws {
        let manager = KeychainManager.shared

        try await manager.saveOAuthState("valid-state", for: "slack")
        let isValid = try await manager.validateAndClearOAuthState("valid-state", for: "slack")

        #expect(isValid == true)

        // Should have been cleared
        let afterClear = try await manager.getOAuthState(for: "slack")
        #expect(afterClear == nil)
    }

    @Test func validateAndClearOAuthStateInvalid() async throws {
        let manager = KeychainManager.shared

        try await manager.saveOAuthState("correct-state", for: "jira")
        let isValid = try await manager.validateAndClearOAuthState("wrong-state", for: "jira")

        #expect(isValid == false)

        // Should NOT have been cleared since state didn't match
        let afterCheck = try await manager.getOAuthState(for: "jira")
        #expect(afterCheck == "correct-state")

        // Cleanup
        try await manager.removeOAuthState(for: "jira")
    }

    @Test func validateAndClearOAuthStateNoExistingState() async throws {
        let manager = KeychainManager.shared

        let isValid = try await manager.validateAndClearOAuthState("any-state", for: "nonexistent")

        #expect(isValid == false)
    }
}
