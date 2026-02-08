/**
 * Refinement Helper Utilities
 * Utilities for handling component refinement requests and context awareness
 */

import type { ComponentStateSnapshot } from "./component-state";
import { isRefinementRequest } from "./component-state";

// Re-export for convenience
export { isRefinementRequest };

/**
 * Build enhanced context including component state awareness
 */
export function buildRefinementContext(
  baseContext: string,
  activeComponent: ComponentStateSnapshot | null,
  userMessage: string
): string {
  if (!activeComponent || !isRefinementRequest(userMessage)) {
    return baseContext;
  }

  const refinementContext = `

COMPONENT_REFINEMENT_MODE:
Current display: ${activeComponent.type}
State: ${activeComponent.summary}

The user is likely refining this component. If so:
- Modify only the component props
- Do NOT create a new component
- Keep same data structure
- Return updated component with new settings`;

  return baseContext + refinementContext;
}

/**
 * Detect component type from user message
 */
export function detectComponentReferenceInMessage(message: string): string | null {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes("chart") || lowerMsg.includes("graph") || lowerMsg.includes("bar") ||
      lowerMsg.includes("line") || lowerMsg.includes("pie")) {
    return "Graph";
  }

  if (lowerMsg.includes("table") || lowerMsg.includes("data") || lowerMsg.includes("column")) {
    return "DataTable";
  }

  if (lowerMsg.includes("stock") || lowerMsg.includes("risk") || lowerMsg.includes("gain")) {
    return "StockCard";
  }

  return null;
}

/**
 * Format component state for user display
 */
export function formatComponentState(component: ComponentStateSnapshot): string {
  return `Component: ${component.type} - ${component.summary}`;
}
