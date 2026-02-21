//
//  ReportsListView.swift
//  XappyAI
//
//  XAPPY AI - Oil & Gas Safety Compliance Platform
//  Reports list view for supervisors
//

import SwiftUI

/// Report model for display
struct ReportItem: Identifiable {
    let id: String
    let referenceNumber: String
    let reportType: XappyReportType
    let title: String
    let description: String
    let status: ReportStatus
    let reporterName: String?
    let siteName: String?
    let reportedAt: Date
    let locationDescription: String?
}

/// Report status enum
enum ReportStatus: String, CaseIterable {
    case submitted = "submitted"
    case acknowledged = "acknowledged"
    case underInvestigation = "under_investigation"
    case correctiveAction = "corrective_action"
    case closed = "closed"

    var displayName: String {
        switch self {
        case .submitted: return "Submitted"
        case .acknowledged: return "Acknowledged"
        case .underInvestigation: return "Under Investigation"
        case .correctiveAction: return "Corrective Action"
        case .closed: return "Closed"
        }
    }

    var color: Color {
        switch self {
        case .submitted: return .blue
        case .acknowledged: return .purple
        case .underInvestigation: return .yellow
        case .correctiveAction: return .orange
        case .closed: return .green
        }
    }

    var icon: String {
        switch self {
        case .submitted: return "doc.badge.plus"
        case .acknowledged: return "checkmark.circle"
        case .underInvestigation: return "magnifyingglass"
        case .correctiveAction: return "wrench.and.screwdriver"
        case .closed: return "checkmark.seal.fill"
        }
    }
}

/// Reports list view for supervisors
struct ReportsListView: View {
    @StateObject private var viewModel = ReportsViewModel()
    @State private var selectedReport: ReportItem?
    @State private var showingReportDetail = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Stats cards
                statsSection

                // Filter chips
                filterSection

