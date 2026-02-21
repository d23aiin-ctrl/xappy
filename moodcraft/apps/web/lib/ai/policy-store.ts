import prisma from '@/lib/prisma';
import type { Archetype } from '@prisma/client';

/**
 * Policy Store Service
 *
 * Externalized rules and configurations for:
 * - Escalation triggers
 * - Intervention protocols
 * - Risk thresholds
 * - Content moderation rules
 *
 * Benefits:
 * - No code changes needed to adjust rules
 * - A/B testing different thresholds
 * - Organization-specific policies
 * - Audit trail of policy changes
 */

// ─── Policy Evaluation Types ────────────────────────────────────

type Operator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'matches';

interface Condition {
  field: string;
  operator: Operator;
  value: any;
}

interface PolicyAction {
  type: string;
  data?: Record<string, any>;
}

interface PolicyRule {
  id: string;
  name: string;
  conditions: Condition[];
  actions: PolicyAction[];
  priority: number;
}

interface EvaluationContext {
  userId?: string;
  archetype?: Archetype;
  organizationId?: string;
  phq9Score?: number;
  gad7Score?: number;
  moodScore?: number;
  sentimentScore?: number;
  messageText?: string;
  streakDays?: number;
  daysInactive?: number;
  [key: string]: any;
}

// ─── Policy Evaluation Engine ───────────────────────────────────

/**
 * Evaluate a single condition against context
 */
function evaluateCondition(condition: Condition, context: EvaluationContext): boolean {
  const fieldValue = context[condition.field];

  if (fieldValue === undefined || fieldValue === null) {
    return false;
  }

  switch (condition.operator) {
    case 'eq':
      return fieldValue === condition.value;
    case 'neq':
      return fieldValue !== condition.value;
    case 'gt':
      return typeof fieldValue === 'number' && fieldValue > condition.value;
    case 'gte':
      return typeof fieldValue === 'number' && fieldValue >= condition.value;
    case 'lt':
      return typeof fieldValue === 'number' && fieldValue < condition.value;
    case 'lte':
      return typeof fieldValue === 'number' && fieldValue <= condition.value;
    case 'contains':
      if (typeof fieldValue === 'string') {
        return fieldValue.toLowerCase().includes(String(condition.value).toLowerCase());
      }
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(condition.value);
      }
      return false;
    case 'in':
      if (Array.isArray(condition.value)) {
        return condition.value.includes(fieldValue);
      }
      return false;
    case 'matches':
      if (typeof fieldValue === 'string') {
        try {
          const regex = new RegExp(condition.value, 'i');
          return regex.test(fieldValue);
        } catch {
          return false;
        }
      }
      return false;
    default:
      return false;
  }
}

/**
 * Evaluate a policy rule against context
 */
function evaluateRule(rule: PolicyRule, context: EvaluationContext): boolean {
  // All conditions must be true (AND logic)
  return rule.conditions.every((condition) => evaluateCondition(condition, context));
}

// ─── Policy Store API ───────────────────────────────────────────

/**
 * Get all active escalation policies
 */
export async function getEscalationPolicies(
  archetype?: Archetype,
  organizationId?: string
): Promise<PolicyRule[]> {
  const rules = await prisma.policyRule.findMany({
    where: {
      category: 'escalation',
      isActive: true,
    },
    orderBy: { priority: 'asc' },
  });

  return rules
    .filter((rule) => {
      // Filter by archetype if specified
      if (rule.archetypes && archetype) {
        const archetypes = rule.archetypes as string[];
        if (!archetypes.includes(archetype)) return false;
      }
      // Filter by organization if specified
      if (rule.organizations && organizationId) {
        const orgs = rule.organizations as string[];
        if (!orgs.includes(organizationId)) return false;
      }
      return true;
    })
    .map((rule) => ({
      id: rule.id,
      name: rule.name,
      conditions: rule.conditions as unknown as Condition[],
      actions: rule.actions as unknown as PolicyAction[],
      priority: rule.priority,
    }));
}

/**
 * Evaluate escalation policies and return triggered actions
 */
