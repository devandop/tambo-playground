"use client";

import { z } from "zod";
import { CheckCircle, AlertCircle, Target } from "lucide-react";

export const actionCardSchema = z.object({
  title: z.string().describe("Title of the action plan"),
  description: z.string().describe("Overview of the situation"),
  actions: z
    .array(
      z.object({
        priority: z.enum(["high", "medium", "low"]).describe("Priority level"),
        action: z.string().describe("Action item"),
        reasoning: z.string().describe("Why this matters"),
        impact: z.string().optional().describe("Expected impact"),
      })
    )
    .describe("Ordered list of actions to take"),
  summary: z.string().optional().describe("Brief summary or conclusion"),
});

export type ActionCardProps = z.infer<typeof actionCardSchema>;

function PriorityBadge({ priority }: { priority: "high" | "medium" | "low" }) {
  const styles = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-orange-100 text-orange-700 border-orange-200",
    low: "bg-blue-100 text-blue-700 border-blue-200",
  };

  const labels = {
    high: "HIGH PRIORITY",
    medium: "MEDIUM PRIORITY",
    low: "LOW PRIORITY",
  };

  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded border ${styles[priority]}`}>
      {labels[priority]}
    </span>
  );
}

export function ActionCard({
  title,
  description,
  actions,
  summary,
}: ActionCardProps) {
  // Streaming guard
  if (!title || !actions || actions.length === 0) {
    return (
      <div className="w-full space-y-3 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-32 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      {/* Action Items */}
      <div className="space-y-3">
        {actions.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow"
          >
            {/* Priority & Number */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </div>
                <PriorityBadge priority={item.priority} />
              </div>
            </div>

            {/* Action Text */}
            <h4 className="font-semibold text-gray-900 mb-1">{item.action}</h4>

            {/* Reasoning */}
            <p className="text-sm text-gray-700 mb-2 leading-relaxed">
              {item.reasoning}
            </p>

            {/* Impact */}
            {item.impact && (
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-xs text-green-700 font-medium">{item.impact}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      {summary && (
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 text-sm mb-1">Bottom Line</h4>
              <p className="text-sm text-blue-800">{summary}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
