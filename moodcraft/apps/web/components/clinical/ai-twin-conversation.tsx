'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Brain,
  User,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send,
  Wind,
  Lightbulb,
  HandHeart,
  Shield,
  Activity,
  Heart,
  CheckCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react';

interface ConversationMessage {
  role: string;
  content: string;
  interventionType?: string;
  timestamp: string;
  riskFlagged?: boolean;
}

interface HandoffDocument {
  conversationSummary: string;
  keyExchanges: { userStatement: string; significance: string }[];
  interventionsUsed: string[];
  currentEmotionalState?: string;
  immediateRisks?: string[];
  userPreferences?: Record<string, string>;
  handoffReason: string;
  urgencyLevel: string;
}

interface AITwinConversationProps {
  escalationId: string;
  messages: ConversationMessage[];
  handoffDoc?: HandoffDocument;
  onFeedbackSubmit: (feedback: TherapistFeedbackData) => Promise<void>;
}

interface TherapistFeedbackData {
  aiTwinHelpful?: boolean;
  briefAccuracy?: number;
  missedFactors?: string[];
  recommendedFocus?: string[];
  contraindicated?: string[];
  therapeuticApproach?: string;
  sessionNotes?: string;
}

const interventionIcons: Record<string, typeof Heart> = {
  GROUNDING: Wind,
  REFRAME: Lightbulb,
  VALIDATION: HandHeart,
  CRISIS_SUPPORT: Shield,
  PSYCHOEDUCATION: Brain,
  COPING_SKILL: Activity,
};

