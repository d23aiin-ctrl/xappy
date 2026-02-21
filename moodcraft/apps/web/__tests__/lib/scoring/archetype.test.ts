/**
 * CereBro Web App - Archetype Scoring Tests
 *
 * Tests for user archetype assignment based on ACE score and patterns.
 */
import {
  calculateArchetype,
  getArchetypeLabel,
  getArchetypeColor,
  ArchetypeInput,
  ArchetypeResult,
} from '@/lib/scoring/archetype';
import type { Archetype } from '@prisma/client';

// Helper to create valid input with defaults
function createInput(overrides: Partial<ArchetypeInput>): ArchetypeInput {
  return {
    aceScore: 0,
    aceCategoryScores: { abuse: 0, neglect: 0, household: 0 },
    moodCalibration: {
      dominantEmotions: [],
      volatility: 0.5,
      baseline: 5,
    },
    traumaResponses: {
      avoidance: 0,
      hypervigilance: 0,
      dissociation: 0,
      connection: 0,
    },
    timeTakenMs: 60000,
    ...overrides,
  };
}

describe('Archetype Scoring', () => {
  describe('calculateArchetype', () => {
    it('should return DRIFTER for low ACE and high volatility', () => {
      const result = calculateArchetype(createInput({
        aceScore: 0,
        moodCalibration: {
          dominantEmotions: ['joy', 'peace'],
          volatility: 0.7,
          baseline: 7,
        },
        traumaResponses: { avoidance: 3, hypervigilance: 0, dissociation: 0, connection: 0 },
      }));
      expect(result.primary).toBe('DRIFTER');
    });

    it('should return THINKER for moderate ACE and hypervigilance', () => {
      const result = calculateArchetype(createInput({
        aceScore: 2,
        moodCalibration: {
          dominantEmotions: ['anxious', 'worried'],
          volatility: 0.4,
          baseline: 5,
        },
        traumaResponses: { avoidance: 0, hypervigilance: 4, dissociation: 0, connection: 0 },
        timeTakenMs: 400000, // > 5 min
      }));
      expect(result.primary).toBe('THINKER');
    });

    it('should return TRANSFORMER for high ACE with positive trajectory', () => {
      const result = calculateArchetype(createInput({
        aceScore: 5,
        aceCategoryScores: { abuse: 2, neglect: 1, household: 2 },
        moodCalibration: {
          dominantEmotions: ['hopeful', 'determined'],
          volatility: 0.3,
          baseline: 6,
        },
        traumaResponses: { avoidance: 0, hypervigilance: 0, dissociation: 0, connection: 4 },
      }));
      expect(result.primary).toBe('TRANSFORMER');
    });

    it('should return SEEKER for high neglect and low baseline', () => {
      const result = calculateArchetype(createInput({
        aceScore: 4,
        aceCategoryScores: { abuse: 0, neglect: 3, household: 1 },
        moodCalibration: {
          dominantEmotions: ['sad', 'anxious'],
          volatility: 0.7,
          baseline: 3,
        },
        traumaResponses: { avoidance: 2, hypervigilance: 1, dissociation: 2, connection: 0 },
      }));
      expect(result.primary).toBe('SEEKER');
    });

    it('should return VETERAN for very high ACE', () => {
      const result = calculateArchetype(createInput({
        aceScore: 8,
        aceCategoryScores: { abuse: 3, neglect: 2, household: 3 },
        moodCalibration: {
          dominantEmotions: ['peace'],
          volatility: 0.3,
          baseline: 5,
        },
        traumaResponses: { avoidance: 1, hypervigilance: 3, dissociation: 0, connection: 1 },
      }));
      expect(result.primary).toBe('VETERAN');
    });

    it('should return valid archetype for edge cases', () => {
      // Maximum ACE score
      const result1 = calculateArchetype(createInput({
        aceScore: 10,
        aceCategoryScores: { abuse: 3, neglect: 2, household: 5 },
        moodCalibration: {
          dominantEmotions: ['fear'],
          volatility: 1,
          baseline: 1,
        },
      }));
      expect(['DRIFTER', 'THINKER', 'TRANSFORMER', 'SEEKER', 'VETERAN']).toContain(result1.primary);

      // Minimum values
      const result2 = calculateArchetype(createInput({
        aceScore: 0,
        moodCalibration: {
          dominantEmotions: [],
          volatility: 0,
          baseline: 5,
        },
      }));
      expect(result2.primary).toBeDefined();
    });

    it('should return result with required fields', () => {
      const result = calculateArchetype(createInput({}));
      expect(result.primary).toBeDefined();
      expect(result.scores).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.description).toBeDefined();
      expect(result.companionTone).toBeDefined();
    });
  });

  describe('getArchetypeLabel', () => {
    const archetypes: Archetype[] = ['DRIFTER', 'THINKER', 'TRANSFORMER', 'SEEKER', 'VETERAN'];

    it('should return correct label for each archetype', () => {
      archetypes.forEach((archetype) => {
        const label = getArchetypeLabel(archetype);
        expect(label).toBeDefined();
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
      });
    });

    it('should return The Drifter for DRIFTER', () => {
      expect(getArchetypeLabel('DRIFTER')).toBe('The Drifter');
    });

    it('should return The Thinker for THINKER', () => {
      expect(getArchetypeLabel('THINKER')).toBe('The Thinker');
    });

    it('should return The Transformer for TRANSFORMER', () => {
      expect(getArchetypeLabel('TRANSFORMER')).toBe('The Transformer');
    });

    it('should return The Seeker for SEEKER', () => {
      expect(getArchetypeLabel('SEEKER')).toBe('The Seeker');
    });

    it('should return The Veteran for VETERAN', () => {
      expect(getArchetypeLabel('VETERAN')).toBe('The Veteran');
    });
  });

  describe('getArchetypeColor', () => {
    const archetypes: Archetype[] = ['DRIFTER', 'THINKER', 'TRANSFORMER', 'SEEKER', 'VETERAN'];

    it('should return a valid hex color for each archetype', () => {
      archetypes.forEach((archetype) => {
        const color = getArchetypeColor(archetype);
        expect(color).toBeDefined();
        expect(typeof color).toBe('string');
        expect(color.startsWith('#')).toBe(true);
      });
    });

    it('should return unique colors for different archetypes', () => {
      const colors = archetypes.map((a) => getArchetypeColor(a));
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(archetypes.length);
    });
  });
});
