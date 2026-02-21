import prisma from '@/lib/prisma';

/**
 * User Journey & Graduation Service
 *
 * Tracks user's wellness journey through defined stages:
 * - Onboarding: Initial assessment and setup
 * - Awareness: Learning about patterns and triggers
 * - Building: Developing coping skills and routines
 * - Maintaining: Sustaining healthy habits
 * - Graduating: Ready for reduced support
 *
 * Manages milestones, wellness scoring, and graduation criteria.
 */

// ─── Types ──────────────────────────────────────────────────────

export type JourneyStage = 'onboarding' | 'awareness' | 'building' | 'maintaining' | 'graduating';

export interface CompletedMilestone {
  id: string;
  completedAt: string;
}

export interface WellnessHistoryEntry {
  date: string;
  score: number;
}

export interface GraduationCriteria {
  stable_mood_30days: boolean;
  coping_skills_mastered: number;
  streak_14days: boolean;
  low_risk_30days: boolean;
  therapist_approval?: boolean;
}

export interface UserJourney {
  id: string;
  userId: string;
  currentStage: JourneyStage;
  stageStartedAt: Date;
  milestonesCompleted: CompletedMilestone[];
  wellnessScore: number;
  wellnessHistory: WellnessHistoryEntry[];
  graduationCriteria: GraduationCriteria;
  graduationEligible: boolean;
  graduatedAt?: Date;
  graduationNotes?: string;
  pausedAt?: Date;
  pauseReason?: string;
}

// ─── Journey Management ─────────────────────────────────────────

/**
 * Get or create user journey
 */
export async function getUserJourney(userId: string): Promise<UserJourney> {
  let journey = await prisma.userJourney.findUnique({
    where: { userId },
  });

  if (!journey) {
    journey = await prisma.userJourney.create({
      data: {
        userId,
        currentStage: 'onboarding',
        stageStartedAt: new Date(),
        wellnessScore: 50, // Start at neutral
        graduationEligible: false,
      },
    });
  }

  return mapPrismaJourney(journey);
}

/**
 * Update user's journey stage
 */
export async function updateJourneyStage(
  userId: string,
  newStage: JourneyStage
): Promise<UserJourney> {
  const journey = await prisma.userJourney.update({
    where: { userId },
    data: {
      currentStage: newStage,
      stageStartedAt: new Date(),
    },
  });

  return mapPrismaJourney(journey);
}

/**
 * Complete a milestone
 */
export async function completeMilestone(
  userId: string,
  milestoneId: string
): Promise<{ journey: UserJourney; celebrationMessage?: string }> {
  const existing = await prisma.userJourney.findUnique({
    where: { userId },
  });

  if (!existing) {
    throw new Error('User journey not found');
  }

  const milestones = (existing.milestonesCompleted as unknown as unknown as CompletedMilestone[]) || [];

  // Check if already completed
  if (milestones.some((m) => m.id === milestoneId)) {
    return { journey: mapPrismaJourney(existing) };
  }

  // Add milestone
  const newMilestones = [
    ...milestones,
    { id: milestoneId, completedAt: new Date().toISOString() },
  ];

  // Get milestone details for celebration
  const milestone = await prisma.journeyMilestone.findUnique({
    where: { slug: milestoneId },
  });

  // Update journey
  const journey = await prisma.userJourney.update({
    where: { userId },
    data: {
      milestonesCompleted: newMilestones as unknown as object,
    },
  });

  // Check for stage progression
  await checkStageProgression(userId);

  return {
    journey: mapPrismaJourney(journey),
    celebrationMessage: milestone?.celebrationMessage || undefined,
  };
}

/**
 * Update wellness score
 */
export async function updateWellnessScore(
  userId: string,
  score: number
): Promise<UserJourney> {
  const existing = await prisma.userJourney.findUnique({
    where: { userId },
  });

  if (!existing) {
    throw new Error('User journey not found');
  }

  const history = (existing.wellnessHistory as unknown as WellnessHistoryEntry[]) || [];

  // Add to history (keep last 90 days)
  const newHistory = [
    ...history.slice(-89),
    { date: new Date().toISOString(), score },
  ];

  const journey = await prisma.userJourney.update({
    where: { userId },
    data: {
      wellnessScore: score,
      wellnessHistory: newHistory as unknown as object,
    },
  });

  // Check graduation criteria
  await checkGraduationCriteria(userId);

  return mapPrismaJourney(journey);
}

