"use client";

import { useEffect, useState } from "react";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Download,
  Eye,
  MoreVertical,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { JobCost, CostType, CostStatus } from "@/types";

const statusColors: Record<CostStatus, { bg: string; text: string; label: string }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-700", label: "Draft" },
  submitted: { bg: "bg-blue-100", text: "text-blue-700", label: "Submitted" },
  pending_approval: { bg: "bg-amber-100", text: "text-amber-700", label: "Pending Approval" },
  approved: { bg: "bg-green-100", text: "text-green-700", label: "Approved" },
  rejected: { bg: "bg-red-100", text: "text-red-700", label: "Rejected" },
  invoiced: { bg: "bg-purple-100", text: "text-purple-700", label: "Invoiced" },
  paid: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Paid" },
  disputed: { bg: "bg-red-100", text: "text-red-700", label: "Disputed" },
};

const typeLabels: Record<CostType, string> = {
  labour: "Labour",
  materials: "Materials",
  callout: "Callout Fee",
  emergency_surcharge: "Emergency Surcharge",
  parts: "Parts",
  contractor_fee: "Contractor Fee",
  permit_fee: "Permit Fee",
  other: "Other",
};

interface MockCost extends Partial<JobCost> {
  supplier_name?: string;
  property_address?: string;
  issue_title?: string;
}

const mockCosts: MockCost[] = [
  {
    id: "1",
    cost_type: "labour",
    description: "Boiler repair - 3 hours",
    quantity: 3,
    unit_price: 65,
    net_amount: 195,
    vat_rate: 20,
    vat_amount: 39,
    gross_amount: 234,
    status: "pending_approval",
    supplier_name: "SafeGas Ltd",
    property_address: "Flat 5, Riverside Court",
    issue_title: "Boiler not heating water",
    invoice_reference: "INV-2024-001",
    created_at: "2024-01-28T10:00:00Z",
  },
  {
    id: "2",
    cost_type: "materials",
    description: "Replacement parts - thermostat valve",
    quantity: 1,
    unit_price: 85,
    net_amount: 85,
    vat_rate: 20,
    vat_amount: 17,
    gross_amount: 102,
    status: "approved",
    supplier_name: "SafeGas Ltd",
    property_address: "Flat 5, Riverside Court",
    issue_title: "Boiler not heating water",
    invoice_reference: "INV-2024-001",
    created_at: "2024-01-28T10:00:00Z",
  },
  {
    id: "3",
    cost_type: "callout",
    description: "Emergency callout fee",
    quantity: 1,
    unit_price: 75,
    net_amount: 75,
    vat_rate: 20,
    vat_amount: 15,
    gross_amount: 90,
    status: "paid",
    supplier_name: "QuickFix Plumbing",
    property_address: "23 Victoria Gardens",
    issue_title: "Burst pipe in bathroom",
    invoice_reference: "INV-2024-002",
    created_at: "2024-01-25T14:00:00Z",
  },
  {
    id: "4",
    cost_type: "labour",
    description: "Window lock replacement",
    quantity: 1,
    unit_price: 45,
    net_amount: 45,
    vat_rate: 20,
    vat_amount: 9,
    gross_amount: 54,
    status: "invoiced",
    supplier_name: "Secure Locks Ltd",
    property_address: "15 Park Lane",
    issue_title: "Broken window lock",
    invoice_reference: "INV-2024-003",
    created_at: "2024-01-20T09:00:00Z",
  },
];

export default function CostsPage() {
  const [costs, setCosts] = useState<MockCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    setTimeout(() => {
      setCosts(mockCosts);
      setLoading(false);
    }, 500);
  }, []);

  const filteredCosts = costs.filter((cost) => {
    const matchesSearch =
      cost.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cost.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cost.property_address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || cost.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPending = costs
    .filter((c) => c.status === "pending_approval")
    .reduce((sum, c) => sum + (c.gross_amount || 0), 0);

  const totalApproved = costs
    .filter((c) => c.status === "approved" || c.status === "invoiced")
    .reduce((sum, c) => sum + (c.gross_amount || 0), 0);

  const totalPaid = costs
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + (c.gross_amount || 0), 0);

  const totalThisMonth = costs.reduce((sum, c) => sum + (c.gross_amount || 0), 0);

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
          <h1 className="text-2xl font-bold text-gray-900">Cost Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and approve maintenance costs
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
          <Download className="h-5 w-5 mr-2" />
          Export Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">This Month</p>
              <p className="text-2xl font-bold text-gray-900">£{totalThisMonth.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Receipt className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Approval</p>
              <p className="text-2xl font-bold text-amber-600">£{totalPending.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Approved/Invoiced</p>
              <p className="text-2xl font-bold text-blue-600">£{totalApproved.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Paid</p>
              <p className="text-2xl font-bold text-green-600">£{totalPaid.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
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
            placeholder="Search costs..."
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
          <option value="pending_approval">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="invoiced">Invoiced</option>
          <option value="paid">Paid</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Costs Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property / Issue</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCosts.map((cost) => {
              const statusInfo = statusColors[cost.status!];
              return (
                <tr key={cost.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{cost.description}</p>
                      <p className="text-sm text-gray-500">{typeLabels[cost.cost_type!]}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm text-gray-900">{cost.property_address}</p>
                      <p className="text-sm text-gray-500">{cost.issue_title}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-900">{cost.supplier_name}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div>
                      <p className="font-medium text-gray-900">£{cost.gross_amount?.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">
                        Net: £{cost.net_amount?.toFixed(2)} + VAT: £{cost.vat_amount?.toFixed(2)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {cost.status === "pending_approval" && (
                        <>
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {cost.invoice_url && (
                        <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                          <Eye className="h-4 w-4" />
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

      {filteredCosts.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No costs found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
