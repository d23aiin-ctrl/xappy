"use client";

import { useEffect, useState } from "react";
import {
  Wrench,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle,
  User,
  Home,
  Calendar,
  MoreVertical,
  ChevronRight,
} from "lucide-react";
import type { MaintenanceIssue, IssuePriority, IssueStatus, IssueCategory } from "@/types";

const priorityColors: Record<IssuePriority, { bg: string; text: string; label: string }> = {
  critical: { bg: "bg-red-100", text: "text-red-700", label: "Critical" },
  high: { bg: "bg-orange-100", text: "text-orange-700", label: "High" },
  medium: { bg: "bg-amber-100", text: "text-amber-700", label: "Medium" },
  low: { bg: "bg-green-100", text: "text-green-700", label: "Low" },
};

const statusColors: Record<IssueStatus, { bg: string; text: string; label: string }> = {
  reported: { bg: "bg-gray-100", text: "text-gray-700", label: "Reported" },
  acknowledged: { bg: "bg-blue-100", text: "text-blue-700", label: "Acknowledged" },
  assessing: { bg: "bg-indigo-100", text: "text-indigo-700", label: "Assessing" },
  awaiting_approval: { bg: "bg-purple-100", text: "text-purple-700", label: "Awaiting Approval" },
  approved: { bg: "bg-purple-100", text: "text-purple-700", label: "Approved" },
  rejected: { bg: "bg-red-100", text: "text-red-700", label: "Rejected" },
  assigned: { bg: "bg-cyan-100", text: "text-cyan-700", label: "Assigned" },
  scheduled: { bg: "bg-teal-100", text: "text-teal-700", label: "Scheduled" },
  in_progress: { bg: "bg-amber-100", text: "text-amber-700", label: "In Progress" },
  on_hold: { bg: "bg-gray-100", text: "text-gray-700", label: "On Hold" },
  parts_ordered: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Parts Ordered" },
  completed: { bg: "bg-green-100", text: "text-green-700", label: "Completed" },
  verified: { bg: "bg-green-100", text: "text-green-700", label: "Verified" },
  closed: { bg: "bg-gray-100", text: "text-gray-500", label: "Closed" },
  cancelled: { bg: "bg-gray-100", text: "text-gray-500", label: "Cancelled" },
};

const categoryLabels: Record<IssueCategory, string> = {
  plumbing: "Plumbing",
  electrical: "Electrical",
  heating: "Heating",
  appliances: "Appliances",
  structural: "Structural",
  windows_doors: "Windows & Doors",
  roofing: "Roofing",
  damp_mould: "Damp & Mould",
  pest_control: "Pest Control",
  garden_exterior: "Garden/Exterior",
  security: "Security",
  fire_safety: "Fire Safety",
  gas: "Gas",
  cleaning: "Cleaning",
  general: "General",
  other: "Other",
};

interface MockIssue extends Partial<MaintenanceIssue> {
  property_address?: string;
  tenant_name?: string;
  time_remaining?: string;
}

const mockIssues: MockIssue[] = [
  {
    id: "1",
    reference: "MAINT-001",
    title: "Boiler not heating water",
    category: "heating",
    priority: "critical",
    status: "in_progress",
    is_emergency: true,
    property_address: "Flat 5, Riverside Court, SW1A 1AA",
    tenant_name: "John Smith",
    reported_at: "2024-01-28T09:00:00Z",
    sla_deadline: "2024-01-28T13:00:00Z",
    sla_breached: false,
    time_remaining: "2h 30m",
  },
  {
    id: "2",
    reference: "MAINT-002",
    title: "Leaking tap in kitchen",
    category: "plumbing",
    priority: "medium",
    status: "assigned",
    is_emergency: false,
    property_address: "23 Victoria Gardens, M1 2AB",
    tenant_name: "Sarah Johnson",
    reported_at: "2024-01-27T14:00:00Z",
    sla_deadline: "2024-01-30T14:00:00Z",
    sla_breached: false,
    time_remaining: "2d 4h",
  },
  {
    id: "3",
    reference: "MAINT-003",
    title: "Broken window lock",
    category: "security",
    priority: "high",
    status: "awaiting_approval",
    is_emergency: false,
    property_address: "15 Park Lane, B1 3CD",
    tenant_name: "Emma Brown",
    reported_at: "2024-01-26T11:00:00Z",
    sla_deadline: "2024-01-27T11:00:00Z",
    sla_breached: true,
    time_remaining: "Breached",
  },
  {
    id: "4",
    reference: "MAINT-004",
    title: "Damp patch on ceiling",
    category: "damp_mould",
    priority: "medium",
    status: "reported",
    is_emergency: false,
    property_address: "8 Queens Road, LS1 4EF",
    tenant_name: "Michael Williams",
    reported_at: "2024-01-28T08:00:00Z",
    sla_deadline: "2024-01-31T08:00:00Z",
    sla_breached: false,
    time_remaining: "2d 22h",
  },
];

export default function MaintenancePage() {
  const [issues, setIssues] = useState<MockIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    setTimeout(() => {
      setIssues(mockIssues);
      setLoading(false);
    }, 500);
  }, []);

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.property_address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === "all" || issue.priority === priorityFilter;
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const stats = {
    total: issues.length,
    breached: issues.filter((i) => i.sla_breached).length,
    atRisk: issues.filter((i) => !i.sla_breached && i.priority === "critical").length,
    inProgress: issues.filter((i) => i.status === "in_progress").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage maintenance issues and jobs ({issues.length} open issues)
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
          <Plus className="h-5 w-5 mr-2" />
          Log Issue
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Open Issues</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <Wrench className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">SLA Breached</p>
              <p className="text-2xl font-bold text-red-600">{stats.breached}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Critical</p>
              <p className="text-2xl font-bold text-orange-600">{stats.atRisk}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-green-600">{stats.inProgress}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="reported">Reported</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="awaiting_approval">Awaiting Approval</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.map((issue) => (
          <div
            key={issue.id}
            className={`bg-white rounded-xl border ${
              issue.sla_breached ? "border-red-300" : "border-gray-200"
            } p-4 hover:shadow-md transition cursor-pointer`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-500">{issue.reference}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[issue.priority!]?.bg} ${priorityColors[issue.priority!]?.text}`}>
                    {priorityColors[issue.priority!]?.label}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[issue.status!]?.bg} ${statusColors[issue.status!]?.text}`}>
                    {statusColors[issue.status!]?.label}
                  </span>
                  {issue.is_emergency && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      Emergency
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{issue.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{categoryLabels[issue.category!]}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Home className="h-4 w-4 mr-1" />
                    {issue.property_address}
                  </span>
                  <span className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {issue.tenant_name}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {issue.reported_at ? new Date(issue.reported_at).toLocaleDateString() : "-"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end ml-4">
                <div className={`text-sm font-medium ${issue.sla_breached ? "text-red-600" : "text-gray-600"}`}>
                  <Clock className="h-4 w-4 inline mr-1" />
                  {issue.time_remaining}
                </div>
                <button className="mt-2 p-1.5 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredIssues.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
