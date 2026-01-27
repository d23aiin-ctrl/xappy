//
//  AnalyticsViewModel.swift
//  XappyAI
//
//  XAPPY AI - Oil & Gas Safety Compliance Platform
//  ViewModel for safety analytics dashboard
//

import SwiftUI
import Charts
import Combine

// MARK: - Time Range

enum AnalyticsTimeRange: String, CaseIterable, Identifiable {
    case today = "today"
    case last7Days = "last_7_days"
    case last30Days = "last_30_days"
    case last90Days = "last_90_days"
    case thisMonth = "this_month"
    case thisQuarter = "this_quarter"
    case thisYear = "this_year"

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .today: return "Today"
        case .last7Days: return "Last 7 Days"
        case .last30Days: return "Last 30 Days"
        case .last90Days: return "Last 90 Days"
        case .thisMonth: return "This Month"
        case .thisQuarter: return "This Quarter"
        case .thisYear: return "This Year"
        }
    }

    var shortName: String {
        switch self {
        case .today: return "1D"
        case .last7Days: return "7D"
        case .last30Days: return "30D"
        case .last90Days: return "90D"
        case .thisMonth: return "MTD"
        case .thisQuarter: return "QTD"
        case .thisYear: return "YTD"
        }
    }
}

// MARK: - Data Models

struct SafetyKPIData: Codable {
    let trifr: Double
    let ltifr: Double
    let dartRate: Double
    let totalReports: Int
    let nearMisses: Int
    let incidents: Int
    let spills: Int
    let pendingCount: Int
    let inProgressCount: Int
    let closedCount: Int
    let nearMissRate: Double
    let reportingRate: Double
    let avgResolutionTimeHours: Double
    let avgAcknowledgmentTimeHours: Double
    let trendDirection: String
    let trendPercentage: Double

    enum CodingKeys: String, CodingKey {
        case trifr, ltifr
        case dartRate = "dart_rate"
        case totalReports = "total_reports"
        case nearMisses = "near_misses"
        case incidents, spills
        case pendingCount = "pending_count"
        case inProgressCount = "in_progress_count"
        case closedCount = "closed_count"
        case nearMissRate = "near_miss_rate"
        case reportingRate = "reporting_rate"
        case avgResolutionTimeHours = "avg_resolution_time_hours"
        case avgAcknowledgmentTimeHours = "avg_acknowledgment_time_hours"
        case trendDirection = "trend_direction"
        case trendPercentage = "trend_percentage"
    }
}

struct CategoryBreakdownData: Codable, Identifiable {
    let reportType: String
    let count: Int
    let percentage: Double
    let trend: String

    var id: String { reportType }

    enum CodingKeys: String, CodingKey {
        case reportType = "report_type"
        case count, percentage, trend
    }

    var displayName: String {
        reportType.replacingOccurrences(of: "_", with: " ").capitalized
    }

    var color: Color {
        switch reportType {
        case "near_miss": return .orange
        case "incident": return .red
        case "spill_report": return .purple
        case "shift_handover": return .blue
        case "toolbox_talk": return .green
        case "ptw_evidence": return .indigo
        case "loto_evidence": return .cyan
        case "inspection": return .teal
        case "daily_safety_log": return .gray
        default: return .secondary
        }
    }
}

struct TrendDataPoint: Codable, Identifiable {
    let date: String
    let value: Double
    let label: String?

    var id: String { date }

    var dateValue: Date {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withFullDate]
        return formatter.date(from: date) ?? Date()
    }
}

struct AnalyticsDashboardData: Codable {
    let kpis: SafetyKPIData
    let categoryBreakdown: [CategoryBreakdownData]
    let statusDistribution: [String: Int]
    let priorityDistribution: [String: Int]
    let recentTrend: [TrendDataPoint]

    enum CodingKeys: String, CodingKey {
        case kpis
        case categoryBreakdown = "category_breakdown"
        case statusDistribution = "status_distribution"
        case priorityDistribution = "priority_distribution"
        case recentTrend = "recent_trend"
    }
}

struct SiteComparisonData: Codable, Identifiable {
    let siteId: String
    let siteName: String
    let totalReports: Int
    let nearMisses: Int
    let incidents: Int
    let trifr: Double
    let complianceScore: Double

    var id: String { siteId }

    enum CodingKeys: String, CodingKey {
        case siteId = "site_id"
        case siteName = "site_name"
        case totalReports = "total_reports"
        case nearMisses = "near_misses"
        case incidents, trifr
        case complianceScore = "compliance_score"
    }
}

struct TopReporterData: Codable, Identifiable {
    let userId: String
    let name: String
    let reportCount: Int

