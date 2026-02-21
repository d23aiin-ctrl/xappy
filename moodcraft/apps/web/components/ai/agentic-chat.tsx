'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  Brain,
  Zap,
  Activity,
  Loader2,
  ChevronDown,
  Wand2,
  Eye,
  Heart,
  MessageCircle,
  BarChart3,
  PenTool,
  Wind,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentStep {
  type: 'thinking' | 'tool_call' | 'tool_result' | 'response';
  content: string;
  toolName?: string;
  toolArgs?: any;
  toolResult?: any;
  timestamp: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  steps?: AgentStep[];
  timestamp: Date;
}

const toolIcons: Record<string, React.ReactNode> = {
  analyze_mood_patterns: <BarChart3 className="w-4 h-4" />,
  analyze_journal_themes: <PenTool className="w-4 h-4" />,
  recommend_ritual: <Wind className="w-4 h-4" />,
  generate_personalized_prompt: <Lightbulb className="w-4 h-4" />,
  create_insight_synthesis: <Brain className="w-4 h-4" />,
  detect_intervention_need: <Heart className="w-4 h-4" />,
};

const toolLabels: Record<string, string> = {
  analyze_mood_patterns: 'Analyzing Mood Patterns',
  analyze_journal_themes: 'Exploring Journal Themes',
  recommend_ritual: 'Crafting Ritual',
  generate_personalized_prompt: 'Generating Prompt',
  create_insight_synthesis: 'Synthesizing Insights',
  detect_intervention_need: 'Checking Wellbeing',
};

