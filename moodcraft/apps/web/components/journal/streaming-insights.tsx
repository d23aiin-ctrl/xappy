'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Brain, Heart, TrendingUp, Palette, Loader2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type InsightType = 'reflection' | 'emotions' | 'growth' | 'creative';

interface StreamingInsightsProps {
  content: string;
  className?: string;
  minLength?: number;
  debounceMs?: number;
}

const INSIGHT_TYPES: { type: InsightType; label: string; icon: typeof Sparkles; color: string }[] = [
  { type: 'reflection', label: 'Reflection', icon: Sparkles, color: 'text-veil-400' },
  { type: 'emotions', label: 'Emotions', icon: Heart, color: 'text-rose-400' },
  { type: 'growth', label: 'Growth', icon: TrendingUp, color: 'text-emerald-400' },
  { type: 'creative', label: 'Creative', icon: Palette, color: 'text-amber-400' },
];

export function StreamingInsights({
  content,
  className,
  minLength = 100,
  debounceMs = 2000,
}: StreamingInsightsProps) {
  const [insightType, setInsightType] = useState<InsightType>('reflection');
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [hasGenerated, setHasGenerated] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastContentRef = useRef<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-generate insights when content changes significantly
  useEffect(() => {
    if (content.length < minLength) return;

    // Check if content changed significantly (more than 50 chars difference)
    const contentDiff = Math.abs(content.length - lastContentRef.current.length);
    if (contentDiff < 50 && hasGenerated) return;

    // Debounce the generation
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (!loading) {
        generateInsights();
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [content, minLength, debounceMs]);

  const generateInsights = useCallback(async () => {
    if (content.length < minLength || loading) return;

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setInsight('');
    lastContentRef.current = content;

    try {
      const response = await fetch('/api/journal/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, insightType }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error('Failed to fetch insights');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.token) {
                setInsight((prev) => prev + parsed.token);
              }
            } catch {
              // Ignore JSON parse errors
            }
          }
        }
      }

      setHasGenerated(true);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Insight generation error:', error);
        setInsight('Unable to generate insights. Try again later.');
      }
    } finally {
      setLoading(false);
    }
  }, [content, insightType, minLength, loading]);

  const handleTypeChange = (type: InsightType) => {
    setInsightType(type);
    setInsight('');
    setHasGenerated(false);
    // Trigger new generation if we have enough content
    if (content.length >= minLength) {
      setTimeout(() => generateInsights(), 100);
    }
  };

  const currentType = INSIGHT_TYPES.find((t) => t.type === insightType)!;
  const Icon = currentType.icon;

  if (content.length < minLength) {
    return (
      <Card className={cn('bg-midnight-900/50 border-gray-800', className)}>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Brain className="w-4 h-4" />
            <span className="text-sm">Keep writing to unlock AI insights...</span>
          </div>
          <div className="mt-2 w-full bg-gray-800 rounded-full h-1.5">
            <div
              className="bg-veil-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((content.length / minLength) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {content.length}/{minLength} characters
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('bg-midnight-900/50 border-gray-800', className)}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Icon className={cn('w-4 h-4', currentType.color)} />
            AI Insights
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => generateInsights()}
              disabled={loading}
              className="h-7 px-2"
            >
              {loading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-7 px-2"
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
          </div>
        </div>

        {/* Insight type selector */}
        <div className="flex gap-1 mt-2">
          {INSIGHT_TYPES.map(({ type, label, icon: TypeIcon, color }) => (
            <Button
              key={type}
              variant={insightType === type ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleTypeChange(type)}
              className={cn(
                'h-7 px-2 text-xs',
                insightType === type && 'bg-gray-800'
              )}
            >
              <TypeIcon className={cn('w-3 h-3 mr-1', insightType === type && color)} />
              {label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="p-4 pt-2">
              {loading && !insight ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Analyzing your writing...</span>
                </div>
              ) : insight ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="prose prose-sm prose-invert max-w-none"
                >
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {insight}
                    {loading && (
                      <span className="inline-block w-2 h-4 bg-veil-400 ml-1 animate-pulse" />
                    )}
                  </p>
                </motion.div>
              ) : (
                <p className="text-sm text-gray-500">
                  Click refresh to generate insights about your writing.
                </p>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// Compact version for inline display
export function InsightChip({
  content,
  onExpand,
}: {
  content: string;
  onExpand?: () => void;
}) {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generateQuickInsight = async () => {
    if (content.length < 50 || loading) return;

    setLoading(true);
    try {
      const response = await fetch('/api/journal/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, insightType: 'emotions' }),
      });

      if (!response.ok) return;

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = '';
      let fullInsight = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.token) {
                fullInsight += parsed.token;
              }
            } catch {
              // Ignore
            }
          }
        }
      }

      // Extract first sentence only
      const firstSentence = fullInsight.split(/[.!?]/)[0] + '.';
      setInsight(firstSentence);
    } catch (error) {
      console.error('Quick insight error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (content.length >= 50 && !insight) {
      generateQuickInsight();
    }
  }, [content]);

  if (!insight && !loading) return null;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onExpand}
      className="flex items-center gap-2 px-3 py-1.5 bg-veil-500/10 hover:bg-veil-500/20 border border-veil-500/30 rounded-full text-sm text-veil-300 transition-colors"
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Sparkles className="w-3 h-3" />
      )}
      <span className="truncate max-w-[200px]">
        {loading ? 'Analyzing...' : insight}
      </span>
    </motion.button>
  );
}
