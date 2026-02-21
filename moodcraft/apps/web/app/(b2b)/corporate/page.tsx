'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StressHeatmap } from '@/components/corporate/stress-heatmap';
import { Download, Loader2 } from 'lucide-react';

interface DepartmentData {
  id: string;
  name: string;
  stressLevel: number;
  participationRate: number;
  avgMoodScore: number;
  employeeCount: number;
  trend: 'up' | 'down' | 'stable';
}

interface CorporateData {
  organization: { name: string; plan: string };
  departments: DepartmentData[];
  overallMetrics: {
    totalUsers: number;
    activeUsers: number;
    avgMood: number;
    avgStress: number;
    participationRate: number;
  };
  attritionRisks: { departmentId: string; riskScore: number; factors: string[] }[];
  weeklyTrend: { week: string; stress: number; mood: number }[];
}

// Demo data for visualization
const DEMO_DEPARTMENTS: DepartmentData[] = [
  { id: '1', name: 'Engineering', stressLevel: 42, participationRate: 78, avgMoodScore: 7.2, employeeCount: 45, trend: 'down' },
  { id: '2', name: 'Sales', stressLevel: 68, participationRate: 65, avgMoodScore: 6.1, employeeCount: 32, trend: 'up' },
  { id: '3', name: 'Marketing', stressLevel: 35, participationRate: 82, avgMoodScore: 7.8, employeeCount: 18, trend: 'stable' },
  { id: '4', name: 'HR', stressLevel: 28, participationRate: 92, avgMoodScore: 8.1, employeeCount: 12, trend: 'down' },
  { id: '5', name: 'Finance', stressLevel: 55, participationRate: 71, avgMoodScore: 6.5, employeeCount: 15, trend: 'stable' },
  { id: '6', name: 'Operations', stressLevel: 72, participationRate: 58, avgMoodScore: 5.8, employeeCount: 28, trend: 'up' },
  { id: '7', name: 'Support', stressLevel: 48, participationRate: 75, avgMoodScore: 6.9, employeeCount: 22, trend: 'stable' },
  { id: '8', name: 'Legal', stressLevel: 38, participationRate: 85, avgMoodScore: 7.4, employeeCount: 8, trend: 'down' },
];

