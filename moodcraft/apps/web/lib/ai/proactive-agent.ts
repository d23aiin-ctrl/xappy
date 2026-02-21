import OpenAI from 'openai';
import { Archetype } from '@prisma/client';
import prisma from '@/lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Pattern types the agent can detect
export type PatternType =
  | 'mood_decline'
  | 'activity_gap'
  | 'streak_milestone'
  | 'journaling_pattern'
  | 'positive_trend'
  | 'check_in_reminder'
  | 'evening_reflection'
  | 'weekend_wellness';

export interface UserPattern {
  type: PatternType;
  severity: 'low' | 'medium' | 'high';
  data: Record<string, any>;
  description: string;
}

export interface UserContext {
  userId: string;
  name: string;
  archetype: Archetype;
  patterns: UserPattern[];
  recentMoods: { score: number; date: Date }[];
  lastActivity: Date | null;
  streakDays: number;
  journalEntryCount: number;
  lastJournalSentiment: string | null;
}

// Archetype-specific tone adjustments for nudges
const ARCHETYPE_NUDGE_TONES: Record<Archetype, string> = {
  DRIFTER: 'gentle, poetic, using soft metaphors. Speak like a kind friend who understands wandering souls.',
  THINKER: 'thoughtful and structured, offering insights and frameworks. Respect their analytical nature.',
  TRANSFORMER: 'empowering and affirming. Celebrate their strength and growth journey.',
  SEEKER: 'warm, safe, and reassuring. Extra gentle, building trust through consistency.',
  VETERAN: 'direct and practical. Skip fluff, respect their experience and wisdom.',
};

/**
 * Analyze a user's patterns over the past week
 */
export async function analyzeUserPatterns(userId: string): Promise<UserContext> {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
    },
  });

  if (!user || !user.profile) {
    throw new Error('User or profile not found');
  }

  // Fetch mood entries
  const moodEntries = await prisma.moodEntry.findMany({
    where: {
      userId,
      createdAt: { gte: oneWeekAgo },
    },
    orderBy: { createdAt: 'desc' },
    take: 14,
  });

  // Fetch journal entries
  const journalEntries = await prisma.journalEntry.findMany({
    where: {
      userId,
      createdAt: { gte: oneWeekAgo },
    },
    orderBy: { createdAt: 'desc' },
    take: 7,
  });

  // Fetch breath sessions
  const breathSessions = await prisma.breathSession.findMany({
    where: {
      userId,
      createdAt: { gte: oneWeekAgo },
    },
  });

  // Fetch last companion chat
  const lastChat = await prisma.companionChat.findFirst({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });

  // Analyze patterns
  const patterns: UserPattern[] = [];

  // 1. Mood decline detection
  if (moodEntries.length >= 3) {
    const recentAvg = moodEntries.slice(0, 3).reduce((sum, m) => sum + m.moodScore, 0) / 3;
    const olderAvg = moodEntries.slice(3).reduce((sum, m) => sum + m.moodScore, 0) / Math.max(moodEntries.length - 3, 1);

    if (recentAvg < olderAvg - 1.5) {
      patterns.push({
        type: 'mood_decline',
        severity: recentAvg < 4 ? 'high' : 'medium',
        data: { recentAvg, olderAvg, decline: olderAvg - recentAvg },
        description: `Mood has declined from ${olderAvg.toFixed(1)} to ${recentAvg.toFixed(1)} average`,
      });
    }
  }

  // 2. Activity gap detection
  const lastActivityDate = Math.max(
    moodEntries[0]?.createdAt?.getTime() || 0,
    journalEntries[0]?.createdAt?.getTime() || 0,
    breathSessions[0]?.createdAt?.getTime() || 0,
    lastChat?.updatedAt?.getTime() || 0
  );

  const daysSinceActivity = lastActivityDate
    ? Math.floor((Date.now() - lastActivityDate) / (24 * 60 * 60 * 1000))
    : 999;

  if (daysSinceActivity >= 3) {
    patterns.push({
      type: 'activity_gap',
      severity: daysSinceActivity >= 7 ? 'high' : daysSinceActivity >= 5 ? 'medium' : 'low',
      data: { daysSinceActivity },
      description: `No activity for ${daysSinceActivity} days`,
    });
  }

  // 3. Streak milestone
  const streakDays = user.profile.streakDays || 0;
  if ([7, 14, 21, 30, 60, 90, 100].includes(streakDays)) {
    patterns.push({
      type: 'streak_milestone',
      severity: 'low',
      data: { streakDays },
      description: `Reached ${streakDays}-day streak milestone`,
    });
  }

  // 4. Positive trend detection
  if (moodEntries.length >= 3) {
    const recentAvg = moodEntries.slice(0, 3).reduce((sum, m) => sum + m.moodScore, 0) / 3;
    if (recentAvg >= 7) {
      patterns.push({
        type: 'positive_trend',
        severity: 'low',
        data: { recentAvg },
        description: `Mood trending positive with ${recentAvg.toFixed(1)} average`,
      });
    }
  }

  // 5. Journaling pattern analysis
  if (journalEntries.length > 0) {
    const negativeEntries = journalEntries.filter(
      (e) => e.sentimentLabel === 'negative' || (e.sentimentScore !== null && e.sentimentScore < -0.3)
    );
    if (negativeEntries.length >= 3) {
      patterns.push({
        type: 'journaling_pattern',
        severity: 'medium',
        data: { negativeCount: negativeEntries.length, total: journalEntries.length },
        description: `${negativeEntries.length} of ${journalEntries.length} recent journal entries show negative sentiment`,
      });
    }
  }

  // 6. Time-based check-in reminders
  const hour = new Date().getHours();
  const dayOfWeek = new Date().getDay();

  if (hour >= 18 && hour <= 21 && moodEntries.length === 0) {
    patterns.push({
      type: 'evening_reflection',
      severity: 'low',
      data: { hour },
      description: 'Evening time - good for reflection',
    });
  }

  if ((dayOfWeek === 0 || dayOfWeek === 6) && daysSinceActivity >= 1) {
    patterns.push({
      type: 'weekend_wellness',
      severity: 'low',
      data: { dayOfWeek },
      description: 'Weekend wellness check-in',
    });
  }

  return {
    userId,
    name: user.name || 'Friend',
    archetype: user.profile.archetype || 'SEEKER',
    patterns,
    recentMoods: moodEntries.map((m) => ({ score: m.moodScore, date: m.createdAt })),
    lastActivity: lastActivityDate ? new Date(lastActivityDate) : null,
    streakDays,
    journalEntryCount: journalEntries.length,
    lastJournalSentiment: journalEntries[0]?.sentimentLabel || null,
  };
}

