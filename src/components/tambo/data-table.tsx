"use client";

import { useState, useMemo, useEffect } from "react";
import { z } from "zod";
import { ArrowUp, ArrowDown, Search, Download, Eye, EyeOff, MoreVertical } from "lucide-react";

export const dataTableSchema = z.object({
  headers: z.array(z.string()).describe("Column headers"),
  rows: z
    .array(z.array(z.string()))
    .describe(
      "Array of rows. Each row is an array of string cell values in the same order as headers."
    ),
  totalRows: z
    .number()
    .optional()
    .describe("Total number of rows in the full dataset"),
  summary: z
    .array(
      z.object({
        label: z.string().describe("Stat label"),
        value: z.string().describe("Stat value"),
      })
    )
    .optional()
    .describe("Summary statistics to display above the table"),
});

export type DataTableProps = z.infer<typeof dataTableSchema>;

export function DataTable({ headers, rows, totalRows, summary }: DataTableProps) {
  const [sortColumnIdx, setSortColumnIdx] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState<Set<number>>(
    new Set(Array.from({ length: (Array.isArray(headers) ? headers.length : 0) }, (_, i) => i))
  );
  const [viewDensity, setViewDensity] = useState<"compact" | "normal">("normal");
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const rowsPerPage = 10;

  const safeHeaders = Array.isArray(headers) ? headers : [];
  const safeRows = Array.isArray(rows) ? rows : [];

  // Filter rows based on search
  const filteredRows = useMemo(() => {
    if (!searchTerm || safeRows.length === 0) return safeRows;

    return safeRows.filter((row) => {
      if (!Array.isArray(row)) return false;
      return row.some((cell) =>
        String(cell ?? "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    });
  }, [safeRows, searchTerm]);

  // Sort rows
  const sortedRows = useMemo(() => {
    if (sortColumnIdx === null || filteredRows.length === 0) return filteredRows;

    return [...filteredRows].sort((a, b) => {
      if (!Array.isArray(a) || !Array.isArray(b)) return 0;

      const aVal = a[sortColumnIdx] ?? "";
      const bVal = b[sortColumnIdx] ?? "";

      // Try numeric comparison
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      if (!isNaN(aNum) && !isNaN(bNum) && aVal !== "" && bVal !== "") {
        return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
      }

      // String comparison
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortDirection === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [filteredRows, sortColumnIdx, sortDirection]);

  // Paginate
  const totalPages = Math.ceil(sortedRows.length / rowsPerPage);
  const paginatedRows = sortedRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSort = (idx: number) => {
    if (sortColumnIdx === idx) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumnIdx(idx);
      setSortDirection("asc");
    }
  };

  const toggleColumnVisibility = (columnIdx: number) => {
    const newVisibleColumns = new Set(visibleColumns);
    if (newVisibleColumns.has(columnIdx)) {
      newVisibleColumns.delete(columnIdx);
    } else {
      newVisibleColumns.add(columnIdx);
    }
    setVisibleColumns(newVisibleColumns);

    // Dispatch state change event for display
    const event = new CustomEvent("tambo-component-state-change", {
      detail: {
        componentId: "data-table-1",
        type: "DataTable",
        state: {
          visibleColumns: Array.from(newVisibleColumns),
          totalColumns: safeHeaders.length,
          density: viewDensity,
          searchTerm: searchTerm || undefined,
        },
        timestamp: Date.now(),
        summary: `DataTable with ${newVisibleColumns.size}/${safeHeaders.length} visible columns`,
      },
    });
    window.dispatchEvent(event);
  };

  const exportToCSV = () => {
    const csvContent = [
      // Headers (only visible columns)
      Array.from({ length: safeHeaders.length })
        .map((_, i) => (visibleColumns.has(i) ? safeHeaders[i] : ""))
        .filter(h => h)
        .join(","),
      // Rows (only visible columns)
      ...sortedRows.map(row =>
        Array.isArray(row)
          ? Array.from({ length: row.length })
              .map((_, i) => (visibleColumns.has(i) ? row[i] || "" : ""))
              .filter((_, i) => visibleColumns.has(i))
              .join(",")
          : ""
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `table-${Date.now()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Streaming guard with loading messages
  if (safeHeaders.length === 0 || safeRows.length === 0) {
    return (
      <div className="w-full p-8 flex flex-col items-center justify-center gap-3 bg-gray-50 rounded-lg border border-gray-200 min-h-64">
        <div className="flex items-center gap-1 h-4">
          <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.2s]"></span>
          <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.1s]"></span>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">📥 Parsing columns...</p>
          <p className="text-xs text-gray-500 mt-1">Building search index</p>
        </div>
      </div>
    );
  }

  // Show ready indicator once
  const [showReadyMessage, setShowReadyMessage] = useState(false);
  useEffect(() => {
    if (safeHeaders.length > 0 && safeRows.length > 0 && !showReadyMessage) {
      setShowReadyMessage(true);
      const timer = setTimeout(() => setShowReadyMessage(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [safeHeaders.length, safeRows.length, showReadyMessage]);

  return (
    <div className="w-full space-y-4">
      {/* Summary cards */}
      {summary && summary.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {summary.map((stat, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-lg p-3"
            >
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                {stat.label}
              </p>
              <p className="text-lg font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Ready indicator */}
      {showReadyMessage && (
        <div className="text-xs font-medium text-green-600 animate-pulse">
          ✅ Table ready - Click Eye to manage columns
        </div>
      )}

      {/* Search bar and controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search in table..."
            value={searchTerm}
            onChange={(e) => {
              const newSearchTerm = e.target.value;
              setSearchTerm(newSearchTerm);
              setCurrentPage(1);
              // Dispatch state change event for display
              if (newSearchTerm) {
                const event = new CustomEvent("tambo-component-state-change", {
                  detail: {
                    componentId: "data-table-1",
                    type: "DataTable",
                    state: {
                      visibleColumns: Array.from(visibleColumns),
                      totalColumns: safeHeaders.length,
                      density: viewDensity,
                      searchTerm: newSearchTerm,
                    },
                    timestamp: Date.now(),
                    summary: `DataTable searching for "${newSearchTerm}"`,
                  },
                });
                window.dispatchEvent(event);
              }
            }}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="text-sm text-gray-600">
          {sortedRows.length} of {totalRows ?? safeRows.length} rows
        </div>

        {/* Table Controls */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-xs font-semibold text-gray-600 hidden sm:inline">⚙️ Controls:</span>
          {/* View Density */}
          <select
            value={viewDensity}
            onChange={(e) => {
              const newDensity = e.target.value as "compact" | "normal";
              setViewDensity(newDensity);
              // Dispatch state change event for display
              const event = new CustomEvent("tambo-component-state-change", {
                detail: {
                  componentId: "data-table-1",
                  type: "DataTable",
                  state: {
                    visibleColumns: Array.from(visibleColumns),
                    totalColumns: safeHeaders.length,
                    density: newDensity,
                    searchTerm: searchTerm || undefined,
                  },
                  timestamp: Date.now(),
                  summary: `DataTable (${newDensity} view) with ${visibleColumns.size}/${safeHeaders.length} visible columns`,
                },
              });
              window.dispatchEvent(event);
            }}
            className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-white text-gray-700 hover:border-gray-400 transition-colors"
            title="Adjust row density"
          >
            <option value="compact">Compact</option>
            <option value="normal">Normal</option>
          </select>

          {/* Column Visibility Menu */}
          <div className="relative">
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="p-2 rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 transition-colors"
              title="Show/hide columns"
            >
              <Eye className="w-4 h-4" />
            </button>
            {showColumnMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                <div className="p-2 max-h-64 overflow-y-auto">
                  {safeHeaders.map((header, idx) => (
                    <label key={idx} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.has(idx)}
                        onChange={() => toggleColumnVisibility(idx)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{header}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Export CSV */}
          <button
            onClick={exportToCSV}
            className="p-2 rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 transition-colors"
            title="Export as CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {safeHeaders.map((header, idx) =>
                  visibleColumns.has(idx) ? (
                    <th
                      key={idx}
                      onClick={() => handleSort(idx)}
                      className={`${viewDensity === "compact" ? "px-3 py-2" : "px-4 py-3"} text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{header}</span>
                        {sortColumnIdx === idx && (
                          <>
                            {sortDirection === "asc" ? (
                              <ArrowUp className="w-3 h-3" />
                            ) : (
                              <ArrowDown className="w-3 h-3" />
                            )}
                          </>
                        )}
                      </div>
                    </th>
                  ) : null
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={Array.from(visibleColumns).length}
                    className={`${viewDensity === "compact" ? "px-3 py-4" : "px-4 py-8"} text-center text-sm text-gray-500`}
                  >
                    No results found
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {safeHeaders.map((_, colIdx) =>
                      visibleColumns.has(colIdx) ? (
                        <td
                          key={colIdx}
                          className={`${viewDensity === "compact" ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"} text-gray-700`}
                        >
                          {Array.isArray(row) && row[colIdx] != null
                            ? row[colIdx]
                            : "\u2014"}
                        </td>
                      ) : null
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between bg-gray-50">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
