'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
} from 'lucide-react';

interface DepartmentData {
  name: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  employees: number;
  riskLevel: 'low' | 'medium' | 'high';
}

const departments: DepartmentData[] = [
  { name: 'Engineering', score: 72, trend: 'up', employees: 45, riskLevel: 'low' },
  { name: 'Sales', score: 58, trend: 'down', employees: 32, riskLevel: 'medium' },
  { name: 'Marketing', score: 81, trend: 'up', employees: 18, riskLevel: 'low' },
  { name: 'Customer Support', score: 45, trend: 'down', employees: 28, riskLevel: 'high' },
  { name: 'HR', score: 76, trend: 'stable', employees: 8, riskLevel: 'low' },
  { name: 'Finance', score: 68, trend: 'stable', employees: 12, riskLevel: 'medium' },
  { name: 'Operations', score: 52, trend: 'down', employees: 22, riskLevel: 'high' },
  { name: 'Product', score: 79, trend: 'up', employees: 15, riskLevel: 'low' },
];

export default function StressHeatmapPage() {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const riskColors = {
    low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <main className="min-h-screen bg-[#0a0a12] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Activity className="w-7 h-7 text-amber-400" />
                Stress Heatmap
              </h1>
              <p className="text-gray-400 mt-1">Department-level wellness visualization</p>
            </div>
            <Card className="bg-amber-500/10 border-amber-500/20 px-4 py-2">
              <div className="flex items-center gap-2 text-sm">
                <Info className="w-4 h-4 text-amber-400" />
                <span className="text-amber-200">Data updated daily at midnight</span>
              </div>
            </Card>
          </div>

          {/* Legend */}
          <Card className="bg-white/[0.02] border-white/10 p-4 mb-8">
            <div className="flex items-center justify-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-emerald-500" />
                <span className="text-sm text-gray-400">Healthy (70-100)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-500" />
                <span className="text-sm text-gray-400">Moderate (50-69)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500" />
                <span className="text-sm text-gray-400">At Risk (0-49)</span>
              </div>
            </div>
          </Card>

          {/* Heatmap Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {departments.map((dept, i) => (
              <motion.div
                key={dept.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className={`relative overflow-hidden border-white/10 p-4 cursor-pointer hover:scale-105 transition-transform`}
                  style={{
                    background: `linear-gradient(135deg, ${
                      dept.score >= 70 ? 'rgba(16, 185, 129, 0.1)' :
                      dept.score >= 50 ? 'rgba(245, 158, 11, 0.1)' :
                      'rgba(239, 68, 68, 0.1)'
                    } 0%, transparent 100%)`,
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-white text-sm">{dept.name}</h3>
                    {getTrendIcon(dept.trend)}
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className={`text-3xl font-bold ${
                        dept.score >= 70 ? 'text-emerald-400' :
                        dept.score >= 50 ? 'text-amber-400' :
                        'text-red-400'
                      }`}>
                        {dept.score}
                      </p>
                      <p className="text-xs text-gray-500">{dept.employees} employees</p>
                    </div>
                    <Badge className={riskColors[dept.riskLevel]}>
                      {dept.riskLevel}
                    </Badge>
                  </div>

                  {/* Score bar */}
                  <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getScoreColor(dept.score)}`}
                      style={{ width: `${dept.score}%` }}
                    />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-emerald-500/5 border-emerald-500/20 p-4">
              <p className="text-sm text-gray-400">Healthy Departments</p>
              <p className="text-2xl font-bold text-emerald-400">
                {departments.filter((d) => d.riskLevel === 'low').length}
              </p>
            </Card>
            <Card className="bg-amber-500/5 border-amber-500/20 p-4">
              <p className="text-sm text-gray-400">Moderate Risk</p>
              <p className="text-2xl font-bold text-amber-400">
                {departments.filter((d) => d.riskLevel === 'medium').length}
              </p>
            </Card>
            <Card className="bg-red-500/5 border-red-500/20 p-4">
              <p className="text-sm text-gray-400">High Risk</p>
              <p className="text-2xl font-bold text-red-400">
                {departments.filter((d) => d.riskLevel === 'high').length}
              </p>
            </Card>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
