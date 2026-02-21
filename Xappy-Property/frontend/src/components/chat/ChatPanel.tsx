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
  Baby,
  HeartPulse,
  Calendar,
  Phone,
  MapPin,
  Paperclip,
  X,
  Image as ImageIcon,
  ZoomIn,
  Maximize2,
  Minimize2,
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
import { apiFetch } from "@/lib/api";
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

type FacilityCard = {
  name: string;
  district?: string;
  type?: string;
  opd?: string;
  emergency?: string;
  phone?: string;
  rating?: string;
  mapUrl?: string;
  address?: string;
  specialties?: string;
};

type DoctorCard = {
  name: string;
  specialty?: string;
  availability?: string;
  facility?: string;
  rating?: string;
  phone?: string;
  address?: string;
  mapUrl?: string;
};

type HealthTipCard = {
  topic: string;
  dos: string[];
  avoids: string[];
  seek?: string;
};

type SymptomGuidance = {
  bullets: string[];
  emergency?: string;
};

type PregnancyGuidance = {
  topic: string;
  detail: string;
};

type VaccinationCampaign = {
  name: string;
  district?: string;
  date?: string;
  eligibility?: string;
};

type VaccinationProgram = {
  name: string;
  programType?: string;
  target?: string;
};

type AmbulanceCard = {
  name: string;
  type?: string;
  call?: string;
  availability?: string;
  coverage?: string;
  steps?: string[];
  notFor?: string[];
  notes?: string;
};

function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

function parseFacilities(lines: string[]): FacilityCard[] {
  const cards: FacilityCard[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line.startsWith("- ")) continue;

    const segments = line.slice(2).split(" | ").map((part) => part.trim());
    const namePart = segments.shift() || "";
    const districtMatch = namePart.match(/\(([^)]+)\)\s*$/);
    const name = namePart.replace(/\s*\([^)]+\)\s*$/, "").trim();
    const district = districtMatch ? districtMatch[1] : undefined;
    const type = segments[0];
    const opd = segments.find((part) => part.startsWith("OPD:"))?.replace("OPD:", "").trim();
    const emergency = segments
      .find((part) => part.startsWith("Emergency:"))
      ?.replace("Emergency:", "")
      .trim();

    const callLine = lines[i + 1]?.trim();
    const addressLine = lines[i + 2]?.trim();
    const card: FacilityCard = { name, district, type, opd, emergency };

    if (callLine?.startsWith("Call:")) {
      const callParts = callLine.replace("Call:", "").trim().split(" | ").map((part) => part.trim());
      card.phone = callParts[0];
      for (const part of callParts.slice(1)) {
        if (part.startsWith("Rating:")) {
          card.rating = part.replace("Rating:", "").trim();
        }
        if (part.startsWith("Map:")) {
          card.mapUrl = part.replace("Map:", "").trim();
        }
      }
      i += 1;
    }

    if (addressLine?.startsWith("Address:")) {
      const addressParts = addressLine.replace("Address:", "").trim().split(" | ").map((part) => part.trim());
      card.address = addressParts[0];
      for (const part of addressParts.slice(1)) {
        if (part.startsWith("Specialties:")) {
          card.specialties = part.replace("Specialties:", "").trim();
        }
      }
      i += 1;
    }

    cards.push(card);
  }
  return cards;
}

function parseDoctors(lines: string[]): DoctorCard[] {
  const cards: DoctorCard[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line.startsWith("- ")) continue;

    const segments = line.slice(2).split(" | ").map((part) => part.trim());
    const card: DoctorCard = { name: segments[0] || "" };
    card.specialty = segments[1];
    card.availability = segments[2];
    card.facility = segments[3];
    const ratingPart = segments.find((part) => part.startsWith("Rating:"));
    if (ratingPart) card.rating = ratingPart.replace("Rating:", "").trim();

    const callLine = lines[i + 1]?.trim();
    if (callLine?.startsWith("Call:")) {
      const callParts = callLine.replace("Call:", "").trim().split(" | ").map((part) => part.trim());
      card.phone = callParts[0];
      for (const part of callParts.slice(1)) {
        if (part.startsWith("Address:")) {
          card.address = part.replace("Address:", "").trim();
        }
        if (part.startsWith("Map:")) {
          card.mapUrl = part.replace("Map:", "").trim();
        }
      }
      i += 1;
    }

    cards.push(card);
  }
  return cards;
}

function parseAmbulance(lines: string[]): { national: AmbulanceCard[]; services: AmbulanceCard[] } {
  const national: AmbulanceCard[] = [];
  const services: AmbulanceCard[] = [];
  let currentSection: "national" | "services" | null = null;
  let current: AmbulanceCard | null = null;

  const flush = () => {
    if (!current) return;
    if (currentSection === "national") national.push(current);
    if (currentSection === "services") services.push(current);
    current = null;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (line === "National ambulance service:") {
      flush();
      currentSection = "national";
      continue;
    }
    if (line === "Ambulance services:") {
      flush();
      currentSection = "services";
      continue;
    }
    if (!currentSection) continue;

    if (line.startsWith("- ")) {
      flush();
      const parts = line.slice(2).split(" | ").map((part) => part.trim());
      const name = parts.shift() || "";
      const card: AmbulanceCard = { name };
      for (const part of parts) {
        if (part === "Government") card.type = part;
        if (part.startsWith("Call:")) card.call = part.replace("Call:", "").trim();
        if (part.startsWith("Availability:")) card.availability = part.replace("Availability:", "").trim();
        if (part === "Nationwide") card.coverage = part;
        if (part === "Free emergency ambulance service") card.notes = part;
      }
      current = card;
      continue;
    }

    if (!current) continue;

    if (line.startsWith("Coverage:")) {
      current.coverage = line.replace("Coverage:", "").trim();
      continue;
    }
    if (line === "Steps:") {
      current.steps = [];
      continue;
    }
    if (line === "Not for:") {
      current.notFor = [];
      continue;
    }
    if (line.startsWith("- ")) {
      if (current.steps && current.steps.length < 6) {
        current.steps.push(line.replace("- ", "").trim());
      } else if (current.notFor && current.notFor.length < 6) {
        current.notFor.push(line.replace("- ", "").trim());
      }
    }
  }

  flush();
  return { national, services };
}

