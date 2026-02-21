'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { JournalEditor } from '@/components/journal/journal-editor';
import { AdaptivePrompt } from '@/components/journal/adaptive-prompt';
import {
  BookOpen,
  Save,
  Clock,
  FileText,
  TrendingUp,
  Scroll,
  ChevronRight,
  Pen,
  X,
} from 'lucide-react';
import Link from 'next/link';

interface JournalPrompt {
  id: string;
  text: string;
  category: string;
}

interface RecentEntry {
  id: string;
  title: string;
  wordCount: number;
  sentimentLabel: string;
  createdAt: string;
}

const sentimentColors: Record<string, string> = {
  positive: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  negative: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  neutral: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  mixed: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

export default function JournalPage() {
  const [title, setTitle] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [textContent, setTextContent] = useState('');
  const [prompt, setPrompt] = useState<JournalPrompt | null>(null);
  const [loadingPrompt, setLoadingPrompt] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [recentEntries, setRecentEntries] = useState<RecentEntry[]>([]);
  const [showTitleInput, setShowTitleInput] = useState(false);

  useEffect(() => {
    fetchPrompt();
    fetchRecent();
  }, []);

  const fetchPrompt = useCallback(async () => {
    setLoadingPrompt(true);
    try {
      const res = await fetch('/api/journal/prompt');
      const json = await res.json();
      if (json.success) setPrompt(json.data);
    } finally {
      setLoadingPrompt(false);
    }
  }, []);

  const fetchRecent = useCallback(async () => {
    try {
      const res = await fetch('/api/journal?limit=5');
      const json = await res.json();
      if (json.success) setRecentEntries(json.data);
    } catch {}
  }, []);

  const handleContentChange = useCallback((html: string, text: string) => {
    setHtmlContent(html);
    setTextContent(text);
    setSaved(false);
  }, []);

  const handleUsePrompt = useCallback((text: string) => {
    // Insert prompt as a blockquote at the start
    setHtmlContent(`<blockquote><p><em>${text}</em></p></blockquote><p></p>`);
  }, []);

  async function handleSubmit() {
    if (!textContent.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || undefined,
          content: textContent,
          htmlContent,
          promptId: prompt?.id,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSaved(true);
        setTitle('');
        setHtmlContent('');
        setTextContent('');
        setShowTitleInput(false);
        fetchRecent();
        fetchPrompt();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save journal:', error);
    } finally {
      setSubmitting(false);
    }
  }

  const wordCount = textContent.split(/\s+/).filter(Boolean).length;

  return (
    <>
      
      <main className="min-h-screen bg-midnight-950 relative overflow-hidden">
        {/* Modern animated background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <div className="aurora" />
        </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 shadow-lg shadow-amber-500/10">
              <Pen className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Journal</h1>
              <p className="text-gray-400 text-sm">
                Pour your thoughts onto the page. The Oracle listens.
              </p>
            </div>
          </div>
          <Link href="/journal/history">
            <Button
              variant="outline"
              size="sm"
              className="glass-interactive border-white/20 hover:border-white/30"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              All Entries
            </Button>
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Writing Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Adaptive Prompt */}
            <AdaptivePrompt
              prompt={prompt}
              loading={loadingPrompt}
              onRefresh={fetchPrompt}
              onUsePrompt={handleUsePrompt}
            />

            {/* Title Toggle */}
            <AnimatePresence>
              {showTitleInput ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Entry title (optional)"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-white/5 border-white/10 text-lg font-medium"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowTitleInput(false);
                        setTitle('');
                      }}
                      className="text-gray-400"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setShowTitleInput(true)}
                  className="text-sm text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Add a title
                </motion.button>
              )}
            </AnimatePresence>

            {/* Tiptap Rich Editor */}
            <JournalEditor
              content={htmlContent}
              onContentChange={handleContentChange}
              placeholder={
                prompt?.text
                  ? `Reflect on: "${prompt.text}"`
                  : 'Begin writing... let your thoughts flow freely.'
              }
              autoFocus={!prompt}
            />

            {/* Action Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {prompt && (
                  <span className="flex items-center gap-1">
                    <Scroll className="w-3.5 h-3.5" />
                    Guided by Oracle
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <AnimatePresence>
                  {saved && (
                    <motion.span
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-emerald-400"
                    >
                      Entry saved
                    </motion.span>
                  )}
                </AnimatePresence>

                <Button
                  onClick={handleSubmit}
                  disabled={!textContent.trim() || submitting}
                  className="bg-gradient-to-r from-veil-600 to-veil-500 hover:from-veil-500 hover:to-veil-400 text-white px-6"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      >
                        <Save className="w-4 h-4" />
                      </motion.div>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Entry
                    </span>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Writing Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="glass-card rounded-2xl p-5">
                <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  Session Stats
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                    <p className="text-3xl font-bold text-white">{wordCount}</p>
                    <p className="text-xs text-gray-400">Words</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                    <p className="text-3xl font-bold text-white">{recentEntries.length}</p>
                    <p className="text-xs text-gray-400">Recent</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recent Entries */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Recent Entries
                </h3>
              </div>

              {recentEntries.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <Scroll className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No entries yet.</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Start writing to build your journal
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentEntries.map((entry, i) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                    >
                      <Link href={`/journal/${entry.id}`}>
                        <div className="glass-interactive rounded-xl p-3 cursor-pointer group">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-white truncate">
                                {entry.title || 'Untitled Entry'}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">
                                  {new Date(entry.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                                {entry.wordCount > 0 && (
                                  <span className="text-xs text-gray-600">
                                    {entry.wordCount}w
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {entry.sentimentLabel && (
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] ${
                                    sentimentColors[entry.sentimentLabel] || sentimentColors.neutral
                                  }`}
                                >
                                  {entry.sentimentLabel}
                                </Badge>
                              )}
                              <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 transition-colors" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}

                  <Link href="/journal/history">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-gray-500 hover:text-gray-300 mt-2"
                    >
                      View all entries
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Mirror Scroll Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-veil-900/30 to-purple-900/20 border-veil-500/20 overflow-hidden relative">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-veil-500/10 rounded-full blur-2xl" />
                </div>
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Scroll className="w-4 h-4 text-veil-400" />
                    <span className="text-sm font-medium text-veil-300">Mirror Scroll</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Weekly AI-generated summaries of your journal patterns, themes, and emotional
                    trajectory. Written in the Oracle's voice.
                  </p>
                  <Link href="/journal/summaries">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-veil-400 hover:text-veil-300 mt-2 p-0 h-auto"
                    >
                      View Scrolls
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}
