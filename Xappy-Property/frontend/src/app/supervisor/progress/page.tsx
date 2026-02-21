"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Building2,
  Users,
  Clock,
  Plus,
  Search,
  Filter,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock3,
} from "lucide-react";

interface ProgressReport {
  id: string;
  reference_number: string;
  title: string;
  building_block: string;
  floor_level: string;
  actual_progress_percent: number;
  workers_present: number;
  weather_conditions: string;
  delays_if_any: string;
  status: string;
  reported_at: string;
}

const mockProgressReports: ProgressReport[] = [
  {
    id: "1",
    reference_number: "XP-CP-20260128-0001",
    title: "Tower A Foundation Work",
    building_block: "Tower A",
    floor_level: "Basement",
    actual_progress_percent: 75,
    workers_present: 45,
    weather_conditions: "sunny",
    delays_if_any: "",
    status: "on_schedule",
    reported_at: "2026-01-28T10:00:00Z",
  },
  {
    id: "2",
    reference_number: "XP-CP-20260128-0002",
    title: "Tower B Structural Work",
    building_block: "Tower B",
    floor_level: "5th Floor",
    actual_progress_percent: 60,
    workers_present: 38,
    weather_conditions: "cloudy",
    delays_if_any: "Material delivery delayed by 2 days",
    status: "delayed",
    reported_at: "2026-01-28T09:30:00Z",
  },
  {
    id: "3",
    reference_number: "XP-CP-20260127-0003",
    title: "Podium MEP Installation",
    building_block: "Podium",
    floor_level: "Ground Floor",
    actual_progress_percent: 85,
    workers_present: 22,
    weather_conditions: "sunny",
    delays_if_any: "",
    status: "ahead",
    reported_at: "2026-01-27T16:00:00Z",
  },
];

export default function ProgressPage() {
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setReports(mockProgressReports);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      on_schedule: {
        color: "bg-emerald-100 text-emerald-700",
        icon: <CheckCircle2 className="w-4 h-4" />,
        label: "On Schedule",
      },
      ahead: {
        color: "bg-blue-100 text-blue-700",
        icon: <TrendingUp className="w-4 h-4" />,
        label: "Ahead",
      },
      delayed: {
        color: "bg-amber-100 text-amber-700",
        icon: <Clock3 className="w-4 h-4" />,
        label: "Delayed",
      },
      critical_delay: {
        color: "bg-red-100 text-red-700",
        icon: <AlertCircle className="w-4 h-4" />,
        label: "Critical",
      },
    };
    const badge = badges[status] || badges.on_schedule;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 80) return "bg-emerald-500";
    if (percent >= 60) return "bg-blue-500";
    if (percent >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  const filteredReports = reports.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.building_block.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reference_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Construction Progress</h1>
          <p className="text-slate-600 mt-1">Track daily construction progress across all sites</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition">
          <Plus className="w-5 h-5" />
          New Progress Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Reports Today</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">12</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Active Blocks</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">8</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Workers On Site</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">156</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Avg Progress</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">73%</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, block, or reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
          <Filter className="w-5 h-5 text-slate-500" />
          Filter
        </button>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : filteredReports.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No progress reports found</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="p-4 hover:bg-slate-50 cursor-pointer transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-mono text-slate-500">
                        {report.reference_number}
                      </span>
                      {getStatusBadge(report.status)}
                    </div>
                    <h3 className="font-semibold text-slate-900 truncate">
                      {report.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {report.building_block}
                      </span>
                      <span>{report.floor_level}</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {report.workers_present} workers
                      </span>
                    </div>
                    {report.delays_if_any && (
                      <p className="mt-2 text-sm text-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {report.delays_if_any}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">
                        {report.actual_progress_percent}%
                      </div>
                      <div className="text-xs text-slate-500">Progress</div>
                    </div>
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor(report.actual_progress_percent)}`}
                        style={{ width: `${report.actual_progress_percent}%` }}
                      />
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 mt-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
