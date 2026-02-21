import prisma from '@/lib/prisma';
import crypto from 'crypto';

/**
 * AI Traceability Layer
 *
 * Logs every AI interaction for:
 * - Compliance and audit trails
 * - Debugging and error tracking
 * - Performance monitoring
 * - Quality improvement
 */

export type AIFeature =
  | 'ai_twin'
  | 'companion'
  | 'brief_generation'
  | 'sentiment_analysis'
  | 'session_summary'
  | 'insight_extraction'
  | 'embedding_generation'
  | 'handoff_document'
  | 'guideline_search';

export interface TraceLogInput {
  userId?: string;
  sessionId?: string;
  feature: AIFeature;
  modelId: string;
  modelVersion?: string;
  systemPrompt?: string;
  userInput?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  responseTimeMs?: number;
  temperature?: number;
  maxTokens?: number;
  confidenceScore?: number;
  interventionType?: string;
  riskFlagged?: boolean;
  userFeedback?: number;
  escalationTriggered?: boolean;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Hash sensitive content for privacy-preserving logging
 */
function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

/**
 * Log an AI interaction
 */
export async function logAIInteraction(input: TraceLogInput): Promise<string> {
  try {
    const log = await prisma.aITraceLog.create({
      data: {
        userId: input.userId,
        sessionId: input.sessionId,
        feature: input.feature,
        modelId: input.modelId,
        modelVersion: input.modelVersion,
        systemPromptHash: input.systemPrompt ? hashContent(input.systemPrompt) : null,
        userInputHash: input.userInput ? hashContent(input.userInput) : null,
        promptTokens: input.promptTokens,
        completionTokens: input.completionTokens,
        totalTokens: input.totalTokens,
        responseTimeMs: input.responseTimeMs,
        temperature: input.temperature,
        maxTokens: input.maxTokens,
        confidenceScore: input.confidenceScore,
        interventionType: input.interventionType,
        riskFlagged: input.riskFlagged ?? false,
        userFeedback: input.userFeedback,
        escalationTriggered: input.escalationTriggered ?? false,
        errorCode: input.errorCode,
        errorMessage: input.errorMessage,
      },
    });

    return log.id;
  } catch (error) {
    console.error('Failed to log AI interaction:', error);
    // Don't throw - logging failure shouldn't break the main flow
    return '';
  }
}

/**
 * Update a trace log with additional info (e.g., after getting user feedback)
 */
export async function updateTraceLog(
  logId: string,
  updates: Partial<Pick<TraceLogInput, 'userFeedback' | 'escalationTriggered' | 'errorCode' | 'errorMessage'>>
): Promise<void> {
  if (!logId) return;

  try {
    await prisma.aITraceLog.update({
      where: { id: logId },
      data: updates,
    });
  } catch (error) {
    console.error('Failed to update trace log:', error);
  }
}

/**
 * Create a trace log wrapper for timing AI calls
 */
export function createTracer(baseInput: Omit<TraceLogInput, 'responseTimeMs'>) {
  const startTime = Date.now();

  return {
    /**
     * Complete the trace with success
     */
    async success(additionalData: Partial<TraceLogInput> = {}): Promise<string> {
      const responseTimeMs = Date.now() - startTime;
      return logAIInteraction({
        ...baseInput,
        ...additionalData,
        responseTimeMs,
      });
    },

    /**
     * Complete the trace with error
     */
    async error(errorCode: string, errorMessage: string): Promise<string> {
      const responseTimeMs = Date.now() - startTime;
      return logAIInteraction({
        ...baseInput,
        responseTimeMs,
        errorCode,
        errorMessage,
      });
    },
  };
}

/**
 * Get AI usage statistics for a user
 */
export async function getUserAIStats(userId: string, days: number = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const stats = await prisma.aITraceLog.groupBy({
    by: ['feature'],
    where: {
      userId,
      createdAt: { gte: since },
    },
    _count: true,
    _avg: {
      responseTimeMs: true,
      userFeedback: true,
    },
  });

  const totalInteractions = await prisma.aITraceLog.count({
    where: {
      userId,
      createdAt: { gte: since },
    },
  });

  const riskFlaggedCount = await prisma.aITraceLog.count({
    where: {
      userId,
      createdAt: { gte: since },
      riskFlagged: true,
    },
  });

  return {
    totalInteractions,
    riskFlaggedCount,
    byFeature: stats.map((s) => ({
      feature: s.feature,
      count: s._count,
      avgResponseTimeMs: Math.round(s._avg.responseTimeMs || 0),
      avgFeedback: s._avg.userFeedback,
    })),
  };
}

/**
 * Get system-wide AI metrics for admin dashboard
 */
export async function getSystemAIMetrics(days: number = 7) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [totalLogs, errorLogs, avgLatency, modelUsage, featureUsage] = await Promise.all([
    prisma.aITraceLog.count({
      where: { createdAt: { gte: since } },
    }),
    prisma.aITraceLog.count({
      where: {
        createdAt: { gte: since },
        errorCode: { not: null },
      },
    }),
    prisma.aITraceLog.aggregate({
      where: { createdAt: { gte: since } },
      _avg: { responseTimeMs: true },
    }),
    prisma.aITraceLog.groupBy({
      by: ['modelId'],
      where: { createdAt: { gte: since } },
      _count: true,
      _sum: { totalTokens: true },
    }),
    prisma.aITraceLog.groupBy({
      by: ['feature'],
      where: { createdAt: { gte: since } },
      _count: true,
      _avg: { userFeedback: true },
    }),
  ]);

  return {
    period: `${days} days`,
    totalInteractions: totalLogs,
    errorRate: totalLogs > 0 ? ((errorLogs / totalLogs) * 100).toFixed(2) + '%' : '0%',
    avgLatencyMs: Math.round(avgLatency._avg.responseTimeMs || 0),
    modelUsage: modelUsage.map((m) => ({
      model: m.modelId,
      calls: m._count,
      totalTokens: m._sum.totalTokens || 0,
    })),
    featureUsage: featureUsage.map((f) => ({
      feature: f.feature,
      calls: f._count,
      avgSatisfaction: f._avg.userFeedback?.toFixed(1) || 'N/A',
    })),
  };
}
