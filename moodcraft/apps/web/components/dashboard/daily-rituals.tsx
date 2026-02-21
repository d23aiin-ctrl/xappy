'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface Ritual {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
  completed: boolean;
  color: string;
  bgGradient: string;
}

interface DailyRitualsProps {
  rituals: Ritual[];
}

const DEFAULT_RITUALS: Ritual[] = [
  {
    id: 'mood',
    name: 'Mood Mirror',
    description: 'Reflect on your emotional state',
    icon: '🪞',
    href: '/mood-mirror',
    completed: false,
    color: 'veil',
    bgGradient: 'from-veil-600/20 to-veil-800/20',
  },
  {
    id: 'journal',
    name: 'Journal',
    description: 'Write your thoughts',
    icon: '📝',
    href: '/journal',
    completed: false,
    color: 'oracle',
    bgGradient: 'from-oracle-600/20 to-oracle-800/20',
  },
  {
    id: 'breath',
    name: 'Breath Loop',
    description: 'Center yourself with breathing',
    icon: '🌬️',
    href: '/breath-loops',
    completed: false,
    color: 'ember',
    bgGradient: 'from-cyan-600/20 to-cyan-800/20',
  },
  {
    id: 'companion',
    name: 'AI Companion',
    description: 'Chat with your guide',
    icon: '💬',
    href: '/companion',
    completed: false,
    color: 'emerald',
    bgGradient: 'from-emerald-600/20 to-emerald-800/20',
  },
];

export function DailyRituals({ rituals = DEFAULT_RITUALS }: DailyRitualsProps) {
  const completedCount = rituals.filter(r => r.completed).length;
  const progress = (completedCount / rituals.length) * 100;

  return (
    <div className="space-y-4">
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Daily Rituals</h3>
          <p className="text-sm text-gray-400">
            {completedCount} of {rituals.length} completed today
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-veil-500 to-oracle-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <span className="text-sm font-medium text-veil-400">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Ritual cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rituals.map((ritual, index) => (
          <motion.div
            key={ritual.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={ritual.href}>
              <div
                className={`relative group p-4 rounded-xl border transition-all duration-300 overflow-hidden
                  ${ritual.completed
                    ? 'bg-gradient-to-br from-emerald-900/30 to-emerald-950/30 border-emerald-500/30'
                    : `bg-gradient-to-br ${ritual.bgGradient} border-white/10 hover:border-white/20`
                  }`}
              >
                {/* Background glow on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${ritual.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity blur-xl`} />

                <div className="relative flex items-center gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                    ${ritual.completed ? 'bg-emerald-500/20' : 'bg-white/5 group-hover:bg-white/10'}
                    transition-colors`}
                  >
                    {ritual.completed ? '✓' : ritual.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium ${ritual.completed ? 'text-emerald-300' : 'text-white'}`}>
                      {ritual.name}
                    </h4>
                    <p className="text-sm text-gray-400 truncate">
                      {ritual.completed ? 'Completed' : ritual.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <motion.div
                    className="text-gray-500 group-hover:text-white transition-colors"
                    initial={{ x: 0 }}
                    whileHover={{ x: 4 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
