import Foundation

/// HTTP methods
enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case delete = "DELETE"
}

/// JanSeva API endpoint definitions (updated for backend compatibility)
enum APIEndpoint {
    // Auth - Phone+OTP login
    case login
    case otpSend
    case otpVerify
    case refreshToken
    case logout
    case me
    case updateProfile
    case register

    // Agent/Chat
    case agentChat
    case agentConversations
    case agentConversationMessages(conversationId: String)
    case agentConversationClose(conversationId: String)

    // Safety Reports
    case safetyReports
    case safetyReportsMy
    case safetyReportsPending
    case safetyReport(id: String)
    case createSafetyReport
    case acknowledgeReport(id: String)
    case closeReport(id: String)
    case escalateReport(id: String)
    case assignReport(id: String)
    case reportTimeline(id: String)
    case safetyReportsDashboard
    case safetyReportsSummary

    // Chat
    case chatSend
    case chatHistory(conversationId: String)
    case chatClassify
    case chatDemo
    case chatDemoSession(sessionId: String)

    // Dashboard/Stats
    case dashboardStats
    case safetyAnalyticsDashboard
    case safetyAnalyticsTrends
    case safetyAnalyticsKpis

    // Sites & Users
    case sites
    case sitesMy
    case site(id: String)
    case siteWorkers(siteId: String)
    case users
    case user(id: String)

    // Approvals
    case approvalsPending
    case approvalAcknowledge(reportId: String)
    case approvalClose(reportId: String)
    case approvalEscalate(reportId: String)
    case approvalHistory(reportId: String)

    // Health check
    case health

    // Safety Analytics
    case analyticsDashboard(timeRange: String)
    case analyticsSiteComparison(timeRange: String)
    case analyticsTopReporters(timeRange: String, limit: Int)
    case analyticsExportCSV(timeRange: String)
    case analyticsExportExcel(timeRange: String)
    case analyticsExportAuditPack(timeRange: String)
    case analyticsBreakdownType
    case analyticsBreakdownStatus
    case analyticsBreakdownPriority

