'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  FileText,
  Brain,
  Calendar,
  Download,
  Eye,
  Clock,
  TrendingUp,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface Brief {
  id: string;
  patientId: string;
  generatedAt: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  summary: string;
  hasConsent: boolean;
}

export default function AIBriefsPage() {
  const { toast } = useToast();
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const handleGenerateBrief = async () => {
    setGenerating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast({
        title: 'Brief generated',
        description: 'A new AI Twin brief has been created.',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = (briefId: string) => {
    toast({
      title: 'Exporting brief',
      description: 'Your brief is being prepared for download.',
    });
  };

  const handleViewBrief = (briefId: string) => {
    toast({
      title: 'Opening brief',
      description: 'Full brief view coming soon.',
    });
  };

  useEffect(() => {
    // Simulated data
    setBriefs([
      {
        id: '1',
        patientId: 'P-7829',
        generatedAt: '2024-01-25 14:30',
        riskLevel: 'high',
        summary: 'Patient shows elevated anxiety patterns with PHQ-9 score of 18. Recent journal entries indicate sleep disturbances and social withdrawal.',
        hasConsent: true,
      },
      {
        id: '2',
        patientId: 'P-4521',
        generatedAt: '2024-01-24 10:15',
        riskLevel: 'moderate',
        summary: 'Gradual improvement in mood scores over past 2 weeks. Consistent ritual adherence. Recommended continued CBT approach.',
        hasConsent: true,
      },
      {
        id: '3',
        patientId: 'P-9012',
        generatedAt: '2024-01-22 16:45',
        riskLevel: 'low',
        summary: 'Stable emotional patterns. Strong engagement with breathing exercises. No risk indicators detected.',
        hasConsent: false,
      },
    ]);
    setLoading(false);
  }, []);

  const riskColors = {
    low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    moderate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="oracle-spinner" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a12] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/3 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Brain className="w-7 h-7 text-violet-400" />
                AI Twin Briefs
              </h1>
              <p className="text-gray-400 mt-1">AI-generated clinical case summaries</p>
            </div>
            <Button className="bg-violet-600 hover:bg-violet-500" onClick={handleGenerateBrief} disabled={generating}>
              {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
              {generating ? 'Generating...' : 'Generate New Brief'}
            </Button>
          </div>

          {/* Info Card */}
          <Card className="bg-violet-500/5 border-violet-500/20 p-4 mb-8">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-violet-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-white">About AI Twin Briefs</h3>
                <p className="text-sm text-gray-400 mt-1">
                  AI Twin analyzes mood data, journal entries, companion chat patterns, and escalation history
                  to generate comprehensive case briefs. Briefs are anonymized unless patient consent is granted.
                </p>
              </div>
            </div>
          </Card>

          {/* Briefs List */}
          <div className="space-y-4">
            {briefs.map((brief, i) => (
              <motion.div
                key={brief.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-white/[0.02] border-white/10 p-6 hover:bg-white/[0.04] transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-violet-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-white">{brief.patientId}</h3>
                          <Badge className={riskColors[brief.riskLevel]}>
                            {brief.riskLevel.toUpperCase()} RISK
                          </Badge>
                          {!brief.hasConsent && (
                            <Badge variant="outline" className="text-gray-400 border-gray-600">
                              Anonymized
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          Generated {brief.generatedAt}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-300 mb-4 line-clamp-2">{brief.summary}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Mood Analysis
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        30-day window
                      </span>
                      {brief.riskLevel === 'high' || brief.riskLevel === 'critical' ? (
                        <span className="flex items-center gap-1 text-amber-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Requires attention
                        </span>
                      ) : null}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-white/10" onClick={() => handleExport(brief.id)}>
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                      <Button size="sm" className="bg-violet-600 hover:bg-violet-500" onClick={() => handleViewBrief(brief.id)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View Full Brief
                      </Button>
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
