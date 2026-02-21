"use client";

import { useEffect, useState } from "react";
import {
  FileSignature,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Send,
  FileText,
  Download,
  Eye,
  MoreVertical,
  User,
  Home,
  Calendar,
} from "lucide-react";
import type { TenancyAgreement, AgreementStatus } from "@/types";

const statusColors: Record<AgreementStatus, { bg: string; text: string; label: string }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-700", label: "Draft" },
  generated: { bg: "bg-blue-100", text: "text-blue-700", label: "Generated" },
  sent_for_signing: { bg: "bg-purple-100", text: "text-purple-700", label: "Sent for Signing" },
  partially_signed: { bg: "bg-amber-100", text: "text-amber-700", label: "Partially Signed" },
  fully_signed: { bg: "bg-green-100", text: "text-green-700", label: "Fully Signed" },
  countersigned: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Countersigned" },
  completed: { bg: "bg-green-100", text: "text-green-700", label: "Completed" },
  cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" },
  expired: { bg: "bg-gray-100", text: "text-gray-500", label: "Expired" },
};

interface MockAgreement extends Partial<TenancyAgreement> {
  property_address?: string;
  tenant_name?: string;
  rent_amount?: number;
  start_date?: string;
  end_date?: string;
}

const mockAgreements: MockAgreement[] = [
  {
    id: "1",
    status: "sent_for_signing",
    property_address: "Flat 5, Riverside Court, SW1A 1AA",
    tenant_name: "John Smith",
    rent_amount: 1850,
    start_date: "2024-02-01",
    end_date: "2025-01-31",
    sent_for_signing_at: "2024-01-25T10:00:00Z",
    signatories: [
      { user_id: "1", name: "John Smith", email: "john@email.com", role: "tenant", status: "signed", signed_at: "2024-01-26T14:00:00Z" },
      { user_id: "2", name: "Property Owner", email: "owner@email.com", role: "landlord", status: "pending" },
    ],
    created_at: "2024-01-20T09:00:00Z",
  },
  {
    id: "2",
    status: "completed",
    property_address: "23 Victoria Gardens, M1 2AB",
    tenant_name: "Sarah Johnson",
    rent_amount: 1450,
    start_date: "2024-01-15",
    end_date: "2025-01-14",
    fully_signed_at: "2024-01-10T16:00:00Z",
    signed_document_url: "/contracts/agreement-2.pdf",
    signatories: [
      { user_id: "3", name: "Sarah Johnson", email: "sarah@email.com", role: "tenant", status: "signed", signed_at: "2024-01-08T11:00:00Z" },
      { user_id: "4", name: "Jane Landlord", email: "jane@email.com", role: "landlord", status: "signed", signed_at: "2024-01-10T16:00:00Z" },
    ],
    created_at: "2024-01-05T08:00:00Z",
  },
  {
    id: "3",
    status: "generated",
    property_address: "15 Park Lane, B1 3CD",
    tenant_name: "Emma Brown",
    rent_amount: 950,
    start_date: "2024-02-15",
    end_date: "2025-02-14",
    created_at: "2024-01-28T14:00:00Z",
  },
  {
    id: "4",
    status: "draft",
    property_address: "8 Queens Road, LS1 4EF",
    tenant_name: "Michael Williams",
    rent_amount: 1200,
    start_date: "2024-03-01",
    end_date: "2025-02-28",
    created_at: "2024-01-28T10:00:00Z",
  },
];

export default function ContractsPage() {
  const [agreements, setAgreements] = useState<MockAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    setTimeout(() => {
      setAgreements(mockAgreements);
      setLoading(false);
    }, 500);
  }, []);

  const filteredAgreements = agreements.filter((agreement) => {
    const matchesSearch =
      agreement.property_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agreement.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || agreement.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    draft: agreements.filter((a) => a.status === "draft" || a.status === "generated").length,
    pending: agreements.filter((a) => a.status === "sent_for_signing" || a.status === "partially_signed").length,
    completed: agreements.filter((a) => a.status === "completed" || a.status === "fully_signed").length,
    total: agreements.length,
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
          <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage tenancy agreements and e-signatures
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
          <Plus className="h-5 w-5 mr-2" />
          Generate Contract
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Contracts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <FileSignature className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Draft/Generated</p>
              <p className="text-2xl font-bold text-blue-600">{stats.draft}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Awaiting Signature</p>
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
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
            placeholder="Search by property or tenant..."
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
          <option value="draft">Draft</option>
          <option value="generated">Generated</option>
          <option value="sent_for_signing">Sent for Signing</option>
          <option value="partially_signed">Partially Signed</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Agreements List */}
      <div className="space-y-4">
        {filteredAgreements.map((agreement) => {
          const statusInfo = statusColors[agreement.status!];
          return (
            <div
              key={agreement.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-start">
                      <Home className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Property</p>
                        <p className="font-medium text-gray-900">{agreement.property_address}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <User className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Tenant</p>
                        <p className="font-medium text-gray-900">{agreement.tenant_name}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Term</p>
                        <p className="font-medium text-gray-900">
                          {agreement.start_date && new Date(agreement.start_date).toLocaleDateString()} - {agreement.end_date && new Date(agreement.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Signatories */}
                  {agreement.signatories && agreement.signatories.length > 0 && (
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Signatures</p>
                      <div className="flex flex-wrap gap-2">
                        {agreement.signatories.map((sig, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                              sig.status === "signed"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {sig.status === "signed" ? (
                              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                            ) : (
                              <Clock className="h-3.5 w-3.5 mr-1.5" />
                            )}
                            {sig.name} ({sig.role})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end ml-4">
                  <p className="text-lg font-bold text-gray-900">
                    £{agreement.rent_amount?.toLocaleString()}<span className="text-sm font-normal text-gray-500">/pcm</span>
                  </p>
                  <div className="flex gap-2 mt-3">
                    {agreement.status === "generated" && (
                      <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Send for signing">
                        <Send className="h-4 w-4" />
                      </button>
                    )}
                    {agreement.signed_document_url && (
                      <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Download">
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                    <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="View">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAgreements.length === 0 && (
        <div className="text-center py-12">
          <FileSignature className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
