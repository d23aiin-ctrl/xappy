"use client";

import { useState } from "react";
import {
  FileText,
  Search,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Calendar,
  User,
  Building2,
  TrendingUp,
  Wrench,
  HardHat,
  ClipboardList,
  Hammer,
} from "lucide-react";

// Sample property development reports data
const sampleReports = [
  {
    id: "RPT-2026-001",
    reference_number: "RPT-2026-001",
    report_type: "construction_progress",
    title: "Weekly Progress Report - Block A Foundation",
    status: "completed",
    reporter: { full_name: "Rajesh Kumar" },
    site: "Prestige Towers Phase 1",
    reported_at: "2026-01-20T10:30:00",
    units: 48,
  },
  {
    id: "RPT-2026-002",
    reference_number: "RPT-2026-002",
    report_type: "defect_snag",
    title: "Waterproofing Defect - Basement Level 2",
    status: "under_review",
    reporter: { full_name: "Priya Sharma" },
    site: "Green Valley Residences",
    reported_at: "2026-01-19T14:15:00",
    units: 12,
  },
  {
    id: "RPT-2026-003",
    reference_number: "RPT-2026-003",
    report_type: "site_inspection",
    title: "RERA Compliance Inspection - Tower B",
    status: "in_progress",
    reporter: { full_name: "Amit Patel" },
    site: "Skyline Apartments",
    reported_at: "2026-01-18T09:00:00",
    units: 96,
  },
  {
    id: "RPT-2026-004",
    reference_number: "RPT-2026-004",
    report_type: "safety_incident",
    title: "Minor Scaffolding Incident - Tower C",
    status: "completed",
    reporter: { full_name: "Safety Officer Singh" },
    site: "Metro Business Park",
    reported_at: "2026-01-17T16:45:00",
    units: 1,
  },
  {
    id: "RPT-2026-005",
    reference_number: "RPT-2026-005",
    report_type: "daily_progress_log",
    title: "Daily Progress Log - Jan 16, 2026",
    status: "completed",
    reporter: { full_name: "Vikram Reddy" },
    site: "Palm Grove Villas",
    reported_at: "2026-01-16T18:20:00",
    units: 24,
  },
  {
    id: "RPT-2026-006",
    reference_number: "RPT-2026-006",
    report_type: "defect_snag",
    title: "Electrical Wiring Issue - Units 301-305",
    status: "submitted",
    reporter: { full_name: "Electrical Supervisor Rajan" },
    site: "Prestige Towers Phase 1",
    reported_at: "2026-01-15T13:30:00",
    units: 5,
  },
  {
    id: "RPT-2026-007",
    reference_number: "RPT-2026-007",
    report_type: "shift_handover",
    title: "Night Shift Handover - Concreting Team",
    status: "completed",
    reporter: { full_name: "Foreman Suresh" },
    site: "Green Valley Residences",
    reported_at: "2026-01-14T06:00:00",
    units: 8,
  },
  {
    id: "RPT-2026-008",
    reference_number: "RPT-2026-008",
    report_type: "construction_progress",
    title: "Monthly Progress - Structural Work",
    status: "acknowledged",
    reporter: { full_name: "Project Manager Mehra" },
    site: "Skyline Apartments",
    reported_at: "2026-01-13T08:45:00",
    units: 120,
  },
  {
    id: "RPT-2026-009",
    reference_number: "RPT-2026-009",
    report_type: "toolbox_talk",
    title: "Safety Toolbox Talk - Crane Operations",
    status: "completed",
    reporter: { full_name: "HSE Manager Verma" },
    site: "Metro Business Park",
    reported_at: "2026-01-12T07:00:00",
    units: 35,
  },
  {
    id: "RPT-2026-010",
    reference_number: "RPT-2026-010",
    report_type: "site_inspection",
    title: "Quality Audit - Finishing Work Block D",
    status: "in_progress",
    reporter: { full_name: "QC Inspector Das" },
    site: "Palm Grove Villas",
    reported_at: "2026-01-11T12:30:00",
    units: 16,
  },
];

const reportTypes = [
  { value: "", label: "All Types" },
  { value: "construction_progress", label: "Progress Report" },
  { value: "defect_snag", label: "Defect/Snag" },
  { value: "safety_incident", label: "Safety Incident" },
  { value: "site_inspection", label: "Site Inspection" },
  { value: "daily_progress_log", label: "Daily Log" },
  { value: "shift_handover", label: "Shift Handover" },
  { value: "toolbox_talk", label: "Toolbox Talk" },
];

const statuses = [
  { value: "", label: "All Status" },
  { value: "submitted", label: "Submitted" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "under_review", label: "Under Review" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      submitted: "bg-blue-100 text-blue-700",
      acknowledged: "bg-purple-100 text-purple-700",
      under_review: "bg-amber-100 text-amber-700",
      in_progress: "bg-orange-100 text-orange-700",
      completed: "bg-green-100 text-green-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      construction_progress: <TrendingUp className="h-4 w-4" />,
      defect_snag: <AlertTriangle className="h-4 w-4" />,
      safety_incident: <HardHat className="h-4 w-4" />,
      site_inspection: <ClipboardList className="h-4 w-4" />,
      daily_progress_log: <FileText className="h-4 w-4" />,
      shift_handover: <User className="h-4 w-4" />,
      toolbox_talk: <Hammer className="h-4 w-4" />,
    };
    return icons[type] || <FileText className="h-4 w-4" />;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      construction_progress: "bg-blue-100 text-blue-700",
      defect_snag: "bg-amber-100 text-amber-700",
      safety_incident: "bg-red-100 text-red-700",
      site_inspection: "bg-emerald-100 text-emerald-700",
      daily_progress_log: "bg-slate-100 text-slate-700",
      shift_handover: "bg-purple-100 text-purple-700",
      toolbox_talk: "bg-teal-100 text-teal-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const filteredReports = sampleReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reference_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !typeFilter || report.report_type === typeFilter;
    const matchesStatus = !statusFilter || report.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Stats
  const totalReports = sampleReports.length;
  const completedReports = sampleReports.filter(r => r.status === 'completed').length;
  const pendingReports = sampleReports.filter(r => r.status === 'under_review' || r.status === 'in_progress').length;
  const totalUnits = sampleReports.reduce((sum, r) => sum + r.units, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Site Reports</h1>
          <p className="text-slate-500 mt-1">View and manage construction reports</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          <Download className="h-4 w-4" />
          Export Reports
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalReports}</p>
              <p className="text-xs text-slate-500">Total Reports</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{completedReports}</p>
              <p className="text-xs text-slate-500">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{pendingReports}</p>
              <p className="text-xs text-slate-500">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalUnits}</p>
              <p className="text-xs text-slate-500">Units Covered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Reporter
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>No reports found matching your criteria</p>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-blue-600">
                        {report.reference_number}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(report.report_type)}`}>
                        {getTypeIcon(report.report_type)}
                        {report.report_type.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-slate-900 truncate">{report.title}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Building2 className="h-3 w-3" />
                          {report.site}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-medium">
                          {report.reporter.full_name.charAt(0)}
                        </div>
                        <span className="text-sm text-slate-700">{report.reporter.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(report.status)}`}>
                        {report.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                        {report.status === 'in_progress' && <Clock className="h-3 w-3" />}
                        {report.status === 'under_review' && <Eye className="h-3 w-3" />}
                        {report.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {new Date(report.reported_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Report"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing <span className="font-medium">{filteredReports.length}</span> of{" "}
            <span className="font-medium">{sampleReports.length}</span> reports
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              1
            </button>
            <button className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
              2
            </button>
            <button className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
