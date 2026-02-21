'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';

interface MoodDataPoint {
  date: string;
  moodScore: number;
  phq9Score?: number;
  gad7Score?: number;
  emoji?: string;
}

interface MoodChartProps {
  data: MoodDataPoint[];
  showPHQ9?: boolean;
  showGAD7?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-midnight-800/95 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-xl">
        <p className="text-white font-medium mb-1">
          {new Date(label).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </p>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{data.emoji || '😐'}</span>
            <span className="text-veil-400">Mood: {data.moodScore}/10</span>
          </div>
          {data.phq9Score !== undefined && (
            <p className="text-blue-400">PHQ-9: {data.phq9Score}</p>
          )}
          {data.gad7Score !== undefined && (
            <p className="text-orange-400">GAD-7: {data.gad7Score}</p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export function MoodChart({ data, showPHQ9 = true, showGAD7 = true }: MoodChartProps) {
  const chartData = useMemo(() => {
    return data.map(d => ({
      ...d,
      date: new Date(d.date).getTime(),
      // Normalize scores for display
      normalizedPHQ9: d.phq9Score ? (d.phq9Score / 27) * 10 : undefined,
      normalizedGAD7: d.gad7Score ? (d.gad7Score / 21) * 10 : undefined,
    })).sort((a, b) => a.date - b.date);
  }, [data]);

  const avgMood = useMemo(() => {
    if (data.length === 0) return 5;
    return data.reduce((sum, d) => sum + d.moodScore, 0) / data.length;
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-white/5 rounded-xl border border-white/10">
        <p className="text-gray-400">No mood data yet. Start tracking to see your trends.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-midnight-900/50 to-midnight-950/50 rounded-xl p-4 border border-white/10"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Mood Trend</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-veil-500" />
            <span className="text-gray-400">Mood</span>
          </div>
          {showPHQ9 && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-400">PHQ-9</span>
            </div>
          )}
          {showGAD7 && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-gray-400">GAD-7</span>
            </div>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="phq9Gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gad7Gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis
            domain={[0, 10]}
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={avgMood}
            stroke="rgba(139, 92, 246, 0.5)"
            strokeDasharray="5 5"
            label={{ value: 'Avg', position: 'right', fill: 'rgba(139, 92, 246, 0.7)', fontSize: 10 }}
          />
          <Area
            type="monotone"
            dataKey="moodScore"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#moodGradient)"
            dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
          />
          {showPHQ9 && (
            <Area
              type="monotone"
              dataKey="normalizedPHQ9"
              stroke="#3b82f6"
              strokeWidth={1.5}
              fill="url(#phq9Gradient)"
              strokeDasharray="5 5"
              dot={false}
            />
          )}
          {showGAD7 && (
            <Area
              type="monotone"
              dataKey="normalizedGAD7"
              stroke="#f97316"
              strokeWidth={1.5}
              fill="url(#gad7Gradient)"
              strokeDasharray="5 5"
              dot={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
        <div className="text-center">
          <p className="text-2xl font-bold text-veil-400">{avgMood.toFixed(1)}</p>
          <p className="text-xs text-gray-400">Avg Mood</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-400">
            {Math.max(...data.map(d => d.moodScore))}
          </p>
          <p className="text-xs text-gray-400">Highest</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-400">
            {Math.min(...data.map(d => d.moodScore))}
          </p>
          <p className="text-xs text-gray-400">Lowest</p>
        </div>
      </div>
    </motion.div>
  );
}
