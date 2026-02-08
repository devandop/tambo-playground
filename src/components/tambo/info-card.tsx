"use client";

import React from "react";
import { z } from "zod";

const GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-500",
  "from-pink-500 to-rose-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-blue-600",
  "from-fuchsia-500 to-pink-600",
];

function getGradient(title: string) {
  const hash = title
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return GRADIENTS[hash % GRADIENTS.length];
}

export const infoCardSchema = z.object({
  title: z.string().describe("Section heading"),
  items: z.array(
    z.object({
      title: z.string().describe("Item name"),
      subtitle: z
        .string()
        .optional()
        .describe("Secondary info (e.g. creator, source, year)"),
      description: z
        .string()
        .optional()
        .describe("Brief description of the item"),
      imageUrl: z
        .string()
        .optional()
        .describe(
          "URL to an image representing this item. Use a publicly accessible image URL if available."
        ),
      highlight: z
        .string()
        .optional()
        .describe("Featured value (e.g. rating, price, score)"),
      highlightLabel: z
        .string()
        .optional()
        .describe("Label for the highlight (e.g. 'Rating', 'Price')"),
      tags: z
        .array(z.string())
        .optional()
        .describe("Category tags or labels"),
      details: z
        .array(
          z.object({
            label: z.string().describe("Detail label"),
            value: z.string().describe("Detail value"),
          })
        )
        .optional()
        .describe("Key-value metadata pairs"),
    })
  ),
});

export type InfoCardProps = z.infer<typeof infoCardSchema>;

function Thumbnail({
  imageUrl,
  title,
}: {
  imageUrl?: string;
  title: string;
}) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={title}
        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = "flex";
        }}
      />
    );
  }

  return (
    <div
      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getGradient(title)} flex items-center justify-center flex-shrink-0`}
    >
      <span className="text-white font-bold text-xl">
        {title.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

export function InfoCard({ title, items }: InfoCardProps) {
  // Handle streaming - props may be undefined while loading
  if (!items || !Array.isArray(items) || items.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-400">
        <div className="animate-pulse flex space-x-4">
          <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && (
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          // Skip incomplete items during streaming
          if (!item?.title) return null;

          return (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-5 bg-white hover:shadow-lg transition-shadow"
            >
              {/* Header: image + title + subtitle + highlight */}
              <div className="flex items-start gap-3 mb-3">
                <Thumbnail imageUrl={item.imageUrl} title={item.title} />
                {/* Hidden fallback for image error */}
                {item.imageUrl && (
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getGradient(item.title)} items-center justify-center flex-shrink-0 hidden`}
                  >
                    <span className="text-white font-bold text-xl">
                      {item.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900">
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p className="text-sm text-gray-600">{item.subtitle}</p>
                  )}
                </div>
                {/* Highlight badge */}
                {item.highlight && (
                  <div className="flex-shrink-0 text-right">
                    {item.highlightLabel && (
                      <p className="text-xs text-gray-500">
                        {item.highlightLabel}
                      </p>
                    )}
                    <p className="text-lg font-bold text-blue-600">
                      {item.highlight}
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              {item.description && (
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  {item.description}
                </p>
              )}

              {/* Key-value details */}
              {item.details && item.details.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {item.details.map((detail, idx) => {
                    if (!detail?.label) return null;
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-24 flex-shrink-0">
                          {detail.label}:
                        </span>
                        <span className="text-sm text-gray-800">
                          {detail.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="border-t pt-3">
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
