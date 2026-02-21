/**
 * CereBro Web App - PHQ-9 Scoring Tests
 *
 * Tests for PHQ-9 (Patient Health Questionnaire-9) depression scoring.
 */
import {
  scorePHQ9,
  PHQ9_QUESTIONS,
  PHQ9_RESPONSE_OPTIONS,
  PHQ9Result,
} from '@/lib/scoring/phq9';

describe('PHQ-9 Scoring', () => {
  describe('scorePHQ9', () => {
    it('should return 0 for all zero responses', () => {
      const responses: Record<number, number> = {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0,
      };
      const result = scorePHQ9(responses);
      expect(result.totalScore).toBe(0);
    });

    it('should return maximum score for all 3 responses', () => {
      const responses: Record<number, number> = {
        1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3,
      };
      const result = scorePHQ9(responses);
      expect(result.totalScore).toBe(27);
    });

    it('should correctly sum responses', () => {
      const responses: Record<number, number> = {
        1: 1, 2: 2, 3: 1, 4: 0, 5: 2, 6: 1, 7: 0, 8: 1, 9: 2,
      };
      const result = scorePHQ9(responses);
      expect(result.totalScore).toBe(10);
    });

    it('should handle partial responses', () => {
      const responses: Record<number, number> = {
        1: 1, 2: 2, 3: 1,
      };
      const result = scorePHQ9(responses);
      expect(result.totalScore).toBe(4);
    });

    it('should handle empty responses', () => {
      const responses: Record<number, number> = {};
      const result = scorePHQ9(responses);
      expect(result.totalScore).toBe(0);
    });
  });

  describe('severity levels', () => {
    it('should return minimal for score 0-4', () => {
      const responses: Record<number, number> = { 1: 2, 2: 2 };
      const result = scorePHQ9(responses);
      expect(result.severity).toBe('minimal');
    });

    it('should return mild for score 5-9', () => {
      const responses: Record<number, number> = {
        1: 2, 2: 2, 3: 2, 4: 1,
      };
      const result = scorePHQ9(responses);
      expect(result.severity).toBe('mild');
    });

    it('should return moderate for score 10-14', () => {
      const responses: Record<number, number> = {
        1: 2, 2: 2, 3: 2, 4: 2, 5: 2,
      };
      const result = scorePHQ9(responses);
      expect(result.severity).toBe('moderate');
      expect(result.requiresAttention).toBe(true);
    });

    it('should return moderately_severe for score 15-19', () => {
      const responses: Record<number, number> = {
        1: 3, 2: 3, 3: 3, 4: 3, 5: 3,
      };
      const result = scorePHQ9(responses);
      expect(result.severity).toBe('moderately_severe');
      expect(result.requiresAttention).toBe(true);
    });

    it('should return severe for score 20+', () => {
      const responses: Record<number, number> = {
        1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 2,
      };
      const result = scorePHQ9(responses);
      expect(result.severity).toBe('severe');
      expect(result.requiresAttention).toBe(true);
    });
  });

  describe('question 9 flagging (self-harm)', () => {
    it('should flag when question 9 has score >= 1', () => {
      const responses: Record<number, number> = {
        1: 1, 2: 1, 9: 1,
      };
      const result = scorePHQ9(responses);
      expect(result.question9Flagged).toBe(true);
      expect(result.requiresAttention).toBe(true);
    });

    it('should not flag when question 9 is 0', () => {
      const responses: Record<number, number> = {
        1: 1, 2: 1, 9: 0,
      };
      const result = scorePHQ9(responses);
      expect(result.question9Flagged).toBe(false);
    });
  });

  describe('interpretation', () => {
    it('should provide interpretation text', () => {
      const responses: Record<number, number> = { 1: 1 };
      const result = scorePHQ9(responses);
      expect(result.interpretation).toBeDefined();
      expect(typeof result.interpretation).toBe('string');
      expect(result.interpretation.length).toBeGreaterThan(0);
    });
  });

  describe('PHQ9_QUESTIONS', () => {
    it('should have 9 questions', () => {
      expect(PHQ9_QUESTIONS.length).toBe(9);
    });

    it('each question should have required fields', () => {
      PHQ9_QUESTIONS.forEach((q) => {
        expect(q).toHaveProperty('id');
        expect(q).toHaveProperty('clinicalText');
        expect(q).toHaveProperty('narrativeText');
      });
    });
  });

  describe('PHQ9_RESPONSE_OPTIONS', () => {
    it('should have 4 response options (0-3)', () => {
      expect(PHQ9_RESPONSE_OPTIONS.length).toBe(4);
    });

    it('should have values 0-3', () => {
      const values = PHQ9_RESPONSE_OPTIONS.map((opt) => opt.value);
      expect(values).toEqual([0, 1, 2, 3]);
    });

    it('each option should have label and narrativeLabel', () => {
      PHQ9_RESPONSE_OPTIONS.forEach((opt) => {
        expect(opt).toHaveProperty('label');
        expect(opt).toHaveProperty('narrativeLabel');
      });
    });
  });
});
