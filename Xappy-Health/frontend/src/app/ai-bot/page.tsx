"use client";

import { Fraunces, Space_Grotesk } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const homeMenu = [
  { code: "1", title: "Find Hospital / Doctor", detail: "Hospitals, clinics, doctors, specialties." },
  { code: "2", title: "Emergency Help", detail: "Urgency check, contacts, urgent care guidance." },
  { code: "3", title: "Check Symptoms", detail: "Basic guidance with three minimal questions." },
  { code: "4", title: "Vaccination & Health Programs", detail: "Schedules, campaigns, local centers." },
  { code: "5", title: "Health Tips & Prevention", detail: "Friendly habits and prevention tips." },
  { code: "6", title: "Patient Support", detail: "Appointments, reminders, lab report help." },
  { code: "7", title: "Pregnancy & Childcare", detail: "Antenatal, nutrition, milestones." },
  { code: "8", title: "Health Alerts", detail: "Official advisories only." },
  { code: "9", title: "Feedback / Complaint", detail: "Feedback and complaint tickets." },
  { code: "0", title: "Change Language", detail: "Switch language anytime." },
];

const flowCards = [
  {
    title: "Find Hospital / Doctor",
    steps: [
      "Choose: hospital, doctor, specialty, or back.",
      "Ask district (Colombo, Gampaha, Kandy, Jaffna, Galle, Other).",
      "Return scannable results with hours and phone.",
      "Doctor search: specialty or location, one question at a time.",
    ],
  },
  {
    title: "Emergency Help",
    steps: [
      "Confirm urgency: yes, no, or back.",
      "If yes: hard stop with emergency services message.",
      "If no: show contacts, nearest hospital, or urgent care guidance.",
    ],
  },
  {
    title: "Check Symptoms",
    steps: [
      "Select symptom: fever, cough, headache, stomach pain, etc.",
      "Ask three questions: onset, severity (1-10), danger signs.",
      "Provide calm guidance and escalation if danger signs.",
    ],
  },
  {
    title: "Vaccination & Health Programs",
    steps: [
      "Pick program: child schedule, special days, dengue, COVID, centers.",
      "Ask district and return relevant guidance.",
    ],
  },
  {
    title: "Health Tips & Prevention",
    steps: [
      "Pick topic: diabetes, BP, dengue, diet, mental wellbeing.",
      "Output: what to do, what to avoid, when to see a doctor.",
    ],
  },
  {
    title: "Patient Support",
    steps: [
      "Appointment request: district, facility, department, date/time.",
      "Medicine reminders: name and time only, no dosage talk.",
      "Lab report help: test value, fasting or after food, disclaimer.",
    ],
  },
  {
    title: "Pregnancy & Childcare",
    steps: [
      "Options: antenatal visits, nutrition, child schedule, milestones.",
      "Back available at every step.",
    ],
  },
  {
    title: "Health Alerts",
    steps: [
      "Alerts: current area alerts, subscribe, unsubscribe, back.",
      "Official advisories only.",
    ],
  },
  {
    title: "Feedback / Complaint",
    steps: [
      "Choose feedback or complaint.",
      "Complaint flow: category, facility, description.",
      "Return ticket ID and confirmation.",
    ],
  },
];

const guardrails = [
  "Recording-only information, no medical advice or diagnosis.",
  "Never more than 5-7 options on a screen.",
  "One question at a time with clear Back / Home.",
  "Emergency path escalates immediately with no extra prompts.",
  "Language persists for the session and is always accessible.",
];