/**
 * Generate a personalized nudge based on patterns
 */
export async function generateNudge(context: UserContext): Promise<{
  title: string;
  body: string;
  type: PatternType;
  priority: 'low' | 'medium' | 'high';
} | null> {
  if (context.patterns.length === 0) {
    return null;
  }

  // Prioritize patterns by severity
  const sortedPatterns = [...context.patterns].sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });

  const primaryPattern = sortedPatterns[0];
  const tone = ARCHETYPE_NUDGE_TONES[context.archetype];

  const prompt = `You are a compassionate AI wellness companion. Generate a brief, personalized nudge message for a user.

USER CONTEXT:
- Name: ${context.name}
- Archetype: ${context.archetype}
- Current streak: ${context.streakDays} days
- Recent mood trend: ${context.recentMoods.slice(0, 3).map((m) => m.score).join(', ') || 'No data'}
- Last activity: ${context.lastActivity ? `${Math.floor((Date.now() - context.lastActivity.getTime()) / (24 * 60 * 60 * 1000))} days ago` : 'Never'}

DETECTED PATTERN:
- Type: ${primaryPattern.type}
- Description: ${primaryPattern.description}
- Severity: ${primaryPattern.severity}

TONE GUIDANCE:
${tone}

INSTRUCTIONS:
1. Generate a SHORT title (max 50 chars) that's warm and inviting
2. Generate a body message (2-3 sentences max) that:
   - Acknowledges their situation without being preachy
   - Offers a gentle invitation, not a command
   - Feels personal, not generic
   - For ${context.archetype} archetype, match their communication style
3. DO NOT mention "AI", "algorithm", or that you're monitoring them
4. Make it feel like a thoughtful friend checking in

Respond in JSON format:
{
  "title": "...",
  "body": "..."
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 200,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      title: result.title || 'A moment for you',
      body: result.body || 'Take a breath. You matter.',
      type: primaryPattern.type,
      priority: primaryPattern.severity,
    };
  } catch (error) {
    console.error('Failed to generate nudge:', error);
    // Fallback to template-based nudge
    return generateFallbackNudge(context, primaryPattern);
  }
}

/**
 * Fallback template-based nudges when AI is unavailable
 */
function generateFallbackNudge(
  context: UserContext,
  pattern: UserPattern
): { title: string; body: string; type: PatternType; priority: 'low' | 'medium' | 'high' } {
  const templates: Record<PatternType, { title: string; body: string }[]> = {
    mood_decline: [
      {
        title: 'Checking in with you',
        body: `Hey ${context.name}, I noticed things might feel heavier lately. No pressure, but I'm here if you want to talk or just sit together in silence.`,
      },
    ],
    activity_gap: [
      {
        title: 'Missing you',
        body: `It's been a few days since we connected, ${context.name}. Whenever you're ready, your space here is waiting for you.`,
      },
    ],
    streak_milestone: [
      {
        title: `${context.streakDays} days strong!`,
        body: `${context.name}, you've shown up for yourself ${context.streakDays} days in a row. That consistency is something to celebrate.`,
      },
    ],
    positive_trend: [
      {
        title: 'Your light is showing',
        body: `I've noticed a warmth in your recent reflections, ${context.name}. Whatever you're doing, it seems to be working. Keep going.`,
      },
    ],
    journaling_pattern: [
      {
        title: 'A gentle thought',
        body: `${context.name}, your journal has been holding some heavy things. Remember, putting words to feelings is brave work.`,
      },
    ],
    check_in_reminder: [
      {
        title: 'A moment to pause',
        body: `Hey ${context.name}, just a soft reminder that a quick check-in can sometimes shift the whole day.`,
      },
    ],
    evening_reflection: [
      {
        title: 'Evening stillness',
        body: `The day is winding down, ${context.name}. A quiet moment of reflection might be just what you need.`,
      },
    ],
    weekend_wellness: [
      {
        title: 'Weekend check-in',
        body: `Hope your weekend is treating you well, ${context.name}. Even a few minutes of self-care can recharge you for the week ahead.`,
      },
    ],
  };

  const options = templates[pattern.type] || templates.check_in_reminder;
  const selected = options[Math.floor(Math.random() * options.length)];

  return {
    ...selected,
    type: pattern.type,
    priority: pattern.severity,
  };
}

