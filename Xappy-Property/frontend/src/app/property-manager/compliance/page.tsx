"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  Calendar,
  Home,
  Upload,
  Eye,
  MoreVertical,
} from "lucide-react";
import type { ComplianceRecord, ComplianceType, ComplianceStatus } from "@/types";

const statusColors: Record<ComplianceStatus, { bg: string; text: string; label: string; icon: typeof CheckCircle }> = {
  valid: { bg: "bg-green-100", text: "text-green-700", label: "Valid", icon: CheckCircle },
  expiring_soon: { bg: "bg-amber-100", text: "text-amber-700", label: "Expiring Soon", icon: Clock },
  expired: { bg: "bg-red-100", text: "text-red-700", label: "Expired", icon: AlertTriangle },
  pending: { bg: "bg-gray-100", text: "text-gray-700", label: "Pending", icon: Clock },
  not_required: { bg: "bg-gray-100", text: "text-gray-500", label: "Not Required", icon: CheckCircle },
};

const typeLabels: Record<ComplianceType, string> = {
  gas_safety: "Gas Safety Certificate",
  electrical_eicr: "Electrical EICR",
  epc: "Energy Performance Certificate",
  fire_alarm: "Fire Alarm Testing",
  smoke_co_detectors: "Smoke/CO Detectors",
  legionella: "Legionella Assessment",
  pat_testing: "PAT Testing",
  asbestos: "Asbestos Survey",
  fire_risk_assessment: "Fire Risk Assessment",
  hmo_licence: "HMO Licence",
  selective_licence: "Selective Licence",
  buildings_insurance: "Buildings Insurance",
  landlord_insurance: "Landlord Insurance",
  boiler_service: "Boiler Service",
  chimney_sweep: "Chimney Sweep",
  other: "Other",
};

interface MockComplianceRecord extends Partial<ComplianceRecord> {
  property_address?: string;
  days_until_expiry?: number;
}

const mockRecords: MockComplianceRecord[] = [
  {
    id: "1",
    compliance_type: "gas_safety",
    status: "valid",
    certificate_number: "GSC-2024-001",
    expiry_date: "2024-12-15T00:00:00Z",
    property_address: "Flat 5, Riverside Court, SW1A 1AA",
    provider_name: "SafeGas Ltd",
    days_until_expiry: 320,
  },
  {
    id: "2",
    compliance_type: "electrical_eicr",
    status: "expiring_soon",
    certificate_number: "EICR-2024-001",
    expiry_date: "2024-02-28T00:00:00Z",
    property_address: "23 Victoria Gardens, M1 2AB",
    provider_name: "ElecTest Services",
    days_until_expiry: 28,
  },
  {
    id: "3",
    compliance_type: "epc",
    status: "expired",
    certificate_number: "EPC-2023-001",
    expiry_date: "2024-01-15T00:00:00Z",
    property_address: "15 Park Lane, B1 3CD",
    provider_name: "Energy Assessors UK",
    days_until_expiry: -13,
  },
  {
    id: "4",
    compliance_type: "smoke_co_detectors",
    status: "valid",
    certificate_number: "SC-2024-001",
    expiry_date: "2025-06-01T00:00:00Z",
    property_address: "Flat 5, Riverside Court, SW1A 1AA",
    provider_name: "Fire Safety Services",
    days_until_expiry: 488,
  },
  {
    id: "5",
    compliance_type: "gas_safety",
    status: "pending",
    property_address: "8 Queens Road, LS1 4EF",
  },
];

export default function CompliancePage() {
  const [records, setRecords] = useState<MockComplianceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    setTimeout(() => {
      setRecords(mockRecords);
      setLoading(false);
    }, 500);
  }, []);

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.property_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.certificate_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    const matchesType = typeFilter === "all" || record.compliance_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    valid: records.filter((r) => r.status === "valid").length,
    expiringSoon: records.filter((r) => r.status === "expiring_soon").length,
    expired: records.filter((r) => r.status === "expired").length,
    pending: records.filter((r) => r.status === "pending").length,
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
          <h1 className="text-2xl font-bold text-gray-900">Compliance Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track certificates and compliance across your portfolio
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
          <Plus className="h-5 w-5 mr-2" />
          Add Record
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Valid</p>
              <p className="text-2xl font-bold text-green-600">{stats.valid}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Expiring Soon</p>
              <p className="text-2xl font-bold text-amber-600">{stats.expiringSoon}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Expired</p>
              <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-600">{stats.pending}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <FileText className="h-6 w-6 text-gray-600" />
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
            placeholder="Search by property or certificate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="valid">Valid</option>
          <option value="expiring_soon">Expiring Soon</option>
          <option value="expired">Expired</option>
          <option value="pending">Pending</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Types</option>
          {Object.entries(typeLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRecords.map((record) => {
              const statusInfo = statusColors[record.status!];
              const StatusIcon = statusInfo.icon;
              return (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-indigo-500 mr-2" />
                      <span className="font-medium text-gray-900">
                        {typeLabels[record.compliance_type!]}
                      </span>
                    </div>
                    {record.certificate_number && (
                      <p className="text-sm text-gray-500 mt-0.5">{record.certificate_number}</p>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center text-sm">
                      <Home className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{record.property_address}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                      <StatusIcon className="h-3.5 w-3.5 mr-1" />
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {record.expiry_date ? (
                      <div>
                        <p className="text-sm text-gray-900">
                          {new Date(record.expiry_date).toLocaleDateString()}
                        </p>
                        <p className={`text-xs ${
                          record.days_until_expiry && record.days_until_expiry < 0
                            ? "text-red-600"
                            : record.days_until_expiry && record.days_until_expiry <= 30
                              ? "text-amber-600"
                              : "text-gray-500"
                        }`}>
                          {record.days_until_expiry && record.days_until_expiry < 0
                            ? `${Math.abs(record.days_until_expiry)} days overdue`
                            : record.days_until_expiry
                              ? `${record.days_until_expiry} days remaining`
                              : ""}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Not set</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-900">{record.provider_name || "-"}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {record.document_url ? (
                        <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                          <Eye className="h-4 w-4" />
                        </button>
                      ) : (
                        <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                          <Upload className="h-4 w-4" />
                        </button>
                      )}
                      <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
