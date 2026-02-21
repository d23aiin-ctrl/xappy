'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MindMetroMap } from '@/components/dashboard/mind-metro-map';
import { DailyRituals } from '@/components/dashboard/daily-rituals';
import { StreakDisplay } from '@/components/dashboard/streak-display';
import { ProactiveInsightsPanel, AgentFloatingButton } from '@/components/ai/agentic-chat';
import { Brain, Sparkles, ArrowRight } from 'lucide-react';

interface DashboardData {
  profile: {
    archetype: string;
    streakDays: number;
    longestStreak: number;
    currentStation: number;
  };
  stats: {
    moodCheckins: number;
    journalEntries: number;
    breathSessions: number;
    totalBadges: number;
    streakDays: number;
  };
  rituals: {
    mood: boolean;
    journal: boolean;
    breath: boolean;
    companion: boolean;
  };
  weekActivity: boolean[];
  recentBadges: { id: string; name: string; icon: string; earnedAt: string }[];
  moodTrend: { date: string; score: number }[];
}

const ARCHETYPE_GREETINGS: Record<string, string> = {
  DRIFTER: 'The mist welcomes you back',
  THINKER: 'Your mind sharpens with each return',
  TRANSFORMER: 'Your strength grows daily',
  SEEKER: 'The path reveals itself to you',
  VETERAN: 'Your wisdom guides the way',
};

