/**
 * CereBro NLP Service Client
 *
 * Client for connecting to the Python FastAPI backend which provides:
 * - LangChain/LangGraph AI Twin multi-agent system
 * - Vector store (Pinecone/Qdrant) for RAG memory
 * - Sentiment analysis
 * - Risk detection
 * - Session summaries and handoff documents
 */

const NLP_SERVICE_URL =
  process.env.NLP_SERVICE_URL || 'https://apimoodcraft.xappy.io/api/v1';

interface NLPServiceConfig {
  timeout?: number;
}

interface AITwinChatRequest {
  user_id: string;
  chat_id: string;
  message: string;
  archetype: string;
  context?: Record<string, unknown>;
}

interface AITwinChatResponse {
  response: string;
  intervention: string | null;
  risk_level: 'low' | 'moderate' | 'high' | 'critical';
  emotional_state: string;
  should_escalate: boolean;
  crisis_detected: boolean;
}

interface RiskDetectionRequest {
  text: string;
  user_context?: {
    recent_phq9?: number;
    recent_gad7?: number;
    days_inactive?: number;
  };
}

interface RiskDetectionResponse {
  risk_level: 'low' | 'moderate' | 'high' | 'critical';
  risk_score: number;
  keywords_detected: string[];
  should_escalate: boolean;
  escalation_type: 'ai_twin' | 'therapist' | 'crisis' | null;
  details: string;
  recommended_action: string;
}

interface SentimentRequest {
  text: string;
  context?: string;
  detailed?: boolean;
}

interface SentimentResponse {
  score: number;
  label: 'positive' | 'negative' | 'neutral' | 'mixed';
  emotions: string[];
  confidence: number;
  analysis?: string;
}

interface MemoryAddRequest {
  user_id: string;
  content: string;
  memory_type: 'journal' | 'mood' | 'chat' | 'insight' | 'entity';
  source_id: string;
  metadata?: Record<string, unknown>;
}

interface MemorySearchRequest {
  user_id: string;
  query: string;
  k?: number;
  memory_types?: string[];
  min_score?: number;
}

interface MemoryResult {
  content: string;
  metadata: Record<string, unknown>;
  score: number;
}

interface SessionSummaryRequest {
  user_id: string;
  chat_id: string;
  messages: { role: string; content: string }[];
  archetype: string;
}

interface SessionSummaryResponse {
  session_summary: string;
  key_themes: string[];
  new_insights: string[];
  effective_interventions: string[];
  mood_trajectory: string;
  topics_to_revisit: string[];
  concerns_to_monitor: string[];
}

interface HandoffRequest {
  user_id: string;
  chat_id: string;
  messages: { role: string; content: string }[];
  archetype: string;
  user_context?: Record<string, unknown>;
}

interface HandoffResponse {
  executive_summary: string;
  presenting_concern: string;
  emotional_state: Record<string, unknown>;
  recommended_approach: string;
  urgent_considerations: string[];
  full_document: Record<string, unknown>;
}

class NLPServiceClient {
  private baseUrl: string;
  private timeout: number;

  constructor(config: NLPServiceConfig = {}) {
    this.baseUrl = NLP_SERVICE_URL;
    this.timeout = config.timeout || 30000;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      return response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ─── AI Twin Endpoints ───────────────────────────────────────────

  /**
   * Send a message to the AI Twin multi-agent system
   */
  async aiTwinChat(request: AITwinChatRequest): Promise<AITwinChatResponse> {
    return this.fetch<AITwinChatResponse>('/ai-twin/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Stream AI Twin response using Server-Sent Events
   */
  async *aiTwinStream(
    request: AITwinChatRequest
  ): AsyncGenerator<{ type: string; data: unknown }> {
    const response = await fetch(`${this.baseUrl}/ai-twin/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            yield JSON.parse(data);
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  /**
   * Generate a session summary for continuity
   */
  async generateSessionSummary(
    request: SessionSummaryRequest
  ): Promise<SessionSummaryResponse> {
    return this.fetch<SessionSummaryResponse>('/ai-twin/session-summary', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Generate a handoff document for therapist review
   */
  async generateHandoffDocument(request: HandoffRequest): Promise<HandoffResponse> {
    return this.fetch<HandoffResponse>('/ai-twin/handoff', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // ─── Risk Detection Endpoints ────────────────────────────────────

  /**
   * Detect risk level in text
   */
  async detectRisk(request: RiskDetectionRequest): Promise<RiskDetectionResponse> {
    return this.fetch<RiskDetectionResponse>('/risk/detect', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Batch risk detection for multiple texts
   */
  async batchDetectRisk(
    texts: string[],
    userId?: string
  ): Promise<{
    results: RiskDetectionResponse[];
    highest_risk: string;
    any_crisis: boolean;
  }> {
    return this.fetch('/risk/batch', {
      method: 'POST',
      body: JSON.stringify({ texts, user_id: userId }),
    });
  }

  /**
   * Get crisis helpline resources by region
   */
  async getCrisisResources(
    region: string = 'US'
  ): Promise<{
    resources: { name: string; number: string; type: string; instruction?: string }[];
    emergency_message: string;
  }> {
    return this.fetch('/risk/crisis-resources', {
      method: 'POST',
      body: JSON.stringify({ region }),
    });
  }

  // ─── Sentiment Analysis Endpoints ────────────────────────────────

  /**
   * Analyze sentiment in text
   */
  async analyzeSentiment(request: SentimentRequest): Promise<SentimentResponse> {
    return this.fetch<SentimentResponse>('/sentiment/analyze', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Batch sentiment analysis
   */
  async batchAnalyzeSentiment(
    texts: string[]
  ): Promise<{ results: SentimentResponse[] }> {
    return this.fetch('/sentiment/batch', {
      method: 'POST',
      body: JSON.stringify({ texts }),
    });
  }

  // ─── Memory/RAG Endpoints ────────────────────────────────────────

  /**
   * Add a memory to the vector store
   */
  async addMemory(
    request: MemoryAddRequest
  ): Promise<{ success: boolean; memory_id: string }> {
    return this.fetch('/memory/add', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Search user memories with semantic similarity
   */
  async searchMemories(
    request: MemorySearchRequest
  ): Promise<{ memories: MemoryResult[]; count: number }> {
    return this.fetch('/memory/search', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Batch add memories
   */
  async batchAddMemories(
    userId: string,
    memories: { content: string; memory_type: string; source_id: string; metadata?: Record<string, unknown> }[]
  ): Promise<{ success: boolean; count: number; ids: string[] }> {
    return this.fetch('/memory/batch-add', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, memories }),
    });
  }

  /**
   * Delete all memories for a user (GDPR compliance)
   */
  async deleteUserMemories(userId: string): Promise<{ success: boolean; message: string }> {
    return this.fetch(`/memory/user/${userId}`, {
      method: 'DELETE',
    });
  }

  // ─── Health Check ────────────────────────────────────────────────

  /**
   * Check NLP service health
   */
  async healthCheck(): Promise<{
    status: string;
    service: string;
    version: string;
  }> {
    const response = await fetch(`${this.baseUrl.replace('/api/v1', '')}/health`);
    return response.json();
  }
}

// Export singleton instance
export const nlpService = new NLPServiceClient();

// Export types
export type {
  AITwinChatRequest,
  AITwinChatResponse,
  RiskDetectionRequest,
  RiskDetectionResponse,
  SentimentRequest,
  SentimentResponse,
  MemoryAddRequest,
  MemorySearchRequest,
  MemoryResult,
  SessionSummaryRequest,
  SessionSummaryResponse,
  HandoffRequest,
  HandoffResponse,
};
