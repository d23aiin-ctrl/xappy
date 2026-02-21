'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceRecorder } from '@/lib/hooks/use-voice-recorder';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2, Play, Pause, X, Check, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  maxDuration?: number;
  compact?: boolean;
  className?: string;
}

export function VoiceRecorder({
  onTranscription,
  maxDuration = 120,
  compact = false,
  className = '',
}: VoiceRecorderProps) {
  const {
    isRecording,
    isTranscribing,
    duration,
    audioBlob,
    audioUrl,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    transcribe,
    reset,
  } = useVoiceRecorder({ maxDuration, onTranscription });

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioUrl) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl]);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTranscribe = async () => {
    const text = await transcribe();
    if (text) {
      reset();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Compact inline version for textarea integration
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <AnimatePresence mode="wait">
          {!audioBlob && !isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={startRecording}
                className="h-8 w-8 p-0 rounded-full hover:bg-veil-500/20"
                title="Record voice note"
              >
                <Mic className="w-4 h-4 text-gray-400 hover:text-veil-400" />
              </Button>
            </motion.div>
          )}

          {isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30"
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-rose-500"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
              <span className="text-xs font-mono text-rose-400">{formatTime(duration)}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={stopRecording}
                className="h-6 w-6 p-0 rounded-full hover:bg-rose-500/20"
              >
                <Square className="w-3 h-3 text-rose-400 fill-rose-400" />
              </Button>
            </motion.div>
          )}

          {audioBlob && !isTranscribing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-veil-500/10 border border-veil-500/30"
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={togglePlayback}
                className="h-6 w-6 p-0 rounded-full"
              >
                {isPlaying ? (
                  <Pause className="w-3 h-3 text-veil-400" />
                ) : (
                  <Play className="w-3 h-3 text-veil-400" />
                )}
              </Button>
              <span className="text-xs font-mono text-veil-400">{formatTime(duration)}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={cancelRecording}
                className="h-6 w-6 p-0 rounded-full hover:bg-rose-500/20"
              >
                <X className="w-3 h-3 text-gray-400" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleTranscribe}
                className="h-6 w-6 p-0 rounded-full hover:bg-emerald-500/20"
              >
                <Check className="w-3 h-3 text-emerald-400" />
              </Button>
            </motion.div>
          )}

          {isTranscribing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30"
            >
              <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
              <span className="text-xs text-cyan-400">Transcribing...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <span className="text-xs text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </span>
        )}
      </div>
    );
  }

  // Full-size version
  return (
    <div className={`space-y-4 ${className}`}>
      <AnimatePresence mode="wait">
        {!audioBlob && !isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-4"
          >
            <Button
              type="button"
              onClick={startRecording}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-veil-500 to-veil-600 hover:from-veil-400 hover:to-veil-500 shadow-lg shadow-veil-500/30"
            >
              <Mic className="w-8 h-8 text-white" />
            </Button>
            <p className="text-sm text-gray-400">Tap to record your voice</p>
          </motion.div>
        )}

        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-4"
          >
            {/* Recording animation */}
            <div className="relative">
              <motion.div
                className="w-24 h-24 rounded-full bg-rose-500/20"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                <div className="w-20 h-20 rounded-full bg-rose-500/30 flex items-center justify-center">
                  <motion.div
                    className="w-4 h-4 rounded-full bg-rose-500"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 0.75 }}
                  />
                </div>
              </motion.div>
            </div>

            <div className="text-center">
              <p className="text-2xl font-mono text-rose-400">{formatTime(duration)}</p>
              <p className="text-xs text-gray-500">
                Max {formatTime(maxDuration)}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={cancelRecording}
                className="border-gray-600 text-gray-400 hover:text-gray-300"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="button"
                onClick={stopRecording}
                className="bg-rose-600 hover:bg-rose-500 text-white"
              >
                <Square className="w-4 h-4 mr-2 fill-white" />
                Stop
              </Button>
            </div>
          </motion.div>
        )}

        {audioBlob && !isTranscribing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-4"
          >
            {/* Playback controls */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 w-full max-w-xs">
              <Button
                type="button"
                variant="ghost"
                onClick={togglePlayback}
                className="w-12 h-12 rounded-full bg-veil-500/20 hover:bg-veil-500/30"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-veil-400" />
                ) : (
                  <Play className="w-5 h-5 text-veil-400" />
                )}
              </Button>
              <div className="flex-1">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-veil-500"
                    initial={{ width: '0%' }}
                    animate={isPlaying ? { width: '100%' } : { width: '0%' }}
                    transition={isPlaying ? { duration: duration, ease: 'linear' } : {}}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{formatTime(duration)}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={reset}
                className="border-gray-600 text-gray-400 hover:text-gray-300"
              >
                <X className="w-4 h-4 mr-2" />
                Discard
              </Button>
              <Button
                type="button"
                onClick={handleTranscribe}
                className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                Transcribe
              </Button>
            </div>
          </motion.div>
        )}

        {isTranscribing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative w-20 h-20">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-cyan-500/30"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-2 rounded-full border-2 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent"
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
              </div>
            </div>
            <p className="text-sm text-cyan-400">Transcribing your voice...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 text-rose-400 text-sm"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.div>
      )}
    </div>
  );
}
