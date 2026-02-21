'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'holdOut' | 'ready';

interface BreathCircleProps {
  type: 'BOX' | 'FOUR_SEVEN_EIGHT' | 'PACED';
  isActive: boolean;
  onComplete?: () => void;
  duration?: number; // Total session duration in seconds
}

const BREATH_PATTERNS = {
  BOX: { inhale: 4, hold: 4, exhale: 4, holdOut: 4, name: 'Box Breathing' },
  FOUR_SEVEN_EIGHT: { inhale: 4, hold: 7, exhale: 8, holdOut: 0, name: '4-7-8 Breathing' },
  PACED: { inhale: 5, hold: 0, exhale: 5, holdOut: 0, name: 'Paced Breathing' },
};

const PHASE_INSTRUCTIONS: Record<BreathPhase, string> = {
  inhale: 'Breathe In',
  hold: 'Hold',
  exhale: 'Breathe Out',
  holdOut: 'Hold',
  ready: 'Get Ready',
};

const PHASE_COLORS: Record<BreathPhase, string> = {
  inhale: 'from-cyan-500 to-blue-500',
  hold: 'from-veil-500 to-purple-500',
  exhale: 'from-orange-500 to-amber-500',
  holdOut: 'from-pink-500 to-rose-500',
  ready: 'from-gray-500 to-gray-600',
};

export function BreathCircle({ type, isActive, onComplete, duration = 180 }: BreathCircleProps) {
  const [phase, setPhase] = useState<BreathPhase>('ready');
  const [countdown, setCountdown] = useState(3);
  const [cycleCount, setCycleCount] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [phaseTime, setPhaseTime] = useState(0);

  const pattern = BREATH_PATTERNS[type];
  const cycleLength = pattern.inhale + pattern.hold + pattern.exhale + pattern.holdOut;

  const getNextPhase = useCallback((current: BreathPhase): BreathPhase => {
    switch (current) {
      case 'inhale':
        return pattern.hold > 0 ? 'hold' : 'exhale';
      case 'hold':
        return 'exhale';
      case 'exhale':
        return pattern.holdOut > 0 ? 'holdOut' : 'inhale';
      case 'holdOut':
        return 'inhale';
      default:
        return 'inhale';
    }
  }, [pattern]);

  const getPhaseDuration = useCallback((p: BreathPhase): number => {
    switch (p) {
      case 'inhale': return pattern.inhale;
      case 'hold': return pattern.hold;
      case 'exhale': return pattern.exhale;
      case 'holdOut': return pattern.holdOut;
      default: return 0;
    }
  }, [pattern]);

  // Countdown before starting
  useEffect(() => {
    if (!isActive) {
      setPhase('ready');
      setCountdown(3);
      setCycleCount(0);
      setTotalSeconds(0);
      return;
    }

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (countdown === 0 && phase === 'ready') {
      setPhase('inhale');
      setPhaseTime(pattern.inhale);
    }
  }, [isActive, countdown, phase, pattern.inhale]);

  // Main breathing loop
  useEffect(() => {
    if (!isActive || phase === 'ready' || countdown > 0) return;

    const timer = setInterval(() => {
      setPhaseTime(prev => {
        if (prev <= 1) {
          const nextPhase = getNextPhase(phase);
          if (nextPhase === 'inhale') {
            setCycleCount(c => c + 1);
          }
          setPhase(nextPhase);
          return getPhaseDuration(nextPhase);
        }
        return prev - 1;
      });

      setTotalSeconds(prev => {
        const next = prev + 1;
        if (next >= duration) {
          onComplete?.();
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase, countdown, getNextPhase, getPhaseDuration, duration, onComplete]);

  const getCircleScale = () => {
    if (phase === 'inhale') return 1.3;
    if (phase === 'exhale') return 0.8;
    return 1;
  };

  const progress = (totalSeconds / duration) * 100;

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Main breath circle */}
      <div className="relative w-72 h-72 md:w-96 md:h-96">
        {/* Outer ring - progress */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="48%"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="2"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="48%"
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 48} ${2 * Math.PI * 48}`}
            strokeDashoffset={2 * Math.PI * 48 * (1 - progress / 100)}
            initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - progress / 100) }}
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>

        {/* Animated breath circle */}
        <div className="absolute inset-8 flex items-center justify-center">
          <motion.div
            className={`relative w-full h-full rounded-full bg-gradient-to-br ${PHASE_COLORS[phase]} opacity-30`}
            animate={{
              scale: getCircleScale(),
            }}
            transition={{
              duration: getPhaseDuration(phase),
              ease: phase === 'inhale' ? 'easeIn' : phase === 'exhale' ? 'easeOut' : 'linear',
            }}
          />

          {/* Inner glowing circle */}
          <motion.div
            className={`absolute inset-12 rounded-full bg-gradient-to-br ${PHASE_COLORS[phase]}`}
            animate={{
              scale: getCircleScale(),
              boxShadow: [
                `0 0 30px rgba(139, 92, 246, 0.3)`,
                `0 0 60px rgba(139, 92, 246, 0.5)`,
                `0 0 30px rgba(139, 92, 246, 0.3)`,
              ],
            }}
            transition={{
              scale: {
                duration: getPhaseDuration(phase),
                ease: phase === 'inhale' ? 'easeIn' : phase === 'exhale' ? 'easeOut' : 'linear',
              },
              boxShadow: {
                duration: 2,
                repeat: Infinity,
              },
            }}
          />

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
            <AnimatePresence mode="wait">
              {countdown > 0 ? (
                <motion.div
                  key="countdown"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="text-6xl font-bold text-white"
                >
                  {countdown}
                </motion.div>
              ) : (
                <motion.div
                  key={phase}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-2xl md:text-3xl font-semibold text-white mb-2">
                    {PHASE_INSTRUCTIONS[phase]}
                  </span>
                  <span className="text-5xl md:text-6xl font-bold text-white">
                    {phaseTime}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Particle effects */}
        {isActive && phase !== 'ready' && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-white/30"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: [0, Math.cos((i * Math.PI) / 4) * (phase === 'inhale' ? 150 : 80)],
                  y: [0, Math.sin((i * Math.PI) / 4) * (phase === 'inhale' ? 150 : 80)],
                  opacity: [0.5, 0],
                  scale: [1, 0.5],
                }}
                transition={{
                  duration: getPhaseDuration(phase),
                  ease: 'easeOut',
                  repeat: Infinity,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <motion.div
        className="mt-8 flex items-center gap-8 text-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-center">
          <p className="text-gray-400">Cycles</p>
          <p className="text-2xl font-bold text-white">{cycleCount}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400">Time</p>
          <p className="text-2xl font-bold text-white">
            {Math.floor(totalSeconds / 60)}:{(totalSeconds % 60).toString().padStart(2, '0')}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-400">Pattern</p>
          <p className="text-lg font-semibold text-veil-400">{pattern.name}</p>
        </div>
      </motion.div>
    </div>
  );
}
