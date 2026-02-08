"use client";

import { cn } from "@/lib/utils";
import { useTamboThreadInput, useTamboThread } from "@tambo-ai/react";
import * as React from "react";
import { z } from "zod";
import { ChevronRight, Loader2 } from "lucide-react";

// Define the component props schema with Zod
export const dataCardSchema = z.object({
  title: z.string().describe("Title displayed above the data cards"),
  followUpTemplate: z
    .string()
    .optional()
    .describe(
      "Template for the follow-up message sent when a card is clicked. Use {label} and {value} as placeholders. Default: 'Show me detailed information about: {label}'"
    ),
  options: z
    .array(
      z.object({
        id: z.string().describe("Unique identifier for this card"),
        label: z.string().describe("Display text for the card title"),
        value: z.string().describe("Value associated with this card"),
        description: z
          .string()
          .optional()
          .describe("Optional summary for the card"),
      })
    )
    .describe("Array of clickable option cards. When the user clicks one, a follow-up message is sent to get detailed results."),
});

// Define the props type based on the Zod schema
export type DataCardProps = z.infer<typeof dataCardSchema> &
  React.HTMLAttributes<HTMLDivElement>;

/**
 * DataCard Component
 *
 * Displays options as clickable cards. Clicking an option sends a follow-up
 * message to the AI so it can generate a detailed response with rich components.
 */
export const DataCard = React.forwardRef<HTMLDivElement, DataCardProps>(
  ({ title, followUpTemplate, options, className, ...props }, ref) => {
    const { setValue, submit } = useTamboThreadInput();
    const { isIdle } = useTamboThread();
    const [selectedId, setSelectedId] = React.useState<string | null>(null);

    const handleOptionClick = (card: { id: string; label: string; value: string }) => {
      if (!isIdle) return; // Don't allow clicks while AI is generating
      setSelectedId(card.id);
      const template = followUpTemplate || "Show me detailed information about: {label}";
      const message = template.replace("{label}", card.label).replace("{value}", card.value);
      setValue(message);
      setTimeout(() => {
        submit();
      }, 50);
    };

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {title && (
          <h2 className="text-lg font-medium text-gray-700 mb-3">{title}</h2>
        )}

        <div className="space-y-2">
          {options?.map((card, index) => {
            if (!card?.label) return null;
            const isSelected = selectedId === card.id;
            const isDisabled = !isIdle;

            return (
              <div
                key={`${card.id || "card"}-${index}`}
                onClick={() => handleOptionClick(card)}
                className={cn(
                  "group flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50",
                  isDisabled && !isSelected && "opacity-60 cursor-not-allowed"
                )}
              >
                <div className="flex-1 min-w-0">
                  <h3
                    className={cn(
                      "font-medium text-sm",
                      isSelected ? "text-blue-700" : "text-gray-900 group-hover:text-blue-600"
                    )}
                  >
                    {card.label}
                  </h3>
                  {card.description && (
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      {card.description}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {isSelected && !isIdle ? (
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  ) : (
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 transition-colors",
                        isSelected ? "text-blue-500" : "text-gray-400 group-hover:text-blue-400"
                      )}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

DataCard.displayName = "DataCard";

export default DataCard;
