import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer';

// Register fonts (optional, for better typography)
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Inter',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#6d28d9',
  },
  logo: {
    flexDirection: 'column',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 700,
    color: '#6d28d9',
  },
  logoSubtext: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  reportInfo: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#111827',
  },
  reportDate: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '23%',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 700,
    color: '#111827',
  },
  metricLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 4,
  },
  metricTrend: {
    fontSize: 8,
    marginTop: 4,
  },
  trendUp: {
    color: '#22c55e',
  },
  trendDown: {
    color: '#ef4444',
  },
  trendStable: {
    color: '#eab308',
  },
  table: {
    width: '100%',
    marginTop: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#6d28d9',
    padding: 8,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 9,
    fontWeight: 600,
    color: '#ffffff',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableRowAlt: {
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    color: '#374151',
    textAlign: 'center',
  },
  riskBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 600,
    alignSelf: 'center',
  },
  riskHigh: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
  },
  riskMedium: {
    backgroundColor: '#fef3c7',
    color: '#d97706',
  },
  riskLow: {
    backgroundColor: '#dcfce7',
    color: '#16a34a',
  },
  insightCard: {
    backgroundColor: '#f3e8ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#6d28d9',
  },
  insightTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: '#111827',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 9,
    color: '#4b5563',
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
  },
  pageNumber: {
    fontSize: 8,
    color: '#9ca3af',
  },
  disclaimer: {
    backgroundColor: '#fef3c7',
    borderRadius: 6,
    padding: 12,
    marginTop: 20,
  },
  disclaimerTitle: {
    fontSize: 9,
    fontWeight: 600,
    color: '#92400e',
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 8,
    color: '#92400e',
    lineHeight: 1.5,
  },
  esgScore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  esgScoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6d28d9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  esgScoreValue: {
    fontSize: 28,
    fontWeight: 700,
    color: '#ffffff',
  },
  esgScoreLabel: {
    fontSize: 10,
    color: '#ffffff',
    marginTop: 2,
  },
  esgBreakdown: {
    marginLeft: 30,
  },
  esgBreakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  esgBreakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  esgBreakdownLabel: {
    fontSize: 10,
    color: '#374151',
    width: 120,
  },
  esgBreakdownValue: {
    fontSize: 10,
    fontWeight: 600,
    color: '#111827',
  },
});

interface DepartmentData {
  id: string;
  name: string;
  stressLevel: number;
  participationRate: number;
  avgMoodScore: number;
  employeeCount: number;
  trend: 'up' | 'down' | 'stable';
}

interface ESGReportData {
  organizationName: string;
  reportDate: string;
  reportPeriod: string;
  departments: DepartmentData[];
  overallMetrics: {
    totalUsers: number;
    activeUsers: number;
    avgMood: number;
    avgStress: number;
    participationRate: number;
  };
  esgScore: {
    overall: number;
    environmental: number;
    social: number;
    governance: number;
  };
  insights: {
    title: string;
    description: string;
    type: 'warning' | 'positive' | 'info';
  }[];
  recommendations: string[];
}

function getRiskLevel(score: number): 'high' | 'medium' | 'low' {
  if (score > 70) return 'high';
  if (score > 50) return 'medium';
  return 'low';
}

function getRiskStyle(level: 'high' | 'medium' | 'low') {
  switch (level) {
    case 'high': return styles.riskHigh;
    case 'medium': return styles.riskMedium;
    default: return styles.riskLow;
  }
}

