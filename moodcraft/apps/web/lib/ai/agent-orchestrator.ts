import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Agent tool definitions
export const AGENT_TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'analyze_mood_patterns',
      description: 'Analyze user mood patterns over a time period to identify trends, triggers, and insights',
      parameters: {
        type: 'object',
        properties: {
          timeRange: {
            type: 'string',
            enum: ['week', 'month', 'quarter'],
            description: 'Time range to analyze',
          },
          focusArea: {
            type: 'string',
            enum: ['emotions', 'energy', 'triggers', 'growth'],
            description: 'What aspect to focus on',
          },
        },
        required: ['timeRange'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'analyze_journal_themes',
      description: 'Deep analysis of journal entries to extract themes, patterns, and psychological insights',
      parameters: {
        type: 'object',
        properties: {
          analysisType: {
            type: 'string',
            enum: ['shadow_work', 'growth_patterns', 'emotional_themes', 'relationship_dynamics', 'cognitive_patterns'],
            description: 'Type of analysis to perform',
          },
          depth: {
            type: 'string',
            enum: ['surface', 'deep', 'profound'],
            description: 'How deep to analyze',
          },
        },
        required: ['analysisType'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'recommend_ritual',
      description: 'Recommend a personalized wellness ritual based on current state and history',
      parameters: {
        type: 'object',
        properties: {
          urgency: {
            type: 'string',
            enum: ['immediate', 'today', 'this_week'],
            description: 'How urgent is the need',
          },
          type: {
            type: 'string',
            enum: ['breathing', 'journaling', 'grounding', 'reflection', 'movement'],
            description: 'Type of ritual',
          },
        },
        required: ['urgency'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_personalized_prompt',
      description: 'Generate a deeply personalized journal or reflection prompt based on user\'s journey',
      parameters: {
        type: 'object',
        properties: {
          promptType: {
            type: 'string',
            enum: ['shadow_exploration', 'gratitude', 'future_visioning', 'emotional_processing', 'relationship_reflection'],
            description: 'Type of prompt to generate',
          },
          emotionalTone: {
            type: 'string',
            enum: ['gentle', 'challenging', 'curious', 'supportive'],
            description: 'Emotional tone of the prompt',
          },
        },
        required: ['promptType'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_insight_synthesis',
      description: 'Synthesize insights across all user data to create a holistic understanding',
      parameters: {
        type: 'object',
        properties: {
          focus: {
            type: 'string',
            enum: ['overall_progress', 'areas_of_growth', 'blind_spots', 'strengths', 'next_steps'],
            description: 'What to focus the synthesis on',
          },
        },
        required: ['focus'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'detect_intervention_need',
      description: 'Detect if user needs intervention and what type',
      parameters: {
        type: 'object',
        properties: {
          checkType: {
            type: 'string',
            enum: ['risk_assessment', 'engagement_check', 'progress_check'],
            description: 'Type of check to perform',
          },
        },
        required: ['checkType'],
      },
    },
  },
];

// Tool execution functions
async function executeMoodAnalysis(userId: string, params: { timeRange: string; focusArea?: string }) {
  const days = params.timeRange === 'week' ? 7 : params.timeRange === 'month' ? 30 : 90;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const moods = await prisma.moodEntry.findMany({
    where: { userId, createdAt: { gte: since } },
    orderBy: { createdAt: 'asc' },
  });

  if (moods.length === 0) {
    return { analysis: 'No mood data available for this period.', dataPoints: 0 };
  }

  const avgMood = moods.reduce((sum, m) => sum + m.moodScore, 0) / moods.length;
  // Derive energy level from mood score (scale 1-10)
  const avgEnergy = avgMood;
  // Use emoji field for emotion tracking
  const emojis = moods.map(m => m.emoji).filter(Boolean);
  const emojiFreq: Record<string, number> = {};
  emojis.forEach(e => { emojiFreq[e] = (emojiFreq[e] || 0) + 1; });

  const topEmotions = Object.entries(emojiFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([emotion, count]) => ({ emotion, frequency: count }));

  const trend = moods.length >= 3
    ? moods.slice(-3).reduce((sum, m) => sum + m.moodScore, 0) / 3 > avgMood
      ? 'improving'
      : 'declining'
    : 'stable';

  return {
    analysis: {
      averageMood: avgMood.toFixed(2),
      averageEnergy: avgEnergy.toFixed(2),
      trend,
      topEmotions,
      dataPoints: moods.length,
      period: params.timeRange,
    },
    insights: generateMoodInsights(avgMood, avgEnergy, trend, topEmotions),
  };
}

function generateMoodInsights(avgMood: number, avgEnergy: number, trend: string, emotions: { emotion: string; frequency: number }[]) {
  const insights: string[] = [];

  if (avgMood < 4) {
    insights.push('Your emotional baseline has been lower than optimal. Consider increasing grounding rituals.');
  } else if (avgMood > 7) {
    insights.push('You\'ve maintained a positive emotional state. This is a good time for deeper shadow work.');
  }

  if (avgEnergy < 4) {
    insights.push('Your energy levels suggest possible burnout. Prioritize rest and breathing exercises.');
  }

  if (trend === 'improving') {
    insights.push('Your trajectory shows positive momentum. Your current practices are working.');
  } else if (trend === 'declining') {
    insights.push('There\'s been a downward shift. Let\'s explore what might be contributing to this.');
  }

  return insights;
}

async function executeJournalAnalysis(userId: string, params: { analysisType: string; depth?: string }) {
  const entries = await prisma.journalEntry.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: params.depth === 'profound' ? 50 : params.depth === 'deep' ? 20 : 10,
  });

  if (entries.length === 0) {
    return { analysis: 'No journal entries found for analysis.', entryCount: 0 };
  }

  const sentiments = entries.map(e => ({
    score: e.sentimentScore || 0,
    label: e.sentimentLabel || 'neutral',
    emotions: (Array.isArray(e.emotionTags) ? e.emotionTags : []) as string[],
  }));

  const avgSentiment = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;
  const allEmotions = sentiments.flatMap(s => s.emotions);
  const emotionCounts: Record<string, number> = {};
  allEmotions.forEach(e => { emotionCounts[e] = (emotionCounts[e] || 0) + 1; });

  const dominantThemes = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    analysis: {
      entriesAnalyzed: entries.length,
      averageSentiment: avgSentiment.toFixed(2),
      dominantThemes,
      analysisType: params.analysisType,
    },
    insights: generateJournalInsights(params.analysisType, dominantThemes, avgSentiment),
  };
}

function generateJournalInsights(type: string, themes: [string, number][], avgSentiment: number) {
  const insights: string[] = [];

  switch (type) {
    case 'shadow_work':
      insights.push('Shadow work analysis reveals recurring patterns that may indicate unexplored aspects of self.');
      if (themes.some(t => t[0].includes('anxiety') || t[0].includes('fear'))) {
        insights.push('Anxiety patterns detected suggest beneficial exploration of core fears.');
      }
      break;
    case 'growth_patterns':
      insights.push(`Your journaling shows ${avgSentiment > 0 ? 'positive' : 'challenging'} growth trajectory.`);
      break;
    case 'emotional_themes':
      insights.push(`Dominant emotional themes: ${themes.slice(0, 3).map(t => t[0]).join(', ')}`);
      break;
  }

  return insights;
}

async function executeRitualRecommendation(userId: string, params: { urgency: string; type?: string }) {
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  const recentMood = await prisma.moodEntry.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  const archetype = profile?.archetype || 'SEEKER';
  const currentMood = recentMood?.moodScore || 5;
  // Derive energy from mood score since energyLevel doesn't exist in schema
  const currentEnergy = recentMood?.moodScore || 5;

  const recommendations = {
    DRIFTER: {
      immediate: { type: 'grounding', name: 'Ocean Breath', duration: '3 min', description: 'Gentle wave-like breathing to anchor you' },
      today: { type: 'journaling', name: 'Drift Mapping', duration: '10 min', description: 'Map where your thoughts have been flowing' },
      this_week: { type: 'reflection', name: 'Current Charting', duration: '20 min', description: 'Weekly review of your emotional currents' },
    },
    THINKER: {
      immediate: { type: 'breathing', name: 'Box Breathing', duration: '4 min', description: 'Structured 4-4-4-4 pattern for mental clarity' },
      today: { type: 'journaling', name: 'Thought Audit', duration: '15 min', description: 'Categorize and analyze today\'s thought patterns' },
      this_week: { type: 'reflection', name: 'System Review', duration: '30 min', description: 'Evaluate your mental frameworks' },
    },
    TRANSFORMER: {
      immediate: { type: 'movement', name: 'Power Pose', duration: '2 min', description: 'Embodied confidence activation' },
      today: { type: 'journaling', name: 'Phoenix Pages', duration: '15 min', description: 'Document your transformation journey' },
      this_week: { type: 'reflection', name: 'Metamorphosis Map', duration: '25 min', description: 'Track your evolution patterns' },
    },
    SEEKER: {
      immediate: { type: 'grounding', name: 'Safe Harbor', duration: '5 min', description: 'Create an inner sanctuary visualization' },
      today: { type: 'journaling', name: 'Path Exploration', duration: '12 min', description: 'Explore what you\'re seeking today' },
      this_week: { type: 'reflection', name: 'Quest Review', duration: '20 min', description: 'Review your seeking journey' },
    },
    VETERAN: {
      immediate: { type: 'breathing', name: 'Warrior Breath', duration: '3 min', description: 'Strong, direct breathing for resilience' },
      today: { type: 'journaling', name: 'Battle Log', duration: '10 min', description: 'Document today\'s challenges and victories' },
      this_week: { type: 'reflection', name: 'Campaign Review', duration: '15 min', description: 'Strategic review of your progress' },
    },
  };

  const archetypeRecs = recommendations[archetype as keyof typeof recommendations] || recommendations.SEEKER;
  const urgencyKey = params.urgency.replace('-', '_') as keyof typeof archetypeRecs;
  const recommendation = archetypeRecs[urgencyKey] || archetypeRecs.today;

  // Adjust for current state
  let adjustedRec = { ...recommendation };
  if (currentMood < 4) {
    adjustedRec.description += ' (modified for gentle support)';
  }
  if (currentEnergy < 4) {
    adjustedRec.duration = 'shortened version available';
  }

  return {
    recommendation: adjustedRec,
    context: {
      archetype,
      currentMood,
      currentEnergy,
      urgency: params.urgency,
    },
  };
}

async function executePromptGeneration(userId: string, params: { promptType: string; emotionalTone?: string }) {
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  const recentEntries = await prisma.journalEntry.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { emotionTags: true, sentimentLabel: true },
  });

  const archetype = profile?.archetype || 'SEEKER';
  const recentEmotions = recentEntries.flatMap(e => e.emotionTags || []);
  const tone = params.emotionalTone || 'gentle';

  const promptTemplates = {
    shadow_exploration: {
      gentle: `${archetype === 'DRIFTER' ? 'As you float through your inner waters' : 'As you look within'}, what part of yourself have you been avoiding? Write to that part with compassion.`,
      challenging: `What would you do if the part of yourself you hide most was fully accepted? Explore without judgment.`,
      curious: `If your shadow self could speak, what would it tell you about your deepest desires?`,
      supportive: `Your hidden aspects carry wisdom. What message might they have for your growth?`,
    },
    gratitude: {
      gentle: `What unexpected gift did today bring? Let yourself fully receive it.`,
      challenging: `What challenge are you secretly grateful for? How has it shaped you?`,
      curious: `If gratitude were a place, what would yours look like today?`,
      supportive: `Name three small moments that held beauty today. Let them fill you.`,
    },
    future_visioning: {
      gentle: `Imagine yourself one year from now, healed and whole. What does that version of you want you to know?`,
      challenging: `What would you create if you knew you couldn't fail? Dream boldly.`,
      curious: `If your future self could send a message through time, what would it say?`,
      supportive: `Plant a seed of intention. What do you want to grow in your life?`,
    },
    emotional_processing: {
      gentle: `What emotion has been asking for your attention? Give it space to speak.`,
      challenging: `What feeling have you been pushing away? Invite it closer.`,
      curious: `If this emotion were a weather pattern, what would it be? Describe its landscape.`,
      supportive: `Your feelings are messengers. What is this one trying to tell you?`,
    },
    relationship_reflection: {
      gentle: `Think of someone who has impacted your journey. What would you tell them?`,
      challenging: `What relationship pattern keeps repeating in your life? What might it be teaching you?`,
      curious: `If you could have a conversation with anyone, living or passed, who and why?`,
      supportive: `How have your relationships shaped who you\'re becoming?`,
    },
  };

  const typePrompts = promptTemplates[params.promptType as keyof typeof promptTemplates] || promptTemplates.emotional_processing;
  const prompt = typePrompts[tone as keyof typeof typePrompts] || typePrompts.gentle;

  return {
    prompt,
    context: {
      archetype,
      recentEmotions: recentEmotions.slice(0, 5),
      tone,
      type: params.promptType,
    },
  };
}

async function executeInsightSynthesis(userId: string, params: { focus: string }) {
  const [profile, moods, journals, sessions] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.moodEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
    prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.breathSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
  ]);

  const synthesis = {
    overall_progress: synthesizeOverallProgress(profile, moods, journals, sessions),
    areas_of_growth: identifyGrowthAreas(moods, journals),
    blind_spots: identifyBlindSpots(moods, journals),
    strengths: identifyStrengths(profile, moods, journals, sessions),
    next_steps: recommendNextSteps(profile, moods, journals),
  };

  return {
    synthesis: synthesis[params.focus as keyof typeof synthesis],
    meta: {
      dataPoints: {
        moods: moods.length,
        journals: journals.length,
        sessions: sessions.length,
      },
      archetype: profile?.archetype,
    },
  };
}

