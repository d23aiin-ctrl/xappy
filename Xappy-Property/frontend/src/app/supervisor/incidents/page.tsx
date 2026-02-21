"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Search, Eye, X, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface IncidentReport {
  id: string;
  reference_number: string;
  title: string;
  description: string;
  status: string;
  reported_at: string;
  reporter?: { full_name: string };
  details?: {
    incident_type: string;
    severity_level: string;
    injuries_count: number;
    fatalities_count: number;
    property_damage_estimate?: number;
    regulatory_reportable: boolean;
    investigation_required: boolean;
  };
}

const incidentTypes = [
  { value: "", label: "All Types" },
  { value: "injury", label: "Injury" },
  { value: "property_damage", label: "Property Damage" },
  { value: "fire", label: "Fire" },
  { value: "explosion", label: "Explosion" },
  { value: "chemical_release", label: "Chemical Release" },
  { value: "environmental", label: "Environmental" },
  { value: "vehicle_accident", label: "Vehicle Accident" },
  { value: "security_breach", label: "Security Breach" },
  { value: "fatality", label: "Fatality" },
  { value: "other", label: "Other" },
];

const severityLevels = [
  { value: "low", label: "Low", color: "bg-green-100 text-green-800" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-800" },
];

export default function IncidentsPage() {
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);

  useEffect(() => {
    fetchReports();
  }, [typeFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const params = new URLSearchParams();
      params.append("report_type", "incident");
      if (typeFilter) params.append("incident_type", typeFilter);

      const response = await apiFetch(`/api/v1/reports?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch incidents");

      const data = await response.json();
      setReports(data.items || data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const level = severityLevels.find((s) => s.value === severity);
    return level?.color || "bg-gray-100 text-gray-800";
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      submitted: "bg-blue-100 text-blue-800",
      acknowledged: "bg-purple-100 text-purple-800",
      under_review: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-orange-100 text-orange-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  const filteredReports = reports.filter(
    (report) =>
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reference_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-xappy-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Incident Reports</h2>
        <button
          onClick={fetchReports}
          className="text-sm text-xappy-primary hover:underline"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search incidents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xappy-primary"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xappy-primary"
          >
            {incidentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center text-gray-500">
            No incident reports found
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedReport(report)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-500">
                        {report.reference_number}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSeverityBadge(
                          report.details?.severity_level || "medium"
                        )}`}
                      >
                        {report.details?.severity_level || "medium"}
                      </span>
                      {report.details?.regulatory_reportable && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Reportable
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {report.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {report.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      <span>
                        Type: {report.details?.incident_type?.replace(/_/g, " ") || "Unknown"}
                      </span>
                      {(report.details?.injuries_count || 0) > 0 && (
                        <span className="text-orange-600">
                          {report.details?.injuries_count} injuries
                        </span>
                      )}
                      {(report.details?.fatalities_count || 0) > 0 && (
                        <span className="text-red-600">
                          {report.details?.fatalities_count} fatalities
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                      report.status
                    )}`}
                  >
                    {report.status}
                  </span>
                  <p className="text-sm text-gray-400 mt-2">
                    {new Date(report.reported_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedReport.reference_number}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Title</label>
                  <p className="text-gray-900">{selectedReport.title}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Description
                  </label>
                  <p className="text-gray-900">{selectedReport.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Type
                    </label>
                    <p className="text-gray-900 capitalize">
                      {selectedReport.details?.incident_type?.replace(/_/g, " ") || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Severity
                    </label>
                    <p>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityBadge(
                          selectedReport.details?.severity_level || "medium"
                        )}`}
                      >
                        {selectedReport.details?.severity_level || "medium"}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Injuries
                    </label>
                    <p className="text-gray-900">
                      {selectedReport.details?.injuries_count || 0}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Fatalities
                    </label>
                    <p className="text-gray-900">
                      {selectedReport.details?.fatalities_count || 0}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Regulatory Reportable
                    </label>
                    <p className="text-gray-900">
                      {selectedReport.details?.regulatory_reportable ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Investigation Required
                    </label>
                    <p className="text-gray-900">
                      {selectedReport.details?.investigation_required ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                {selectedReport.details?.property_damage_estimate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Property Damage Estimate
                    </label>
                    <p className="text-gray-900">
                      ₹{selectedReport.details.property_damage_estimate.toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Reporter
                    </label>
                    <p className="text-gray-900">
                      {selectedReport.reporter?.full_name || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Reported At
                    </label>
                    <p className="text-gray-900">
                      {new Date(selectedReport.reported_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
