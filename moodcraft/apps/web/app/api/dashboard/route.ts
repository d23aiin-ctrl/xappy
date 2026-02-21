import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Station name to index mapping
const STATION_INDEX: Record<string, number> = {
  AWARENESS: 0,
  ACCEPTANCE: 1,
  INTEGRATION: 2,
  SYNTHESIS: 3,
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get profile
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { archetype: true, streakDays: true, currentStation: true },
    });

    // Today's date boundaries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check today's rituals
    const [todayMood, todayJournal, todayBreath, todayCompanion] = await Promise.all([
      prisma.moodEntry.findFirst({
        where: { userId, createdAt: { gte: today, lt: tomorrow } },
      }),
      prisma.journalEntry.findFirst({
        where: { userId, createdAt: { gte: today, lt: tomorrow } },
      }),
      prisma.breathSession.findFirst({
        where: { userId, createdAt: { gte: today, lt: tomorrow }, completed: true },
      }),
      prisma.companionMessage.findFirst({
        where: { chat: { userId }, createdAt: { gte: today, lt: tomorrow }, role: 'user' },
      }),
    ]);

    // Get stats
    const [moodCount, journalCount, breathCount, badgeCount] = await Promise.all([
      prisma.moodEntry.count({ where: { userId } }),
      prisma.journalEntry.count({ where: { userId } }),
      prisma.breathSession.count({ where: { userId, completed: true } }),
      prisma.userBadge.count({ where: { userId } }),
    ]);

    // Get recent badges
    const recentBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: { select: { id: true, name: true, icon: true } } },
      orderBy: { earnedAt: 'desc' },
      take: 5,
    });

    // Week activity (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const weekMoods = await prisma.moodEntry.findMany({
      where: { userId, createdAt: { gte: weekAgo } },
      select: { createdAt: true, moodScore: true },
      orderBy: { createdAt: 'asc' },
    });

    // Build week activity array (last 7 days, true if any activity)
    const weekActivity: boolean[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      const hasActivity = weekMoods.some(
        (m) => m.createdAt >= day && m.createdAt < nextDay
      );
      weekActivity.push(hasActivity);
    }

    // Mood trend for chart
    const moodTrend = weekMoods.map((m) => ({
      date: m.createdAt.toISOString().split('T')[0],
      score: m.moodScore,
    }));

    // Convert station name to index
    const stationName = profile?.currentStation || 'AWARENESS';
    const stationIndex = STATION_INDEX[stationName] ?? 0;

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          archetype: profile?.archetype || 'SEEKER',
          streakDays: profile?.streakDays || 0,
          longestStreak: profile?.streakDays || 0,
          currentStation: stationIndex,
        },
        stats: {
          moodCheckins: moodCount,
          journalEntries: journalCount,
          breathSessions: breathCount,
          totalBadges: badgeCount,
          streakDays: profile?.streakDays || 0,
        },
        rituals: {
          mood: !!todayMood,
          journal: !!todayJournal,
          breath: !!todayBreath,
          companion: !!todayCompanion,
        },
        weekActivity,
        recentBadges: recentBadges.map((ub) => ({
          id: ub.badge.id,
          name: ub.badge.name,
          icon: ub.badge.icon,
          earnedAt: ub.earnedAt.toISOString(),
        })),
        moodTrend,
      },
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