    var path: String {
        let apiPrefix = AppConfig.shared.apiVersion

        switch self {
        // Auth
        case .login:
            return "\(apiPrefix)/auth/badge-login"
        case .otpSend:
            return "\(apiPrefix)/auth/otp/send"
        case .otpVerify:
            return "\(apiPrefix)/auth/otp/verify"
        case .refreshToken:
            return "\(apiPrefix)/auth/refresh"
        case .logout:
            return "\(apiPrefix)/auth/logout"
        case .me:
            return "\(apiPrefix)/users/me"
        case .updateProfile:
            return "\(apiPrefix)/users/me"
        case .register:
            return "\(apiPrefix)/auth/register"

        // Agent/Chat
        case .agentChat:
            return "\(apiPrefix)/agent/chat"
        case .agentConversations:
            return "\(apiPrefix)/agent/conversations"
        case .agentConversationMessages(let conversationId):
            return "\(apiPrefix)/agent/conversations/\(conversationId)/messages"
        case .agentConversationClose(let conversationId):
            return "\(apiPrefix)/agent/conversations/\(conversationId)/close"

        // Safety Reports
        case .safetyReports, .createSafetyReport:
            return "\(apiPrefix)/safety-reports"
        case .safetyReportsMy:
            return "\(apiPrefix)/safety-reports/my"
        case .safetyReportsPending:
            return "\(apiPrefix)/safety-reports/pending"
        case .safetyReport(let id):
            return "\(apiPrefix)/safety-reports/\(id)"
        case .acknowledgeReport(let id):
            return "\(apiPrefix)/safety-reports/\(id)/acknowledge"
        case .closeReport(let id):
            return "\(apiPrefix)/safety-reports/\(id)/close"
        case .escalateReport(let id):
            return "\(apiPrefix)/safety-reports/\(id)/escalate"
        case .assignReport(let id):
            return "\(apiPrefix)/safety-reports/\(id)/assign"
        case .reportTimeline(let id):
            return "\(apiPrefix)/safety-reports/\(id)/timeline"
        case .safetyReportsDashboard:
            return "\(apiPrefix)/safety-reports/stats/dashboard"
        case .safetyReportsSummary:
            return "\(apiPrefix)/safety-reports/stats/summary"

        // Chat
        case .chatSend:
            return "\(apiPrefix)/chat/send"
        case .chatHistory(let conversationId):
            return "\(apiPrefix)/chat/history/\(conversationId)"
        case .chatClassify:
            return "\(apiPrefix)/chat/classify"
        case .chatDemo:
            return "\(apiPrefix)/chat/demo"
        case .chatDemoSession(let sessionId):
            return "\(apiPrefix)/chat/demo/\(sessionId)"

        // Dashboard/Stats
        case .dashboardStats:
            return "\(apiPrefix)/users/me/stats"
        case .safetyAnalyticsDashboard:
            return "\(apiPrefix)/safety-analytics/dashboard"
        case .safetyAnalyticsTrends:
            return "\(apiPrefix)/safety-analytics/trends"
        case .safetyAnalyticsKpis:
            return "\(apiPrefix)/safety-analytics/kpis"

        // Sites & Users
        case .sites:
            return "\(apiPrefix)/sites"
        case .sitesMy:
            return "\(apiPrefix)/sites/my/site"
        case .site(let id):
            return "\(apiPrefix)/sites/\(id)"
        case .siteWorkers(let siteId):
            return "\(apiPrefix)/sites/\(siteId)/workers"
        case .users:
            return "\(apiPrefix)/users"
        case .user(let id):
            return "\(apiPrefix)/users/\(id)"

        // Approvals
        case .approvalsPending:
            return "\(apiPrefix)/approvals/pending"
        case .approvalAcknowledge(let reportId):
            return "\(apiPrefix)/approvals/\(reportId)/acknowledge"
        case .approvalClose(let reportId):
            return "\(apiPrefix)/approvals/\(reportId)/close"
        case .approvalEscalate(let reportId):
            return "\(apiPrefix)/approvals/\(reportId)/escalate"
        case .approvalHistory(let reportId):
            return "\(apiPrefix)/approvals/\(reportId)/history"

        // Health
        case .health:
            return "\(apiPrefix)/health"

        // Safety Analytics
        case .analyticsDashboard(let timeRange):
            return "\(apiPrefix)/safety-analytics/dashboard?time_range=\(timeRange)"
        case .analyticsSiteComparison(let timeRange):
            return "\(apiPrefix)/safety-analytics/sites/comparison?time_range=\(timeRange)"
        case .analyticsTopReporters(let timeRange, let limit):
            return "\(apiPrefix)/safety-analytics/reporters/top?time_range=\(timeRange)&limit=\(limit)"
        case .analyticsExportCSV(let timeRange):
            return "\(apiPrefix)/safety-analytics/export/csv?time_range=\(timeRange)"
        case .analyticsExportExcel(let timeRange):
            return "\(apiPrefix)/safety-analytics/export/excel?time_range=\(timeRange)"
        case .analyticsExportAuditPack(let timeRange):
            return "\(apiPrefix)/safety-analytics/export/audit-pack?time_range=\(timeRange)"
        case .analyticsBreakdownType:
            return "\(apiPrefix)/safety-analytics/breakdown/type"
        case .analyticsBreakdownStatus:
            return "\(apiPrefix)/safety-analytics/breakdown/status"
        case .analyticsBreakdownPriority:
            return "\(apiPrefix)/safety-analytics/breakdown/priority"
        }
    }

