"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  LayoutDashboard,
  Settings,
  LogOut,
  Menu,
  X,
  MessageCircle,
  Building2,
  Stethoscope,
  HeartPulse,
  Siren,
  BarChart3,
  Pill,
  CalendarCheck,
  HelpCircle,
} from "lucide-react";

const navItems = [
  { name: "Overview", href: "/supervisor/overview", icon: LayoutDashboard },
  { name: "Chat Assistant", href: "/supervisor/chat", icon: MessageCircle },
  { name: "Hospitals", href: "/supervisor/hospitals", icon: Building2 },
  { name: "Doctors", href: "/supervisor/doctors", icon: Stethoscope },
  { name: "Health Tips", href: "/supervisor/health-tips", icon: HeartPulse },
  { name: "Pharmacy", href: "/supervisor/pharmacy", icon: Pill },
  { name: "Appointments", href: "/supervisor/appointments", icon: CalendarCheck },
  { name: "Emergency", href: "/supervisor/emergency", icon: Siren },
  { name: "Reports", href: "/supervisor/reports", icon: BarChart3 },
  { name: "Help & Support", href: "/supervisor/help", icon: HelpCircle },
  { name: "Settings", href: "/supervisor/settings", icon: Settings },
];

export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");

    if (!token) {
      router.push("/auth/login");
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-xappy-light">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-teal-800 via-teal-700 to-teal-800 text-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
            <Link href="/supervisor/overview" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white">Xappy Health</span>
            </Link>
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white/70" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white font-medium">
                {user?.full_name?.charAt(0) || "U"}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {user?.full_name || "User"}
                </p>
                <p className="text-xs text-white/70 capitalize">
                  {user?.role?.replace("_", " ") || "Supervisor"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-white/80 rounded-lg hover:bg-white/10 transition"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-teal-700 border-b border-white/10 h-16 flex items-center px-4">
          <button
            className="lg:hidden mr-4"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6 text-white/80" />
          </button>
          <h1 className="text-lg font-semibold text-white">Dashboard</h1>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
