import prisma from '@/lib/prisma';

/**
 * Session Goals Service
 *
 * Tracks active therapeutic goals per user:
 * - Goals can be set by user, AI Twin, or therapist
 * - Progress is tracked through milestones
 * - Integrates with session context for continuity
 */

// ─── Types ──────────────────────────────────────────────────────

export type GoalSource = 'user' | 'ai_twin' | 'therapist';
export type GoalStatus = 'active' | 'achieved' | 'paused' | 'abandoned';
export type GoalCategory =
  | 'coping_skills'
  | 'emotional_regulation'
  | 'relationship'
  | 'self_awareness'
  | 'behavior_change'
  | 'thought_patterns'
  | 'trauma_processing'
  | 'general_wellness';

export interface Milestone {
  id: string;
  title: string;
  achieved: boolean;
  achievedAt?: string;
  notes?: string;
}

export interface SessionGoal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: GoalCategory;
  setBy: GoalSource;
  setById?: string;
  status: GoalStatus;
  progressPct: number;
  milestones: Milestone[];
  targetDate?: Date;
  achievedAt?: Date;
  evidenceNotes?: any[];
  relatedInterventions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Goal Management ────────────────────────────────────────────

/**
 * Create a new session goal
 */
export async function createGoal(
  userId: string,
  data: {
    title: string;
    description?: string;
    category: GoalCategory;
    setBy: GoalSource;
    setById?: string;
    targetDate?: Date;
    milestones?: Omit<Milestone, 'id' | 'achieved' | 'achievedAt'>[];
  }
): Promise<SessionGoal> {
  const milestones = (data.milestones || []).map((m, i) => ({
    id: `milestone-${i}`,
    title: m.title,
    achieved: false,
    notes: m.notes,
  }));

  const goal = await prisma.sessionGoal.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      category: data.category,
      setBy: data.setBy,
      setById: data.setById,
      targetDate: data.targetDate,
      milestones: milestones,
      status: 'active',
      progressPct: 0,
    },
  });

  return mapPrismaGoal(goal);
}

/**
 * Get all active goals for a user
 */
export async function getActiveGoals(userId: string): Promise<SessionGoal[]> {
  const goals = await prisma.sessionGoal.findMany({
    where: {
      userId,
      status: 'active',
    },
    orderBy: { createdAt: 'desc' },
  });

  return goals.map(mapPrismaGoal);
}

/**
 * Get all goals for a user (including completed)
 */
export async function getAllGoals(
  userId: string,
  options: { status?: GoalStatus; category?: GoalCategory; limit?: number } = {}
): Promise<SessionGoal[]> {
  const { status, category, limit = 20 } = options;

  const whereClause: any = { userId };
  if (status) whereClause.status = status;
  if (category) whereClause.category = category;

  const goals = await prisma.sessionGoal.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return goals.map(mapPrismaGoal);
}

/**
 * Update a goal's progress
 */
export async function updateGoalProgress(
  goalId: string,
  userId: string,
  data: {
    progressPct?: number;
    evidenceNote?: string;
    milestoneId?: string;
    milestoneCompleted?: boolean;
  }
): Promise<SessionGoal | null> {
  const existing = await prisma.sessionGoal.findFirst({
    where: { id: goalId, userId },
  });

  if (!existing) return null;

  const updates: any = {};

  // Update progress percentage
  if (data.progressPct !== undefined) {
    updates.progressPct = Math.min(100, Math.max(0, data.progressPct));
  }

  // Add evidence note
  if (data.evidenceNote) {
    const existingNotes = (existing.evidenceNotes as any[]) || [];
    updates.evidenceNotes = [
      ...existingNotes,
      {
        note: data.evidenceNote,
        date: new Date().toISOString(),
      },
    ];
  }

  // Update milestone
  if (data.milestoneId !== undefined) {
    const milestones = (existing.milestones as unknown as Milestone[]) || [];
    const updatedMilestones = milestones.map((m) => {
      if (m.id === data.milestoneId) {
        return {
          ...m,
          achieved: data.milestoneCompleted ?? true,
          achievedAt: data.milestoneCompleted ? new Date().toISOString() : undefined,
        };
      }
      return m;
    });
    updates.milestones = updatedMilestones;

    // Auto-calculate progress based on milestones
    const completedCount = updatedMilestones.filter((m) => m.achieved).length;
    if (updatedMilestones.length > 0) {
      updates.progressPct = Math.round((completedCount / updatedMilestones.length) * 100);
    }
  }

  // Check if goal should be marked as achieved
  if (updates.progressPct === 100) {
    updates.status = 'achieved';
    updates.achievedAt = new Date();
  }

  const updated = await prisma.sessionGoal.update({
    where: { id: goalId },
    data: updates,
  });

  return mapPrismaGoal(updated);
}

/**
 * Update goal status
 */
export async function updateGoalStatus(
  goalId: string,
  userId: string,
  status: GoalStatus
): Promise<SessionGoal | null> {
  const existing = await prisma.sessionGoal.findFirst({
    where: { id: goalId, userId },
  });

  if (!existing) return null;

  const updates: any = { status };

  if (status === 'achieved') {
    updates.achievedAt = new Date();
    updates.progressPct = 100;
  }

  const updated = await prisma.sessionGoal.update({
    where: { id: goalId },
    data: updates,
  });

  return mapPrismaGoal(updated);
}

