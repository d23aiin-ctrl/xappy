import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { seedAllAIData } from '@/lib/ai/seed-ai-data';

/**
 * Admin Seed AI Data API
 *
 * POST - Seed all AI-related data (policies, guidelines, milestones, protocols)
 *
 * This endpoint should be called once during initial setup or when
 * updating the default AI configuration.
 */

export async function POST(req: NextRequest) {
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

    // Seed the data
    await seedAllAIData();

    // Get counts for confirmation
    const [policyCount, guidelineCount, milestoneCount, protocolCount, crisisCount] = await Promise.all([
      prisma.policyRule.count(),
      prisma.therapyGuideline.count(),
      prisma.journeyMilestone.count(),
      prisma.interventionProtocol.count(),
      prisma.crisisProtocol.count(),
    ]);

    return NextResponse.json({
      success: true,
      message: 'AI data seeded successfully',
      data: {
        policies: policyCount,
        guidelines: guidelineCount,
        milestones: milestoneCount,
        interventionProtocols: protocolCount,
        crisisProtocols: crisisCount,
      },
    });
  } catch (error) {
    console.error('Seed AI data error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET - Check current AI data status
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

    // Get counts
    const [policyCount, guidelineCount, milestoneCount, protocolCount, crisisCount] = await Promise.all([
      prisma.policyRule.count({ where: { isActive: true } }),
      prisma.therapyGuideline.count({ where: { isActive: true } }),
      prisma.journeyMilestone.count({ where: { isActive: true } }),
      prisma.interventionProtocol.count({ where: { isActive: true } }),
      prisma.crisisProtocol.count({ where: { isActive: true } }),
    ]);

    const isSeeded = policyCount > 0 || guidelineCount > 0 || milestoneCount > 0;

    return NextResponse.json({
      success: true,
      data: {
        isSeeded,
        counts: {
          policies: policyCount,
          guidelines: guidelineCount,
          milestones: milestoneCount,
          interventionProtocols: protocolCount,
          crisisProtocols: crisisCount,
        },
      },
    });
  } catch (error) {
    console.error('Get AI data status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
