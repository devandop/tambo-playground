"use client";

import { withInteractable, useTamboComponentState } from "@tambo-ai/react";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Pin, PinOff } from "lucide-react";
import { z } from "zod";

const watchlistSchema = z.object({
  title: z.string().describe("Watchlist heading"),
  items: z
    .array(
      z.object({
        id: z
          .string()
          .describe("Unique identifier (e.g., stock symbol, food name)"),
        label: z.string().describe("Display name"),
        category: z
          .string()
          .describe("Category such as 'stock', 'food', 'country'"),
        detail: z
          .string()
          .optional()
          .describe("Brief detail (e.g., price, gain%)"),
        highlight: z
          .string()
          .optional()
          .describe("Highlighted value (e.g., +31.4%)"),
      })
    )
    .describe("Items in the watchlist"),
});

type WatchlistProps = z.infer<typeof watchlistSchema>;

const CATEGORY_COLORS: Record<string, string> = {
  stock: "bg-blue-100 text-blue-700",
  food: "bg-orange-100 text-orange-700",
  country: "bg-emerald-100 text-emerald-700",
};

function getCategoryColor(category: string) {
  return (
    CATEGORY_COLORS[category.toLowerCase()] ?? "bg-gray-100 text-gray-600"
  );
}

function WatchlistBase({ title, items }: WatchlistProps) {
  const [pinnedIds, setPinnedIds] = useTamboComponentState<string[]>(
    "pinnedIds",
    []
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());
  const prevItemsRef = useRef<typeof items>([]);

  // Detect newly added items and flash them
  useEffect(() => {
    if (!items || items.length === 0) return;
    const prevIds = new Set(prevItemsRef.current?.map((i) => i.id) ?? []);
    const newIds = items.filter((i) => !prevIds.has(i.id)).map((i) => i.id);

    if (newIds.length > 0) {
      setFlashIds(new Set(newIds));
      setIsExpanded(true);
      const timer = setTimeout(() => setFlashIds(new Set()), 1500);
      prevItemsRef.current = items;
      return () => clearTimeout(timer);
    }
    prevItemsRef.current = items;
  }, [items]);

  const togglePin = (id: string) => {
    const current = pinnedIds ?? [];
    if (current.includes(id)) {
      setPinnedIds(current.filter((p) => p !== id));
    } else {
      setPinnedIds([...current, id]);
    }
  };

  const currentPinned = pinnedIds ?? [];
  const safeItems = items ?? [];
  const sortedItems = [...safeItems].sort((a, b) => {
    const aPinned = currentPinned.includes(a.id) ? 0 : 1;
    const bPinned = currentPinned.includes(b.id) ? 0 : 1;
    return aPinned - bPinned;
  });

  const itemCount = safeItems.length;

  return (
    <div className="border-b border-gray-200 bg-white flex-shrink-0">
      {/* Header — always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            {title || "My Watchlist"}
          </span>
          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
            {itemCount}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="px-4 pb-3 max-h-40 overflow-y-auto">
          {sortedItems.length === 0 ? (
            <p className="text-xs text-gray-400 py-2 text-center">
              Items will appear here as you explore stocks, food, and more.
            </p>
          ) : (
            <div className="space-y-1">
              {sortedItems.map((item) => {
                const isPinned = currentPinned.includes(item.id);
                const isNew = flashIds.has(item.id);

                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-2 py-1.5 px-2 rounded-md text-sm transition-all ${
                      isNew ? "bg-blue-50 animate-pulse" : "hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getCategoryColor(
                        item.category
                      )}`}
                    >
                      {item.category}
                    </span>
                    <span className="text-gray-800 font-medium truncate flex-1">
                      {item.label}
                    </span>
                    {item.detail && (
                      <span className="text-xs text-gray-500">
                        {item.detail}
                      </span>
                    )}
                    {item.highlight && (
                      <span className="text-xs font-semibold text-green-600">
                        {item.highlight}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(item.id);
                      }}
                      className="p-0.5 rounded hover:bg-gray-200 transition-colors flex-shrink-0"
                      title={isPinned ? "Unpin" : "Pin"}
                    >
                      {isPinned ? (
                        <Pin className="w-3 h-3 text-blue-500" />
                      ) : (
                        <PinOff className="w-3 h-3 text-gray-300" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const InteractableWatchlist = withInteractable(WatchlistBase, {
  componentName: "Watchlist",
  description:
    "A persistent watchlist panel that tracks items the user is interested in. Whenever the user explores stocks, food, or countries, add the most relevant items to this watchlist. Each item needs: id (unique identifier like stock symbol), label (display name), category ('stock', 'food', or 'country'), and optionally detail and highlight. Always preserve existing items when adding new ones.",
  propsSchema: watchlistSchema,
});

export function WatchlistPanel() {
  return (
    <InteractableWatchlist
      title="My Watchlist"
      items={[]}
    />
  );
}