/**
 * Add an intervention that helped with a goal
 */
export async function addRelatedIntervention(
  goalId: string,
  userId: string,
  interventionType: string
): Promise<void> {
  const existing = await prisma.sessionGoal.findFirst({
    where: { id: goalId, userId },
  });

  if (!existing) return;

  const relatedInterventions = (existing.relatedInterventions as string[]) || [];

  if (!relatedInterventions.includes(interventionType)) {
    await prisma.sessionGoal.update({
      where: { id: goalId },
      data: {
        relatedInterventions: [...relatedInterventions, interventionType],
      },
    });
  }
}

// ─── AI Integration ─────────────────────────────────────────────

/**
 * Build goal context for AI prompt
 */
export async function buildGoalContext(userId: string): Promise<string> {
  const activeGoals = await getActiveGoals(userId);

  if (activeGoals.length === 0) {
    return '';
  }

  let context = '\n## Active Therapeutic Goals\n';
  context += 'The user is working on the following goals:\n\n';

  for (const goal of activeGoals) {
    context += `### ${goal.title} (${goal.progressPct}% complete)\n`;
    context += `Category: ${goal.category.replace(/_/g, ' ')}\n`;
    if (goal.description) {
      context += `Description: ${goal.description}\n`;
    }

    if (goal.milestones && goal.milestones.length > 0) {
      const pending = goal.milestones.filter((m) => !m.achieved);
      if (pending.length > 0) {
        context += `Next milestones: ${pending.slice(0, 2).map((m) => m.title).join(', ')}\n`;
      }
    }

    context += '\n';
  }

  context += 'Reference these goals naturally in conversation when relevant. Celebrate progress and help with obstacles.\n';

  return context;
}

/**
 * Suggest goals based on user patterns
 */
export async function suggestGoals(
  userId: string,
  context: {
    recentThemes?: string[];
    archetype?: string;
    primaryConcerns?: string[];
  }
): Promise<{ title: string; description: string; category: GoalCategory }[]> {
  const suggestions: { title: string; description: string; category: GoalCategory }[] = [];

  // Check existing goals to avoid duplicates
  const existingGoals = await getActiveGoals(userId);
  const existingCategories = new Set(existingGoals.map((g) => g.category));

  // Suggest based on recent themes
  if (context.recentThemes) {
    if (context.recentThemes.some((t) => t.toLowerCase().includes('anxiety'))) {
      if (!existingCategories.has('coping_skills')) {
        suggestions.push({
          title: 'Develop Anxiety Management Toolkit',
          description: 'Build a personalized set of coping strategies for anxiety',
          category: 'coping_skills',
        });
      }
    }

    if (context.recentThemes.some((t) => t.toLowerCase().includes('relationship'))) {
      if (!existingCategories.has('relationship')) {
        suggestions.push({
          title: 'Strengthen Communication Skills',
          description: 'Practice expressing needs and boundaries in relationships',
          category: 'relationship',
        });
      }
    }

    if (context.recentThemes.some((t) => t.toLowerCase().includes('negative') || t.toLowerCase().includes('thought'))) {
      if (!existingCategories.has('thought_patterns')) {
        suggestions.push({
          title: 'Challenge Negative Thought Patterns',
          description: 'Learn to identify and reframe unhelpful thinking patterns',
          category: 'thought_patterns',
        });
      }
    }
  }

  // Suggest based on primary concerns
  if (context.primaryConcerns) {
    if (context.primaryConcerns.includes('overwhelm') || context.primaryConcerns.includes('stress')) {
      if (!existingCategories.has('emotional_regulation')) {
        suggestions.push({
          title: 'Build Emotional Regulation Skills',
          description: 'Develop strategies to manage intense emotions',
          category: 'emotional_regulation',
        });
      }
    }
  }

  // Always suggest general wellness if no goals
  if (existingGoals.length === 0 && suggestions.length === 0) {
    suggestions.push({
      title: 'Establish Daily Wellness Routine',
      description: 'Create consistent self-care habits that support mental health',
      category: 'general_wellness',
    });
  }

  return suggestions.slice(0, 3); // Max 3 suggestions
}

// ─── Helper Functions ───────────────────────────────────────────

function mapPrismaGoal(goal: any): SessionGoal {
  return {
    id: goal.id,
    userId: goal.userId,
    title: goal.title,
    description: goal.description || undefined,
    category: goal.category as GoalCategory,
    setBy: goal.setBy as GoalSource,
    setById: goal.setById || undefined,
    status: goal.status as GoalStatus,
    progressPct: goal.progressPct,
    milestones: (goal.milestones as Milestone[]) || [],
    targetDate: goal.targetDate || undefined,
    achievedAt: goal.achievedAt || undefined,
    evidenceNotes: goal.evidenceNotes as any[] || undefined,
    relatedInterventions: (goal.relatedInterventions as string[]) || undefined,
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt,
  };
}
