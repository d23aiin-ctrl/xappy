"use client";

import React, { useState } from "react";
import { FileText, CheckCircle, Circle, Edit2, X, Check } from "lucide-react";
import type { DraftState, FieldDefinition } from "@/types/chat";

interface DraftCardProps {
  draftState: DraftState;
  onFieldClick: (fieldName: string) => void;
  onFieldUpdate: (fieldName: string, value: string) => void;
  editingField?: string | null;
  disabled?: boolean;
}

interface FieldRowProps {
  field: FieldDefinition;
  isNext: boolean;
  isEditing: boolean;
  onClick: () => void;
  onUpdate: (value: string) => void;
  onCancel: () => void;
  disabled?: boolean;
}

function FieldRow({
  field,
  isNext,
  isEditing,
  onClick,
  onUpdate,
  onCancel,
  disabled,
}: FieldRowProps) {
  const [localValue, setLocalValue] = useState(field.value?.toString() || "");

  const handleSave = () => {
    onUpdate(localValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl transition-all
        ${isNext ? "bg-blue-50/80 border border-haptik-blue/30" : "bg-slate-50 hover:bg-slate-100"}
        ${!field.isValid && !isNext ? "border-l-4 border-l-amber-400" : ""}
        ${isEditing ? "bg-blue-50 ring-2 ring-haptik-blue/40" : "cursor-pointer"}`}
      onClick={() => !isEditing && !disabled && onClick()}
    >
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {field.label}
        </span>
        {isEditing ? (
          <div className="flex items-center gap-2 mt-1.5">
            {field.fieldType === "enum" && field.options ? (
              <select
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-haptik-blue/30 focus:border-haptik-blue bg-white"
                autoFocus
              >
                <option value="">Select...</option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.fieldType === "number" ? "number" : "text"}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-haptik-blue/30 focus:border-haptik-blue bg-white"
                placeholder={`Enter ${field.label.toLowerCase()}...`}
                autoFocus
              />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
              }}
              className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <p
            className={`text-sm mt-0.5 truncate ${
              field.isValid ? "text-slate-800 font-medium" : "text-slate-400 italic"
            }`}
          >
            {field.value || "Click to add..."}
          </p>
        )}
      </div>
      {!isEditing && (
        <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
          {field.isValid ? (
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          ) : (
            <Circle className="h-5 w-5 text-slate-300" />
          )}
          <Edit2 className="h-3.5 w-3.5 text-slate-400" />
        </div>
      )}
    </div>
  );
}

export default function DraftCard({
  draftState,
  onFieldClick,
  onFieldUpdate,
  editingField,
  disabled,
}: DraftCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      {/* Header with report type and progress */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
            <FileText className="h-5 w-5 text-haptik-blue" />
          </div>
          <div>
            <span className="font-semibold text-slate-800">
              {draftState.reportTypeLabel}
            </span>
            <p className="text-xs text-slate-500">
              {draftState.filledCount} of {draftState.totalRequired} fields
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xl font-bold text-haptik-blue">
            {Math.round(draftState.progressPercent)}%
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-100 rounded-full mb-5 overflow-hidden">
        <div
          className="h-2 haptik-gradient rounded-full transition-all duration-500 ease-out"
          style={{ width: `${draftState.progressPercent}%` }}
        />
      </div>

      {/* Fields list */}
      <div className="space-y-2">
        {draftState.fields.map((field) => (
          <FieldRow
            key={field.name}
            field={field}
            isNext={field.name === draftState.nextField}
            isEditing={editingField === field.name}
            onClick={() => onFieldClick(field.name)}
            onUpdate={(value) => onFieldUpdate(field.name, value)}
            onCancel={() => onFieldClick("")}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
