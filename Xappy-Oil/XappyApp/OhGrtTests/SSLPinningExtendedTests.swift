//
//  SSLPinningExtendedTests.swift
//  OhGrtTests
//
//  Extended tests for SSL Pinning
//

import Testing
import Foundation
@testable import OhGrt

struct SSLPinningExtendedTests {

    // MARK: - Certificate Status Tests

    @Test func certificateStatusIsCurrentlyValid() {
        let status = SSLPinningDelegate.certificateStatus()

        // The cert expires April 16, 2026, so as of Feb 2026 it should be valid or expiringSoon
        #expect(status.isValid == true)
    }

    @Test func certificateStatusValidDescription() {
        let status = SSLPinningDelegate.CertificateStatus.valid(daysRemaining: 100)

        #expect(status.isValid == true)
        #expect(status.description.contains("100"))
        #expect(status.description.contains("Valid"))
    }

    @Test func certificateStatusExpiringSoonDescription() {
        let status = SSLPinningDelegate.CertificateStatus.expiringSoon(daysRemaining: 15)

        #expect(status.isValid == true)
        #expect(status.description.contains("15"))
        #expect(status.description.contains("Expiring"))
    }

    @Test func certificateStatusExpiredDescription() {
        let status = SSLPinningDelegate.CertificateStatus.expired

        #expect(status.isValid == false)
        #expect(status.description == "Expired")
    }

    // MARK: - Pinned Session Tests

    @Test func pinnedSessionCreatesSessionWithDelegate() {
        let session = URLSession.pinnedSession()

        #expect(session.delegate != nil)
        #expect(session.configuration.timeoutIntervalForRequest == 30)
        #expect(session.configuration.timeoutIntervalForResource == 60)
    }

    @Test func pinnedSessionWithCustomTimeout() {
        let session = URLSession.pinnedSession(timeoutInterval: 45)

        #expect(session.configuration.timeoutIntervalForRequest == 45)
        #expect(session.configuration.timeoutIntervalForResource == 60)
    }

    @Test func sslPinningDelegateCanBeCreated() {
        let delegate = SSLPinningDelegate()

        #expect(delegate != nil)
    }

    @Test func multiplePinnedSessionsHaveIndependentDelegates() {
        let session1 = URLSession.pinnedSession()
        let session2 = URLSession.pinnedSession()

        #expect(session1.delegate !== session2.delegate)
    }
}
