'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Send,
  AlertTriangle,
  Phone,
  Sparkles,
  Shield,
  Brain,
  Heart,
  User,
  RotateCcw,
  Loader2,
  ArrowRight,
  CheckCircle,
  Activity,
  Wind,
  Lightbulb,
  HandHeart,
  ThumbsUp,
  ThumbsDown,
  History,
  X,
  ChevronRight,
} from 'lucide-react';
import { ProactiveInsightsPanel } from '@/components/ai/agentic-chat';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  interventionType?: string;
  riskFlagged?: boolean;
  createdAt: string;
  isStreaming?: boolean;
  helpfulRating?: number;
  messageDbId?: string; // Database ID for feedback
}

interface HandoffStatus {
  hasActiveHandoff: boolean;
  therapist?: {
    name: string;
    avatar?: string;
    specializations?: string[];
  };
  status?: string;
}

interface SessionContext {
  lastSessionSummary?: string;
  keyThemes?: string[];
  effectiveInterventions?: { type: string; successRate: number }[];
}

const interventionIcons: Record<string, typeof Heart> = {
  GROUNDING: Wind,
  REFRAME: Lightbulb,
  VALIDATION: HandHeart,
  CRISIS_SUPPORT: Shield,
  PSYCHOEDUCATION: Brain,
  COPING_SKILL: Activity,
};

