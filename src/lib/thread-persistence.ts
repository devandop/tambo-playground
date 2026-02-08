/**
 * Thread Persistence Utility
 * Manages localStorage persistence for Tambo thread IDs
 * Allows conversation state to survive page refreshes
 */

const STORAGE_KEY_PREFIX = "tambo-compare-thread-";

/**
 * Get persisted thread ID from localStorage
 */
export function getPersistedThreadId(panelKey: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    const key = `${STORAGE_KEY_PREFIX}${panelKey}`;
    return localStorage.getItem(key);
  } catch (error) {
    console.warn("Failed to retrieve thread ID from localStorage:", error);
    return null;
  }
}

/**
 * Persist thread ID to localStorage
 */
export function persistThreadId(panelKey: string, threadId: string): void {
  try {
    if (typeof window === "undefined") return;
    const key = `${STORAGE_KEY_PREFIX}${panelKey}`;
    localStorage.setItem(key, threadId);
  } catch (error) {
    console.warn("Failed to persist thread ID to localStorage:", error);
  }
}

/**
 * Clear persisted thread ID for a specific panel
 */
export function clearPersistedThreadId(panelKey: string): void {
  try {
    if (typeof window === "undefined") return;
    const key = `${STORAGE_KEY_PREFIX}${panelKey}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.warn("Failed to clear thread ID from localStorage:", error);
  }
}

/**
 * Clear all persisted thread IDs
 */
export function clearAllPersistedThreads(): void {
  try {
    if (typeof window === "undefined") return;
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith(STORAGE_KEY_PREFIX)
    );
    keys.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.warn("Failed to clear all thread IDs from localStorage:", error);
  }
}
