"use client";

import { useState } from "react";
import {
  MoreVertical,
  Phone,
  Mail,
  Calendar,
  ArrowRight,
  ChevronRight,
  User,
} from "lucide-react";
import type { Tenant, TenantPipelineStage } from "@/types";

interface PipelineColumn {
  stage: TenantPipelineStage;
  label: string;
  color: string;
  bgColor: string;
}

interface PipelineKanbanProps {
  tenants: Partial<Tenant>[];
  columns?: PipelineColumn[];
  onAdvanceStage?: (tenantId: string, currentStage: TenantPipelineStage) => void;
  onTenantClick?: (tenant: Partial<Tenant>) => void;
  onTenantAction?: (tenant: Partial<Tenant>, action: string) => void;
}

const defaultColumns: PipelineColumn[] = [
  { stage: "enquiry", label: "Enquiry", color: "bg-gray-500", bgColor: "bg-gray-50" },
  { stage: "viewing_scheduled", label: "Viewing Scheduled", color: "bg-blue-500", bgColor: "bg-blue-50" },
  { stage: "viewing_completed", label: "Viewing Done", color: "bg-blue-600", bgColor: "bg-blue-50" },
  { stage: "application_started", label: "Application", color: "bg-indigo-500", bgColor: "bg-indigo-50" },
  { stage: "qualification_pending", label: "Qualifying", color: "bg-purple-500", bgColor: "bg-purple-50" },
  { stage: "qualified", label: "Qualified", color: "bg-purple-600", bgColor: "bg-purple-50" },
  { stage: "documents_submitted", label: "Documents", color: "bg-pink-500", bgColor: "bg-pink-50" },
  { stage: "holding_deposit_paid", label: "Deposit Paid", color: "bg-orange-500", bgColor: "bg-orange-50" },
  { stage: "referencing", label: "Referencing", color: "bg-amber-500", bgColor: "bg-amber-50" },
  { stage: "contract_sent", label: "Contract", color: "bg-green-500", bgColor: "bg-green-50" },
];

export default function PipelineKanban({
  tenants,
  columns = defaultColumns,
  onAdvanceStage,
  onTenantClick,
  onTenantAction,
}: PipelineKanbanProps) {
  const [draggedTenant, setDraggedTenant] = useState<Partial<Tenant> | null>(null);

  const getTenantsByStage = (stage: TenantPipelineStage) => {
    return tenants.filter((t) => t.pipeline_stage === stage);
  };

  const handleDragStart = (tenant: Partial<Tenant>) => {
    setDraggedTenant(tenant);
  };

  const handleDragEnd = () => {
    setDraggedTenant(null);
  };

  const handleDrop = (targetStage: TenantPipelineStage) => {
    if (draggedTenant && draggedTenant.pipeline_stage !== targetStage) {
      onAdvanceStage?.(draggedTenant.id!, draggedTenant.pipeline_stage!);
    }
    setDraggedTenant(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => {
        const columnTenants = getTenantsByStage(col.stage);

        return (
          <div
            key={col.stage}
            className="flex-shrink-0 w-72"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col.stage)}
          >
            {/* Column Header */}
            <div className={`rounded-t-lg px-3 py-2 ${col.bgColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${col.color} mr-2`}></div>
                  <h3 className="font-medium text-gray-900 text-sm">{col.label}</h3>
                </div>
                <span className="text-sm text-gray-500 bg-white/50 px-2 py-0.5 rounded-full">
                  {columnTenants.length}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <div className={`bg-gray-100/50 rounded-b-lg p-2 min-h-[400px] space-y-2 ${
              draggedTenant ? "border-2 border-dashed border-gray-300" : ""
            }`}>
              {columnTenants.map((tenant) => (
                <div
                  key={tenant.id}
                  draggable
                  onDragStart={() => handleDragStart(tenant)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onTenantClick?.(tenant)}
                  className={`bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition cursor-pointer group ${
                    draggedTenant?.id === tenant.id ? "opacity-50" : ""
                  }`}
                >
                  {/* Tenant Header */}
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTenantAction?.(tenant, "menu");
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Mail className="h-3 w-3 mr-1.5 text-gray-400" />
                      <span className="truncate">{tenant.email}</span>
                    </div>
                    {tenant.phone && (
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1.5 text-gray-400" />
                        <span>{tenant.phone}</span>
                      </div>
                    )}
                    {tenant.preferred_move_in_date && (
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1.5 text-gray-400" />
                        <span>Move: {new Date(tenant.preferred_move_in_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTenantAction?.(tenant, "call");
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                        title="Call"
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTenantAction?.(tenant, "email");
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                        title="Email"
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAdvanceStage?.(tenant.id!, tenant.pipeline_stage!);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
                    >
                      Advance <ArrowRight className="h-3 w-3 ml-1" />
                    </button>
                  </div>
                </div>
              ))}

              {columnTenants.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No leads
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