function synthesizeOverallProgress(profile: any, moods: any[], journals: any[], sessions: any[]) {
  const ritualConsistency = sessions.length > 20 ? 'strong' : sessions.length > 10 ? 'moderate' : 'developing';
  const journalingDepth = journals.length > 15 ? 'deep' : journals.length > 5 ? 'growing' : 'emerging';
  const moodTrend = moods.length > 0
    ? moods.slice(0, 5).reduce((sum, m) => sum + m.moodScore, 0) / 5 >
      moods.slice(-5).reduce((sum, m) => sum + m.moodScore, 0) / 5
      ? 'improving' : 'stable'
    : 'unknown';

  return {
    summary: `Your journey as a ${profile?.archetype || 'traveler'} shows ${ritualConsistency} ritual consistency, ${journalingDepth} journaling practice, and ${moodTrend} mood trajectory.`,
    metrics: { ritualConsistency, journalingDepth, moodTrend },
    narrative: `You've been walking this path with dedication. Your ${profile?.archetype || 'unique'} nature brings special gifts to your healing journey.`,
  };
}

function identifyGrowthAreas(moods: any[], journals: any[]) {
  const areas: string[] = [];

  const moodVariance = moods.length > 5
    ? Math.sqrt(moods.reduce((sum, m) => sum + Math.pow(m.moodScore - 5, 2), 0) / moods.length)
    : 0;

  if (moodVariance > 2) {
    areas.push('Emotional regulation - your feelings vary significantly, which shows depth but may benefit from stabilizing practices');
  }

  if (journals.length > 0) {
    const avgSentiment = journals.reduce((sum, j) => sum + (j.sentimentScore || 0), 0) / journals.length;
    if (avgSentiment < -0.2) {
      areas.push('Self-compassion - your inner narrative tends toward criticism; gentle reframing could help');
    }
  }

  return { areas, count: areas.length };
}

