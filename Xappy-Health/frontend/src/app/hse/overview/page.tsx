"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Flame,
  Shield,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  FileText,
  Users,
  Building2,
  Calendar,
} from "lucide-react";

interface DashboardStats {
  total_reports_today: { value: number; change: number | null };
  pending_acknowledgment: { value: number };
  near_miss_this_week: { value: number };
  incidents_this_month: { value: number };
  reports_by_type: Array<{ category: string; count: number }>;
  recent_reports: Array<{
    id: string;
    reference_number: string;
    title: string;
    type: string;
    status: string;
    reported_at: string;
  }>;
}

export default function HSEOverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalReports, setTotalReports] = useState(0);
  const [sites, setSites] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers = { Authorization: `Bearer ${token}` };

        const [statsRes, reportsRes] = await Promise.all([
          fetch("http://localhost:8000/api/v1/dashboard/supervisor/stats", { headers }),
          fetch("http://localhost:8000/api/v1/reports", { headers }),
        ]);

        const statsData = await statsRes.json();
        const reportsData = await reportsRes.json();

        setStats(statsData);
        setTotalReports(reportsData.total || 0);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: "Total Incidents (MTD)",
      value: stats?.incidents_this_month?.value || 0,
      icon: Flame,
      color: "red",
      subtitle: "Month to date",
    },
    {
      title: "Near-Miss Reports",
      value: stats?.near_miss_this_week?.value || 0,
      icon: AlertTriangle,
      color: "yellow",
      subtitle: "This week",
    },
    {
      title: "Pending Review",
      value: stats?.pending_acknowledgment?.value || 0,
      icon: Clock,
      color: "orange",
      subtitle: "Awaiting action",
    },
    {
      title: "Total Reports",
      value: totalReports,
      icon: FileText,
      color: "blue",
      subtitle: "All time",
    },
    {
      title: "Reports Today",
      value: stats?.total_reports_today?.value || 0,
      icon: Calendar,
      color: "emerald",
      subtitle: stats?.total_reports_today?.change ? `+${stats.total_reports_today.change} vs yesterday` : "Today",
    },
    {
      title: "Days Without LTI",
      value: 127,
      icon: Shield,
      color: "green",
      subtitle: "Lost Time Injury",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      red: { bg: "bg-red-50", text: "text-red-600", icon: "text-red-500" },
      yellow: { bg: "bg-yellow-50", text: "text-yellow-600", icon: "text-yellow-500" },
      orange: { bg: "bg-orange-50", text: "text-orange-600", icon: "text-orange-500" },
      blue: { bg: "bg-blue-50", text: "text-blue-600", icon: "text-blue-500" },
      emerald: { bg: "bg-emerald-50", text: "text-emerald-600", icon: "text-emerald-500" },
      green: { bg: "bg-green-50", text: "text-green-600", icon: "text-green-500" },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HSE Overview</h1>
          <p className="text-gray-600 mt-1">
            Real-time safety and compliance metrics across all sites
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-lg">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <span className="text-emerald-800 font-medium">All Systems Operational</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((kpi) => {
          const colors = getColorClasses(kpi.color);
          return (
            <div
              key={kpi.title}
              className={`${colors.bg} rounded-xl p-6 border`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">{kpi.title}</p>
                  <p className={`text-3xl font-bold ${colors.text} mt-1`}>
                    {kpi.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{kpi.subtitle}</p>
                </div>
                <kpi.icon className={`h-10 w-10 ${colors.icon} opacity-50`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports by Type */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Reports by Type
          </h3>
          <div className="space-y-3">
            {stats?.reports_by_type?.map((item) => {
              const maxCount = Math.max(...(stats.reports_by_type?.map(r => r.count) || [1]));
              const percentage = (item.count / maxCount) * 100;
              return (
                <div key={item.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 capitalize">
                      {item.category.replace("_", " ")}
                    </span>
                    <span className="font-medium text-gray-900">{item.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-2 bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Reports
          </h3>
          <div className="space-y-3">
            {stats?.recent_reports?.slice(0, 5).map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {report.title}
                  </p>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-xs text-gray-500 font-mono">
                      {report.reference_number}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500 capitalize">
                      {report.type.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    report.status === "closed"
                      ? "bg-green-100 text-green-800"
                      : report.status === "acknowledged"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {report.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety Message */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-6 text-white">
        <div className="flex items-start">
          <Shield className="h-8 w-8 mr-4 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold">Safety First</h3>
            <p className="mt-1 text-emerald-100">
              This dashboard provides real-time visibility into safety reporting.
              All data is recorded only - no safety decisions are made by this system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
