/**
 * CereBro Web App - ACE Scoring Tests
 *
 * Tests for ACE (Adverse Childhood Experiences) questionnaire scoring.
 */
import { scoreACE, ACE_QUESTIONS, ACEResult } from '@/lib/scoring/ace';

describe('ACE Scoring', () => {
  describe('scoreACE', () => {
    it('should return 0 for all false responses', () => {
      const responses: Record<number, boolean> = {};
      ACE_QUESTIONS.forEach((q) => {
        responses[q.id] = false;
      });

      const result = scoreACE(responses);
      expect(result.totalScore).toBe(0);
    });

    it('should return maximum score for all true responses', () => {
      const responses: Record<number, boolean> = {};
      ACE_QUESTIONS.forEach((q) => {
        responses[q.id] = true;
      });

      const result = scoreACE(responses);
      expect(result.totalScore).toBe(ACE_QUESTIONS.length);
    });

    it('should correctly count true responses', () => {
      const responses: Record<number, boolean> = {
        1: true,
        2: false,
        3: true,
        4: false,
        5: true,
        6: false,
        7: false,
        8: false,
        9: false,
        10: false,
      };

      const result = scoreACE(responses);
      expect(result.totalScore).toBe(3);
    });

    it('should handle empty responses', () => {
      const responses: Record<number, boolean> = {};
      const result = scoreACE(responses);
      expect(result.totalScore).toBe(0);
    });

    it('should handle partial responses', () => {
      const responses: Record<number, boolean> = {
        1: true,
        2: true,
      };

      const result = scoreACE(responses);
      expect(result.totalScore).toBe(2);
    });

    it('should track category scores', () => {
      const responses: Record<number, boolean> = {
        1: true,  // abuse
        2: true,  // abuse
        3: false, // abuse
        4: true,  // neglect
        5: false, // neglect
        6: true,  // household
        7: false, // household
        8: false, // household
        9: false, // household
        10: false, // household
      };

      const result = scoreACE(responses);
      expect(result.categoryScores.abuse).toBe(2);
      expect(result.categoryScores.neglect).toBe(1);
      expect(result.categoryScores.household).toBe(1);
    });
  });

  describe('risk levels', () => {
    it('should return low for score 0', () => {
      const responses: Record<number, boolean> = {};
      const result = scoreACE(responses);
      expect(result.riskLevel).toBe('low');
    });

    it('should return moderate for score 1-3', () => {
      const responses: Record<number, boolean> = { 1: true, 2: true };
      const result = scoreACE(responses);
      expect(result.riskLevel).toBe('moderate');
    });

    it('should return high for score 4-6', () => {
      const responses: Record<number, boolean> = {
        1: true, 2: true, 3: true, 4: true, 5: true,
      };
      const result = scoreACE(responses);
      expect(result.riskLevel).toBe('high');
    });

    it('should return severe for score 7+', () => {
      const responses: Record<number, boolean> = {};
      ACE_QUESTIONS.forEach((q) => {
        responses[q.id] = true;
      });
      const result = scoreACE(responses);
      expect(result.riskLevel).toBe('severe');
    });

    it('should include interpretation text', () => {
      const responses: Record<number, boolean> = { 1: true };
      const result = scoreACE(responses);
      expect(result.interpretation).toBeDefined();
      expect(typeof result.interpretation).toBe('string');
      expect(result.interpretation.length).toBeGreaterThan(0);
    });
  });

  describe('ACE_QUESTIONS', () => {
    it('should have 10 questions', () => {
      expect(ACE_QUESTIONS.length).toBe(10);
    });

    it('should have unique IDs', () => {
      const ids = ACE_QUESTIONS.map((q) => q.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ACE_QUESTIONS.length);
    });

    it('each question should have required fields', () => {
      ACE_QUESTIONS.forEach((q) => {
        expect(q).toHaveProperty('id');
        expect(q).toHaveProperty('text');
        expect(q).toHaveProperty('category');
        expect(q).toHaveProperty('narrativeFrame');
      });
    });

    it('should cover all ACE categories', () => {
      const categories = new Set(ACE_QUESTIONS.map((q) => q.category));
      expect(categories.size).toBe(3); // abuse, neglect, household
    });
  });
});
