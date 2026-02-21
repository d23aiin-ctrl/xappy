import OpenAI from 'openai';
import prisma from '@/lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Memory types that can be stored and retrieved
export type MemoryType = 'journal' | 'mood' | 'chat' | 'insight';

export interface Memory {
  id: string;
  type: MemoryType;
  content: string;
  embedding?: number[];
  metadata: {
    date: string;
    sentiment?: string;
    moodScore?: number;
    source?: string;
  };
  similarity?: number;
}

export interface MemorySearchResult {
  memories: Memory[];
  summary?: string;
}

/**
 * Generate embedding for text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000), // Limit input length
  });

  return response.data[0].embedding;
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Index a user's content for RAG retrieval
 * Should be called when new content is created
 */
export async function indexUserContent(
  userId: string,
  contentType: MemoryType,
  contentId: string,
  content: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    const embedding = await generateEmbedding(content);

    // Store in UserMemory table (we'll need to add this to schema)
    await prisma.userMemory.upsert({
      where: {
        userId_contentType_contentId: {
          userId,
          contentType,
          contentId,
        },
      },
      update: {
        content: content.slice(0, 5000), // Limit stored content
        embedding: embedding as any,
        metadata: metadata as any,
        updatedAt: new Date(),
      },
      create: {
        userId,
        contentType,
        contentId,
        content: content.slice(0, 5000),
        embedding: embedding as any,
        metadata: metadata as any,
      },
    });
  } catch (error) {
    console.error('Failed to index content:', error);
    // Don't throw - indexing failure shouldn't break the main flow
  }
}

/**
 * Search user's memories using semantic similarity
 */
export async function searchMemories(
  userId: string,
  query: string,
  options: {
    limit?: number;
    types?: MemoryType[];
    minSimilarity?: number;
    dateRange?: { start: Date; end: Date };
  } = {}
): Promise<Memory[]> {
  const {
    limit = 5,
    types,
    minSimilarity = 0.5,
    dateRange,
  } = options;

  try {
    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query);

    // Fetch user's memories
    const whereClause: any = { userId };
    if (types && types.length > 0) {
      whereClause.contentType = { in: types };
    }
    if (dateRange) {
      whereClause.createdAt = {
        gte: dateRange.start,
        lte: dateRange.end,
      };
    }

    const memories = await prisma.userMemory.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 100, // Get recent memories for comparison
    });

    // Calculate similarities
    const scoredMemories: Memory[] = memories
      .map((m) => {
        const embedding = m.embedding as number[] | null;
        const similarity = embedding ? cosineSimilarity(queryEmbedding, embedding) : 0;

        return {
          id: m.id,
          type: m.contentType as MemoryType,
          content: m.content,
          metadata: {
            date: m.createdAt.toISOString(),
            ...(m.metadata as Record<string, any>),
          },
          similarity,
        };
      })
      .filter((m) => m.similarity >= minSimilarity)
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
      .slice(0, limit);

    return scoredMemories;
  } catch (error) {
    console.error('Memory search error:', error);
    return [];
  }
}

/**
 * Get relevant context for a conversation
 * Combines semantic search with recent history
 */
export async function getConversationContext(
  userId: string,
  currentMessage: string,
  conversationHistory: string[] = []
): Promise<{
  relevantMemories: Memory[];
  recentMoods: { score: number; date: string }[];
  userSummary: string;
}> {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Search for semantically similar memories
  const relevantMemories = await searchMemories(userId, currentMessage, {
    limit: 5,
    minSimilarity: 0.4,
  });

  // Get recent moods
  const recentMoods = await prisma.moodEntry.findMany({
    where: {
      userId,
      createdAt: { gte: oneWeekAgo },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      moodScore: true,
      createdAt: true,
    },
  });

  // Get user profile for context
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  // Generate a brief user summary if we have enough context
  let userSummary = '';
  if (relevantMemories.length > 0 || recentMoods.length > 0) {
    const moodTrend = recentMoods.length > 0
      ? recentMoods.reduce((sum, m) => sum + m.moodScore, 0) / recentMoods.length
      : null;

    const archetype = user?.profile?.archetype || 'SEEKER';
    const streakDays = user?.profile?.streakDays || 0;

    userSummary = `User archetype: ${archetype}. `;
    if (streakDays > 0) userSummary += `Active ${streakDays}-day streak. `;
    if (moodTrend !== null) {
      userSummary += `Recent mood average: ${moodTrend.toFixed(1)}/10. `;
    }
  }

  return {
    relevantMemories,
    recentMoods: recentMoods.map((m) => ({
      score: m.moodScore,
      date: m.createdAt.toISOString(),
    })),
    userSummary,
  };
}

/**
 * Build context string for AI prompt
 */
export function buildContextPrompt(
  memories: Memory[],
  userSummary: string
): string {
  if (memories.length === 0 && !userSummary) {
    return '';
  }

  let context = '\n\n--- RELEVANT USER CONTEXT ---\n';

  if (userSummary) {
    context += `\n${userSummary}\n`;
  }

  if (memories.length > 0) {
    context += '\nRelevant past experiences:\n';
    memories.forEach((m, i) => {
      const date = new Date(m.metadata.date).toLocaleDateString();
      const type = m.type === 'journal' ? 'Journal' : m.type === 'mood' ? 'Mood reflection' : m.type === 'chat' ? 'Previous conversation' : 'Insight';
      context += `\n${i + 1}. [${type} - ${date}]: "${m.content.slice(0, 200)}${m.content.length > 200 ? '...' : ''}"`;
    });
  }

  context += '\n\n--- END CONTEXT ---\n';
  context += 'Use this context to provide more personalized, relevant responses. Reference specific memories when appropriate, but naturally.\n';

  return context;
}

