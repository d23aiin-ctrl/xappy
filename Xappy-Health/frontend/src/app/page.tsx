"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowUpRight,
  Bell,
  CalendarClock,
  ClipboardList,
  FileText,
  Globe,
  HeartPulse,
  LineChart,
  Stethoscope,
} from "lucide-react";
import { Fraunces, Space_Grotesk } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dashboardStats = [
  { label: "Facilities", value: "312", detail: "Across 9 provinces" },
  { label: "Active Campaigns", value: "7", detail: "Polio and dengue" },
  { label: "Lab Queries", value: "18.4k", detail: "Last 30 days" },
  { label: "Complaints", value: "96%", detail: "Resolved within 10 days" },
];

const diseaseTrends = [
  { label: "Dengue", value: 68, color: "bg-rose-400" },
  { label: "Respiratory", value: 52, color: "bg-amber-400" },
  { label: "Diabetes", value: 42, color: "bg-emerald-400" },
  { label: "Hypertension", value: 36, color: "bg-sky-400" },
];

const useCases = [
  {
    title: "Hospital and Doctor Directory",
    detail: "Find facilities, specialties, availability, and contact details.",
    icon: Stethoscope,
  },
  {
    title: "Symptom Guidance",
    detail: "Basic triage with safety escalation and no diagnosis.",
    icon: HeartPulse,
  },
  {
    title: "Vaccination and Campaigns",
    detail: "Publish vaccination drives and public health advisories.",
    icon: CalendarClock,
  },
  {
    title: "Lab Report Understanding",
    detail: "Explain values in simple language with clear disclaimers.",
    icon: FileText,
  },
  {
    title: "Complaint and Feedback",
    detail: "Ticketed accountability with tracked resolution.",
    icon: ClipboardList,
  },
  {
    title: "Emergency Services",
    detail: "Fast access to nearest facilities and emergency numbers.",
    icon: Bell,
  },
];

const insightCards = [
  {
    title: "Disease Hotspots",
    detail: "Identify spikes by district and plan outreach.",
    value: "4 districts flagged",
  },
  {
    title: "Vaccination Coverage",
    detail: "Monitor low coverage zones by age group.",
    value: "82% average coverage",
  },
  {
    title: "Resource Forecast",
    detail: "Predict OPD load and vaccine stock requirements.",
    value: "+12% expected next week",
  },
];

const alerts = [
  { title: "Dengue advisory", meta: "Gampaha - Today" },
  { title: "Heatwave guidance", meta: "Colombo - 2 days" },
  { title: "Polio drive update", meta: "Kandy - 4 days" },
];