const interventionColors: Record<string, string> = {
  GROUNDING: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  REFRAME: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  VALIDATION: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  CRISIS_SUPPORT: 'text-red-400 bg-red-500/10 border-red-500/20',
  PSYCHOEDUCATION: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  COPING_SKILL: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

export default function AITwinPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [archetype, setArchetype] = useState<string>('DRIFTER');
  const [showSOS, setShowSOS] = useState(false);
  const [handoffStatus, setHandoffStatus] = useState<HandoffStatus>({ hasActiveHandoff: false });
  const [requestingHandoff, setRequestingHandoff] = useState(false);
  const [sessionContext, setSessionContext] = useState<SessionContext | null>(null);
  const [showSessionContext, setShowSessionContext] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadChat();
    checkHandoffStatus();
    loadSessionContext();

    // Save session summary when user leaves page
    const handleBeforeUnload = () => {
      if (chatId && messages.length > 2) {
        navigator.sendBeacon('/api/ai-twin/session-summary', JSON.stringify({ chatId }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [chatId, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadChat() {
    try {
      const res = await fetch('/api/ai-twin/chat');
      const json = await res.json();
      if (json.success && json.data) {
        setChatId(json.data.id);
        setMessages(json.data.messages || []);
        setArchetype(json.data.archetype || 'DRIFTER');
        if (json.data.escalationActive) {
          setShowSOS(true);
        }
      }
    } catch {}
  }

  async function checkHandoffStatus() {
    try {
      const res = await fetch('/api/ai-twin/handoff');
      const json = await res.json();
      if (json.success) {
        setHandoffStatus(json.data);
      }
    } catch {}
  }

  async function loadSessionContext() {
    try {
      const res = await fetch('/api/ai-twin/session-summary');
      const json = await res.json();
      if (json.success && json.data && !json.data.message) {
        setSessionContext({
          lastSessionSummary: json.data.lastSessionSummary,
          keyThemes: json.data.keyThemes,
          effectiveInterventions: json.data.effectiveInterventions,
        });
      }
    } catch {}
  }

  async function submitFeedback(messageId: string, helpful: boolean) {
    if (feedbackSent.has(messageId)) return;

    try {
      const res = await fetch('/api/ai-twin/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          rating: helpful ? 5 : 2,
        }),
      });

      if (res.ok) {
        setFeedbackSent((prev) => new Set([...prev, messageId]));
        // Update message with rating
        setMessages((prev) =>
          prev.map((m) =>
            m.messageDbId === messageId ? { ...m, helpfulRating: helpful ? 5 : 2 } : m
          )
        );
      }
    } catch {}
  }

  async function endSession() {
    if (!chatId || messages.length < 2) return;

    try {
      await fetch('/api/ai-twin/session-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId }),
      });

      // Reload session context for next time
      loadSessionContext();
    } catch {}
  }

  async function startNewConversation() {
    // End current session first to save summary
    await endSession();

    try {
      const res = await fetch('/api/ai-twin/chat', { method: 'POST' });
      const json = await res.json();
      if (json.success && json.data) {
        setChatId(json.data.id);
        setMessages([]);
        setShowSOS(false);
        setFeedbackSent(new Set());
      }
    } catch {}
  }

  async function requestHandoff() {
    if (!chatId || requestingHandoff) return;
    setRequestingHandoff(true);

    try {
      const res = await fetch('/api/ai-twin/handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          reason: 'User requested human therapist',
        }),
      });

      const json = await res.json();
      if (json.success) {
        setHandoffStatus({
          hasActiveHandoff: true,
          therapist: json.data.therapist,
          status: json.data.therapistAssigned ? 'THERAPIST_ASSIGNED' : 'AI_TWIN_REVIEW',
        });

        // Add handoff message to chat
        if (json.data.message) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: 'assistant',
              content: json.data.message,
              interventionType: 'VALIDATION',
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      }
    } finally {
      setRequestingHandoff(false);
    }
  }

  const sendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isStreaming) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: input.trim(),
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      const messageText = input.trim();
      setInput('');
      setIsStreaming(true);

      // Add placeholder streaming message
      const streamingId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: streamingId,
          role: 'assistant',
          content: '',
          createdAt: new Date().toISOString(),
          isStreaming: true,
        },
      ]);

      try {
        const res = await fetch('/api/ai-twin/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: messageText, chatId }),
        });

        if (!res.ok) throw new Error('Stream failed');

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let streamedContent = '';
        let newChatId = chatId;
        let riskFlagged = false;
        let interventionType: string | undefined;
        let messageDbId: string | undefined;

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const text = decoder.decode(value, { stream: true });
            const lines = text.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);

                  if (parsed.chatId) {
                    newChatId = parsed.chatId;
                    if (!chatId) setChatId(parsed.chatId);
                    if (parsed.riskFlagged) riskFlagged = true;
                    if (parsed.interventionType) interventionType = parsed.interventionType;
                  }

                  if (parsed.interventionType && !parsed.chatId) {
                    interventionType = parsed.interventionType;
                  }

                  if (parsed.messageId) {
                    messageDbId = parsed.messageId;
                  }

                  if (parsed.token) {
                    streamedContent += parsed.token;
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === streamingId
                          ? { ...m, content: streamedContent }
                          : m
                      )
                    );
                  }
                } catch {}
              }
            }
          }
        }

        // Finalize message
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingId
              ? { ...m, content: streamedContent, isStreaming: false, riskFlagged, interventionType, messageDbId }
              : m
          )
        );

        if (riskFlagged) setShowSOS(true);
      } catch (error) {
        const fallback = "I'm here with you. Could you tell me more about what's on your mind?";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingId
              ? { ...m, content: fallback, isStreaming: false }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
        inputRef.current?.focus();
      }
    },
    [input, isStreaming, chatId]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(e as React.FormEvent);
      }
    },
    [sendMessage]
  );

  const quickPrompts = [
    "I'm feeling overwhelmed",
    'Help me process something difficult',
    'I need a grounding exercise',
    'Can I talk to a human therapist?',
  ];

  return (
    <main className="h-screen bg-midnight-950 flex flex-col relative overflow-hidden">
      {/* Animated background - distinct from companion */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-br from-violet-500/3 to-purple-500/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* SOS Bar */}
      <AnimatePresence>
        {showSOS && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-950/50 border-b border-red-500/30 overflow-hidden relative z-20"
          >
            <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-200">
                  Crisis support available 24/7: <strong>988</strong> (US) | Text <strong>HOME</strong> to <strong>741741</strong>
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSOS(false)}
                className="text-red-400 hover:text-red-300 text-xs"
              >
                Dismiss
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Therapist Connected Banner */}
      <AnimatePresence>
        {handoffStatus.hasActiveHandoff && handoffStatus.therapist && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-emerald-950/50 border-b border-emerald-500/30 overflow-hidden relative z-20"
          >
            <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-200">
                  Connected with <strong>{handoffStatus.therapist.name}</strong> - They'll reach out soon
                </span>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                {handoffStatus.status === 'THERAPIST_ASSIGNED' ? 'Assigned' : 'Pending'}
              </Badge>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="glass border-b border-white/10 relative z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-teal-500/30 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
              <Brain className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="font-semibold text-white flex items-center gap-2 text-lg">
                Your AI Twin
                <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
              </h1>
              <p className="text-xs text-gray-400">Personalized mental wellness support</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-amber-400 hover:bg-amber-500/10"
              onClick={() => setShowInsights(!showInsights)}
              title="AI Insights"
            >
              <Sparkles className="w-4 h-4" />
            </Button>
            {sessionContext?.lastSessionSummary && (
              <Button
                variant="ghost"
                size="sm"
                className="text-violet-400 hover:bg-violet-500/10"
                onClick={() => setShowSessionContext(!showSessionContext)}
                title="View session history"
              >
                <History className="w-4 h-4" />
              </Button>
            )}
            {!handoffStatus.hasActiveHandoff && (
              <Button
                variant="outline"
                size="sm"
                className="text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10"
                onClick={requestHandoff}
                disabled={requestingHandoff}
              >
                {requestingHandoff ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <User className="w-4 h-4 mr-2" />
                )}
                Talk to Therapist
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="glass-interactive text-gray-400 hover:text-white"
              title="New conversation"
              onClick={startNewConversation}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Session Context Panel */}
      <AnimatePresence>
        {showSessionContext && sessionContext && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-violet-950/30 border-b border-violet-500/20 overflow-hidden relative z-20"
          >
            <div className="max-w-3xl mx-auto px-4 py-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-medium text-violet-300">Your Journey So Far</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSessionContext(false)}
                  className="text-violet-400 hover:text-violet-300 p-1 h-auto"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {sessionContext.lastSessionSummary && (
                <p className="text-sm text-gray-300 mb-3">
                  {sessionContext.lastSessionSummary}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {sessionContext.keyThemes?.map((theme) => (
                  <span
                    key={theme}
                    className="px-2 py-1 text-xs rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  >
                    {theme}
                  </span>
                ))}
              </div>

              {sessionContext.effectiveInterventions && sessionContext.effectiveInterventions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-violet-500/20">
                  <p className="text-xs text-gray-400 mb-2">What has helped you:</p>
                  <div className="flex flex-wrap gap-2">
                    {sessionContext.effectiveInterventions
                      .filter((i) => i.successRate >= 0.6)
                      .map((intervention) => {
                        const Icon = interventionIcons[intervention.type] || Heart;
                        return (
                          <span
                            key={intervention.type}
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${interventionColors[intervention.type] || 'text-gray-400 bg-gray-500/10 border-gray-500/20'}`}
                          >
                            <Icon className="w-3 h-3" />
                            {intervention.type.replace('_', ' ')} ({Math.round(intervention.successRate * 100)}%)
                          </span>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Insights Panel */}
      <AnimatePresence>
        {showInsights && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-950/20 border-b border-amber-500/20 overflow-hidden relative z-20"
          >
            <div className="max-w-3xl mx-auto px-4 py-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-amber-300">AI Insights</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInsights(false)}
                  className="text-amber-400 hover:text-amber-300 p-1 h-auto"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <ProactiveInsightsPanel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <ScrollArea className="flex-1 relative z-10">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {/* Empty State */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border border-cyan-500/20 mb-6"
              >
                <Brain className="w-12 h-12 text-cyan-400" />
              </motion.div>

              <h2 className="text-xl font-semibold text-white mb-2">
                Your AI Twin is Here
              </h2>
              <p className="text-gray-400 mb-2 max-w-md mx-auto">
                I'm a personalized AI trained on your wellness patterns. I understand your emotional landscape and can provide tailored support, grounding exercises, and cognitive reframing.
              </p>
              <p className="text-xs text-gray-600 mb-6">
                Everything is encrypted. You can request a human therapist anytime.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {[
                  { icon: Wind, label: 'Grounding', color: 'cyan' },
                  { icon: Lightbulb, label: 'Reframing', color: 'amber' },
                  { icon: HandHeart, label: 'Validation', color: 'rose' },
                  { icon: User, label: 'Therapist Handoff', color: 'emerald' },
                ].map((feature) => (
                  <div
                    key={feature.label}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-${feature.color}-500/10 border border-${feature.color}-500/20`}
                  >
                    <feature.icon className={`w-3.5 h-3.5 text-${feature.color}-400`} />
                    <span className={`text-xs text-${feature.color}-400`}>{feature.label}</span>
                  </div>
                ))}
              </div>

              {/* Quick Prompts */}
              <div className="flex flex-wrap justify-center gap-3">
                {quickPrompts.map((prompt) => (
                  <motion.button
                    key={prompt}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      if (prompt === 'Can I talk to a human therapist?') {
                        requestHandoff();
                      } else {
                        setInput(prompt);
                      }
                    }}
                    className="glass-interactive px-5 py-3 rounded-2xl text-sm text-gray-300 hover:text-white transition-all"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Message Bubbles */}
          {messages.map((msg) => {
            const InterventionIcon = msg.interventionType
              ? interventionIcons[msg.interventionType] || Heart
              : null;
            const interventionColor = msg.interventionType
              ? interventionColors[msg.interventionType]
              : '';

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* AI Twin Avatar */}
                {msg.role === 'assistant' && (
                  <div className="shrink-0 p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-white/10 self-end text-cyan-400">
                    <Brain className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                  {/* Intervention Badge */}
                  {msg.interventionType && msg.role === 'assistant' && (
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs mb-2 border ${interventionColor}`}>
                      {InterventionIcon && <InterventionIcon className="w-3 h-3" />}
                      {msg.interventionType.replace('_', ' ')}
                    </div>
                  )}

                  <Card
                    className={`p-4 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-cyan-600/90 to-teal-700/90 border-cyan-500/40 rounded-2xl rounded-br-md shadow-lg shadow-cyan-500/10'
                        : 'glass-card rounded-2xl rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                      {msg.isStreaming && (
                        <motion.span
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8 }}
                          className="inline-block w-2 h-4 bg-cyan-400 ml-0.5 rounded-sm"
                        />
                      )}
                    </p>
                    {msg.riskFlagged && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-red-500/20">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs text-amber-400">
                          Support resources are available above
                        </span>
                      </div>
                    )}
                  </Card>

                  {/* Feedback buttons for AI responses */}
                  {msg.role === 'assistant' && !msg.isStreaming && msg.messageDbId && (
                    <div className="flex items-center gap-2 mt-2">
                      {feedbackSent.has(msg.messageDbId) || msg.helpfulRating ? (
                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                          {msg.helpfulRating && msg.helpfulRating >= 4 ? (
                            <>
                              <ThumbsUp className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Helpful</span>
                            </>
                          ) : msg.helpfulRating ? (
                            <>
                              <ThumbsDown className="w-3 h-3 text-amber-400" />
                              <span className="text-amber-400">Noted</span>
                            </>
                          ) : (
                            <span className="text-gray-500">Thanks for feedback</span>
                          )}
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => submitFeedback(msg.messageDbId!, true)}
                            className="text-[10px] text-gray-500 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                            title="This was helpful"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => submitFeedback(msg.messageDbId!, false)}
                            className="text-[10px] text-gray-500 hover:text-amber-400 flex items-center gap-1 transition-colors"
                            title="This wasn't helpful"
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                          <span className="text-[10px] text-gray-600 ml-1">Did this help?</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Timestamp */}
                  <p className={`text-[10px] text-gray-600 mt-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </motion.div>
            );
          })}

          {/* Typing Indicator */}
          {isStreaming && messages[messages.length - 1]?.content === '' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="shrink-0 p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-white/10 text-cyan-400">
                <Brain className="w-4 h-4" />
              </div>
              <Card className="bg-white/[0.05] border-white/10 p-4 rounded-2xl rounded-bl-md">
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-2 h-2 bg-cyan-500 rounded-full"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.4, 1, 0.4],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="glass border-t border-white/10 relative z-10">
        <form onSubmit={sendMessage} className="max-w-3xl mx-auto px-4 py-4">
          <div className="glass-card rounded-2xl p-3">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Share what's on your mind..."
                  rows={1}
                  className="w-full bg-transparent border-0 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-0 resize-none max-h-32 py-2"
                  style={{
                    height: 'auto',
                    minHeight: '40px',
                  }}
                  disabled={isStreaming}
                />
              </div>
              <motion.button
                type="submit"
                disabled={!input.trim() || isStreaming}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                  input.trim() && !isStreaming
                    ? 'bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-lg shadow-cyan-500/25'
                    : 'bg-gray-800 text-gray-500'
                }`}
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 mt-3 text-center">
            Your AI Twin provides support, not medical advice. For emergencies, call 988 or request a human therapist.
          </p>
        </form>
      </div>
    </main>
  );
}
