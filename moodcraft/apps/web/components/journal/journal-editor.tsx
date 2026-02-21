'use client';

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import CharacterCount from '@tiptap/extension-character-count';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  Quote,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Mic,
  MicOff,
  Type,
  AudioWaveform,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { VoiceRecorder } from '@/components/voice/voice-recorder';
import { Button } from '@/components/ui/button';

interface JournalEditorProps {
  content: string;
  onContentChange: (html: string, text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

function ToolbarButton({
  onClick,
  isActive,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md transition-all ${
        isActive
          ? 'bg-veil-500/30 text-veil-300'
          : 'text-gray-400 hover:text-white hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  );
}

export function JournalEditor({
  content,
  onContentChange,
  placeholder = 'Begin writing... let your thoughts flow freely.',
  autoFocus = false,
}: JournalEditorProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [showWhisperRecorder, setShowWhisperRecorder] = useState(false);
  const recognitionRef = useRef<any>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({ placeholder }),
      Highlight.configure({ multicolor: false }) as any,
      Typography as any,
      Underline as any,
      TextAlign.configure({ types: ['heading', 'paragraph'] }) as any,
      CharacterCount,
    ],
    content,
    editorProps: {
      attributes: {
        class:
          'prose prose-invert prose-sm sm:prose-base max-w-none focus:outline-none min-h-[320px] px-4 py-3',
      },
    },
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML(), editor.getText());
    },
    autofocus: autoFocus,
    immediatelyRender: false, // Prevent SSR hydration mismatch
  });

  // Check for speech recognition support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
    }
  }, []);

  const toggleVoice = useCallback(() => {
    if (!recognitionRef.current || !editor) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          editor.chain().focus().insertContent(finalTranscript + ' ').run();
        }
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current.start();
      setIsRecording(true);
    }
  }, [isRecording, editor]);

  const handleWhisperTranscription = useCallback(
    (text: string) => {
      if (editor && text) {
        editor.chain().focus().insertContent(text + ' ').run();
        setShowWhisperRecorder(false);
      }
    },
    [editor]
  );

  if (!editor) return null;

  const wordCount = editor.storage.characterCount.words();
  const charCount = editor.storage.characterCount.characters();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden"
    >
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 flex-wrap border-b border-white/10 px-2 py-1.5 bg-white/[0.02]">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-white/10 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => (editor.chain().focus() as any).toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => (editor.chain().focus() as any).toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          title="Highlight"
        >
          <Highlighter className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-white/10 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-white/10 mx-1" />

        <ToolbarButton
          onClick={() => (editor.chain().focus() as any).setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => (editor.chain().focus() as any).setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-white/10 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        {/* Voice Input */}
        {voiceSupported && (
          <>
            <div className="w-px h-5 bg-white/10 mx-1" />
            <ToolbarButton
              onClick={toggleVoice}
              isActive={isRecording}
              title={isRecording ? 'Stop Recording' : 'Voice Input'}
            >
              {isRecording ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <MicOff className="w-4 h-4 text-red-400" />
                </motion.div>
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </ToolbarButton>
            {isRecording && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-red-400 ml-1"
              >
                Recording...
              </motion.span>
            )}
          </>
        )}

        {/* Whisper Transcription Button */}
        <div className="w-px h-5 bg-white/10 mx-1" />
        <ToolbarButton
          onClick={() => setShowWhisperRecorder(true)}
          title="AI Voice Transcription (Whisper)"
        >
          <AudioWaveform className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Whisper Recorder Modal */}
      <AnimatePresence>
        {showWhisperRecorder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowWhisperRecorder(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md mx-4 p-6 rounded-2xl bg-midnight-900 border border-white/10 shadow-2xl"
            >
              <button
                onClick={() => setShowWhisperRecorder(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-white mb-1">Voice Transcription</h3>
                <p className="text-sm text-gray-400">
                  Record your voice and AI will transcribe it with high accuracy
                </p>
              </div>

              <VoiceRecorder
                maxDuration={180}
                onTranscription={handleWhisperTranscription}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble Menu - appears on text selection */}
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 150 }}>
          <div className="flex items-center gap-0.5 bg-midnight-900 border border-white/20 rounded-lg px-1 py-0.5 shadow-xl">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => (editor.chain().focus() as any).toggleHighlight().run()}
              isActive={editor.isActive('highlight')}
              title="Highlight"
            >
              <Highlighter className="w-3.5 h-3.5" />
            </ToolbarButton>
          </div>
        </BubbleMenu>
      )}

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Footer Stats */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Type className="w-3 h-3" />
            {wordCount} words
          </span>
          <span>{charCount} characters</span>
        </div>
        {isRecording && (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs text-red-400">Voice active</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
