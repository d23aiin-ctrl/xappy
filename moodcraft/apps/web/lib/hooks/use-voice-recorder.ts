'use client';

import { useState, useRef, useCallback } from 'react';

interface UseVoiceRecorderOptions {
  maxDuration?: number; // in seconds
  onTranscription?: (text: string) => void;
}

interface UseVoiceRecorderReturn {
  isRecording: boolean;
  isTranscribing: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  cancelRecording: () => void;
  transcribe: () => Promise<string | null>;
  reset: () => void;
}

export function useVoiceRecorder(options: UseVoiceRecorderOptions = {}): UseVoiceRecorderReturn {
  const { maxDuration = 300, onTranscription } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  }, [audioUrl]);

  const startRecording = useCallback(async () => {
    setError(null);
    cleanup();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;
      chunksRef.current = [];

      // Determine the best supported MIME type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setDuration(0);

      // Timer for duration
      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Could not access microphone. Please check permissions.');
    }
  }, [cleanup, maxDuration]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
  }, []);

  const cancelRecording = useCallback(() => {
    stopRecording();
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    chunksRef.current = [];
  }, [stopRecording]);

  const transcribe = useCallback(async (): Promise<string | null> => {
    if (!audioBlob) {
      setError('No audio to transcribe');
      return null;
    }

    setIsTranscribing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();

      if (data.success && data.text) {
        onTranscription?.(data.text);
        return data.text;
      } else {
        throw new Error(data.error || 'Transcription failed');
      }
    } catch (err) {
      console.error('Transcription error:', err);
      setError('Failed to transcribe audio. Please try again.');
      return null;
    } finally {
      setIsTranscribing(false);
    }
  }, [audioBlob, onTranscription]);

  const reset = useCallback(() => {
    cleanup();
    setIsRecording(false);
    setIsTranscribing(false);
    setDuration(0);
    setAudioBlob(null);
    setAudioUrl(null);
    setError(null);
    chunksRef.current = [];
  }, [cleanup]);

  return {
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
  };
}
