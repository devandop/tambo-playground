/**
 * CSV data service
 * Manages uploaded CSV data using window global to ensure
 * cross-module access in Next.js bundled environments.
 */

interface CSVDataStore {
  headers: string[];
  rows: any[];
  fileName: string;
}

export function setCSVData(data: CSVDataStore): void {
  if (typeof window !== "undefined") {
    (window as any).__tamboCSVData = data;
  }
}

export function getCSVData(): CSVDataStore | null {
  if (typeof window !== "undefined") {
    return (window as any).__tamboCSVData || null;
  }
  return null;
}

export function clearCSVData(): void {
  if (typeof window !== "undefined") {
    (window as any).__tamboCSVData = null;
  }
}

export interface AnalyzeCSVParams {
  query: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  filterColumn?: string;
  filterValue?: string;
}

export interface AnalyzeCSVResult {
  headers: string[];
  rows: string[][];
  totalRows: number;
  summary?: {
    label: string;
    value: string;
  }[];
}

export async function analyzeCSV(
  params: AnalyzeCSVParams
): Promise<AnalyzeCSVResult> {
  try {
    const data = getCSVData();

    if (!data) {
      throw new Error("No CSV data uploaded. Please upload a CSV file first.");
    }

    let { rows } = data;
    const { headers } = data;

    if (!headers || headers.length === 0 || !rows || rows.length === 0) {
      throw new Error("CSV data is incomplete or empty.");
    }

    // Apply filtering if specified
    if (params.filterColumn && params.filterValue) {
      rows = rows.filter((row) => {
        const value = row[params.filterColumn!];
        if (typeof value === "string") {
          return value
            .toLowerCase()
            .includes(params.filterValue!.toLowerCase());
        }
        return String(value) === params.filterValue;
      });
    }

    // Apply sorting if specified
    if (params.sortBy && headers.includes(params.sortBy)) {
      rows = [...rows].sort((a, b) => {
        const aVal = a[params.sortBy!];
        const bVal = b[params.sortBy!];

        if (typeof aVal === "number" && typeof bVal === "number") {
          return params.sortOrder === "desc" ? bVal - aVal : aVal - bVal;
        }

        const aStr = String(aVal || "").toLowerCase();
        const bStr = String(bVal || "").toLowerCase();

        if (params.sortOrder === "desc") {
          return bStr.localeCompare(aStr);
        }
        return aStr.localeCompare(bStr);
      });
    }

    // Apply limit
    const totalRows = rows.length;
    if (params.limit && params.limit > 0) {
      rows = rows.slice(0, params.limit);
    }

    // Calculate summary statistics for numeric columns
    const summary: { label: string; value: string }[] = [];

    // Count total rows
    summary.push({ label: "Total Rows", value: String(totalRows) });

    // Find numeric columns and calculate basic stats
    const numericColumns = headers.filter((header) => {
      const firstValue = data.rows[0]?.[header];
      return typeof firstValue === "number";
    });

    numericColumns.slice(0, 3).forEach((col) => {
      const values = data.rows
        .map((row) => row[col])
        .filter((val) => typeof val === "number");

      if (values.length > 0) {
        const sum = values.reduce((acc, val) => acc + val, 0);
        const avg = sum / values.length;
        summary.push({
          label: `Avg ${col}`,
          value: avg.toFixed(2),
        });
      }
    });

    // Convert row objects to 2D string arrays (matching headers order)
    const rowArrays: string[][] = rows.map((row) =>
      headers.map((h) => (row[h] != null ? String(row[h]) : ""))
    );

    return {
      headers,
      rows: rowArrays,
      totalRows,
      summary,
    };
  } catch (error) {
    console.error("Error analyzing CSV:", error);
    throw error;
  }
}