export default function HomePage() {
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`${spaceGrotesk.className} min-h-screen bg-[#f7f5f2] text-slate-900 overflow-hidden`}
    >
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#e8f1ff,transparent_55%)]" />
        <div
          className="absolute -right-32 top-[-120px] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-emerald-200/60 via-sky-200/40 to-transparent blur-3xl"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        />
        <div
          className="absolute -left-36 bottom-[-200px] h-[520px] w-[520px] rounded-full bg-gradient-to-br from-amber-200/50 via-rose-200/40 to-transparent blur-3xl"
          style={{ transform: `translateY(${scrollY * -0.08}px)` }}
        />
      </div>

      <header className="sticky top-0 z-40 backdrop-blur-lg bg-[#f7f5f2]/80 border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center">
              <Image src="/logo.png" alt="Xappy Health" width={36} height={36} />
            </div>
            <div>
              <div className={`${fraunces.className} text-lg`}>Xappy Health</div>
              <div className="text-xs text-slate-500">Healthcare Information Hub</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a className="text-slate-600 hover:text-slate-900" href="#dashboard">
              Dashboard
            </a>
            <a className="text-slate-600 hover:text-slate-900" href="#use-cases">
              Use cases
            </a>
            <a className="text-slate-600 hover:text-slate-900" href="#admin">
              Ministry tools
            </a>
          </div>
          <button
            onClick={() => router.push("/auth/login")}
            className="rounded-full bg-slate-900 text-white px-5 py-2 text-sm hover:bg-slate-800"
          >
            Sign in
          </button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-1 text-xs uppercase tracking-[0.25em] text-slate-500">
            Government controlled
          </div>
          <h1 className={`${fraunces.className} text-4xl md:text-5xl leading-tight`}>
            A national view of health needs, services, and citizen support.
          </h1>
          <p className="text-slate-600 text-base md:text-lg">
            Xappy Health powers a multilingual information hub and a decision dashboard for Sri
            Lanka. It delivers safe guidance, campaign updates, and accountable feedback without
            diagnosing or prescribing.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/hse/chat")}
              className="rounded-full bg-emerald-600 text-white px-6 py-3 text-sm font-semibold hover:bg-emerald-500"
            >
              Launch demo chat
            </button>
            <button
              onClick={() => router.push("/ai-bot")}
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-slate-400"
            >
              View AI flow
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4">
            {dashboardStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                <div className="text-xs text-slate-500 uppercase tracking-wide">{stat.label}</div>
                <div className="text-2xl font-semibold text-slate-900">{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.detail}</div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-[32px] border border-slate-200 bg-white/80 p-6 shadow-[0_30px_60px_-40px_rgba(15,23,42,0.6)]"
          id="dashboard"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Live overview</div>
              <div className={`${fraunces.className} text-2xl mt-2`}>Disease signals</div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <LineChart className="w-4 h-4" />
              7-day trend
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {diseaseTrends.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-24 text-sm text-slate-600">{item.label}</div>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`${item.color} h-full`} style={{ width: `${item.value}%` }} />
                </div>
                <div className="w-10 text-sm text-slate-500 text-right">{item.value}%</div>
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {insightCards.map((card) => (
              <div key={card.title} className="rounded-2xl bg-slate-50 p-3 border border-slate-200">
                <div className="text-xs text-slate-500 uppercase tracking-wide">{card.title}</div>
                <div className="text-sm font-semibold text-slate-800 mt-2">{card.value}</div>
                <div className="text-xs text-slate-500">{card.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="use-cases" className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Citizen services</div>
            <h2 className={`${fraunces.className} text-3xl mt-2`}>Five safe, high-impact flows</h2>
          </div>
          <div className="text-sm text-slate-500">Multilingual - Sinhala - Tamil - English</div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {useCases.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-3xl border border-slate-200 bg-white/80 p-5 flex gap-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-900">{item.title}</div>
                  <div className="text-sm text-slate-600">{item.detail}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section id="admin" className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
          <div className="space-y-5">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Ministry controls</div>
            <h2 className={`${fraunces.className} text-3xl`}>Policy-led dashboard</h2>
            <p className="text-slate-600">
              Content is curated by ministry teams. The AI retrieves approved content only, with
              audit logs for every interaction and escalation.
            </p>
            <div className="grid gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                <div className="text-sm font-semibold">Campaign editor</div>
                <div className="text-xs text-slate-500">Publish polio and dengue drives.</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                <div className="text-sm font-semibold">Alerts console</div>
                <div className="text-xs text-slate-500">Push outbreak warnings with safety guidance.</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                <div className="text-sm font-semibold">Complaint tracker</div>
                <div className="text-xs text-slate-500">Route tickets and monitor resolution.</div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white/80 p-6">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Live alerts</div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Globe className="w-4 h-4" /> Province feed
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {alerts.map((alert) => (
                <div key={alert.title} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <div className="text-sm font-semibold">{alert.title}</div>
                    <div className="text-xs text-slate-500">{alert.meta}</div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400" />
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-900 text-white p-4">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Audit trail</div>
              <div className="mt-2 text-sm">Escalation triggered - Symptom flow - Kandy</div>
              <div className="text-xs text-white/60">Logged 2 minutes ago</div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="rounded-[36px] bg-slate-900 text-white p-8 md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">National health data</div>
              <h2 className={`${fraunces.className} text-3xl mt-2`}>Prepared for predictive insights</h2>
              <p className="text-white/70 mt-3 max-w-2xl">
                Forecast admissions, flag supply risks, and map service coverage. Use analytics to
                allocate mobile clinics and prevent stock-outs.
              </p>
            </div>
            <button className="rounded-full bg-white text-slate-900 px-6 py-3 text-sm font-semibold hover:bg-slate-100">
              View analytics
            </button>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <div className="text-sm font-semibold">Outbreak prediction</div>
              <div className="text-xs text-white/60">Dengue risk modeled with weather feeds.</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <div className="text-sm font-semibold">Resource allocation</div>
              <div className="text-xs text-white/60">Auto-suggest staffing based on intake.</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <div className="text-sm font-semibold">Unified health records</div>
              <div className="text-xs text-white/60">Interoperable data with audit controls.</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
