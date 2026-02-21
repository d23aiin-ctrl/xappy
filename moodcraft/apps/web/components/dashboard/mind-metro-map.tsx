'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface Station {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  color: string;
  glowColor: string;
  requirements: string[];
}

interface MindMetroMapProps {
  currentStation: number; // 0-3 index
  completedStations: number[];
  stats: {
    moodCheckins: number;
    journalEntries: number;
    breathSessions: number;
    streakDays: number;
  };
}

const STATIONS: Station[] = [
  {
    id: 'awareness',
    name: 'Awareness',
    description: 'Understanding your current state',
    x: 100,
    y: 280,
    color: '#8b5cf6',
    glowColor: 'rgba(139, 92, 246, 0.5)',
    requirements: ['Complete onboarding', 'First mood check-in'],
  },
  {
    id: 'acceptance',
    name: 'Acceptance',
    description: 'Embracing your emotions',
    x: 280,
    y: 180,
    color: '#6366f1',
    glowColor: 'rgba(99, 102, 241, 0.5)',
    requirements: ['7 mood check-ins', '3 journal entries'],
  },
  {
    id: 'integration',
    name: 'Integration',
    description: 'Building healthy habits',
    x: 480,
    y: 220,
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.5)',
    requirements: ['5 breath sessions', '7-day streak'],
  },
  {
    id: 'synthesis',
    name: 'Synthesis',
    description: 'Holistic well-being',
    x: 660,
    y: 160,
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.5)',
    requirements: ['21-day streak', 'All rituals completed'],
  },
];

