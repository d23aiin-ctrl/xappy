//
//  DomainErrorExtendedTests.swift
//  OhGrtTests
//
//  Extended tests for DomainError
//

import Testing
import Foundation
@testable import OhGrt

struct DomainErrorExtendedTests {

    @Test func allDomainErrorsHaveDescription() {
        let errors: [DomainError] = [
            .notAuthenticated,
            .authenticationFailed("test"),
            .tokenExpired,
            .invalidCredentials,
            .networkUnavailable,
            .serverError("test"),
            .requestTimeout,
            .invalidResponse,
            .notFound,
            .dataCorrupted,
            .saveFailed("test"),
            .deleteFailed("test"),
            .messageEmpty,
            .conversationNotFound,
            .rateLimitExceeded,
            .usageLimitReached,
            .unknown("test"),
            .notImplemented("feature"),
        ]

        for error in errors {
            #expect(!error.localizedDescription.isEmpty, "DomainError should have non-empty description")
        }
        #expect(errors.count == 18)
    }

    @Test func notAuthenticatedDescription() {
        let error = DomainError.notAuthenticated
        #expect(error.localizedDescription.contains("sign in"))
    }

    @Test func authenticationFailedDescription() {
        let error = DomainError.authenticationFailed("Invalid credentials")
        #expect(error.localizedDescription.contains("Invalid credentials"))
    }

    @Test func tokenExpiredDescription() {
        let error = DomainError.tokenExpired
        #expect(error.localizedDescription.contains("expired"))
    }

    @Test func invalidCredentialsDescription() {
        let error = DomainError.invalidCredentials
        #expect(error.localizedDescription.contains("Invalid"))
    }

    @Test func networkUnavailableDescription() {
        let error = DomainError.networkUnavailable
        #expect(error.localizedDescription.contains("internet") || error.localizedDescription.contains("connection"))
    }

    @Test func serverErrorDescription() {
        let error = DomainError.serverError("Internal error")
        #expect(error.localizedDescription.contains("Internal error"))
    }

    @Test func requestTimeoutDescription() {
        let error = DomainError.requestTimeout
        #expect(error.localizedDescription.contains("timed out"))
    }

    @Test func invalidResponseDescription() {
        let error = DomainError.invalidResponse
        #expect(error.localizedDescription.contains("Invalid response"))
    }

    @Test func notFoundDescription() {
        let error = DomainError.notFound
        #expect(error.localizedDescription.contains("not found"))
    }

    @Test func dataCorruptedDescription() {
        let error = DomainError.dataCorrupted
        #expect(error.localizedDescription.contains("corrupted"))
    }

    @Test func saveFailedDescription() {
        let error = DomainError.saveFailed("disk full")
        #expect(error.localizedDescription.contains("disk full"))
    }

    @Test func deleteFailedDescription() {
        let error = DomainError.deleteFailed("permission denied")
        #expect(error.localizedDescription.contains("permission denied"))
    }

    @Test func messageEmptyDescription() {
        let error = DomainError.messageEmpty
        #expect(error.localizedDescription.contains("empty"))
    }

    @Test func conversationNotFoundDescription() {
        let error = DomainError.conversationNotFound
        #expect(error.localizedDescription.contains("not found"))
    }

    @Test func rateLimitExceededDescription() {
        let error = DomainError.rateLimitExceeded
        #expect(error.localizedDescription.contains("many requests") || error.localizedDescription.contains("wait"))
    }

    @Test func usageLimitReachedDescription() {
        let error = DomainError.usageLimitReached
        #expect(error.localizedDescription.contains("limit"))
    }

    @Test func unknownErrorDescription() {
        let error = DomainError.unknown("Something unexpected")
        #expect(error.localizedDescription == "Something unexpected")
    }

    @Test func notImplementedDescription() {
        let error = DomainError.notImplemented("Voice input")
        #expect(error.localizedDescription.contains("Voice input"))
        #expect(error.localizedDescription.contains("not yet implemented"))
    }

    // MARK: - Equatable Tests

    @Test func domainErrorEquatable() {
        #expect(DomainError.notAuthenticated == DomainError.notAuthenticated)
        #expect(DomainError.tokenExpired == DomainError.tokenExpired)
        #expect(DomainError.notFound == DomainError.notFound)
        #expect(DomainError.notAuthenticated != DomainError.tokenExpired)
    }

    @Test func domainErrorWithAssociatedValueEquatable() {
        #expect(DomainError.serverError("a") == DomainError.serverError("a"))
        #expect(DomainError.serverError("a") != DomainError.serverError("b"))
        #expect(DomainError.unknown("x") == DomainError.unknown("x"))
    }

    // MARK: - Error Conformance

    @Test func domainErrorConformsToError() {
        let error: Error = DomainError.notFound
        #expect(error.localizedDescription.count > 0)
    }

    @Test func domainErrorIsSendable() {
        // This test verifies Sendable conformance at compile time
        let error: Sendable = DomainError.notAuthenticated
        #expect(error is DomainError)
    }
}
