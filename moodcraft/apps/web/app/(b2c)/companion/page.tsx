'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Send,
  AlertTriangle,
  Phone,
  Sparkles,
  Shield,
  Compass,
  Brain,
  Flame,
  Feather,
  MoreHorizontal,
  Trash2,
  RotateCcw,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  riskFlagged?: boolean;
  isStreaming?: boolean;
}

const archetypeConfig: Record<string, { name: string; icon: typeof Sparkles; color: string; greeting: string }> = {
  DRIFTER: {
    name: 'Whisper',
    icon: Compass,
    color: 'text-cyan-400',
    greeting: "Hey, wanderer. I'm Whisper -- your companion through the mist. What's floating through your mind today?",
  },
  THINKER: {
    name: 'Sage',
    icon: Brain,
    color: 'text-purple-400',
    greeting: "Welcome back. I'm Sage -- here to explore ideas and patterns with you. What would you like to examine today?",
  },
  TRANSFORMER: {
    name: 'Ember',
    icon: Flame,
    color: 'text-amber-400',
    greeting: "Hello, warrior. I'm Ember -- a reflection of your strength. What fires are you tending to today?",
  },
  SEEKER: {
    name: 'Haven',
    icon: Shield,
    color: 'text-emerald-400',
    greeting: "Hi there. I'm Haven -- a safe space for you to be exactly who you are. There's no rush here. What's on your heart?",
  },
  VETERAN: {
    name: 'Echo',
    icon: Feather,
    color: 'text-rose-400',
    greeting: "Good to see you. I'm Echo. Let's get to it -- what's on your mind?",
  },
};

export default function CompanionPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [archetype, setArchetype] = useState<string>('DRIFTER');
  const [showSOS, setShowSOS] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const config = archetypeConfig[archetype] || archetypeConfig.DRIFTER;
  const CompanionIcon = config.icon;

  useEffect(() => {
    loadChat();
    fetchArchetype();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchArchetype() {
    try {
      const res = await fetch('/api/profile');
      const json = await res.json();
      if (json.archetype) setArchetype(json.archetype);
    } catch {}
  }

  async function loadChat() {
    try {
      const res = await fetch('/api/companion/chat');
      const json = await res.json();
      if (json.success && json.data) {
        setChatId(json.data.id);
        setMessages(json.data.messages || []);
      }
    } catch {}
  }

  function startNewConversation() {
    setMessages([]);
    setChatId(null);
    setInput('');
    setShowSOS(false);
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
        const res = await fetch('/api/companion/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: messageText, chatId }),
        });

        if (!res.ok) {
          throw new Error('Stream failed');
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let streamedContent = '';
        let newChatId = chatId;
        let riskFlagged = false;

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
              ? { ...m, content: streamedContent, isStreaming: false, riskFlagged }
              : m
          )
        );

        if (riskFlagged) setShowSOS(true);
      } catch (error) {
        // Fallback if streaming fails
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
        sendMessage(e as any);
      }
    },
    [sendMessage]
  );

  const quickPrompts = [
    "I'm feeling stressed today",
    'Help me process a thought',
    'I need grounding',
    'Tell me something hopeful',
  ];

  return (
    <>
      
      <main className="h-screen bg-midnight-950 flex flex-col relative overflow-hidden">
        {/* Modern animated background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <div className="aurora" />
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

      {/* Header */}
      <div className="glass border-b border-white/10 relative z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 border border-violet-500/30 shadow-lg shadow-violet-500/10 ${config.color}`}>
              <CompanionIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-semibold text-white flex items-center gap-2 text-lg">
                {config.name}
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </h1>
              <p className="text-xs text-gray-400">Your AI Companion</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

      {/* Messages */}
      <ScrollArea className="flex-1 relative z-10">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {/* Empty State */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-veil-500/10 to-purple-500/10 border border-veil-500/20 mb-6"
              >
                <CompanionIcon className={`w-12 h-12 ${config.color}`} />
              </motion.div>

              <p className="text-gray-300 mb-2 max-w-md mx-auto">
                {config.greeting}
              </p>
              <p className="text-xs text-gray-600 mt-4">
                Everything you share is encrypted and private.
              </p>

              {/* Quick Prompts */}
              <div className="flex flex-wrap justify-center gap-3 mt-8">
                {quickPrompts.map((prompt) => (
                  <motion.button
                    key={prompt}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setInput(prompt)}
                    className="glass-interactive px-5 py-3 rounded-2xl text-sm text-gray-300 hover:text-white transition-all"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Message Bubbles */}
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Companion Avatar */}
              {msg.role === 'assistant' && (
                <div className={`shrink-0 p-2 rounded-xl bg-gradient-to-br from-veil-500/20 to-purple-500/20 border border-white/10 self-end ${config.color}`}>
                  <CompanionIcon className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[75%] ${
                  msg.role === 'user' ? 'order-first' : ''
                }`}
              >
                <Card
                  className={`p-4 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-violet-600/90 to-purple-700/90 border-violet-500/40 rounded-2xl rounded-br-md shadow-lg shadow-violet-500/10'
                      : 'glass-card rounded-2xl rounded-bl-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                    {msg.isStreaming && (
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block w-2 h-4 bg-veil-400 ml-0.5 rounded-sm"
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

                {/* Timestamp */}
                <p className={`text-[10px] text-gray-600 mt-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Typing Indicator */}
          {isStreaming && messages[messages.length - 1]?.content === '' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className={`shrink-0 p-2 rounded-xl bg-gradient-to-br from-veil-500/20 to-purple-500/20 border border-white/10 ${config.color}`}>
                <CompanionIcon className="w-4 h-4" />
              </div>
              <Card className="bg-white/[0.05] border-white/10 p-4 rounded-2xl rounded-bl-md">
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-2 h-2 bg-gray-500 rounded-full"
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
                  placeholder={`Message ${config.name}...`}
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
                    ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                    : 'bg-gray-800 text-gray-500'
                }`}
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 mt-3 text-center">
            {config.name} is an AI companion, not a therapist. For emergencies, call 988.
          </p>
        </form>
      </div>
    </main>
    </>
  );
}
