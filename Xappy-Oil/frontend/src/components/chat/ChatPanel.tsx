"use client";

import "regenerator-runtime/runtime";
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Mic,
  MicOff,
  Send,
  RotateCcw,
  AlertTriangle,
  Flame,
  Droplets,
  ClipboardList,
  ArrowLeftRight,
  FileText,
  Sparkles,
  Search,
  Clock,
  Paperclip,
  X,
  Image as ImageIcon,
  ZoomIn,
} from "lucide-react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import type {
  ChatMessage,
  ChatResponse,
  DraftState,
  QuickAction,
  SubmissionResult,
} from "@/types/chat";
import DraftCard from "./DraftCard";
import FieldOptions from "./FieldOptions";
import ConfirmationCard from "./ConfirmationCard";
import SubmissionSuccessCard from "./SubmissionSuccessCard";

// Extended ChatMessage type for internal use
interface ExtendedChatMessage extends ChatMessage {
  draftState?: DraftState;
  quickActions?: QuickAction[];
  submissionResult?: SubmissionResult;
  showDraftCard?: boolean;
  attachedImage?: string; // base64 or URL
}

// Format message content with basic markdown support
function formatMessage(content: string): React.ReactNode {
  const lines = content.split("\n");

  return lines.map((line, lineIndex) => {
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let keyIndex = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      const codeMatch = remaining.match(/`([^`]+)`/);

      let earliestMatch: {
        type: "bold" | "code";
        index: number;
        match: RegExpMatchArray;
      } | null = null;

      if (boldMatch && boldMatch.index !== undefined) {
        earliestMatch = { type: "bold", index: boldMatch.index, match: boldMatch };
      }
      if (codeMatch && codeMatch.index !== undefined) {
        if (!earliestMatch || codeMatch.index < earliestMatch.index) {
          earliestMatch = { type: "code", index: codeMatch.index, match: codeMatch };
        }
      }

      if (earliestMatch) {
        if (earliestMatch.index > 0) {
          parts.push(remaining.substring(0, earliestMatch.index));
        }

        if (earliestMatch.type === "bold") {
          parts.push(
            <strong key={`${lineIndex}-${keyIndex++}`} className="font-semibold">
              {earliestMatch.match[1]}
            </strong>
          );
        } else {
          parts.push(
            <code
              key={`${lineIndex}-${keyIndex++}`}
              className="bg-blue-50 text-haptik-blue px-1.5 py-0.5 rounded text-xs font-mono"
            >
              {earliestMatch.match[1]}
            </code>
          );
        }

        remaining = remaining.substring(
          earliestMatch.index + earliestMatch.match[0].length
        );
      } else {
        parts.push(remaining);
        remaining = "";
      }
    }

    return (
      <span key={lineIndex}>
        {parts}
        {lineIndex < lines.length - 1 && <br />}
      </span>
    );
  });
}

const STORAGE_KEY = "xappy_chat_conversation_id";

// Suggestion chips with icons - Haptik style
const SUGGESTION_CHIPS = {
  reports: [
    { label: "Near Miss", query: "I want to report a near miss", icon: AlertTriangle, color: "warning" },
    { label: "Incident", query: "report an incident", icon: Flame, color: "pink" },
    { label: "Spill Report", query: "report a spill", icon: Droplets, color: "primary" },
    { label: "Inspection", query: "log an inspection", icon: Search, color: "purple" },
    { label: "Shift Handover", query: "shift handover", icon: ArrowLeftRight, color: "success" },
  ],
  queries: [
    { label: "My Reports", query: "show my reports", icon: FileText, color: "primary" },
    { label: "Pending", query: "show pending reports", icon: Clock, color: "warning" },
    { label: "Recent Activity", query: "show recent activity", icon: ClipboardList, color: "success" },
  ],
};

export default function ChatPanel() {
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [speechError, setSpeechError] = useState("");
  const [speechBase, setSpeechBase] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      setConversationId(saved);
    }
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (listening && speechBase !== null) {
      const next = transcript.trim();
      const base = speechBase.trim();
      setInput([base, next].filter(Boolean).join(" "));
    }
  }, [listening, speechBase, transcript]);

  const resetConversation = () => {
    setConversationId(null);
    sessionStorage.removeItem(STORAGE_KEY);
    setMessages([]);
    setError("");
    setSpeechError("");
    setEditingField(null);
    setSelectedImage(null);
  };

  // Handle image file selection
  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size should be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Handle paste event for images
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setSelectedImage(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  }, []);

  const processResponse = (data: ChatResponse): ExtendedChatMessage => {
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      content: data.content || "Please provide more details.",
      createdAt: new Date().toISOString(),
      draftState: data.draftState,
      quickActions: data.quickActions,
      submissionResult: data.submissionResult,
      showDraftCard: data.showDraftCard,
    };
  };

  const sendMessage = async (
    message?: string,
    fieldUpdates?: { fieldName: string; value: string }[],
    withImage?: boolean
  ) => {
    const trimmed = message !== undefined ? message : input.trim();
    const hasImage = withImage && selectedImage;
    if ((!trimmed && !fieldUpdates && !hasImage) || sending) return;
    setSending(true);
    setError("");
    setEditingField(null);

    if (listening) {
      SpeechRecognition.stopListening();
      setSpeechBase(null);
      resetTranscript();
    }

    // Only add user message if there's actual text or image
    if (trimmed || hasImage) {
      const userMessage: ExtendedChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: hasImage ? (trimmed || "[Image attached for report evidence]") : trimmed,
        createdAt: new Date().toISOString(),
        attachedImage: hasImage ? selectedImage : undefined,
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      if (hasImage) setSelectedImage(null);
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/v1/chat/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed || "",
          conversationId: conversationId || undefined,
          fieldUpdates: fieldUpdates,
        }),
      });

      const data: ChatResponse = await response.json();
      if (!response.ok) {
        throw new Error((data as any).detail || "Failed to send message");
      }

      if (data.conversationId) {
        setConversationId(data.conversationId);
        sessionStorage.setItem(STORAGE_KEY, data.conversationId);
      }

      const assistantMessage = processResponse(data);
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err.message || "Unable to send message");
    } finally {
      setSending(false);
    }
  };

  const handleSuggestionClick = async (query: string) => {
    await sendMessage(query);
  };

  const handleQuickAction = async (action: QuickAction) => {
    if (action.actionType === "field_option" && action.fieldName) {
      await sendMessage(action.value);
    } else if (action.actionType === "confirm") {
      await sendMessage("yes");
    } else if (action.actionType === "cancel") {
      await sendMessage("no");
    }
  };

  const handleFieldUpdate = async (fieldName: string, value: string) => {
    setEditingField(null);
    await sendMessage("", [{ fieldName, value }]);
  };

  const handleFieldClick = (fieldName: string) => {
    setEditingField(fieldName || null);
  };

  const handleToggleListening = () => {
    if (!browserSupportsSpeechRecognition) {
      setSpeechError("Speech recognition is not supported in this browser.");
      return;
    }
    setSpeechError("");
    if (listening) {
      SpeechRecognition.stopListening();
      setSpeechBase(null);
      resetTranscript();
      return;
    }
    setSpeechBase(input);
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true, language: "en-GB" });
  };

  const getChipColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      primary: "bg-blue-50 text-haptik-blue hover:bg-blue-100 border-blue-100",
      success: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100",
      warning: "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100",
      pink: "bg-pink-50 text-haptik-pink hover:bg-pink-100 border-pink-100",
      purple: "bg-purple-50 text-haptik-purple hover:bg-purple-100 border-purple-100",
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
      {/* Header - Haptik style */}
      <div className="haptik-gradient px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Xappy</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs text-white/80">Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={resetConversation}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all"
            type="button"
          >
            <RotateCcw className="h-4 w-4" />
            New Chat
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            {/* Welcome Card */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
              <Sparkles className="w-10 h-10 text-haptik-blue" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Hi there!
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mb-6">
              I&apos;m your AI assistant for safety reporting. Report incidents, near misses, spills, and more using natural language.
            </p>

            {/* Suggestion Chips - Report Types */}
            <div className="w-full max-w-md mb-4">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
                Quick Report
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTION_CHIPS.reports.map((chip) => {
                  const Icon = chip.icon;
                  return (
                    <button
                      key={chip.query}
                      onClick={() => handleSuggestionClick(chip.query)}
                      disabled={sending}
                      className={`suggestion-chip ${getChipColorClasses(chip.color)} border disabled:opacity-50`}
                    >
                      <Icon className="w-4 h-4" />
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Suggestion Chips - Queries */}
            <div className="w-full max-w-md">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
                View Reports
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTION_CHIPS.queries.map((chip) => {
                  const Icon = chip.icon;
                  return (
                    <button
                      key={chip.query}
                      onClick={() => handleSuggestionClick(chip.query)}
                      disabled={sending}
                      className={`suggestion-chip ${getChipColorClasses(chip.color)} border disabled:opacity-50`}
                    >
                      <Icon className="w-4 h-4" />
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <div key={msg.id}>
                {/* Message bubble - WhatsApp style */}
                <div
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  } mb-1`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-haptik-blue" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "chat-bubble-user text-white"
                        : "chat-bubble-assistant text-slate-800"
                    }`}
                  >
                    {/* Attached Image */}
                    {msg.attachedImage && (
                      <div
                        className="mb-2 cursor-pointer group relative"
                        onClick={() => setFullScreenImage(msg.attachedImage!)}
                      >
                        <img
                          src={msg.attachedImage}
                          alt="Attached"
                          className="max-w-[220px] max-h-[180px] object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                          <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    )}
                    {msg.role === "assistant"
                      ? formatMessage(msg.content)
                      : msg.content}
                  </div>
                </div>

                {/* Draft Card */}
                {msg.role === "assistant" &&
                  msg.showDraftCard &&
                  msg.draftState &&
                  index === messages.length - 1 &&
                  msg.draftState.stage === "collecting" && (
                    <div className="ml-10 mt-3">
                      <DraftCard
                        draftState={msg.draftState}
                        onFieldClick={handleFieldClick}
                        onFieldUpdate={handleFieldUpdate}
                        editingField={editingField}
                        disabled={sending}
                      />
                    </div>
                  )}

                {/* Confirmation Card */}
                {msg.role === "assistant" &&
                  msg.draftState?.stage === "confirming" &&
                  index === messages.length - 1 && (
                    <div className="ml-10 mt-3">
                      <ConfirmationCard
                        draftState={msg.draftState}
                        onConfirm={() => sendMessage("yes")}
                        onCancel={() => sendMessage("no")}
                        onEdit={handleFieldClick}
                        disabled={sending}
                      />
                    </div>
                  )}

                {/* Submission Success Card */}
                {msg.role === "assistant" && msg.submissionResult && (
                  <div className="ml-10 mt-3">
                    <SubmissionSuccessCard
                      result={msg.submissionResult}
                      onNewReport={resetConversation}
                    />
                  </div>
                )}

                {/* Quick Action Buttons */}
                {msg.role === "assistant" &&
                  msg.quickActions &&
                  msg.quickActions.length > 0 &&
                  index === messages.length - 1 &&
                  !msg.draftState?.stage?.includes("confirm") && (
                    <div className="ml-10 mt-3">
                      <FieldOptions
                        actions={msg.quickActions}
                        onSelect={handleQuickAction}
                        disabled={sending}
                      />
                    </div>
                  )}
              </div>
            ))}

            {/* Typing indicator */}
            {sending && (
              <div className="flex justify-start">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mr-2">
                  <Sparkles className="w-4 h-4 text-haptik-blue" />
                </div>
                <div className="chat-bubble-assistant px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="typing-dot w-2 h-2 bg-haptik-blue rounded-full" />
                    <div className="typing-dot w-2 h-2 bg-haptik-blue rounded-full" />
                    <div className="typing-dot w-2 h-2 bg-haptik-blue rounded-full" />
                  </div>
                </div>
              </div>
            )}

            {/* Quick suggestion chips after messages */}
            {messages.length > 0 && !sending && messages[messages.length - 1].role === "assistant" && !messages[messages.length - 1].draftState && !messages[messages.length - 1].submissionResult && (
              <div className="ml-10 mt-2">
                <div className="flex flex-wrap gap-2">
                  {SUGGESTION_CHIPS.reports.slice(0, 3).map((chip) => {
                    const Icon = chip.icon;
                    return (
                      <button
                        key={chip.query}
                        onClick={() => handleSuggestionClick(chip.query)}
                        disabled={sending}
                        className={`suggestion-chip text-xs ${getChipColorClasses(chip.color)} border disabled:opacity-50`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Error display */}
      {(error || speechError) && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-100">
          <p className="text-sm text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error || speechError}
          </p>
        </div>
      )}

      {/* Image Preview */}
      {selectedImage && (
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <img
                src={selectedImage}
                alt="Attachment preview"
                className="w-16 h-16 object-cover rounded-lg border-2 border-haptik-blue/30"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">Photo attached</p>
              <p className="text-xs text-slate-500">Will be sent with your message</p>
            </div>
          </div>
        </div>
      )}

      {/* Input Area - Modern style */}
      <div className="border-t border-slate-200 bg-white p-4">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        <div className="flex items-center gap-3">
          {/* Attachment button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`p-3 rounded-xl border transition-all ${
              selectedImage
                ? "bg-haptik-blue/10 border-haptik-blue/30 text-haptik-blue"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
            disabled={sending}
            type="button"
            title="Attach image"
          >
            {selectedImage ? (
              <ImageIcon className="h-5 w-5" />
            ) : (
              <Paperclip className="h-5 w-5" />
            )}
          </button>

          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(undefined, undefined, !!selectedImage);
                }
              }}
              onPaste={handlePaste}
              placeholder="Type your message..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-haptik-blue/30 focus:border-haptik-blue transition-all"
              disabled={sending}
            />
          </div>
          <button
            onClick={handleToggleListening}
            className={`p-3 rounded-xl border transition-all ${
              listening
                ? "bg-red-50 border-red-200 text-red-600"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
            disabled={sending || !browserSupportsSpeechRecognition}
            type="button"
            title={listening ? "Stop dictation" : "Start dictation"}
          >
            {listening ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={() => sendMessage(undefined, undefined, !!selectedImage)}
            className="p-3 rounded-xl haptik-gradient text-white hover:opacity-90 transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
            disabled={sending || (!input.trim() && !selectedImage)}
            type="button"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Full Screen Image Modal */}
      {fullScreenImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setFullScreenImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 transition-colors"
            onClick={() => setFullScreenImage(null)}
            type="button"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={fullScreenImage}
            alt="Full screen view"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
