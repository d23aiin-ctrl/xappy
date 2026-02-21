import OpenAI from 'openai';
import prisma from '@/lib/prisma';
import type { Archetype } from '@prisma/client';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Therapy Guidelines RAG Service
 *
 * Provides evidence-based clinical knowledge to the AI Twin through:
 * - Semantic search of therapy guidelines
 * - Crisis protocol retrieval
 * - Archetype-specific adaptations
 *
 * Knowledge sources include:
 * - CBT techniques
 * - DBT skills
 * - Mindfulness practices
 * - Trauma-informed approaches
 * - Crisis intervention protocols
 */

// ─── Types ──────────────────────────────────────────────────────

export interface TherapyGuideline {
  id: string;
  category: string;
  subcategory?: string;
  title: string;
  content: string;
  summary?: string;
  source?: string;
  evidenceLevel?: string;
  conditions?: string[];
  contraindications?: string[];
  archetypeNotes?: Record<string, string>;
  similarity?: number;
}

export interface GuidelineSearchResult {
  guidelines: TherapyGuideline[];
  synthesizedGuidance?: string;
}

// ─── Embedding Generation ───────────────────────────────────────

/**
 * Generate embedding for guideline content
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000),
  });
  return response.data[0].embedding;
}

/**
 * Calculate cosine similarity
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

// ─── Guideline Search ───────────────────────────────────────────

/**
 * Search guidelines by semantic similarity
 */
export async function searchGuidelines(
  query: string,
  options: {
    category?: string;
    conditions?: string[];
    archetype?: Archetype;
    limit?: number;
    minSimilarity?: number;
  } = {}
): Promise<TherapyGuideline[]> {
  const { category, conditions, limit = 5, minSimilarity = 0.5 } = options;

  try {
    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query);

    // Build where clause
    const whereClause: any = { isActive: true };
    if (category) {
      whereClause.category = category;
    }

    // Fetch guidelines
    const guidelines = await prisma.therapyGuideline.findMany({
      where: whereClause,
      take: 50, // Get more for similarity filtering
    });

    // Calculate similarities and filter
    const scoredGuidelines = guidelines
      .map((g) => {
        const embedding = g.embedding as number[] | null;
        const similarity = embedding ? cosineSimilarity(queryEmbedding, embedding) : 0;

        // Filter by conditions if specified
        if (conditions && conditions.length > 0) {
          const guidelineConditions = (g.conditions as string[]) || [];
          const hasMatchingCondition = conditions.some((c) =>
            guidelineConditions.some((gc) => gc.toLowerCase().includes(c.toLowerCase()))
          );
          if (!hasMatchingCondition && similarity < 0.7) {
            return null; // Skip if no condition match and low similarity
          }
        }

        return {
          id: g.id,
          category: g.category,
          subcategory: g.subcategory || undefined,
          title: g.title,
          content: g.content,
          summary: g.summary || undefined,
          source: g.source || undefined,
          evidenceLevel: g.evidenceLevel || undefined,
          conditions: (g.conditions as string[]) || undefined,
          contraindications: (g.contraindications as string[]) || undefined,
          archetypeNotes: (g.archetypeNotes as Record<string, string>) || undefined,
          similarity,
        };
      })
      .filter((g): g is NonNullable<typeof g> => g !== null && g.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return scoredGuidelines;
  } catch (error) {
    console.error('Guideline search error:', error);
    return [];
  }
}

/**
 * Get guidelines for a specific therapeutic context
 */