export async function evaluateEscalationTriggers(
  context: EvaluationContext
): Promise<{ triggered: boolean; actions: PolicyAction[]; matchedRules: string[] }> {
  const policies = await getEscalationPolicies(context.archetype, context.organizationId);

  const matchedRules: string[] = [];
  const actions: PolicyAction[] = [];

  for (const rule of policies) {
    if (evaluateRule(rule, context)) {
      matchedRules.push(rule.name);
      actions.push(...rule.actions);
    }
  }

  // Deduplicate actions by type
  const uniqueActions = Array.from(new Map(actions.map((a) => [a.type, a])).values());

  return {
    triggered: matchedRules.length > 0,
    actions: uniqueActions,
    matchedRules,
  };
}

/**
 * Get intervention protocol for current context
 */
export async function getInterventionProtocol(
  context: EvaluationContext
): Promise<{ protocol: any; archetypeModifier?: any } | null> {
  const protocols = await prisma.interventionProtocol.findMany({
    where: { isActive: true },
    orderBy: { useCount: 'desc' }, // Prefer well-tested protocols
  });

  for (const protocol of protocols) {
    const conditions = protocol.triggerConditions as Record<string, { lt?: number; gt?: number; lte?: number; gte?: number }>;

    let matches = true;
    for (const [field, thresholds] of Object.entries(conditions)) {
      const value = context[field];
      if (value === undefined) continue;

      if (thresholds.lt !== undefined && value >= thresholds.lt) matches = false;
      if (thresholds.lte !== undefined && value > thresholds.lte) matches = false;
      if (thresholds.gt !== undefined && value <= thresholds.gt) matches = false;
      if (thresholds.gte !== undefined && value < thresholds.gte) matches = false;
    }

    if (matches) {
      const archetypeModifiers = protocol.archetypeModifiers as Record<string, any> | null;
      return {
        protocol: {
          id: protocol.id,
          name: protocol.name,
          steps: protocol.steps,
        },
        archetypeModifier: context.archetype && archetypeModifiers
          ? archetypeModifiers[context.archetype]
          : undefined,
      };
    }
  }

  return null;
}

/**
 * Record that an intervention protocol was used
 */
export async function recordProtocolUsage(protocolId: string, wasEffective: boolean): Promise<void> {
  try {
    const protocol = await prisma.interventionProtocol.findUnique({
      where: { id: protocolId },
    });

    if (!protocol) return;

    const newUseCount = protocol.useCount + 1;
    const currentSuccessRate = protocol.successRate || 0;
    const newSuccessRate = wasEffective
      ? (currentSuccessRate * protocol.useCount + 1) / newUseCount
      : (currentSuccessRate * protocol.useCount) / newUseCount;

    await prisma.interventionProtocol.update({
      where: { id: protocolId },
      data: {
        useCount: newUseCount,
        successRate: newSuccessRate,
      },
    });
  } catch (error) {
    console.error('Failed to record protocol usage:', error);
  }
}

/**
 * Get crisis protocol by trigger
 */
export async function getCrisisProtocol(
  context: { keywords?: string[]; phq9Score?: number; gad7Score?: number }
): Promise<any | null> {
  const protocols = await prisma.crisisProtocol.findMany({
    where: { isActive: true },
  });

  for (const protocol of protocols) {
    // Check keyword triggers
    if (context.keywords && context.keywords.length > 0) {
      const triggerKeywords = protocol.triggerKeywords as string[];
      const hasMatch = context.keywords.some((k) =>
        triggerKeywords.some((tk) => k.toLowerCase().includes(tk.toLowerCase()))
      );
      if (hasMatch) return protocol;
    }

    // Check score triggers
    if (protocol.triggerScores) {
      const scores = protocol.triggerScores as Record<string, { gte?: number }>;
      if (scores.phq9?.gte && context.phq9Score && context.phq9Score >= scores.phq9.gte) {
        return protocol;
      }
      if (scores.gad7?.gte && context.gad7Score && context.gad7Score >= scores.gad7.gte) {
        return protocol;
      }
    }
  }

  return null;
}

