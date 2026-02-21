'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  TrendingUp,
  AlertTriangle,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Brain,
} from 'lucide-react';

interface RiskFactor {
  name: string;
  impact: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

const riskFactors: RiskFactor[] = [
  { name: 'Low engagement score', impact: 35, trend: 'increasing' },
  { name: 'Declining mood trends', impact: 28, trend: 'stable' },
  { name: 'Reduced ritual participation', impact: 22, trend: 'decreasing' },
  { name: 'High stress indicators', impact: 15, trend: 'increasing' },
];

const atRiskEmployees = [
  { id: 'EMP-4521', department: 'Customer Support', riskScore: 82, factors: ['Low engagement', 'Declining mood'] },
  { id: 'EMP-7829', department: 'Sales', riskScore: 75, factors: ['High stress', 'Reduced participation'] },
  { id: 'EMP-3345', department: 'Operations', riskScore: 68, factors: ['Declining mood', 'Low engagement'] },
];

export default function AttritionRiskPage() {
  const { toast } = useToast();

  const handleViewAll = () => {
    toast({
      title: 'View All At-Risk Employees',
      description: 'Full employee list coming soon.',
    });
  };

  return (
    <main className="min-h-screen bg-[#0a0a12] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <TrendingUp className="w-7 h-7 text-amber-400" />
                Attrition Risk Analysis
              </h1>
              <p className="text-gray-400 mt-1">Predictive analytics for employee retention</p>
            </div>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              <Brain className="w-3.5 h-3.5 mr-1" />
              AI-Powered Predictions
            </Badge>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/[0.02] border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Overall Risk</p>
                  <p className="text-2xl font-bold text-amber-400">12%</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-emerald-400">
                <ArrowDownRight className="w-3 h-3" />
                2% vs last month
              </div>
            </Card>

            <Card className="bg-white/[0.02] border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">At-Risk Employees</p>
                  <p className="text-2xl font-bold text-red-400">23</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-red-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-red-400">
                <ArrowUpRight className="w-3 h-3" />
                5 new this week
              </div>
            </Card>

            <Card className="bg-white/[0.02] border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Predicted Turnover</p>
                  <p className="text-2xl font-bold text-white">8</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-veil-500/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-veil-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Next 90 days</p>
            </Card>

            <Card className="bg-white/[0.02] border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Retention Rate</p>
                  <p className="text-2xl font-bold text-emerald-400">94%</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-emerald-400">
                <ArrowUpRight className="w-3 h-3" />
                1% vs last quarter
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Factors */}
            <Card className="bg-white/[0.02] border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Top Risk Factors</h3>
              <div className="space-y-4">
                {riskFactors.map((factor, i) => (
                  <motion.div
                    key={factor.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white">{factor.name}</span>
                        <span className="text-sm text-amber-400">{factor.impact}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full"
                          style={{ width: `${factor.impact}%` }}
                        />
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        factor.trend === 'increasing' ? 'text-red-400 border-red-500/30' :
                        factor.trend === 'decreasing' ? 'text-emerald-400 border-emerald-500/30' :
                        'text-gray-400 border-gray-500/30'
                      }
                    >
                      {factor.trend}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* At-Risk Employees */}
            <Card className="bg-white/[0.02] border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">At-Risk Employees</h3>
                <Button variant="outline" size="sm" className="border-white/10" onClick={handleViewAll}>
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {atRiskEmployees.map((emp, i) => (
                  <motion.div
                    key={emp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5"
                  >
                    <div>
                      <p className="font-medium text-white">{emp.id}</p>
                      <p className="text-xs text-gray-500">{emp.department}</p>
                      <div className="flex gap-1 mt-1">
                        {emp.factors.map((f) => (
                          <Badge key={f} variant="outline" className="text-[10px] text-gray-400 border-gray-600">
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${emp.riskScore >= 75 ? 'text-red-400' : 'text-amber-400'}`}>
                        {emp.riskScore}%
                      </p>
                      <p className="text-xs text-gray-500">risk score</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
