//
//  AppConfigTests.swift
//  OhGrtTests
//
//  Tests for AppConfig functionality
//

import Testing
import Foundation
@testable import OhGrt

// MARK: - AppConfig Tests

struct AppConfigTests {

    @Test func sharedInstanceExists() async throws {
        let config = AppConfig.shared
        #expect(config != nil)
    }

    @Test func apiBaseURLIsValid() async throws {
        let config = AppConfig.shared
        let url = config.apiBaseURL

        // Should be a valid URL
        #expect(url.scheme == "http" || url.scheme == "https")
        #expect(url.host != nil)
    }

    @Test func apiBaseURLHasHost() async throws {
        let config = AppConfig.shared
        let url = config.apiBaseURL

        // Host should not be empty
        #expect(url.host != nil)
        #expect(!url.host!.isEmpty)
    }

    @Test func environmentIsSet() async throws {
        let config = AppConfig.shared
        let env = config.environment

        // Environment should be one of the valid values
        let validEnvironments: [AppEnvironment] = [.development, .staging, .production]
        #expect(validEnvironments.contains(env))
    }

    @Test func requestTimeoutIsPositive() async throws {
        let config = AppConfig.shared
        let timeout = config.requestTimeout

        #expect(timeout > 0)
    }

    @Test func maxRetryAttemptsIsPositive() async throws {
        let config = AppConfig.shared
        let retries = config.maxRetryAttempts

        #expect(retries >= 0)
    }

    @Test func isDevelopmentComputedProperty() async throws {
        let config = AppConfig.shared
        // In DEBUG builds, environment is development
        #expect(config.isDevelopment == (config.environment == .development))
    }

    @Test func isProductionComputedProperty() async throws {
        let config = AppConfig.shared
        #expect(config.isProduction == (config.environment == .production))
    }

    @Test func apiVersionIsSet() async throws {
        let config = AppConfig.shared
        #expect(config.apiVersion == "/api/v1")
    }

    @Test func debugLogDoesNotCrash() async throws {
        let config = AppConfig.shared
        // Should not throw or crash regardless of allowDebugLogging
        config.debugLog("Test log message")
    }
}

// MARK: - Feature Flag Tests

struct FeatureFlagTests {

    @Test func offlineModeEnabled() {
        #expect(AppConfig.FeatureFlags.offlineModeEnabled == true)
    }

    @Test func voiceInputEnabled() {
        #expect(AppConfig.FeatureFlags.voiceInputEnabled == true)
    }

    @Test func photoCaptureEnabled() {
        #expect(AppConfig.FeatureFlags.photoCaptureEnabled == true)
    }

    @Test func locationCaptureEnabled() {
        #expect(AppConfig.FeatureFlags.locationCaptureEnabled == true)
    }

    @Test func maxMessageLengthIsPositive() {
        #expect(AppConfig.FeatureFlags.maxMessageLength > 0)
    }

    @Test func supervisorDashboardEnabled() {
        #expect(AppConfig.FeatureFlags.supervisorDashboardEnabled == true)
    }
}

// MARK: - Security Config Tests

struct SecurityConfigTests {

    @Test func securityKeysAreNonEmpty() {
        #expect(!AppConfig.Security.keychainService.isEmpty)
        #expect(!AppConfig.Security.accessTokenKey.isEmpty)
        #expect(!AppConfig.Security.refreshTokenKey.isEmpty)
        #expect(!AppConfig.Security.userIdKey.isEmpty)
        #expect(!AppConfig.Security.badgeNumberKey.isEmpty)
        #expect(!AppConfig.Security.userRoleKey.isEmpty)
    }

    @Test func tokenRefreshThresholdIsPositive() {
        #expect(AppConfig.Security.tokenRefreshThreshold > 0)
    }

    @Test func maxFailedAuthAttemptsIsPositive() {
        #expect(AppConfig.Security.maxFailedAuthAttempts > 0)
    }

    @Test func authLockoutDurationIsPositive() {
        #expect(AppConfig.Security.authLockoutDuration > 0)
    }
}

// MARK: - AppEnvironment Tests

struct AppEnvironmentTests {

    @Test func developmentEnvironmentExists() async throws {
        let env = AppEnvironment.development
        #expect(env == .development)
    }

    @Test func stagingEnvironmentExists() async throws {
        let env = AppEnvironment.staging
        #expect(env == .staging)
    }

    @Test func productionEnvironmentExists() async throws {
        let env = AppEnvironment.production
        #expect(env == .production)
    }

    @Test func environmentsAreDistinct() async throws {
        #expect(AppEnvironment.development != AppEnvironment.staging)
        #expect(AppEnvironment.staging != AppEnvironment.production)
        #expect(AppEnvironment.development != AppEnvironment.production)
    }
}