    var id: String { userId }

    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
        case name
        case reportCount = "report_count"
    }
}

// MARK: - ViewModel

@MainActor
class AnalyticsViewModel: ObservableObject {
    // MARK: - Published Properties

    @Published var selectedTimeRange: AnalyticsTimeRange = .last30Days
    @Published var selectedSiteId: String? = nil

    @Published var dashboardData: AnalyticsDashboardData?
    @Published var siteComparisons: [SiteComparisonData] = []
    @Published var topReporters: [TopReporterData] = []

    @Published var isLoading = false
    @Published var isExporting = false
    @Published var errorMessage: String?

    // MARK: - Computed Properties

    var kpis: SafetyKPIData? { dashboardData?.kpis }

    var trendIsPositive: Bool {
        guard let trend = kpis?.trendDirection else { return false }
        // For safety, "down" trend in incidents is positive
        return trend == "down" || trend == "stable"
    }

    var categoryBreakdown: [CategoryBreakdownData] {
        dashboardData?.categoryBreakdown ?? []
    }

    var trendData: [TrendDataPoint] {
        dashboardData?.recentTrend ?? []
    }

    var statusData: [(String, Int)] {
        guard let dist = dashboardData?.statusDistribution else { return [] }
        return dist.sorted { $0.value > $1.value }
    }

    var complianceScore: Double {
        guard let kpis = kpis else { return 0 }
        let total = kpis.totalReports
        if total == 0 { return 100 }
        return Double(kpis.closedCount) / Double(total) * 100
    }

    // MARK: - API Client

    private let apiClient = APIClient.shared

    // MARK: - Data Loading

    func loadDashboard() async {
        isLoading = true
        errorMessage = nil

        do {
            // Load dashboard data
            let data: AnalyticsDashboardData = try await apiClient.request(
                endpoint: .analyticsDashboard(timeRange: selectedTimeRange.rawValue)
            )
            dashboardData = data

            // Load additional data in parallel
            async let comparisons = loadSiteComparisons()
            async let reporters = loadTopReporters()

            siteComparisons = await comparisons
            topReporters = await reporters

        } catch {
            errorMessage = "Failed to load analytics: \(error.localizedDescription)"
        }

        isLoading = false
    }

    private func loadSiteComparisons() async -> [SiteComparisonData] {
        do {
            return try await apiClient.request(
                endpoint: .analyticsSiteComparison(timeRange: selectedTimeRange.rawValue)
            )
        } catch {
            return []
        }
    }

    private func loadTopReporters() async -> [TopReporterData] {
        do {
            return try await apiClient.request(
                endpoint: .analyticsTopReporters(timeRange: selectedTimeRange.rawValue, limit: 5)
            )
        } catch {
            return []
        }
    }

    // MARK: - Export Functions

    func exportCSV() async -> URL? {
        isExporting = true
        defer { isExporting = false }

        do {
            let data = try await apiClient.downloadData(
                endpoint: .analyticsExportCSV(timeRange: selectedTimeRange.rawValue)
            )

            // Save to temp file
            let filename = "safety_reports_\(Date().formatted(.iso8601.dateSeparator(.dash))).csv"
            let url = FileManager.default.temporaryDirectory.appendingPathComponent(filename)
            try data.write(to: url)

            return url
        } catch {
            errorMessage = "Export failed: \(error.localizedDescription)"
            return nil
        }
    }

    func exportExcel() async -> URL? {
        isExporting = true
        defer { isExporting = false }

        do {
            let data = try await apiClient.downloadData(
                endpoint: .analyticsExportExcel(timeRange: selectedTimeRange.rawValue)
            )

            let filename = "safety_reports_\(Date().formatted(.iso8601.dateSeparator(.dash))).xlsx"
            let url = FileManager.default.temporaryDirectory.appendingPathComponent(filename)
            try data.write(to: url)

            return url
        } catch {
            errorMessage = "Export failed: \(error.localizedDescription)"
            return nil
        }
    }

    func exportAuditPack() async -> URL? {
        isExporting = true
        defer { isExporting = false }

        do {
            let data = try await apiClient.downloadData(
                endpoint: .analyticsExportAuditPack(timeRange: selectedTimeRange.rawValue)
            )

            let filename = "safety_audit_pack_\(Date().formatted(.iso8601.dateSeparator(.dash))).pdf"
            let url = FileManager.default.temporaryDirectory.appendingPathComponent(filename)
            try data.write(to: url)

            return url
        } catch {
            errorMessage = "Export failed: \(error.localizedDescription)"
            return nil
        }
    }
}