// ─── Graduation System ──────────────────────────────────────────

/**
 * Check and update graduation criteria
 */
export async function checkGraduationCriteria(userId: string): Promise<GraduationCriteria> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  // Get recent mood entries
  const recentMoods = await prisma.moodEntry.findMany({
    where: {
      userId,
      createdAt: { gte: thirtyDaysAgo },
    },
    select: { moodScore: true, phq9Score: true, gad7Score: true },
  });

  // Check stable mood (variance < 2 and avg > 5)
  const moodScores = recentMoods.map((m) => m.moodScore);
  const avgMood = moodScores.length > 0
    ? moodScores.reduce((a, b) => a + b, 0) / moodScores.length
    : 0;
  const moodVariance = moodScores.length > 0
    ? moodScores.reduce((sum, m) => sum + Math.pow(m - avgMood, 2), 0) / moodScores.length
    : 10;
  const stableMood = moodScores.length >= 20 && avgMood >= 5 && moodVariance < 4;

  // Check completed breath/journal sessions for coping skills
  const [breathSessions, journalEntries] = await Promise.all([
    prisma.breathSession.count({
      where: {
        userId,
        completed: true,
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.journalEntry.count({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
  ]);
  const copingSkillsMastered = Math.min(5, Math.floor((breathSessions + journalEntries) / 10));

  // Check streak
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { streakDays: true },
  });
  const streak14Days = (profile?.streakDays || 0) >= 14;

  // Check low risk (no PHQ-9 >= 15 or GAD-7 >= 15 in 30 days)
  const highRiskEntries = recentMoods.filter(
    (m) => (m.phq9Score && m.phq9Score >= 15) || (m.gad7Score && m.gad7Score >= 15)
  );
  const lowRisk30Days = highRiskEntries.length === 0 && recentMoods.length >= 10;

  const criteria: GraduationCriteria = {
    stable_mood_30days: stableMood,
    coping_skills_mastered: copingSkillsMastered,
    streak_14days: streak14Days,
    low_risk_30days: lowRisk30Days,
  };

  // Check if eligible
  const graduationEligible =
    criteria.stable_mood_30days &&
    criteria.coping_skills_mastered >= 3 &&
    criteria.streak_14days &&
    criteria.low_risk_30days;

  // Update journey
  await prisma.userJourney.update({
    where: { userId },
    data: {
      graduationCriteria: criteria as unknown as object,
      graduationEligible,
    },
  });

  return criteria;
}

/**
 * Graduate user (with optional notes)
 */
export async function graduateUser(
  userId: string,
  notes?: string
): Promise<UserJourney> {
  const journey = await prisma.userJourney.update({
    where: { userId },
    data: {
      currentStage: 'graduating',
      graduatedAt: new Date(),
      graduationNotes: notes,
    },
  });

  return mapPrismaJourney(journey);
}

// ─── Stage Progression ──────────────────────────────────────────

const STAGE_ORDER: JourneyStage[] = ['onboarding', 'awareness', 'building', 'maintaining', 'graduating'];

const STAGE_REQUIREMENTS: Record<JourneyStage, { minMilestones: number; minDays: number }> = {
  onboarding: { minMilestones: 3, minDays: 1 },
  awareness: { minMilestones: 5, minDays: 7 },
  building: { minMilestones: 8, minDays: 14 },
  maintaining: { minMilestones: 12, minDays: 30 },
  graduating: { minMilestones: 15, minDays: 60 },
};

/**
 * Check if user should progress to next stage
 */
async function checkStageProgression(userId: string): Promise<void> {
  const journey = await prisma.userJourney.findUnique({
    where: { userId },
  });

  if (!journey) return;

  const currentIndex = STAGE_ORDER.indexOf(journey.currentStage as JourneyStage);
  if (currentIndex >= STAGE_ORDER.length - 1) return; // Already at final stage

  const nextStage = STAGE_ORDER[currentIndex + 1];
  const requirements = STAGE_REQUIREMENTS[journey.currentStage as JourneyStage];

  const milestones = (journey.milestonesCompleted as unknown as CompletedMilestone[]) || [];
  const daysInStage = Math.floor(
    (Date.now() - new Date(journey.stageStartedAt).getTime()) / (24 * 60 * 60 * 1000)
  );

  // Get required milestones for current stage
  const stageMilestones = await prisma.journeyMilestone.findMany({
    where: {
      stage: journey.currentStage,
      isRequired: true,
    },
  });

  const completedRequired = stageMilestones.filter((sm) =>
    milestones.some((m) => m.id === sm.slug)
  );

  // Check if requirements are met
  const milestonesComplete = completedRequired.length >= stageMilestones.length;
  const totalMilestonesMet = milestones.length >= requirements.minMilestones;
  const daysRequirementMet = daysInStage >= requirements.minDays;

  if (milestonesComplete && totalMilestonesMet && daysRequirementMet) {
    await updateJourneyStage(userId, nextStage);
  }
}

// ─── Wellness Score Calculation ─────────────────────────────────

/**
 * Calculate current wellness score based on multiple factors
 */
export async function calculateWellnessScore(userId: string): Promise<number> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [moodEntries, journalCount, breathCount, profile, escalations] = await Promise.all([
    prisma.moodEntry.findMany({
      where: { userId, createdAt: { gte: sevenDaysAgo } },
      select: { moodScore: true, sentimentScore: true },
    }),
    prisma.journalEntry.count({
      where: { userId, createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.breathSession.count({
      where: { userId, completed: true, createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.userProfile.findUnique({
      where: { userId },
      select: { streakDays: true },
    }),
    prisma.escalation.count({
      where: {
        userId,
        createdAt: { gte: sevenDaysAgo },
        status: { in: ['PENDING', 'AI_TWIN_REVIEW', 'IN_PROGRESS'] },
      },
    }),
  ]);

  // Mood component (0-40 points)
  const avgMood = moodEntries.length > 0
    ? moodEntries.reduce((sum, m) => sum + m.moodScore, 0) / moodEntries.length
    : 5;
  const moodScore = (avgMood / 10) * 40;

  // Engagement component (0-30 points)
  const engagementDays = Math.min(7, journalCount + breathCount);
  const engagementScore = (engagementDays / 7) * 30;

  // Streak component (0-20 points)
  const streakDays = profile?.streakDays || 0;
  const streakScore = Math.min(20, streakDays * 2);

  // Risk adjustment (-30 to 0 points)
  const riskPenalty = escalations * -15;

  // Calculate total (0-100 scale)
  const total = Math.max(0, Math.min(100, moodScore + engagementScore + streakScore + riskPenalty));

  // Update journey
  await updateWellnessScore(userId, Math.round(total));

  return Math.round(total);
}

// ─── Context Building ───────────────────────────────────────────

/**
 * Build journey context for AI prompt
 */
export async function buildJourneyContext(userId: string): Promise<string> {
  const journey = await getUserJourney(userId);

  let context = '\n## User Journey Status\n';
  context += `Current stage: ${journey.currentStage.toUpperCase()}\n`;
  context += `Wellness score: ${journey.wellnessScore}/100\n`;
  context += `Milestones completed: ${journey.milestonesCompleted.length}\n`;

  if (journey.graduationEligible) {
    context += '\n**Note**: This user meets graduation criteria. Consider discussing next steps.\n';
  }

  // Get recent wellness trend
  if (journey.wellnessHistory.length >= 7) {
    const recent = journey.wellnessHistory.slice(-7);
    const trend = recent[recent.length - 1].score - recent[0].score;
    if (trend > 10) {
      context += '\nWellness trend: IMPROVING (celebrate this!)\n';
    } else if (trend < -10) {
      context += '\nWellness trend: DECLINING (be supportive, explore gently)\n';
    } else {
      context += '\nWellness trend: STABLE\n';
    }
  }

  return context;
}

// ─── Milestone Management ───────────────────────────────────────

/**
 * Seed default journey milestones
 */
export async function seedJourneyMilestones(): Promise<void> {
  const milestones = [
    // Onboarding
    { slug: 'complete_fog_tunnel', name: 'Enter the Fog', category: 'onboarding', stage: 'onboarding', order: 1, isRequired: true, celebrationMessage: 'You\'ve taken the first step into understanding yourself.' },
    { slug: 'complete_ace', name: 'Face Your History', category: 'onboarding', stage: 'onboarding', order: 2, isRequired: true, celebrationMessage: 'Acknowledging the past takes courage.' },
    { slug: 'discover_archetype', name: 'Meet Your Archetype', category: 'onboarding', stage: 'onboarding', order: 3, isRequired: true, celebrationMessage: 'Welcome to your journey, traveler.' },

    // Awareness
    { slug: 'first_mood_entry', name: 'First Reflection', category: 'ritual', stage: 'awareness', order: 10, isRequired: true, celebrationMessage: 'The first step to change is awareness.' },
    { slug: 'first_journal', name: 'First Words', category: 'ritual', stage: 'awareness', order: 11, isRequired: true, celebrationMessage: 'Your story matters.' },
    { slug: 'first_breath', name: 'First Breath', category: 'ritual', stage: 'awareness', order: 12, isRequired: true, celebrationMessage: 'Breath is always with you.' },
    { slug: 'week_streak', name: '7-Day Streak', category: 'streak', stage: 'awareness', order: 15, isRequired: false, celebrationMessage: 'A week of showing up for yourself!' },

    // Building
    { slug: 'ai_twin_intro', name: 'Meet Your Twin', category: 'emotional', stage: 'building', order: 20, isRequired: true, celebrationMessage: 'You have a companion for this journey.' },
    { slug: 'identify_trigger', name: 'Name a Trigger', category: 'emotional', stage: 'building', order: 21, isRequired: false, celebrationMessage: 'Naming it gives you power over it.' },
    { slug: 'successful_reframe', name: 'Shift Perspective', category: 'emotional', stage: 'building', order: 22, isRequired: false, celebrationMessage: 'You can change how you see things.' },
    { slug: 'two_week_streak', name: '14-Day Streak', category: 'streak', stage: 'building', order: 25, isRequired: true, celebrationMessage: 'Two weeks of dedication!' },

    // Maintaining
    { slug: 'month_streak', name: '30-Day Streak', category: 'streak', stage: 'maintaining', order: 30, isRequired: true, celebrationMessage: 'A month of commitment to yourself.' },
    { slug: 'stable_mood_week', name: 'Stable Week', category: 'emotional', stage: 'maintaining', order: 31, isRequired: false, celebrationMessage: 'Your emotions are finding balance.' },
    { slug: 'help_community', name: 'Community Support', category: 'social', stage: 'maintaining', order: 35, isRequired: false, celebrationMessage: 'Helping others helps you grow.' },

    // Graduation
    { slug: 'three_month_streak', name: '90-Day Journey', category: 'graduation', stage: 'graduating', order: 40, isRequired: true, celebrationMessage: 'Three months of transformation.' },
    { slug: 'graduation_ready', name: 'Ready to Graduate', category: 'graduation', stage: 'graduating', order: 50, isRequired: true, celebrationMessage: 'You\'ve built a foundation for life.' },
  ];

  for (const milestone of milestones) {
    await prisma.journeyMilestone.upsert({
      where: { slug: milestone.slug },
      update: milestone,
      create: {
        ...milestone,
        criteria: { type: 'manual' }, // Will be implemented per milestone
      },
    });
  }

  console.log(`Seeded ${milestones.length} journey milestones`);
}

// ─── Helper Functions ───────────────────────────────────────────

function mapPrismaJourney(journey: any): UserJourney {
  return {
    id: journey.id,
    userId: journey.userId,
    currentStage: journey.currentStage as JourneyStage,
    stageStartedAt: journey.stageStartedAt,
    milestonesCompleted: (journey.milestonesCompleted as unknown as CompletedMilestone[]) || [],
    wellnessScore: journey.wellnessScore || 50,
    wellnessHistory: (journey.wellnessHistory as unknown as WellnessHistoryEntry[]) || [],
    graduationCriteria: (journey.graduationCriteria as GraduationCriteria) || {
      stable_mood_30days: false,
      coping_skills_mastered: 0,
      streak_14days: false,
      low_risk_30days: false,
    },
    graduationEligible: journey.graduationEligible || false,
    graduatedAt: journey.graduatedAt || undefined,
    graduationNotes: journey.graduationNotes || undefined,
    pausedAt: journey.pausedAt || undefined,
    pauseReason: journey.pauseReason || undefined,
  };
}
