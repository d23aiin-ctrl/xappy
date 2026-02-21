import OpenAI from 'openai';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface CaseBrief {
  summary: string;
  presentingConcerns: string[];
  riskAssessment: {
    level: 'low' | 'moderate' | 'high' | 'critical';
    score: number;
    factors: string[];
  };
  emotionalPatterns: {
    dominantEmotions: string[];
    moodTrajectory: string;
    sentimentTrend: string;
  };
  behavioralIndicators: string[];
  recommendedApproach: string[];
  timelineEvents: { date: string; event: string; significance: string }[];
  additionalNotes: string;
}

const BRIEF_SYSTEM_PROMPT = `You are an AI clinical assistant (AI Twin) for CereBro, a mental wellness platform.
Your job is to generate structured case briefs for therapists based on anonymized user data.

Important guidelines:
- Be objective and clinical in tone
- Highlight patterns, not diagnoses
- Note both risk factors and protective factors
- Recommend therapeutic approaches based on observed patterns
- Flag any urgent concerns clearly
- Never make definitive diagnoses
- Present observations with appropriate hedging language ("patterns suggest", "data indicates")

Format your response as a valid JSON object with this structure:
{
  "summary": "2-3 sentence overview of the case",
  "presentingConcerns": ["concern1", "concern2"],
  "riskAssessment": {
    "level": "low|moderate|high|critical",
    "score": 0-100,
    "factors": ["factor1", "factor2"]
  },
  "emotionalPatterns": {
    "dominantEmotions": ["emotion1", "emotion2"],
    "moodTrajectory": "description of mood trend over time",
    "sentimentTrend": "improving|declining|stable|fluctuating"
  },
  "behavioralIndicators": ["indicator1", "indicator2"],
  "recommendedApproach": ["approach1", "approach2"],
  "timelineEvents": [{"date": "YYYY-MM-DD", "event": "description", "significance": "why it matters"}],
  "additionalNotes": "any other relevant observations"
}`;

