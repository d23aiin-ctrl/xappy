'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

const insights = [
  {
    id: '1',
    type: 'warning',
    title: 'Customer Support Burnout Risk',
    description: 'The Customer Support department shows a 23% decline in wellness scores over the past 4 weeks. Consider workload distribution review.',
    metric: '-23%',
    action: 'Review workload',
    priority: 'high',
  },
  {
    id: '2',
    type: 'success',
    title: 'Marketing Team Thriving',
    description: 'Marketing department has achieved highest ritual adoption rate (78%) and shows consistent positive mood trends.',
    metric: '+15%',
    action: 'Share best practices',
    priority: 'low',
  },
  {
    id: '3',
    type: 'info',
    title: 'Monday Mood Dip Pattern',
    description: 'Organization-wide mood scores consistently dip on Mondays by 12%. Consider wellness activities on Monday mornings.',
    metric: '-12%',
    action: 'Schedule intervention',
    priority: 'medium',
  },
  {
    id: '4',
    type: 'warning',
    title: 'Breath Exercise Underutilization',
    description: 'Only 34% of employees are using breath exercises regularly. This feature correlates with 28% better stress management.',
    metric: '34%',
    action: 'Promote feature',
    priority: 'medium',
  },
  {
    id: '5',
    type: 'success',
    title: 'Journal Engagement Rising',
    description: 'Journal entries increased by 45% this month. Employees who journal show 20% better mood stability.',
    metric: '+45%',
    action: 'Maintain momentum',
    priority: 'low',
  },
];

export default function InsightsPage() {
  const typeConfig = {
    warning: {
      icon: AlertTriangle,
      color: 'amber',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
    success: {
      icon: CheckCircle,
      color: 'emerald',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    info: {
      icon: Lightbulb,
      color: 'cyan',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
    },
  };

  const priorityColors = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <main className="min-h-screen bg-[#0a0a12] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Brain className="w-7 h-7 text-cyan-400" />
                AI Insights
              </h1>
              <p className="text-gray-400 mt-1">AI-generated wellness recommendations</p>
            </div>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              <Brain className="w-3.5 h-3.5 mr-1" />
              5 New Insights
            </Badge>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-amber-500/5 border-amber-500/20 p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-amber-400" />
                <div>
                  <p className="text-2xl font-bold text-amber-400">
                    {insights.filter((i) => i.type === 'warning').length}
                  </p>
                  <p className="text-sm text-gray-400">Warnings</p>
                </div>
              </div>
            </Card>
            <Card className="bg-emerald-500/5 border-emerald-500/20 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
                <div>
                  <p className="text-2xl font-bold text-emerald-400">
                    {insights.filter((i) => i.type === 'success').length}
                  </p>
                  <p className="text-sm text-gray-400">Positive Trends</p>
                </div>
              </div>
            </Card>
            <Card className="bg-cyan-500/5 border-cyan-500/20 p-4">
              <div className="flex items-center gap-3">
                <Lightbulb className="w-8 h-8 text-cyan-400" />
                <div>
                  <p className="text-2xl font-bold text-cyan-400">
                    {insights.filter((i) => i.type === 'info').length}
                  </p>
                  <p className="text-sm text-gray-400">Recommendations</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Insights List */}
          <div className="space-y-4">
            {insights.map((insight, i) => {
              const config = typeConfig[insight.type as keyof typeof typeConfig];
              const Icon = config.icon;

              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className={`${config.bgColor} ${config.borderColor} p-5 hover:scale-[1.01] transition-transform cursor-pointer`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 text-${config.color}-400`} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-white">{insight.title}</h3>
                              <Badge className={priorityColors[insight.priority as keyof typeof priorityColors]}>
                                {insight.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-400">{insight.description}</p>
                          </div>

                          <div className="text-right ml-4">
                            <p className={`text-2xl font-bold ${
                              insight.metric.startsWith('+') ? 'text-emerald-400' :
                              insight.metric.startsWith('-') ? 'text-red-400' :
                              'text-white'
                            }`}>
                              {insight.metric}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                          <span className="text-sm text-gray-500">Suggested action:</span>
                          <span className={`text-sm text-${config.color}-400 flex items-center gap-1`}>
                            {insight.action}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