                // Reports list
                if viewModel.isLoading && viewModel.reports.isEmpty {
                    loadingView
                } else if let error = viewModel.errorMessage, viewModel.reports.isEmpty {
                    errorView(error)
                } else if viewModel.filteredReports.isEmpty {
                    emptyStateView
                } else {
                    reportsList
                }
            }
            .navigationTitle("Safety Reports")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        Task { await viewModel.loadReports() }
                    } label: {
                        Image(systemName: "arrow.clockwise")
                    }
                }
            }
            .searchable(text: $viewModel.searchText, prompt: "Search reports...")
            .refreshable {
                await viewModel.loadReports()
            }
            .sheet(item: $selectedReport) { report in
                ReportDetailSheet(report: report, viewModel: viewModel)
            }
            .task {
                await viewModel.loadReports()
            }
            .onChange(of: viewModel.selectedReportType) { _, _ in
                Task { await viewModel.loadReports() }
            }
            .onChange(of: viewModel.selectedStatus) { _, _ in
                Task { await viewModel.loadReports() }
            }
        }
    }

    // MARK: - Stats Section

    private var statsSection: some View {
        HStack(spacing: 10) {
            StatCard(
                title: "Total",
                value: "\(viewModel.totalReports)",
                icon: "doc.text.fill",
                color: .gray
            )
            StatCard(
                title: "Pending",
                value: "\(viewModel.pendingCount)",
                icon: "clock.fill",
                color: .blue
            )
            StatCard(
                title: "In Progress",
                value: "\(viewModel.inProgressCount)",
                icon: "arrow.triangle.2.circlepath",
                color: .orange
            )
            StatCard(
                title: "Closed",
                value: "\(viewModel.closedCount)",
                icon: "checkmark.seal.fill",
                color: .green
            )
        }
        .padding(.horizontal)
        .padding(.vertical, 12)
        .background(Color(.secondarySystemBackground))
    }

    // MARK: - Filter Section

    private var filterSection: some View {
        HStack(spacing: 8) {
            // Report type filter
            Menu {
                Button("All Types") {
                    viewModel.selectedReportType = nil
                }
                Divider()
                ForEach(XappyReportType.allCases, id: \.self) { type in
                    Button {
                        viewModel.selectedReportType = type
                    } label: {
                        Label(type.displayName, systemImage: type.icon)
                    }
                }
            } label: {
                FilterChip(
                    label: viewModel.selectedReportType?.displayName ?? "All Types",
                    icon: "line.3.horizontal.decrease.circle",
                    isActive: viewModel.selectedReportType != nil
                )
            }

            // Status filter
            Menu {
                Button("All Status") {
                    viewModel.selectedStatus = nil
                }
                Divider()
                ForEach(ReportStatus.allCases, id: \.self) { status in
                    Button {
                        viewModel.selectedStatus = status
                    } label: {
                        Label(status.displayName, systemImage: status.icon)
                    }
                }
            } label: {
                FilterChip(
                    label: viewModel.selectedStatus?.displayName ?? "All Status",
                    icon: "flag",
                    isActive: viewModel.selectedStatus != nil
                )
            }

            Spacer()

            // Clear filters
            if viewModel.selectedReportType != nil || viewModel.selectedStatus != nil {
                Button {
                    viewModel.clearFilters()
                } label: {
                    Text("Clear")
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(.red)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(Color.red.opacity(0.1))
                        .cornerRadius(16)
                }
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 10)
        .background(Color(.systemBackground))
    }

    // MARK: - Reports List

    private var reportsList: some View {
        List {
            ForEach(viewModel.filteredReports) { report in
                ReportRow(report: report)
                    .contentShape(Rectangle())
                    .onTapGesture {
                        selectedReport = report
                    }
                    .onAppear {
                        Task {
                            await viewModel.loadMoreReportsIfNeeded(currentItem: report)
                        }
                    }
            }

            if viewModel.isLoadingMore {
                HStack {
                    Spacer()
                    ProgressView()
                        .padding()
                    Spacer()
                }
            }
        }
        .listStyle(.insetGrouped)
    }

    // MARK: - Loading View

    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.5)
            Text("Loading reports...")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    // MARK: - Error View

    private func errorView(_ error: String) -> some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 50))
                .foregroundColor(.orange)
            Text("Error Loading Reports")
                .font(.headline)
            Text(error)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            Button("Retry") {
                Task { await viewModel.loadReports() }
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    // MARK: - Empty State

    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "doc.text.magnifyingglass")
                .font(.system(size: 60))
                .foregroundColor(.secondary)
            Text("No Reports Found")
                .font(.headline)
            Text(viewModel.searchText.isEmpty ? "Reports will appear here when submitted" : "Try adjusting your search or filters")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - Supporting Views

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Image(systemName: icon)
                .font(.system(size: 14))
                .foregroundColor(color)
            Text(value)
                .font(.title3)
                .fontWeight(.bold)
                .minimumScaleFactor(0.7)
            Text(title)
                .font(.caption2)
                .foregroundColor(.secondary)
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(10)
        .background(Color(.systemBackground))
        .cornerRadius(10)
        .shadow(color: .black.opacity(0.05), radius: 3, y: 1)
    }
}

struct FilterChip: View {
    let label: String
    let icon: String
    let isActive: Bool

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 11))
            Text(label)
                .font(.caption)
                .fontWeight(.medium)
                .lineLimit(1)
        }
        .foregroundColor(isActive ? .white : .primary)
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(isActive ? Color.blue : Color(.tertiarySystemBackground))
        .cornerRadius(14)
    }
}

struct ReportRow: View {
    let report: ReportItem

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            // Header row
            HStack {
                // Report type icon
                ZStack {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(reportTypeColor(report.reportType).opacity(0.15))
                        .frame(width: 36, height: 36)
                    Image(systemName: report.reportType.icon)
                        .font(.system(size: 16))
                        .foregroundColor(reportTypeColor(report.reportType))
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(report.referenceNumber)
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(.secondary)
                    Text(report.reportType.displayName)
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }

                Spacer()

                // Status badge
                HStack(spacing: 4) {
                    Circle()
                        .fill(report.status.color)
                        .frame(width: 8, height: 8)
                    Text(report.status.displayName)
                        .font(.caption)
                        .fontWeight(.medium)
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(report.status.color.opacity(0.12))
                .cornerRadius(12)
            }

            // Title
            Text(report.title)
                .font(.headline)
                .lineLimit(1)

            // Description
            Text(report.description)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .lineLimit(2)

            // Footer info
            HStack(spacing: 16) {
                if let reporter = report.reporterName {
                    Label(reporter, systemImage: "person.fill")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                if let location = report.locationDescription {
                    Label(location, systemImage: "mappin")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }

                Spacer()

                Text(report.reportedAt, style: .relative)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 8)
    }

    private func reportTypeColor(_ type: XappyReportType) -> Color {
        switch type {
        case .nearMiss: return .orange
        case .incident: return .red
        case .dailySafetyLog: return .blue
        case .shiftHandover: return .blue
        case .toolboxTalk: return .green
        case .ptwEvidence: return .cyan
        case .lotoEvidence: return .indigo
        case .spillReport: return .purple
        case .inspection: return .teal
        }
    }
}

// MARK: - Report Detail Sheet

struct ReportDetailSheet: View {
    let report: ReportItem
    @ObservedObject var viewModel: ReportsViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var isAcknowledging = false
    @State private var showingCloseDialog = false
    @State private var resolution = ""

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Header
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text(report.referenceNumber)
                                .font(.caption)
                                .fontWeight(.medium)
                                .foregroundColor(.secondary)
                            Spacer()
                            statusBadge
                        }

