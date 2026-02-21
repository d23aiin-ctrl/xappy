/**
 * CereBro Web App - NLP Service Client Tests
 *
 * Tests for the NLP service API client.
 */
import { nlpService } from '@/lib/nlp-service';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('NLP Service Client', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('detectRisk', () => {
    it('should call risk detection endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          risk_level: 'low',
          risk_score: 10,
          keywords_detected: [],
          should_escalate: false,
          escalation_type: null,
          details: 'No concerns detected',
          recommended_action: 'Continue standard support',
        }),
      });

      const result = await nlpService.detectRisk({
        text: 'I had a good day',
        user_context: null,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/risk/detect'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );

      expect(result.risk_level).toBe('low');
      expect(result.should_escalate).toBe(false);
    });

    it('should include user context when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          risk_level: 'moderate',
          risk_score: 35,
          keywords_detected: [],
          should_escalate: false,
          escalation_type: 'ai_twin',
          details: 'Clinical scores elevated',
          recommended_action: 'Extra monitoring',
        }),
      });

      await nlpService.detectRisk({
        text: 'I feel down',
        user_context: {
          recent_phq9: 12,
          recent_gad7: 10,
          days_inactive: 3,
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('recent_phq9'),
        })
      );
    });
  });

  describe('analyzeSentiment', () => {
    it('should call sentiment analysis endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          score: 0.7,
          label: 'positive',
          emotions: ['joy', 'gratitude'],
          confidence: 0.85,
        }),
      });

      const result = await nlpService.analyzeSentiment({
        text: 'I am grateful for today',
        detailed: false,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/sentiment/analyze'),
        expect.any(Object)
      );

      expect(result.label).toBe('positive');
      expect(result.score).toBeGreaterThan(0);
    });

    it('should include analysis when detailed=true', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          score: 0.5,
          label: 'neutral',
          emotions: [],
          confidence: 0.7,
          analysis: 'The text expresses neutral sentiment',
        }),
      });

      const result = await nlpService.analyzeSentiment({
        text: 'Test',
        detailed: true,
      });

      expect(result.analysis).toBeDefined();
    });
  });

  describe('addMemory', () => {
    it('should add memory to vector store', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          memory_id: 'mem-123',
        }),
      });

      const result = await nlpService.addMemory({
        user_id: 'user-1',
        content: 'Today I practiced gratitude',
        memory_type: 'journal',
        source_id: 'journal-1',
        metadata: { mood: 'positive' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/memory/add'),
        expect.any(Object)
      );

      expect(result.success).toBe(true);
      expect(result.memory_id).toBeDefined();
    });
  });

  describe('searchMemories', () => {
    it('should search memories with semantic similarity', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          memories: [
            { content: 'Memory 1', metadata: {}, score: 0.9 },
            { content: 'Memory 2', metadata: {}, score: 0.8 },
          ],
          count: 2,
        }),
      });

      const result = await nlpService.searchMemories({
        user_id: 'user-1',
        query: 'gratitude practice',
        k: 5,
        min_score: 0.5,
      });

      expect(result.memories.length).toBe(2);
      expect(result.count).toBe(2);
    });

    it('should filter by memory types', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          memories: [],
          count: 0,
        }),
      });

      await nlpService.searchMemories({
        user_id: 'user-1',
        query: 'test',
        k: 5,
        memory_types: ['journal', 'mood'],
        min_score: 0.5,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('memory_types'),
        })
      );
    });
  });

  describe('getCrisisResources', () => {
    it('should return crisis resources by region', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          resources: [
            { name: '988 Suicide & Crisis Lifeline', number: '988', type: 'call' },
          ],
          emergency_message: 'If in danger, call 911',
        }),
      });

      const result = await nlpService.getCrisisResources('US');

      expect(result.resources.length).toBeGreaterThan(0);
      expect(result.emergency_message).toBeDefined();
    });
  });

  describe('healthCheck', () => {
    it('should return service health status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'healthy',
          service: 'cerebro-ai',
          version: '1.0.0',
        }),
      });

      const result = await nlpService.healthCheck();

      expect(result.status).toBe('healthy');
    });
  });

  describe('aiTwinChat', () => {
    it('should send message to AI Twin', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: 'I understand how you feel',
          intervention: 'VALIDATION',
          risk_level: 'low',
          emotional_state: 'anxious',
          should_escalate: false,
          crisis_detected: false,
        }),
      });

      const result = await nlpService.aiTwinChat({
        user_id: 'user-1',
        chat_id: 'chat-1',
        message: 'I feel anxious today',
        archetype: 'SEEKER',
        context: { recent_mood: 5 },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/ai-twin/chat'),
        expect.objectContaining({ method: 'POST' })
      );
      expect(result.response).toBeDefined();
      expect(result.intervention).toBe('VALIDATION');
    });
  });

  describe('generateSessionSummary', () => {
    it('should generate session summary', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          session_summary: 'User discussed anxiety',
          key_themes: ['anxiety', 'work stress'],
          new_insights: ['User is aware of triggers'],
          effective_interventions: ['grounding'],
          mood_trajectory: 'improving',
          topics_to_revisit: ['work boundaries'],
          concerns_to_monitor: [],
        }),
      });

      const result = await nlpService.generateSessionSummary({
        user_id: 'user-1',
        chat_id: 'chat-1',
        messages: [
          { role: 'user', content: 'I feel anxious' },
          { role: 'assistant', content: 'I understand' },
        ],
        archetype: 'SEEKER',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/ai-twin/session-summary'),
        expect.any(Object)
      );
      expect(result.session_summary).toBeDefined();
      expect(result.key_themes).toHaveLength(2);
    });
  });

  describe('generateHandoffDocument', () => {
    it('should generate handoff document for therapist', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          executive_summary: 'User presenting with anxiety',
          presenting_concern: 'Work-related stress',
          emotional_state: { primary: 'anxious', intensity: 0.7 },
          recommended_approach: 'CBT techniques',
          urgent_considerations: [],
          full_document: {},
        }),
      });

      const result = await nlpService.generateHandoffDocument({
        user_id: 'user-1',
        chat_id: 'chat-1',
        messages: [{ role: 'user', content: 'I need help' }],
        archetype: 'SEEKER',
        user_context: { phq9: 12 },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/ai-twin/handoff'),
        expect.any(Object)
      );
      expect(result.executive_summary).toBeDefined();
      expect(result.presenting_concern).toBeDefined();
    });
  });

  describe('batchDetectRisk', () => {
    it('should detect risk in multiple texts', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            { risk_level: 'low', risk_score: 10 },
            { risk_level: 'moderate', risk_score: 40 },
          ],
          highest_risk: 'moderate',
          any_crisis: false,
        }),
      });

      const result = await nlpService.batchDetectRisk(
        ['I feel okay', 'I feel very down'],
        'user-1'
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/risk/batch'),
        expect.any(Object)
      );
      expect(result.results).toHaveLength(2);
      expect(result.highest_risk).toBe('moderate');
    });
  });

  describe('batchAnalyzeSentiment', () => {
    it('should analyze sentiment in multiple texts', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            { score: 0.8, label: 'positive', emotions: ['joy'] },
            { score: -0.5, label: 'negative', emotions: ['sadness'] },
          ],
        }),
      });

      const result = await nlpService.batchAnalyzeSentiment([
        'Great day!',
        'Feeling sad',
      ]);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/sentiment/batch'),
        expect.any(Object)
      );
      expect(result.results).toHaveLength(2);
    });
  });

  describe('batchAddMemories', () => {
    it('should add multiple memories', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          count: 2,
          ids: ['mem-1', 'mem-2'],
        }),
      });

      const result = await nlpService.batchAddMemories('user-1', [
        { content: 'Memory 1', memory_type: 'journal', source_id: 'j1' },
        { content: 'Memory 2', memory_type: 'mood', source_id: 'm1' },
      ]);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/memory/batch-add'),
        expect.any(Object)
      );
      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
    });
  });

  describe('deleteUserMemories', () => {
    it('should delete all user memories (GDPR)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'All memories deleted',
        }),
      });

      const result = await nlpService.deleteUserMemories('user-1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/memory/user/user-1'),
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(result.success).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should throw on HTTP error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ detail: 'Internal server error' }),
      });

      await expect(
        nlpService.detectRisk({ text: 'test', user_context: null })
      ).rejects.toThrow('Internal server error');
    });

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        nlpService.detectRisk({ text: 'test', user_context: null })
      ).rejects.toThrow('Network error');
    });

    it('should handle HTTP error with unknown detail', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => { throw new Error('Invalid JSON'); },
      });

      await expect(
        nlpService.analyzeSentiment({ text: 'test' })
      ).rejects.toThrow();
    });

    it('should handle HTTP status code in error message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({}),
      });

      await expect(
        nlpService.addMemory({
          user_id: 'user-1',
          content: 'test',
          memory_type: 'journal',
          source_id: 'j1',
        })
      ).rejects.toThrow('HTTP 404');
    });
  });
});
