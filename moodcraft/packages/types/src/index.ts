// ─── Enums ──────────────────────────────────────────────────────

export type Role = 'INDIVIDUAL' | 'HR' | 'THERAPIST' | 'ADMIN' | 'SUPER_ADMIN';

export type Archetype = 'DRIFTER' | 'THINKER' | 'TRANSFORMER' | 'SEEKER' | 'VETERAN';

export type EscalationStatus =
  | 'PENDING'
  | 'AI_TWIN_REVIEW'
  | 'THERAPIST_ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED';

export type EscalationTrigger =
  | 'PHQ9_CRITICAL'
  | 'GAD7_CRITICAL'
  | 'KEYWORD_DETECTED'
  | 'AVOIDANCE_PATTERN'
  | 'MANUAL_SOS'
  | 'AI_COMPANION_FLAG';

export type BreathType = 'BOX' | 'FOUR_SEVEN_EIGHT' | 'PACED';

export type ConsentType = 'THERAPIST_ACCESS' | 'CORPORATE_ANALYTICS' | 'INSURANCE_SCORING' | 'RESEARCH';

export type MindMetroStation = 'AWARENESS' | 'ACCEPTANCE' | 'INTEGRATION' | 'SYNTHESIS';

// ─── API Types ──────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Mood Types ─────────────────────────────────────────────────

export interface MoodEntryInput {
  emoji: string;
  emojiSecondary?: string;
  moodScore: number;
  reflection?: string;
  voiceNoteUrl?: string;
  narrativeResponses?: Record<string, number>;
}

export interface SentimentResult {
  score: number; // -1 to 1
  label: 'positive' | 'negative' | 'neutral' | 'mixed';
  emotions?: string[];
  riskKeywords?: string[];
}

// ─── Journal Types ──────────────────────────────────────────────

export interface JournalEntryInput {
  title?: string;
  content: string;
  promptId?: string;
  isVoiceEntry?: boolean;
}

export interface AdaptivePromptContext {
  archetype: Archetype;
  recentSentiments: number[];
  toneTrajectory: 'improving' | 'stable' | 'declining';
  lastPromptCategories: string[];
}

// ─── Companion Types ────────────────────────────────────────────

export interface CompanionContext {
  archetype: Archetype;
  currentMood?: number;
  recentSentiment?: number;
  streakDays?: number;
  lastRitual?: string;
  riskLevel?: 'low' | 'moderate' | 'high';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  riskFlagged?: boolean;
}

// ─── Escalation Types ───────────────────────────────────────────

export interface RiskAssessment {
  riskScore: number; // 0-100
  triggers: EscalationTrigger[];
  shouldEscalate: boolean;
  urgency: 'low' | 'moderate' | 'high' | 'critical';
  details: string;
}

export interface CaseBrief {
  userId: string;
  presentingConcerns: string[];
  riskAssessment: RiskAssessment;
  moodHistory: { date: string; score: number }[];
  journalThemes: string[];
  ritualAdherence: number;
  recommendedApproach: string;
  generatedAt: string;
}

// ─── Corporate Types ────────────────────────────────────────────

export interface DepartmentStress {
  departmentId: string;
  departmentName: string;
  stressLevel: 'green' | 'yellow' | 'red';
  avgMoodScore: number;
  activeUsers: number;
  totalUsers: number;
  ritualAdherence: number;
}

export interface AttritionRiskResult {
  departmentId: string;
  riskScore: number;
  factors: string[];
  recommendation: string;
}

// ─── Insurance Types ────────────────────────────────────────────

export interface InsuranceRiskRequest {
  tokenized_user_ids: string[];
}

export interface InsuranceRiskResponse {
  scores: {
    tokenized_user_id: string;
    composite_score: number;
    ritual_adherence: number;
    sentiment_avg: number;
    computed_at: string;
  }[];
}

// ─── Badge Types ────────────────────────────────────────────────

export interface BadgeCriteria {
  type: 'count' | 'streak' | 'first' | 'milestone';
  resource: string;
  value: number;
}

// ─── NLP Service Types ──────────────────────────────────────────

export interface NLPSentimentRequest {
  text: string;
  context?: string;
}

export interface NLPRiskDetectionRequest {
  text: string;
  user_context?: {
    archetype?: string;
    recent_phq9?: number;
    recent_gad7?: number;
    days_inactive?: number;
  };
}

export interface NLPRiskDetectionResponse {
  risk_level: 'low' | 'moderate' | 'high' | 'critical';
  risk_score: number;
  keywords_detected: string[];
  should_escalate: boolean;
  details: string;
}

export interface NLPBriefRequest {
  user_id: string;
  mood_history: { date: string; score: number; phq9?: number; gad7?: number }[];
  journal_themes: string[];
  ritual_adherence: number;
  escalation_triggers: string[];
  archetype: string;
}

export interface NLPBriefResponse {
  brief: string;
  presenting_concerns: string[];
  risk_assessment: string;
  recommended_approach: string;
}