/**
 * Process a batch of users and create nudges
 */
export async function processUserBatch(userIds: string[]): Promise<number> {
  let nudgesCreated = 0;

  for (const userId of userIds) {
    try {
      // Check if user already has a recent nudge (within 24 hours)
      const recentNudge = await prisma.notification.findFirst({
        where: {
          userId,
          type: 'RITUAL_REMINDER',
          sentAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      });

      if (recentNudge) {
        continue; // Skip - already nudged recently
      }

      // Analyze patterns
      const context = await analyzeUserPatterns(userId);

      // Generate nudge if patterns exist
      const nudge = await generateNudge(context);

      if (nudge) {
        // Store notification
        await prisma.notification.create({
          data: {
            userId,
            type: 'RITUAL_REMINDER',
            title: nudge.title,
            body: nudge.body,
            data: {
              patternType: nudge.type,
              priority: nudge.priority,
              generatedAt: new Date().toISOString(),
            },
          },
        });

        nudgesCreated++;

        // Log for audit
        await prisma.auditLog.create({
          data: {
            actorId: 'system',
            action: 'agent.nudge_created',
            resource: 'notification',
            resourceId: userId,
            details: {
              patternType: nudge.type,
              priority: nudge.priority,
            },
          },
        });
      }
    } catch (error) {
      console.error(`Failed to process user ${userId}:`, error);
    }
  }

  return nudgesCreated;
}

/**
 * Get active users who should be analyzed
 */
export async function getActiveUserIds(limit: number = 100): Promise<string[]> {
  // Get users who have been active in the last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const users = await prisma.user.findMany({
    where: {
      role: 'INDIVIDUAL',
      profile: {
        onboardingDone: true,
      },
      OR: [
        { moodEntries: { some: { createdAt: { gte: thirtyDaysAgo } } } },
        { journalEntries: { some: { createdAt: { gte: thirtyDaysAgo } } } },
        { breathSessions: { some: { createdAt: { gte: thirtyDaysAgo } } } },
      ],
    },
    select: { id: true },
    take: limit,
  });

  return users.map((u) => u.id);
}
