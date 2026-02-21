'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, X, ChevronRight, Bell } from 'lucide-react';
import Link from 'next/link';

interface Nudge {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  sentAt: string;
  data?: {
    patternType?: string;
    priority?: string;
  };
}

interface NudgeCardProps {
  className?: string;
  onDismiss?: () => void;
}

const PATTERN_ACTIONS: Record<string, { label: string; href: string }> = {
  mood_decline: { label: 'Check in', href: '/mood-mirror' },
  activity_gap: { label: 'Say hello', href: '/companion' },
  streak_milestone: { label: 'Celebrate', href: '/profile' },
  positive_trend: { label: 'Keep going', href: '/journal' },
  journaling_pattern: { label: 'Write', href: '/journal' },
  evening_reflection: { label: 'Reflect', href: '/mood-mirror' },
  weekend_wellness: { label: 'Breathe', href: '/breath-loops' },
  check_in_reminder: { label: 'Check in', href: '/mood-mirror' },
};

export function NudgeCard({ className = '', onDismiss }: NudgeCardProps) {
  const [nudge, setNudge] = useState<Nudge | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchLatestNudge();
  }, []);

  async function fetchLatestNudge() {
    try {
      const res = await fetch('/api/nudges?unread=true&limit=1');
      const data = await res.json();
      if (data.success && data.data.nudges.length > 0) {
        setNudge(data.data.nudges[0]);
      }
    } catch (error) {
      console.error('Failed to fetch nudge:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDismiss() {
    if (!nudge) return;

    setDismissed(true);

    try {
      await fetch('/api/nudges', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nudgeIds: [nudge.id] }),
      });
    } catch (error) {
      console.error('Failed to mark nudge as read:', error);
    }

    onDismiss?.();
  }

  if (loading || !nudge || dismissed) {
    return null;
  }

  const action = PATTERN_ACTIONS[nudge.data?.patternType || 'check_in_reminder'];
  const priority = nudge.data?.priority || 'low';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={className}
      >
        <Card
          className={`relative overflow-hidden border ${
            priority === 'high'
              ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30'
              : priority === 'medium'
              ? 'bg-gradient-to-r from-veil-500/10 to-purple-500/10 border-veil-500/30'
              : 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-500/30'
          }`}
        >
          {/* Animated sparkle background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-2 right-8 w-1 h-1 bg-white/40 rounded-full"
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0 }}
            />
            <motion.div
              className="absolute top-6 right-16 w-1.5 h-1.5 bg-white/30 rounded-full"
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
            />
            <motion.div
              className="absolute bottom-4 right-24 w-1 h-1 bg-white/20 rounded-full"
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2, delay: 1 }}
            />
          </div>

          <CardContent className="p-4 relative">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg ${
                  priority === 'high'
                    ? 'bg-amber-500/20'
                    : priority === 'medium'
                    ? 'bg-veil-500/20'
                    : 'bg-cyan-500/20'
                }`}
              >
                <Sparkles
                  className={`w-5 h-5 ${
                    priority === 'high'
                      ? 'text-amber-400'
                      : priority === 'medium'
                      ? 'text-veil-400'
                      : 'text-cyan-400'
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <h4 className="font-medium text-white text-sm">{nudge.title}</h4>
                <p className="text-gray-400 text-sm mt-1 leading-relaxed">{nudge.body}</p>

                <div className="flex items-center gap-3 mt-3">
                  <Link href={action.href}>
                    <Button
                      size="sm"
                      className={`text-xs ${
                        priority === 'high'
                          ? 'bg-amber-600 hover:bg-amber-500'
                          : priority === 'medium'
                          ? 'bg-veil-600 hover:bg-veil-500'
                          : 'bg-cyan-600 hover:bg-cyan-500'
                      }`}
                    >
                      {action.label}
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                  <span className="text-xs text-gray-500">
                    {new Date(nudge.sentAt).toLocaleDateString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

// Bell icon with badge for header
export function NudgeBell({ className = '' }: { className?: string }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  async function fetchUnreadCount() {
    try {
      const res = await fetch('/api/nudges?unread=true&limit=1');
      const data = await res.json();
      if (data.success) {
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch nudge count:', error);
    }
  }

  return (
    <div className={`relative ${className}`}>
      <Bell className="w-5 h-5 text-gray-400 hover:text-white transition-colors cursor-pointer" />
      {unreadCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-veil-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </motion.span>
      )}
    </div>
  );
}
