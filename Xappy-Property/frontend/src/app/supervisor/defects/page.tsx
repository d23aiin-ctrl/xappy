"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Building2,
  Wrench,
} from "lucide-react";

interface DefectReport {
  id: string;
  reference_number: string;
  title: string;
  category: string;
  priority: string;
  defect_status: string;
  building_block: string;
  unit_number: string;
  contractor_responsible: string;
  target_completion_date: string;
  reported_at: string;
}

const mockDefects: DefectReport[] = [
  {
    id: "1",
    reference_number: "XP-DS-20260128-0001",
    title: "Water seepage in bathroom wall",
    category: "waterproofing",
    priority: "critical",
    defect_status: "open",
    building_block: "Tower A",
    unit_number: "A-1201",
    contractor_responsible: "ABC Waterproofing Ltd",
    target_completion_date: "2026-01-30",
    reported_at: "2026-01-28T08:30:00Z",
  },
  {
    id: "2",
    reference_number: "XP-DS-20260127-0002",
    title: "Electrical socket not working",
    category: "electrical",
    priority: "high",
    defect_status: "in_progress",
    building_block: "Tower B",
    unit_number: "B-504",
    contractor_responsible: "PowerTech Electrical",
    target_completion_date: "2026-01-29",
    reported_at: "2026-01-27T14:00:00Z",
  },
  {
    id: "3",
    reference_number: "XP-DS-20260126-0003",
    title: "Paint peeling in living room",
    category: "finishing",
    priority: "medium",
    defect_status: "assigned",
    building_block: "Tower A",
    unit_number: "A-803",
    contractor_responsible: "Elite Painters",
    target_completion_date: "2026-02-05",
    reported_at: "2026-01-26T10:00:00Z",
  },
  {
    id: "4",
    reference_number: "XP-DS-20260125-0004",
    title: "HVAC not cooling properly",
    category: "hvac",
    priority: "high",
    defect_status: "pending_verification",
    building_block: "Tower C",
    unit_number: "C-1102",
    contractor_responsible: "CoolAir Systems",
    target_completion_date: "2026-01-28",
    reported_at: "2026-01-25T16:30:00Z",
  },
  {
    id: "5",
    reference_number: "XP-DS-20260124-0005",
    title: "Door alignment issue",
    category: "carpentry",
    priority: "low",
    defect_status: "closed",
    building_block: "Podium",
    unit_number: "Shop 12",
    contractor_responsible: "WoodWorks Inc",
    target_completion_date: "2026-01-27",
    reported_at: "2026-01-24T11:00:00Z",
  },
];

export default function DefectsPage() {
  const [defects, setDefects] = useState<DefectReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDefects(mockDefects);
      setLoading(false);
    }, 500);
  }, []);

  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      critical: { color: "bg-red-100 text-red-700 border-red-200", label: "Critical" },
      high: { color: "bg-orange-100 text-orange-700 border-orange-200", label: "High" },
      medium: { color: "bg-amber-100 text-amber-700 border-amber-200", label: "Medium" },
      low: { color: "bg-slate-100 text-slate-700 border-slate-200", label: "Low" },
    };
    const badge = badges[priority] || badges.medium;
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      open: {
        color: "bg-red-100 text-red-700",
        icon: <XCircle className="w-4 h-4" />,
        label: "Open",
      },
      assigned: {
        color: "bg-blue-100 text-blue-700",
        icon: <AlertCircle className="w-4 h-4" />,
        label: "Assigned",
      },
      in_progress: {
        color: "bg-amber-100 text-amber-700",
        icon: <Clock className="w-4 h-4" />,
        label: "In Progress",
      },
      pending_verification: {
        color: "bg-purple-100 text-purple-700",
        icon: <AlertTriangle className="w-4 h-4" />,
        label: "Pending Verification",
      },
      closed: {
        color: "bg-emerald-100 text-emerald-700",
        icon: <CheckCircle2 className="w-4 h-4" />,
        label: "Closed",
      },
    };
    const badge = badges[status] || badges.open;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      waterproofing: "💧",
      electrical: "⚡",
      plumbing: "🔧",
      finishing: "🎨",
      carpentry: "🪚",
      hvac: "❄️",
      structural: "🏗️",
      fire_safety: "🔥",
    };
    return icons[category] || "🔨";
  };

  const filteredDefects = defects.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.reference_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.unit_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || d.defect_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: defects.length,
    open: defects.filter((d) => d.defect_status === "open").length,
    in_progress: defects.filter((d) => d.defect_status === "in_progress").length,
    pending_verification: defects.filter((d) => d.defect_status === "pending_verification").length,
    closed: defects.filter((d) => d.defect_status === "closed").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Defects & Snags</h1>
          <p className="text-slate-600 mt-1">Track and manage construction defects</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition">
          <Plus className="w-5 h-5" />
          Report Defect
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Open</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{statusCounts.open}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">In Progress</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{statusCounts.in_progress}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Pending Verification</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{statusCounts.pending_verification}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Closed</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{statusCounts.closed}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
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
            placeholder="Search by title, reference, or unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="all">All Status ({statusCounts.all})</option>
          <option value="open">Open ({statusCounts.open})</option>
          <option value="in_progress">In Progress ({statusCounts.in_progress})</option>
          <option value="pending_verification">Pending Verification ({statusCounts.pending_verification})</option>
          <option value="closed">Closed ({statusCounts.closed})</option>
        </select>
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
          <Filter className="w-5 h-5 text-slate-500" />
          More Filters
        </button>
      </div>

      {/* Defects List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : filteredDefects.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No defects found</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredDefects.map((defect) => (
              <div
                key={defect.id}
                className="p-4 hover:bg-slate-50 cursor-pointer transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">
                      {getCategoryIcon(defect.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-mono text-slate-500">
                          {defect.reference_number}
                        </span>
                        {getPriorityBadge(defect.priority)}
                        {getStatusBadge(defect.defect_status)}
                      </div>
                      <h3 className="font-semibold text-slate-900">{defect.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {defect.building_block}
                        </span>
                        <span>Unit {defect.unit_number}</span>
                        <span className="capitalize">{defect.category.replace("_", " ")}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span>Contractor: {defect.contractor_responsible}</span>
                        <span>Due: {new Date(defect.target_completion_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
