"use client";

import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  MapPin,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Download,
  Eye,
} from "lucide-react";

interface Inspection {
  id: string;
  reference_number: string;
  title: string;
  description: string;
  status: string;
  reported_at: string;
  reporter_name: string | null;
  site_name: string | null;
  location_description: string | null;
}

export default function HSEInspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchInspections = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(
          "http://localhost:8000/api/v1/reports?report_type=inspection&page_size=100",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        setInspections(data.items || []);
      } catch (error) {
        console.error("Error fetching inspections:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInspections();
  }, []);

  const filteredInspections = filter === "all"
    ? inspections
    : inspections.filter(r => r.status === filter);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: "bg-yellow-100 text-yellow-800 border-yellow-200",
      acknowledged: "bg-blue-100 text-blue-800 border-blue-200",
      under_review: "bg-purple-100 text-purple-800 border-purple-200",
      closed: "bg-green-100 text-green-800 border-green-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inspection Reports</h1>
          <p className="text-gray-600 mt-1">
            Walkdown logs, defects, and field observations
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Inspections</p>
              <p className="text-2xl font-bold text-gray-900">{inspections.length}</p>
            </div>
            <Eye className="h-8 w-8 text-gray-300" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">
                {inspections.filter(r => r.status === "submitted").length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-300" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Acknowledged</p>
              <p className="text-2xl font-bold text-blue-600">
                {inspections.filter(r => r.status === "acknowledged").length}
              </p>
            </div>
            <ClipboardCheck className="h-8 w-8 text-blue-300" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {inspections.filter(r => r.status === "closed").length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-300" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-2">
        <Filter className="h-5 w-5 text-gray-400" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="under_review">Under Review</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Inspections List */}
      {filteredInspections.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <ClipboardCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No inspections found</h3>
          <p className="text-gray-500 mt-2">Inspection reports will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Inspector
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredInspections.map((inspection) => (
                <tr key={inspection.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-gray-600">
                      {inspection.reference_number}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{inspection.title}</p>
                    <p className="text-sm text-gray-500 truncate max-w-xs">
                      {inspection.description}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {inspection.location_description || inspection.site_name || "Unknown"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-1" />
                      {inspection.reporter_name || "Unknown"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(inspection.reported_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(inspection.status)}`}>
                      {inspection.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
