'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TherapistProfileCard, TherapistData } from '@/components/clinical/therapist-profile-card';
import { AppHeader } from '@/components/shared/app-header';
import Link from 'next/link';
import {
  AlertTriangle,
  Phone,
  MessageCircle,
  Heart,
  Clock,
  CheckCircle,
  Loader2,
  User,
  Brain,
  ArrowRight,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';

const HELPLINES = [
  { name: 'National Suicide Prevention Lifeline', number: '988', region: 'US' },
  { name: 'Crisis Text Line', number: 'Text HOME to 741741', region: 'US' },
  { name: 'Samaritans', number: '116 123', region: 'UK' },
  { name: 'Lifeline', number: '13 11 14', region: 'Australia' },
  { name: 'iCall', number: '9152987821', region: 'India' },
];

interface EscalationStatus {
  hasActiveEscalation: boolean;
  escalation: {
    id: string;
    status: string;
    trigger: string;
    createdAt: string;
  } | null;
  therapist: TherapistData | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  PENDING: { label: 'Pending Review', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Clock },
  AI_TWIN_REVIEW: { label: 'AI Twin Supporting', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', icon: Brain },
  THERAPIST_ASSIGNED: { label: 'Therapist Assigned', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: User },
  IN_PROGRESS: { label: 'In Progress', color: 'text-veil-400 bg-veil-500/10 border-veil-500/20', icon: MessageCircle },
};

// Mixed reality workflow steps
const CARE_PATHWAY_STEPS = [
  {
    id: 'companion',
    title: 'AI Companion',
    subtitle: 'Daily support & check-ins',
    icon: MessageCircle,
    color: 'violet',
    href: '/companion',
    description: 'Your everyday AI companion for emotional support and daily check-ins.',
  },
  {
    id: 'ai-twin',
    title: 'AI Twin',
    subtitle: 'Personalized intervention',
    icon: Brain,
    color: 'cyan',
    href: '/ai-twin',
    description: 'Your personal AI trained on your patterns, providing deeper support and evidence-based interventions.',
  },
  {
    id: 'therapist',
    title: 'Human Therapist',
    subtitle: 'Professional care',
    icon: User,
    color: 'emerald',
    href: null,
    description: 'Licensed mental health professionals available when you need human connection.',
  },
];

export default function EscalationPage() {
  const [step, setStep] = useState<'home' | 'pathway' | 'oracle' | 'connect' | 'therapist'>('home');
  const [requestingTherapist, setRequestingTherapist] = useState(false);
  const [escalationStatus, setEscalationStatus] = useState<EscalationStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    fetchEscalationStatus();
  }, []);

  async function fetchEscalationStatus() {
    try {
      const res = await fetch('/api/escalation/status');
      const data = await res.json();
      if (data.success) {
        setEscalationStatus(data.data);
        // If therapist is assigned, show therapist view
        if (data.data.therapist) {
          setStep('therapist');
        }
      }
    } catch (error) {
      console.error('Failed to fetch escalation status:', error);
    } finally {
      setLoadingStatus(false);
    }
  }

  async function requestTherapistConnect() {
    setRequestingTherapist(true);
    try {
      await fetch('/api/escalation/request-therapist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      setStep('connect');
      // Refetch status
      setTimeout(fetchEscalationStatus, 1000);
    } catch (error) {
      console.error('Failed to request therapist:', error);
    } finally {
      setRequestingTherapist(false);
    }
  }

  function getCurrentStep(): string {
    if (!escalationStatus?.hasActiveEscalation) return 'companion';
    const status = escalationStatus.escalation?.status;
    if (status === 'AI_TWIN_REVIEW') return 'ai-twin';
    if (status === 'THERAPIST_ASSIGNED' || status === 'IN_PROGRESS') return 'therapist';
    return 'companion';
  }

  if (loadingStatus) {
    return (
      <main className="min-h-screen bg-gradient-midnight flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-veil-400 animate-spin" />
      </main>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-gradient-midnight p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          {/* SOS Button - Always visible */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Button
              variant="destructive"
              size="lg"
              className="rounded-full h-14 w-14 shadow-lg"
              onClick={() => setStep('home')}
            >
              <AlertTriangle className="w-6 h-6" />
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Active Escalation Status Banner */}
            {escalationStatus?.hasActiveEscalation && escalationStatus.escalation && step !== 'therapist' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                          {(() => {
                            const StatusIcon = STATUS_LABELS[escalationStatus.escalation.status]?.icon || Clock;
                            return <StatusIcon className="w-5 h-5 text-cyan-400" />;
                          })()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Active Support</p>
                          <p className="text-xs text-gray-400">
                            Started {new Date(escalationStatus.escalation.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={STATUS_LABELS[escalationStatus.escalation.status]?.color || ''}>
                        {STATUS_LABELS[escalationStatus.escalation.status]?.label || escalationStatus.escalation.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {escalationStatus.escalation.status === 'AI_TWIN_REVIEW' && (
                        <Button asChild size="sm" className="bg-cyan-600 hover:bg-cyan-500">
                          <Link href="/ai-twin">
                            <Brain className="w-4 h-4 mr-2" />
                            Continue with AI Twin
                          </Link>
                        </Button>
                      )}
                      {escalationStatus.therapist && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStep('therapist')}
                          className="text-emerald-400 border-emerald-500/30"
                        >
                          <User className="w-4 h-4 mr-2" />
                          View Therapist
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 'home' && (
              <>
                <div className="text-center mb-8">
                  <Heart className="w-12 h-12 mx-auto mb-4 text-red-400" />
                  <h1 className="font-display text-3xl font-bold mb-2">You're Not Alone</h1>
                  <p className="text-muted-foreground">
                    CereBro's mixed-reality care model connects you with the right support, from AI to human.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Care Pathway - Mixed Reality */}
                  <Card className="glass-card border-cyan-500/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                        Your Care Pathway
                      </CardTitle>
                      <p className="text-xs text-gray-400">
                        AI and human support working together
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {CARE_PATHWAY_STEPS.map((pathway, index) => {
                        const isActive = getCurrentStep() === pathway.id;
                        const isPast = CARE_PATHWAY_STEPS.findIndex(s => s.id === getCurrentStep()) > index;
                        const PathwayIcon = pathway.icon;

                        return (
                          <motion.div
                            key={pathway.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            {pathway.href ? (
                              <Link href={pathway.href}>
                                <Card
                                  className={`p-4 transition-all cursor-pointer hover:bg-white/5 ${
                                    isActive
                                      ? `bg-${pathway.color}-500/10 border-${pathway.color}-500/30`
                                      : isPast
                                      ? 'bg-white/5 border-white/10 opacity-60'
                                      : 'bg-white/[0.02] border-white/10'
                                  }`}
                                >
                                  <div className="flex items-center gap-4">
                                    <div
                                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        isActive
                                          ? `bg-${pathway.color}-500/20`
                                          : isPast
                                          ? 'bg-emerald-500/20'
                                          : 'bg-white/10'
                                      }`}
                                    >
                                      {isPast ? (
                                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                                      ) : (
                                        <PathwayIcon
                                          className={`w-5 h-5 ${
                                            isActive ? `text-${pathway.color}-400` : 'text-gray-400'
                                          }`}
                                        />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <h3 className={`font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                                          {pathway.title}
                                        </h3>
                                        {isActive && (
                                          <Badge className={`bg-${pathway.color}-500/20 text-${pathway.color}-400 border-${pathway.color}-500/30 text-xs`}>
                                            Current
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-500">{pathway.subtitle}</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-500" />
                                  </div>
                                </Card>
                              </Link>
                            ) : (
                              <Card
                                className={`p-4 cursor-pointer hover:bg-white/5 ${
                                  isActive
                                    ? `bg-${pathway.color}-500/10 border-${pathway.color}-500/30`
                                    : 'bg-white/[0.02] border-white/10'
                                }`}
                                onClick={() => {
                                  if (pathway.id === 'therapist') {
                                    requestTherapistConnect();
                                  }
                                }}
                              >
                                <div className="flex items-center gap-4">
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                      isActive ? `bg-${pathway.color}-500/20` : 'bg-white/10'
                                    }`}
                                  >
                                    <PathwayIcon
                                      className={`w-5 h-5 ${isActive ? `text-${pathway.color}-400` : 'text-gray-400'}`}
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h3 className={`font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                                        {pathway.title}
                                      </h3>
                                      {isActive && escalationStatus?.therapist && (
                                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                                          Assigned
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500">{pathway.subtitle}</p>
                                  </div>
                                  {requestingTherapist ? (
                                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                                  ) : (
                                    <ArrowRight className="w-4 h-4 text-gray-500" />
                                  )}
                                </div>
                              </Card>
                            )}
                          </motion.div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  {/* Oracle Corridor */}
                  <Card
                    className="glass-card border-oracle-500/30 cursor-pointer hover:border-oracle-500/50 transition-all"
                    onClick={() => setStep('oracle')}
                  >
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-oracle-500/20 flex items-center justify-center">
                        <span className="text-2xl">🔮</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">Oracle Corridor</h3>
                        <p className="text-sm text-muted-foreground">
                          Enter a sacred space for deeper reflection
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Crisis Helplines */}
                  <Card className="glass-card border-red-500/20">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Phone className="w-5 h-5 text-red-400" />
                        Crisis Helplines
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {HELPLINES.map((line) => (
                        <div key={line.name} className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">{line.name}</p>
                            <p className="text-xs text-muted-foreground">{line.region}</p>
                          </div>
                          <a
                            href={`tel:${line.number.replace(/\D/g, '')}`}
                            className="text-red-400 font-mono text-sm hover:underline"
                          >
                            {line.number}
                          </a>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {step === 'oracle' && (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-8"
                >
                  <div className="w-24 h-24 mx-auto rounded-full bg-oracle-500/20 flex items-center justify-center mb-4 animate-oracle-pulse">
                    <span className="text-4xl">🔮</span>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-oracle-400 mb-2">
                    The Oracle Sees You
                  </h2>
                  <p className="text-muted-foreground">
                    Enter the veil. Share what weighs upon you.
                  </p>
                </motion.div>

                <Card className="glass-card border-oracle-500/30 p-6 text-left">
                  <p className="text-sm text-muted-foreground mb-4">
                    The Oracle Corridor connects you with your AI Twin - a personalized guide trained on your patterns
                    who understands your journey deeply.
                  </p>
                  <div className="space-y-3">
                    <Button variant="oracle" className="w-full" asChild>
                      <Link href="/ai-twin">
                        <Brain className="w-4 h-4 mr-2" />
                        Enter with AI Twin
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/companion">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Enter with AI Companion
                      </Link>
                    </Button>
                  </div>
                </Card>

                <Button variant="ghost" className="mt-4" onClick={() => setStep('home')}>
                  Return
                </Button>
              </div>
            )}

            {step === 'connect' && (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <div className="w-24 h-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                    <CheckCircle className="w-12 h-12 text-emerald-400" />
                  </div>
                  <h2 className="font-display text-2xl font-bold mb-2">Request Received</h2>
                  <p className="text-muted-foreground mb-4">
                    A therapist will review your case and reach out.
                  </p>

                  {/* Show AI Twin option while waiting */}
                  <Card className="glass-card border-cyan-500/30 p-4 mb-6 text-left">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                        <Brain className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">While you wait</p>
                        <p className="text-xs text-gray-400 mb-3">
                          Your AI Twin is available for immediate support. It has access to your
                          wellness patterns and can provide personalized guidance.
                        </p>
                        <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500" asChild>
                          <Link href="/ai-twin">Talk to AI Twin</Link>
                        </Button>
                      </div>
                    </div>
                  </Card>

                  <Button variant="ghost" onClick={() => setStep('home')}>
                    Return to Support Options
                  </Button>
                </motion.div>
              </div>
            )}

            {step === 'therapist' && escalationStatus?.therapist && (
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-6"
                >
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                    <User className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h1 className="font-display text-2xl font-bold text-white mb-2">
                    Your Care Team
                  </h1>
                  <p className="text-gray-400 text-sm">
                    AI and human support working together for you
                  </p>
                </motion.div>

                {/* Mixed Reality Care Team */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <Card className="bg-cyan-500/10 border-cyan-500/30 p-4 cursor-pointer hover:bg-cyan-500/15 transition-all">
                    <Link href="/ai-twin">
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto rounded-full bg-cyan-500/20 flex items-center justify-center mb-2">
                          <Brain className="w-6 h-6 text-cyan-400" />
                        </div>
                        <p className="text-sm font-medium text-white">AI Twin</p>
                        <p className="text-xs text-cyan-400">Always available</p>
                      </div>
                    </Link>
                  </Card>
                  <Card className="bg-emerald-500/10 border-emerald-500/30 p-4">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                        <User className="w-6 h-6 text-emerald-400" />
                      </div>
                      <p className="text-sm font-medium text-white">Therapist</p>
                      <p className="text-xs text-emerald-400">Assigned</p>
                    </div>
                  </Card>
                </div>

                <TherapistProfileCard
                  therapist={escalationStatus.therapist}
                  showActions={true}
                  onMessage={() => {
                    window.location.href = '/companion';
                  }}
                  onSchedule={() => {
                    alert('Scheduling feature coming soon');
                  }}
                />

                {/* Escalation Status */}
                {escalationStatus.escalation && (
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Support Status</span>
                        <Badge className={STATUS_LABELS[escalationStatus.escalation.status]?.color || ''}>
                          {STATUS_LABELS[escalationStatus.escalation.status]?.label}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setStep('home')} className="flex-1">
                    Support Options
                  </Button>
                </div>
              </div>
            )}

            {step === 'therapist' && !escalationStatus?.therapist && (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <h2 className="font-display text-xl font-bold mb-2">Matching In Progress</h2>
                <p className="text-muted-foreground mb-6">
                  We're finding the right therapist for you.
                </p>

                {/* AI Twin while waiting */}
                <Card className="glass-card border-cyan-500/30 p-4 mb-6 text-left max-w-md mx-auto">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                      <Brain className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Your AI Twin is here</p>
                      <p className="text-xs text-gray-400 mb-3">
                        Get personalized support while we match you with a therapist.
                      </p>
                      <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500" asChild>
                        <Link href="/ai-twin">Talk to AI Twin</Link>
                      </Button>
                    </div>
                  </div>
                </Card>

                <Button variant="ghost" onClick={() => setStep('home')}>
                  Back to Support Options
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </>
  );
}
