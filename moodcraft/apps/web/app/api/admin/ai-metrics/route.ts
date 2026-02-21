import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSystemAIMetrics } from '@/lib/ai/traceability';
import prisma from '@/lib/prisma';

/**
 * Admin AI Metrics API
 *
 * GET - Get system-wide AI usage and performance metrics
 */

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '7');

    // Get AI metrics
    const metrics = await getSystemAIMetrics(days);

    // Get additional context
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalEscalations,
      riskFlaggedInteractions,
      avgUserFeedback,
      topInterventions,
    ] = await Promise.all([
      // Total escalations triggered by AI
      prisma.aITraceLog.count({
        where: {
          createdAt: { gte: since },
          escalationTriggered: true,
        },
      }),
      // Risk flagged interactions
      prisma.aITraceLog.count({
        where: {
          createdAt: { gte: since },
          riskFlagged: true,
        },
      }),
      // Average user feedback
      prisma.aITraceLog.aggregate({
        where: {
          createdAt: { gte: since },
          userFeedback: { not: null },
        },
        _avg: { userFeedback: true },
        _count: { userFeedback: true },
      }),
      // Top interventions by usage
      prisma.aITraceLog.groupBy({
        by: ['interventionType'],
        where: {
          createdAt: { gte: since },
          interventionType: { not: null },
        },
        _count: true,
        _avg: { userFeedback: true },
        orderBy: { _count: { interventionType: 'desc' } },
        take: 10,
      }),
    ]);

    // Get policy rule triggers
    const policyTriggers = await prisma.policyRule.findMany({
      where: { isActive: true },
      select: {
        name: true,
        category: true,
      },
    });

    // Get intervention protocol effectiveness
    const protocols = await prisma.interventionProtocol.findMany({
      where: { isActive: true },
      select: {
        name: true,
        successRate: true,
        useCount: true,
      },
      orderBy: { useCount: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      data: {
        period: `${days} days`,
        coreMetrics: metrics,
        escalationMetrics: {
          totalTriggered: totalEscalations,
          riskFlagged: riskFlaggedInteractions,
        },
        feedbackMetrics: {
          averageRating: avgUserFeedback._avg.userFeedback?.toFixed(2) || 'N/A',
          totalRatings: avgUserFeedback._count.userFeedback,
        },
        interventionMetrics: {
          topInterventions: topInterventions.map((i) => ({
            type: i.interventionType,
            count: i._count,
            avgFeedback: i._avg.userFeedback?.toFixed(2) || 'N/A',
          })),
          protocolEffectiveness: protocols.map((p) => ({
            name: p.name,
            successRate: ((p.successRate || 0) * 100).toFixed(1) + '%',
            useCount: p.useCount,
          })),
        },
        activePolicies: policyTriggers.length,
      },
    });
  } catch (error) {
    console.error('Admin AI metrics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