const interventionColors: Record<string, string> = {
  GROUNDING: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  REFRAME: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  VALIDATION: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  CRISIS_SUPPORT: 'text-red-400 bg-red-500/10 border-red-500/20',
  PSYCHOEDUCATION: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  COPING_SKILL: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

const urgencyColors: Record<string, string> = {
  normal: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  urgent: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export function AITwinConversation({
  escalationId,
  messages,
  handoffDoc,
  onFeedbackSubmit,
}: AITwinConversationProps) {
  const [expanded, setExpanded] = useState(true);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState<TherapistFeedbackData>({});
  const [submitting, setSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleSubmitFeedback = async () => {
    setSubmitting(true);
    try {
      await onFeedbackSubmit(feedback);
      setFeedbackSubmitted(true);
      setShowFeedbackForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Count interventions used
  const interventionCounts = messages.reduce((acc, msg) => {
    if (msg.interventionType) {
      acc[msg.interventionType] = (acc[msg.interventionType] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="bg-white/5 border-white/10 overflow-hidden">
      {/* Header */}
      <CardHeader
        className="pb-3 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <CardTitle className="text-base font-medium text-white flex items-center gap-2">
                AI Twin Conversation
                <Badge variant="outline" className="text-xs text-gray-400">
                  {messages.length} messages
                </Badge>
              </CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                Full conversation history with intervention tracking
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {handoffDoc && (
              <Badge className={urgencyColors[handoffDoc.urgencyLevel] || urgencyColors.normal}>
                {handoffDoc.urgencyLevel.toUpperCase()}
              </Badge>
            )}
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-4">
          {/* Handoff Summary */}
          {handoffDoc && (
            <div className="p-4 bg-violet-500/10 rounded-xl border border-violet-500/20">
              <h4 className="text-sm font-medium text-violet-300 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Handoff Summary
              </h4>
              <p className="text-sm text-gray-300 mb-3">{handoffDoc.conversationSummary}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Reason for Handoff</p>
                  <p className="text-gray-300">{handoffDoc.handoffReason}</p>
                </div>
                {handoffDoc.currentEmotionalState && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Current Emotional State</p>
                    <p className="text-gray-300">{handoffDoc.currentEmotionalState}</p>
                  </div>
                )}
              </div>

              {handoffDoc.immediateRisks && handoffDoc.immediateRisks.length > 0 && (
                <div className="mt-3 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                  <p className="text-xs text-red-400 font-medium mb-1">Immediate Concerns</p>
                  <ul className="text-sm text-red-300 space-y-1">
                    {handoffDoc.immediateRisks.map((risk, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-red-400 rounded-full" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Interventions Used */}
          {Object.keys(interventionCounts).length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-gray-500 self-center">Interventions used:</span>
              {Object.entries(interventionCounts).map(([type, count]) => {
                const Icon = interventionIcons[type] || Heart;
                return (
                  <Badge key={type} className={interventionColors[type] || 'text-gray-400'}>
                    <Icon className="w-3 h-3 mr-1" />
                    {type.replace('_', ' ')} ({count})
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Conversation */}
          <ScrollArea className="h-80 pr-4">
            <div className="space-y-3">
              {messages.map((msg, i) => {
                const Icon = msg.interventionType ? interventionIcons[msg.interventionType] : null;
                const colorClass = msg.interventionType
                  ? interventionColors[msg.interventionType]
                  : '';

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
                        msg.role === 'user'
                          ? 'bg-gray-700 text-gray-400'
                          : 'bg-cyan-500/20 text-cyan-400'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Brain className="w-4 h-4" />
                      )}
                    </div>

                    <div
                      className={`max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}
                    >
                      {msg.interventionType && msg.role === 'assistant' && (
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] mb-1 border ${colorClass}`}>
                          {Icon && <Icon className="w-2.5 h-2.5" />}
                          {msg.interventionType.replace('_', ' ')}
                        </div>
                      )}

                      <div
                        className={`p-3 rounded-xl text-sm ${
                          msg.role === 'user'
                            ? 'bg-gray-700/50 text-gray-200 rounded-tr-sm'
                            : 'bg-white/5 text-gray-300 rounded-tl-sm'
                        } ${msg.riskFlagged ? 'border border-red-500/30' : ''}`}
                      >
                        {msg.content}
                      </div>

                      <p className="text-[10px] text-gray-600 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Therapist Feedback Section */}
          <div className="border-t border-white/10 pt-4">
            {feedbackSubmitted ? (
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Feedback submitted - AI Twin will adapt accordingly</span>
              </div>
            ) : showFeedbackForm ? (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-white flex items-center gap-2">
                  <Brain className="w-4 h-4 text-violet-400" />
                  Provide Guidance for AI Twin
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">
                      Was AI Twin's approach helpful?
                    </label>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={feedback.aiTwinHelpful === true ? 'default' : 'outline'}
                        onClick={() => setFeedback({ ...feedback, aiTwinHelpful: true })}
                        className={feedback.aiTwinHelpful === true ? 'bg-emerald-600' : ''}
                      >
                        Yes
                      </Button>
                      <Button
                        size="sm"
                        variant={feedback.aiTwinHelpful === false ? 'default' : 'outline'}
                        onClick={() => setFeedback({ ...feedback, aiTwinHelpful: false })}
                        className={feedback.aiTwinHelpful === false ? 'bg-amber-600' : ''}
                      >
                        Partially
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">
                      Brief accuracy (1-5)
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Button
                          key={n}
                          size="sm"
                          variant={feedback.briefAccuracy === n ? 'default' : 'outline'}
                          onClick={() => setFeedback({ ...feedback, briefAccuracy: n })}
                          className={`w-8 h-8 p-0 ${feedback.briefAccuracy === n ? 'bg-violet-600' : ''}`}
                        >
                          {n}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    Recommended therapeutic approach
                  </label>
                  <Textarea
                    value={feedback.therapeuticApproach || ''}
                    onChange={(e) =>
                      setFeedback({ ...feedback, therapeuticApproach: e.target.value })
                    }
                    placeholder="Describe the approach AI Twin should use with this patient..."
                    className="bg-white/5 border-white/10 text-sm h-20"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    Topics to AVOID (comma-separated)
                  </label>
                  <Textarea
                    value={feedback.contraindicated?.join(', ') || ''}
                    onChange={(e) =>
                      setFeedback({
                        ...feedback,
                        contraindicated: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Topics that may be triggering or counterproductive..."
                    className="bg-white/5 border-white/10 text-sm h-16"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFeedbackForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmitFeedback}
                    disabled={submitting}
                    className="bg-gradient-to-r from-violet-600 to-purple-600"
                  >
                    {submitting ? (
                      <Clock className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Submit Guidance
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFeedbackForm(true)}
                className="text-violet-400 border-violet-500/30 hover:bg-violet-500/10"
              >
                <Brain className="w-4 h-4 mr-2" />
                Provide Guidance for AI Twin
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