// ─── Policy Management API ──────────────────────────────────────

/**
 * Create or update a policy rule
 */
export async function upsertPolicyRule(
  name: string,
  data: {
    category: string;
    description?: string;
    conditions: Condition[];
    actions: PolicyAction[];
    priority?: number;
    archetypes?: string[];
    organizations?: string[];
    isActive?: boolean;
    createdBy?: string;
  }
): Promise<string> {
  const existing = await prisma.policyRule.findUnique({ where: { name } });

  if (existing) {
    const updated = await prisma.policyRule.update({
      where: { name },
      data: {
        category: data.category,
        description: data.description,
        conditions: data.conditions as unknown as object,
        actions: data.actions as unknown as object,
        priority: data.priority,
        archetypes: data.archetypes,
        organizations: data.organizations,
        isActive: data.isActive,
        createdBy: data.createdBy,
        version: existing.version + 1,
      },
    });
    return updated.id;
  }

  const created = await prisma.policyRule.create({
    data: {
      name,
      category: data.category,
      description: data.description,
      conditions: data.conditions as unknown as object,
      actions: data.actions as unknown as object,
      priority: data.priority ?? 100,
      archetypes: data.archetypes,
      organizations: data.organizations,
      isActive: data.isActive ?? true,
      createdBy: data.createdBy,
    },
  });

  return created.id;
}

/**
 * Seed default policies (run during setup)
 */
export async function seedDefaultPolicies(): Promise<void> {
  const defaultPolicies = [
    // PHQ-9 Critical Escalation
    {
      name: 'phq9_critical',
      category: 'escalation',
      description: 'Escalate when PHQ-9 score indicates severe depression',
      conditions: [{ field: 'phq9Score', operator: 'gte' as Operator, value: 15 }],
      actions: [
        { type: 'escalate', data: { trigger: 'PHQ9_CRITICAL', priority: 'high' } },
        { type: 'flag_risk', data: { level: 'high' } },
      ],
      priority: 10,
    },
    // GAD-7 Critical Escalation
    {
      name: 'gad7_critical',
      category: 'escalation',
      description: 'Escalate when GAD-7 score indicates severe anxiety',
      conditions: [{ field: 'gad7Score', operator: 'gte' as Operator, value: 15 }],
      actions: [
        { type: 'escalate', data: { trigger: 'GAD7_CRITICAL', priority: 'high' } },
        { type: 'flag_risk', data: { level: 'high' } },
      ],
      priority: 10,
    },
    // Avoidance Pattern
    {
      name: 'avoidance_pattern',
      category: 'escalation',
      description: 'Flag users who have been inactive for 7+ days',
      conditions: [{ field: 'daysInactive', operator: 'gte' as Operator, value: 7 }],
      actions: [
        { type: 'notify', data: { type: 'check_in' } },
        { type: 'escalate', data: { trigger: 'AVOIDANCE_PATTERN', priority: 'medium' } },
      ],
      priority: 50,
    },
    // Low Mood Intervention
    {
      name: 'low_mood_intervention',
      category: 'intervention',
      description: 'Trigger grounding intervention for low mood',
      conditions: [{ field: 'moodScore', operator: 'lte' as Operator, value: 3 }],
      actions: [
        { type: 'suggest_intervention', data: { type: 'GROUNDING' } },
        { type: 'offer_breath', data: { technique: 'box_breathing' } },
      ],
      priority: 30,
    },
    // Negative Sentiment Support
    {
      name: 'negative_sentiment_support',
      category: 'intervention',
      description: 'Offer validation for highly negative sentiment',
      conditions: [{ field: 'sentimentScore', operator: 'lte' as Operator, value: -0.5 }],
      actions: [
        { type: 'suggest_intervention', data: { type: 'VALIDATION' } },
      ],
      priority: 40,
    },
  ];

  for (const policy of defaultPolicies) {
    await upsertPolicyRule(policy.name, policy);
  }

  console.log(`Seeded ${defaultPolicies.length} default policies`);
}
