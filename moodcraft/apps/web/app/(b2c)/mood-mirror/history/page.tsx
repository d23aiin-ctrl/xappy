'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoodChart } from '@/components/mood/mood-chart';

interface MoodEntry {
  id: string;
  emoji: string;
  moodScore: number;
  reflection?: string;
  phq9Score?: number;
  gad7Score?: number;
  sentimentLabel?: string;
  createdAt: string;
}

const MOOD_LABELS: Record<number, string> = {
  1: 'Very Low',
  3: 'Low',
  5: 'Neutral',
  7: 'Good',
  9: 'Great',
};

const SENTIMENT_COLORS: Record<string, string> = {
  positive: 'text-green-400 bg-green-500/10',
  negative: 'text-red-400 bg-red-500/10',
  neutral: 'text-gray-400 bg-gray-500/10',
  mixed: 'text-amber-400 bg-amber-500/10',
};

export default function MoodHistoryPage() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPHQ9, setShowPHQ9] = useState(true);
  const [showGAD7, setShowGAD7] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch('/api/mood/history');
        if (res.ok) {
          const data = await res.json();
          setEntries(data.entries || []);
        }
      } catch (error) {
        console.error('Failed to fetch mood history:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const chartData = entries.map(e => ({
    date: e.createdAt,
    moodScore: e.moodScore,
    phq9Score: e.phq9Score,
    gad7Score: e.gad7Score,
    emoji: e.emoji,
  }));

  const averageMood = entries.length > 0
    ? Math.round(entries.reduce((sum, e) => sum + e.moodScore, 0) / entries.length * 10) / 10
    : 0;

  const moodDistribution = entries.reduce((acc, e) => {
    const label = MOOD_LABELS[Math.round(e.moodScore)] || 'Unknown';
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <main className="min-h-screen bg-[#0a0a12] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-80 h-80 bg-veil-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-oracle-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Mood History</h1>
              <p className="text-gray-400">Your emotional journey over time</p>
            </div>
            <Link href="/mood-mirror">
              <Button className="bg-gradient-to-r from-veil-600 to-veil-500 hover:from-veil-500 hover:to-veil-400">
                New Check-in
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <motion.div
                className="w-12 h-12 rounded-full border-2 border-veil-500/30 border-t-veil-400"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          ) : entries.length === 0 ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="py-16 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                  className="text-6xl mb-6"
                >
                  🪞
                </motion.div>
                <h3 className="text-2xl font-semibold text-white mb-3">No reflections yet</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Begin your journey of self-awareness with your first mood check-in.
                  Track your emotions and discover patterns over time.
                </p>
                <Link href="/mood-mirror">
                  <Button size="lg" className="bg-gradient-to-r from-veil-600 to-veil-500">
                    Start Your First Check-in
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="bg-gradient-to-br from-veil-900/30 to-veil-950/30 border-veil-500/20">
                    <CardContent className="py-6 text-center">
                      <p className="text-4xl font-bold text-veil-400">{entries.length}</p>
                      <p className="text-sm text-gray-400 mt-1">Total Check-ins</p>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-gradient-to-br from-oracle-900/30 to-oracle-950/30 border-oracle-500/20">
                    <CardContent className="py-6 text-center">
                      <p className="text-4xl font-bold text-oracle-400">{averageMood}</p>
                      <p className="text-sm text-gray-400 mt-1">Average Mood</p>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-emerald-900/30 to-emerald-950/30 border-emerald-500/20">
                    <CardContent className="py-6 text-center">
                      <p className="text-4xl font-bold text-emerald-400">
                        {Math.max(...entries.map(e => e.moodScore))}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">Best Day</p>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="bg-gradient-to-br from-amber-900/30 to-amber-950/30 border-amber-500/20">
                    <CardContent className="py-6 text-center">
                      <p className="text-4xl font-bold text-amber-400">
                        {entries.filter(e => e.reflection).length}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">With Reflections</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Mood Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Mood Trend</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPHQ9(!showPHQ9)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        showPHQ9 ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-500'
                      }`}
                    >
                      PHQ-9
                    </button>
                    <button
                      onClick={() => setShowGAD7(!showGAD7)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        showGAD7 ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-gray-500'
                      }`}
                    >
                      GAD-7
                    </button>
                  </div>
                </div>
                <MoodChart data={chartData} showPHQ9={showPHQ9} showGAD7={showGAD7} />
              </motion.div>

              {/* Mood Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Mood Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(moodDistribution).map(([label, count]) => (
                        <div
                          key={label}
                          className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg"
                        >
                          <span className="text-white font-medium">{label}</span>
                          <span className="text-veil-400 font-bold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Entry List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Entries</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {entries.slice(0, 10).map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.05 }}
                        className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
                      >
                        <div className="text-4xl">{entry.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-semibold text-white">
                              {MOOD_LABELS[Math.round(entry.moodScore)] || `Score: ${entry.moodScore}`}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(entry.createdAt).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {entry.sentimentLabel && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${SENTIMENT_COLORS[entry.sentimentLabel] || SENTIMENT_COLORS.neutral}`}>
                                {entry.sentimentLabel}
                              </span>
                            )}
                          </div>
                          {entry.reflection && (
                            <p className="text-sm text-gray-400 line-clamp-2 group-hover:line-clamp-none transition-all">
                              {entry.reflection}
                            </p>
                          )}
                          {(entry.phq9Score !== null || entry.gad7Score !== null) && (
                            <div className="flex gap-4 mt-2 text-xs">
                              {entry.phq9Score !== null && entry.phq9Score !== undefined && (
                                <span className="text-blue-400">
                                  PHQ-9: <span className="font-semibold">{entry.phq9Score}</span>
                                </span>
                              )}
                              {entry.gad7Score !== null && entry.gad7Score !== undefined && (
                                <span className="text-orange-400">
                                  GAD-7: <span className="font-semibold">{entry.gad7Score}</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            entry.moodScore >= 7 ? 'text-green-400' :
                            entry.moodScore >= 5 ? 'text-amber-400' : 'text-red-400'
                          }`}>
                            {entry.moodScore}
                          </div>
                          <div className="text-xs text-gray-500">/10</div>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
