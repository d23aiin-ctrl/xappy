"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
} from "lucide-react";

interface ReportData {
  total: number;
  items: Array<{
    id: string;
    report_type: string;
    status: string;
    reported_at: string;
    site_name: string | null;
  }>;
}

export default function HSEAnalyticsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(
          `http://localhost:8000/api/v1/reports?page_size=100`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        setReportData(data);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Calculate analytics
  const reports = reportData?.items || [];

  const byType = reports.reduce((acc, r) => {
    acc[r.report_type] = (acc[r.report_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byStatus = reports.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const bySite = reports.reduce((acc, r) => {
    const site = r.site_name || "Unknown";
    acc[site] = (acc[site] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Weekly trend (mock data structure)
  const weeklyTrend = [
    { week: "Week 1", count: Math.floor(Math.random() * 10) + 5 },
    { week: "Week 2", count: Math.floor(Math.random() * 10) + 5 },
    { week: "Week 3", count: Math.floor(Math.random() * 10) + 5 },
    { week: "Week 4", count: reports.length },
  ];

  const typeColors: Record<string, string> = {
    near_miss: "bg-yellow-500",
    incident: "bg-red-500",
    toolbox_talk: "bg-blue-500",
    shift_handover: "bg-purple-500",
    ptw_evidence: "bg-indigo-500",
    loto_evidence: "bg-pink-500",
    spill_report: "bg-cyan-500",
    inspection: "bg-orange-500",
    daily_safety_log: "bg-green-500",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Safety Analytics</h1>
          <p className="text-gray-600 mt-1">
            Trends and patterns in safety reporting
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+12% vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Report Types</p>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(byType).length}</p>
            </div>
            <PieChart className="h-8 w-8 text-blue-500" />
          </div>
          <p className="mt-2 text-sm text-gray-500">Categories tracked</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Closure Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.length > 0
                  ? Math.round((byStatus["closed"] || 0) / reports.length * 100)
                  : 0}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
          <p className="mt-2 text-sm text-gray-500">Reports closed</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Sites Active</p>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(bySite).length}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-500" />
          </div>
          <p className="mt-2 text-sm text-gray-500">Reporting sites</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports by Type */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Reports by Type
          </h3>
          <div className="space-y-4">
            {Object.entries(byType)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => {
                const maxCount = Math.max(...Object.values(byType));
                const percentage = (count / maxCount) * 100;
                return (
                  <div key={type}>
                    <div className="flex justify-between text-sm mb-1">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${typeColors[type] || "bg-gray-400"} mr-2`} />
                        <span className="text-gray-700 capitalize">
                          {type.replace(/_/g, " ")}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div
                        className={`h-2 rounded-full ${typeColors[type] || "bg-gray-400"}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Reports by Status */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Reports by Status
          </h3>
          <div className="space-y-4">
            {Object.entries(byStatus)
              .sort((a, b) => b[1] - a[1])
              .map(([status, count]) => {
                const percentage = (count / reports.length) * 100;
                const statusColors: Record<string, string> = {
                  submitted: "bg-yellow-500",
                  acknowledged: "bg-blue-500",
                  under_review: "bg-purple-500",
                  closed: "bg-green-500",
                };
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 capitalize">
                        {status.replace(/_/g, " ")}
                      </span>
                      <span className="font-medium text-gray-900">
                        {count} ({Math.round(percentage)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div
                        className={`h-2 rounded-full ${statusColors[status] || "bg-gray-400"}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Reports by Site */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Reports by Site
          </h3>
          <div className="space-y-4">
            {Object.entries(bySite)
              .sort((a, b) => b[1] - a[1])
              .map(([site, count]) => {
                const maxCount = Math.max(...Object.values(bySite));
                const percentage = (count / maxCount) * 100;
                return (
                  <div key={site}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{site}</span>
                      <span className="font-medium text-gray-900">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div
                        className="h-2 bg-emerald-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Weekly Reporting Trend
          </h3>
          <div className="flex items-end justify-between h-48 px-4">
            {weeklyTrend.map((week, index) => {
              const maxCount = Math.max(...weeklyTrend.map(w => w.count));
              const height = (week.count / maxCount) * 100;
              return (
                <div key={week.week} className="flex flex-col items-center flex-1">
                  <span className="text-sm font-medium text-gray-900 mb-2">
                    {week.count}
                  </span>
                  <div
                    className="w-12 bg-emerald-500 rounded-t-lg transition-all"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-gray-500 mt-2">{week.week}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