export function ESGReportDocument({ data }: { data: ESGReportData }) {
  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>CereBro</Text>
            <Text style={styles.logoSubtext}>Mental Wellness Platform</Text>
          </View>
          <View style={styles.reportInfo}>
            <Text style={styles.reportTitle}>ESG Wellness Report</Text>
            <Text style={styles.reportDate}>{data.reportDate}</Text>
          </View>
        </View>

        {/* Organization Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 18, color: '#6d28d9' }]}>
            {data.organizationName}
          </Text>
          <Text style={{ fontSize: 10, color: '#6b7280' }}>
            Reporting Period: {data.reportPeriod}
          </Text>
        </View>

        {/* ESG Score Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ESG Wellness Score</Text>
          <View style={styles.esgScore}>
            <View style={styles.esgScoreCircle}>
              <Text style={styles.esgScoreValue}>{data.esgScore.overall}</Text>
              <Text style={styles.esgScoreLabel}>Overall</Text>
            </View>
            <View style={styles.esgBreakdown}>
              <View style={styles.esgBreakdownItem}>
                <View style={[styles.esgBreakdownDot, { backgroundColor: '#22c55e' }]} />
                <Text style={styles.esgBreakdownLabel}>Environmental</Text>
                <Text style={styles.esgBreakdownValue}>{data.esgScore.environmental}/100</Text>
              </View>
              <View style={styles.esgBreakdownItem}>
                <View style={[styles.esgBreakdownDot, { backgroundColor: '#6d28d9' }]} />
                <Text style={styles.esgBreakdownLabel}>Social (Wellness)</Text>
                <Text style={styles.esgBreakdownValue}>{data.esgScore.social}/100</Text>
              </View>
              <View style={styles.esgBreakdownItem}>
                <View style={[styles.esgBreakdownDot, { backgroundColor: '#3b82f6' }]} />
                <Text style={styles.esgBreakdownLabel}>Governance</Text>
                <Text style={styles.esgBreakdownValue}>{data.esgScore.governance}/100</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Key Metrics Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Wellness Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{data.overallMetrics.activeUsers}</Text>
              <Text style={styles.metricLabel}>Active Participants</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{data.overallMetrics.participationRate.toFixed(0)}%</Text>
              <Text style={styles.metricLabel}>Participation Rate</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: '#22c55e' }]}>{data.overallMetrics.avgMood.toFixed(1)}</Text>
              <Text style={styles.metricLabel}>Average Mood Score</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: data.overallMetrics.avgStress < 50 ? '#22c55e' : data.overallMetrics.avgStress < 70 ? '#eab308' : '#ef4444' }]}>
                {data.overallMetrics.avgStress.toFixed(0)}%
              </Text>
              <Text style={styles.metricLabel}>Average Stress Level</Text>
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>Data Privacy Notice</Text>
          <Text style={styles.disclaimerText}>
            All data in this report is k-anonymized (minimum group size of 5) and aggregated.
            No individual employee data is identifiable. This report complies with GDPR, HIPAA,
            and SOC 2 data protection standards.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Confidential - {data.organizationName}</Text>
          <Text style={styles.pageNumber}>Page 1 of 2</Text>
        </View>
      </Page>

      {/* Detailed Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>CereBro</Text>
            <Text style={styles.logoSubtext}>ESG Report - Detailed Analysis</Text>
          </View>
          <View style={styles.reportInfo}>
            <Text style={styles.reportDate}>{data.reportDate}</Text>
          </View>
        </View>

        {/* Department Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Department Wellness Analysis</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Department</Text>
              <Text style={styles.tableHeaderCell}>Employees</Text>
              <Text style={styles.tableHeaderCell}>Participation</Text>
              <Text style={styles.tableHeaderCell}>Mood Score</Text>
              <Text style={styles.tableHeaderCell}>Stress Level</Text>
              <Text style={styles.tableHeaderCell}>Risk Level</Text>
            </View>
            {data.departments.map((dept, index) => {
              const riskScore = Math.min(100, Math.round(dept.stressLevel * 0.6 + (100 - dept.participationRate) * 0.4));
              const riskLevel = getRiskLevel(riskScore);
              return (
                <View key={dept.id} style={[styles.tableRow, index % 2 === 0 ? styles.tableRowAlt : {}]}>
                  <Text style={styles.tableCell}>{dept.name}</Text>
                  <Text style={styles.tableCell}>{dept.employeeCount}</Text>
                  <Text style={styles.tableCell}>{dept.participationRate}%</Text>
                  <Text style={styles.tableCell}>{dept.avgMoodScore.toFixed(1)}</Text>
                  <Text style={styles.tableCell}>{dept.stressLevel}%</Text>
                  <View style={[styles.riskBadge, getRiskStyle(riskLevel)]}>
                    <Text>{riskLevel.toUpperCase()}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* AI Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI-Generated Insights</Text>
          {data.insights.map((insight, index) => (
            <View key={index} style={styles.insightCard}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightText}>{insight.description}</Text>
            </View>
          ))}
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          {data.recommendations.map((rec, index) => (
            <View key={index} style={{ flexDirection: 'row', marginBottom: 6 }}>
              <Text style={{ fontSize: 10, color: '#6d28d9', marginRight: 8 }}>{index + 1}.</Text>
              <Text style={{ fontSize: 10, color: '#374151', flex: 1 }}>{rec}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Generated by CereBro ESG Analytics</Text>
          <Text style={styles.pageNumber}>Page 2 of 2</Text>
        </View>
      </Page>
    </Document>
  );
}

export type { ESGReportData, DepartmentData };
