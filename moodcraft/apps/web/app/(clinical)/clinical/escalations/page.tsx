'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  Phone,
  MessageCircle,
  Brain,
  ChevronRight,
  Bell,
} from 'lucide-react';

interface Escalation {
  id: string;
  patientId: string;
  trigger: string;
  riskScore: number;
  status: 'PENDING' | 'REVIEWING' | 'RESOLVED';
  createdAt: string;
  triggerType: 'KEYWORD' | 'PHQ9' | 'GAD7' | 'AVOIDANCE';
}

export default function EscalationsPage() {
  const { toast } = useToast();
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);

  const handlePhone = (patientId: string) => {
    toast({
      title: 'Initiating call',
      description: `Starting emergency call with ${patientId}`,
    });
  };

  const handleReview = (escalation: Escalation) => {
    toast({
      title: 'Opening review',
      description: `Reviewing escalation for ${escalation.patientId}`,
    });
    // Update status to reviewing
    setEscalations(escalations.map(e =>
      e.id === escalation.id ? { ...e, status: 'REVIEWING' as const } : e
    ));
  };

  useEffect(() => {
    // Simulated data
    setEscalations([
      {
        id: '1',
        patientId: 'P-7829',
        trigger: 'Risk keywords detected in companion chat',
        riskScore: 85,
        status: 'PENDING',
        createdAt: '2 hours ago',
        triggerType: 'KEYWORD',
      },
      {
        id: '2',
        patientId: 'P-4521',
        trigger: 'PHQ-9 score exceeded threshold (18/27)',
        riskScore: 72,
        status: 'REVIEWING',
        createdAt: '1 day ago',
        triggerType: 'PHQ9',
      },
      {
        id: '3',
        patientId: 'P-3345',
        trigger: 'GAD-7 score elevated (16/21)',
        riskScore: 64,
        status: 'RESOLVED',
        createdAt: '3 days ago',
        triggerType: 'GAD7',
      },
      {
        id: '4',
        patientId: 'P-9012',
        trigger: '7+ days of ritual avoidance',
        riskScore: 45,
        status: 'PENDING',
        createdAt: '5 hours ago',
        triggerType: 'AVOIDANCE',
      },
    ]);
    setLoading(false);
  }, []);

  const triggerIcons = {
    KEYWORD: <MessageCircle className="w-5 h-5" />,
    PHQ9: <Brain className="w-5 h-5" />,
    GAD7: <Brain className="w-5 h-5" />,
    AVOIDANCE: <Clock className="w-5 h-5" />,
  };

  const statusConfig = {
    PENDING: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: AlertTriangle },
    REVIEWING: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Clock },
    RESOLVED: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle },
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="oracle-spinner" />
      </main>
    );
  }

  const pendingCount = escalations.filter((e) => e.status === 'PENDING').length;

  return (
    <main className="min-h-screen bg-[#0a0a12] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <AlertTriangle className="w-7 h-7 text-red-400" />
                Escalations
              </h1>
              <p className="text-gray-400 mt-1">Review and respond to patient risk alerts</p>
            </div>
            {pendingCount > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
                <Bell className="w-3.5 h-3.5 mr-1" />
                {pendingCount} Pending
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Pending', count: escalations.filter((e) => e.status === 'PENDING').length, color: 'red' },
              { label: 'Reviewing', count: escalations.filter((e) => e.status === 'REVIEWING').length, color: 'amber' },
              { label: 'Resolved', count: escalations.filter((e) => e.status === 'RESOLVED').length, color: 'emerald' },
            ].map((stat) => (
              <Card key={stat.label} className={`bg-${stat.color}-500/5 border-${stat.color}-500/20 p-4`}>
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.count}</p>
              </Card>
            ))}
          </div>

          {/* Escalations List */}
          <div className="space-y-4">
            {escalations.map((e, i) => {
              const StatusIcon = statusConfig[e.status].icon;
              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className={`bg-white/[0.02] border-white/10 p-5 hover:bg-white/[0.04] transition-all ${e.status === 'PENDING' ? 'border-l-4 border-l-red-500' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${e.riskScore >= 70 ? 'bg-red-500/10 text-red-400' : e.riskScore >= 50 ? 'bg-amber-500/10 text-amber-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                          {triggerIcons[e.triggerType]}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-white">{e.patientId}</h3>
                            <Badge className={statusConfig[e.status].color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {e.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">{e.trigger}</p>
                          <p className="text-xs text-gray-600 mt-1">{e.createdAt}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-400">Risk</div>
                          <div className={`text-xl font-bold ${e.riskScore >= 70 ? 'text-red-400' : e.riskScore >= 50 ? 'text-amber-400' : 'text-cyan-400'}`}>
                            {e.riskScore}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="border-white/10" onClick={() => handlePhone(e.patientId)}>
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500" onClick={() => handleReview(e)}>
                            Review
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
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