                        Text(report.title)
                            .font(.title2)
                            .fontWeight(.bold)

                        HStack {
                            Label(report.reportType.displayName, systemImage: report.reportType.icon)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    }

                    Divider()

                    // Description
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Description")
                            .font(.headline)
                        Text(report.description)
                            .font(.body)
                            .foregroundColor(.secondary)
                    }

                    // Details
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Details")
                            .font(.headline)

                        DetailRow(icon: "person.fill", label: "Reporter", value: report.reporterName ?? "Unknown")
                        DetailRow(icon: "building.2.fill", label: "Site", value: report.siteName ?? "Unknown")
                        DetailRow(icon: "mappin", label: "Location", value: report.locationDescription ?? "Not specified")
                        DetailRow(icon: "clock.fill", label: "Reported", value: report.reportedAt.formatted(date: .abbreviated, time: .shortened))
                    }

                    // Actions
                    if report.status == .submitted {
                        VStack(spacing: 12) {
                            Button {
                                acknowledgeReport()
                            } label: {
                                HStack {
                                    if isAcknowledging {
                                        ProgressView()
                                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                    } else {
                                        Image(systemName: "checkmark.circle.fill")
                                    }
                                    Text("Acknowledge Report")
                                }
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.purple)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                            }
                            .disabled(isAcknowledging)
                        }
                        .padding(.top, 8)
                    }

                    if report.status == .acknowledged || report.status == .underInvestigation || report.status == .correctiveAction {
                        VStack(spacing: 12) {
                            Button {
                                showingCloseDialog = true
                            } label: {
                                HStack {
                                    Image(systemName: "checkmark.seal.fill")
                                    Text("Close Report")
                                }
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.green)
                                .foregroundColor(.white)
                                .cornerRadius(12)
                            }
                        }
                        .padding(.top, 8)
                    }
                }
                .padding()
            }
            .navigationTitle("Report Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
            .alert("Close Report", isPresented: $showingCloseDialog) {
                TextField("Resolution summary", text: $resolution)
                Button("Cancel", role: .cancel) { }
                Button("Close Report") {
                    closeReport()
                }
            } message: {
                Text("Please provide a resolution summary for this report.")
            }
        }
    }

    private var statusBadge: some View {
        HStack(spacing: 4) {
            Image(systemName: report.status.icon)
                .font(.caption2)
            Text(report.status.displayName)
                .font(.caption)
                .fontWeight(.medium)
        }
        .foregroundColor(report.status.color)
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(report.status.color.opacity(0.12))
        .cornerRadius(12)
    }

    private func acknowledgeReport() {
        isAcknowledging = true
        Task {
            let success = await viewModel.acknowledgeReport(report)
            isAcknowledging = false
            if success {
                dismiss()
            }
        }
    }

    private func closeReport() {
        guard !resolution.isEmpty else { return }
        Task {
            let success = await viewModel.closeReport(report, resolution: resolution)
            if success {
                dismiss()
            }
        }
    }
}

struct DetailRow: View {
    let icon: String
    let label: String
    let value: String

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(.secondary)
                .frame(width: 20)
            VStack(alignment: .leading, spacing: 2) {
                Text(label)
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text(value)
                    .font(.subheadline)
            }
            Spacer()
        }
    }
}

// MARK: - Preview

#Preview {
    ReportsListView()
}