function identifyBlindSpots(moods: any[], journals: any[]) {
  const blindSpots: string[] = [];

  const emotions = new Set(moods.flatMap(m => m.emotions));
  const negativeEmotions = ['anger', 'sadness', 'fear', 'anxiety', 'frustration'];
  const positiveEmotions = ['joy', 'peace', 'excitement', 'gratitude', 'love'];

  const hasNegative = negativeEmotions.some(e => emotions.has(e));
  const hasPositive = positiveEmotions.some(e => emotions.has(e));

  if (!hasNegative) {
    blindSpots.push('Shadow emotions - you may be avoiding difficult feelings that hold important messages');
  }
  if (!hasPositive) {
    blindSpots.push('Joy receptivity - opening to positive emotions may feel vulnerable but is healing');
  }

  return { blindSpots, count: blindSpots.length };
}

function identifyStrengths(profile: any, moods: any[], journals: any[], sessions: any[]) {
  const strengths: string[] = [];

  if (sessions.length > 10) {
    strengths.push('Ritual dedication - you show up consistently for your practice');
  }
  if (journals.length > 10) {
    strengths.push('Self-reflection - you invest in understanding yourself');
  }
  if (moods.length > 20) {
    strengths.push('Emotional awareness - you track and acknowledge your feelings');
  }

  const archetypeStrengths: Record<string, string> = {
    DRIFTER: 'Emotional fluidity - you navigate feelings with natural grace',
    THINKER: 'Analytical insight - you understand patterns others miss',
    TRANSFORMER: 'Resilient spirit - you transmute challenges into growth',
    SEEKER: 'Curious heart - you remain open to new understanding',
    VETERAN: 'Hard-won wisdom - your experience guides others',
  };

  if (profile?.archetype && archetypeStrengths[profile.archetype]) {
    strengths.push(archetypeStrengths[profile.archetype]);
  }

  return { strengths, count: strengths.length };
}