export async function getContextualGuidelines(
  context: {
    presentingIssue: string;
    archetype?: Archetype;
    moodScore?: number;
    riskLevel?: 'low' | 'moderate' | 'high' | 'critical';
    previousInterventions?: string[];
  }
): Promise<GuidelineSearchResult> {
  const { presentingIssue, archetype, moodScore, riskLevel, previousInterventions } = context;

  // Build search query from context
  let searchQuery = presentingIssue;

  if (moodScore !== undefined) {
    if (moodScore <= 3) searchQuery += ' distress acute support';
    else if (moodScore <= 5) searchQuery += ' moderate mood regulation';
  }

  if (riskLevel === 'high' || riskLevel === 'critical') {
    searchQuery += ' crisis safety stabilization';
  }

  // Search for relevant guidelines
  const guidelines = await searchGuidelines(searchQuery, {
    archetype,
    limit: 5,
    minSimilarity: 0.4,
  });

  // Filter out previously tried interventions if provided
  const filteredGuidelines = previousInterventions
    ? guidelines.filter((g) =>
        !previousInterventions.some((pi) =>
          g.title.toLowerCase().includes(pi.toLowerCase())
        )
      )
    : guidelines;

  // Synthesize guidance if we have results
  let synthesizedGuidance: string | undefined;
  if (filteredGuidelines.length > 0) {
    synthesizedGuidance = buildGuidanceSummary(filteredGuidelines, archetype);
  }

  return {
    guidelines: filteredGuidelines,
    synthesizedGuidance,
  };
}

/**
 * Build a synthesized guidance summary from guidelines
 */
function buildGuidanceSummary(guidelines: TherapyGuideline[], archetype?: Archetype): string {
  let summary = '## Therapeutic Guidance (Evidence-Based)\n\n';

  for (const g of guidelines.slice(0, 3)) {
    summary += `### ${g.title}\n`;
    summary += `${g.summary || g.content.slice(0, 300)}...\n`;

    if (g.archetypeNotes && archetype && g.archetypeNotes[archetype]) {
      summary += `\n**For this user's archetype (${archetype})**: ${g.archetypeNotes[archetype]}\n`;
    }

    if (g.contraindications && g.contraindications.length > 0) {
      summary += `\n*Caution*: Avoid if user has ${g.contraindications.join(', ')}\n`;
    }

    summary += '\n';
  }

  return summary;
}

// ─── Guideline Management ───────────────────────────────────────

/**
 * Add or update a therapy guideline
 */
export async function upsertGuideline(
  title: string,
  data: {
    category: string;
    subcategory?: string;
    content: string;
    summary?: string;
    source?: string;
    evidenceLevel?: string;
    conditions?: string[];
    contraindications?: string[];
    archetypeNotes?: Record<string, string>;
  }
): Promise<string> {
  // Generate embedding for the content
  const embedding = await generateEmbedding(`${title}. ${data.content}`);

  // Check if exists
  const existing = await prisma.therapyGuideline.findFirst({
    where: { title },
  });

  if (existing) {
    const updated = await prisma.therapyGuideline.update({
      where: { id: existing.id },
      data: {
        ...data,
        embedding: embedding as any,
        version: existing.version + 1,
      },
    });
    return updated.id;
  }

  const created = await prisma.therapyGuideline.create({
    data: {
      title,
      category: data.category,
      subcategory: data.subcategory,
      content: data.content,
      summary: data.summary,
      source: data.source,
      evidenceLevel: data.evidenceLevel,
      conditions: data.conditions,
      contraindications: data.contraindications,
      archetypeNotes: data.archetypeNotes,
      embedding: embedding as any,
    },
  });

  return created.id;
}

/**
 * Seed default therapy guidelines
 */
