import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { breathType, durationSecs, completed, groundingDone } = await req.json();

    const breathSession = await prisma.breathSession.create({
      data: {
        userId: session.user.id,
        breathType,
        durationSecs,
        completed: completed || false,
        groundingDone: groundingDone || false,
      },
    });

    // Check for badges
    if (completed) {
      await checkBreathBadges(session.user.id);
    }

    // Update last active
    await prisma.userProfile.update({
      where: { userId: session.user.id },
      data: { lastActiveAt: new Date() },
    });

    return NextResponse.json({ success: true, data: { id: breathSession.id } });
  } catch (error) {
    console.error('Breath session save error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

async function checkBreathBadges(userId: string) {
  const totalSessions = await prisma.breathSession.count({
    where: { userId, completed: true },
  });

  // First breath badge
  if (totalSessions === 1) {
    const badge = await prisma.badge.findUnique({ where: { slug: 'first-breath' } });
    if (badge) {
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId, badgeId: badge.id } },
        update: {},
        create: { userId, badgeId: badge.id },
      });
    }
  }

  // Check for streak badges
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weekSessions = await prisma.breathSession.findMany({
    where: { userId, completed: true, createdAt: { gte: weekAgo } },
    select: { createdAt: true },
  });

  // Count unique days
  const uniqueDays = new Set(weekSessions.map((s) => s.createdAt.toDateString())).size;

  if (uniqueDays >= 7) {
    const badge = await prisma.badge.findUnique({ where: { slug: 'breath-streak-7' } });
    if (badge) {
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId, badgeId: badge.id } },
        update: {},
        create: { userId, badgeId: badge.id },
      });
    }
  }
}