function recommendNextSteps(profile: any, moods: any[], journals: any[]) {
  const steps: { action: string; priority: 'high' | 'medium' | 'low'; reason: string }[] = [];

  if (journals.length < 5) {
    steps.push({
      action: 'Deepen journaling practice',
      priority: 'high',
      reason: 'More entries will unlock deeper AI insights about your patterns',
    });
  }

  const recentMoods = moods.slice(0, 7);
  const avgRecentMood = recentMoods.length > 0
    ? recentMoods.reduce((sum, m) => sum + m.moodScore, 0) / recentMoods.length
    : 5;

  if (avgRecentMood < 4) {
    steps.push({
      action: 'Increase grounding rituals',
      priority: 'high',
      reason: 'Your recent mood suggests extra support would be beneficial',
    });
  }

  steps.push({
    action: 'Schedule a reflection session',
    priority: 'medium',
    reason: 'Regular deep reflection accelerates growth',
  });

  return { steps, count: steps.length };
}

async function executeInterventionCheck(userId: string, params: { checkType: string }) {
  const [profile, recentMoods, recentChats] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.moodEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 7,
    }),
    prisma.companionMessage.findMany({
      where: { chat: { userId } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  let interventionNeeded = false;
  let interventionType = 'none';
  let urgency = 'low';
  const reasons: string[] = [];

  if (params.checkType === 'risk_assessment') {
    // Check PHQ-9/GAD-7 scores
    const highRiskMoods = recentMoods.filter(m =>
      (m.phq9Score && m.phq9Score >= 15) || (m.gad7Score && m.gad7Score >= 15)
    );

    if (highRiskMoods.length > 0) {
      interventionNeeded = true;
      interventionType = 'clinical_escalation';
      urgency = 'high';
      reasons.push('Clinical scores indicate elevated distress');
    }

    // Check mood decline
    if (recentMoods.length >= 5) {
      const avgRecent = recentMoods.slice(0, 3).reduce((sum, m) => sum + m.moodScore, 0) / 3;
      if (avgRecent < 3) {
        interventionNeeded = true;
        interventionType = 'support_check_in';
        urgency = urgency === 'high' ? 'high' : 'medium';
        reasons.push('Sustained low mood detected');
      }
    }
  }

  if (params.checkType === 'engagement_check') {
    const lastActivity = recentMoods[0]?.createdAt;
    if (lastActivity) {
      const daysSinceActivity = Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceActivity > 3) {
        interventionNeeded = true;
        interventionType = 'gentle_nudge';
        urgency = 'low';
        reasons.push(`No activity for ${daysSinceActivity} days`);
      }
    }
  }

  return {
    interventionNeeded,
    interventionType,
    urgency,
    reasons,
    checkType: params.checkType,
  };
}

// Tool executor map
const toolExecutors: Record<string, (userId: string, params: any) => Promise<any>> = {
  analyze_mood_patterns: executeMoodAnalysis,
  analyze_journal_themes: executeJournalAnalysis,
  recommend_ritual: executeRitualRecommendation,
  generate_personalized_prompt: executePromptGeneration,
  create_insight_synthesis: executeInsightSynthesis,
  detect_intervention_need: executeInterventionCheck,
};

// Main agent orchestration function
export interface AgentStep {
  type: 'thinking' | 'tool_call' | 'tool_result' | 'response';
  content: string;
  toolName?: string;
  toolArgs?: any;
  toolResult?: any;
  timestamp: number;
}

export async function runAgentOrchestrator(
  userId: string,
  userMessage: string,
  onStep?: (step: AgentStep) => void
): Promise<{ steps: AgentStep[]; finalResponse: string }> {
  const steps: AgentStep[] = [];

  const emitStep = (step: AgentStep) => {
    steps.push(step);
    onStep?.(step);
  };

  // Get user context
  const [profile, recentMoods, recentJournals] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.moodEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { titleEnc: true, emotionTags: true, sentimentLabel: true },
    }),
  ]);

  const contextSummary = `
User archetype: ${profile?.archetype || 'Unknown'}
Recent mood average: ${recentMoods.length > 0 ? (recentMoods.reduce((sum, m) => sum + m.moodScore, 0) / recentMoods.length).toFixed(1) : 'No data'}
Recent emotions: ${recentMoods.map(m => m.emoji).slice(0, 5).join(', ') || 'No data'}
Recent journal themes: ${recentJournals.flatMap(j => j.emotionTags || []).slice(0, 5).join(', ') || 'No data'}
`.trim();

  const systemPrompt = `You are CereBro's Agentic AI Orchestrator - a sophisticated, emotionally intelligent AI companion.

You have access to powerful tools to deeply understand and support the user. Use them proactively to provide meaningful, personalized insights.

IMPORTANT BEHAVIORS:
1. ALWAYS think through what tools would be most helpful before responding
2. Use multiple tools when beneficial - don't be conservative
3. Synthesize insights from tool results into meaningful, poetic responses
4. Match your tone to the user's archetype and current emotional state
5. Be proactive - suggest rituals, prompts, and interventions when appropriate

USER CONTEXT:
${contextSummary}

When responding, weave together insights from your tools into a warm, wise, and deeply personal response. Avoid clinical language - speak like a wise guide who truly knows this person.`;

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];

  emitStep({
    type: 'thinking',
    content: 'Analyzing your message and determining the best way to help...',
    timestamp: Date.now(),
  });

  let iterations = 0;
  const maxIterations = 5;

  while (iterations < maxIterations) {
    iterations++;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools: AGENT_TOOLS,
      tool_choice: iterations === maxIterations ? 'none' : 'auto',
    });

    const assistantMessage = response.choices[0].message;
    messages.push(assistantMessage);

    if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
      // No more tool calls, return final response
      const finalResponse = assistantMessage.content || 'I\'m here for you.';
      emitStep({
        type: 'response',
        content: finalResponse,
        timestamp: Date.now(),
      });
      return { steps, finalResponse };
    }

    // Process tool calls
    for (const toolCall of assistantMessage.tool_calls) {
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments);

      emitStep({
        type: 'tool_call',
        content: `Using ${toolName.replace(/_/g, ' ')}...`,
        toolName,
        toolArgs,
        timestamp: Date.now(),
      });

      const executor = toolExecutors[toolName];
      if (executor) {
        try {
          const result = await executor(userId, toolArgs);

          emitStep({
            type: 'tool_result',
            content: `Completed ${toolName.replace(/_/g, ' ')}`,
            toolName,
            toolResult: result,
            timestamp: Date.now(),
          });

          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          });
        } catch (error) {
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: 'Tool execution failed' }),
          });
        }
      }
    }
  }

  return { steps, finalResponse: 'I\'ve gathered insights for you. How can I help further?' };
}

