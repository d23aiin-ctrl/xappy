//
//  ReportDTO.swift
//  XappyAI
//
//  XAPPY AI - Oil & Gas Safety Compliance Platform
//  Report Data Transfer Objects
//

import Foundation

// MARK: - Report Response DTOs

/// Base report DTO from API
struct ReportDTO: Codable {
    let id: String
    let referenceNumber: String
    let reportType: String
    let title: String
    let description: String?
    let status: String
    let priority: String?
    let reporterId: String?
    let reporterName: String?
    let siteId: String?
    let siteName: String?
    let locationDescription: String?
    let locationCoordinates: LocationCoordinatesDTO?
    let createdAt: Date
    let updatedAt: Date?
    let resolvedAt: Date?
    let acknowledgedAt: Date?
    let acknowledgedBy: String?
}

/// Location coordinates
struct LocationCoordinatesDTO: Codable {
    let latitude: Double
    let longitude: Double
}

/// Paginated reports response
struct ReportsListResponseDTO: Codable {
    let items: [ReportDTO]
    let total: Int
    let page: Int
    let pageSize: Int
    let totalPages: Int
}

/// Report detail response with extended info
struct ReportDetailDTO: Codable {
    let id: String
    let referenceNumber: String
    let reportType: String
    let title: String
    let description: String?
    let status: String
    let priority: String?
    let reporterId: String?
    let reporterName: String?
    let reporterBadge: String?
    let siteId: String?
    let siteName: String?
    let locationDescription: String?
    let locationCoordinates: LocationCoordinatesDTO?
    let attachments: [AttachmentDTO]?
    let timeline: [TimelineEventDTO]?
    let createdAt: Date
    let updatedAt: Date?
    let resolvedAt: Date?
    let acknowledgedAt: Date?
    let acknowledgedBy: String?
    let closedAt: Date?
    let closedBy: String?

    // Type-specific details (optional based on report type)
    let nearMissDetails: NearMissDetailsDTO?
    let incidentDetails: IncidentDetailsDTO?
    let spillDetails: SpillDetailsDTO?
    let handoverDetails: HandoverDetailsDTO?
    let toolboxDetails: ToolboxDetailsDTO?
}

/// Media attachment
struct AttachmentDTO: Codable {
    let id: String
    let fileName: String
    let fileType: String
    let fileUrl: String
    let fileSize: Int?
    let uploadedAt: Date
}

/// Timeline/audit event
struct TimelineEventDTO: Codable {
    let id: String
    let action: String
    let description: String
    let performedBy: String?
    let performedByName: String?
    let timestamp: Date
    let notes: String?
}

// MARK: - Report Type-Specific Details

/// Near-miss report details
struct NearMissDetailsDTO: Codable {
    let category: String?
    let potentialConsequence: String?
    let rootCauses: [String]?
    let correctiveActions: String?
    let witnessNames: [String]?
}

/// Incident report details
struct IncidentDetailsDTO: Codable {
    let incidentType: String?
    let severity: String?
    let injuryType: String?
    let injuredPersons: [InjuredPersonDTO]?
    let propertyDamage: Bool?
    let damageDescription: String?
    let emergencyResponseCalled: Bool?
    let investigationStatus: String?
}

/// Injured person details
struct InjuredPersonDTO: Codable {
    let name: String
    let badgeNumber: String?
    let injuryDescription: String?
    let treatmentProvided: String?
}

/// Spill report details
struct SpillDetailsDTO: Codable {
    let material: String?
    let materialType: String?
    let volumeEstimate: String?
    let volumeUnit: String?
    let isContained: Bool?
    let containmentMethod: String?
    let cleanupStatus: String?
    let environmentalImpact: String?
    let regulatoryNotificationRequired: Bool?
}

/// Shift handover details
struct HandoverDetailsDTO: Codable {
    let fromShift: String?
    let toShift: String?
    let outgoingSupervisor: String?
    let incomingSupervisor: String?
    let pendingTasks: [String]?
    let safetyIssues: [String]?
    let equipmentStatus: String?
    let voiceNoteUrl: String?
    let voiceNoteTranscript: String?
}

/// Toolbox talk details
struct ToolboxDetailsDTO: Codable {
    let topic: String?
    let duration: Int? // in minutes
    let attendeeCount: Int?
    let attendees: [AttendeeDTO]?
    let keyPoints: [String]?
    let questionsRaised: [String]?
}

/// Toolbox talk attendee
struct AttendeeDTO: Codable {
    let name: String
    let badgeNumber: String?
    let signatureUrl: String?
    let signedAt: Date?
}

// MARK: - Request DTOs

/// Report list query parameters
struct ReportsQueryDTO: Encodable {
    let page: Int?
    let pageSize: Int?
    let reportType: String?
    let status: String?
    let siteId: String?
    let dateFrom: String?
    let dateTo: String?
    let search: String?