const ARCHETYPE_COLORS: Record<string, string> = {
  DRIFTER: 'from-blue-400 to-cyan-400',
  THINKER: 'from-veil-400 to-indigo-400',
  TRANSFORMER: 'from-orange-400 to-red-400',
  SEEKER: 'from-green-400 to-teal-400',
  VETERAN: 'from-amber-400 to-yellow-400',
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAgent, setShowAgent] = useState(false);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/dashboard');
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  // Default values with proper merging
  const defaultData: DashboardData = {
    profile: { archetype: 'SEEKER', streakDays: 0, longestStreak: 0, currentStation: 1 },
    stats: { moodCheckins: 0, journalEntries: 0, breathSessions: 0, totalBadges: 0, streakDays: 0 },
    rituals: { mood: false, journal: false, breath: false, companion: false },
    weekActivity: [false, false, false, false, false, false, false],
    recentBadges: [],
    moodTrend: [],
  };

  const dashboardData: DashboardData = {
    profile: { ...defaultData.profile, ...data?.profile },
    stats: { ...defaultData.stats, ...data?.stats },
    rituals: { ...defaultData.rituals, ...data?.rituals },
    weekActivity: data?.weekActivity || defaultData.weekActivity,
    recentBadges: data?.recentBadges || defaultData.recentBadges,
    moodTrend: data?.moodTrend || defaultData.moodTrend,
  };

  const archetype = dashboardData.profile.archetype || 'SEEKER';
  const greeting = ARCHETYPE_GREETINGS[archetype] || 'Welcome back';
  const colorGradient = ARCHETYPE_COLORS[archetype] || 'from-veil-400 to-oracle-400';

  const ritualsList = [
    {
      id: 'mood',
      name: 'Mood Mirror',
      description: 'Reflect on your emotional state',
      icon: '🪞',
      href: '/mood-mirror',
      completed: dashboardData.rituals.mood,
      color: 'veil',
      bgGradient: 'from-veil-600/20 to-veil-800/20',
    },
    {
      id: 'journal',
      name: 'Journal',
      description: 'Write your thoughts',
      icon: '📝',
      href: '/journal',
      completed: dashboardData.rituals.journal,
      color: 'oracle',
      bgGradient: 'from-oracle-600/20 to-oracle-800/20',
    },
    {
      id: 'breath',
      name: 'Breath Loop',
      description: 'Center yourself with breathing',
      icon: '🌬️',
      href: '/breath-loops',
      completed: dashboardData.rituals.breath,
      color: 'cyan',
      bgGradient: 'from-cyan-600/20 to-cyan-800/20',
    },
    {
      id: 'companion',
      name: 'AI Companion',
      description: 'Chat with your guide',
      icon: '💬',
      href: '/companion',
      completed: dashboardData.rituals.companion,
      color: 'emerald',
      bgGradient: 'from-emerald-600/20 to-emerald-800/20',
    },
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-midnight-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="aurora" />
        </div>
        <motion.div
          className="flex flex-col items-center gap-6 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="relative w-20 h-20">
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30"
              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20"
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="w-8 h-8 text-violet-400 animate-pulse" />
            </div>
          </div>
          <div className="glass-card px-6 py-3 rounded-full">
            <p className="text-gray-300 text-sm font-medium">Loading your journey...</p>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-midnight-950 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <div className="aurora" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <motion.h1
                className="text-3xl md:text-4xl font-bold mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <span className="text-white">Welcome back, </span>
                <span className={`bg-gradient-to-r ${colorGradient} bg-clip-text text-transparent`}>
                  {session?.user?.name?.split(' ')[0] || 'Traveler'}
                </span>
              </motion.h1>
              <motion.p
                className="text-gray-400 flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${colorGradient} text-white`}>
                  {archetype}
                </span>
                <span>{greeting}</span>
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* MindMetro Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span>🚇</span> MindMetro Journey
          </h2>
          <MindMetroMap
            currentStation={dashboardData.profile.currentStation}
            completedStations={Array.from({ length: dashboardData.profile.currentStation }, (_, i) => i)}
            stats={dashboardData.stats}
          />
        </motion.div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Rituals */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <DailyRituals rituals={ritualsList} />
          </motion.div>

          {/* Right column - Streak */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <StreakDisplay
              currentStreak={dashboardData.profile.streakDays}
              longestStreak={dashboardData.profile.longestStreak}
              weekActivity={dashboardData.weekActivity}
            />
          </motion.div>
        </div>

        {/* Recent Badges */}
        {dashboardData.recentBadges.length > 0 && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span>🏆</span> Recent Achievements
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {dashboardData.recentBadges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  className="flex-shrink-0 bg-gradient-to-br from-amber-900/30 to-amber-950/30 rounded-xl p-4 border border-amber-500/20 min-w-[140px]"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <p className="text-sm font-medium text-white">{badge.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(badge.earnedAt).toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick insights */}
        <motion.div
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="glass-card p-4 rounded-2xl group hover:border-violet-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🪞
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{dashboardData.stats.moodCheckins}</p>
                <p className="text-xs text-gray-400">Mood Check-ins</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4 rounded-2xl group hover:border-amber-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📝
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{dashboardData.stats.journalEntries}</p>
                <p className="text-xs text-gray-400">Journal Entries</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4 rounded-2xl group hover:border-cyan-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🌬️
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{dashboardData.stats.breathSessions}</p>
                <p className="text-xs text-gray-400">Breath Sessions</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4 rounded-2xl group hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🏅
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{dashboardData.stats.totalBadges}</p>
                <p className="text-xs text-gray-400">Badges Earned</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Agent Insights Section */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-400" />
              AI Insights
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h2>
            <Link
              href="/ai-twin"
              className="text-violet-400 hover:text-violet-300 text-sm flex items-center gap-1 transition-colors"
            >
              Open AI Twin
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <ProactiveInsightsPanel />
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-8 flex flex-wrap gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button asChild size="lg" className="btn-primary">
            <Link href="/mood-mirror">Start Today's Check-in</Link>
          </Button>
          <Button asChild size="lg" className="btn-glow">
            <Link href="/ai-twin" className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Talk to AI Twin
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-white/20 hover:bg-white/5">
            <Link href="/companion">Quick Chat</Link>
          </Button>
        </motion.div>
      </div>

      {/* Floating AI Twin Button */}
      <AgentFloatingButton onClick={() => window.location.href = '/ai-twin'} />
    </main>
  );
}
