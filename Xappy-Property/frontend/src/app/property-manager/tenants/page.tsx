"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  Phone,
  Mail,
  Calendar,
  ArrowRight,
  User,
  Home,
} from "lucide-react";
import type { Tenant, TenantPipelineStage } from "@/types";

interface PipelineColumn {
  stage: TenantPipelineStage;
  label: string;
  color: string;
  bgColor: string;
}

const pipelineColumns: PipelineColumn[] = [
  { stage: "enquiry", label: "Enquiry", color: "bg-gray-500", bgColor: "bg-gray-50" },
  { stage: "viewing_scheduled", label: "Viewing", color: "bg-blue-500", bgColor: "bg-blue-50" },
  { stage: "viewing_completed", label: "Viewed", color: "bg-blue-600", bgColor: "bg-blue-50" },
  { stage: "application_started", label: "Application", color: "bg-indigo-500", bgColor: "bg-indigo-50" },
  { stage: "qualification_pending", label: "Qualifying", color: "bg-purple-500", bgColor: "bg-purple-50" },
  { stage: "qualified", label: "Qualified", color: "bg-purple-600", bgColor: "bg-purple-50" },
  { stage: "documents_submitted", label: "Documents", color: "bg-pink-500", bgColor: "bg-pink-50" },
  { stage: "holding_deposit_paid", label: "Deposit", color: "bg-orange-500", bgColor: "bg-orange-50" },
  { stage: "referencing", label: "Referencing", color: "bg-amber-500", bgColor: "bg-amber-50" },
  { stage: "contract_sent", label: "Contract", color: "bg-green-500", bgColor: "bg-green-50" },
];

const mockTenants: Partial<Tenant>[] = [
  {
    id: "1",
    first_name: "John",
    last_name: "Smith",
    email: "john.smith@email.com",
    phone: "07700 900123",
    pipeline_stage: "enquiry",
    preferred_move_in_date: "2024-03-01",
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    first_name: "Sarah",
    last_name: "Johnson",
    email: "sarah.j@email.com",
    phone: "07700 900456",
    pipeline_stage: "viewing_scheduled",
    preferred_move_in_date: "2024-02-15",
    created_at: "2024-01-14T09:00:00Z",
  },
  {
    id: "3",
    first_name: "Michael",
    last_name: "Williams",
    email: "m.williams@email.com",
    phone: "07700 900789",
    pipeline_stage: "application_started",
    preferred_move_in_date: "2024-03-15",
    created_at: "2024-01-10T14:00:00Z",
  },
  {
    id: "4",
    first_name: "Emma",
    last_name: "Brown",
    email: "emma.b@email.com",
    phone: "07700 900321",
    pipeline_stage: "qualified",
    preferred_move_in_date: "2024-02-28",
    created_at: "2024-01-08T11:00:00Z",
  },
  {
    id: "5",
    first_name: "David",
    last_name: "Taylor",
    email: "d.taylor@email.com",
    phone: "07700 900654",
    pipeline_stage: "referencing",
    preferred_move_in_date: "2024-02-20",
    created_at: "2024-01-05T16:00:00Z",
  },
  {
    id: "6",
    first_name: "Lisa",
    last_name: "Anderson",
    email: "lisa.a@email.com",
    phone: "07700 900987",
    pipeline_stage: "contract_sent",
    preferred_move_in_date: "2024-02-01",
    created_at: "2024-01-02T08:00:00Z",
  },
];

export default function TenantPipelinePage() {
  const [tenants, setTenants] = useState<Partial<Tenant>[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setTenants(mockTenants);
      setLoading(false);
    }, 500);
  }, []);

  const getTenantsByStage = (stage: TenantPipelineStage) => {
    return tenants.filter((t) => t.pipeline_stage === stage);
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdvanceStage = (tenantId: string) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          const currentIndex = pipelineColumns.findIndex((c) => c.stage === t.pipeline_stage);
          if (currentIndex < pipelineColumns.length - 1) {
            return { ...t, pipeline_stage: pipelineColumns[currentIndex + 1].stage };
          }
        }
        return t;
      })
    );
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
          <h1 className="text-2xl font-bold text-gray-900">Tenant Pipeline</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and manage prospective tenants ({tenants.length} leads)
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
          <Plus className="h-5 w-5 mr-2" />
          Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode("kanban")}
            className={`px-4 py-2 text-sm font-medium ${viewMode === "kanban" ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-50"}`}
          >
            Kanban
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 text-sm font-medium ${viewMode === "list" ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-50"}`}
          >
            List
          </button>
        </div>
      </div>

      {/* Pipeline Summary */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {pipelineColumns.map((col) => {
          const count = getTenantsByStage(col.stage).length;
          return (
            <div
              key={col.stage}
              className={`flex items-center px-3 py-1.5 rounded-full ${col.bgColor} whitespace-nowrap`}
            >
              <div className={`w-2 h-2 rounded-full ${col.color} mr-2`}></div>
              <span className="text-sm font-medium text-gray-700">{col.label}</span>
              <span className="ml-2 text-sm text-gray-500">({count})</span>
            </div>
          );
        })}
      </div>

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {pipelineColumns.map((col) => (
            <div key={col.stage} className="flex-shrink-0 w-72">
              <div className={`rounded-t-lg px-3 py-2 ${col.bgColor}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${col.color} mr-2`}></div>
                    <h3 className="font-medium text-gray-900">{col.label}</h3>
                  </div>
                  <span className="text-sm text-gray-500">{getTenantsByStage(col.stage).length}</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-b-lg p-2 min-h-[400px] space-y-2">
                {getTenantsByStage(col.stage).map((tenant) => (
                  <div
                    key={tenant.id}
                    className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium text-sm mr-2">
                          {tenant.first_name?.[0]}{tenant.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {tenant.first_name} {tenant.last_name}
                          </p>
                        </div>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded">
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1.5" />
                        <span className="truncate">{tenant.email}</span>
                      </div>
                      {tenant.phone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1.5" />
                          <span>{tenant.phone}</span>
                        </div>
                      )}
                      {tenant.preferred_move_in_date && (
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1.5" />
                          <span>Move: {new Date(tenant.preferred_move_in_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={() => handleAdvanceStage(tenant.id!)}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
                      >
                        Advance <ArrowRight className="h-3 w-3 ml-1" />
                      </button>
                    </div>
                  </div>
                ))}
                {getTenantsByStage(col.stage).length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No leads in this stage
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Move-in Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTenants.map((tenant) => {
                const stageInfo = pipelineColumns.find((c) => c.stage === tenant.pipeline_stage);
                return (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium mr-3">
                          {tenant.first_name?.[0]}{tenant.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {tenant.first_name} {tenant.last_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900">{tenant.email}</p>
                        <p className="text-gray-500">{tenant.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${stageInfo?.bgColor} text-gray-700`}>
                        <span className={`w-2 h-2 rounded-full ${stageInfo?.color} mr-1.5`}></span>
                        {stageInfo?.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {tenant.preferred_move_in_date
                        ? new Date(tenant.preferred_move_in_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {tenant.created_at
                        ? new Date(tenant.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => handleAdvanceStage(tenant.id!)}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition"
                      >
                        Advance <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
