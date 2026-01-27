"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface StatCard {
  title: string;
  value: number;
  change?: number;
  change_period: string;
}

interface Stats {
  total_reports_today: StatCard;
  pending_acknowledgment: StatCard;
  near_miss_this_week: StatCard;
  incidents_this_month: StatCard;
  reports_by_type: { category: string; count: number }[];
  recent_reports: any[];
}

export default function SupervisorOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/v1/dashboard/supervisor/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-xappy-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        Error loading dashboard: {error}
      </div>
    );
  }

  const statCards = [
    {
      ...stats?.total_reports_today,
      icon: FileText,
      color: "bg-blue-500",
    },
    {
      ...stats?.pending_acknowledgment,
      icon: Clock,
      color: "bg-orange-500",
    },
    {
      ...stats?.near_miss_this_week,
      icon: AlertTriangle,
      color: "bg-yellow-500",
    },
    {
      ...stats?.incidents_this_month,
      icon: AlertTriangle,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <button
          onClick={fetchStats}
          className="text-sm text-xappy-primary hover:underline"
        >
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border p-4"
          >
            <div className="flex items-center justify-between">
              <div
                className={`${card.color} p-2 rounded-lg`}
              >
                <card.icon className="h-5 w-5 text-white" />
              </div>
              {card.change !== undefined && card.change !== 0 && (
                <div
                  className={`flex items-center text-sm ${
                    card.change > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {card.change > 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs(card.change)}
                </div>
              )}
            </div>
            <p className="mt-4 text-2xl font-bold text-gray-900">
              {card.value}
            </p>
            <p className="text-sm text-gray-500">{card.title}</p>
            <p className="text-xs text-gray-400 mt-1">{card.change_period}</p>
          </div>
        ))}
      </div>

      {/* Reports by Type */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Reports by Type (This Month)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats?.reports_by_type?.map((item) => (
            <div key={item.category} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-xappy-primary">
                {item.count}
              </p>
              <p className="text-sm text-gray-600 capitalize">
                {item.category.replace(/_/g, " ")}
              </p>
            </div>
          ))}
          {(!stats?.reports_by_type || stats.reports_by_type.length === 0) && (
            <p className="text-gray-500 col-span-4 text-center py-4">
              No reports this month
            </p>
          )}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Reports
        </h3>
        <div className="space-y-3">
          {stats?.recent_reports?.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{report.title}</p>
                  <p className="text-sm text-gray-500">
                    {report.reference_number} &bull;{" "}
                    {new Date(report.reported_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  report.status === "submitted"
                    ? "bg-blue-100 text-blue-800"
                    : report.status === "acknowledged"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {report.status}
              </span>
            </div>
          ))}
          {(!stats?.recent_reports || stats.recent_reports.length === 0) && (
            <p className="text-gray-500 text-center py-4">
              No recent reports
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
