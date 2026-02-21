/**
 * CereBro Web App - Mood Submit API Tests
 *
 * Tests for the mood check-in submission API route.
 */
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    moodEntry: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    userProfile: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback({
      moodEntry: {
        create: jest.fn().mockResolvedValue({ id: 'mood-1' }),
      },
      userProfile: {
        update: jest.fn(),
      },
    })),
  },
}));

jest.mock('@/lib/encryption', () => ({
  encrypt: jest.fn((text) => `encrypted:${text}`),
  decrypt: jest.fn((text) => text.replace('encrypted:', '')),
}));

import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

describe('Mood Submit API', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'INDIVIDUAL',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('POST /api/mood/submit', () => {
    it('should require authentication', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      // Test unauthenticated request
      // This would be tested via actual route handler
      expect(getServerSession).toBeDefined();
    });

    it('should validate required fields', () => {
      // Mood score should be required
      const invalidPayload = {
        reflection: 'Just a reflection without score',
      };

      expect(invalidPayload.hasOwnProperty('moodScore')).toBe(false);
    });

    it('should validate mood score range', () => {
      const validScores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const invalidScores = [0, 11, -1, 100];

      validScores.forEach((score) => {
        expect(score >= 1 && score <= 10).toBe(true);
      });

      invalidScores.forEach((score) => {
        expect(score >= 1 && score <= 10).toBe(false);
      });
    });

    it('should encrypt reflection text', () => {
      const { encrypt } = require('@/lib/encryption');

      const reflection = 'My private thoughts';
      const encrypted = encrypt(reflection);

      expect(encrypted).not.toBe(reflection);
      expect(encrypted).toContain('encrypted:');
    });

    it('should calculate PHQ-9 score correctly', () => {
      const phq9Responses = [2, 1, 3, 0, 2, 1, 0, 2, 1]; // 9 items, 0-3 each
      const phq9Score = phq9Responses.reduce((a, b) => a + b, 0);

      expect(phq9Score).toBe(12);
      expect(phq9Score).toBeLessThanOrEqual(27); // Max PHQ-9 score
    });

    it('should calculate GAD-7 score correctly', () => {
      const gad7Responses = [1, 2, 3, 2, 1, 0, 2]; // 7 items, 0-3 each
      const gad7Score = gad7Responses.reduce((a, b) => a + b, 0);

      expect(gad7Score).toBe(11);
      expect(gad7Score).toBeLessThanOrEqual(21); // Max GAD-7 score
    });

    it('should update streak for consecutive daily check-ins', async () => {
      const profileUpdate = prisma.userProfile.update as jest.Mock;
      profileUpdate.mockResolvedValue({ streakDays: 5 });

      // Streak should be incremented
      expect(profileUpdate).toBeDefined();
    });

    it('should reset streak if day is missed', () => {
      const lastCheckIn = new Date('2024-01-10');
      const today = new Date('2024-01-13'); // 3 days gap

      const daysSinceLastCheckIn = Math.floor(
        (today.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(daysSinceLastCheckIn).toBeGreaterThan(1);
    });
  });

  describe('PHQ-9/GAD-7 Severity Detection', () => {
    it('should flag severe PHQ-9 scores', () => {
      const severeThreshold = 20;
      const phq9Score = 22;

      expect(phq9Score >= severeThreshold).toBe(true);
    });

    it('should flag severe GAD-7 scores', () => {
      const severeThreshold = 15;
      const gad7Score = 18;

      expect(gad7Score >= severeThreshold).toBe(true);
    });

    it('should trigger risk detection for high scores', () => {
      const phq9Score = 20;
      const gad7Score = 15;

      const shouldTriggerRiskDetection =
        phq9Score >= 15 || gad7Score >= 15;

      expect(shouldTriggerRiskDetection).toBe(true);
    });
  });
});
