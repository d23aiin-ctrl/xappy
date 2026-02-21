import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { renderToBuffer } from '@react-pdf/renderer';
import { ESGReportDocument, ESGReportData, DepartmentData } from '@/lib/pdf/esg-report-generator';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check for HR role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, organizationId: true },
    });

    if (!user || (user.role !== 'HR' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Fetch organization data
    let organizationName = 'Organization';
    if (user.organizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: user.organizationId },
        select: { name: true },
      });
      if (org) organizationName = org.name;
    }

    // Fetch department aggregated data (anonymized)
    // In a real implementation, this would query from CorporateSnapshot
    // For now, we use demo data
    const departments: DepartmentData[] = [
      { id: '1', name: 'Engineering', stressLevel: 42, participationRate: 78, avgMoodScore: 7.2, employeeCount: 45, trend: 'down' },
      { id: '2', name: 'Sales', stressLevel: 68, participationRate: 65, avgMoodScore: 6.1, employeeCount: 32, trend: 'up' },
      { id: '3', name: 'Marketing', stressLevel: 35, participationRate: 82, avgMoodScore: 7.8, employeeCount: 18, trend: 'stable' },
      { id: '4', name: 'HR', stressLevel: 28, participationRate: 92, avgMoodScore: 8.1, employeeCount: 12, trend: 'down' },
      { id: '5', name: 'Finance', stressLevel: 55, participationRate: 71, avgMoodScore: 6.5, employeeCount: 15, trend: 'stable' },
      { id: '6', name: 'Operations', stressLevel: 72, participationRate: 58, avgMoodScore: 5.8, employeeCount: 28, trend: 'up' },
      { id: '7', name: 'Support', stressLevel: 48, participationRate: 75, avgMoodScore: 6.9, employeeCount: 22, trend: 'stable' },
      { id: '8', name: 'Legal', stressLevel: 38, participationRate: 85, avgMoodScore: 7.4, employeeCount: 8, trend: 'down' },
    ];

    // Calculate overall metrics
    const totalEmployees = departments.reduce((sum, d) => sum + d.employeeCount, 0);
    const activeUsers = Math.round(departments.reduce((sum, d) => sum + d.employeeCount * (d.participationRate / 100), 0));
    const avgMood = departments.reduce((sum, d) => sum + d.avgMoodScore * d.employeeCount, 0) / totalEmployees;
    const avgStress = departments.reduce((sum, d) => sum + d.stressLevel * d.employeeCount, 0) / totalEmployees;
    const avgParticipation = departments.reduce((sum, d) => sum + d.participationRate, 0) / departments.length;

    // Calculate ESG scores
    // Social score based on wellness metrics
    const socialScore = Math.round(
      (100 - avgStress) * 0.4 + // Lower stress = better
      avgMood * 10 * 0.3 + // Higher mood = better
      avgParticipation * 0.3 // Higher participation = better
    );

    // Environmental score (placeholder - could be based on remote work data, etc.)
    const environmentalScore = 72;

    // Governance score based on participation and data availability
    const governanceScore = Math.round(avgParticipation * 0.8 + 15);

    const overallESG = Math.round((socialScore + environmentalScore + governanceScore) / 3);

    // Generate insights
    const insights = [];

    const highStressDepts = departments.filter(d => d.stressLevel > 65);
    if (highStressDepts.length > 0) {
      insights.push({
        title: 'Departments Requiring Attention',
        description: `${highStressDepts.map(d => d.name).join(', ')} ${highStressDepts.length === 1 ? 'shows' : 'show'} elevated stress levels (>65%). Consider targeted wellness initiatives or workload assessments for these teams.`,
        type: 'warning' as const,
      });
    }

    const bestDept = departments.reduce((best, d) =>
      d.participationRate > best.participationRate ? d : best
    );
    insights.push({
      title: 'Wellness Champion Department',
      description: `${bestDept.name} leads in participation (${bestDept.participationRate}%) and shows excellent wellness metrics. Their practices could serve as a model for other departments.`,
      type: 'positive' as const,
    });

    insights.push({
      title: 'Overall Wellness Trend',
      description: `Organization-wide wellness score is ${overallESG}/100. The social wellness component (${socialScore}/100) indicates ${socialScore > 70 ? 'strong' : socialScore > 50 ? 'moderate' : 'concerning'} employee wellbeing indicators.`,
      type: 'info' as const,
    });

    // Generate recommendations
    const recommendations = [
      'Implement weekly team check-ins for departments with declining trends',
      'Share best practices from high-performing departments (HR, Marketing) with struggling teams',
      `Focus immediate interventions on ${highStressDepts.length > 0 ? highStressDepts[0].name : 'Operations'} department`,
      'Consider workload redistribution for departments showing stress trends',
      'Increase manager training on recognizing and addressing employee burnout',
    ];

    const reportData: ESGReportData = {
      organizationName,
      reportDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      reportPeriod: `${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      departments,
      overallMetrics: {
        totalUsers: totalEmployees,
        activeUsers,
        avgMood,
        avgStress,
        participationRate: avgParticipation,
      },
      esgScore: {
        overall: overallESG,
        environmental: environmentalScore,
        social: socialScore,
        governance: governanceScore,
      },
      insights,
      recommendations,
    };

    // Generate PDF
    const pdfBuffer = await renderToBuffer(ESGReportDocument({ data: reportData }) as any);

    // Return PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ESG_Wellness_Report_${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error('ESG report generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