function parseEmergencyContacts(line: string): { number: string; label: string }[] {
  const value = line.replace("Emergency contacts:", "").trim();
  if (!value) return [];
  return value.split(",").map((part) => {
    const trimmed = part.trim();
    const match = trimmed.match(/^([+\d]+)\s*-\s*(.+)$/);
    if (match) {
      return { number: match[1], label: match[2] };
    }
    return { number: trimmed, label: "Emergency" };
  });
}

function extractAmbulanceData(lines: string[]): {
  national: AmbulanceCard[];
  services: AmbulanceCard[];
  contacts: { number: string; label: string }[];
  guidance?: string;
  indices: Set<number>;
} {
  const indices = new Set<number>();
  let inAmbulance = false;
  let contacts: { number: string; label: string }[] = [];
  let guidance: string | undefined;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (line === "National ambulance service:" || line === "Ambulance services:") {
      inAmbulance = true;
      indices.add(i);
      continue;
    }
    if (line.startsWith("Emergency contacts:")) {
      contacts = parseEmergencyContacts(line);
      indices.add(i);
      continue;
    }
    if (line.toLowerCase().startsWith("if there is")) {
      guidance = line;
      indices.add(i);
      continue;
    }

    if (inAmbulance) {
      if (
        line.endsWith(":") &&
        !line.startsWith("-") &&
        !["Steps:", "Not for:"].includes(line)
      ) {
        inAmbulance = false;
        continue;
      }
      indices.add(i);
    }
  }

  const { national, services } = parseAmbulance(lines);
  return { national, services, contacts, guidance, indices };
}