export function MindMetroMap({ currentStation, completedStations, stats }: MindMetroMapProps) {
  const [hoveredStation, setHoveredStation] = useState<string | null>(null);

  // Generate the track path
  const trackPath = `M ${STATIONS[0].x} ${STATIONS[0].y}
    C ${STATIONS[0].x + 80} ${STATIONS[0].y - 60}, ${STATIONS[1].x - 80} ${STATIONS[1].y + 40}, ${STATIONS[1].x} ${STATIONS[1].y}
    C ${STATIONS[1].x + 80} ${STATIONS[1].y + 20}, ${STATIONS[2].x - 80} ${STATIONS[2].y - 20}, ${STATIONS[2].x} ${STATIONS[2].y}
    C ${STATIONS[2].x + 80} ${STATIONS[2].y - 30}, ${STATIONS[3].x - 80} ${STATIONS[3].y + 30}, ${STATIONS[3].x} ${STATIONS[3].y}`;

  // Calculate progress along track (0-1)
  const progress = (currentStation + 0.5) / STATIONS.length;

  return (
    <div className="relative w-full h-[400px] bg-gradient-to-br from-midnight-900/50 to-midnight-950/50 rounded-2xl overflow-hidden border border-white/5">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Ambient glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        {STATIONS.map((station, index) => (
          completedStations.includes(index) && (
            <motion.div
              key={station.id}
              className="absolute w-32 h-32 rounded-full blur-3xl"
              style={{
                left: station.x - 64,
                top: station.y - 64,
                backgroundColor: station.glowColor,
              }}
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
            />
          )
        ))}
      </div>

      {/* Main SVG */}
      <svg viewBox="0 0 800 400" className="w-full h-full">
        <defs>
          {/* Track gradient */}
          <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="33%" stopColor="#6366f1" />
            <stop offset="66%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Station glow filters */}
          {STATIONS.map((station) => (
            <filter key={`filter-${station.id}`} id={`glow-${station.id}`} x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="6" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {/* Track background (dim) */}
        <motion.path
          d={trackPath}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />

        {/* Track progress (lit) */}
        <motion.path
          d={trackPath}
          fill="none"
          stroke="url(#trackGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          filter="url(#glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: progress }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
        />

        {/* Animated train/indicator */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.circle
            cx={STATIONS[currentStation].x}
            cy={STATIONS[currentStation].y}
            r="18"
            fill={STATIONS[currentStation].color}
            filter={`url(#glow-${STATIONS[currentStation].id})`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.circle
            cx={STATIONS[currentStation].x}
            cy={STATIONS[currentStation].y}
            r="28"
            fill="none"
            stroke={STATIONS[currentStation].color}
            strokeWidth="2"
            strokeDasharray="4 4"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: `${STATIONS[currentStation].x}px ${STATIONS[currentStation].y}px` }}
          />
        </motion.g>

        {/* Stations */}
        {STATIONS.map((station, index) => {
          const isCompleted = completedStations.includes(index);
          const isCurrent = index === currentStation;
          const isLocked = index > currentStation && !isCompleted;

          return (
            <g
              key={station.id}
              onMouseEnter={() => setHoveredStation(station.id)}
              onMouseLeave={() => setHoveredStation(null)}
              className="cursor-pointer"
            >
              {/* Station outer ring */}
              <motion.circle
                cx={station.x}
                cy={station.y}
                r="24"
                fill={isLocked ? 'rgba(255,255,255,0.05)' : `${station.color}20`}
                stroke={isLocked ? 'rgba(255,255,255,0.1)' : station.color}
                strokeWidth={isCurrent ? 3 : 2}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.2 + 0.5, type: 'spring' }}
              />

              {/* Station inner */}
              <motion.circle
                cx={station.x}
                cy={station.y}
                r="12"
                fill={isCompleted || isCurrent ? station.color : 'rgba(255,255,255,0.1)'}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.2 + 0.7, type: 'spring' }}
              />

              {/* Checkmark for completed */}
              {isCompleted && !isCurrent && (
                <motion.path
                  d={`M ${station.x - 5} ${station.y} L ${station.x - 1} ${station.y + 4} L ${station.x + 6} ${station.y - 4}`}
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: index * 0.2 + 1, duration: 0.3 }}
                />
              )}

              {/* Lock icon for locked stations */}
              {isLocked && (
                <g transform={`translate(${station.x - 6}, ${station.y - 7})`}>
                  <rect x="2" y="5" width="8" height="7" rx="1" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                  <path d="M3 5 V3 A3 3 0 0 1 9 3 V5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                </g>
              )}

              {/* Station label */}
              <motion.text
                x={station.x}
                y={station.y + 45}
                textAnchor="middle"
                fill={isLocked ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.9)'}
                fontSize="14"
                fontWeight="600"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 + 0.8 }}
              >
                {station.name}
              </motion.text>
            </g>
          );
        })}
      </svg>

      {/* Hover tooltip */}
      {hoveredStation && (
        <motion.div
          className="absolute bg-midnight-800/95 backdrop-blur-sm rounded-lg p-4 border border-white/10 shadow-xl max-w-xs"
          style={{
            left: STATIONS.find(s => s.id === hoveredStation)!.x,
            top: STATIONS.find(s => s.id === hoveredStation)!.y - 120,
            transform: 'translateX(-50%)',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <h4 className="font-semibold text-white mb-1">
            {STATIONS.find(s => s.id === hoveredStation)!.name}
          </h4>
          <p className="text-sm text-gray-400 mb-2">
            {STATIONS.find(s => s.id === hoveredStation)!.description}
          </p>
          <div className="text-xs text-gray-500">
            <p className="font-medium mb-1">Requirements:</p>
            <ul className="list-disc list-inside">
              {STATIONS.find(s => s.id === hoveredStation)!.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {/* Stats overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between">
        <div className="flex gap-4">
          <StatBadge icon="🎯" value={stats.moodCheckins} label="Check-ins" />
          <StatBadge icon="📝" value={stats.journalEntries} label="Entries" />
          <StatBadge icon="🌬️" value={stats.breathSessions} label="Breaths" />
        </div>
        <div className="flex items-center gap-2 bg-ember-500/20 px-3 py-1.5 rounded-full">
          <span className="text-ember-400">🔥</span>
          <span className="text-ember-300 font-semibold">{stats.streakDays}</span>
          <span className="text-ember-400/70 text-sm">day streak</span>
        </div>
      </div>
    </div>
  );
}

function StatBadge({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
      <span>{icon}</span>
      <span className="text-white font-semibold">{value}</span>
      <span className="text-gray-400 text-sm hidden sm:inline">{label}</span>
    </div>
  );
}
