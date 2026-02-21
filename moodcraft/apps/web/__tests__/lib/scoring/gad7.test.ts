/**
 * CereBro Web App - GAD-7 Scoring Tests
 *
 * Tests for GAD-7 (Generalized Anxiety Disorder-7) anxiety scoring.
 */
import {
  scoreGAD7,
  GAD7_QUESTIONS,
  GAD7_RESPONSE_OPTIONS,
  GAD7Result,
} from '@/lib/scoring/gad7';

describe('GAD-7 Scoring', () => {
  describe('scoreGAD7', () => {
    it('should return 0 for all zero responses', () => {
      const responses: Record<number, number> = {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0,
      };
      const result = scoreGAD7(responses);
      expect(result.totalScore).toBe(0);
    });

    it('should return maximum score for all 3 responses', () => {
      const responses: Record<number, number> = {
        1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3,
      };
      const result = scoreGAD7(responses);
      expect(result.totalScore).toBe(21);
    });

    it('should correctly sum responses', () => {
      const responses: Record<number, number> = {
        1: 1, 2: 2, 3: 1, 4: 0, 5: 2, 6: 1, 7: 0,
      };
      const result = scoreGAD7(responses);
      expect(result.totalScore).toBe(7);
    });

    it('should handle partial responses', () => {
      const responses: Record<number, number> = {
        1: 2, 2: 2, 3: 2,
      };
      const result = scoreGAD7(responses);
      expect(result.totalScore).toBe(6);
    });

    it('should handle empty responses', () => {
      const responses: Record<number, number> = {};
      const result = scoreGAD7(responses);
      expect(result.totalScore).toBe(0);
    });
  });

  describe('severity levels', () => {
    it('should return minimal for score 0-4', () => {
      const responses: Record<number, number> = { 1: 2, 2: 2 };
      const result = scoreGAD7(responses);
      expect(result.severity).toBe('minimal');
    });

    it('should return mild for score 5-9', () => {
      const responses: Record<number, number> = {
        1: 2, 2: 2, 3: 2, 4: 1,
      };
      const result = scoreGAD7(responses);
      expect(result.severity).toBe('mild');
    });

    it('should return moderate for score 10-14', () => {
      const responses: Record<number, number> = {
        1: 2, 2: 2, 3: 2, 4: 2, 5: 2,
      };
      const result = scoreGAD7(responses);
      expect(result.severity).toBe('moderate');
      expect(result.requiresAttention).toBe(true);
    });

    it('should return severe for score 15+', () => {
      const responses: Record<number, number> = {
        1: 3, 2: 3, 3: 3, 4: 3, 5: 3,
      };
      const result = scoreGAD7(responses);
      expect(result.severity).toBe('severe');
      expect(result.requiresAttention).toBe(true);
    });
  });

  describe('interpretation', () => {
    it('should provide interpretation text', () => {
      const responses: Record<number, number> = { 1: 1 };
      const result = scoreGAD7(responses);
      expect(result.interpretation).toBeDefined();
      expect(typeof result.interpretation).toBe('string');
      expect(result.interpretation.length).toBeGreaterThan(0);
    });
  });

  describe('GAD7_QUESTIONS', () => {
    it('should have 7 questions', () => {
      expect(GAD7_QUESTIONS.length).toBe(7);
    });

    it('each question should have required fields', () => {
      GAD7_QUESTIONS.forEach((q) => {
        expect(q).toHaveProperty('id');
        expect(q).toHaveProperty('clinicalText');
        expect(q).toHaveProperty('narrativeText');
      });
    });
  });

  describe('GAD7_RESPONSE_OPTIONS', () => {
    it('should have 4 response options (0-3)', () => {
      expect(GAD7_RESPONSE_OPTIONS.length).toBe(4);
    });

    it('should have values 0-3', () => {
      const values = GAD7_RESPONSE_OPTIONS.map((opt) => opt.value);
      expect(values).toEqual([0, 1, 2, 3]);
    });

    it('each option should have label and narrativeLabel', () => {
      GAD7_RESPONSE_OPTIONS.forEach((opt) => {
        expect(opt).toHaveProperty('label');
        expect(opt).toHaveProperty('narrativeLabel');
      });
    });
  });
});