function renderAmbulanceCards(data: {
  national: AmbulanceCard[];
  services: AmbulanceCard[];
  contacts: { number: string; label: string }[];
  guidance?: string;
}): React.ReactNode | null {
  const { national, services, contacts, guidance } = data;
  if (national.length === 0 && services.length === 0) return null;

  const renderCard = (card: AmbulanceCard, index: number) => (
    <div
      key={`${card.name}-${index}`}
      className="rounded-xl border border-red-100 bg-white p-4 shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <Phone className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">{card.name}</p>
            <p className="text-sm text-slate-500">
              {[card.type, card.coverage].filter(Boolean).join(" • ")}
            </p>
          </div>
        </div>
        {card.availability && (
          <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full">
            {card.availability}
          </span>
        )}
      </div>

      {/* Call button - prominent */}
      {card.call && (
        <a
          href={`tel:${sanitizePhone(card.call)}`}
          className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-3 text-base font-bold shadow-lg hover:shadow-xl transition-shadow"
        >
          <Phone className="h-5 w-5" />
          Call {card.call}
        </a>
      )}

      {card.notes && (
        <p className="mt-3 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">{card.notes}</p>
      )}

      {(card.steps && card.steps.length > 0) && (
        <div className="mt-4">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">How to use</p>
          <div className="space-y-2">
            {card.steps.map((step, idx) => (
              <div key={`${card.name}-step-${idx}`} className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <p className="text-sm text-slate-600">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {card.notFor && card.notFor.length > 0 && (
        <div className="mt-4 rounded-lg bg-amber-50 border border-amber-100 p-3">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2">Not for</p>
          <ul className="space-y-1">
            {card.notFor.map((item, idx) => (
              <li key={`${card.name}-notfor-${idx}`} className="text-sm text-amber-800 flex items-center gap-2">
                <span className="text-amber-500">×</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-lg overflow-hidden">
      {/* Emergency Header */}
      <div className="bg-gradient-to-r from-red-600 to-rose-600 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm animate-pulse">
            <Phone className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">Emergency Services</p>
            <p className="text-sm text-white/80">Ambulance & urgent care contacts</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {national.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-red-600 uppercase tracking-wide flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              National Ambulance
            </p>
            {national.map(renderCard)}
          </div>
        )}

        {services.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Local Services
            </p>
            {services.map(renderCard)}
          </div>
        )}

        {(contacts.length > 0 || guidance) && (
          <div className="rounded-xl bg-gradient-to-br from-rose-50 to-red-50 border border-rose-200 p-4">
            <p className="text-xs font-bold text-rose-700 uppercase tracking-wide mb-3">Quick Contacts</p>
            {contacts.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {contacts.map((contact) => (
                  <a
                    key={contact.number}
                    href={`tel:${sanitizePhone(contact.number)}`}
                    className="inline-flex items-center gap-2 rounded-full bg-white text-rose-700 px-4 py-2 text-sm font-bold border-2 border-rose-200 hover:border-rose-400 transition-colors shadow-sm"
                  >
                    <Phone className="h-4 w-4" />
                    {contact.number}
                    <span className="text-rose-400 font-normal">• {contact.label}</span>
                  </a>
                ))}
              </div>
            )}
            {guidance && (
              <p className="mt-3 text-sm text-rose-700 bg-white/50 rounded-lg px-3 py-2">{guidance}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function extractSection(lines: string[], header: string): { section: string[]; indices: Set<number> } {
  const indices = new Set<number>();
  const startIndex = lines.findIndex((line) => line.toLowerCase() === header);
  if (startIndex === -1) return { section: [], indices };
  indices.add(startIndex);
  const after = lines.slice(startIndex + 1);
  let endIndex = after.findIndex((line) => line.endsWith(":") && !line.startsWith("-"));
  if (endIndex === -1) endIndex = after.length;
  for (let i = 0; i < endIndex; i += 1) {
    indices.add(startIndex + 1 + i);
  }
  return { section: after.slice(0, endIndex), indices };
}

function extractHealthTips(lines: string[]): { tips: HealthTipCard[]; indices: Set<number> } {
  const indices = new Set<number>();
  const headerIndex = lines.findIndex((line) => line === "Here are friendly health tips:");
  if (headerIndex === -1) return { tips: [], indices };

  indices.add(headerIndex);
  const tips: HealthTipCard[] = [];
  let current: HealthTipCard | null = null;

  for (let i = headerIndex + 1; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    if (!line.startsWith("- ")) break;
    indices.add(i);
    const content = line.replace("- ", "").trim();
    if (content.startsWith("Do:")) {
      if (current) current.dos.push(content.replace("Do:", "").trim());
      continue;
    }
    if (content.startsWith("Avoid:")) {
      if (current) current.avoids.push(content.replace("Avoid:", "").trim());
      continue;
    }
    if (content.startsWith("See a clinician if:")) {
      if (current) current.seek = content.replace("See a clinician if:", "").trim();
      continue;
    }
    if (current) tips.push(current);
    current = { topic: content, dos: [], avoids: [] };
  }

  if (current) tips.push(current);
  return { tips, indices };
}

function renderHealthTips(tips: HealthTipCard[]): React.ReactNode | null {
  if (tips.length === 0) return null;
  return (
    <div className="rounded-xl bg-white border border-slate-200 shadow-md overflow-hidden">
      {/* Header - Professional Teal for Wellness */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-white/95 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-teal-600" />
          </div>
          <p className="text-sm font-semibold text-white">Health Tips & Advice</p>
        </div>
      </div>

      {/* Tips Content */}
      <div className="p-4 space-y-4">
        {tips.map((tip) => (
          <div key={tip.topic} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                <HeartPulse className="h-4 w-4 text-white" />
              </div>
              <p className="text-sm font-semibold text-slate-800">{tip.topic}</p>
            </div>

            <div className="grid gap-2 ml-10">
              {tip.dos.length > 0 && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-5 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Recommended</p>
                  </div>
                  <ul className="space-y-1">
                    {tip.dos.map((item) => (
                      <li key={`${tip.topic}-do-${item}`} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-emerald-500 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tip.avoids.length > 0 && (
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-5 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Avoid</p>
                  </div>
                  <ul className="space-y-1">
                    {tip.avoids.map((item) => (
                      <li key={`${tip.topic}-avoid-${item}`} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-slate-400 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tip.seek && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-5 w-5 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <AlertTriangle className="h-3 w-3 text-white" />
                    </div>
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">See a Doctor If</p>
                  </div>
                  <p className="text-sm text-amber-800">{tip.seek}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function extractSymptomGuidance(lines: string[]): { guidance: SymptomGuidance | null; indices: Set<number> } {
  const indices = new Set<number>();
  const headerIndex = lines.findIndex((line) => line === "Here is basic symptom guidance:");
  if (headerIndex === -1) return { guidance: null, indices };
  indices.add(headerIndex);
  const guidance: SymptomGuidance = { bullets: [] };

  for (let i = headerIndex + 1; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    if (!line.startsWith("- ") && i > headerIndex + 1) break;
    indices.add(i);
    if (line.startsWith("- ")) {
      guidance.bullets.push(line.replace("- ", "").trim());
    }
  }

  const emergencyLine = lines.find((line) => line.toLowerCase().startsWith("if there is chest pain"));
  if (emergencyLine) {
    guidance.emergency = emergencyLine;
    const idx = lines.indexOf(emergencyLine);
    if (idx >= 0) indices.add(idx);
  }

  return { guidance, indices };
}

function renderSymptomGuidance(guidance: SymptomGuidance | null): React.ReactNode | null {
  if (!guidance) return null;
  return (
    <div className="rounded-xl bg-white border border-slate-200 shadow-md overflow-hidden">
      {/* Header - Healthcare Teal */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-white/95 flex items-center justify-center">
            <HeartPulse className="h-4 w-4 text-teal-600" />
          </div>
          <p className="text-sm font-semibold text-white">Symptom Guidance</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {guidance.bullets.length > 0 && (
          <div className="space-y-2">
            {guidance.bullets.map((item, idx) => (
              <div key={item} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">{idx + 1}</span>
                </div>
                <p className="text-sm text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        )}

        {guidance.emergency && (
          <div className="rounded-lg bg-gradient-to-r from-red-500 to-rose-500 p-3 text-white">
            <div className="flex items-start gap-3">
              <div className="h-7 w-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold mb-0.5">Emergency Warning</p>
                <p className="text-sm text-white/90">{guidance.emergency}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function extractPregnancyGuidance(lines: string[]): { items: PregnancyGuidance[]; indices: Set<number> } {
  const indices = new Set<number>();
  const headerIndex = lines.findIndex((line) => line === "Here is childcare and pregnancy guidance:");
  if (headerIndex === -1) return { items: [], indices };
  indices.add(headerIndex);

  const items: PregnancyGuidance[] = [];
  for (let i = headerIndex + 1; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    if (!line.startsWith("- ")) break;
    indices.add(i);
    const content = line.replace("- ", "").trim();
    const splitIndex = content.indexOf(":");
    if (splitIndex !== -1) {
      items.push({
        topic: content.slice(0, splitIndex).trim(),
        detail: content.slice(splitIndex + 1).trim(),
      });
    } else {
      items.push({ topic: content, detail: "" });
    }
  }

  return { items, indices };
}

function renderPregnancyGuidance(items: PregnancyGuidance[]): React.ReactNode | null {
  if (items.length === 0) return null;
  const iconForTopic = (topic: string) => {
    const lowered = topic.toLowerCase();
    if (lowered.includes("antenatal") || lowered.includes("visit")) return Calendar;
    if (lowered.includes("baby") || lowered.includes("child")) return Baby;
    if (lowered.includes("milestone") || lowered.includes("development")) return Sparkles;
    return HeartPulse;
  };

  return (
    <div className="rounded-xl bg-white border border-slate-200 shadow-md overflow-hidden">
      {/* Header - Soft Sky Blue for Maternal Care */}
      <div className="bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-white/95 flex items-center justify-center shadow-sm">
            <Baby className="h-5 w-5 text-sky-600" />
          </div>
          <div>
            <p className="text-base font-semibold text-white">Pregnancy & Childcare</p>
            <p className="text-sm text-sky-100">Guidance and milestones</p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="p-4">
        <div className="grid gap-3">
          {items.map((item) => {
            const Icon = iconForTopic(item.topic);
            return (
              <div
                key={item.topic}
                className="rounded-lg border border-sky-100 bg-gradient-to-br from-sky-50 to-cyan-50 p-3"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 shadow-sm">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">{item.topic}</p>
                    {item.detail && (
                      <p className="mt-1 text-sm text-slate-600 leading-relaxed">{item.detail}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function renderConversationalCard(content: string): React.ReactNode {
  const lines = content.split("\n").filter(line => line.trim());
  const disclaimer = lines.find((line) =>
    /information only/i.test(line) || line.includes("தகவல்") || line.includes("තොරතුරු")
  );
  const messageLines = lines.filter(line => line !== disclaimer);

  return (
    <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      {/* Header - Professional Healthcare Teal */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 shadow-sm">
            <HeartPulse className="h-4 w-4 text-teal-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Xappy</p>
            <p className="text-xs text-teal-100">Health Assistant</p>
          </div>
        </div>
      </div>
      {/* Message content */}
      <div className="px-4 py-3">
        <div className="text-sm text-slate-700 leading-relaxed space-y-2">
          {messageLines.map((line, idx) => (
            <p key={idx} className="text-slate-700">
              {line}
            </p>
          ))}
        </div>
        {disclaimer && (
          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3" />
              {disclaimer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function isConversationalResponse(content: string): boolean {
  const text = content.toLowerCase();
  const conversationalIndicators = [
    // Greetings
    "hello!",
    "hi!",
    "hey!",
    "good morning",
    "good afternoon",
    "good evening",
    // Offers to help
    "how can i help",
    "how can i assist",
    "i'm here to help",
    "i am here to help",
    "what can i help",
    "here for you",
    "here to help",
    // Thanks responses
    "you're welcome",
    "of course!",
    "happy to help",
    "glad to help",
    "my pleasure",
    // Acknowledgments
    "thank you for",
    "nice to meet",
    "great to hear",
    "i understand",
    "i hear you",
    "that makes sense",
    // Status responses
    "i'm doing well",
    "i am doing well",
    "doing great",
    // Empathy
    "i'm sorry to hear",
    "i'm really sorry",
    "that sounds",
    "that can be",
    "i appreciate",
    // Xappy-specific
    "i'm maya",
    "i am maya",
    // General conversational
    "anything else",
    "is there anything",
    "feel free to",
    "don't hesitate",
    "let me know",
  ];
  return conversationalIndicators.some(indicator => text.includes(indicator));
}

// Modern Xappy Welcome Card Component - Property Development Colors
// Color Psychology: Blue = Trust/Professional, Orange = Construction/Energy, Green = Progress/Success
function renderXappyWelcomeCard(onQuickAction: (query: string) => void): React.ReactNode {
  const quickActions = [
    {
      id: "progress-report",
      icon: ClipboardList,
      title: "Progress Report",
      subtitle: "Log construction progress",
      query: "I want to report construction progress",
      bgLight: "bg-gradient-to-br from-blue-50 to-indigo-50",
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-500",
      iconColor: "text-white",
      borderColor: "border-blue-100",
    },
    {
      id: "defect-snag",
      icon: AlertTriangle,
      title: "Report Defect",
      subtitle: "Log defects & snags",
      query: "report a defect or snag",
      bgLight: "bg-gradient-to-br from-amber-50 to-orange-50",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
      iconColor: "text-white",
      borderColor: "border-amber-100",
    },
    {
      id: "safety-incident",
      icon: Flame,
      title: "Safety Incident",
      subtitle: "Report safety issues",
      query: "report a safety incident",
      bgLight: "bg-gradient-to-br from-red-50 to-rose-50",
      iconBg: "bg-gradient-to-br from-red-500 to-rose-500",
      iconColor: "text-white",
      borderColor: "border-red-100",
    },
    {
      id: "site-inspection",
      icon: Search,
      title: "Site Inspection",
      subtitle: "Log inspection findings",
      query: "log a site inspection",
      bgLight: "bg-gradient-to-br from-emerald-50 to-green-50",
      iconBg: "bg-gradient-to-br from-emerald-500 to-green-500",
      iconColor: "text-white",
      borderColor: "border-emerald-100",
    },
  ];

  const additionalOptions = [
    { icon: FileText, label: "Daily Log", query: "submit daily progress log", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { icon: ArrowLeftRight, label: "Shift Handover", query: "shift handover", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
    { icon: ClipboardList, label: "Toolbox Talk", query: "record toolbox talk", color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-100" },
    { icon: Clock, label: "View Reports", query: "show my reports", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" },
  ];

  return (
    <div className="space-y-4">
      {/* Xappy Welcome Header - Property Development Blue/Orange Theme */}
      <div className="rounded-2xl overflow-hidden shadow-lg border border-blue-100">
        <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-6">
          {/* Subtle decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          {/* Building icon pattern - subtle */}
          <div className="absolute top-4 right-4 opacity-10">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
            </svg>
          </div>

          <div className="relative flex items-start gap-4">
            {/* Xappy Avatar */}
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-xl bg-white/95 flex items-center justify-center shadow-lg">
                <ClipboardList className="w-7 h-7 text-blue-600" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <h2 className="text-xl font-bold text-white">Hi, I&apos;m Xappy!</h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white/95 backdrop-blur-sm border border-white/20">
                  Site Assistant
                </span>
              </div>
              <p className="text-white/95 text-sm leading-relaxed">
                Your property development companion. I can help you log progress reports,
                report defects, track inspections, and manage site documentation.
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/90 text-xs font-medium">Ready to assist • Voice enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid - Construction/Property Cards */}
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onQuickAction(action.query)}
              className={`group relative overflow-hidden rounded-xl ${action.bgLight} p-4 text-left transition-all duration-200 hover:shadow-md active:scale-[0.98] border ${action.borderColor}`}
            >
              <div className="relative">
                <div className={`w-11 h-11 rounded-xl ${action.iconBg} flex items-center justify-center mb-3 shadow-sm group-hover:shadow-md transition-shadow`}>
                  <Icon className={`w-5 h-5 ${action.iconColor}`} />
                </div>
                <h3 className="font-semibold text-slate-800 text-sm">{action.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{action.subtitle}</p>
              </div>

              {/* Arrow indicator */}
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Additional Options - Clean Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">More Options</p>
        </div>
        <div className="grid grid-cols-2">
          {additionalOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <button
                key={option.label}
                onClick={() => onQuickAction(option.query)}
                className={`flex items-center gap-3 px-4 py-3.5 bg-white hover:bg-slate-50 transition-colors text-left ${
                  index < 2 ? "border-b border-slate-100" : ""
                } ${index % 2 === 0 ? "border-r border-slate-100" : ""}`}
              >
                <div className={`w-9 h-9 rounded-lg ${option.bg} border ${option.border} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4.5 h-4.5 ${option.color}`} />
                </div>
                <span className="text-sm font-medium text-slate-700">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversation Starters - Property Development Theme */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          Try asking me
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            "Show today's progress reports",
            "What defects are pending?",
            "Log inspection for Block A",
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onQuickAction(suggestion)}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-white text-slate-600 border border-blue-200 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-all shadow-sm"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function renderGreetingCard(lines: string[]): React.ReactNode | null {
  if (lines.length === 0) return null;
  const first = lines[0];
  const isGreeting =
    /how can i help you today\?/i.test(first) ||
    first.startsWith("Hi!") ||
    first.startsWith("வணக்கம்") ||
    first.startsWith("හෙලෝ");
  if (!isGreeting) return null;

  const items = lines
    .filter((line) => line.startsWith("- "))
    .map((line) => line.replace("- ", "").trim());
  const disclaimer = lines.find((line) =>
    /information only/i.test(line) || line.includes("தகவல்") || line.includes("තොரதුරු")
  );

  // If no bullet items, this might be a conversational response
  if (items.length === 0) {
    return null;
  }

  // Professional Healthcare Color Palette - Blues, Teals, and Calming Greens
  const iconConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; bg: string; iconBg: string; iconColor: string; borderColor: string }> = {
    "Find a hospital or doctor nearby": { icon: Search, bg: "bg-cyan-50", iconBg: "bg-gradient-to-br from-cyan-500 to-teal-500", iconColor: "text-white", borderColor: "border-cyan-100" },
    "Check symptoms for basic guidance": { icon: HeartPulse, bg: "bg-blue-50", iconBg: "bg-gradient-to-br from-blue-500 to-indigo-500", iconColor: "text-white", borderColor: "border-blue-100" },
    "Vaccination and health programs": { icon: ClipboardList, bg: "bg-emerald-50", iconBg: "bg-gradient-to-br from-emerald-500 to-green-500", iconColor: "text-white", borderColor: "border-emerald-100" },
    "Lab report understanding": { icon: FileText, bg: "bg-slate-50", iconBg: "bg-gradient-to-br from-slate-500 to-slate-600", iconColor: "text-white", borderColor: "border-slate-200" },
    "Health tips and prevention": { icon: Sparkles, bg: "bg-teal-50", iconBg: "bg-gradient-to-br from-teal-500 to-cyan-500", iconColor: "text-white", borderColor: "border-teal-100" },
    "Pregnancy and childcare guidance": { icon: Baby, bg: "bg-sky-50", iconBg: "bg-gradient-to-br from-sky-500 to-blue-500", iconColor: "text-white", borderColor: "border-sky-100" },
    "Health alerts and advisories": { icon: AlertTriangle, bg: "bg-amber-50", iconBg: "bg-gradient-to-br from-amber-500 to-orange-500", iconColor: "text-white", borderColor: "border-amber-100" },
    "Emergency contacts and urgent care guidance": { icon: Phone, bg: "bg-red-50", iconBg: "bg-gradient-to-br from-red-500 to-rose-500", iconColor: "text-white", borderColor: "border-red-100" },
    "Feedback or complaint": { icon: ClipboardList, bg: "bg-slate-50", iconBg: "bg-gradient-to-br from-slate-400 to-slate-500", iconColor: "text-white", borderColor: "border-slate-200" },
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-md overflow-hidden">
      {/* Header - Professional Healthcare Teal */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/95 shadow-sm">
            <HeartPulse className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <p className="text-base font-semibold text-white">{first}</p>
            <p className="text-sm text-white/80">Select a topic below</p>
          </div>
        </div>
      </div>

      {/* Options Grid */}
      <div className="p-3">
        <div className="grid gap-2">
          {items.map((item) => {
            const config = iconConfig[item] || { icon: Sparkles, bg: "bg-slate-50", iconBg: "bg-slate-500", iconColor: "text-white", borderColor: "border-slate-200" };
            const Icon = config.icon;
            return (
              <div
                key={item}
                className={`flex items-center gap-3 rounded-xl border ${config.borderColor} ${config.bg} px-3 py-2.5 text-sm font-medium text-slate-700 hover:shadow-sm transition-all cursor-pointer`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${config.iconBg} shadow-sm`}>
                  <Icon className={`h-4 w-4 ${config.iconColor}`} />
                </div>
                <span className="flex-1 text-slate-700">{item}</span>
                <svg className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disclaimer */}
      {disclaimer && (
        <div className="px-3 pb-3">
          <div className="rounded-lg bg-slate-50 px-3 py-2 border border-slate-100">
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3 text-slate-400" />
              {disclaimer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function extractVaccinationCampaigns(lines: string[]): { items: VaccinationCampaign[]; indices: Set<number> } {
  const indices = new Set<number>();
  const headerIndex = lines.findIndex((line) => line === "Vaccination campaigns:");
  if (headerIndex === -1) return { items: [], indices };
  indices.add(headerIndex);

  const items: VaccinationCampaign[] = [];
  for (let i = headerIndex + 1; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    if (!line.startsWith("- ")) break;
    indices.add(i);
    const parts = line.replace("- ", "").split(" | ").map((part) => part.trim());
    items.push({
      name: parts[0] || "",
      district: parts[1],
      date: parts[2],
      eligibility: parts[3],
    });
  }

  return { items, indices };
}

function extractVaccinationPrograms(lines: string[]): { items: VaccinationProgram[]; indices: Set<number> } {
  const indices = new Set<number>();
  const headerIndex = lines.findIndex((line) => line === "Vaccination programs:");
  if (headerIndex === -1) return { items: [], indices };
  indices.add(headerIndex);

  const items: VaccinationProgram[] = [];
  for (let i = headerIndex + 1; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    if (!line.startsWith("- ")) break;
    indices.add(i);
    const parts = line.replace("- ", "").split(" | ").map((part) => part.trim());
    items.push({
      name: parts[0] || "",
      programType: parts[1],
      target: parts[2],
    });
  }

  return { items, indices };
}

function renderVaccinationCards(
  campaigns: VaccinationCampaign[],
  programs: VaccinationProgram[]
): React.ReactNode | null {
  if (campaigns.length === 0 && programs.length === 0) return null;
  return (
    <div className="rounded-xl bg-white border border-slate-200 shadow-md overflow-hidden">
      {/* Header - Professional Emerald for Immunization */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-white/95 flex items-center justify-center shadow-sm">
            <ClipboardList className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-base font-semibold text-white">Vaccination Info</p>
            <p className="text-sm text-emerald-100">Campaigns & programs</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {campaigns.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              Upcoming Campaigns
            </p>
            {campaigns.map((item) => (
              <div
                key={`${item.name}-${item.date}`}
                className="rounded-lg border border-emerald-100 bg-emerald-50 p-3"
              >
                <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {item.district && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-white rounded-full px-2.5 py-1 border border-slate-200">
                      <MapPin className="h-3 w-3" />
                      {item.district}
                    </span>
                  )}
                  {item.date && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-white rounded-full px-2.5 py-1 border border-slate-200">
                      <Calendar className="h-3 w-3" />
                      {item.date}
                    </span>
                  )}
                </div>
                {item.eligibility && (
                  <div className="mt-2 rounded-md bg-emerald-100 text-emerald-800 px-2.5 py-1.5 text-sm">
                    <span className="font-semibold">Eligible:</span> {item.eligibility}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {programs.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-teal-700 uppercase tracking-wider flex items-center gap-2">
              <ClipboardList className="h-3.5 w-3.5" />
              Immunization Programs
            </p>
            {programs.map((item) => (
              <div
                key={item.name}
                className="rounded-lg border border-teal-100 bg-teal-50 p-3"
              >
                <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.programType && (
                    <span className="inline-flex items-center text-xs text-teal-700 bg-teal-100 rounded-full px-2.5 py-1 font-medium">
                      {item.programType}
                    </span>
                  )}
                  {item.target && (
                    <span className="inline-flex items-center text-xs text-slate-600 bg-white rounded-full px-2.5 py-1 border border-slate-200">
                      Target: {item.target}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatHealthcareMessage(content: string): React.ReactNode {
  const lines = content.split("\n").map((line) => line.trim());
  const greetingCard = renderGreetingCard(lines);
  if (greetingCard) {
    return greetingCard;
  }
  const ambulanceData = extractAmbulanceData(lines);
  const ambulanceCards = renderAmbulanceCards(ambulanceData);
  const facilitiesSection = extractSection(lines, "facilities:");
  const doctorsSection = extractSection(lines, "doctors:");
  const healthTipsSection = extractHealthTips(lines);
  const healthTips = renderHealthTips(healthTipsSection.tips);
  const symptomSection = extractSymptomGuidance(lines);
  const symptomCard = renderSymptomGuidance(symptomSection.guidance);
  const pregnancySection = extractPregnancyGuidance(lines);
  const pregnancyCard = renderPregnancyGuidance(pregnancySection.items);
  const vaccinationCampaigns = extractVaccinationCampaigns(lines);
  const vaccinationPrograms = extractVaccinationPrograms(lines);
  const vaccinationCards = renderVaccinationCards(
    vaccinationCampaigns.items,
    vaccinationPrograms.items
  );

  if (
    facilitiesSection.section.length === 0 &&
    doctorsSection.section.length === 0 &&
    !ambulanceCards &&
    !healthTips &&
    !symptomCard &&
    !pregnancyCard &&
    !vaccinationCards
  ) {
    // Check if it's a conversational AI response
    if (isConversationalResponse(content)) {
      return renderConversationalCard(content);
    }
    return formatMessage(content);
  }

  const excluded = new Set<number>([
    ...facilitiesSection.indices,
    ...doctorsSection.indices,
    ...ambulanceData.indices,
    ...healthTipsSection.indices,
    ...symptomSection.indices,
    ...pregnancySection.indices,
    ...vaccinationCampaigns.indices,
    ...vaccinationPrograms.indices,
  ]);
  const remaining = lines.filter((line, index) => line.length > 0 && !excluded.has(index));

  const facilityCards = parseFacilities(facilitiesSection.section);
  const doctorCards = parseDoctors(doctorsSection.section);

  return (
    <div className="space-y-3">
      {remaining.length > 0 && <div>{formatMessage(remaining.join("\n"))}</div>}
      {ambulanceCards}
      {healthTips}
      {symptomCard}
      {pregnancyCard}
      {vaccinationCards}
      {/* Facilities Card */}
      {facilityCards.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Search className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">Healthcare Facilities</p>
                <p className="text-sm text-white/80">{facilityCards.length} {facilityCards.length === 1 ? 'result' : 'results'} found</p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {facilityCards.map((card, index) => (
              <div
                key={`${card.name}-${index}`}
                className="rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50/50 to-cyan-50/30 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-xl bg-white shadow-sm border border-teal-100 flex items-center justify-center flex-shrink-0">
                      <Search className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-900">{card.name}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {card.district && (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-white rounded-full px-2 py-0.5 border border-slate-100">
                            <MapPin className="h-3 w-3" />
                            {card.district}
                          </span>
                        )}
                        {card.type && (
                          <span className="inline-flex items-center text-xs text-teal-700 bg-teal-100 rounded-full px-2 py-0.5 font-medium">
                            {card.type}
                          </span>
                        )}
                        {card.opd && (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-white rounded-full px-2 py-0.5 border border-slate-100">
                            <Clock className="h-3 w-3" />
                            OPD: {card.opd}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {card.rating && card.rating !== "N/A" && (
                    <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-1.5 rounded-lg">
                      <span className="text-amber-500">★</span>
                      <span className="text-sm font-bold">{card.rating}</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="mt-3 space-y-2">
                  {card.address && card.address !== "N/A" && (
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      {card.address}
                    </div>
                  )}
                  {card.specialties && card.specialties !== "N/A" && (
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <Sparkles className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      {card.specialties}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {card.phone && card.phone !== "N/A" && (
                    <a
                      href={`tel:${sanitizePhone(card.phone)}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-teal-600 text-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-teal-700 transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      Call {card.phone}
                    </a>
                  )}
                  {card.mapUrl && card.mapUrl !== "N/A" && (
                    <a
                      href={card.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-white border border-teal-200 text-teal-700 px-4 py-2.5 text-sm font-semibold hover:bg-teal-50 transition-colors"
                    >
                      <MapPin className="h-4 w-4" />
                      View Map
                    </a>
                  )}
                  {card.emergency && card.emergency !== "N/A" && (
                    <span className="inline-flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2.5 text-sm font-semibold">
                      <AlertTriangle className="h-4 w-4" />
                      Emergency: {card.emergency}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Doctors Card */}
      {doctorCards.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600 to-teal-600 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <HeartPulse className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">Doctors</p>
                <p className="text-sm text-white/80">{doctorCards.length} {doctorCards.length === 1 ? 'doctor' : 'doctors'} found</p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {doctorCards.map((card, index) => (
              <div
                key={`${card.name}-${index}`}
                className="rounded-xl border border-cyan-100 bg-gradient-to-br from-cyan-50/50 to-teal-50/30 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-600 to-teal-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                      {card.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-900">{card.name}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {card.specialty && (
                          <span className="inline-flex items-center text-xs text-cyan-700 bg-cyan-100 rounded-full px-2.5 py-1 font-semibold">
                            {card.specialty}
                          </span>
                        )}
                        {card.availability && (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-white rounded-full px-2 py-0.5 border border-slate-100">
                            <Clock className="h-3 w-3" />
                            {card.availability}
                          </span>
                        )}
                      </div>
                      {card.facility && (
                        <p className="mt-1 text-sm text-slate-500">{card.facility}</p>
                      )}
                    </div>
                  </div>
                  {card.rating && card.rating !== "N/A" && (
                    <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-1.5 rounded-lg">
                      <span className="text-amber-500">★</span>
                      <span className="text-sm font-bold">{card.rating}</span>
                    </div>
                  )}
                </div>

                {/* Address */}
                {card.address && card.address !== "N/A" && (
                  <div className="mt-3 flex items-start gap-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    {card.address}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {card.phone && card.phone !== "N/A" && (
                    <a
                      href={`tel:${sanitizePhone(card.phone)}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-teal-600 text-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-teal-700 transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      Call {card.phone}
                    </a>
                  )}
                  {card.mapUrl && card.mapUrl !== "N/A" && (
                    <a
                      href={card.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-white border border-teal-200 text-teal-700 px-4 py-2.5 text-sm font-semibold hover:bg-teal-50 transition-colors"
                    >
                      <MapPin className="h-4 w-4" />
                      View Map
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const STORAGE_KEY = "xappy_chat_conversation_id";
type ChatMode = "safety" | "healthcare-demo" | "property";

// Modern welcome message format for Xappy AI assistant
const DEMO_WELCOME_MESSAGE = "__MAYA_WELCOME__";

// Suggestion chips with icons - Property Development
const SUGGESTION_CHIPS = {
  reports: [
    { label: "Progress Report", query: "I want to report construction progress", icon: ClipboardList, color: "primary" },
    { label: "Defect/Snag", query: "report a defect", icon: AlertTriangle, color: "warning" },
    { label: "Safety Incident", query: "report a safety incident", icon: Flame, color: "pink" },
    { label: "Site Inspection", query: "log a site inspection", icon: Search, color: "purple" },
    { label: "Shift Handover", query: "shift handover", icon: ArrowLeftRight, color: "success" },
  ],
  queries: [
    { label: "My Reports", query: "show my reports", icon: FileText, color: "primary" },
    { label: "Pending", query: "show pending reports", icon: Clock, color: "warning" },
    { label: "Recent Activity", query: "show recent activity", icon: ClipboardList, color: "success" },
  ],
};

const PROPERTY_SUGGESTION_CHIPS = [
  { label: "Progress Report", query: "I want to report construction progress", icon: ClipboardList, color: "primary" },
  { label: "Report Defect", query: "report a defect or snag", icon: AlertTriangle, color: "warning" },
  { label: "Safety Incident", query: "report a safety incident", icon: Flame, color: "pink" },
  { label: "Site Inspection", query: "log a site inspection", icon: Search, color: "purple" },
  { label: "Daily Log", query: "submit daily progress log", icon: FileText, color: "success" },
];

const DEMO_SUGGESTION_CHIPS = PROPERTY_SUGGESTION_CHIPS;

export default function ChatPanel({ mode = "safety" }: { mode?: ChatMode }) {
  const isHealthcareDemo = mode === "healthcare-demo";
  const isPropertyMode = mode === "property";
  const isSpecialMode = isHealthcareDemo || isPropertyMode;
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [speechError, setSpeechError] = useState("");
  const [locationPrompt, setLocationPrompt] = useState(false);
  const [pendingLocationQuery, setPendingLocationQuery] = useState<string | null>(null);
  const [locationBusy, setLocationBusy] = useState(false);
  const [language, setLanguage] = useState("en");
  const [speechBase, setSpeechBase] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();
  const speechSupported = mounted && browserSupportsSpeechRecognition;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreen]);

  useEffect(() => {
    if (!isSpecialMode) return;
    if (messages.length === 0) {
      setMessages([
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: DEMO_WELCOME_MESSAGE,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }, [isSpecialMode, messages.length]);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      setConversationId(saved);
    }
  }, []);

  useEffect(() => {
    if (listRef.current) {
      // If only the welcome card is shown, scroll to top; otherwise scroll to bottom
      const isOnlyWelcomeCard = messages.length === 1 &&
        messages[0].role === "assistant" &&
        messages[0].content === DEMO_WELCOME_MESSAGE;

      if (isOnlyWelcomeCard) {
        listRef.current.scrollTop = 0;
      } else {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
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
    setLocationPrompt(false);
    setPendingLocationQuery(null);
    setLocationBusy(false);
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

    if (isHealthcareDemo) {
      const originalQuery = trimmed || "";
      try {
        const response = await apiFetch("/api/v1/healthcare/chat/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: originalQuery,
            sessionId: conversationId || undefined,
            language,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || "Failed to get response");
        }

        if (data.conversationId) {
          setConversationId(data.conversationId);
          sessionStorage.setItem(STORAGE_KEY, data.conversationId);
        }

        const assistantMessage: ExtendedChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.content || "Please provide more details.",
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        if (data.requiresLocation) {
          setLocationPrompt(true);
          setPendingLocationQuery(originalQuery);
        } else {
          setLocationPrompt(false);
          setPendingLocationQuery(null);
        }
      } catch (err: any) {
        setError(err.message || "Unable to send message");
      } finally {
        setSending(false);
      }
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await apiFetch("/api/v1/chat/send", {
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
    if (!speechSupported) {
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

  const welcomeTitle = isHealthcareDemo
    ? "Healthcare Information Hub"
    : isPropertyMode
      ? "Xappy Property Assistant"
      : "Xappy";
  const welcomeSubtitle = isHealthcareDemo
    ? "Information-only guidance for citizens."
    : isPropertyMode
      ? "Site reporting & documentation"
      : "Online";
  const showOnlinePulse = !isHealthcareDemo;

  return (
    <div
      className={`flex flex-col bg-gradient-to-b from-slate-50 to-white shadow-lg border border-slate-200/60 overflow-hidden transition-all duration-300 ${
        isFullScreen
          ? "fixed inset-0 z-50 rounded-none"
          : "h-full rounded-2xl"
      }`}
    >
      {/* Header - Haptik style */}
      <div className="haptik-gradient px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{welcomeTitle}</h2>
              <div className="flex items-center gap-1.5">
                {showOnlinePulse && (
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                )}
                <span className="text-xs text-white/80">{welcomeSubtitle}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isHealthcareDemo && (
              <div className="flex items-center gap-1 rounded-full bg-white/10 p-1 text-xs">
                {[
                  { label: "EN", value: "en" },
                  { label: "TA", value: "ta" },
                  { label: "SI", value: "si" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setLanguage(option.value)}
                    className={`px-2 py-1 rounded-full transition ${
                      language === option.value
                        ? "bg-white text-slate-900"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
            {/* WhatsApp Button */}
            <a
              href="https://wa.me/447734723695?text=Hey%20Xappy%20what%20can%20you%20do%3F"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all"
              title="Chat on WhatsApp"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
            <button
              onClick={resetConversation}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all"
              type="button"
            >
              <RotateCcw className="h-4 w-4" />
              New Chat
            </button>
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="flex items-center justify-center w-9 h-9 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all"
              type="button"
              title={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullScreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          </div>
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
              {isHealthcareDemo
                ? "Healthcare Information Hub"
                : isPropertyMode
                  ? "Xappy Property Assistant"
                  : "Hi there!"}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mb-6">
              {isHealthcareDemo
                ? "This is a government-controlled information hub. It provides guidance without diagnosing or prescribing."
                : isPropertyMode
                  ? "I'm your AI assistant for property development. Report progress, defects, inspections, and more using natural language."
                  : "I&apos;m your AI assistant for safety reporting. Report incidents, near misses, spills, and more using natural language."}
            </p>

            {/* Suggestion Chips - Report Types */}
            <div className="w-full max-w-md mb-4">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
                {isHealthcareDemo ? "Demo Flows" : isPropertyMode ? "Quick Report" : "Quick Report"}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {(isHealthcareDemo || isPropertyMode ? PROPERTY_SUGGESTION_CHIPS : SUGGESTION_CHIPS.reports).map((chip) => {
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
                {isHealthcareDemo ? "Start" : isPropertyMode ? "Get Started" : "View Reports"}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {(isHealthcareDemo
                  ? [
                      { label: "Start Demo", query: "Hi", icon: Sparkles, color: "primary" },
                      { label: "Home Menu", query: "help", icon: ClipboardList, color: "success" },
                    ]
                  : isPropertyMode
                    ? [
                        { label: "Start Chat", query: "Hi", icon: Sparkles, color: "primary" },
                        { label: "View Reports", query: "show my reports", icon: FileText, color: "success" },
                      ]
                    : SUGGESTION_CHIPS.queries
                ).map((chip) => {
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
                {/* Xappy Welcome Card - Special Rendering */}
                {msg.role === "assistant" && msg.content === "__MAYA_WELCOME__" && isSpecialMode ? (
                  <div className="mb-4">
                    {renderXappyWelcomeCard((query) => {
                      setInput(query);
                      // Auto-submit the query
                      setTimeout(() => {
                        const form = document.querySelector("form");
                        if (form) form.requestSubmit();
                      }, 100);
                    })}
                  </div>
                ) : (
                  <>
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
                          ? (isHealthcareDemo ? formatHealthcareMessage(msg.content) : formatMessage(msg.content))
                          : msg.content}
                      </div>
                    </div>
                  </>
                )}

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

            {/* Quick suggestion chips after messages - hide on welcome card */}
            {messages.length > 0 && !sending && messages[messages.length - 1].role === "assistant" && !messages[messages.length - 1].draftState && !messages[messages.length - 1].submissionResult && messages[messages.length - 1].content !== "__MAYA_WELCOME__" && (
              <div className="ml-10 mt-2">
                <div className="flex flex-wrap gap-2">
                  {(isSpecialMode ? PROPERTY_SUGGESTION_CHIPS.slice(0, 3) : SUGGESTION_CHIPS.reports.slice(0, 3)).map((chip) => {
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

      {/* Location prompt */}
      {locationPrompt && (
        <div className="border-t border-slate-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-center justify-between">
          <span>Share location to find nearby services.</span>
          <button
            type="button"
            onClick={() => {
              if (!navigator.geolocation || locationBusy) return;
              setLocationBusy(true);
              navigator.geolocation.getCurrentPosition(
                async (pos) => {
                  try {
                    const response = await apiFetch("/api/v1/healthcare/chat/send", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        message: pendingLocationQuery || "near me",
                        sessionId: conversationId || undefined,
                        language,
                        location: {
                          latitude: pos.coords.latitude,
                          longitude: pos.coords.longitude,
                          accuracy: pos.coords.accuracy,
                        },
                      }),
                    });
                    const data = await response.json();
                    if (!response.ok) {
                      throw new Error(data.detail || "Failed to get response");
                    }
                    if (data.conversationId) {
                      setConversationId(data.conversationId);
                      sessionStorage.setItem(STORAGE_KEY, data.conversationId);
                    }
                    const assistantMessage: ExtendedChatMessage = {
                      id: crypto.randomUUID(),
                      role: "assistant",
                      content: data.content || "Please provide more details.",
                      createdAt: new Date().toISOString(),
                    };
                    setMessages((prev) => [...prev, assistantMessage]);
                    setLocationPrompt(false);
                    setPendingLocationQuery(null);
                  } catch (err: any) {
                    setError(err.message || "Unable to send message");
                  } finally {
                    setLocationBusy(false);
                  }
                },
                () => {
                  setError("Location permission denied.");
                  setLocationBusy(false);
                }
              );
            }}
            className="rounded-full bg-amber-600 text-white px-4 py-2 text-xs font-semibold hover:bg-amber-500"
          >
            {locationBusy ? "Requesting..." : "Share location"}
          </button>
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
            disabled={sending || !speechSupported}
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
