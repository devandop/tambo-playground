/**
 * Exploration Suggestions Service
 * Generates personalized exploration suggestions based on CSV structure
 */

import { getCSVData } from "./csv-data";

export interface ExplorationSuggestion {
  mainInsight: string;
  suggestions: Array<{
    label: string;
    description: string;
    action: string;
  }>;
}

export async function generateExplorationSuggestions(): Promise<ExplorationSuggestion> {
  try {
    const csvData = getCSVData();

    if (!csvData) {
      throw new Error("No CSV data uploaded. Please upload a CSV file first.");
    }

    const { headers, rows } = csvData;

    if (!headers || headers.length === 0 || !rows || rows.length === 0) {
      throw new Error("CSV file is empty or invalid.");
    }

    // Identify column types
    const stringColumns = headers.filter((h) => {
      const sample = rows[0]?.[h];
      return typeof sample === "string";
    });

    const numericColumns = headers.filter((h) => {
      const sample = rows[0]?.[h];
      return typeof sample === "number";
    });

    // Detect special columns
    const hasDateColumn = headers.some(
      (h) =>
        h.toLowerCase().includes("date") ||
        h.toLowerCase().includes("time") ||
        h.toLowerCase().includes("month") ||
        h.toLowerCase().includes("year")
    );

    const suggestions = [];

    // Suggestion 1: Compare by first string column
    if (stringColumns.length > 0 && numericColumns.length > 0) {
      const categoryColumn = stringColumns[0];
      const metricColumn = numericColumns[0];
      suggestions.push({
        label: `Compare by ${categoryColumn}`,
        description: `See how ${metricColumn.toLowerCase()} varies across different ${categoryColumn.toLowerCase()}`,
        action: `Show me the top 5 ${categoryColumn.toLowerCase()} by ${metricColumn} in a ranked list with details`,
      });
    }

    // Suggestion 2: Find outliers
    if (numericColumns.length > 0) {
      const column = numericColumns[0];
      suggestions.push({
        label: "Identify Outliers",
        description: `Find unusually high or low values in ${column}`,
        action: `Analyze ${column}: Show me the highest 3 and lowest 3 values. What makes them unusual? Explain the outliers.`,
      });
    }

    // Suggestion 3: Trends over time
    if (hasDateColumn && numericColumns.length > 0) {
      const metric = numericColumns[0];
      suggestions.push({
        label: "Analyze Trends",
        description: `See how ${metric.toLowerCase()} changes over time`,
        action: `Show me ${metric} trends over the time period. Are values increasing, decreasing, or stable? Explain any patterns.`,
      });
    }

    // Suggestion 4: Distribution comparison
    if (numericColumns.length >= 2) {
      const col1 = numericColumns[0];
      const col2 = numericColumns[1];
      suggestions.push({
        label: "Distribution Analysis",
        description: `Compare distribution of ${col1} vs ${col2}`,
        action: `How does ${col1} compare to ${col2}? Show the relationship between these metrics and identify correlations.`,
      });
    }

    // Suggestion 5: Category drill-down
    if (stringColumns.length > 1 && numericColumns.length > 0) {
      const cat1 = stringColumns[0];
      const cat2 = stringColumns[1];
      suggestions.push({
        label: `${cat1} vs ${cat2} Breakdown`,
        description: `Analyze how these two categories interact`,
        action: `Show me the relationship between ${cat1} and ${cat2}. Which combinations have the highest values?`,
      });
    }

    // Suggestion 6: Performance metrics
    if (numericColumns.length >= 2) {
      suggestions.push({
        label: "Best Performers",
        description: "Find the top overall performers across all metrics",
        action: `What are the best performing items overall? Consider all metrics and show me the top 5 with full details.`,
      });
    }

    // Build main insight based on data structure
    const insight = buildMainInsight(
      headers,
      rows,
      stringColumns,
      numericColumns,
      hasDateColumn
    );

    return {
      mainInsight: insight,
      suggestions:
        suggestions.length > 0
          ? suggestions
          : [
              {
                label: "Explore Data",
                description: "Get a summary of your data",
                action: "Give me an overview of this data with key metrics and insights",
              },
            ],
    };
  } catch (error) {
    console.error("Error generating exploration suggestions:", error);
    throw error;
  }
}

function buildMainInsight(
  headers: string[],
  rows: any[],
  stringColumns: string[],
  numericColumns: string[],
  hasDateColumn: boolean
): string {
  const totalRows = rows.length;
  const totalColumns = headers.length;

  // Count unique values in string columns
  const uniqueCounts = stringColumns.slice(0, 2).map((col) => {
    const unique = new Set(rows.map((r) => r[col])).size;
    return `${unique} unique ${col.toLowerCase()}`;
  });

  let insight = `Your dataset has ${totalRows} records across ${totalColumns} columns. `;

  if (stringColumns.length > 0) {
    insight += `You have ${stringColumns.length} category column${stringColumns.length > 1 ? "s" : ""} (${stringColumns.join(", ")}) with ${uniqueCounts.join(" and ")}. `;
  }

  if (numericColumns.length > 0) {
    insight += `There are ${numericColumns.length} numeric metric${numericColumns.length > 1 ? "s" : ""} (${numericColumns.join(", ")}) to analyze. `;
  }

  if (hasDateColumn) {
    insight += `Your data spans a time period, so you can analyze trends. `;
  }

  insight += `Here are some interesting ways to explore your data:`;

  return insight;
}