export default function AiBotPage() {
  return (
    <div className={`${spaceGrotesk.className} relative overflow-hidden bg-slate-950 text-white`}>
      <div className="absolute inset-0 hero-grid" aria-hidden="true" />
      <div className="absolute -top-24 left-10 h-56 w-56 rounded-full blur-3xl orb orb-cyan" aria-hidden="true" />
      <div className="absolute top-32 right-[-60px] h-64 w-64 rounded-full blur-3xl orb orb-amber" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.2em] text-white/70">
              Agentic Flow Spec
            </div>
            <h1 className={`${fraunces.className} text-4xl font-semibold leading-tight md:text-5xl`}>
              Healthcare Information Hub AI Bot
            </h1>
            <p className="text-base text-white/70 md:text-lg">
              A modern, safety-first, multilingual agent built for public health guidance. The bot
              is strictly informational, focuses on clarity, and keeps decisions with patients and
              providers.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                Entry flow with language selection
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                One question at a time
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                Emergency hard-stop safety
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_-45px_rgba(15,118,110,0.6)]">
            <div className="text-sm uppercase tracking-[0.3em] text-white/50">
              Entry Flow
            </div>
            <div className="mt-4 space-y-4 text-sm text-white/80">
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <div className="text-white">Welcome to the Healthcare Information Hub</div>
                <div className="mt-2 text-white/60">
                  I provide health information and guidance (not medical advice).
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <div className="text-white">Choose your language</div>
                <div className="mt-3 grid gap-2">
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <span>Sinhala</span>
                    <span className="text-xs text-white/60">Option 1</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <span>Tamil</span>
                    <span className="text-xs text-white/60">Option 2</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <span>English</span>
                    <span className="text-xs text-white/60">Option 3</span>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-4 text-xs uppercase tracking-[0.25em] text-white/60">
                After selection -> Home Menu
              </div>
            </div>
          </div>
        </div>

        <section className="mt-16 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-white/50">Home Menu</div>
            <h2 className={`${fraunces.className} mt-3 text-2xl text-white`}>
              How can I help you today?
            </h2>
            <p className="mt-3 text-sm text-white/70">
              The menu stays friendly, short, and always includes language switching and back
              actions.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {homeMenu.map((item) => (
              <div
                key={item.code}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm font-semibold">
                  {item.code}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{item.title}</div>
                  <div className="mt-1 text-xs text-white/60">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Core Flows</div>
              <h2 className={`${fraunces.className} mt-3 text-3xl text-white`}>
                Step-by-step conversational guidance
              </h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70">
              Safe and compliant
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {flowCards.map((card) => (
              <div
                key={card.title}
                className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-[0_15px_40px_-25px_rgba(14,116,144,0.55)]"
              >
                <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                <ul className="mt-4 space-y-2 text-sm text-white/70">
                  {card.steps.map((step) => (
                    <li key={step} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-white/50">Guardrails</div>
            <h2 className={`${fraunces.className} mt-3 text-2xl text-white`}>
              Built for trust and clarity
            </h2>
            <ul className="mt-5 space-y-3 text-sm text-white/75">
              {guardrails.map((rule) => (
                <li key={rule} className="flex gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-emerald-300" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-white/50">Outputs</div>
            <h2 className={`${fraunces.className} mt-3 text-2xl text-white`}>
              Scannable, calm, and human
            </h2>
            <div className="mt-5 space-y-4 text-sm text-white/70">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-white">Hospital results format</div>
                <div className="mt-2 text-white/60">
                  Kandy General Hospital | OPD: 8am-4pm | Phone: xxxx
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-white">Symptom guidance format</div>
                <div className="mt-2 text-white/60">
                  Rest, hydrate, monitor symptoms, seek care if worsening after 2-3 days.
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-white">Ticket confirmations</div>
                <div className="mt-2 text-white/60">
                  Appointment request and complaint ticket IDs for follow-up.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Next Steps</div>
              <h2 className={`${fraunces.className} mt-3 text-2xl text-white`}>
                Extend the bot experience
              </h2>
              <p className="mt-3 text-sm text-white/70">
                I can convert this into WhatsApp scripts, a Codex prompt, a flow diagram, or an
                optimized version for elderly and rural users.
              </p>
            </div>
            <div className="grid gap-3 text-sm text-white/70">
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                1. WhatsApp message scripts
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                2. Codex prompt to build the flow
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                3. Flow diagram for presentation
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                4. Optimization for elderly or rural users
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .hero-grid {
          background-image:
            linear-gradient(120deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px),
            linear-gradient(30deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
          background-size: 80px 80px, 120px 120px;
          opacity: 0.4;
        }
        .orb {
          animation: float 14s ease-in-out infinite;
        }
        .orb-cyan {
          background: radial-gradient(circle, rgba(34, 211, 238, 0.6), transparent 70%);
        }
        .orb-amber {
          animation-delay: -6s;
          background: radial-gradient(circle, rgba(251, 191, 36, 0.5), transparent 70%);
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(18px);
          }
        }
      `}</style>
    </div>
  );
}
