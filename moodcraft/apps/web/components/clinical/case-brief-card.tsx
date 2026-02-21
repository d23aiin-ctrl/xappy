'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Brain,
  Heart,
  TrendingUp,
  Shield,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';

interface CaseBrief {
  summary: string;
  presentingConcerns: string[];
  riskAssessment: {
    level: string;
    score: number;
    factors: string[];
  };
  emotionalPatterns: {
    dominantEmotions: string[];
    moodTrajectory: string;
    sentimentTrend: string;
  };
  behavioralIndicators: string[];
  recommendedApproach: string[];
  timelineEvents: { date: string; event: string; significance: string }[];
  additionalNotes: string;
}

interface CaseBriefCardProps {
  brief: CaseBrief;
  hasConsent: boolean;
  generatedAt: string;
  onClose?: () => void;
}

const riskColors: Record<string, { bg: string; text: string; border: string }> = {
  low: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  moderate: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  critical: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
};

const trendIcons: Record<string, string> = {
  improving: 'text-emerald-400',
  declining: 'text-red-400',
  stable: 'text-gray-400',
  fluctuating: 'text-amber-400',
};

export function CaseBriefCard({ brief, hasConsent, generatedAt, onClose }: CaseBriefCardProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    concerns: true,
    risk: true,
    patterns: false,
    behavior: false,
    approach: true,
    timeline: false,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const riskStyle = riskColors[brief.riskAssessment.level] || riskColors.moderate;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
            <Brain className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Twin Case Brief</h3>
            <p className="text-xs text-gray-500">
              Generated {new Date(generatedAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasConsent ? (
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Shield className="w-3 h-3 mr-1" />
              Consented
            </Badge>
          ) : (
            <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Shield className="w-3 h-3 mr-1" />
              Anonymized
            </Badge>
          )}
        </div>
      </div>

      {/* Summary */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <p className="text-sm text-gray-300 leading-relaxed">{brief.summary}</p>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card className={`${riskStyle.bg} ${riskStyle.border} border`}>
        <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('risk')}>
          <div className="flex items-center justify-between">
            <CardTitle className={`text-sm font-medium flex items-center gap-2 ${riskStyle.text}`}>
              <AlertTriangle className="w-4 h-4" />
              Risk Assessment - {brief.riskAssessment.level.toUpperCase()}
              <span className="text-xs opacity-70">({brief.riskAssessment.score}/100)</span>
            </CardTitle>
            {expandedSections.risk ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          </div>
        </CardHeader>
        {expandedSections.risk && (
          <CardContent className="pt-0">
            <div className="mb-3">
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    brief.riskAssessment.score >= 80
                      ? 'bg-red-500'
                      : brief.riskAssessment.score >= 60
                      ? 'bg-orange-500'
                      : brief.riskAssessment.score >= 40
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${brief.riskAssessment.score}%` }}
                />
              </div>
            </div>
            <ul className="space-y-1">
              {brief.riskAssessment.factors.map((factor, i) => (
                <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                  <span className={`mt-1 w-1.5 h-1.5 rounded-full ${riskStyle.text} bg-current shrink-0`} />
                  {factor}
                </li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>

      {/* Presenting Concerns */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('concerns')}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-veil-400" />
              Presenting Concerns
            </CardTitle>
            {expandedSections.concerns ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          </div>
        </CardHeader>
        {expandedSections.concerns && (
          <CardContent className="pt-0">
            <ul className="space-y-2">
              {brief.presentingConcerns.map((concern, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-veil-400 mt-0.5">-</span>
                  {concern}
                </li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>

      {/* Emotional Patterns */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('patterns')}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              Emotional Patterns
            </CardTitle>
            {expandedSections.patterns ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          </div>
        </CardHeader>
        {expandedSections.patterns && (
          <CardContent className="pt-0 space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Dominant Emotions</p>
              <div className="flex flex-wrap gap-1.5">
                {brief.emotionalPatterns.dominantEmotions.map((emotion) => (
                  <Badge key={emotion} variant="outline" className="text-xs">
                    {emotion}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Mood Trajectory</p>
              <p className="text-sm text-gray-300">{brief.emotionalPatterns.moodTrajectory}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">Sentiment Trend:</p>
              <span className={`text-xs font-medium ${trendIcons[brief.emotionalPatterns.sentimentTrend] || 'text-gray-400'}`}>
                {brief.emotionalPatterns.sentimentTrend}
              </span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Behavioral Indicators */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('behavior')}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Behavioral Indicators
            </CardTitle>
            {expandedSections.behavior ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          </div>
        </CardHeader>
        {expandedSections.behavior && (
          <CardContent className="pt-0">
            <ul className="space-y-1.5">
              {brief.behavioralIndicators.map((indicator, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">-</span>
                  {indicator}
                </li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>

      {/* Recommended Approach */}
      <Card className="bg-gradient-to-br from-veil-900/20 to-purple-900/10 border-veil-500/20">
        <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('approach')}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-veil-300 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Recommended Approach
            </CardTitle>
            {expandedSections.approach ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          </div>
        </CardHeader>
        {expandedSections.approach && (
          <CardContent className="pt-0">
            <ol className="space-y-2">
              {brief.recommendedApproach.map((approach, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-veil-400 font-mono text-xs mt-0.5">{i + 1}.</span>
                  {approach}
                </li>
              ))}
            </ol>
          </CardContent>
        )}
      </Card>

      {/* Timeline */}
      {brief.timelineEvents.length > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('timeline')}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                Event Timeline
              </CardTitle>
              {expandedSections.timeline ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
            </div>
          </CardHeader>
          {expandedSections.timeline && (
            <CardContent className="pt-0">
              <div className="space-y-3">
                {brief.timelineEvents.map((event, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-veil-400" />
                      {i < brief.timelineEvents.length - 1 && (
                        <div className="w-px h-8 bg-white/10" />
                      )}
                    </div>
                    <div className="flex-1 -mt-1">
                      <p className="text-xs text-gray-500">{event.date}</p>
                      <p className="text-sm text-gray-300">{event.event}</p>
                      <p className="text-xs text-gray-500 italic">{event.significance}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Additional Notes */}
      {brief.additionalNotes && (
        <div className="px-4 py-3 bg-white/[0.02] rounded-lg border border-white/5">
          <p className="text-xs text-gray-500 italic">{brief.additionalNotes}</p>
        </div>
      )}
    </motion.div>
  );
}