export function AgenticChat({ className }: { className?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentSteps, setCurrentSteps] = useState<AgentStep[]>([]);
  const [showSteps, setShowSteps] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentSteps, scrollToBottom]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);
    setCurrentSteps([]);

    try {
      const response = await fetch('/api/agent/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!response.ok) throw new Error('Failed to connect to agent');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let steps: AgentStep[] = [];
      let finalResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const step: AgentStep = JSON.parse(data);
              steps = [...steps, step];
              setCurrentSteps(steps);

              if (step.type === 'response') {
                finalResponse = step.content;
              }
            } catch (parseError) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: finalResponse,
        steps,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setCurrentSteps([]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I encountered an issue connecting. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const suggestedQuestions = [
    "How am I doing emotionally this week?",
    "What patterns do you see in my journey?",
    "Give me a personalized ritual for today",
    "What should I focus on for growth?",
  ];

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="glass-card p-4 mb-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <motion.div
              className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-midnight-900"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
          <div>
            <h2 className="font-semibold text-white flex items-center gap-2">
              CereBro Agent
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h2>
            <p className="text-sm text-gray-400">Agentic AI with deep understanding</p>
          </div>
          <button
            onClick={() => setShowSteps(!showSteps)}
            className="ml-auto text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
          >
            <Eye className="w-4 h-4" />
            {showSteps ? 'Hide' : 'Show'} thinking
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
        {messages.length === 0 && !isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 mb-6">
              <Wand2 className="w-10 h-10 text-violet-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Your AI Guide Awaits
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              I can analyze your journey, generate personalized insights, and guide you with deep understanding.
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
              {suggestedQuestions.map((question, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => {
                    setInput(question);
                    inputRef.current?.focus();
                  }}
                  className="glass-interactive p-3 rounded-xl text-sm text-left text-gray-300 hover:text-white transition-all"
                >
                  {question}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl p-4',
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-violet-600 to-purple-700 text-white'
                    : 'glass-card'
                )}
              >
                {message.role === 'assistant' && message.steps && showSteps && (
                  <AgentStepsDisplay steps={message.steps} />
                )}
                <p className={cn(
                  'whitespace-pre-wrap',
                  message.role === 'assistant' ? 'text-gray-200' : 'text-white'
                )}>
                  {message.content}
                </p>
                <p className="text-xs opacity-50 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Streaming indicator */}
        {isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-4"
          >
            {showSteps && currentSteps.length > 0 && (
              <AgentStepsDisplay steps={currentSteps} isLive />
            )}
            {currentSteps.length === 0 && (
              <div className="flex items-center gap-3 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Agent is thinking...</span>
              </div>
            )}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="glass-card rounded-2xl p-3">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about your journey..."
                rows={1}
                className="w-full bg-transparent border-0 resize-none focus:ring-0 text-white placeholder-gray-500 py-2 px-1 max-h-32"
                style={{ minHeight: '2.5rem' }}
                disabled={isStreaming}
              />
            </div>
            <motion.button
              type="submit"
              disabled={!input.trim() || isStreaming}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                input.trim() && !isStreaming
                  ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-gray-800 text-gray-500'
              )}
            >
              {isStreaming ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
}

function AgentStepsDisplay({ steps, isLive = false }: { steps: AgentStep[]; isLive?: boolean }) {
  const [expanded, setExpanded] = useState(isLive);

  const toolSteps = steps.filter(s => s.type === 'tool_call' || s.type === 'tool_result');
  const thinkingSteps = steps.filter(s => s.type === 'thinking');

  if (toolSteps.length === 0 && thinkingSteps.length === 0) return null;

  return (
    <div className="mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors mb-2"
      >
        <Activity className="w-4 h-4" />
        <span>{toolSteps.length / 2} tools used</span>
        <ChevronDown
          className={cn('w-4 h-4 transition-transform', expanded && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 border-l-2 border-violet-500/30 pl-4 ml-2">
              {thinkingSteps.map((step, idx) => (
                <motion.div
                  key={`thinking-${idx}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-2 text-sm"
                >
                  <Brain className="w-4 h-4 text-purple-400 mt-0.5" />
                  <span className="text-gray-400">{step.content}</span>
                </motion.div>
              ))}

              {steps.filter(s => s.type === 'tool_call').map((step, idx) => {
                const resultStep = steps.find(
                  s => s.type === 'tool_result' && s.toolName === step.toolName
                );

                return (
                  <motion.div
                    key={`tool-${idx}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.15 }}
                    className="bg-midnight-800/50 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400">
                        {step.toolName && toolIcons[step.toolName]}
                      </div>
                      <span className="text-violet-300 font-medium">
                        {step.toolName && toolLabels[step.toolName]}
                      </span>
                      {isLive && !resultStep && (
                        <Loader2 className="w-3 h-3 animate-spin text-violet-400 ml-auto" />
                      )}
                      {resultStep && (
                        <Zap className="w-3 h-3 text-emerald-400 ml-auto" />
                      )}
                    </div>
                    {step.toolArgs && (
                      <div className="mt-2 text-xs text-gray-500">
                        {Object.entries(step.toolArgs).map(([key, value]) => (
                          <span key={key} className="mr-3">
                            {key}: <span className="text-gray-400">{String(value)}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Compact floating agent button
export function AgentFloatingButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={cn(
        'fixed bottom-6 right-6 w-14 h-14 rounded-full',
        'bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500',
        'shadow-lg shadow-violet-500/30 flex items-center justify-center',
        'z-50',
        className
      )}
    >
      <Brain className="w-7 h-7 text-white" />
      <motion.div
        className="absolute inset-0 rounded-full bg-white/20"
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
      />
    </motion.button>
  );
}

// Proactive insights panel
export function ProactiveInsightsPanel({ className }: { className?: string }) {
  const [data, setData] = useState<{
    insights: string[];
    recommendations: any[];
    alerts: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/agent/proactive')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setData(result.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={cn('glass-card rounded-2xl p-6', className)}>
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading insights...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Alerts */}
      {data.alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-4 border border-amber-500/30"
        >
          <h3 className="font-semibold text-amber-400 mb-3 flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Wellbeing Check
          </h3>
          {data.alerts.map((alert, idx) => (
            <div key={idx} className="text-sm text-gray-300">
              {alert.reasons.join('. ')}
            </div>
          ))}
        </motion.div>
      )}

      {/* Insights */}
      {data.insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-4"
        >
          <h3 className="font-semibold text-violet-400 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Insights
          </h3>
          <ul className="space-y-2">
            {data.insights.map((insight, idx) => (
              <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2" />
                {insight}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-4"
        >
          <h3 className="font-semibold text-emerald-400 mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Recommendations
          </h3>
          <div className="space-y-3">
            {data.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="bg-midnight-800/50 rounded-lg p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  {rec.type === 'ritual' ? (
                    <Wind className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <PenTool className="w-4 h-4 text-violet-400" />
                  )}
                  <span className="text-sm font-medium text-white">
                    {rec.name || 'Journal Prompt'}
                  </span>
                  {rec.duration && (
                    <span className="text-xs text-gray-500 ml-auto">
                      {rec.duration}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  {rec.description || rec.prompt}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
