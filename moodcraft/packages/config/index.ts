// Shared configuration constants for the CereBro platform

export const APP_NAME = 'CereBro';
export const APP_TAGLINE = 'Your mind is a labyrinth. We walk it with you.';

export const ARCHETYPES = ['DRIFTER', 'THINKER', 'TRANSFORMER', 'SEEKER', 'VETERAN'] as const;

export const ARCHETYPE_LABELS: Record<string, string> = {
  DRIFTER: 'The Drifter',
  THINKER: 'The Thinker',
  TRANSFORMER: 'The Transformer',
  SEEKER: 'The Seeker',
  VETERAN: 'The Veteran',
};

export const ARCHETYPE_DESCRIPTIONS: Record<string, string> = {
  DRIFTER: 'You float between worlds, seeking connection and meaning. Your sensitivity is your greatest strength.',
  THINKER: 'You process deeply, analyzing patterns within patterns. Your mind is a labyrinth of insight.',
  TRANSFORMER: 'You have walked through fire and emerged changed. Your resilience inspires transformation.',
  SEEKER: 'You search for safety and belonging. Your courage to seek help shows profound strength.',
  VETERAN: 'You have weathered many storms. Your experience has forged wisdom and quiet strength.',
};

export const MINDMETRO_STATIONS = ['AWARENESS', 'ACCEPTANCE', 'INTEGRATION', 'SYNTHESIS'] as const;

export const STRESS_LEVELS = {
  GREEN: { label: 'Healthy', color: '#22c55e', threshold: 0.7 },
  YELLOW: { label: 'Moderate', color: '#eab308', threshold: 0.4 },
  RED: { label: 'Critical', color: '#ef4444', threshold: 0 },
} as const;

export const RISK_THRESHOLDS = {
  PHQ9_CRITICAL: 15,
  GAD7_CRITICAL: 15,
  AVOIDANCE_DAYS: 7,
  ESCALATION_TIMEOUT_MS: 30000,
} as const;

export const NOTIFICATIONS = {
  MAX_PER_DAY: 3,
} as const;

export const INSURANCE_API = {
  DEFAULT_RATE_LIMIT: 1000,
  CACHE_TTL_SECONDS: 3600,
  RISK_WEIGHTS: {
    RITUAL_ADHERENCE: 0.4,
    SENTIMENT_AVG: 0.3,
    HRV_TREND: 0.3,
  },
} as const;

export const COMMUNITY = {
  MAX_MEMBERS_PER_CIRCLE: 50,
} as const;
