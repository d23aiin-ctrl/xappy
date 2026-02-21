'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BreathCircle } from '@/components/breath/breath-circle';
import Link from 'next/link';

type BreathType = 'BOX' | 'FOUR_SEVEN_EIGHT' | 'PACED';

interface BreathPattern {
  type: BreathType;
  name: string;
  description: string;
  benefits: string[];
  pattern: string;
  color: string;
  gradient: string;
  icon: string;
}

const BREATH_PATTERNS: BreathPattern[] = [
  {
    type: 'BOX',
    name: 'Box Breathing',
    description: 'A square of calm. Used by Navy SEALs for focus and stress relief.',
    benefits: ['Reduces stress', 'Improves focus', 'Calms the nervous system'],
    pattern: '4-4-4-4',
    color: '#8b5cf6',
    gradient: 'from-veil-600 to-purple-600',
    icon: '⬜',
  },
  {
    type: 'FOUR_SEVEN_EIGHT',
    name: '4-7-8 Breathing',
    description: 'The relaxing breath. A natural tranquilizer for the nervous system.',
    benefits: ['Promotes sleep', 'Reduces anxiety', 'Manages cravings'],
    pattern: '4-7-8',
    color: '#06b6d4',
    gradient: 'from-cyan-600 to-blue-600',
    icon: '🌙',
  },
  {
    type: 'PACED',
    name: 'Coherent Breathing',
    description: 'Simple rhythmic breathing to achieve heart-brain coherence.',
    benefits: ['Balances emotions', 'Increases HRV', 'Centers the mind'],
    pattern: '5-5',
    color: '#f59e0b',
    gradient: 'from-amber-600 to-orange-600',
    icon: '☯️',
  },
];

