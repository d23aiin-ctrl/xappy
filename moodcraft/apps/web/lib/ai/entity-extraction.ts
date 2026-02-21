import OpenAI from 'openai';
import prisma from '@/lib/prisma';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Entity/Topic Extraction Service
 *
 * Extracts structured entities from user content for:
 * - Better context understanding
 * - Pattern recognition
 * - Relationship mapping
 * - Personalized responses
 */

// ─── Types ──────────────────────────────────────────────────────

export type EntityType =
  | 'person'
  | 'place'
  | 'emotion'
  | 'topic'
  | 'event'
  | 'coping_strategy'
  | 'trigger'
  | 'goal'
  | 'belief';

export interface ExtractedEntity {
  id: string;
  userId: string;
  sourceType: string;
  sourceId: string;
  entityType: EntityType;
  entityValue: string;
  normalizedValue?: string;
  sentiment?: number;
  frequency: number;
  lastMentioned: Date;
  relatedEntities?: string[];
}

export interface ExtractionResult {
  entities: {
    type: EntityType;
    value: string;
    sentiment?: number;
    context?: string;
  }[];
}

// ─── Entity Extraction ──────────────────────────────────────────

/**
 * Extract entities from text using GPT-4o-mini
 */
export async function extractEntities(
  text: string,
  options: { includeContext?: boolean } = {}
): Promise<ExtractionResult> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an entity extraction system for a mental wellness app. Extract meaningful entities from user messages.

Extract these entity types:
- person: People mentioned (use relationship labels like "mother", "friend John", "therapist")
- emotion: Emotional states expressed
- topic: Topics or themes discussed
- trigger: Things that cause distress
- coping_strategy: Ways user copes
- event: Events mentioned
- belief: Core beliefs expressed (especially negative self-beliefs)
- goal: Things user wants to achieve

For each entity, provide:
- type: One of the types above
- value: The entity value (normalize names to relationship labels for privacy)
- sentiment: -1 to 1 sentiment when this entity was mentioned
${options.includeContext ? '- context: Brief phrase showing how it was mentioned' : ''}

Output JSON only: {"entities": [...]}
Only include entities that are clearly present. Quality over quantity.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{"entities": []}');
    return result as ExtractionResult;
  } catch (error) {
    console.error('Entity extraction error:', error);
    return { entities: [] };
  }
}

/**
 * Store extracted entities for a user
 */
export async function storeEntities(
  userId: string,
  sourceType: string,
  sourceId: string,
  entities: ExtractionResult['entities']
): Promise<void> {
  for (const entity of entities) {
    try {
      // Normalize the value for matching
      const normalizedValue = entity.value.toLowerCase().trim();

      // Check if this entity already exists for the user
      const existing = await prisma.extractedEntity.findUnique({
        where: {
          userId_sourceType_sourceId_entityType_entityValue: {
            userId,
            sourceType,
            sourceId,
            entityType: entity.type,
            entityValue: entity.value,
          },
        },
      });

      if (existing) {
        // Update frequency and last mentioned
        await prisma.extractedEntity.update({
          where: { id: existing.id },
          data: {
            frequency: existing.frequency + 1,
            lastMentioned: new Date(),
            sentiment: entity.sentiment,
          },
        });
      } else {
        // Create new entity
        await prisma.extractedEntity.create({
          data: {
            userId,
            sourceType,
            sourceId,
            entityType: entity.type,
            entityValue: entity.value,
            normalizedValue,
            sentiment: entity.sentiment,
            frequency: 1,
            lastMentioned: new Date(),
          },
        });
      }
    } catch (error) {
      // Unique constraint error is expected if same entity in same source
      if ((error as any).code !== 'P2002') {
        console.error('Error storing entity:', error);
      }
    }
  }
}

/**
 * Extract and store entities from content
 */
export async function processContent(
  userId: string,
  sourceType: string,
  sourceId: string,
  content: string
): Promise<ExtractionResult> {
  const result = await extractEntities(content);

  if (result.entities.length > 0) {
    await storeEntities(userId, sourceType, sourceId, result.entities);
  }

  return result;
}

// ─── Entity Queries ─────────────────────────────────────────────

/**
 * Get frequently mentioned entities for a user
 */