export async function seedTherapyGuidelines(): Promise<void> {
  const defaultGuidelines = [
    // CBT Techniques
    {
      title: 'Cognitive Restructuring',
      category: 'cbt',
      subcategory: 'thought_challenging',
      content: `Cognitive restructuring is a core CBT technique that helps identify and challenge negative automatic thoughts. The process involves:
1. Identify the situation triggering distress
2. Notice automatic thoughts that arose
3. Identify cognitive distortions (e.g., catastrophizing, black-and-white thinking)
4. Generate alternative, balanced thoughts
5. Rate belief in the new thought

This technique is particularly effective for depression and anxiety. It helps users develop metacognitive awareness and break cycles of negative rumination.`,
      summary: 'A technique to identify and challenge negative thought patterns by examining evidence and generating balanced alternatives.',
      source: 'Beck, J.S. (2020). Cognitive Behavior Therapy: Basics and Beyond',
      evidenceLevel: 'strong',
      conditions: ['depression', 'anxiety', 'negative_thinking'],
      contraindications: ['acute_psychosis', 'severe_dissociation'],
      archetypeNotes: {
        THINKER: 'Appeal to their analytical nature. Frame as a systematic investigation of thoughts.',
        DRIFTER: 'Use metaphors like "catching thought clouds." Keep it gentle and exploratory.',
        SEEKER: 'Move slowly. Emphasize this is about understanding, not judging their thoughts.',
        TRANSFORMER: 'Connect to their growth journey. This is a tool for continued evolution.',
        VETERAN: 'Be direct. They may already be familiar; ask what has/hasn\'t worked before.',
      },
    },
    {
      title: 'Behavioral Activation',
      category: 'cbt',
      subcategory: 'behavior_change',
      content: `Behavioral activation is an evidence-based treatment for depression that focuses on increasing engagement with rewarding activities. Key principles:
1. Activity monitoring - track current activities and mood
2. Identify values and potential rewarding activities
3. Schedule activities, starting small and building
4. Overcome avoidance through gradual exposure
5. Problem-solve barriers to activation

Research shows behavioral activation can be as effective as antidepressant medication for moderate depression.`,
      summary: 'Systematically increasing engagement with meaningful activities to improve mood.',
      source: 'Martell, C.R., et al. (2010). Behavioral Activation for Depression',
      evidenceLevel: 'strong',
      conditions: ['depression', 'low_motivation', 'avoidance'],
      archetypeNotes: {
        DRIFTER: 'Help them identify small anchoring activities. Don\'t overwhelm with structure.',
        VETERAN: 'They know what helps; focus on removing barriers, not educating.',
      },
    },

    // DBT Skills
    {
      title: 'Distress Tolerance - TIPP',
      category: 'dbt',
      subcategory: 'distress_tolerance',
      content: `TIPP is a DBT distress tolerance skill for quickly changing body chemistry during intense emotional distress:

T - Temperature: Cold water on face activates dive reflex, slowing heart rate
I - Intense exercise: 15-20 minutes to metabolize stress hormones
P - Paced breathing: Slow exhale (longer than inhale) activates parasympathetic system
P - Progressive muscle relaxation: Systematically tense and release muscle groups

Use TIPP when emotion mind is in control and rational strategies won't work. It creates a physiological shift that makes other coping possible.`,
      summary: 'Rapid physiological techniques (Temperature, Intense exercise, Paced breathing, Progressive relaxation) for acute distress.',
      source: 'Linehan, M.M. (2015). DBT Skills Training Manual',
      evidenceLevel: 'strong',
      conditions: ['acute_distress', 'panic', 'intense_emotion', 'crisis'],
      archetypeNotes: {
        THINKER: 'Explain the neuroscience behind each technique.',
        SEEKER: 'Start with the gentlest option (paced breathing). Reassure it\'s safe.',
      },
    },
    {
      title: 'Radical Acceptance',
      category: 'dbt',
      subcategory: 'distress_tolerance',
      content: `Radical acceptance means fully accepting reality as it is, without judgment or fighting against it. It doesn't mean approval - it means acknowledging what IS.

Steps:
1. Observe that you are resisting reality ("It shouldn't be this way")
2. Remind yourself that the present moment is the result of many causes
3. Practice accepting with your whole body (notice physical tension)
4. Practice opposite action to willfulness
5. Acknowledge that life can be worth living even with painful events

Suffering = Pain × Resistance. Radical acceptance reduces the resistance component.`,
      summary: 'Fully accepting reality without judgment, reducing suffering by releasing resistance to what cannot be changed.',
      source: 'Linehan, M.M. (2015). DBT Skills Training Manual',
      evidenceLevel: 'strong',
      conditions: ['grief', 'loss', 'chronic_illness', 'unchangeable_circumstances'],
      contraindications: ['abusive_situation_needing_action'],
      archetypeNotes: {
        TRANSFORMER: 'Frame as integrating difficult experiences into growth journey.',
        DRIFTER: 'Use imagery of water flowing around obstacles, not fighting them.',
      },
    },

    // Mindfulness
    {
      title: 'Grounding - 5-4-3-2-1 Technique',
      category: 'mindfulness',
      subcategory: 'grounding',
      content: `The 5-4-3-2-1 grounding technique uses sensory awareness to anchor to the present moment:

5 - Name 5 things you can SEE
4 - Name 4 things you can TOUCH/FEEL
3 - Name 3 things you can HEAR
2 - Name 2 things you can SMELL
1 - Name 1 thing you can TASTE

This technique interrupts dissociation, anxiety spirals, and flashbacks by engaging the orienting response and present-moment awareness.`,
      summary: 'Sensory grounding technique using five senses to anchor to present moment.',
      source: 'Clinical practice consensus',
      evidenceLevel: 'clinical_consensus',
      conditions: ['anxiety', 'dissociation', 'flashbacks', 'panic', 'overwhelm'],
    },

    // Trauma-Informed
    {
      title: 'Window of Tolerance',
      category: 'trauma_informed',
      subcategory: 'psychoeducation',
      content: `The Window of Tolerance (Siegel, 1999) describes the optimal zone of arousal where we can function effectively:

Above the window (Hyperarousal): Fight/flight, anxiety, panic, hypervigilance
Within the window: Calm, present, able to think and feel simultaneously
Below the window (Hypoarousal): Freeze, numbness, dissociation, depression

Goals:
1. Recognize which zone you're in
2. Expand the window through gradual exposure and regulation skills
3. Use skills to return to window when dysregulated

Trauma often narrows the window. Healing expands it.`,
      summary: 'Framework for understanding optimal arousal zones and nervous system regulation.',
      source: 'Siegel, D.J. (1999). The Developing Mind',
      evidenceLevel: 'strong',
      conditions: ['trauma', 'ptsd', 'emotional_dysregulation'],
      archetypeNotes: {
        THINKER: 'The neuroscience framework will resonate. Draw the diagram.',
        SEEKER: 'Emphasize that narrow windows can widen with time and safety.',
      },
    },

    // Crisis Intervention
    {
      title: 'Safety Planning',
      category: 'crisis_intervention',
      subcategory: 'safety',
      content: `Safety Planning is an evidence-based intervention for suicide prevention. Components:

1. Warning signs - Recognize personal early warning signs
2. Internal coping - Things I can do myself to distract/calm
3. Social distractions - People and places that provide healthy distraction
4. People I can ask for help - Family, friends to contact
5. Professionals/agencies - Therapist, crisis line, emergency services
6. Making environment safe - Reducing access to lethal means

Safety plans should be collaborative, specific, and accessible (not locked away).`,
      summary: 'Structured safety plan with escalating levels of support and coping strategies.',
      source: 'Stanley, B. & Brown, G.K. (2012). Safety Planning Intervention',
      evidenceLevel: 'strong',
      conditions: ['suicidal_ideation', 'self_harm', 'crisis'],
    },
  ];

  for (const guideline of defaultGuidelines) {
    try {
      await upsertGuideline(guideline.title, {
        ...guideline,
        archetypeNotes: guideline.archetypeNotes as Record<string, string> | undefined,
      });
      console.log(`Seeded guideline: ${guideline.title}`);
    } catch (error) {
      console.error(`Failed to seed guideline ${guideline.title}:`, error);
    }
  }

  console.log(`Seeded ${defaultGuidelines.length} therapy guidelines`);
}
