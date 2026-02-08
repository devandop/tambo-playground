/**
 * Component State Management
 * Centralized system for tracking component state across the app
 * Enables AI to understand refinement requests vs new requests
 */

export interface ComponentStateSnapshot {
  componentId: string;
  type: "Graph" | "DataTable" | "StockCard" | "Other";
  state: {
    activeFilters?: Record<string, unknown>;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    chartType?: "bar" | "line" | "pie";
    searchTerm?: string;
    pageNumber?: number;
    visibleColumns?: string[];
    dataRange?: string;
    [key: string]: unknown;
  };
  timestamp: number;
  summary: string; // Human-readable summary for AI
}

/**
 * Generate human-readable summary of component state
 */
export function generateStateSummary(state: ComponentStateSnapshot): string {
  const { type, state: componentState } = state;
  
  switch (type) {
    case "Graph":
      return `Graph (${componentState.chartType || "line"}) showing ${componentState.dataRange || "all data"}`;
    
    case "DataTable":
      const sortInfo = componentState.sortBy 
        ? `sorted by ${componentState.sortBy} (${componentState.sortOrder || "asc"})`
        : "unsorted";
      const searchInfo = componentState.searchTerm ? `searching "${componentState.searchTerm}"` : "";
      return `DataTable ${sortInfo} ${searchInfo}`.trim();
    
    case "StockCard":
      const risks = componentState.activeFilters?.risks || ["low", "medium", "high"];
      const sort = componentState.sortBy || "default";
      return `StockCard showing ${Array.isArray(risks) ? risks.join(", ") : risks} risk stocks, sorted by ${sort}`;
    
    default:
      return `${type} component`;
  }
}

/**
 * Detect if a message is likely a refinement request
 */
export function isRefinementRequest(message: string): boolean {
  const refinementKeywords = [
    "make it",
    "show only",
    "sort by",
    "change to",
    "filter by",
    "switch to",
    "convert to",
    "group by",
    "highlight",
    "remove",
    "add",
    "hide",
    "show",
    "display",
    "only",
    "exclude",
    "include",
  ];

  const lowerMessage = message.toLowerCase();
  return refinementKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Generate AI instruction for refinement awareness
 */
export function generateRefinementInstruction(
  activeComponent: ComponentStateSnapshot | null
): string {
  if (!activeComponent) {
    return "";
  }

  const refinementRules = `
REFINEMENT_MODE_ACTIVE: The user's last message appears to be refining the currently displayed ${activeComponent.type}.
Current component state: ${activeComponent.summary}

Instructions:
1. If the message references the current component (e.g., "Make it a bar chart", "Sort by revenue"), ONLY update that component's state/settings
2. Do NOT create a new component - modify the existing one
3. Keep the same data source and structure
4. Return the same component type with updated props
5. If you're unsure if it's a refinement, assume it is if the message is short and action-oriented
`;

  return refinementRules;
}
