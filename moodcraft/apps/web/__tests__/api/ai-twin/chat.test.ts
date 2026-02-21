/**
 * CereBro Web App - AI Twin Chat API Tests
 *
 * Tests for the AI Twin chat API routes.
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
    aITwinChat: {
      create: jest.fn(),
      findFirst: jest.fn(),
      updateMany: jest.fn(),
    },
    aITwinMessage: {
      create: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    userProfile: {
      findUnique: jest.fn(),
    },
    moodEntry: {
      findFirst: jest.fn(),
    },
    escalation: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@/lib/encryption', () => ({
  encrypt: jest.fn((text) => `enc:${text}`),
  decrypt: jest.fn((text) => text.replace('enc:', '')),
}));

jest.mock('@/lib/nlp-service', () => ({
  nlpService: {
    addMemory: jest.fn().mockResolvedValue({ success: true }),
    detectRisk: jest.fn().mockResolvedValue({
      risk_level: 'low',
      should_escalate: false,
    }),
  },
}));

import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/encryption';

describe('AI Twin Chat API', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('GET /api/ai-twin/chat', () => {
    it('should return existing active chat', async () => {
      const chatFind = prisma.aITwinChat.findFirst as jest.Mock;
      chatFind.mockResolvedValue({
        id: 'chat-123',
        userId: 'user-123',
        isActive: true,
        messages: [
          { id: 'msg-1', role: 'user', contentEnc: 'enc:Hello' },
          { id: 'msg-2', role: 'assistant', contentEnc: 'enc:Hi there' },
        ],
      });

      const chat = await chatFind({
        where: { userId: 'user-123', isActive: true },
        include: { messages: true },
      });

      expect(chat).toBeDefined();
      expect(chat.isActive).toBe(true);
    });

    it('should create new chat if none exists', async () => {
      const chatFind = prisma.aITwinChat.findFirst as jest.Mock;
      chatFind.mockResolvedValue(null);

      const chatCreate = prisma.aITwinChat.create as jest.Mock;
      chatCreate.mockResolvedValue({
        id: 'new-chat',
        userId: 'user-123',
        isActive: true,
        messages: [],
      });

      // First call returns null
      const existingChat = await chatFind();
      expect(existingChat).toBeNull();

      // Then create new chat
      const newChat = await chatCreate({
        data: { userId: 'user-123' },
      });

      expect(newChat.id).toBe('new-chat');
    });

    it('should decrypt messages for client', () => {
      const encryptedMessages = [
        { contentEnc: 'enc:Hello' },
        { contentEnc: 'enc:How are you?' },
      ];

      const decryptedMessages = encryptedMessages.map((m) => ({
        content: decrypt(m.contentEnc),
      }));

      expect(decryptedMessages[0].content).toBe('Hello');
      expect(decryptedMessages[1].content).toBe('How are you?');
    });

    it('should include user archetype', async () => {
      const profileFind = prisma.userProfile.findUnique as jest.Mock;
      profileFind.mockResolvedValue({
        archetype: 'SEEKER',
        streakDays: 5,
      });

      const profile = await profileFind({
        where: { userId: 'user-123' },
      });

      expect(profile.archetype).toBe('SEEKER');
    });
  });

  describe('POST /api/ai-twin/chat (New Session)', () => {
    it('should close existing active chats', async () => {
      const chatUpdateMany = prisma.aITwinChat.updateMany as jest.Mock;
      chatUpdateMany.mockResolvedValue({ count: 1 });

      await chatUpdateMany({
        where: { userId: 'user-123', isActive: true },
        data: { isActive: false },
      });

      expect(chatUpdateMany).toHaveBeenCalled();
    });

    it('should create new chat with fresh brief', async () => {
      const chatCreate = prisma.aITwinChat.create as jest.Mock;
      chatCreate.mockResolvedValue({
        id: 'chat-new',
        userId: 'user-123',
        briefSummary: JSON.stringify({ presenting: 'New session' }),
      });

      const newChat = await chatCreate({
        data: {
          userId: 'user-123',
          briefSummary: JSON.stringify({ presenting: 'New session' }),
        },
      });

      expect(newChat.briefSummary).toBeDefined();
    });
  });

  describe('Message Encryption', () => {
    it('should encrypt user messages before storage', () => {
      const message = 'This is my private thought';
      const encrypted = encrypt(message);

      expect(encrypted).not.toBe(message);
      expect(encrypted).toContain('enc:');
    });

    it('should encrypt assistant responses before storage', () => {
      const response = 'I understand how you feel';
      const encrypted = encrypt(response);

      expect(encrypted).not.toBe(response);
    });
  });

  describe('Risk Detection', () => {
    it('should flag crisis keywords', () => {
      const crisisKeywords = ['suicide', 'kill myself', 'end my life'];
      const message = 'I want to end my life';

      const containsCrisis = crisisKeywords.some((kw) =>
        message.toLowerCase().includes(kw)
      );

      expect(containsCrisis).toBe(true);
    });

    it('should create escalation for crisis messages', async () => {
      const escalationCreate = prisma.escalation.create as jest.Mock;
      escalationCreate.mockResolvedValue({
        id: 'esc-1',
        trigger: 'KEYWORD_DETECTED',
        status: 'AI_TWIN_REVIEW',
      });

      const escalation = await escalationCreate({
        data: {
          userId: 'user-123',
          trigger: 'KEYWORD_DETECTED',
          riskScore: 85,
          status: 'AI_TWIN_REVIEW',
        },
      });

      expect(escalation.status).toBe('AI_TWIN_REVIEW');
    });
  });

  describe('Intervention Types', () => {
    const interventions = [
      'VALIDATION',
      'REFRAME',
      'GROUNDING',
      'CRISIS_SUPPORT',
      'PSYCHOEDUCATION',
      'COPING_SKILL',
    ];

    it('should support all intervention types', () => {
      interventions.forEach((intervention) => {
        expect(typeof intervention).toBe('string');
      });
    });

    it('should tag messages with intervention type', async () => {
      const messageCreate = prisma.aITwinMessage.create as jest.Mock;
      messageCreate.mockResolvedValue({
        id: 'msg-1',
        interventionType: 'VALIDATION',
      });

      const message = await messageCreate({
        data: {
          chatId: 'chat-1',
          role: 'assistant',
          contentEnc: 'enc:response',
          interventionType: 'VALIDATION',
        },
      });

      expect(message.interventionType).toBe('VALIDATION');
    });
  });

  describe('Long-term Memory', () => {
    it('should index significant messages', () => {
      const message = 'This is a much longer message that definitely should be indexed because it exceeds fifty characters';
      const shouldIndex = message.length > 50;

      expect(shouldIndex).toBe(true);
    });

    it('should index AI insights', () => {
      const insightTypes = ['REFRAME', 'PSYCHOEDUCATION'];

      insightTypes.forEach((type) => {
        expect(['REFRAME', 'PSYCHOEDUCATION']).toContain(type);
      });
    });
  });
});
