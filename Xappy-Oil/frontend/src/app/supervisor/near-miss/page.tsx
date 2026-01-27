"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle,
  X,
} from "lucide-react";

interface NearMissReport {
  id: string;
  reference_number: string;
  title: string;
  description: string;
  status: string;
  reported_at: string;
  reporter?: { full_name: string };
  details?: {
    category: string;
    potential_severity: string;
    immediate_actions_taken?: string;
    recommendations?: string;
  };
}

const categories = [
  { value: "", label: "All Categories" },
  { value: "slip_trip_fall", label: "Slip/Trip/Fall" },
  { value: "falling_object", label: "Falling Object" },
  { value: "equipment_failure", label: "Equipment Failure" },
  { value: "chemical_exposure", label: "Chemical Exposure" },
  { value: "fire_explosion_risk", label: "Fire/Explosion Risk" },
  { value: "electrical_hazard", label: "Electrical Hazard" },
  { value: "confined_space", label: "Confined Space" },
  { value: "vehicle_incident", label: "Vehicle Incident" },
  { value: "process_safety", label: "Process Safety" },
  { value: "other", label: "Other" },
];

const severityLevels = [
  { value: "low", label: "Low", color: "bg-green-100 text-green-800" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-800" },
];

export default function NearMissPage() {
  const [reports, setReports] = useState<NearMissReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<NearMissReport | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "slip_trip_fall",
    location_description: "",
    potential_severity: "medium",
    immediate_actions_taken: "",
    recommendations: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [categoryFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const params = new URLSearchParams();
      if (categoryFilter) params.append("category", categoryFilter);

      const response = await fetch(`/api/v1/near-miss?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch near-miss reports");

      const data = await response.json();
      setReports(data.items || data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/v1/near-miss", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create report");

      setShowCreateModal(false);
      setFormData({
        title: "",
        description: "",
        category: "slip_trip_fall",
        location_description: "",
        potential_severity: "medium",
        immediate_actions_taken: "",
        recommendations: "",
      });
      fetchReports();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const level = severityLevels.find((s) => s.value === severity);
    return level?.color || "bg-gray-100 text-gray-800";
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
        <h2 className="text-2xl font-bold text-gray-900">Near-Miss Reports</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-xappy-primary text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Report Near-Miss
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search near-miss reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xappy-primary"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xappy-primary"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No near-miss reports found
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedReport(report)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-500">
                    {report.reference_number}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityBadge(
                    report.details?.potential_severity || "medium"
                  )}`}
                >
                  {report.details?.potential_severity || "medium"}
                </span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                {report.title}
              </h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                {report.description}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  {new Date(report.reported_at).toLocaleDateString()}
                </span>
                <span className="text-gray-500 capitalize">
                  {report.details?.category?.replace(/_/g, " ") || "Unknown"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Report Near-Miss
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xappy-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xappy-primary"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xappy-primary"
                    >
                      {categories.slice(1).map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Potential Severity *
                    </label>
                    <select
                      value={formData.potential_severity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          potential_severity: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xappy-primary"
                    >
                      {severityLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location_description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location_description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xappy-primary"
                    placeholder="e.g., Unit 5, near Tank T-101"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Immediate Actions Taken
                  </label>
                  <textarea
                    value={formData.immediate_actions_taken}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        immediate_actions_taken: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xappy-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recommendations
                  </label>
                  <textarea
                    value={formData.recommendations}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recommendations: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-xappy-primary"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-xappy-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Category
                    </label>
                    <p className="text-gray-900 capitalize">
                      {selectedReport.details?.category?.replace(/_/g, " ") ||
                        "Unknown"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Potential Severity
                    </label>
                    <p>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityBadge(
                          selectedReport.details?.potential_severity || "medium"
                        )}`}
                      >
                        {selectedReport.details?.potential_severity || "medium"}
                      </span>
                    </p>
                  </div>
                </div>

                {selectedReport.details?.immediate_actions_taken && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Immediate Actions Taken
                    </label>
                    <p className="text-gray-900">
                      {selectedReport.details.immediate_actions_taken}
                    </p>
                  </div>
                )}

                {selectedReport.details?.recommendations && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Recommendations
                    </label>
                    <p className="text-gray-900">
                      {selectedReport.details.recommendations}
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
