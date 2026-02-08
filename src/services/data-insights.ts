/**
 * Data Insights Service
 * Generates AI-ready insights from uploaded CSV data
 */

import { getCSVData } from "./csv-data";

export interface DataInsightsParams {
  analysisType: string; // e.g., "summary", "top_performers", "trends", "recommendations"
  column?: string; // Column to focus on
  limit?: number; // Number of items to return
}

export interface InsightMetric {
  label: string;
  value: string;
  type: "positive" | "neutral" | "warning"; // For styling
}

export interface TopPerformer {
  rank: number;
  name: string;
  value: string;
  details: string;
}

export interface DataInsight {
  title: string;
  description: string;
  metrics: InsightMetric[];
  topPerformers?: TopPerformer[];
  recommendations?: string[];
}

export async function generateDataInsights(
  params: DataInsightsParams
): Promise<DataInsight> {
  try {
    const csvData = getCSVData();

    if (!csvData) {
      throw new Error("No CSV data uploaded. Please upload a file first.");
    }

    const { headers, rows } = csvData;

    if (!headers || headers.length === 0 || !rows || rows.length === 0) {
      throw new Error("CSV data is incomplete or empty.");
    }

    // Identify numeric columns
    const numericColumns = headers.filter((h) => {
      const sample = rows[0]?.[h];
      return typeof sample === "number";
    });

    // Build insights based on analysis type
    switch (params.analysisType) {
      case "summary":
        return generateSummary(headers, rows, numericColumns);

      case "top_performers":
        return generateTopPerformers(
          headers,
          rows,
          params.column || numericColumns[0],
          params.limit || 5
        );

      case "trends":
        return generateTrends(headers, rows, numericColumns);

      case "recommendations":
        return generateRecommendations(headers, rows, numericColumns);

      default:
        return generateSummary(headers, rows, numericColumns);
    }
  } catch (error) {
    console.error("Error generating data insights:", error);
    throw error;
  }
}

function generateSummary(
  headers: string[],
  rows: any[],
  numericColumns: string[]
): DataInsight {
  const metrics: InsightMetric[] = [
    {
      label: "Total Records",
      value: String(rows.length),
      type: "neutral",
    },
    {
      label: "Data Columns",
      value: String(headers.length),
      type: "neutral",
    },
  ];

  // Add statistics for numeric columns
  numericColumns.slice(0, 3).forEach((col) => {
    const values = rows
      .map((r) => r[col])
      .filter((v) => typeof v === "number");

    if (values.length > 0) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);

      metrics.push({
        label: `${col} Range`,
        value: `${min.toFixed(0)} - ${max.toFixed(0)}`,
        type: "neutral",
      });

      metrics.push({
        label: `${col} Average`,
        value: avg.toFixed(2),
        type: "positive",
      });
    }
  });

  return {
    title: "Data Summary",
    description: `Analysis of ${rows.length} records with ${headers.length} columns`,
    metrics,
    recommendations: [
      "Explore top performers by clicking on a specific metric",
      "Use search to filter data by product name or region",
      "Sort columns to find trends in your data",
    ],
  };
}

function generateTopPerformers(
  headers: string[],
  rows: any[],
  column: string,
  limit: number
): DataInsight {
  if (!headers.includes(column)) {
    throw new Error(
      `Column "${column}" not found. Available columns: ${headers.join(", ")}`
    );
  }

  // Find a label column (prefer "name", "product", "title", first string column)
  const labelColumn =
    headers.find((h) =>
      ["name", "product", "title", "label"].includes(h.toLowerCase())
    ) || headers.find((h) => typeof rows[0]?.[h] === "string") || headers[0];

  // Sort by column value (descending)
  const sorted = [...rows]
    .sort((a, b) => {
      const aVal = a[column];
      const bVal = b[column];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return bVal - aVal;
      }
      return 0;
    })
    .slice(0, limit);

  const topPerformers: TopPerformer[] = sorted.map((row, idx) => ({
    rank: idx + 1,
    name: String(row[labelColumn] || `Item ${idx + 1}`),
    value: String(row[column] ?? "N/A"),
    details: `${column}: ${row[column]}`,
  }));

  return {
    title: `Top ${limit} by ${column}`,
    description: `Highest performing items based on ${column}`,
    metrics: [
      {
        label: "Top Value",
        value: String(sorted[0]?.[column] ?? "N/A"),
        type: "positive",
      },
      {
        label: "Items Analyzed",
        value: String(rows.length),
        type: "neutral",
      },
    ],
    topPerformers,
    recommendations: [
      `Focus on top performers: ${sorted
        .slice(0, 3)
        .map((r) => String(r[labelColumn]))
        .join(", ")}`,
      `Average ${column}: ${(
        sorted.reduce((sum, r) => sum + (r[column] || 0), 0) / sorted.length
      ).toFixed(2)}`,
    ],
  };
}