export default function BreathLoopsPage() {
  const [selectedPattern, setSelectedPattern] = useState<BreathPattern | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [showGrounding, setShowGrounding] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(180); // 3 minutes default
  const sessionStartTime = useRef<number>(0);

  async function saveSession(duration: number) {
    if (!selectedPattern) return;
    try {
      await fetch('/api/breath', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          breathType: selectedPattern.type,
          durationSecs: duration,
          completed: true,
        }),
      });
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  function startSession() {
    sessionStartTime.current = Date.now();
    setIsActive(true);
    setShowGrounding(false);
  }

  function handleComplete() {
    const duration = Math.round((Date.now() - sessionStartTime.current) / 1000);
    setIsActive(false);
    setShowGrounding(true);
    saveSession(duration);
  }

  function finishGrounding() {
    setShowGrounding(false);
    setSelectedPattern(null);
  }

  return (
    <>
      
      <main className="min-h-screen bg-midnight-950 relative overflow-hidden">
        {/* Modern animated background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <div className="aurora" />
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[150px]"
            style={{ backgroundColor: selectedPattern?.color || '#8b5cf6', opacity: 0.15 }}
            animate={{
              scale: isActive ? [1, 1.3, 1] : 1,
              opacity: isActive ? [0.15, 0.25, 0.15] : 0.15,
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>

      <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
              <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">Breath Loops</h1>
              <p className="text-gray-400">Find your center through conscious breathing</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!selectedPattern ? (
              /* Pattern Selection */
              <motion.div
                key="selection"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="grid md:grid-cols-3 gap-6">
                  {BREATH_PATTERNS.map((pattern, index) => (
                    <motion.div
                      key={pattern.type}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                    >
                      <div
                        className="glass-card rounded-3xl p-6 cursor-pointer group h-full border border-white/10 hover:border-white/20 transition-all"
                        onClick={() => setSelectedPattern(pattern)}
                      >
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-5"
                          style={{ backgroundColor: `${pattern.color}20` }}
                        >
                          {pattern.icon}
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-violet-300 transition-colors">
                          {pattern.name}
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">{pattern.description}</p>

                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-3xl font-mono font-bold" style={{ color: pattern.color }}>
                            {pattern.pattern}
                          </span>
                          <span className="text-xs text-gray-500">seconds</span>
                        </div>

                        <div className="space-y-2">
                          {pattern.benefits.map((benefit, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pattern.color }} />
                              {benefit}
                            </div>
                          ))}
                        </div>

                        <motion.div
                          className="mt-6 flex items-center gap-2 text-sm font-medium"
                          style={{ color: pattern.color }}
                          whileHover={{ x: 5 }}
                        >
                          Start breathing
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Info section */}
                <motion.div
                  className="mt-12 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-gray-500 text-sm max-w-xl mx-auto">
                    Breathwork activates your parasympathetic nervous system, reducing cortisol and
                    increasing heart rate variability. Just 3 minutes can shift your state.
                  </p>
                </motion.div>
              </motion.div>
            ) : showGrounding ? (
              /* Grounding Exercise */
              <motion.div
                key="grounding"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-md mx-auto text-center py-12"
              >
                <motion.div
                  className="text-6xl mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                >
                  🌿
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Grounding Moment
                </h2>
                <p className="text-gray-400 mb-8">
                  Before you return, anchor yourself in the present moment.
                </p>

                <div className="glass-card rounded-2xl p-6 text-left mb-8">
                  <p className="text-sm text-gray-400 mb-4">Notice around you:</p>
                  <ul className="space-y-4">
                    {[
                      { count: 5, sense: 'things you can see', color: 'text-violet-400', bg: 'from-violet-500/20' },
                      { count: 4, sense: 'things you can touch', color: 'text-cyan-400', bg: 'from-cyan-500/20' },
                      { count: 3, sense: 'things you can hear', color: 'text-amber-400', bg: 'from-amber-500/20' },
                      { count: 2, sense: 'things you can smell', color: 'text-emerald-400', bg: 'from-emerald-500/20' },
                      { count: 1, sense: 'thing you can taste', color: 'text-pink-400', bg: 'from-pink-500/20' },
                    ].map((item, i) => (
                      <motion.li
                        key={i}
                        className={`flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r ${item.bg} to-transparent`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.2 }}
                      >
                        <span className={`text-2xl font-bold ${item.color}`}>{item.count}</span>
                        <span className="text-gray-300">{item.sense}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={finishGrounding}
                  className="bg-gradient-to-r from-veil-600 to-veil-500 hover:from-veil-500 hover:to-veil-400"
                  size="lg"
                >
                  Complete Session
                </Button>
              </motion.div>
            ) : (
              /* Active Breathing Session */
              <motion.div
                key="breathing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                {/* Back button */}
                <div className="w-full flex justify-between items-center mb-8">
                  <button
                    onClick={() => { setIsActive(false); setSelectedPattern(null); }}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedPattern.icon}</span>
                    <span className="text-white font-semibold">{selectedPattern.name}</span>
                  </div>
                </div>

                {/* Duration selector (only before starting) */}
                {!isActive && (
                  <motion.div
                    className="flex items-center gap-4 mb-8"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span className="text-gray-400 text-sm">Duration:</span>
                    {[60, 180, 300].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => setSessionDuration(sec)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          sessionDuration === sec
                            ? 'bg-veil-600 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {sec / 60} min
                      </button>
                    ))}
                  </motion.div>
                )}

                {/* Breath Circle */}
                <BreathCircle
                  type={selectedPattern.type}
                  isActive={isActive}
                  duration={sessionDuration}
                  onComplete={handleComplete}
                />

                {/* Start/Stop button */}
                <motion.div
                  className="mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {!isActive ? (
                    <Button
                      onClick={startSession}
                      size="lg"
                      className={`bg-gradient-to-r ${selectedPattern.gradient} hover:opacity-90 px-12`}
                    >
                      Begin Session
                    </Button>
                  ) : (
                    <Button
                      onClick={() => { setIsActive(false); handleComplete(); }}
                      variant="outline"
                      size="lg"
                    >
                      End Early
                    </Button>
                  )}
                </motion.div>

                {/* Tips */}
                {!isActive && (
                  <motion.p
                    className="mt-8 text-sm text-gray-500 text-center max-w-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Find a comfortable position. Let your shoulders drop.
                    Breathe through your nose if possible.
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
    </>
  );
}
