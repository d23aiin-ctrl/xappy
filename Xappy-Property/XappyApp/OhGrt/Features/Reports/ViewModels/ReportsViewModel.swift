//
//  ReportsViewModel.swift
//  XappyAI
//
//  XAPPY AI - Oil & Gas Safety Compliance Platform
//  ViewModel for Reports List
//

import Foundation
import SwiftUI
import Combine
import os.log

private let logger = Logger(subsystem: "com.xappy.ai", category: "ReportsViewModel")

@MainActor
final class ReportsViewModel: ObservableObject {
    // MARK: - Published Properties

    @Published var reports: [ReportItem] = []
    @Published var isLoading = false
    @Published var isLoadingMore = false
    @Published var errorMessage: String?
    @Published var selectedReportType: XappyReportType?
    @Published var selectedStatus: ReportStatus?
    @Published var searchText = ""

    // Stats
    @Published var totalReports = 0
    @Published var pendingCount = 0
    @Published var inProgressCount = 0
    @Published var closedCount = 0

    // Pagination
    private var currentPage = 1
    private var totalPages = 1
    private var hasMorePages: Bool { currentPage < totalPages }

    // MARK: - Filtered Reports

    var filteredReports: [ReportItem] {
        var filtered = reports

        if let reportType = selectedReportType {
            filtered = filtered.filter { $0.reportType == reportType }
        }

        if let status = selectedStatus {
            filtered = filtered.filter { $0.status == status }
        }

        if !searchText.isEmpty {
            filtered = filtered.filter {
                $0.title.localizedCaseInsensitiveContains(searchText) ||
                $0.referenceNumber.localizedCaseInsensitiveContains(searchText) ||
                ($0.reporterName?.localizedCaseInsensitiveContains(searchText) ?? false)
            }
        }

        return filtered
    }

    // MARK: - Load Reports

    func loadReports() async {
        guard !isLoading else { return }

        isLoading = true
        errorMessage = nil
        currentPage = 1

        // Safety reports feature not available in JanSeva
        // Use mock data for demonstration
        loadMockData()
        logger.info("Loaded \(self.reports.count) mock reports (JanSeva mode)")
        isLoading = false
    }

    func loadMoreReportsIfNeeded(currentItem: ReportItem) async {
        // Safety reports feature not available in JanSeva - no pagination needed for mock data
    }

    // MARK: - Report Actions

    func acknowledgeReport(_ report: ReportItem, notes: String? = nil) async -> Bool {
        // Safety reports feature not available in JanSeva - update local state only
        if let index = reports.firstIndex(where: { $0.id == report.id }) {
            reports[index] = ReportItem(
                id: reports[index].id,
                referenceNumber: reports[index].referenceNumber,
                reportType: reports[index].reportType,
                title: reports[index].title,
                description: reports[index].description,
                status: .acknowledged,
                reporterName: reports[index].reporterName,
                siteName: reports[index].siteName,
                reportedAt: reports[index].reportedAt,
                locationDescription: reports[index].locationDescription
            )
        }

        updateStats()
        logger.info("Acknowledged report (local): \(report.referenceNumber)")
        return true
    }

    func closeReport(_ report: ReportItem, resolution: String, notes: String? = nil) async -> Bool {
        // Safety reports feature not available in JanSeva - update local state only
        if let index = reports.firstIndex(where: { $0.id == report.id }) {
            reports[index] = ReportItem(
                id: reports[index].id,
                referenceNumber: reports[index].referenceNumber,
                reportType: reports[index].reportType,
                title: reports[index].title,
                description: reports[index].description,
                status: .closed,
                reporterName: reports[index].reporterName,
                siteName: reports[index].siteName,
                reportedAt: reports[index].reportedAt,
                locationDescription: reports[index].locationDescription
            )
        }

        updateStats()
        logger.info("Closed report (local): \(report.referenceNumber)")
        return true
    }

    // MARK: - Filter Actions

    func clearFilters() {
        selectedReportType = nil
        selectedStatus = nil
        searchText = ""
    }

    // MARK: - Private Methods

    private func updateStats() {
        pendingCount = reports.filter { $0.status == .submitted }.count
        inProgressCount = reports.filter { $0.status == .underInvestigation || $0.status == .correctiveAction }.count
        closedCount = reports.filter { $0.status == .closed }.count
    }

    private func loadMockData() {
        reports = [
            ReportItem(
                id: "1",
                referenceNumber: "XP-NM-20260102-0001",
                reportType: .nearMiss,
                title: "Scaffolding near collapse",
                description: "Noticed scaffolding on Platform B was swaying excessively during high winds",
                status: .submitted,
                reporterName: "Rajesh Kumar",
                siteName: "Mumbai Refinery",
                reportedAt: Date(),
                locationDescription: "Platform B - North Tower"
            ),
            ReportItem(
                id: "2",
                referenceNumber: "XP-INC-20260102-0001",
                reportType: .incident,
                title: "Minor hand injury",
                description: "Worker received minor cut while handling equipment without proper PPE",
                status: .acknowledged,
                reporterName: "Amit Sharma",
                siteName: "Mumbai Refinery",
                reportedAt: Date().addingTimeInterval(-3600),
                locationDescription: "Workshop Area A"
            ),
            ReportItem(
                id: "3",
                referenceNumber: "XP-SP-20260102-0001",
                reportType: .spillReport,
                title: "Oil leak from pipe",
                description: "Small oil leak detected from pipe joint in tank farm area",
                status: .underInvestigation,
                reporterName: "Priya Patel",
                siteName: "Mumbai Refinery",
                reportedAt: Date().addingTimeInterval(-7200),
                locationDescription: "Tank Farm Section C"
            ),
            ReportItem(
                id: "4",
                referenceNumber: "XP-TT-20260101-0001",
                reportType: .toolboxTalk,
                title: "Heat stress awareness",
                description: "Morning toolbox talk on heat stress prevention and hydration",
                status: .closed,
                reporterName: "Suresh Menon",
                siteName: "Mumbai Refinery",
                reportedAt: Date().addingTimeInterval(-86400),
                locationDescription: "Main Office - Conference Room"
            ),
            ReportItem(
                id: "5",
                referenceNumber: "XP-SH-20260101-0001",
                reportType: .shiftHandover,
                title: "Night shift handover",
                description: "All operations normal. Pending maintenance on Pump P-204.",
                status: .closed,
                reporterName: "Vikram Singh",
                siteName: "Mumbai Refinery",
                reportedAt: Date().addingTimeInterval(-43200),
                locationDescription: "Control Room"
            )
        ]

        totalReports = reports.count
        updateStats()
    }
}

// MARK: - ReportItem Extension

extension ReportItem {
    /// Create from DTO
    init(from dto: ReportDTO) {
        self.id = dto.id
        self.referenceNumber = dto.referenceNumber
        self.reportType = XappyReportType(rawValue: dto.reportType) ?? .nearMiss
        self.title = dto.title
        self.description = dto.description ?? ""
        self.status = ReportStatus(rawValue: dto.status) ?? .submitted
        self.reporterName = dto.reporterName
        self.siteName = dto.siteName
        self.reportedAt = dto.createdAt
        self.locationDescription = dto.locationDescription
    }
}