function generateTrends(
  headers: string[],
  rows: any[],
  numericColumns: string[]
): DataInsight {
  const metrics: InsightMetric[] = [];

  numericColumns.forEach((col) => {
    const values = rows
      .map((r) => r[col])
      .filter((v) => typeof v === "number");

    if (values.length >= 2) {
      const first = values[0];
      const last = values[values.length - 1];
      const change = ((last - first) / first) * 100;
      const trend = change > 0 ? "positive" : change < 0 ? "warning" : "neutral";

      metrics.push({
        label: `${col} Trend`,
        value: `${change > 0 ? "+" : ""}${change.toFixed(1)}%`,
        type: trend,
      });
    }
  });

  return {
    title: "Data Trends",
    description: "Trend analysis across numeric columns",
    metrics:
      metrics.length > 0
        ? metrics
        : [
            {
              label: "Status",
              value: "No trends detected",
              type: "neutral",
            },
          ],
    recommendations: [
      "Monitor positive trends for growth opportunities",
      "Investigate negative trends to identify issues",
      "Compare trends across different time periods",
    ],
  };
}

function generateRecommendations(
  headers: string[],
  rows: any[],
  numericColumns: string[]
): DataInsight {
  const recommendations: string[] = [];

  // Find concentration issues
  const stringColumns = headers.filter(
    (h) => typeof rows[0]?.[h] === "string"
  );
  if (stringColumns.length > 0) {
    const firstStringCol = stringColumns[0];
    const uniqueValues = new Set(rows.map((r) => r[firstStringCol]));
    const concentration = (uniqueValues.size / rows.length) * 100;

    if (concentration < 30) {
      recommendations.push(
        `⚠️ High concentration: ${uniqueValues.size} unique ${firstStringCol}s for ${rows.length} records. Consider diversification.`
      );
    } else if (concentration > 70) {
      recommendations.push(
        `✅ Good diversity: ${uniqueValues.size} unique ${firstStringCol}s across ${rows.length} records`
      );
    }
  }

  // Find outliers
  numericColumns.slice(0, 2).forEach((col) => {
    const values = rows
      .map((r) => r[col])
      .filter((v) => typeof v === "number");

    if (values.length > 0) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);

      if (max > avg * 1.5) {
        recommendations.push(
          `📈 ${col} has high outliers (max: ${max.toFixed(0)} vs avg: ${avg.toFixed(0)}). These may be opportunities.`
        );
      }
      if (min < avg * 0.5) {
        recommendations.push(
          `📉 ${col} has low outliers (min: ${min.toFixed(0)} vs avg: ${avg.toFixed(0)}). Consider investigation.`
        );
      }
    }
  });

  // Generic recommendations
  if (recommendations.length === 0) {
    recommendations.push(
      "Data looks balanced - maintain current trends",
      "Monitor for changes in key metrics",
      "Use sorting and filtering to discover insights"
    );
  }

  return {
    title: "Data Recommendations",
    description: "Actionable insights based on data analysis",
    metrics: [
      {
        label: "Total Records",
        value: String(rows.length),
        type: "neutral",
      },
      {
        label: "Data Quality",
        value: "Good",
        type: "positive",
      },
    ],
    recommendations,
  };
}
