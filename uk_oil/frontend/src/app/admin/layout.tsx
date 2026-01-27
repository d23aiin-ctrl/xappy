"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Users,
  Building2,
  ScrollText,
  Settings,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  MessageCircle,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Chat Reporting", href: "/admin/chat", icon: MessageCircle },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Sites", href: "/admin/sites", icon: Building2 },
  { name: "Audit Trail", href: "/admin/audit", icon: ScrollText },
];

export default function AdminLayout({
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
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Check if user has admin access
      const adminRoles = ["admin", "super_admin"];
      if (!adminRoles.includes(parsedUser.role)) {
        router.push("/supervisor/overview");
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-gray-900 to-gray-800 shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
            <Link href="/admin" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-white" />
              <div>
                <span className="text-xl font-bold text-white">Xappy</span>
                <span className="block text-xs text-gray-400">Administration</span>
              </div>
            </Link>
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
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
                  className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition ${
                    isActive
                      ? "bg-white text-gray-900"
                      : "text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-gray-700">
              <Link
                href="/supervisor/overview"
                className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-400 rounded-lg hover:bg-gray-700 transition"
              >
                <Building2 className="h-5 w-5 mr-3" />
                Supervisor View
              </Link>
              <Link
                href="/hse/overview"
                className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-400 rounded-lg hover:bg-gray-700 transition"
              >
                <Shield className="h-5 w-5 mr-3" />
                HSE Dashboard
              </Link>
            </div>
          </nav>

          {/* User section */}
          <div className="border-t border-gray-700 p-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium">
                {user?.full_name?.charAt(0) || "A"}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {user?.full_name || "Admin"}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {user?.role?.replace("_", " ") || "Administrator"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-700 transition"
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
        <header className="sticky top-0 z-30 bg-white border-b h-16 flex items-center px-4">
          <button
            className="lg:hidden mr-4"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6 text-gray-500" />
          </button>
          <div className="flex items-center">
            <Settings className="h-6 w-6 text-gray-600 mr-2" />
            <h1 className="text-lg font-semibold text-gray-900">
              System Administration
            </h1>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
