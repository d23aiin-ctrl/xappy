"use client";

import { useState } from "react";
import {
  FileText,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Calendar,
  User,
  Building2,
  TrendingUp,
  Activity,
  Stethoscope,
  Pill,
  Syringe,
  HeartPulse,
} from "lucide-react";

// Sample healthcare reports data
const sampleReports = [
  {
    id: "RPT-2026-001",
    reference_number: "RPT-2026-001",
    report_type: "patient_visit",
    title: "Monthly Patient Visit Summary - January 2026",
    status: "completed",
    reporter: { full_name: "Dr. Samantha Perera" },
    facility: "National Hospital Colombo",
    reported_at: "2026-01-20T10:30:00",
    patients: 2847,
  },
  {
    id: "RPT-2026-002",
    reference_number: "RPT-2026-002",
    report_type: "disease_outbreak",
    title: "Dengue Cases Spike - Gampaha District",
    status: "under_review",
    reporter: { full_name: "MOH Office Gampaha" },
    facility: "District Health Office",
    reported_at: "2026-01-19T14:15:00",
    patients: 156,
  },
  {
    id: "RPT-2026-003",
    reference_number: "RPT-2026-003",
    report_type: "vaccination",
    title: "Polio Vaccination Drive Progress Report",
    status: "in_progress",
    reporter: { full_name: "Dr. Nimal Fernando" },
    facility: "MOH Kandy",
    reported_at: "2026-01-18T09:00:00",
    patients: 8542,
  },
  {
    id: "RPT-2026-004",
    reference_number: "RPT-2026-004",
    report_type: "lab_report",
    title: "Weekly Lab Test Analysis Report",
    status: "completed",
    reporter: { full_name: "Lab Technician Kumari" },
    facility: "Hemas Hospital Lab",
    reported_at: "2026-01-17T16:45:00",
    patients: 1245,
  },
  {
    id: "RPT-2026-005",
    reference_number: "RPT-2026-005",
    report_type: "emergency",
    title: "Emergency Department Weekly Summary",
    status: "completed",
    reporter: { full_name: "Dr. Anil Rathnayake" },
    facility: "Asiri Central Emergency",
    reported_at: "2026-01-16T11:20:00",
    patients: 423,
  },
  {
    id: "RPT-2026-006",
    reference_number: "RPT-2026-006",
    report_type: "medication",
    title: "Pharmacy Stock & Dispensing Report",
    status: "submitted",
    reporter: { full_name: "Pharmacist Dilini" },
    facility: "State Pharmaceuticals",
    reported_at: "2026-01-15T13:30:00",
    patients: 3156,
  },
  {
    id: "RPT-2026-007",
    reference_number: "RPT-2026-007",
    report_type: "patient_feedback",
    title: "Patient Satisfaction Survey Results",
    status: "completed",
    reporter: { full_name: "Quality Assurance Team" },
    facility: "Lanka Hospitals",
    reported_at: "2026-01-14T10:00:00",
    patients: 892,
  },
  {
    id: "RPT-2026-008",
    reference_number: "RPT-2026-008",
    report_type: "disease_outbreak",
    title: "Respiratory Infection Cases - Colombo",
    status: "acknowledged",
    reporter: { full_name: "CMO Colombo" },
    facility: "District Health Office",
    reported_at: "2026-01-13T08:45:00",
    patients: 234,
  },
  {
    id: "RPT-2026-009",
    reference_number: "RPT-2026-009",
    report_type: "health_screening",
    title: "School Health Screening Program Results",
    status: "completed",
    reporter: { full_name: "Dr. Priya Jayawardena" },
    facility: "MOH Colombo South",
    reported_at: "2026-01-12T15:00:00",
    patients: 1567,
  },
  {
    id: "RPT-2026-010",
    reference_number: "RPT-2026-010",
    report_type: "chronic_disease",
    title: "Diabetes Management Program Monthly Report",
    status: "in_progress",
    reporter: { full_name: "Dr. Rohan De Silva" },
    facility: "Ninewells Hospital",
    reported_at: "2026-01-11T12:30:00",
    patients: 678,
  },
];

const reportTypes = [
  { value: "", label: "All Types" },
  { value: "patient_visit", label: "Patient Visit" },
  { value: "disease_outbreak", label: "Disease Outbreak" },
  { value: "vaccination", label: "Vaccination" },
  { value: "lab_report", label: "Lab Report" },
  { value: "emergency", label: "Emergency" },
  { value: "medication", label: "Medication" },
  { value: "patient_feedback", label: "Patient Feedback" },
  { value: "health_screening", label: "Health Screening" },
  { value: "chronic_disease", label: "Chronic Disease" },
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
      patient_visit: <User className="h-4 w-4" />,
      disease_outbreak: <AlertTriangle className="h-4 w-4" />,
      vaccination: <Syringe className="h-4 w-4" />,
      lab_report: <FileText className="h-4 w-4" />,
      emergency: <HeartPulse className="h-4 w-4" />,
      medication: <Pill className="h-4 w-4" />,
      patient_feedback: <Activity className="h-4 w-4" />,
      health_screening: <Stethoscope className="h-4 w-4" />,
      chronic_disease: <TrendingUp className="h-4 w-4" />,
    };
    return icons[type] || <FileText className="h-4 w-4" />;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      patient_visit: "bg-teal-100 text-teal-700",
      disease_outbreak: "bg-rose-100 text-rose-700",
      vaccination: "bg-blue-100 text-blue-700",
      lab_report: "bg-purple-100 text-purple-700",
      emergency: "bg-red-100 text-red-700",
      medication: "bg-cyan-100 text-cyan-700",
      patient_feedback: "bg-amber-100 text-amber-700",
      health_screening: "bg-emerald-100 text-emerald-700",
      chronic_disease: "bg-indigo-100 text-indigo-700",
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
  const totalPatients = sampleReports.reduce((sum, r) => sum + r.patients, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Health Reports</h1>
          <p className="text-slate-500 mt-1">View and manage healthcare reports</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors">
          <Download className="h-4 w-4" />
          Export Reports
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-teal-600" />
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
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalPatients.toLocaleString()}</p>
              <p className="text-xs text-slate-500">Patients Covered</p>
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
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
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
              className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
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
                      <span className="text-sm font-semibold text-teal-600">
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
                          {report.facility}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-xs font-medium">
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
                          className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          title="View Report"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
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
            <button className="px-3 py-1.5 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700">
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