    init(
        page: Int? = 1,
        pageSize: Int? = 20,
        reportType: String? = nil,
        status: String? = nil,
        siteId: String? = nil,
        dateFrom: Date? = nil,
        dateTo: Date? = nil,
        search: String? = nil
    ) {
        self.page = page
        self.pageSize = pageSize
        self.reportType = reportType
        self.status = status
        self.siteId = siteId

        let formatter = ISO8601DateFormatter()
        self.dateFrom = dateFrom.map { formatter.string(from: $0) }
        self.dateTo = dateTo.map { formatter.string(from: $0) }
        self.search = search
    }
}

/// Acknowledge report request
struct AcknowledgeReportRequestDTO: Encodable {
    let notes: String?
}

/// Close report request
struct CloseReportRequestDTO: Encodable {
    let resolution: String
    let notes: String?
}

/// Create near-miss report request
struct CreateNearMissRequestDTO: Encodable {
    let title: String
    let description: String
    let category: String?
    let locationDescription: String?
    let latitude: Double?
    let longitude: Double?
    let potentialConsequence: String?
    let equipmentInvolved: String?
    let immediateActions: String?
}

/// Create incident report request
struct CreateIncidentRequestDTO: Encodable {
    let title: String
    let description: String
    let locationDescription: String?
    let latitude: Double?
    let longitude: Double?
    let severity: String
    let incidentType: String?
    let injuries: String?
    let propertyDamage: String?
    let emergencyCalled: Bool
}

/// Create spill report request
struct CreateSpillRequestDTO: Encodable {
    let title: String
    let description: String
    let locationDescription: String?
    let latitude: Double?
    let longitude: Double?
    let material: String
    let materialType: String
    let volumeEstimate: String
    let isContained: Bool
    let containmentMethod: String?
}

/// Create shift handover request
struct CreateShiftHandoverRequestDTO: Encodable {
    let fromShift: String
    let toShift: String
    let pendingTasks: [String]
    let safetyIssues: [String]?
    let equipmentStatus: String?
    let watchpoints: [String]?
    let locationDescription: String?
}

/// Create toolbox talk request
struct CreateToolboxTalkRequestDTO: Encodable {
    let topic: String
    let durationMinutes: Int
    let keyPoints: [String]
    let attendeeCount: Int
    let questionsRaised: [String]?
    let locationDescription: String?
}

/// Create PTW evidence request
struct CreatePTWEvidenceRequestDTO: Encodable {
    let permitNumber: String
    let permitType: String
    let workDescription: String
    let isolationConfirmed: Bool
    let jobStatus: String
    let notes: String?
    let locationDescription: String?
}

/// Create LOTO evidence request
struct CreateLOTOEvidenceRequestDTO: Encodable {
    let tagNumber: String
    let equipmentName: String
    let isolationPoint: String
    let action: String
    let verifiedBy: String?
    let locationDescription: String?
}

/// Create inspection request
struct CreateInspectionRequestDTO: Encodable {
    let inspectionType: String
    let areaInspected: String
    let observations: [String]
    let defectsFound: [String]?
    let overallCondition: String
    let followUpRequired: Bool
    let locationDescription: String?
}

/// Create daily safety log request
struct CreateDailySafetyLogRequestDTO: Encodable {
    let title: String
    let description: String
    let hazardsIdentified: [String]?
    let ppeIssues: [String]?
    let observations: [String]?
    let locationDescription: String?
}

// MARK: - Dashboard Stats DTOs

/// Supervisor dashboard stats
struct SupervisorStatsDTO: Codable {
    let totalReports: Int
    let pendingAcknowledgment: Int
    let underInvestigation: Int
    let closedToday: Int
    let reportsByType: [ReportTypeCountDTO]
    let recentActivity: [RecentActivityDTO]
}

/// Report count by type
struct ReportTypeCountDTO: Codable {
    let reportType: String
    let count: Int
}

/// Recent activity item
struct RecentActivityDTO: Codable {
    let id: String
    let action: String
    let reportReference: String
    let reportType: String
    let performedBy: String?
    let timestamp: Date
}

// MARK: - HSE Dashboard DTOs

/// HSE dashboard stats
struct HSEStatsDTO: Codable {
    let totalReportsThisMonth: Int
    let nearMissCount: Int
    let incidentCount: Int
    let spillCount: Int
    let trifr: Double? // Total Recordable Injury Frequency Rate
    let ltifr: Double? // Lost Time Injury Frequency Rate
    let safetyScore: Double?
    let complianceRate: Double?
    let siteBreakdown: [SiteStatsDTO]
}

/// Stats by site
struct SiteStatsDTO: Codable {
    let siteId: String
    let siteName: String
    let totalReports: Int
    let openReports: Int
    let complianceRate: Double?
}

/// HSE trends data
struct HSETrendsDTO: Codable {
    let period: String
    let trends: [TrendDataPointDTO]
}

/// Trend data point
struct TrendDataPointDTO: Codable {
    let date: String
    let nearMiss: Int
    let incidents: Int
    let spills: Int
    let inspections: Int
}
