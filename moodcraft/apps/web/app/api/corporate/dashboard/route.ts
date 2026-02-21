import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify HR role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    if (!user || (user.role !== 'HR' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    if (!user.organizationId) {
      return NextResponse.json({ success: false, error: 'No organization associated' }, { status: 400 });
    }

    // Get departments
    const departments = await prisma.department.findMany({
      where: { organizationId: user.organizationId },
    });

    // Get latest snapshot for each department
    const departmentData = await Promise.all(
      departments.map(async (dept) => {
        const snapshot = await prisma.corporateSnapshot.findFirst({
          where: { organizationId: user.organizationId!, departmentId: dept.id },
          orderBy: { snapshotDate: 'desc' },
        });

        const userCount = await prisma.user.count({
          where: { departmentId: dept.id, isActive: true },
        });

        return {
          id: dept.id,
          name: dept.name,
          stressLevel: snapshot?.stressLevel || 'green',
          activeUsers: snapshot?.activeUsers || 0,
          totalUsers: userCount,
          avgMoodScore: snapshot?.avgMoodScore || 5.0,
          ritualAdherence: snapshot?.ritualAdherence || 0.5,
        };
      })
    );

    // Calculate overall metrics
    const totalUsers = departmentData.reduce((sum, d) => sum + d.totalUsers, 0);
    const activeUsers = departmentData.reduce((sum, d) => sum + d.activeUsers, 0);
    const avgMood = departmentData.length > 0
      ? departmentData.reduce((sum, d) => sum + d.avgMoodScore, 0) / departmentData.length
      : 5.0;

    // Calculate participation rate
    const participationRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

    // Calculate average stress as a number (0-100 scale based on stress levels)
    const stressScores = departmentData.map(d => {
      if (d.stressLevel === 'red') return 80;
      if (d.stressLevel === 'yellow') return 50;
      return 25;
    });
    const avgStress = stressScores.length > 0
      ? stressScores.reduce((sum, s) => sum + s, 0) / stressScores.length
      : 35;

    const redCount = departmentData.filter(d => d.stressLevel === 'red').length;
    const yellowCount = departmentData.filter(d => d.stressLevel === 'yellow').length;
    const overallStress = redCount > 0 ? 'red' : yellowCount > departments.length / 2 ? 'yellow' : 'green';

    // Get attrition predictions from NLP service
    let attritionRisks: any[] = [];
    try {
      const nlpRes = await fetch(`${process.env.NLP_SERVICE_URL}/api/attrition-predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department_data: departmentData.map(d => ({
            department_id: d.id,
            avg_mood: d.avgMoodScore,
            ritual_adherence: d.ritualAdherence,
            stress_level: d.stressLevel,
          })),
        }),
      });
      if (nlpRes.ok) {
        const nlpData = await nlpRes.json();
        attritionRisks = nlpData.predictions.map((p: any) => ({
          departmentId: p.department_id,
          riskScore: p.risk_score,
          factors: p.factors,
        }));
      }
    } catch {
      // NLP service unavailable
    }

    return NextResponse.json({
      success: true,
      data: {
        organization: { name: user.organization?.name, plan: user.organization?.plan },
        departments: departmentData,
        overallMetrics: { totalUsers, activeUsers, avgMood, avgStress, participationRate, overallStress },
        attritionRisks,
      },
    });
  } catch (error) {
    console.error('Corporate dashboard error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
