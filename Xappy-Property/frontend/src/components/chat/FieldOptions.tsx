"use client";

import React from "react";
import { Check, X } from "lucide-react";
import type { QuickAction } from "@/types/chat";

interface FieldOptionsProps {
  actions: QuickAction[];
  onSelect: (action: QuickAction) => void;
  disabled?: boolean;
}

export default function FieldOptions({
  actions,
  onSelect,
  disabled,
}: FieldOptionsProps) {
  const fieldOptions = actions.filter((a) => a.actionType === "field_option");
  const confirmActions = actions.filter(
    (a) => a.actionType === "confirm" || a.actionType === "cancel"
  );

  if (actions.length === 0) return null;

  return (
    <div className="my-3">
      {/* Field option buttons - Haptik style chips */}
      {fieldOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {fieldOptions.map((action, index) => {
            // Alternate colors for visual variety
            const colors = [
              "bg-blue-50 text-haptik-blue hover:bg-blue-100 border-blue-100",
              "bg-purple-50 text-haptik-purple hover:bg-purple-100 border-purple-100",
              "bg-pink-50 text-haptik-pink hover:bg-pink-100 border-pink-100",
              "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100",
              "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100",
            ];
            const colorClass = colors[index % colors.length];

            return (
              <button
                key={action.value}
                onClick={() => onSelect(action)}
                disabled={disabled}
                className={`suggestion-chip ${colorClass} border disabled:opacity-50`}
              >
                {action.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Confirm/Cancel buttons */}
      {confirmActions.length > 0 && (
        <div className="flex gap-3 mt-3">
          {confirmActions.map((action) => (
            <button
              key={action.value}
              onClick={() => onSelect(action)}
              disabled={disabled}
              className={`flex-1 inline-flex items-center justify-center gap-2
                px-4 py-3 rounded-xl text-sm font-medium transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  action.actionType === "confirm"
                    ? "haptik-success-gradient text-white hover:opacity-90 shadow-sm"
                    : "bg-red-50 text-red-600 hover:bg-red-100"
                }`}
            >
              {action.actionType === "confirm" ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
