// Archetype Assignment Algorithm
// Based on ACE score, mood patterns, trauma responses, and behavioral indicators

import type { Archetype } from '@prisma/client';

export interface ArchetypeScores {
  DRIFTER: number;
  THINKER: number;
  TRANSFORMER: number;
  SEEKER: number;
  VETERAN: number;
}

export interface ArchetypeInput {
  aceScore: number;
  aceCategoryScores: { abuse: number; neglect: number; household: number };
  moodCalibration: {
    dominantEmotions: string[];
    volatility: number; // 0-1
    baseline: number; // 1-10
  };
  traumaResponses: {
    avoidance: number; // 0-5
    hypervigilance: number; // 0-5
    dissociation: number; // 0-5
    connection: number; // 0-5
  };
  timeTakenMs: number;
}

export interface ArchetypeResult {
  primary: Archetype;
  scores: ArchetypeScores;
  confidence: number;
  description: string;
  companionTone: string;
}

const ARCHETYPE_PROFILES: Record<Archetype, { description: string; companionTone: string }> = {
  DRIFTER: {
    description: 'You float between worlds, seeking connection and meaning. Your sensitivity is your greatest strength. You see beauty others miss, feel depths others cannot fathom.',
    companionTone: 'Gentle and playful, like a trusted friend who never judges',
  },
  THINKER: {
    description: 'You process deeply, analyzing patterns within patterns. Your mind is a labyrinth of insight. Logic is your compass, but your heart holds maps to undiscovered territories.',
    companionTone: 'Structured and thoughtful, offering frameworks and evidence',
  },
  TRANSFORMER: {
    description: 'You have walked through fire and emerged changed. Your resilience inspires transformation. Scars become constellations by which others navigate their own darkness.',
    companionTone: 'Empowering and affirming, celebrating your strength',
  },
  SEEKER: {
    description: 'You search for safety and belonging. Your courage to seek help shows profound strength. The path you walk takes more bravery than most will ever know.',
    companionTone: 'Safe and patient, never rushing, always present',
  },
  VETERAN: {
    description: 'You have weathered many storms. Your experience has forged wisdom and quiet strength. You know darkness intimately, and thus recognize light more clearly.',
    companionTone: 'Direct and honest, respecting your experience',
  },
};

export function calculateArchetype(input: ArchetypeInput): ArchetypeResult {
  const scores: ArchetypeScores = {
    DRIFTER: 0,
    THINKER: 0,
    TRANSFORMER: 0,
    SEEKER: 0,
    VETERAN: 0,
  };

  // ACE Score influence
  if (input.aceScore === 0) {
    scores.DRIFTER += 2;
    scores.THINKER += 2;
  } else if (input.aceScore <= 3) {
    scores.THINKER += 2;
    scores.TRANSFORMER += 1;
  } else if (input.aceScore <= 6) {
    scores.TRANSFORMER += 3;
    scores.SEEKER += 2;
  } else {
    scores.VETERAN += 4;
    scores.TRANSFORMER += 2;
  }

  // Category-specific ACE influences
  if (input.aceCategoryScores.neglect >= 2) {
    scores.SEEKER += 2;
    scores.DRIFTER += 1;
  }
  if (input.aceCategoryScores.abuse >= 2) {
    scores.VETERAN += 2;
    scores.TRANSFORMER += 1;
  }
  if (input.aceCategoryScores.household >= 3) {
    scores.THINKER += 1; // Trying to make sense of chaos
    scores.VETERAN += 1;
  }

  // Mood calibration influence
  if (input.moodCalibration.volatility > 0.6) {
    scores.DRIFTER += 2;
    scores.SEEKER += 1;
  }
  if (input.moodCalibration.baseline < 4) {
    scores.SEEKER += 2;
    scores.VETERAN += 1;
  }
  if (input.moodCalibration.dominantEmotions.includes('anxious') ||
      input.moodCalibration.dominantEmotions.includes('worried')) {
    scores.THINKER += 1;
    scores.SEEKER += 1;
  }
  if (input.moodCalibration.dominantEmotions.includes('hopeful') ||
      input.moodCalibration.dominantEmotions.includes('determined')) {
    scores.TRANSFORMER += 2;
  }

  // Trauma response influences
  if (input.traumaResponses.avoidance >= 3) {
    scores.DRIFTER += 2;
  }
  if (input.traumaResponses.hypervigilance >= 3) {
    scores.THINKER += 2;
    scores.VETERAN += 1;
  }
  if (input.traumaResponses.dissociation >= 3) {
    scores.DRIFTER += 2;
    scores.SEEKER += 1;
  }
  if (input.traumaResponses.connection >= 3) {
    scores.TRANSFORMER += 2;
    scores.DRIFTER += 1;
  }

  // Time taken influence (thoughtful vs impulsive)
  if (input.timeTakenMs > 300000) { // > 5 minutes
    scores.THINKER += 1;
  }

  // Determine primary archetype
  const entries = Object.entries(scores) as [Archetype, number][];
  entries.sort((a, b) => b[1] - a[1]);
  const primary = entries[0][0];
  const maxScore = entries[0][1];
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  // Normalize scores to 0-1
  const normalizedScores: ArchetypeScores = {
    DRIFTER: scores.DRIFTER / totalScore,
    THINKER: scores.THINKER / totalScore,
    TRANSFORMER: scores.TRANSFORMER / totalScore,
    SEEKER: scores.SEEKER / totalScore,
    VETERAN: scores.VETERAN / totalScore,
  };

  // Confidence based on how dominant the primary is
  const confidence = maxScore / totalScore;

  return {
    primary,
    scores: normalizedScores,
    confidence,
    description: ARCHETYPE_PROFILES[primary].description,
    companionTone: ARCHETYPE_PROFILES[primary].companionTone,
  };
}

export function getArchetypeLabel(archetype: Archetype): string {
  const labels: Record<Archetype, string> = {
    DRIFTER: 'The Drifter',
    THINKER: 'The Thinker',
    TRANSFORMER: 'The Transformer',
    SEEKER: 'The Seeker',
    VETERAN: 'The Veteran',
  };
  return labels[archetype];
}

export function getArchetypeColor(archetype: Archetype): string {
  const colors: Record<Archetype, string> = {
    DRIFTER: '#8078ff',
    THINKER: '#6b52fc',
    TRANSFORMER: '#e2a73f',
    SEEKER: '#22c55e',
    VETERAN: '#a05719',
  };
  return colors[archetype];
}
