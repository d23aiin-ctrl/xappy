//
//  AnalyticsDashboardView.swift
//  XappyAI
//
//  XAPPY AI - Oil & Gas Safety Compliance Platform
//  Main analytics dashboard with KPIs, charts, and export options
//

import SwiftUI
import Charts

struct AnalyticsDashboardView: View {
    @StateObject private var viewModel = AnalyticsViewModel()
    @State private var showingExportSheet = false
    @State private var exportURL: URL?
    @State private var showingShareSheet = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Time Range Selector
                    timeRangeSelector

                    if viewModel.isLoading {
                        loadingView
                    } else if let error = viewModel.errorMessage {
                        errorView(error)
                    } else {
                        // KPI Cards
                        kpiCards

                        // Frequency Rates
                        frequencyRatesSection

                        // Trend Chart
                        trendChartSection

                        // Category Breakdown
                        categoryBreakdownSection

                        // Status Distribution
                        statusDistributionSection

                        // Top Reporters
                        topReportersSection

                        // Site Comparison
                        if !viewModel.siteComparisons.isEmpty {
                            siteComparisonSection
                        }
                    }
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Safety Analytics")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        Button {
                            Task { await exportCSV() }
                        } label: {
                            Label("Export CSV", systemImage: "doc.text")
                        }

                        Button {
                            Task { await exportExcel() }
                        } label: {
                            Label("Export Excel", systemImage: "tablecells")
                        }

                        Button {
                            Task { await exportAuditPack() }
                        } label: {
                            Label("Audit Pack (PDF)", systemImage: "doc.richtext")
                        }
                    } label: {
                        Image(systemName: "square.and.arrow.up")
                    }
                    .disabled(viewModel.isExporting)
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        Task { await viewModel.loadDashboard() }
                    } label: {
                        Image(systemName: "arrow.clockwise")
                    }
                    .disabled(viewModel.isLoading)
                }
            }
            .refreshable {
                await viewModel.loadDashboard()
            }
            .task {
                await viewModel.loadDashboard()
            }
            .onChange(of: viewModel.selectedTimeRange) { _, _ in
                Task { await viewModel.loadDashboard() }
            }
            .sheet(isPresented: $showingShareSheet) {
                if let url = exportURL {
                    ShareSheet(items: [url])
                }
            }
        }
    }

    // MARK: - Time Range Selector

    private var timeRangeSelector: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(AnalyticsTimeRange.allCases) { range in
                    Button {
                        viewModel.selectedTimeRange = range
                    } label: {
                        Text(range.shortName)
                            .font(.subheadline)
                            .fontWeight(.medium)
                            .foregroundColor(viewModel.selectedTimeRange == range ? .white : .primary)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 10)
                            .background(
                                Capsule()
                                    .fill(viewModel.selectedTimeRange == range ? Color.blue : Color(.secondarySystemBackground))
                            )
                    }
                }
            }
            .padding(.horizontal, 4)
        }
    }

    // MARK: - KPI Cards

    private var kpiCards: some View {
        LazyVGrid(columns: [
            GridItem(.flexible()),
            GridItem(.flexible())
        ], spacing: 12) {
            KPICard(
                title: "Total Reports",
                value: "\(viewModel.kpis?.totalReports ?? 0)",
                icon: "doc.text.fill",
                color: .blue,
                trend: viewModel.kpis?.trendDirection ?? "stable",
                trendValue: viewModel.kpis?.trendPercentage ?? 0
            )

            KPICard(
                title: "Near Misses",
                value: "\(viewModel.kpis?.nearMisses ?? 0)",
                icon: "exclamationmark.triangle.fill",
                color: .orange
            )

            KPICard(
                title: "Incidents",
                value: "\(viewModel.kpis?.incidents ?? 0)",
                icon: "exclamationmark.octagon.fill",
                color: .red
            )

            KPICard(
                title: "Spills",
                value: "\(viewModel.kpis?.spills ?? 0)",
                icon: "drop.fill",
                color: .purple
            )

            KPICard(
                title: "Pending",
                value: "\(viewModel.kpis?.pendingCount ?? 0)",
                icon: "clock.fill",
                color: .yellow
            )

            KPICard(
                title: "Compliance",
                value: String(format: "%.0f%%", viewModel.complianceScore),
                icon: "checkmark.seal.fill",
                color: viewModel.complianceScore >= 80 ? .green : .orange
            )
        }
    }

    // MARK: - Frequency Rates Section

    private var frequencyRatesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Safety Metrics")
                .font(.headline)

            VStack(spacing: 8) {
                FrequencyRateRow(
                    title: "TRIFR",
                    subtitle: "Total Recordable Injury Frequency Rate",
                    value: viewModel.kpis?.trifr ?? 0,
                    format: "%.2f",
                    target: 1.0,
                    color: .red
                )

                FrequencyRateRow(
                    title: "LTIFR",
                    subtitle: "Lost Time Injury Frequency Rate",
                    value: viewModel.kpis?.ltifr ?? 0,
                    format: "%.2f",
                    target: 0.5,
                    color: .orange
                )

                FrequencyRateRow(
                    title: "Near Miss Rate",
                    subtitle: "Per 1,000 worker hours",
                    value: viewModel.kpis?.nearMissRate ?? 0,
                    format: "%.1f",
                    target: nil,
                    color: .blue
                )

                FrequencyRateRow(
                    title: "Avg Resolution",
                    subtitle: "Hours to close report",
                    value: viewModel.kpis?.avgResolutionTimeHours ?? 0,
                    format: "%.1f hrs",
                    target: 72,
                    color: .green
                )
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
        }
    }

    // MARK: - Trend Chart Section

    private var trendChartSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Report Trend")
                .font(.headline)

            if !viewModel.trendData.isEmpty {
                Chart(viewModel.trendData) { point in
                    LineMark(
                        x: .value("Date", point.dateValue),
                        y: .value("Reports", point.value)
                    )
                    .foregroundStyle(Color.blue)

                    AreaMark(
                        x: .value("Date", point.dateValue),
                        y: .value("Reports", point.value)
                    )
                    .foregroundStyle(
                        LinearGradient(
                            colors: [.blue.opacity(0.3), .blue.opacity(0.05)],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )

                    PointMark(
                        x: .value("Date", point.dateValue),
                        y: .value("Reports", point.value)
                    )
                    .foregroundStyle(Color.blue)
                }
                .frame(height: 200)
                .chartXAxis {
                    AxisMarks(values: .automatic(desiredCount: 5)) { value in
                        AxisValueLabel(format: .dateTime.month(.abbreviated).day())
                    }
                }
                .chartYAxis {
                    AxisMarks(position: .leading)
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(12)
            } else {
                Text("No trend data available")
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity, minHeight: 200)
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
            }
        }
    }

    // MARK: - Category Breakdown Section

    private var categoryBreakdownSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Reports by Type")
                .font(.headline)

            if !viewModel.categoryBreakdown.isEmpty {
                Chart(viewModel.categoryBreakdown) { category in
                    SectorMark(
                        angle: .value("Count", category.count),
                        innerRadius: .ratio(0.5),
                        angularInset: 2
                    )
                    .foregroundStyle(category.color)
                    .annotation(position: .overlay) {
                        if category.percentage > 10 {
                            Text("\(category.count)")
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                        }
                    }
                }
                .frame(height: 200)

                // Legend
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                    ForEach(viewModel.categoryBreakdown) { category in
                        HStack(spacing: 6) {
                            Circle()
                                .fill(category.color)
                                .frame(width: 10, height: 10)
                            Text(category.displayName)
                                .font(.caption)
                                .lineLimit(1)
                            Spacer()
                            Text("\(category.count)")
                                .font(.caption)
                                .fontWeight(.medium)
                        }
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }

    // MARK: - Status Distribution Section

    private var statusDistributionSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Status Distribution")
                .font(.headline)

            if !viewModel.statusData.isEmpty {
                Chart(viewModel.statusData, id: \.0) { status, count in
                    BarMark(
                        x: .value("Count", count),
                        y: .value("Status", status.replacingOccurrences(of: "_", with: " ").capitalized)
                    )
                    .foregroundStyle(statusColor(status))
                    .annotation(position: .trailing) {
                        Text("\(count)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                .frame(height: CGFloat(viewModel.statusData.count * 40))
                .chartXAxis(.hidden)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }

    // MARK: - Top Reporters Section

    private var topReportersSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Top Reporters")
                .font(.headline)

            if viewModel.topReporters.isEmpty {
                Text("No data available")
                    .foregroundColor(.secondary)
            } else {
                ForEach(Array(viewModel.topReporters.enumerated()), id: \.element.id) { index, reporter in
                    HStack {
                        Text("\(index + 1)")
                            .font(.caption)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                            .frame(width: 24, height: 24)
                            .background(Circle().fill(medalColor(index)))

                        Text(reporter.name)
                            .font(.subheadline)

                        Spacer()

                        Text("\(reporter.reportCount) reports")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding(.vertical, 4)
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }

    // MARK: - Site Comparison Section

    private var siteComparisonSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Site Comparison")
                .font(.headline)

            ForEach(viewModel.siteComparisons.prefix(5)) { site in
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(site.siteName)
                            .font(.subheadline)
                            .fontWeight(.medium)
                        Text("\(site.totalReports) reports")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }

                    Spacer()

                    VStack(alignment: .trailing, spacing: 2) {
                        Text(String(format: "%.0f%%", site.complianceScore))
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .foregroundColor(site.complianceScore >= 80 ? .green : .orange)
                        Text("Compliance")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
                .padding(.vertical, 8)

                if site.id != viewModel.siteComparisons.prefix(5).last?.id {
                    Divider()
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }

    // MARK: - Helper Views

    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.5)
            Text("Loading analytics...")
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, minHeight: 300)
    }

    private func errorView(_ error: String) -> some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 50))
                .foregroundColor(.orange)
            Text("Error Loading Data")
                .font(.headline)
            Text(error)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            Button("Retry") {
                Task { await viewModel.loadDashboard() }
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }

    // MARK: - Helper Functions

    private func statusColor(_ status: String) -> Color {
        switch status {
        case "submitted": return .blue
        case "acknowledged": return .purple
        case "under_investigation": return .yellow
        case "corrective_action": return .orange
        case "closed": return .green
        default: return .gray
        }
    }

    private func medalColor(_ index: Int) -> Color {
        switch index {
        case 0: return .yellow
        case 1: return .gray
        case 2: return .brown
        default: return .blue
        }
    }

    // MARK: - Export Functions

    private func exportCSV() async {
        if let url = await viewModel.exportCSV() {
            exportURL = url
            showingShareSheet = true
        }
    }

    private func exportExcel() async {
        if let url = await viewModel.exportExcel() {
            exportURL = url
            showingShareSheet = true
        }
    }

    private func exportAuditPack() async {
        if let url = await viewModel.exportAuditPack() {
            exportURL = url
            showingShareSheet = true
        }
    }
}

// MARK: - Supporting Views

struct KPICard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    var trend: String? = nil
    var trendValue: Double? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                Spacer()
                if let trend = trend, let trendValue = trendValue, trendValue > 0 {
                    HStack(spacing: 2) {
                        Image(systemName: trend == "up" ? "arrow.up.right" : trend == "down" ? "arrow.down.right" : "minus")
                            .font(.caption2)
                        Text(String(format: "%.0f%%", trendValue))
                            .font(.caption2)
                    }
                    .foregroundColor(trend == "up" ? .red : trend == "down" ? .green : .secondary)
                }
            }

            Text(value)
                .font(.title2)
                .fontWeight(.bold)

            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }
}

struct FrequencyRateRow: View {
    let title: String
    let subtitle: String
    let value: Double
    let format: String
    let target: Double?
    let color: Color

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                Text(subtitle)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 2) {
                Text(String(format: format, value))
                    .font(.headline)
                    .foregroundColor(color)

                if let target = target {
                    Text("Target: \(String(format: "%.1f", target))")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Share Sheet

struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}

// MARK: - Preview

#Preview {
    AnalyticsDashboardView()
}
