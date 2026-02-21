'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VoiceRecorder } from '@/components/voice/voice-recorder';
import { Mic } from 'lucide-react';
import Link from 'next/link';

const MOOD_EMOJIS = [
  { emoji: '😢', label: 'Very Low', score: 1 },
  { emoji: '😔', label: 'Low', score: 3 },
  { emoji: '😐', label: 'Neutral', score: 5 },
  { emoji: '🙂', label: 'Good', score: 7 },
  { emoji: '😊', label: 'Great', score: 9 },
];

const NARRATIVE_QUESTIONS = [
  { id: 1, text: 'The things that once brought you joy—do they still spark that light?', phq9Index: 1 },
  { id: 2, text: 'When you look ahead, can you glimpse the horizon, or is it shrouded?', phq9Index: 2 },
  { id: 3, text: 'Does rest come easily, or does it elude you?', phq9Index: 3 },
  { id: 4, text: 'Your inner flame—does it burn bright, or flicker low?', phq9Index: 4 },
  { id: 5, text: 'Does your inner sentinel stand watch constantly?', gad7Index: 1 },
  { id: 6, text: 'Do worries circle like ravens, refusing to let your mind rest?', gad7Index: 2 },
];

export default function MoodMirrorPage() {
  const router = useRouter();
  const [step, setStep] = useState<'emoji' | 'questions' | 'reflection'>('emoji');
  const [selectedMood, setSelectedMood] = useState<typeof MOOD_EMOJIS[0] | null>(null);
  const [questionResponses, setQuestionResponses] = useState<Record<number, number>>({});
  const [reflection, setReflection] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  async function handleSubmit() {
    if (!selectedMood) return;
    setSubmitting(true);

    try {
      await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emoji: selectedMood.emoji,
          moodScore: selectedMood.score,
          reflection,
          narrativeResponses: questionResponses,
        }),
      });
      router.push('/mood-mirror/history');
    } catch (error) {
      console.error('Failed to save mood:', error);
      setSubmitting(false);
    }
  }

  return (
    <>
      
      <main className="min-h-screen bg-gradient-midnight p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold">Mood Mirror</h1>
              <p className="text-muted-foreground">How does your soul feel today?</p>
            </div>
            <Link href="/mood-mirror/history">
              <Button variant="outline" size="sm">View History</Button>
            </Link>
          </div>

          <Tabs value={step} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="emoji" onClick={() => setStep('emoji')}>Mood</TabsTrigger>
              <TabsTrigger value="questions" onClick={() => selectedMood && setStep('questions')}>Reflect</TabsTrigger>
              <TabsTrigger value="reflection" onClick={() => Object.keys(questionResponses).length > 0 && setStep('reflection')}>Write</TabsTrigger>
            </TabsList>

            <TabsContent value="emoji">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Select your mood</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center gap-4 mb-6">
                    {MOOD_EMOJIS.map((mood) => (
                      <button
                        key={mood.score}
                        onClick={() => setSelectedMood(mood)}
                        className={`text-4xl p-3 rounded-xl transition-all ${
                          selectedMood?.score === mood.score
                            ? 'bg-veil-500/20 scale-125 ring-2 ring-veil-500'
                            : 'hover:bg-white/5 hover:scale-110'
                        }`}
                      >
                        {mood.emoji}
                      </button>
                    ))}
                  </div>
                  {selectedMood && (
                    <p className="text-center text-muted-foreground mb-4">
                      Feeling: <span className="text-foreground">{selectedMood.label}</span>
                    </p>
                  )}
                  <Button
                    variant="veil"
                    className="w-full"
                    disabled={!selectedMood}
                    onClick={() => setStep('questions')}
                  >
                    Continue
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="questions">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">{NARRATIVE_QUESTIONS[currentQuestion]?.text}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {[0, 1, 2, 3].map((val) => (
                      <button
                        key={val}
                        onClick={() => {
                          setQuestionResponses({ ...questionResponses, [NARRATIVE_QUESTIONS[currentQuestion].id]: val });
                          if (currentQuestion < NARRATIVE_QUESTIONS.length - 1) {
                            setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
                          }
                        }}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          questionResponses[NARRATIVE_QUESTIONS[currentQuestion]?.id] === val
                            ? 'bg-veil-500/20 border-veil-500'
                            : 'bg-white/5 hover:bg-white/10'
                        } border border-white/10`}
                      >
                        {['Not at all', 'Several days', 'More than half', 'Nearly every day'][val]}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {currentQuestion > 0 && (
                      <Button variant="outline" onClick={() => setCurrentQuestion(currentQuestion - 1)}>
                        Back
                      </Button>
                    )}
                    {currentQuestion === NARRATIVE_QUESTIONS.length - 1 && (
                      <Button variant="veil" className="flex-1" onClick={() => setStep('reflection')}>
                        Continue to Reflection
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Question {currentQuestion + 1} of {NARRATIVE_QUESTIONS.length}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reflection">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Share your thoughts (optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative mb-4">
                    <Textarea
                      placeholder="What's on your mind today? This is your private space..."
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      className="min-h-[150px] bg-white/5 pr-12"
                    />
                    <div className="absolute bottom-3 right-3">
                      <VoiceRecorder
                        compact
                        maxDuration={120}
                        onTranscription={(text) => {
                          setReflection((prev) => (prev ? `${prev}\n\n${text}` : text));
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mic className="w-3 h-3" /> Voice-to-text available
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {reflection.length} characters
                    </span>
                  </div>
                  <Button
                    variant="veil"
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? <span className="oracle-spinner inline-block w-5 h-5" /> : 'Complete Check-in'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </main>
    </>
  );
}
