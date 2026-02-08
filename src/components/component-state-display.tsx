"use client";

import { useEffect, useState } from "react";
import { ComponentStateSnapshot } from "@/lib/component-state";

interface StateDisplayProps {
  className?: string;
}

/**
 * Component that displays the current state of active Tambo components
 * Listens to state change events dispatched by Graph, DataTable, etc.
 */
export function ComponentStateDisplay({ className = "" }: StateDisplayProps) {
  const [state, setState] = useState<ComponentStateSnapshot | null>(null);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    // Listen for component state updates
    const handleStateChange = (event: CustomEvent<ComponentStateSnapshot>) => {
      const snapshot = event.detail;
      setState(snapshot);
      formatStateDisplay(snapshot);
    };

    window.addEventListener(
      "tambo-component-state-change",
      handleStateChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "tambo-component-state-change",
        handleStateChange as EventListener
      );
    };
  }, []);

  const formatStateDisplay = (snapshot: ComponentStateSnapshot) => {
    const { type, state: componentState } = snapshot;

    switch (type) {
      case "Graph": {
        const chartType = componentState.chartType || "line";
        const dataRange = componentState.dataRange || "all";
        const sortInfo = componentState.sortBy ? ` | Sort: ${componentState.sortBy}` : " | Sort: None";
        setDisplayText(`📊 Viewing: ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart | Data: ${dataRange}${sortInfo}`);
        break;
      }

      case "DataTable": {
        const visibleCols = componentState.visibleColumns;
        const visibleCount = Array.isArray(visibleCols) ? visibleCols.length : "all";
        const totalColumns = componentState.totalColumns || "?";
        const density = componentState.density || "Normal";
        const searchTerm = componentState.searchTerm;
        const searchInfo = searchTerm ? ` | Search: "${String(searchTerm)}"` : "";
        setDisplayText(
          `📋 Table View | Visible Columns: ${visibleCount}/${totalColumns} | Density: ${density}${searchInfo}`
        );
        break;
      }

      case "StockCard": {
        const riskFilters = componentState.riskFilters;
        const riskFilter = Array.isArray(riskFilters)
          ? riskFilters.map(r => String(r)).join(", ")
          : "all";
        const sortBy = String(componentState.sortBy || "default");
        setDisplayText(
          `📈 Stocks | Risk Filter: ${riskFilter} | Sort: ${sortBy}`
        );
        break;
      }

      default:
        setDisplayText(`${type} component`);
    }
  };

  // Only show if we have state
  if (!state || !displayText) {
    return null;
  }

  return (
    <div
      className={`px-4 py-2 bg-blue-50 border-b border-blue-100 text-sm text-gray-700 font-medium flex items-center gap-2 ${className}`}
    >
      <span>{displayText}</span>
      <span className="ml-auto text-xs text-gray-500">Component State</span>
    </div>
  );
}
