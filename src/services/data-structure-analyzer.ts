/**
 * Data Structure Analyzer Service
 * Analyzes CSV structure and recommends best visualization component
 */

import { getCSVData } from "./csv-data";

export interface DataStructureAnalysis {
  dataType: "timeseries" | "categorical" | "ranking" | "comparison" | "unknown";
  suggestedComponent: "Graph" | "DataTable" | "InsightCard" | "InfoCard";
  reasoning: string;
  confidence: number;
}

export async function analyzeDataStructure(): Promise<DataStructureAnalysis> {
  try {
    const csvData = getCSVData();

    if (!csvData) {
      throw new Error("No CSV data uploaded. Please upload a CSV file first.");
    }

    const { headers, rows } = csvData;

    if (!headers || headers.length === 0) {
      throw new Error("CSV file has no headers. Please upload valid data.");
    }

    if (!rows || rows.length === 0) {
      throw new Error("CSV file is empty. Please upload data.");
    }

    // Check for date/time columns (indicates time-series)
    const hasDateColumn = headers.some((h) =>
      h.toLowerCase().includes("date") ||
      h.toLowerCase().includes("time") ||
      h.toLowerCase().includes("month") ||
      h.toLowerCase().includes("year")
    );

    if (hasDateColumn) {
      return {
        dataType: "timeseries",
        suggestedComponent: "Graph",
        reasoning:
          "Your data contains temporal information (dates/times). Time-series data is best visualized as trends and patterns using a Graph component.",
        confidence: 0.95,
      };
    }

    // Identify column types
    const numericColumns = headers.filter((h) => {
      const sample = rows[0]?.[h];
      return typeof sample === "number";
    });

    const textColumns = headers.filter((h) => {
      const sample = rows[0]?.[h];
      return typeof sample === "string";
    });

    // Check for ranking data (numeric + single text column)
    if (numericColumns.length >= 2 && textColumns.length === 1) {
      return {
        dataType: "ranking",
        suggestedComponent: "InsightCard",
        reasoning: `Your data has ${textColumns.length} category column (${textColumns[0]}) and ${numericColumns.length} numeric metrics. This is ranking data - best shown with top performers and key metrics using InsightCard.`,
        confidence: 0.9,
      };
    }

    // Check for comparison data (multiple text columns + few numeric)
    if (textColumns.length >= 2 && numericColumns.length >= 1) {
      return {
        dataType: "comparison",
        suggestedComponent: "InfoCard",
        reasoning: `Your data has multiple categories (${textColumns.join(", ")}) with metrics. This is comparison data - best explored with detailed cards showing each item's information.`,
        confidence: 0.85,
      };
    }

    // Check if mostly numeric (could be a matrix/correlation)
    if (numericColumns.length >= 3 && textColumns.length <= 1) {
      return {
        dataType: "categorical",
        suggestedComponent: "Graph",
        reasoning: `Your data has ${numericColumns.length} numeric columns. This can be visualized as a multi-series chart showing relationships between metrics.`,
        confidence: 0.75,
      };
    }

    // Default: complex data, use table for exploration
    return {
      dataType: "unknown",
      suggestedComponent: "DataTable",
      reasoning: `Your data has ${headers.length} columns with ${textColumns.length} text and ${numericColumns.length} numeric fields. Use an interactive DataTable to explore all the details.`,
      confidence: 0.6,
    };
  } catch (error) {
    console.error("Error analyzing data structure:", error);
    throw error;
  }
}