export async function getFrequentEntities(
  userId: string,
  options: {
    types?: EntityType[];
    minFrequency?: number;
    limit?: number;
    sinceDays?: number;
  } = {}
): Promise<ExtractedEntity[]> {
  const { types, minFrequency = 2, limit = 20, sinceDays } = options;

  const whereClause: any = {
    userId,
    frequency: { gte: minFrequency },
  };

  if (types && types.length > 0) {
    whereClause.entityType = { in: types };
  }

  if (sinceDays) {
    whereClause.lastMentioned = {
      gte: new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000),
    };
  }

  const entities = await prisma.extractedEntity.findMany({
    where: whereClause,
    orderBy: [{ frequency: 'desc' }, { lastMentioned: 'desc' }],
    take: limit,
  });

  return entities.map(mapPrismaEntity);
}

/**
 * Get entities related to a specific topic
 */
export async function getRelatedEntities(
  userId: string,
  searchTerm: string
): Promise<ExtractedEntity[]> {
  const entities = await prisma.extractedEntity.findMany({
    where: {
      userId,
      OR: [
        { entityValue: { contains: searchTerm, mode: 'insensitive' } },
        { normalizedValue: { contains: searchTerm.toLowerCase() } },
      ],
    },
    orderBy: { frequency: 'desc' },
    take: 10,
  });

  return entities.map(mapPrismaEntity);
}

/**
 * Get sentiment trends for an entity
 */
export async function getEntitySentimentTrend(
  userId: string,
  entityValue: string
): Promise<{ avgSentiment: number; mentions: number }> {
  const entities = await prisma.extractedEntity.findMany({
    where: {
      userId,
      normalizedValue: entityValue.toLowerCase(),
      sentiment: { not: null },
    },
  });

  if (entities.length === 0) {
    return { avgSentiment: 0, mentions: 0 };
  }

  const totalMentions = entities.reduce((sum, e) => sum + e.frequency, 0);
  const avgSentiment =
    entities.reduce((sum, e) => sum + (e.sentiment || 0) * e.frequency, 0) / totalMentions;

  return {
    avgSentiment,
    mentions: totalMentions,
  };
}

// ─── AI Context Building ────────────────────────────────────────

/**
 * Build entity context for AI prompt
 */
export async function buildEntityContext(userId: string): Promise<string> {
  const [people, emotions, triggers, beliefs] = await Promise.all([
    getFrequentEntities(userId, { types: ['person'], limit: 5, sinceDays: 30 }),
    getFrequentEntities(userId, { types: ['emotion'], limit: 5, sinceDays: 14 }),
    getFrequentEntities(userId, { types: ['trigger'], limit: 5, sinceDays: 30 }),
    getFrequentEntities(userId, { types: ['belief'], limit: 3, sinceDays: 60 }),
  ]);

  if (people.length === 0 && emotions.length === 0 && triggers.length === 0 && beliefs.length === 0) {
    return '';
  }

  let context = '\n## User Entity Map (Key People, Patterns)\n';

  if (people.length > 0) {
    context += `\nImportant people: ${people.map((p) => {
      const sentiment = p.sentiment !== undefined
        ? ` (sentiment: ${p.sentiment > 0 ? 'positive' : p.sentiment < 0 ? 'negative' : 'neutral'})`
        : '';
      return `${p.entityValue}${sentiment}`;
    }).join(', ')}\n`;
  }

  if (emotions.length > 0) {
    context += `\nFrequent emotions: ${emotions.map((e) => e.entityValue).join(', ')}\n`;
  }

  if (triggers.length > 0) {
    context += `\nKnown triggers: ${triggers.map((t) => t.entityValue).join(', ')}\n`;
  }

  if (beliefs.length > 0) {
    context += `\nCore beliefs expressed: ${beliefs.map((b) => `"${b.entityValue}"`).join(', ')}\n`;
  }

  context += '\nUse this context to understand their world. Reference appropriately when relevant.\n';

  return context;
}

// ─── Helper Functions ───────────────────────────────────────────

function mapPrismaEntity(entity: any): ExtractedEntity {
  return {
    id: entity.id,
    userId: entity.userId,
    sourceType: entity.sourceType,
    sourceId: entity.sourceId,
    entityType: entity.entityType as EntityType,
    entityValue: entity.entityValue,
    normalizedValue: entity.normalizedValue || undefined,
    sentiment: entity.sentiment || undefined,
    frequency: entity.frequency,
    lastMentioned: entity.lastMentioned,
    relatedEntities: entity.relatedEntities as string[] || undefined,
  };
}
