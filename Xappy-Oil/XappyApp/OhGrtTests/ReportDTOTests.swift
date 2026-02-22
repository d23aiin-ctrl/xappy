//
//  ReportDTOTests.swift
//  OhGrtTests
//
//  Tests for Report DTO encode/decode
//

import Testing
import Foundation
@testable import OhGrt

struct ReportDTOTests {

    // Helper to create a custom date decoder
    private var dateDecoder: JSONDecoder {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .custom { decoder in
            let container = try decoder.singleValueContainer()
            let dateString = try container.decode(String.self)
            let formatter = ISO8601DateFormatter()
            formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let date = formatter.date(from: dateString) { return date }
            formatter.formatOptions = [.withInternetDateTime]
            if let date = formatter.date(from: dateString) { return date }
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "Cannot decode date")
        }
        return decoder
    }

    // MARK: - ReportDTO

    @Test func reportDTODecoding() throws {
        let json = """
        {
            "id": "rpt-1",
            "referenceNumber": "NM-2025-0042",
            "reportType": "near_miss",
            "title": "Slip hazard near platform",
            "description": "Oil spill noticed near platform 3",
            "status": "pending",
            "priority": "high",
            "reporterId": "user-1",
            "reporterName": "John Doe",
            "siteId": "site-1",
            "siteName": "Alpha Platform",
            "locationDescription": "Platform 3, Level 2",
            "createdAt": "2025-06-15T10:00:00Z"
        }
        """.data(using: .utf8)!

        let dto = try dateDecoder.decode(ReportDTO.self, from: json)

        #expect(dto.id == "rpt-1")
        #expect(dto.referenceNumber == "NM-2025-0042")
        #expect(dto.reportType == "near_miss")
        #expect(dto.title == "Slip hazard near platform")
        #expect(dto.status == "pending")
        #expect(dto.priority == "high")
        #expect(dto.reporterName == "John Doe")
    }

    @Test func reportDTOMinimalFields() throws {
        let json = """
        {
            "id": "rpt-2",
            "referenceNumber": "INC-2025-0001",
            "reportType": "incident",
            "title": "Minor incident",
            "status": "open",
            "createdAt": "2025-06-15T10:00:00Z"
        }
        """.data(using: .utf8)!

        let dto = try dateDecoder.decode(ReportDTO.self, from: json)

        #expect(dto.id == "rpt-2")
        #expect(dto.description == nil)
        #expect(dto.priority == nil)
        #expect(dto.reporterId == nil)
        #expect(dto.updatedAt == nil)
    }

    // MARK: - ReportsListResponseDTO

    @Test func reportsListResponseDecoding() throws {
        let json = """
        {
            "items": [
                {
                    "id": "rpt-1",
                    "referenceNumber": "NM-001",
                    "reportType": "near_miss",
                    "title": "Test",
                    "status": "pending",
                    "createdAt": "2025-06-15T10:00:00Z"
                }
            ],
            "total": 25,
            "page": 1,
            "pageSize": 20,
            "totalPages": 2
        }
        """.data(using: .utf8)!

        let dto = try dateDecoder.decode(ReportsListResponseDTO.self, from: json)

        #expect(dto.items.count == 1)
        #expect(dto.total == 25)
        #expect(dto.page == 1)
        #expect(dto.pageSize == 20)
        #expect(dto.totalPages == 2)
    }

    // MARK: - ReportsQueryDTO

    @Test func reportsQueryDTOEncoding() throws {
        let query = ReportsQueryDTO(
            page: 2,
            pageSize: 10,
            reportType: "near_miss",
            status: "pending",
            siteId: "site-1"
        )
        let data = try JSONEncoder().encode(query)
        let json = try JSONSerialization.jsonObject(with: data) as! [String: Any]

        #expect(json["page"] as? Int == 2)
        #expect(json["pageSize"] as? Int == 10)
        #expect(json["reportType"] as? String == "near_miss")
        #expect(json["status"] as? String == "pending")
        #expect(json["siteId"] as? String == "site-1")
    }

    @Test func reportsQueryDTOWithDateFilter() throws {
        let dateFrom = ISO8601DateFormatter().date(from: "2025-01-01T00:00:00Z")!
        let dateTo = ISO8601DateFormatter().date(from: "2025-06-30T23:59:59Z")!

        let query = ReportsQueryDTO(dateFrom: dateFrom, dateTo: dateTo)
        let data = try JSONEncoder().encode(query)
        let json = try JSONSerialization.jsonObject(with: data) as! [String: Any]

        #expect(json["dateFrom"] as? String != nil)
        #expect(json["dateTo"] as? String != nil)
    }

    @Test func reportsQueryDTODefaults() throws {
        let query = ReportsQueryDTO()
        let data = try JSONEncoder().encode(query)
        let json = try JSONSerialization.jsonObject(with: data) as! [String: Any]

        #expect(json["page"] as? Int == 1)
        #expect(json["pageSize"] as? Int == 20)
    }

    // MARK: - NearMissDetailsDTO

    @Test func nearMissDetailsDTODecoding() throws {
        let json = """
        {
            "category": "slip_trip",
            "potentialConsequence": "Injury",
            "rootCauses": ["wet_surface", "no_sign"],
            "correctiveActions": "Clean and place warning signs",
            "witnessNames": ["Alice", "Bob"]
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(NearMissDetailsDTO.self, from: json)

        #expect(dto.category == "slip_trip")
        #expect(dto.rootCauses?.count == 2)
        #expect(dto.witnessNames?.count == 2)
    }

    // MARK: - IncidentDetailsDTO

    @Test func incidentDetailsDTODecoding() throws {
        let json = """
        {
            "incidentType": "fall",
            "severity": "moderate",
            "injuryType": "fracture",
            "propertyDamage": false,
            "emergencyResponseCalled": true,
            "investigationStatus": "in_progress"
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(IncidentDetailsDTO.self, from: json)

        #expect(dto.incidentType == "fall")
        #expect(dto.severity == "moderate")
        #expect(dto.propertyDamage == false)
        #expect(dto.emergencyResponseCalled == true)
    }

    // MARK: - SpillDetailsDTO

    @Test func spillDetailsDTODecoding() throws {
        let json = """
        {
            "material": "Crude Oil",
            "materialType": "hydrocarbon",
            "volumeEstimate": "50",
            "volumeUnit": "liters",
            "isContained": true,
            "containmentMethod": "absorbent pads",
            "cleanupStatus": "in_progress",
            "regulatoryNotificationRequired": true
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(SpillDetailsDTO.self, from: json)

        #expect(dto.material == "Crude Oil")
        #expect(dto.isContained == true)
        #expect(dto.regulatoryNotificationRequired == true)
    }

    // MARK: - SupervisorStatsDTO

    @Test func supervisorStatsDTODecoding() throws {
        let json = """
        {
            "totalReports": 150,
            "pendingAcknowledgment": 12,
            "underInvestigation": 5,
            "closedToday": 3,
            "reportsByType": [
                {"reportType": "near_miss", "count": 80},
                {"reportType": "incident", "count": 30}
            ],
            "recentActivity": []
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(SupervisorStatsDTO.self, from: json)

        #expect(dto.totalReports == 150)
        #expect(dto.pendingAcknowledgment == 12)
        #expect(dto.reportsByType.count == 2)
        #expect(dto.reportsByType.first?.count == 80)
    }

    // MARK: - HSEStatsDTO

    @Test func hseStatsDTODecoding() throws {
        let json = """
        {
            "totalReportsThisMonth": 45,
            "nearMissCount": 20,
            "incidentCount": 10,
            "spillCount": 5,
            "trifr": 2.5,
            "ltifr": 0.8,
            "safetyScore": 92.5,
            "complianceRate": 95.0,
            "siteBreakdown": [
                {
                    "siteId": "site-1",
                    "siteName": "Alpha",
                    "totalReports": 20,
                    "openReports": 5,
                    "complianceRate": 98.0
                }
            ]
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(HSEStatsDTO.self, from: json)

        #expect(dto.totalReportsThisMonth == 45)
        #expect(dto.nearMissCount == 20)
        #expect(dto.trifr == 2.5)
        #expect(dto.safetyScore == 92.5)
        #expect(dto.siteBreakdown.count == 1)
    }

    // MARK: - TrendDataPointDTO

    @Test func trendDataPointDTODecoding() throws {
        let json = """
        {
            "date": "2025-06-01",
            "nearMiss": 5,
            "incidents": 2,
            "spills": 1,
            "inspections": 3
        }
        """.data(using: .utf8)!

        let dto = try JSONDecoder().decode(TrendDataPointDTO.self, from: json)

        #expect(dto.date == "2025-06-01")
        #expect(dto.nearMiss == 5)
        #expect(dto.incidents == 2)
        #expect(dto.spills == 1)
        #expect(dto.inspections == 3)
    }

    // MARK: - LocationCoordinatesDTO

    @Test func locationCoordinatesDTORoundTrip() throws {
        let original = LocationCoordinatesDTO(latitude: 25.276987, longitude: 55.296249)
        let data = try JSONEncoder().encode(original)
        let decoded = try JSONDecoder().decode(LocationCoordinatesDTO.self, from: data)

        #expect(decoded.latitude == 25.276987)
        #expect(decoded.longitude == 55.296249)
    }
}
