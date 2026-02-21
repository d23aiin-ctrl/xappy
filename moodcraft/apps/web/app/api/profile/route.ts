import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        badges: {
          include: { badge: true },
          orderBy: { earnedAt: 'desc' },
        },
        _count: {
          select: {
            moodEntries: true,
            journalEntries: true,
            breathSessions: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate total minutes from breath sessions
    const breathStats = await prisma.breathSession.aggregate({
      where: { userId: session.user.id },
      _sum: { durationSecs: true },
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      archetype: user.profile?.archetype || 'SEEKER',
      onboardingComplete: user.profile?.onboardingDone || false,
      createdAt: user.createdAt,
      stats: {
        streakDays: user.profile?.streakDays || 0,
        longestStreak: 0,
        moodCheckins: user._count.moodEntries,
        journalEntries: user._count.journalEntries,
        breathSessions: user._count.breathSessions,
        totalMinutes: Math.round((breathStats._sum.durationSecs || 0) / 60),
      },
      badges: user.badges.map((ub) => ({
        id: ub.badge.id,
        name: ub.badge.name,
        description: ub.badge.description,
        icon: ub.badge.icon,
        earnedAt: ub.earnedAt,
      })),
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
