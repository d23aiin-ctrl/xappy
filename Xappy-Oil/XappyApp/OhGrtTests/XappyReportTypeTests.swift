//
//  XappyReportTypeTests.swift
//  OhGrtTests
//
//  Tests for XappyReportType and XappyUserRole
//

import Testing
import Foundation
@testable import OhGrt

// MARK: - XappyReportType Tests

struct XappyReportTypeTests {

    @Test func allReportTypesHaveDisplayName() {
        for reportType in XappyReportType.allCases {
            #expect(!reportType.displayName.isEmpty, "Report type \(reportType.rawValue) should have a display name")
        }
    }

    @Test func allReportTypesHaveIcon() {
        for reportType in XappyReportType.allCases {
            #expect(!reportType.icon.isEmpty, "Report type \(reportType.rawValue) should have an icon")
        }
    }

    @Test func reportTypeCount() {
        #expect(XappyReportType.allCases.count == 9)
    }

    @Test func nearMissDisplayName() {
        #expect(XappyReportType.nearMiss.displayName == "Near-Miss")
    }

    @Test func incidentDisplayName() {
        #expect(XappyReportType.incident.displayName == "Incident")
    }

    @Test func spillReportDisplayName() {
        #expect(XappyReportType.spillReport.displayName == "Spill Report")
    }

    @Test func reportTypeRawValues() {
        #expect(XappyReportType.nearMiss.rawValue == "near_miss")
        #expect(XappyReportType.incident.rawValue == "incident")
        #expect(XappyReportType.dailySafetyLog.rawValue == "daily_safety_log")
        #expect(XappyReportType.shiftHandover.rawValue == "shift_handover")
        #expect(XappyReportType.toolboxTalk.rawValue == "toolbox_talk")
        #expect(XappyReportType.ptwEvidence.rawValue == "ptw_evidence")
        #expect(XappyReportType.lotoEvidence.rawValue == "loto_evidence")
        #expect(XappyReportType.spillReport.rawValue == "spill_report")
        #expect(XappyReportType.inspection.rawValue == "inspection")
    }

    @Test func reportTypeIcons() {
        #expect(XappyReportType.nearMiss.icon == "exclamationmark.triangle")
        #expect(XappyReportType.incident.icon == "flame")
        #expect(XappyReportType.inspection.icon == "magnifyingglass")
    }
}

// MARK: - XappyUserRole Tests

struct XappyUserRoleTests {

    @Test func allUserRolesHaveDisplayName() {
        for role in XappyUserRole.allCases {
            #expect(!role.displayName.isEmpty, "Role \(role.rawValue) should have a display name")
        }
    }

    @Test func userRoleCount() {
        #expect(XappyUserRole.allCases.count == 10)
    }

    @Test func workerIsNotSupervisorOrAbove() {
        #expect(XappyUserRole.worker.isSupervisorOrAbove == false)
    }

    @Test func contractorIsNotSupervisorOrAbove() {
        #expect(XappyUserRole.contractor.isSupervisorOrAbove == false)
    }

    @Test func supervisorIsSupervisorOrAbove() {
        #expect(XappyUserRole.supervisor.isSupervisorOrAbove == true)
    }

    @Test func siteManagerIsSupervisorOrAbove() {
        #expect(XappyUserRole.siteManager.isSupervisorOrAbove == true)
    }

    @Test func hseManagerIsSupervisorOrAbove() {
        #expect(XappyUserRole.hseManager.isSupervisorOrAbove == true)
    }

    @Test func hseOfficerIsSupervisorOrAbove() {
        #expect(XappyUserRole.hseOfficer.isSupervisorOrAbove == true)
    }

    @Test func adminIsSupervisorOrAbove() {
        #expect(XappyUserRole.admin.isSupervisorOrAbove == true)
    }

    @Test func superAdminIsSupervisorOrAbove() {
        #expect(XappyUserRole.superAdmin.isSupervisorOrAbove == true)
    }

    @Test func userRoleDisplayNames() {
        #expect(XappyUserRole.worker.displayName == "Worker")
        #expect(XappyUserRole.supervisor.displayName == "Supervisor")
        #expect(XappyUserRole.siteManager.displayName == "Site Manager")
        #expect(XappyUserRole.admin.displayName == "Admin")
    }

    @Test func userRoleRawValues() {
        #expect(XappyUserRole.worker.rawValue == "worker")
        #expect(XappyUserRole.contractor.rawValue == "contractor")
        #expect(XappyUserRole.supervisor.rawValue == "supervisor")
        #expect(XappyUserRole.superAdmin.rawValue == "super_admin")
    }
}
