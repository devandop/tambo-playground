"use client";

import { z } from "zod";
import { AlertTriangle, AlertCircle, ShieldAlert } from "lucide-react";

export const riskCardSchema = z.object({
  title: z.string().describe("Title of the risk assessment"),
  overallRiskScore: z.string().describe("Overall risk level (e.g., '7/10')"),
  summary: z.string().describe("Brief summary of the risk situation"),
  risks: z
    .array(
      z.object({
        severity: z.enum(["critical", "high", "medium", "low"]).describe("Risk severity"),
        title: z.string().describe("Risk title"),
        description: z.string().describe("Detailed description of the risk"),
        affectedArea: z.string().optional().describe("What area is affected"),
        recommendedAction: z.string().describe("What to do about this risk"),
      })
    )
    .describe("List of identified risks"),
  immediateActions: z
    .array(z.string())
    .optional()
    .describe("Critical actions to take immediately"),
});

export type RiskCardProps = z.infer<typeof riskCardSchema>;

function SeverityIcon({ severity }: { severity: "critical" | "high" | "medium" | "low" }) {
  const iconClass = "w-5 h-5";
  const severityMap = {
    critical: { icon: <ShieldAlert className={iconClass} />, color: "text-red-600" },
    high: { icon: <AlertTriangle className={iconClass} />, color: "text-red-600" },
    medium: { icon: <AlertCircle className={iconClass} />, color: "text-orange-600" },
    low: { icon: <AlertCircle className={iconClass} />, color: "text-yellow-600" },
  };

  return <span className={severityMap[severity].color}>{severityMap[severity].icon}</span>;
}

function SeverityBadge({ severity }: { severity: "critical" | "high" | "medium" | "low" }) {
  const styles = {
    critical: "bg-red-100 text-red-700 border-red-300",
    high: "bg-red-50 text-red-700 border-red-200",
    medium: "bg-orange-50 text-orange-700 border-orange-200",
    low: "bg-yellow-50 text-yellow-700 border-yellow-200",
  };

  const labels = {
    critical: "🔴 CRITICAL",
    high: "🔴 HIGH",
    medium: "🟠 MEDIUM",
    low: "🟡 LOW",
  };

  return (
    <span className={`text-xs font-bold px-2 py-1 rounded border ${styles[severity]}`}>
      {labels[severity]}
    </span>
  );
}

export function RiskCard({
  title,
  overallRiskScore,
  summary,
  risks,
  immediateActions,
}: RiskCardProps) {
  // Streaming guard
  if (!title || !risks || risks.length === 0) {
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
      <div className="border-b border-red-200 pb-4 bg-red-50 -mx-6 -mt-6 px-6 pt-4 mb-2">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-600" />
            <h3 className="text-xl font-bold text-red-900">{title}</h3>
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Risk Score</p>
            <p className="text-2xl font-bold text-red-700">{overallRiskScore}</p>
          </div>
        </div>
        <p className="text-sm text-red-800">{summary}</p>
      </div>

      {/* Immediate Actions */}
      {immediateActions && immediateActions.length > 0 && (
        <div className="p-4 rounded-lg bg-red-50 border-2 border-red-200">
          <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Immediate Actions Required
          </h4>
          <ul className="space-y-2">
            {immediateActions.map((action, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-red-800">
                <span className="font-bold flex-shrink-0">→</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risk List */}
      <div className="space-y-3">
        {risks.map((risk, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <SeverityIcon severity={risk.severity} />
                <SeverityBadge severity={risk.severity} />
              </div>
            </div>

            <h4 className="font-semibold text-gray-900 mb-1">{risk.title}</h4>
            <p className="text-sm text-gray-700 mb-2 leading-relaxed">{risk.description}</p>

            {risk.affectedArea && (
              <p className="text-xs text-gray-600 mb-2">
                <span className="font-semibold">Affected Area:</span> {risk.affectedArea}
              </p>
            )}

            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm">
                <span className="font-semibold text-gray-900">Action:</span>{" "}
                <span className="text-gray-700">{risk.recommendedAction}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
