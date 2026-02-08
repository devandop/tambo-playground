"use client";

import { z } from "zod";
import { ChevronRight, Lightbulb } from "lucide-react";

export const explorationCardSchema = z.object({
  mainInsight: z.string().describe("Key insight about the data"),
  suggestions: z
    .array(
      z.object({
        label: z.string().describe("Short label for suggestion"),
        description: z.string().describe("Why user should try this"),
        action: z.string().describe("Prompt to execute when clicked"),
      })
    )
    .describe("Suggested exploration paths"),
});

export type ExplorationCardProps = z.infer<typeof explorationCardSchema>;

export function ExplorationCard({
  mainInsight,
  suggestions,
}: ExplorationCardProps) {
  // Streaming guard
  if (!mainInsight || !suggestions?.length) {
    return (
      <div className="w-full space-y-3 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-2/3" />
        <div className="h-32 bg-gray-200 rounded" />
      </div>
    );
  }

  const handleSuggestionClick = (action: string) => {
    // Dispatch custom event that ChatPanel listens for
    const event = new CustomEvent("exploration-action", {
      detail: { action },
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="w-full space-y-4">
      {/* Main Insight */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900 font-medium leading-relaxed">
            {mainInsight}
          </p>
        </div>
      </div>

      {/* Suggestions */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Suggested Explorations
        </h3>
        <div className="space-y-2">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(suggestion.action)}
              className="w-full p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {suggestion.label}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {suggestion.description}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500 italic">
        💡 Click any suggestion to explore that aspect of your data
      </p>
    </div>
  );
}
