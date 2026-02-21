'use client';

import { motion } from 'framer-motion';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  weekActivity: boolean[]; // Last 7 days, true = active
}

export function StreakDisplay({ currentStreak, longestStreak, weekActivity }: StreakDisplayProps) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="bg-gradient-to-br from-ember-900/30 to-ember-950/30 rounded-xl p-5 border border-ember-500/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Your Streak</h3>
        <div className="text-2xl">🔥</div>
      </div>

      {/* Main streak number */}
      <div className="text-center mb-6">
        <motion.div
          className="text-6xl font-bold text-ember-400"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
        >
          {currentStreak}
        </motion.div>
        <p className="text-ember-300/70 text-sm mt-1">
          {currentStreak === 1 ? 'day' : 'days'} in a row
        </p>
      </div>

      {/* Week activity */}
      <div className="flex justify-between mb-4">
        {weekActivity.map((active, index) => (
          <div key={index} className="flex flex-col items-center gap-1">
            <motion.div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium
                ${active
                  ? 'bg-ember-500 text-white'
                  : 'bg-white/5 text-gray-500'
                }`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: index * 0.05, type: 'spring' }}
            >
              {active ? '✓' : days[index]}
            </motion.div>
            <span className="text-xs text-gray-500">{days[index]}</span>
          </div>
        ))}
      </div>

      {/* Longest streak */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <span className="text-sm text-gray-400">Longest streak</span>
        <span className="text-sm font-semibold text-white">{longestStreak} days</span>
      </div>
    </div>
  );
}
