'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, MicOff, Volume2, VolumeX, Loader2, Phone, PhoneOff, Settings, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Voice {
  id: string;
  name: string;
  description: string;
  gender: string;
}

interface VoiceCompanionProps {
  chatId?: string;
  onChatIdChange?: (chatId: string) => void;
  onSwitchToText?: () => void;
  className?: string;
}

export function VoiceCompanion({
  chatId: initialChatId,
  onChatIdChange,
  onSwitchToText,
  className,
}: VoiceCompanionProps) {
  const [isActive, setIsActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [chatId, setChatId] = useState(initialChatId);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Fetch available voices
  useEffect(() => {
    fetch('/api/companion/voice')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setVoices(data.data.voices);
        }
      })
      .catch(console.error);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const startSession = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setIsActive(true);
      setError(null);
    } catch (err) {
      setError('Microphone access is required for voice mode');
    }
  };

  const endSession = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsActive(false);
    setIsRecording(false);
    setIsPlaying(false);
    setTranscript('');
    setResponse('');
  };

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    audioChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'audio/webm',
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      await sendVoiceMessage(audioBlob);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
    setTranscript('');
    setResponse('');
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const sendVoiceMessage = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('voiceId', selectedVoice);
      if (chatId) {
        formData.append('chatId', chatId);
      }

      const res = await fetch('/api/companion/voice', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to process voice');
      }

      setTranscript(data.data.userMessage);
      setResponse(data.data.response);

      if (data.data.chatId && data.data.chatId !== chatId) {
        setChatId(data.data.chatId);
        onChatIdChange?.(data.data.chatId);
      }

      // Play audio response
      if (data.data.audioUrl && !isMuted) {
        playAudio(data.data.audioUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => {
      setIsPlaying(false);
      console.error('Audio playback error');
    };

    audio.play().catch(console.error);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  // Pulsing orb animation based on state
  const getOrbState = () => {
    if (isRecording) return 'recording';
    if (isProcessing) return 'processing';
    if (isPlaying) return 'speaking';
    return 'idle';
  };

  const orbColors = {
    idle: 'from-veil-600 to-purple-700',
    recording: 'from-rose-500 to-red-600',
    processing: 'from-amber-500 to-orange-600',
    speaking: 'from-emerald-500 to-green-600',
  };

  const orbState = getOrbState();

  return (
    <Card className={cn('bg-midnight-900/80 border-gray-800', className)}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-veil-400" />
            Voice Mode
          </h3>
          <div className="flex items-center gap-2">
            {onSwitchToText && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSwitchToText}
                className="text-gray-400 hover:text-white"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Text
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="text-gray-400 hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Settings panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                <label className="text-sm text-gray-400">Companion Voice</label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger className="bg-gray-900 border-gray-700">
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <div className="flex flex-col">
                          <span>{voice.name}</span>
                          <span className="text-xs text-gray-500">{voice.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main visualization */}
        <div className="flex flex-col items-center py-8">
          {/* Animated orb */}
          <div className="relative">
            <motion.div
              className={cn(
                'w-32 h-32 rounded-full bg-gradient-to-br',
                orbColors[orbState]
              )}
              animate={{
                scale: isRecording ? [1, 1.1, 1] : isPlaying ? [1, 1.05, 1] : 1,
              }}
              transition={{
                repeat: isRecording || isPlaying ? Infinity : 0,
                duration: isRecording ? 0.5 : 1,
              }}
            />

            {/* Inner glow */}
            <motion.div
              className="absolute inset-4 rounded-full bg-white/10 backdrop-blur-sm"
              animate={{
                opacity: isActive ? [0.5, 0.8, 0.5] : 0.3,
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
              }}
            />

            {/* Status icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              {isProcessing ? (
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              ) : isRecording ? (
                <Mic className="w-8 h-8 text-white" />
              ) : isPlaying ? (
                <Volume2 className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white/70" />
              )}
            </div>
          </div>

          {/* Status text */}
          <p className="mt-4 text-sm text-gray-400">
            {!isActive
              ? 'Tap to start voice session'
              : isRecording
              ? 'Listening...'
              : isProcessing
              ? 'Processing...'
              : isPlaying
              ? 'Speaking...'
              : 'Tap and hold to speak'}
          </p>

          {/* Transcript & Response */}
          <AnimatePresence>
            {(transcript || response) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6 w-full max-w-md space-y-3"
              >
                {transcript && (
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">You said:</p>
                    <p className="text-sm text-gray-300">{transcript}</p>
                  </div>
                )}
                {response && (
                  <div className="bg-veil-500/10 border border-veil-500/30 rounded-lg p-3">
                    <p className="text-xs text-veil-400 mb-1">Companion:</p>
                    <p className="text-sm text-gray-300">{response}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error message */}
          {error && (
            <p className="mt-4 text-sm text-red-400">{error}</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isActive ? (
            <Button
              size="lg"
              onClick={startSession}
              className="bg-veil-600 hover:bg-veil-500"
            >
              <Phone className="w-5 h-5 mr-2" />
              Start Voice Session
            </Button>
          ) : (
            <>
              {/* Mute toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-gray-400 hover:text-white"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>

              {/* Record button (hold to record) */}
              <Button
                size="lg"
                variant={isRecording ? 'destructive' : 'default'}
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                disabled={isProcessing || isPlaying}
                className={cn(
                  'w-16 h-16 rounded-full',
                  isRecording ? 'bg-red-600 hover:bg-red-500' : 'bg-veil-600 hover:bg-veil-500'
                )}
              >
                {isRecording ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </Button>

              {/* End session */}
              <Button
                variant="ghost"
                size="icon"
                onClick={endSession}
                className="text-gray-400 hover:text-red-400"
              >
                <PhoneOff className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>

        {/* Instructions */}
        {isActive && (
          <p className="text-center text-xs text-gray-600 mt-4">
            Press and hold the microphone button to speak
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Compact voice toggle button for chat interface
export function VoiceModeToggle({
  onActivate,
  className,
}: {
  onActivate: () => void;
  className?: string;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onActivate}
      className={cn('text-gray-400 hover:text-veil-400', className)}
    >
      <Mic className="w-5 h-5" />
    </Button>
  );
}
