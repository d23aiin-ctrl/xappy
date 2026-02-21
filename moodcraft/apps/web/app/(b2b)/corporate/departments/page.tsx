'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Building2,
  Users,
  TrendingUp,
  TrendingDown,
  Heart,
  Brain,
  Wind,
  ChevronRight,
} from 'lucide-react';

const departments = [
  {
    name: 'Engineering',
    head: 'John Smith',
    employees: 45,
    wellnessScore: 72,
    trend: 'up',
    ritualAdoption: 68,
    moodAvg: 7.2,
    breathSessions: 156,
  },
  {
    name: 'Sales',
    head: 'Sarah Johnson',
    employees: 32,
    wellnessScore: 58,
    trend: 'down',
    ritualAdoption: 45,
    moodAvg: 5.8,
    breathSessions: 89,
  },
  {
    name: 'Customer Support',
    head: 'Mike Davis',
    employees: 28,
    wellnessScore: 45,
    trend: 'down',
    ritualAdoption: 32,
    moodAvg: 4.9,
    breathSessions: 67,
  },
  {
    name: 'Marketing',
    head: 'Emily Chen',
    employees: 18,
    wellnessScore: 81,
    trend: 'up',
    ritualAdoption: 78,
    moodAvg: 7.8,
    breathSessions: 124,
  },
  {
    name: 'Product',
    head: 'Alex Kim',
    employees: 15,
    wellnessScore: 79,
    trend: 'up',
    ritualAdoption: 72,
    moodAvg: 7.5,
    breathSessions: 98,
  },
];

export default function DepartmentsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a12] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/3 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Building2 className="w-7 h-7 text-amber-400" />
                Departments
              </h1>
              <p className="text-gray-400 mt-1">Department-level wellness overview</p>
            </div>
            <Badge variant="outline" className="text-amber-400 border-amber-500/30">
              {departments.length} Departments
            </Badge>
          </div>

          {/* Departments Grid */}
          <div className="space-y-4">
            {departments.map((dept, i) => (
              <motion.div
                key={dept.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-white/[0.02] border-white/10 p-6 hover:bg-white/[0.04] transition-all cursor-pointer group">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Department Info */}
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        dept.wellnessScore >= 70 ? 'bg-emerald-500/10' :
                        dept.wellnessScore >= 50 ? 'bg-amber-500/10' :
                        'bg-red-500/10'
                      }`}>
                        <Building2 className={`w-7 h-7 ${
                          dept.wellnessScore >= 70 ? 'text-emerald-400' :
                          dept.wellnessScore >= 50 ? 'text-amber-400' :
                          'text-red-400'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-white">{dept.name}</h3>
                          {dept.trend === 'up' ? (
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">Led by {dept.head}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Users className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-sm text-gray-400">{dept.employees} employees</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-6">
                      {/* Wellness Score */}
                      <div className="min-w-[120px]">
                        <p className="text-xs text-gray-500 mb-1">Wellness Score</p>
                        <div className="flex items-center gap-2">
                          <p className={`text-2xl font-bold ${
                            dept.wellnessScore >= 70 ? 'text-emerald-400' :
                            dept.wellnessScore >= 50 ? 'text-amber-400' :
                            'text-red-400'
                          }`}>
                            {dept.wellnessScore}
                          </p>
                          <Progress value={dept.wellnessScore} className="h-2 w-16" />
                        </div>
                      </div>

                      {/* Ritual Adoption */}
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-veil-500/10 flex items-center justify-center">
                          <Heart className="w-5 h-5 text-veil-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Ritual Adoption</p>
                          <p className="font-semibold text-white">{dept.ritualAdoption}%</p>
                        </div>
                      </div>

                      {/* Mood Average */}
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                          <Brain className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Avg Mood</p>
                          <p className="font-semibold text-white">{dept.moodAvg}/10</p>
                        </div>
                      </div>

                      {/* Breath Sessions */}
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <Wind className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Breath Sessions</p>
                          <p className="font-semibold text-white">{dept.breathSessions}</p>
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