    var method: HTTPMethod {
        switch self {
        // POST endpoints
        case .login, .otpSend, .otpVerify, .refreshToken, .logout, .register,
             .createSafetyReport, .chatSend, .chatClassify, .chatDemo, .chatDemoSession,
             .agentChat, .agentConversationClose,
             .acknowledgeReport, .closeReport, .escalateReport, .assignReport,
             .approvalAcknowledge, .approvalClose, .approvalEscalate:
            return .post

        // PUT endpoints
        case .updateProfile:
            return .put

        // GET endpoints (default)
        case .me, .safetyReports, .safetyReportsMy, .safetyReportsPending,
             .safetyReport, .reportTimeline, .safetyReportsDashboard, .safetyReportsSummary,
             .chatHistory,
             .agentConversations, .agentConversationMessages,
             .dashboardStats, .safetyAnalyticsDashboard, .safetyAnalyticsTrends, .safetyAnalyticsKpis,
             .sites, .sitesMy, .site, .siteWorkers, .users, .user,
             .approvalsPending, .approvalHistory,
             .health,
             .analyticsDashboard, .analyticsSiteComparison, .analyticsTopReporters,
             .analyticsExportCSV, .analyticsExportExcel, .analyticsExportAuditPack,
             .analyticsBreakdownType, .analyticsBreakdownStatus, .analyticsBreakdownPriority:
            return .get
        }
    }

    var requiresAuth: Bool {
        switch self {
        case .login, .otpSend, .otpVerify, .register, .health,
             .chatDemo, .chatDemoSession:
            return false
        default:
            return true
        }
    }
}

// MARK: - Report Type Enum

enum XappyReportType: String, CaseIterable {
    case nearMiss = "near_miss"
    case incident = "incident"
    case dailySafetyLog = "daily_safety_log"
    case shiftHandover = "shift_handover"
    case toolboxTalk = "toolbox_talk"
    case ptwEvidence = "ptw_evidence"
    case lotoEvidence = "loto_evidence"
    case spillReport = "spill_report"
    case inspection = "inspection"

    var displayName: String {
        switch self {
        case .nearMiss: return "Near-Miss"
        case .incident: return "Incident"
        case .dailySafetyLog: return "Daily Safety Log"
        case .shiftHandover: return "Shift Handover"
        case .toolboxTalk: return "Toolbox Talk"
        case .ptwEvidence: return "PTW Evidence"
        case .lotoEvidence: return "LOTO Evidence"
        case .spillReport: return "Spill Report"
        case .inspection: return "Inspection"
        }
    }

    var icon: String {
        switch self {
        case .nearMiss: return "exclamationmark.triangle"
        case .incident: return "flame"
        case .dailySafetyLog: return "calendar"
        case .shiftHandover: return "arrow.left.arrow.right"
        case .toolboxTalk: return "person.3"
        case .ptwEvidence: return "doc.badge.gearshape"
        case .lotoEvidence: return "lock.shield"
        case .spillReport: return "drop.triangle"
        case .inspection: return "magnifyingglass"
        }
    }
}

// MARK: - User Roles

enum XappyUserRole: String, CaseIterable {
    case worker = "worker"
    case contractor = "contractor"
    case supervisor = "supervisor"
    case siteManager = "site_manager"
    case hseManager = "hse_manager"
    case hseOfficer = "hse_officer"
    case complianceOfficer = "compliance_officer"
    case operationsDirector = "operations_director"
    case admin = "admin"
    case superAdmin = "super_admin"

    var displayName: String {
        switch self {
        case .worker: return "Worker"
        case .contractor: return "Contractor"
        case .supervisor: return "Supervisor"
        case .siteManager: return "Site Manager"
        case .hseManager: return "HSE Manager"
        case .hseOfficer: return "HSE Officer"
        case .complianceOfficer: return "Compliance Officer"
        case .operationsDirector: return "Operations Director"
        case .admin: return "Admin"
        case .superAdmin: return "Super Admin"
        }
    }

    var isSupervisorOrAbove: Bool {
        switch self {
        case .worker, .contractor:
            return false
        default:
            return true
        }
    }
}