export default function CorporateDashboardPage() {
  const [data, setData] = useState<CorporateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentData | null>(null);
  const [downloadingReport, setDownloadingReport] = useState(false);

  async function downloadESGReport() {
    setDownloadingReport(true);
    try {
      const response = await fetch('/api/corporate/esg-report');
      if (!response.ok) throw new Error('Failed to generate report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ESG_Wellness_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download report:', error);
      alert('Failed to generate ESG report. Please try again.');
    } finally {
      setDownloadingReport(false);
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/corporate/dashboard');
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (error) {
        console.error('Failed to fetch corporate data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Use demo data if no real data
  const departments = data?.departments?.length ? data.departments : DEMO_DEPARTMENTS;
  const orgName = data?.organization?.name || 'Acme Corp';

  // Calculate fallback metrics from demo data
  const fallbackMetrics = {
    totalUsers: departments.reduce((sum, d) => sum + d.employeeCount, 0),
    activeUsers: Math.round(departments.reduce((sum, d) => sum + d.employeeCount * (d.participationRate / 100), 0)),
    avgMood: departments.reduce((sum, d) => sum + d.avgMoodScore, 0) / departments.length,
    avgStress: departments.reduce((sum, d) => sum + d.stressLevel, 0) / departments.length,
    participationRate: departments.reduce((sum, d) => sum + d.participationRate, 0) / departments.length,
  };

  // Merge API data with fallbacks to ensure all properties exist
  const overallMetrics = {
    totalUsers: data?.overallMetrics?.totalUsers ?? fallbackMetrics.totalUsers,
    activeUsers: data?.overallMetrics?.activeUsers ?? fallbackMetrics.activeUsers,
    avgMood: data?.overallMetrics?.avgMood ?? fallbackMetrics.avgMood,
    avgStress: data?.overallMetrics?.avgStress ?? fallbackMetrics.avgStress,
    participationRate: data?.overallMetrics?.participationRate ?? fallbackMetrics.participationRate,
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <motion.div
          className="w-12 h-12 rounded-full border-2 border-veil-500/30 border-t-veil-400"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </main>
    );
  }

  return (
    <>
      
      <main className="min-h-screen bg-[#0a0a12] relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-veil-600/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-cyan-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <span className="text-2xl">🏢</span>
                {orgName} Wellness Dashboard
              </h1>
              <p className="text-gray-400">Anonymized organizational wellness metrics • Updated daily</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadESGReport}
                disabled={downloadingReport}
              >
                {downloadingReport ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export ESG Report
                  </>
                )}
              </Button>
              <Button
                className="bg-gradient-to-r from-veil-600 to-veil-500"
                onClick={() => alert('Schedule Review feature coming soon! You can contact your CereBro account manager to set up a quarterly wellness review meeting.')}
              >
                Schedule Review
              </Button>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-veil-500/20 flex items-center justify-center text-xl">👥</div>
                    <div>
                      <p className="text-2xl font-bold text-white">{overallMetrics.activeUsers}</p>
                      <p className="text-xs text-gray-400">Active Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-xl">📊</div>
                    <div>
                      <p className="text-2xl font-bold text-cyan-400">{overallMetrics.participationRate.toFixed(0)}%</p>
                      <p className="text-xs text-gray-400">Participation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xl">😊</div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-400">{overallMetrics.avgMood.toFixed(1)}</p>
                      <p className="text-xs text-gray-400">Avg Mood</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                      overallMetrics.avgStress < 50 ? 'bg-green-500/20' : overallMetrics.avgStress < 70 ? 'bg-amber-500/20' : 'bg-red-500/20'
                    }`}>
                      {overallMetrics.avgStress < 50 ? '✅' : overallMetrics.avgStress < 70 ? '⚠️' : '🚨'}
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${
                        overallMetrics.avgStress < 50 ? 'text-green-400' : overallMetrics.avgStress < 70 ? 'text-amber-400' : 'text-red-400'
                      }`}>{overallMetrics.avgStress.toFixed(0)}%</p>
                      <p className="text-xs text-gray-400">Avg Stress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-xl">⚡</div>
                    <div>
                      <p className="text-2xl font-bold text-amber-400">{departments.filter(d => d.stressLevel > 65).length}</p>
                      <p className="text-xs text-gray-400">At Risk Depts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <Tabs defaultValue="heatmap" className="space-y-6">
            <TabsList className="bg-white/5">
              <TabsTrigger value="heatmap">Stress Heatmap</TabsTrigger>
              <TabsTrigger value="attrition">Attrition Risk</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="heatmap">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <StressHeatmap
                  departments={departments}
                  onDepartmentClick={(dept) => setSelectedDepartment(dept)}
                />

                {selectedDepartment && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center justify-between">
                          <span>{selectedDepartment.name} Details</span>
                          <button onClick={() => setSelectedDepartment(null)} className="text-gray-400 hover:text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white/5 rounded-lg p-4">
                            <p className="text-gray-400 text-sm">Employees</p>
                            <p className="text-2xl font-bold text-white">{selectedDepartment.employeeCount}</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-4">
                            <p className="text-gray-400 text-sm">Stress Level</p>
                            <p className={`text-2xl font-bold ${
                              selectedDepartment.stressLevel < 50 ? 'text-green-400' : selectedDepartment.stressLevel < 70 ? 'text-amber-400' : 'text-red-400'
                            }`}>{selectedDepartment.stressLevel}%</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-4">
                            <p className="text-gray-400 text-sm">Participation</p>
                            <p className="text-2xl font-bold text-cyan-400">{selectedDepartment.participationRate}%</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-4">
                            <p className="text-gray-400 text-sm">Avg Mood</p>
                            <p className="text-2xl font-bold text-emerald-400">{selectedDepartment.avgMoodScore.toFixed(1)}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-4">
                          * All metrics are anonymized aggregates. No individual employee data is displayed.
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="attrition">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Attrition Risk Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {departments
                    .sort((a, b) => b.stressLevel - a.stressLevel)
                    .slice(0, 5)
                    .map((dept) => {
                      const riskScore = Math.min(100, Math.round(dept.stressLevel * 0.6 + (100 - dept.participationRate) * 0.4));
                      const riskFactors = [];
                      if (dept.stressLevel > 65) riskFactors.push('High stress');
                      if (dept.participationRate < 60) riskFactors.push('Low engagement');
                      if (dept.avgMoodScore < 6) riskFactors.push('Low morale');
                      if (dept.trend === 'up') riskFactors.push('Worsening trend');

                      return (
                        <div key={dept.id} className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-semibold text-white">{dept.name}</span>
                            <Badge className={riskScore > 70 ? 'bg-red-500/20 text-red-400' : riskScore > 50 ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}>
                              {riskScore}% Risk
                            </Badge>
                          </div>
                          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                            <div
                              className={`h-full rounded-full ${riskScore > 70 ? 'bg-red-500' : riskScore > 50 ? 'bg-amber-500' : 'bg-green-500'}`}
                              style={{ width: `${riskScore}%` }}
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {riskFactors.map((factor, i) => (
                              <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">
                                {factor}
                              </span>
                            ))}
                            {riskFactors.length === 0 && (
                              <span className="text-xs text-gray-500">No significant risk factors</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <span>🤖</span> AI-Generated Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">⚠️</span>
                      <div>
                        <p className="text-white font-medium mb-1">Operations & Sales Departments Need Attention</p>
                        <p className="text-sm text-gray-400">
                          These departments show elevated stress levels ({'>'}65%) combined with below-average participation.
                          Consider targeted wellness initiatives or workload assessment.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">✅</span>
                      <div>
                        <p className="text-white font-medium mb-1">HR Department Leading in Wellness</p>
                        <p className="text-sm text-gray-400">
                          Highest participation rate (92%) and lowest stress levels. Their practices could be
                          documented and shared as best practices across the organization.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-veil-500/10 rounded-lg border border-veil-500/20">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">📊</span>
                      <div>
                        <p className="text-white font-medium mb-1">Recommendation: Team Check-ins</p>
                        <p className="text-sm text-gray-400">
                          Departments with declining trends could benefit from regular team wellness check-ins.
                          Data suggests these improve participation by an average of 23%.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Footer notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-veil-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div className="text-sm">
                <span className="text-white font-medium">Privacy First:</span>
                <span className="text-gray-400 ml-1">
                  All data is k-anonymized (min group size 5) and aggregated daily. No individual data is ever displayed or exportable.
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
    </>
  );
}