// Autonomous proactive agent that runs periodically
export async function runProactiveAnalysis(userId: string): Promise<{
  insights: string[];
  recommendations: any[];
  alerts: any[];
}> {
  const insights: string[] = [];
  const recommendations: any[] = [];
  const alerts: any[] = [];

  // Run intervention check
  const interventionResult = await executeInterventionCheck(userId, { checkType: 'risk_assessment' });
  if (interventionResult.interventionNeeded) {
    alerts.push({
      type: interventionResult.interventionType,
      urgency: interventionResult.urgency,
      reasons: interventionResult.reasons,
    });
  }

  // Run engagement check
  const engagementResult = await executeInterventionCheck(userId, { checkType: 'engagement_check' });
  if (engagementResult.interventionNeeded) {
    alerts.push({
      type: engagementResult.interventionType,
      urgency: engagementResult.urgency,
      reasons: engagementResult.reasons,
    });
  }

  // Generate mood insights
  const moodAnalysis = await executeMoodAnalysis(userId, { timeRange: 'week' });
  if (moodAnalysis.insights && Array.isArray(moodAnalysis.insights)) {
    insights.push(...moodAnalysis.insights);
  }

  // Get ritual recommendation
  const ritual = await executeRitualRecommendation(userId, { urgency: 'today' });
  recommendations.push({
    ...ritual.recommendation,
    type: 'ritual',
  });

  // Get personalized prompt
  const prompt = await executePromptGeneration(userId, { promptType: 'emotional_processing', emotionalTone: 'gentle' });
  recommendations.push({
    type: 'journal_prompt',
    prompt: prompt.prompt,
  });

  return { insights, recommendations, alerts };
}