/**
 * Extract and store key insights from a conversation
 * Called after important AI Twin sessions
 */
export async function extractAndStoreInsights(
  userId: string,
  messages: { role: string; content: string }[],
  archetype: string
): Promise<void> {
  if (messages.length < 4) return; // Need enough context

  try {
    const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const conversationText = messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You extract key therapeutic insights from conversations. Output JSON only.
Extract:
1. breakthrough_moments: Realizations or shifts the user had
2. recurring_themes: Patterns in what they discuss
3. effective_techniques: What approaches seemed to resonate
4. concerns_to_monitor: Things that might need follow-up
5. user_strengths: Positive qualities or resources they demonstrated

Only include items you're confident about. Keep each item to 1-2 sentences.
Format: {"breakthrough_moments": [], "recurring_themes": [], "effective_techniques": [], "concerns_to_monitor": [], "user_strengths": []}`,
        },
        {
          role: 'user',
          content: `User archetype: ${archetype}\n\nConversation:\n${conversationText}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const insights = JSON.parse(completion.choices[0]?.message?.content || '{}');

    // Store each insight type as a memory
    const insightTypes = [
      'breakthrough_moments',
      'recurring_themes',
      'effective_techniques',
      'user_strengths',
    ] as const;

    for (const type of insightTypes) {
      const items = insights[type] as string[] | undefined;
      if (items && items.length > 0) {
        for (const item of items) {
          if (item && item.length > 10) {
            await indexUserContent(userId, 'insight', `${type}-${Date.now()}-${Math.random()}`, item, {
              insightType: type,
              extractedAt: new Date().toISOString(),
            });
          }
        }
      }
    }

    // Store concerns separately for easy retrieval
    if (insights.concerns_to_monitor?.length > 0) {
      for (const concern of insights.concerns_to_monitor) {
        if (concern && concern.length > 10) {
          await indexUserContent(userId, 'insight', `concern-${Date.now()}`, concern, {
            insightType: 'concern',
            priority: 'monitor',
          });
        }
      }
    }
  } catch (error) {
    console.error('Insight extraction error:', error);
    // Non-blocking
  }
}

/**
 * Get a summary of user's long-term patterns for AI context
 */
export async function getUserPatternSummary(userId: string): Promise<string> {
  try {
    // Get recent insights
    const insights = await prisma.userMemory.findMany({
      where: {
        userId,
        contentType: 'insight',
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    if (insights.length === 0) return '';

    // Group by type
    const grouped: Record<string, string[]> = {};
    for (const i of insights) {
      const type = (i.metadata as any)?.insightType || 'general';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(i.content);
    }

    let summary = '\n## Long-term Patterns (from past sessions)\n';

    if (grouped.recurring_themes?.length) {
      summary += `\nRecurring themes: ${grouped.recurring_themes.slice(0, 3).join('; ')}\n`;
    }
    if (grouped.breakthrough_moments?.length) {
      summary += `\nPast breakthroughs: ${grouped.breakthrough_moments.slice(0, 2).join('; ')}\n`;
    }
    if (grouped.user_strengths?.length) {
      summary += `\nTheir strengths: ${grouped.user_strengths.slice(0, 3).join(', ')}\n`;
    }
    if (grouped.concern?.length) {
      summary += `\n**Areas to monitor**: ${grouped.concern.slice(0, 2).join('; ')}\n`;
    }

    return summary;
  } catch (error) {
    console.error('Pattern summary error:', error);
    return '';
  }
}

/**
 * Index existing user content (for migration/backfill)
 */
export async function backfillUserMemories(userId: string): Promise<{
  indexed: number;
  errors: number;
}> {
  let indexed = 0;
  let errors = 0;

  // Index journal entries
  const journalEntries = await prisma.journalEntry.findMany({
    where: { userId },
    take: 50,
    orderBy: { createdAt: 'desc' },
  });

  for (const entry of journalEntries) {
    try {
      await indexUserContent(userId, 'journal', entry.id, entry.contentEnc, {
        title: entry.titleEnc,
        sentiment: entry.sentimentLabel,
        sentimentScore: entry.sentimentScore,
      });
      indexed++;
    } catch {
      errors++;
    }
  }

  // Index mood reflections
  const moodEntries = await prisma.moodEntry.findMany({
    where: {
      userId,
      reflectionEnc: { not: null },
    },
    take: 30,
    orderBy: { createdAt: 'desc' },
  });

  for (const entry of moodEntries) {
    if (entry.reflectionEnc) {
      try {
        await indexUserContent(userId, 'mood', entry.id, entry.reflectionEnc, {
          moodScore: entry.moodScore,
          emoji: entry.emoji,
        });
        indexed++;
      } catch {
        errors++;
      }
    }
  }

  return { indexed, errors };
}
