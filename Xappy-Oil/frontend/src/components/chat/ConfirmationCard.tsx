"use client";

import React from "react";
import { CheckCircle, Edit2, Send, X } from "lucide-react";
import type { DraftState, FieldDefinition } from "@/types/chat";

interface ConfirmationCardProps {
  draftState: DraftState;
  onConfirm: () => void;
  onCancel: () => void;
  onEdit: (fieldName: string) => void;
  disabled?: boolean;
}

function formatFieldValue(field: FieldDefinition): string {
  if (field.value === null || field.value === undefined || field.value === "") {
    return "-";
  }
  // Format datetime values
  if (field.fieldType === "datetime" || field.fieldType === "date") {
    try {
      const date = new Date(field.value.toString());
      if (field.fieldType === "date") {
        return date.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
      return date.toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return field.value.toString();
    }
  }
  return field.value.toString();
}

export default function ConfirmationCard({
  draftState,
  onConfirm,
  onCancel,
  onEdit,
  disabled,
}: ConfirmationCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-4 border-b border-emerald-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Ready to Submit</h3>
            <p className="text-xs text-slate-500">
              Review your {draftState.reportTypeLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Summary of all fields */}
      <div className="p-5 space-y-2">
        {draftState.fields.map((field) => (
          <div
            key={field.name}
            className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group"
            onClick={() => !disabled && onEdit(field.name)}
          >
            <div className="flex-1 min-w-0">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                {field.label}
              </span>
              <p className="text-sm text-slate-800 font-medium mt-0.5 break-words">
                {formatFieldValue(field)}
              </p>
            </div>
            <Edit2 className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0" />
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="px-5 pb-5">
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={disabled}
            className="flex-1 inline-flex items-center justify-center gap-2
              px-4 py-3 rounded-xl text-red-600 bg-red-50
              hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors text-sm font-medium"
          >
            <X className="h-4 w-4" />
            Discard
          </button>
          <button
            onClick={onConfirm}
            disabled={disabled}
            className="flex-1 inline-flex items-center justify-center gap-2
              px-4 py-3 rounded-xl text-white haptik-success-gradient
              hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
              transition-all text-sm font-medium shadow-sm"
          >
            <Send className="h-4 w-4" />
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}