export async function generateCaseBrief(userId: string, escalationId: string): Promise<CaseBrief> {
  // Gather anonymized user data
  const [moodEntries, journalEntries, companionMessages, escalations, profile, breathSessions] =
    await Promise.all([
      prisma.moodEntry.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 30,
        select: {
          moodScore: true,
          phq9Score: true,
          gad7Score: true,
          sentimentLabel: true,
          emoji: true,
          createdAt: true,
        },
      }),
      prisma.journalEntry.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          sentimentScore: true,
          sentimentLabel: true,
          emotionTags: true,
          wordCount: true,
          createdAt: true,
        },
      }),
      prisma.companionMessage.findMany({
        where: {
          chat: { userId },
          role: 'user',
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          contentEnc: true,
          riskFlagged: true,
          riskKeywords: true,
          createdAt: true,
        },
      }),
      prisma.escalation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          trigger: true,
          riskScore: true,
          triggerData: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.userProfile.findUnique({
        where: { userId },
        select: {
          archetype: true,
          streakDays: true,
          createdAt: true,
        },
      }),
      prisma.breathSession.aggregate({
        where: { userId },
        _count: true,
        _sum: { durationSecs: true },
      }),
    ]);

  // Anonymize and structure data for the AI
  const moodData = moodEntries.map((m) => ({
    score: m.moodScore,
    phq9: m.phq9Score,
    gad7: m.gad7Score,
    sentiment: m.sentimentLabel,
    emoji: m.emoji,
    date: m.createdAt.toISOString().split('T')[0],
  }));

  const journalData = journalEntries.map((j) => ({
    sentiment: j.sentimentLabel,
    sentimentScore: j.sentimentScore,
    emotions: j.emotionTags,
    wordCount: j.wordCount,
    date: j.createdAt.toISOString().split('T')[0],
  }));

  // Decrypt companion messages for brief (only summary-level content)
  const chatPatterns = companionMessages.map((m) => {
    const content = decrypt(m.contentEnc);
    return {
      riskFlagged: m.riskFlagged,
      keywords: m.riskKeywords,
      contentLength: content.length,
      date: m.createdAt.toISOString().split('T')[0],
    };
  });

  const escalationHistory = escalations.map((e) => ({
    trigger: e.trigger,
    riskScore: e.riskScore,
    status: e.status,
    date: e.createdAt.toISOString().split('T')[0],
  }));

  const contextPrompt = `
Generate a clinical case brief for a patient with the following anonymized data:

**Profile:**
- Archetype: ${profile?.archetype || 'Unknown'}
- Current streak: ${profile?.streakDays || 0} days
- Longest streak: ${profile?.streakDays || 0} days
- Total breathing sessions: ${breathSessions._count || 0}
- Total breathing minutes: ${Math.round((breathSessions._sum.durationSecs || 0) / 60)}

**Recent Mood Data (last 30 entries):**
${JSON.stringify(moodData, null, 2)}

**Journal Patterns (last 10 entries):**
${JSON.stringify(journalData, null, 2)}

**Companion Chat Patterns:**
${JSON.stringify(chatPatterns, null, 2)}

**Escalation History:**
${JSON.stringify(escalationHistory, null, 2)}

Generate the case brief JSON now.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: BRIEF_SYSTEM_PROMPT },
        { role: 'user', content: contextPrompt },
      ],
      max_tokens: 1500,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    const brief = JSON.parse(responseText) as CaseBrief;
    return brief;
  } catch (error) {
    // Return a fallback brief with available data
    const avgMood = moodData.length > 0
      ? moodData.reduce((sum, m) => sum + m.score, 0) / moodData.length
      : 5;
    const latestPHQ9 = moodData.find((m) => m.phq9 != null)?.phq9 || 0;
    const latestGAD7 = moodData.find((m) => m.gad7 != null)?.gad7 || 0;

    return {
      summary: `Patient with ${profile?.archetype || 'unknown'} archetype. Average mood score: ${avgMood.toFixed(1)}/10. Latest PHQ-9: ${latestPHQ9}, GAD-7: ${latestGAD7}. ${escalationHistory.length} escalation events recorded.`,
      presentingConcerns: [
        latestPHQ9 >= 15 ? 'Elevated PHQ-9 indicating possible major depression' : 'PHQ-9 within manageable range',
        latestGAD7 >= 15 ? 'Elevated GAD-7 indicating significant anxiety' : 'GAD-7 within manageable range',
        ...escalationHistory.filter((e) => e.trigger === 'KEYWORD_DETECTED').length > 0
          ? ['Risk keywords detected in companion chat']
          : [],
      ],
      riskAssessment: {
        level: latestPHQ9 >= 20 || latestGAD7 >= 20 ? 'critical' : latestPHQ9 >= 15 ? 'high' : latestPHQ9 >= 10 ? 'moderate' : 'low',
        score: Math.max(latestPHQ9, latestGAD7) * 4,
        factors: escalationHistory.map((e) => `${e.trigger} (score: ${e.riskScore})`),
      },
      emotionalPatterns: {
        dominantEmotions: [...new Set(journalData.flatMap((j) => (j.emotions as string[]) || []).slice(0, 5))],
        moodTrajectory: `Average mood: ${avgMood.toFixed(1)}/10 over ${moodData.length} entries`,
        sentimentTrend: 'data_insufficient',
      },
      behavioralIndicators: [
        `${profile?.streakDays || 0}-day current wellness streak`,
        `${breathSessions._count || 0} breathing sessions completed`,
        `${journalData.length} journal entries in recent period`,
      ],
      recommendedApproach: [
        'Review escalation triggers and patterns',
        'Assess current support systems',
        'Consider evidence-based intervention based on PHQ-9/GAD-7 scores',
      ],
      timelineEvents: escalationHistory.map((e) => ({
        date: e.date,
        event: `Escalation: ${e.trigger}`,
        significance: `Risk score: ${e.riskScore}`,
      })),
      additionalNotes: 'AI-generated brief based on available platform data. Clinical judgment should supersede automated analysis.',
    };
  }
}
