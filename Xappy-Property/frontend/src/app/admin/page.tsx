"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Building2,
  FileText,
  Shield,
  TrendingUp,
  Activity,
  Server,
  Database,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSites: 3,
    totalReports: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(
          "http://localhost:8000/api/v1/reports",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();

        setStats({
          totalUsers: 21,
          totalSites: 3,
          totalReports: data.total || 0,
          activeUsers: 18,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "blue",
      change: "+3 this month",
    },
    {
      title: "Active Sites",
      value: stats.totalSites,
      icon: Building2,
      color: "green",
      change: "All operational",
    },
    {
      title: "Total Reports",
      value: stats.totalReports,
      icon: FileText,
      color: "purple",
      change: "+8 today",
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: Activity,
      color: "orange",
      change: "Online now: 12",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      blue: { bg: "bg-blue-50", text: "text-blue-600", icon: "text-blue-500" },
      green: { bg: "bg-green-50", text: "text-green-600", icon: "text-green-500" },
      purple: { bg: "bg-purple-50", text: "text-purple-600", icon: "text-purple-500" },
      orange: { bg: "bg-orange-50", text: "text-orange-600", icon: "text-orange-500" },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          System overview and management
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const colors = getColorClasses(card.color);
          return (
            <div key={card.title} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className={`text-3xl font-bold ${colors.text} mt-1`}>
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{card.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${colors.bg}`}>
                  <card.icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            System Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Server className="h-5 w-5 text-gray-500 mr-3" />
                <span className="font-medium">API Server</span>
              </div>
              <span className="flex items-center text-green-600 text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Database className="h-5 w-5 text-gray-500 mr-3" />
                <span className="font-medium">Database</span>
              </div>
              <span className="flex items-center text-green-600 text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-gray-500 mr-3" />
                <span className="font-medium">WhatsApp Gateway</span>
              </div>
              <span className="flex items-center text-yellow-600 text-sm">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                Demo Mode
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <a
              href="/admin/users"
              className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <Users className="h-8 w-8 text-blue-500 mb-2" />
              <span className="text-sm font-medium">Manage Users</span>
            </a>
            <a
              href="/admin/sites"
              className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <Building2 className="h-8 w-8 text-green-500 mb-2" />
              <span className="text-sm font-medium">Manage Sites</span>
            </a>
            <a
              href="/admin/audit"
              className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <FileText className="h-8 w-8 text-purple-500 mb-2" />
              <span className="text-sm font-medium">Audit Trail</span>
            </a>
            <a
              href="/hse/exports"
              className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <TrendingUp className="h-8 w-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium">Export Data</span>
            </a>
          </div>
        </div>
      </div>

      {/* Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h4 className="font-medium text-blue-800">Demo Environment</h4>
            <p className="text-sm text-blue-700 mt-1">
              This is a demonstration environment. WhatsApp and SMS integrations are in mock mode.
              All data is for testing purposes only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
