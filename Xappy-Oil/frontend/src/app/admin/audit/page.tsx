"use client";

import { useEffect, useState } from "react";
import {
  ScrollText,
  Search,
  Filter,
  Clock,
  User,
  FileText,
  Shield,
  CheckCircle,
  AlertTriangle,
  Download,
} from "lucide-react";

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_name: string;
  user_role: string;
  details: string;
  ip_address: string;
}

const mockAuditLog: AuditEntry[] = [
  {
    id: "1",
    timestamp: "2026-01-02T14:07:35Z",
    action: "CREATE",
    entity_type: "report",
    entity_id: "XP-NM-20260102-0001",
    user_name: "Ajay Yadav",
    user_role: "worker",
    details: "Created near-miss report: Forklift near collision with pedestrian",
    ip_address: "192.168.1.45",
  },
  {
    id: "2",
    timestamp: "2026-01-02T12:30:00Z",
    action: "ACKNOWLEDGE",
    entity_type: "report",
    entity_id: "XP-NM-20260102-0002",
    user_name: "Amit Kumar",
    user_role: "supervisor",
    details: "Acknowledged report: Unsecured scaffold board fell from height",
    ip_address: "192.168.1.12",
  },
  {
    id: "3",
    timestamp: "2026-01-02T10:15:00Z",
    action: "LOGIN",
    entity_type: "user",
    entity_id: "SUP001",
    user_name: "Amit Kumar",
    user_role: "supervisor",
    details: "User logged in successfully",
    ip_address: "192.168.1.12",
  },
  {
    id: "4",
    timestamp: "2026-01-02T09:45:00Z",
    action: "CREATE",
    entity_type: "report",
    entity_id: "XP-TT-20260102-0001",
    user_name: "Suresh Patil",
    user_role: "supervisor",
    details: "Created toolbox talk: Hot work safety procedures",
    ip_address: "192.168.1.23",
  },
  {
    id: "5",
    timestamp: "2026-01-02T08:00:00Z",
    action: "CLOSE",
    entity_type: "report",
    entity_id: "XP-PW-20260102-0001",
    user_name: "Priya Desai",
    user_role: "hse_officer",
    details: "Closed PTW evidence record",
    ip_address: "192.168.1.34",
  },
  {
    id: "6",
    timestamp: "2026-01-01T16:30:00Z",
    action: "EXPORT",
    entity_type: "reports",
    entity_id: "batch-001",
    user_name: "Rajesh Sharma",
    user_role: "hse_manager",
    details: "Exported 24 reports to PDF",
    ip_address: "192.168.1.15",
  },
];

export default function AdminAuditPage() {
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(mockAuditLog);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const filteredLog = auditLog.filter((entry) => {
    const matchesSearch =
      entry.details.toLowerCase().includes(search.toLowerCase()) ||
      entry.user_name.toLowerCase().includes(search.toLowerCase()) ||
      entry.entity_id.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === "all" || entry.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: "bg-green-100 text-green-800",
      UPDATE: "bg-blue-100 text-blue-800",
      ACKNOWLEDGE: "bg-purple-100 text-purple-800",
      CLOSE: "bg-gray-100 text-gray-800",
      DELETE: "bg-red-100 text-red-800",
      LOGIN: "bg-yellow-100 text-yellow-800",
      LOGOUT: "bg-yellow-100 text-yellow-800",
      EXPORT: "bg-indigo-100 text-indigo-800",
    };
    return colors[action] || "bg-gray-100 text-gray-800";
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATE":
        return <FileText className="h-4 w-4" />;
      case "ACKNOWLEDGE":
        return <CheckCircle className="h-4 w-4" />;
      case "LOGIN":
      case "LOGOUT":
        return <User className="h-4 w-4" />;
      case "EXPORT":
        return <Download className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
          <p className="text-gray-600 mt-1">
            Immutable record of all system activities
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition">
          <Download className="h-4 w-4 mr-2" />
          Export Log
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h4 className="font-medium text-blue-800">Compliance-Grade Audit Trail</h4>
            <p className="text-sm text-blue-700 mt-1">
              All entries are immutable and hash-chained for regulatory compliance.
              This log provides complete traceability for audit purposes.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search audit log..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500"
        >
          <option value="all">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="ACKNOWLEDGE">Acknowledge</option>
          <option value="CLOSE">Close</option>
          <option value="LOGIN">Login</option>
          <option value="EXPORT">Export</option>
        </select>
      </div>

      {/* Audit Log */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Entity
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredLog.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActionColor(entry.action)}`}>
                    {getActionIcon(entry.action)}
                    <span className="ml-1">{entry.action}</span>
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{entry.user_name}</p>
                    <p className="text-xs text-gray-500 capitalize">{entry.user_role.replace("_", " ")}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-700 max-w-md truncate">
                    {entry.details}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono text-sm text-gray-500">
                    {entry.entity_id}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination placeholder */}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>Showing {filteredLog.length} entries</span>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border rounded hover:bg-gray-50">Previous</button>
          <button className="px-3 py-1 border rounded hover:bg-gray-50">Next</button>
        </div>
      </div>
    </div>
  );
}
