'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CaseBriefCard } from '@/components/clinical/case-brief-card';
import {
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Brain,
  Shield,
  Activity,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Stethoscope,
  Settings,
} from 'lucide-react';
import Link from 'next/link';

interface Escalation {
  id: string;
  status: string;
  trigger: string;
  riskScore: number;
  createdAt: string;
  userAnonymousId: string;
  hasConsent: boolean;
}

interface ClinicalData {
  profile: { isVerified: boolean; currentCaseload: number; maxCaseload: number };
  pendingCases: Escalation[];
  activeCases: Escalation[];
  resolvedCount: number;
}

interface BriefData {
  brief: any;
  hasConsent: boolean;
  escalationId: string;
  generatedAt: string;
}

export default function ClinicalDashboardPage() {
  const [data, setData] = useState<ClinicalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [briefData, setBriefData] = useState<BriefData | null>(null);
  const [generatingBrief, setGeneratingBrief] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch('/api/clinical/dashboard');
      const json = await res.json();
      if (json.success) setData(json.data);
    } finally {
      setLoading(false);
    }
  }

  const generateBrief = useCallback(async (escalationId: string) => {
    setGeneratingBrief(true);
    setSelectedCase(escalationId);
    setBriefData(null);

    try {
      const res = await fetch('/api/clinical/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escalationId }),
      });
      const json = await res.json();
      if (json.success) {
        setBriefData(json.data);
      }
    } catch (error) {
      console.error('Failed to generate brief:', error);
    } finally {
      setGeneratingBrief(false);
    }
  }, []);

  async function acceptCase(escalationId: string) {
    try {
      await fetch('/api/clinical/cases/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escalationId }),
      });
      fetchData();
    } catch (error) {
      console.error('Failed to accept case:', error);
    }
  }

  async function resolveCase(escalationId: string) {
    try {
      await fetch('/api/clinical/cases/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escalationId }),
      });
      fetchData();
    } catch (error) {
      console.error('Failed to resolve case:', error);
    }
  }

  function addNotes(escalationId: string) {
    // For now, show alert - could open a modal in future
    alert(`Add notes for case ${escalationId.slice(0, 8)}... (Feature coming soon)`);
  }

  const statusConfig: Record<string, { color: string; bg: string }> = {
    PENDING: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    AI_TWIN_REVIEW: { color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    THERAPIST_ASSIGNED: { color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    IN_PROGRESS: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    RESOLVED: { color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20' },
  };

  const getRiskBadge = (score: number) => {
    if (score >= 80) return { label: 'Critical', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
    if (score >= 60) return { label: 'High', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
    if (score >= 40) return { label: 'Moderate', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    return { label: 'Low', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        >
          <Brain className="w-8 h-8 text-veil-400" />
        </motion.div>
      </main>
    );
  }

  // Brief View
  if (selectedCase) {
    return (
      <>
        
        <main className="min-h-screen bg-[#0a0a12] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 right-1/4 w-64 h-64 bg-cyan-600/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedCase(null);
                setBriefData(null);
              }}
              className="text-gray-400 hover:text-white mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>

            {generatingBrief ? (
              <div className="text-center py-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  className="inline-block mb-4"
                >
                  <Brain className="w-12 h-12 text-cyan-400" />
                </motion.div>
                <h3 className="text-lg font-medium text-white mb-2">AI Twin Analyzing</h3>
                <p className="text-sm text-gray-400">
                  Generating case brief from mood data, journal patterns, and escalation history...
                </p>
                <div className="mt-6 flex items-center justify-center gap-2">
                  {['Mood Data', 'Journal Patterns', 'Chat Analysis', 'Risk Factors'].map(
                    (step, i) => (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0.3 }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          repeat: Infinity,
                          duration: 2,
                          delay: i * 0.5,
                        }}
                      >
                        <Badge
                          variant="outline"
                          className="text-xs text-gray-400 border-white/10"
                        >
                          {step}
                        </Badge>
                      </motion.div>
                    )
                  )}
                </div>
              </div>
            ) : briefData ? (
              <CaseBriefCard
                brief={briefData.brief}
                hasConsent={briefData.hasConsent}
                generatedAt={briefData.generatedAt}
                onClose={() => {
                  setSelectedCase(null);
                  setBriefData(null);
                }}
              />
            ) : (
              <div className="text-center py-20">
                <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <p className="text-gray-400">Failed to generate brief. Please try again.</p>
                <Button
                  onClick={() => generateBrief(selectedCase)}
                  className="mt-4"
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      </>
    );
  }

  // Main Dashboard
  return (
    <>
      
      <main className="min-h-screen bg-[#0a0a12] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-600/3 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-veil-600/3 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                <Stethoscope className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Clinical Dashboard</h1>
                <p className="text-gray-400 text-sm">
                  Manage escalations and AI-generated case briefs
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {data?.profile && !data.profile.isVerified && (
                <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Verification Pending
                </Badge>
              )}
              <Link href="/clinical/profile">
                <Button variant="outline" size="sm" className="border-white/10 text-gray-300 hover:text-white">
                  <Settings className="w-4 h-4 mr-2" />
                  My Profile
                </Button>
              </Link>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                icon: Clock,
                color: 'text-amber-400',
                bg: 'from-amber-500/10 to-amber-500/5',
                value: data?.pendingCases?.length || 0,
                label: 'Pending Cases',
              },
              {
                icon: Users,
                color: 'text-veil-400',
                bg: 'from-veil-500/10 to-veil-500/5',
                value: data?.activeCases?.length || 0,
                label: 'Active Cases',
              },
              {
                icon: CheckCircle,
                color: 'text-emerald-400',
                bg: 'from-emerald-500/10 to-emerald-500/5',
                value: data?.resolvedCount || 0,
                label: 'Resolved',
              },
              {
                icon: Activity,
                color: 'text-cyan-400',
                bg: 'from-cyan-500/10 to-cyan-500/5',
                value: `${data?.profile?.currentCaseload || 0}/${data?.profile?.maxCaseload || 20}`,
                label: 'Caseload',
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-all">
                    <CardContent className="p-4">
                      <Icon className={`w-5 h-5 ${stat.color} mb-2`} />
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-gray-400">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="pending" className="data-[state=active]:bg-white/10">
                Pending
                {(data?.pendingCases?.length || 0) > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-400">
                    {data?.pendingCases?.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-white/10">
                Active Cases
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <div className="space-y-4">
                {data?.pendingCases?.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="p-12 text-center">
                        <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                        <p className="text-gray-300 font-medium">All clear</p>
                        <p className="text-sm text-gray-500 mt-1">
                          No pending escalations at this time.
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  data?.pendingCases?.map((c, i) => {
                    const risk = getRiskBadge(c.riskScore);
                    const status = statusConfig[c.status] || statusConfig.PENDING;

                    return (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-all">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-400" />
                                <CardTitle className="text-base text-white">
                                  Case #{c.id.slice(-6)}
                                </CardTitle>
                                <Badge className={`${status.bg} ${status.color} border text-xs`}>
                                  {c.status.replace(/_/g, ' ')}
                                </Badge>
                              </div>
                              <Badge className={`${risk.color} border text-xs`}>
                                Risk: {risk.label}
                              </Badge>
                            </div>
                            <CardDescription className="flex items-center gap-4 mt-2">
                              <span>Trigger: {c.trigger.replace(/_/g, ' ')}</span>
                              <span>Score: {c.riskScore?.toFixed(0)}%</span>
                              <span>
                                {new Date(c.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Shield className="w-3.5 h-3.5" />
                                {c.hasConsent
                                  ? 'Consent granted for de-anonymization'
                                  : 'Anonymized - consent not granted'}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => generateBrief(c.id)}
                                  className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                                >
                                  <Brain className="w-3.5 h-3.5 mr-1.5" />
                                  AI Brief
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => acceptCase(c.id)}
                                  className="bg-gradient-to-r from-veil-600 to-veil-500 hover:from-veil-500 hover:to-veil-400"
                                >
                                  Accept Case
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </TabsContent>

            <TabsContent value="active">
              <div className="space-y-4">
                {data?.activeCases?.length === 0 ? (
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-12 text-center">
                      <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No active cases.</p>
                    </CardContent>
                  </Card>
                ) : (
                  data?.activeCases?.map((c, i) => {
                    const risk = getRiskBadge(c.riskScore);
                    const status = statusConfig[c.status] || statusConfig.IN_PROGRESS;

                    return (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card className="bg-white/5 border-white/10">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <CardTitle className="text-base text-white">
                                  Case #{c.id.slice(-6)}
                                </CardTitle>
                                <Badge className={`${status.bg} ${status.color} border text-xs`}>
                                  {c.status.replace(/_/g, ' ')}
                                </Badge>
                              </div>
                              <Badge className={`${risk.color} border text-xs`}>
                                Risk: {risk.label}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => generateBrief(c.id)}
                                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                              >
                                <Brain className="w-3.5 h-3.5 mr-1.5" />
                                View Brief
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addNotes(c.id)}
                              >
                                <FileText className="w-3.5 h-3.5 mr-1.5" />
                                Add Notes
                              </Button>
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-500"
                                onClick={() => resolveCase(c.id)}
                              >
                                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                Mark Resolved
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </main>
    </>
  );
}
