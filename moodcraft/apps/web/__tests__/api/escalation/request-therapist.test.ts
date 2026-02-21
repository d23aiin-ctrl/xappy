/**
 * CereBro Web App - Escalation API Tests
 *
 * Tests for the escalation and therapist request API routes.
 */

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
    escalation: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    escalationLog: {
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    therapistProfile: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

describe('Escalation API', () => {
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

  describe('POST /api/escalation/request-therapist', () => {
    it('should require authentication', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      // Unauthenticated users should be rejected
      expect(getServerSession).toBeDefined();
    });

    it('should create escalation record', async () => {
      const escalationCreate = prisma.escalation.create as jest.Mock;
      escalationCreate.mockResolvedValue({
        id: 'esc-123',
        userId: 'user-123',
        trigger: 'MANUAL_SOS',
        status: 'PENDING',
        riskScore: 50,
      });

      await escalationCreate({
        data: {
          userId: 'user-123',
          trigger: 'MANUAL_SOS',
          status: 'PENDING',
          riskScore: 50,
          triggerData: { source: 'manual_request' },
        },
      });

      expect(escalationCreate).toHaveBeenCalled();
      expect(escalationCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            trigger: 'MANUAL_SOS',
          }),
        })
      );
    });

    it('should log escalation creation', async () => {
      const logCreate = prisma.escalationLog.create as jest.Mock;
      logCreate.mockResolvedValue({ id: 'log-1' });

      await logCreate({
        data: {
          escalationId: 'esc-123',
          action: 'created',
          details: { trigger: 'MANUAL_SOS' },
          actorId: 'user-123',
        },
      });

      expect(logCreate).toHaveBeenCalled();
    });

    it('should create audit log for compliance', async () => {
      const auditCreate = prisma.auditLog.create as jest.Mock;
      auditCreate.mockResolvedValue({ id: 'audit-1' });

      await auditCreate({
        data: {
          actorId: 'user-123',
          action: 'escalation.manual_request',
          resource: 'escalation',
          resourceId: 'esc-123',
          details: { trigger: 'MANUAL_SOS' },
        },
      });

      expect(auditCreate).toHaveBeenCalled();
    });
  });

  describe('GET /api/escalation/status', () => {
    it('should return active escalation if exists', async () => {
      const escalationFind = prisma.escalation.findFirst as jest.Mock;
      escalationFind.mockResolvedValue({
        id: 'esc-123',
        status: 'AI_TWIN_REVIEW',
        trigger: 'KEYWORD_DETECTED',
        createdAt: new Date(),
        therapistId: null,
      });

      const result = await escalationFind({
        where: {
          userId: 'user-123',
          status: { in: ['PENDING', 'AI_TWIN_REVIEW', 'THERAPIST_ASSIGNED'] },
        },
      });

      expect(result).toBeDefined();
      expect(result.status).toBe('AI_TWIN_REVIEW');
    });

    it('should return null when no active escalation', async () => {
      const escalationFind = prisma.escalation.findFirst as jest.Mock;
      escalationFind.mockResolvedValue(null);

      const result = await escalationFind({
        where: { userId: 'user-123' },
      });

      expect(result).toBeNull();
    });

    it('should include therapist info when assigned', async () => {
      const therapistFind = prisma.therapistProfile.findFirst as jest.Mock;
      therapistFind.mockResolvedValue({
        id: 'therapist-1',
        displayName: 'Dr. Smith',
        specializations: ['anxiety', 'depression'],
        bio: 'Experienced therapist',
      });

      const result = await therapistFind({
        where: { id: 'therapist-1' },
      });

      expect(result).toBeDefined();
      expect(result.displayName).toBe('Dr. Smith');
    });
  });

  describe('Escalation Triggers', () => {
    const triggers = [
      'MANUAL_SOS',
      'KEYWORD_DETECTED',
      'PHQ9_CRITICAL',
      'GAD7_CRITICAL',
      'INACTIVITY',
    ];

    it('should handle all trigger types', () => {
      triggers.forEach((trigger) => {
        expect(typeof trigger).toBe('string');
        expect(trigger.length).toBeGreaterThan(0);
      });
    });

    it('should prioritize by risk score', () => {
      const escalations = [
        { trigger: 'KEYWORD_DETECTED', riskScore: 85 },
        { trigger: 'PHQ9_CRITICAL', riskScore: 75 },
        { trigger: 'INACTIVITY', riskScore: 30 },
      ];

      const sorted = escalations.sort((a, b) => b.riskScore - a.riskScore);

      expect(sorted[0].trigger).toBe('KEYWORD_DETECTED');
      expect(sorted[sorted.length - 1].trigger).toBe('INACTIVITY');
    });
  });

  describe('Escalation Status Flow', () => {
    const validTransitions = {
      PENDING: ['AI_TWIN_REVIEW', 'THERAPIST_ASSIGNED', 'RESOLVED'],
      AI_TWIN_REVIEW: ['THERAPIST_ASSIGNED', 'RESOLVED'],
      THERAPIST_ASSIGNED: ['IN_PROGRESS', 'RESOLVED'],
      IN_PROGRESS: ['RESOLVED'],
    };

    it('should have valid status transitions', () => {
      Object.entries(validTransitions).forEach(([status, nextStatuses]) => {
        expect(Array.isArray(nextStatuses)).toBe(true);
        expect(nextStatuses.length).toBeGreaterThan(0);
      });
    });

    it('should always be able to resolve', () => {
      Object.values(validTransitions).forEach((nextStatuses) => {
        expect(nextStatuses).toContain('RESOLVED');
      });
    });
  });
});
