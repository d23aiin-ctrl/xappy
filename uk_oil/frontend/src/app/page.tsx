"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Shield,
  FileText,
  Mic,
  MessageSquare,
  CheckCircle,
  Clock,
  BarChart3,
  AlertTriangle,
  Flame,
  Droplets,
  ClipboardList,
  ArrowRight,
  Sparkles,
  Lock,
  Globe,
  Zap,
  Users,
  Building2,
  ChevronRight,
  Play,
  ArrowDown,
} from "lucide-react";

// Hook for scroll-triggered animations
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}

// Animated counter component
function AnimatedCounter({ value, suffix = "", duration = 2000 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const { ref, isInView } = useInView();

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = value;
    const incrementTime = duration / end;

    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function HomePage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      router.push("/supervisor/overview");
    }

    const timer = setTimeout(() => setIsVisible(true), 100);

    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [router]);

  // Section refs for scroll animations
  const statsSection = useInView(0.2);
  const featuresSection = useInView(0.1);
  const howItWorksSection = useInView(0.1);
  const reportsSection = useInView(0.1);
  const complianceSection = useInView(0.1);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Animated Background with Parallax */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-white" />

        {/* Parallax blobs that move with scroll */}
        <div
          className="absolute w-[800px] h-[800px] bg-gradient-to-br from-blue-100/60 to-purple-100/40 rounded-full blur-3xl transition-transform duration-1000"
          style={{
            transform: `translate(${-100 + scrollY * 0.05}px, ${-200 + scrollY * 0.1}px)`,
            right: '-200px',
            top: '-200px'
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] bg-gradient-to-tr from-emerald-100/40 to-cyan-100/30 rounded-full blur-3xl transition-transform duration-1000"
          style={{
            transform: `translate(${scrollY * 0.03}px, ${scrollY * -0.05}px)`,
            left: '-200px',
            bottom: '-200px'
          }}
        />

        {/* Mouse-following gradient */}
        <div
          className="absolute w-[400px] h-[400px] bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl pointer-events-none transition-all duration-500 ease-out"
          style={{
            left: mousePosition.x - 200,
            top: mousePosition.y - 200,
          }}
        />
      </div>

      {/* Header with glassmorphism */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrollY > 50 ? 'bg-white/90 backdrop-blur-lg shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl overflow-hidden group-hover:scale-110 transition-transform duration-300 shadow-md">
                <Image
                  src="/logo.png"
                  alt="Xappy"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <span className="text-xl font-bold text-slate-900">Xappy</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              {['Features', 'How it Works', 'Reports'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="text-slate-600 hover:text-blue-600 transition relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </nav>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/auth/login")}
                className="text-slate-600 hover:text-blue-600 font-medium transition"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push("/auth/login")}
                className="haptik-gradient text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/25"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div
              className={`space-y-8 transition-all duration-1000 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-600 text-sm font-medium animate-pulse-subtle">
                <Sparkles className="h-4 w-4 animate-spin-slow" />
                AI-Powered Safety Compliance
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                <span className="inline-block animate-slide-up-1">Safety Reporting</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-200 animate-gradient">
                  Made Effortless
                </span>
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed max-w-lg animate-slide-up-2">
                Transform natural conversations into structured, audit-ready safety reports.
                Zero training required. Instant compliance.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-slide-up-3">
                <button
                  onClick={() => router.push("/auth/login")}
                  className="group haptik-gradient text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                </button>
                <button className="group flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold text-slate-700 bg-white border-2 border-slate-200 hover:border-blue-500 hover:text-blue-600 hover:shadow-lg transition-all duration-300">
                  <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-blue-50 group-hover:scale-110 flex items-center justify-center transition-all duration-300">
                    <Play className="h-4 w-4 ml-0.5" />
                  </div>
                  Watch Demo
                </button>
              </div>

              {/* Trust Badges with stagger animation */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                {[
                  { icon: Shield, text: "SOC 2 Compliant", delay: "0" },
                  { icon: Lock, text: "GDPR Ready", delay: "100" },
                  { icon: CheckCircle, text: "ISO 27001", delay: "200" },
                ].map((badge, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-slate-500 animate-fade-in"
                    style={{ animationDelay: `${800 + i * 150}ms` }}
                  >
                    <badge.icon className="h-5 w-5 text-emerald-500" />
                    {badge.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual - Chat Mockup */}
            <div
              className={`relative transition-all duration-1000 delay-300 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="relative">
                {/* Animated glow rings */}
                <div className="absolute -inset-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl animate-pulse-slow" />
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-3xl blur-xl animate-pulse-slower" />

                {/* Chat Card */}
                <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden hover:shadow-3xl transition-shadow duration-500 transform hover:scale-[1.02]">
                  {/* Chat Header */}
                  <div className="haptik-gradient px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center animate-pulse-subtle shadow-inner">
                      <Image
                        src="/logo.png"
                        alt="Xappy"
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Xappy</p>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <p className="text-white/70 text-sm">Online</p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="p-6 space-y-4 bg-gradient-to-b from-slate-50 to-white min-h-[320px]">
                    {/* AI Message */}
                    <div className="flex gap-3 animate-slide-in-left" style={{ animationDelay: '500ms' }}>
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-white flex-shrink-0 shadow-sm">
                        <Image
                          src="/logo.png"
                          alt="Xappy"
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                      <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-md hover:shadow-lg transition-shadow max-w-[280px]">
                        <p className="text-slate-700 text-sm">Hi! I&apos;m here to help you report safety incidents. What would you like to report today?</p>
                      </div>
                    </div>

                    {/* User Message */}
                    <div className="flex gap-3 justify-end animate-slide-in-right" style={{ animationDelay: '800ms' }}>
                      <div className="haptik-gradient rounded-2xl rounded-tr-md px-4 py-3 max-w-[280px] shadow-md">
                        <p className="text-white text-sm">There was a near miss at platform B - a worker slipped on an oil spill</p>
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex gap-3 animate-slide-in-left" style={{ animationDelay: '1100ms' }}>
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-white flex-shrink-0 shadow-sm">
                        <Image
                          src="/logo.png"
                          alt="Xappy"
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                      <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-md max-w-[280px]">
                        <p className="text-slate-700 text-sm">I&apos;ll create a <strong>Near Miss Report</strong> for you. Was anyone injured?</p>
                      </div>
                    </div>

                    {/* Quick Action Chips */}
                    <div className="flex gap-2 pl-11 animate-fade-in" style={{ animationDelay: '1400ms' }}>
                      <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium cursor-pointer hover:bg-emerald-100 hover:scale-105 transition-all shadow-sm">No injuries</span>
                      <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium cursor-pointer hover:bg-amber-100 hover:scale-105 transition-all shadow-sm">Minor injury</span>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl shadow-xl flex items-center justify-center animate-float">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-xl flex items-center justify-center animate-float-delayed">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
                <div className="absolute top-1/2 -right-8 w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg shadow-lg flex items-center justify-center animate-float-slow">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ArrowDown className="h-6 w-6 text-slate-400" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsSection.ref} className="py-20 px-6 bg-slate-900 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 99, suffix: ".9%", label: "Uptime SLA", icon: Zap },
              { value: 50, suffix: "K+", label: "Reports Processed", icon: FileText },
              { value: 2, suffix: "min", label: "Avg. Report Time", icon: Clock, prefix: "<" },
              { value: 100, suffix: "+", label: "Sites Protected", icon: Building2 },
            ].map((stat, index) => (
              <div
                key={index}
                className={`text-center transform transition-all duration-700 ${
                  statsSection.isInView
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white/10 mb-4 hover:bg-white/20 hover:scale-110 transition-all duration-300">
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.prefix}{statsSection.isInView ? <AnimatedCounter value={stat.value} suffix={stat.suffix} /> : `0${stat.suffix}`}
                </p>
                <p className="text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresSection.ref} className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-700 ${
            featuresSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <span className="inline-block px-4 py-2 bg-blue-50 rounded-full text-blue-600 text-sm font-medium mb-4">
              Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Everything You Need for Safety Compliance
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              From voice-based reporting to automated compliance checks, we&apos;ve got you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: MessageSquare, title: "Conversational AI", description: "Natural language understanding extracts all required fields from casual conversations.", color: "blue", gradient: "from-blue-500 to-blue-600" },
              { icon: Mic, title: "Voice Transcription", description: "Accurate voice-to-text in 14+ languages. Perfect for hands-free reporting in the field.", color: "purple", gradient: "from-purple-500 to-purple-600" },
              { icon: FileText, title: "Auto-Generated Reports", description: "Structured, audit-ready reports created automatically from conversations.", color: "emerald", gradient: "from-emerald-500 to-emerald-600" },
              { icon: BarChart3, title: "Real-time Analytics", description: "Live dashboards showing safety trends, incident patterns, and compliance metrics.", color: "amber", gradient: "from-amber-500 to-amber-600" },
              { icon: Lock, title: "Immutable Audit Trail", description: "Hash-chain verified records ensure data integrity for regulatory audits.", color: "pink", gradient: "from-pink-500 to-pink-600" },
              { icon: Globe, title: "Multi-language Support", description: "Report in Hindi, Tamil, Telugu, and more. AI translates to English for records.", color: "cyan", gradient: "from-cyan-500 to-cyan-600" },
            ].map((feature, index) => (
              <div
                key={index}
                className={`group p-8 bg-white rounded-2xl border border-slate-200 hover:border-transparent hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
                  featuresSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" ref={howItWorksSection.ref} className="py-24 px-6 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-700 ${
            howItWorksSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <span className="inline-block px-4 py-2 bg-emerald-50 rounded-full text-emerald-600 text-sm font-medium mb-4">
              How It Works
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Report in 3 Simple Steps
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              No training needed. Just talk naturally and let AI do the rest.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200" />

            {[
              { step: "01", title: "Start a Conversation", description: "Open the app and simply describe what happened in your own words - text or voice.", icon: MessageSquare },
              { step: "02", title: "AI Extracts Details", description: "Our AI understands context and asks follow-up questions to capture all required information.", icon: Sparkles },
              { step: "03", title: "Review & Submit", description: "Preview the structured report, make any edits, and submit with one tap.", icon: CheckCircle },
            ].map((item, index) => (
              <div
                key={index}
                className={`relative text-center transition-all duration-700 ${
                  howItWorksSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="relative inline-block mb-6 group">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center group-hover:shadow-xl transition-shadow">
                      <item.icon className="h-10 w-10 text-blue-600" />
                    </div>
                  </div>
                  <span className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white text-lg font-bold flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 max-w-xs mx-auto">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Report Types Section */}
      <section id="reports" ref={reportsSection.ref} className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-700 ${
            reportsSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <span className="inline-block px-4 py-2 bg-purple-50 rounded-full text-purple-600 text-sm font-medium mb-4">
              Report Types
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Comprehensive Safety Coverage
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              All major HSE report types supported out of the box.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: AlertTriangle, label: "Near Miss", gradient: "from-amber-400 to-orange-500" },
              { icon: Flame, label: "Incidents", gradient: "from-red-400 to-red-600" },
              { icon: Droplets, label: "Spill Reports", gradient: "from-blue-400 to-blue-600" },
              { icon: ClipboardList, label: "Inspections", gradient: "from-emerald-400 to-emerald-600" },
              { icon: Users, label: "Toolbox Talks", gradient: "from-purple-400 to-purple-600" },
              { icon: FileText, label: "Daily Logs", gradient: "from-slate-400 to-slate-600" },
            ].map((type, index) => (
              <div
                key={index}
                className={`group p-6 bg-white rounded-xl border border-slate-200 hover:border-transparent hover:shadow-xl transition-all duration-500 text-center cursor-pointer hover:-translate-y-2 ${
                  reportsSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-br ${type.gradient} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                  <type.icon className="h-7 w-7 text-white" />
                </div>
                <p className="font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{type.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section ref={complianceSection.ref} className="py-24 px-6 bg-slate-900 relative overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className={`transition-all duration-700 ${
              complianceSection.isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}>
              <span className="inline-block px-4 py-2 bg-white/10 rounded-full text-blue-300 text-sm font-medium mb-6">
                Enterprise Ready
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Built for Audit-Grade Compliance
              </h2>
              <p className="text-lg text-slate-300 mb-8">
                Every report is timestamped, immutable, and cryptographically verified.
                Meet regulatory requirements with confidence.
              </p>
              <ul className="space-y-4">
                {[
                  "Immutable audit trail with hash-chain verification",
                  "Role-based access control (RBAC)",
                  "Data encryption at rest and in transit",
                  "Automated backup and disaster recovery",
                  "GDPR, SOC 2, and ISO 27001 compliant",
                ].map((item, index) => (
                  <li
                    key={index}
                    className={`flex items-center gap-3 text-slate-300 transition-all duration-500 ${
                      complianceSection.isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                    }`}
                    style={{ transitionDelay: `${300 + index * 100}ms` }}
                  >
                    <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className={`relative transition-all duration-700 delay-300 ${
              complianceSection.isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl animate-pulse-slow" />
              <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-colors">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: "Data Integrity", value: "100%", icon: Shield },
                    { label: "Audit Score", value: "A+", icon: CheckCircle },
                    { label: "Compliance Rate", value: "99.8%", icon: FileText },
                    { label: "Response Time", value: "<1s", icon: Zap },
                  ].map((metric, index) => (
                    <div
                      key={index}
                      className="bg-white/5 rounded-xl p-5 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
                    >
                      <metric.icon className="h-6 w-6 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                      <p className="text-3xl font-bold text-white mb-1">{metric.value}</p>
                      <p className="text-sm text-slate-400">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-100/50 to-transparent rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Ready to Transform Your Safety Reporting?
          </h2>
          <p className="text-xl text-slate-600 mb-10">
            Join 100+ oil & gas sites using Xappy for compliance-grade safety reporting.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/auth/login")}
              className="group haptik-gradient text-white px-10 py-5 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 flex items-center justify-center gap-2 text-lg"
            >
              Get Started Free
              <ChevronRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
            </button>
            <button className="px-10 py-5 rounded-xl font-semibold text-slate-700 bg-white border-2 border-slate-200 hover:border-blue-500 hover:text-blue-600 hover:shadow-lg transition-all duration-300 text-lg">
              Schedule a Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md">
                  <Image
                    src="/logo.png"
                    alt="Xappy"
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
                <span className="text-xl font-bold">Xappy</span>
              </div>
              <p className="text-slate-400 text-sm">
                AI-powered safety reporting for Oil & Gas operations.
                Recording only. Never makes safety decisions.
              </p>
            </div>
            {[
              { title: "Product", links: ["Features", "How It Works", "Report Types", "Pricing"] },
              { title: "Company", links: ["About Us", "Contact", "Careers", "Blog"] },
              { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Security", "Compliance"] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="hover:text-white transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">© 2024 Xappy. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-sm text-slate-500">
                <Shield className="h-4 w-4 text-emerald-500" />
                SOC 2 Type II
              </span>
              <span className="flex items-center gap-2 text-sm text-slate-500">
                <Lock className="h-4 w-4 text-emerald-500" />
                GDPR Compliant
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
