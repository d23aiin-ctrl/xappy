'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Compass, Brain, Heart, Flame, Eye, Feather } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface JournalPrompt {
  id: string;
  text: string;
  category: string;
}

interface AdaptivePromptProps {
  prompt: JournalPrompt | null;
  loading: boolean;
  onRefresh: () => void;
  onUsePrompt: (text: string) => void;
}

const categoryConfig: Record<string, { icon: typeof Sparkles; color: string; bg: string; label: string }> = {
  gratitude: {
    icon: Heart,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
    label: 'Gratitude',
  },
  mindfulness: {
    icon: Eye,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
    label: 'Mindfulness',
  },
  shadow_work: {
    icon: Compass,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    label: 'Shadow Work',
  },
  cbt: {
    icon: Brain,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    label: 'CBT',
  },
  expressive: {
    icon: Feather,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    label: 'Expressive',
  },
  growth: {
    icon: Flame,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
    label: 'Growth',
  },
  attachment: {
    icon: Heart,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10 border-pink-500/20',
    label: 'Attachment',
  },
  grief: {
    icon: Feather,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    label: 'Grief',
  },
};

const defaultConfig = {
  icon: Sparkles,
  color: 'text-veil-400',
  bg: 'bg-veil-500/10 border-veil-500/20',
  label: 'Reflection',
};

export function AdaptivePrompt({ prompt, loading, onRefresh, onUsePrompt }: AdaptivePromptProps) {
  const config = prompt?.category ? (categoryConfig[prompt.category] || defaultConfig) : defaultConfig;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-5 relative overflow-hidden ${config.bg}`}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute -top-10 -right-10 w-40 h-40 ${config.color} opacity-5 rounded-full blur-3xl`} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg bg-white/5 ${config.color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <span className={`text-xs font-medium ${config.color}`}>Oracle's Prompt</span>
              {prompt?.category && (
                <span className="text-xs text-gray-500 ml-2">{config.label}</span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="text-gray-400 hover:text-white h-7 w-7 p-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={prompt?.id || 'loading'}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            {loading ? (
              <div className="space-y-2">
                <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-white/5 rounded animate-pulse w-1/2" />
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-200 italic leading-relaxed">
                  "{prompt?.text || 'Write freely... let your thoughts become words.'}"
                </p>
                {prompt?.text && (
                  <button
                    onClick={() => onUsePrompt(prompt.text)}
                    className={`mt-3 text-xs ${config.color} hover:underline transition-all`}
                  >
                    Use this prompt as your guide
                  </button>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
