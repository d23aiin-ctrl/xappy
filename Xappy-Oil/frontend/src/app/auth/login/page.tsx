"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Shield,
  CreditCard,
  Phone,
  Lock,
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  ChevronLeft,
  Users,
  HardHat,
  ShieldCheck,
  UserCog,
} from "lucide-react";

const DEMO_ACCOUNTS = [
  { badge: "SUP001", role: "Supervisor", name: "Amit Kumar", icon: HardHat, color: "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100" },
  { badge: "HSE001", role: "HSE Manager", name: "Rajesh Sharma", icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100" },
  { badge: "HSE002", role: "HSE Officer", name: "Priya Desai", icon: Shield, color: "text-teal-600 bg-teal-50 border-teal-200 hover:bg-teal-100" },
  { badge: "ADMIN001", role: "Admin", name: "Vikram Mehta", icon: UserCog, color: "text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100" },
];

type LoginMethod = "badge" | "phone";

// Get redirect URL based on user role
const getRedirectUrl = (role: string): string => {
  switch (role) {
    case "super_admin":
    case "admin":
      return "/admin";
    case "hse_manager":
    case "hse_officer":
    case "compliance_officer":
    case "operations_director":
      return "/hse/overview";
    case "supervisor":
    case "site_manager":
    default:
      return "/supervisor/overview";
  }
};

export default function LoginPage() {
  const router = useRouter();
  const [method, setMethod] = useState<LoginMethod>("badge");
  const [badgeNumber, setBadgeNumber] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleBadgeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/auth/badge-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badge_number: badgeNumber, pin }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Route to appropriate dashboard based on role
      const redirectUrl = getRedirectUrl(data.user.role);
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to send OTP");
      }

      setOtpSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phoneNumber, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Invalid OTP");
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Route to appropriate dashboard based on role
      const redirectUrl = getRedirectUrl(data.user.role);
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/30" />

        {/* Animated gradient blobs */}
        <div className="absolute w-[600px] h-[600px] bg-gradient-to-br from-blue-200/40 to-purple-200/30 rounded-full blur-3xl animate-float-slow"
          style={{ right: '-150px', top: '-150px' }}
        />
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-emerald-200/30 to-cyan-200/20 rounded-full blur-3xl animate-float-slower"
          style={{ left: '-150px', bottom: '-150px' }}
        />

        {/* Mouse-following gradient */}
        <div
          className="absolute w-[300px] h-[300px] bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl pointer-events-none transition-all duration-700 ease-out"
          style={{
            left: mousePosition.x - 150,
            top: mousePosition.y - 150,
          }}
        />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #0067DD 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Back to Home Button */}
      <button
        onClick={() => router.push("/")}
        className={`absolute top-6 left-6 flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-all duration-300 group ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
        }`}
      >
        <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Home</span>
      </button>

      {/* Main Content */}
      <div className={`w-full max-w-md px-6 transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl overflow-hidden mb-6 shadow-xl shadow-blue-500/20 animate-glow-pulse">
            <Image
              src="/logo.png"
              alt="Xappy"
              width={96}
              height={96}
              className="object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-600">
            Sign in to access your safety dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 transition-all duration-300 hover:shadow-3xl">
          {/* Login Method Tabs */}
          <div className="flex rounded-2xl bg-slate-100 p-1.5 mb-8">
            <button
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                method === "badge"
                  ? "bg-white text-blue-600 shadow-lg shadow-blue-500/10"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setMethod("badge")}
            >
              <CreditCard className={`h-4 w-4 mr-2 transition-transform ${method === 'badge' ? 'scale-110' : ''}`} />
              Badge Login
            </button>
            <button
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                method === "phone"
                  ? "bg-white text-blue-600 shadow-lg shadow-blue-500/10"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setMethod("phone")}
            >
              <Phone className={`h-4 w-4 mr-2 transition-transform ${method === 'phone' ? 'scale-110' : ''}`} />
              Phone OTP
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-3 animate-scale-in">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-red-500">!</span>
              </div>
              {error}
            </div>
          )}

          {/* Badge Login Form */}
          {method === "badge" ? (
            <form onSubmit={handleBadgeLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Badge Number
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={badgeNumber}
                    onChange={(e) => setBadgeNumber(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-300"
                    placeholder="Enter your badge number"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  PIN
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type={showPin ? "text" : "password"}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-300"
                    placeholder="Enter your PIN"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl text-white font-semibold haptik-gradient shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Phone OTP Form */
            <form
              onSubmit={otpSent ? handleVerifyOtp : (e) => { e.preventDefault(); handleSendOtp(); }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Phone Number
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    placeholder="+91 98765 43210"
                    disabled={otpSent}
                    required
                  />
                </div>
              </div>

              {otpSent && (
                <div className="space-y-2 animate-scale-in">
                  <label className="block text-sm font-medium text-slate-700">
                    OTP Code
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-300 tracking-[0.5em] text-center font-mono text-lg"
                      placeholder="••••••"
                      maxLength={6}
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500 text-center mt-2">
                    Enter the 6-digit code sent to your phone
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl text-white font-semibold haptik-gradient shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Please wait...
                  </>
                ) : otpSent ? (
                  <>
                    Verify OTP
                    <CheckCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </>
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {otpSent && (
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-full text-sm text-slate-500 hover:text-blue-600 transition-colors py-2"
                >
                  Change phone number
                </button>
              )}
            </form>
          )}
        </div>

        {/* Demo Accounts */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-slate-400" />
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Demo Accounts</p>
            <span className="text-[10px] text-slate-400 ml-auto">PIN: 1234</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((account) => {
              const Icon = account.icon;
              return (
                <button
                  key={account.badge}
                  type="button"
                  onClick={() => { setBadgeNumber(account.badge); setPin("1234"); setMethod("badge"); setError(""); }}
                  className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${account.color}`}
                >
                  <span className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    {account.role}
                  </span>
                  <span className="text-[10px] opacity-70">{account.badge}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Security Badges */}
        <div className="flex items-center justify-center gap-6 mt-6">
          {[
            { icon: Shield, text: "SOC 2" },
            { icon: Lock, text: "Encrypted" },
            { icon: CheckCircle, text: "GDPR" },
          ].map((badge, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 text-xs text-slate-400 transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${800 + i * 100}ms` }}
            >
              <badge.icon className="h-4 w-4 text-emerald-500" />
              {badge.text}
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          By signing in, you agree to our{" "}
          <a href="#" className="text-blue-500 hover:underline">Terms of Service</a>
          {" "}and{" "}
          <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>
        </p>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-8 left-8 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-2xl blur-xl animate-float" />
      <div className="absolute top-1/4 right-8 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-xl blur-lg animate-float-delayed" />
    </div>
  );
}
