"use client";

import { z } from "zod";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Info } from "lucide-react";

export const insightCardSchema = z.object({
  title: z.string().describe("Title of the insight"),
  description: z.string().describe("Brief description of the analysis"),
  metrics: z
    .array(
      z.object({
        label: z.string().describe("Metric label"),
        value: z.string().describe("Metric value"),
        type: z.enum(["positive", "neutral", "warning"]).describe("Metric type for styling"),
      })
    )
    .describe("Key metrics to display"),
  topPerformers: z
    .array(
      z.object({
        rank: z.number().describe("Rank position"),
        name: z.string().describe("Item name"),
        value: z.string().describe("Primary value"),
        details: z.string().describe("Additional details"),
      })
    )
    .optional()
    .describe("Top performing items"),
  recommendations: z
    .array(z.string())
    .optional()
    .describe("Actionable recommendations"),
});

export type InsightCardProps = z.infer<typeof insightCardSchema>;

function MetricIcon({ type }: { type: "positive" | "neutral" | "warning" }) {
  switch (type) {
    case "positive":
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    case "warning":
      return <TrendingDown className="w-4 h-4 text-orange-600" />;
    default:
      return <Info className="w-4 h-4 text-blue-600" />;
  }
}

function getMetricBgColor(type: "positive" | "neutral" | "warning"): string {
  switch (type) {
    case "positive":
      return "bg-green-50 border-green-200";
    case "warning":
      return "bg-orange-50 border-orange-200";
    default:
      return "bg-blue-50 border-blue-200";
  }
}

function getMetricTextColor(type: "positive" | "neutral" | "warning"): string {
  switch (type) {
    case "positive":
      return "text-green-900";
    case "warning":
      return "text-orange-900";
    default:
      return "text-blue-900";
  }
}

export function InsightCard({
  title,
  description,
  metrics,
  topPerformers,
  recommendations,
}: InsightCardProps) {
  // Streaming guard
  if (!title || !metrics || metrics.length === 0) {
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
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className={`rounded-lg border p-4 flex items-start gap-3 ${getMetricBgColor(
              metric.type
            )}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              <MetricIcon type={metric.type} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {metric.label}
              </p>
              <p className={`text-lg font-bold mt-1 ${getMetricTextColor(metric.type)}`}>
                {metric.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Top Performers */}
      {topPerformers && topPerformers.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Top Performers</h4>
          <div className="space-y-2">
            {topPerformers.map((performer, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  {performer.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{performer.name}</p>
                  <p className="text-xs text-gray-600">{performer.details}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="font-semibold text-gray-900">{performer.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Recommendations</h4>
          <div className="space-y-2">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="flex gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-900">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
