"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import {
  useTamboComponentState,
  useTamboThreadInput,
  useTamboThread,
} from "@tambo-ai/react";
import { Sparkles } from "lucide-react";

const GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-500",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-blue-600",
];

function getGradient(symbol: string) {
  const hash = symbol
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return GRADIENTS[hash % GRADIENTS.length];
}

export const stockCardSchema = z.object({
  stocks: z.array(
    z.object({
      symbol: z.string().describe("Stock ticker symbol (e.g., AAPL, GOOGL)"),
      name: z.string().describe("Company name"),
      sector: z.string().describe("Industry sector"),
      currentPrice: z.number().describe("Current stock price in USD"),
      targetPrice: z.number().describe("Analyst target price in USD"),
      potentialGain: z.string().describe("Potential gain percentage"),
      marketCap: z.string().describe("Market capitalization"),
      reason: z.string().describe("Why this stock is worth watching"),
      risk: z.enum(["low", "medium", "high"]).describe("Risk level"),
      logoUrl: z
        .string()
        .optional()
        .describe("URL to the company logo image"),
    })
  ),
});

export type StockCardProps = z.infer<typeof stockCardSchema>;

function CompanyLogo({
  logoUrl,
  symbol,
}: {
  logoUrl?: string;
  symbol: string;
}) {
  if (logoUrl) {
    return (
      <>
        <img
          src={logoUrl}
          alt={symbol}
          className="w-10 h-10 rounded-lg object-contain bg-white border border-gray-100 p-1"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = "flex";
          }}
        />
        <div
          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getGradient(symbol)} items-center justify-center hidden`}
        >
          <span className="text-white font-bold text-sm">{symbol.slice(0, 2)}</span>
        </div>
      </>
    );
  }

  return (
    <div
      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getGradient(symbol)} flex items-center justify-center`}
    >
      <span className="text-white font-bold text-sm">{symbol.slice(0, 2)}</span>
    </div>
  );
}

const RISK_LEVELS = ["low", "medium", "high"] as const;
const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "gainDesc", label: "Gain % (High)" },
  { value: "gainAsc", label: "Gain % (Low)" },
  { value: "priceDesc", label: "Price (High)" },
] as const;

export function StockCard({ stocks }: StockCardProps) {
  const [riskFilter, setRiskFilter] = useTamboComponentState<string[]>(
    "riskFilter",
    ["low", "medium", "high"]
  );
  const [sortBy, setSortBy] = useTamboComponentState<string>("sortBy", "default");
  const { setValue, submit } = useTamboThreadInput();
  const { isIdle } = useTamboThread();
  const [showReadyMessage, setShowReadyMessage] = useState(false);

  useEffect(() => {
    if (stocks && stocks.length > 0 && !showReadyMessage) {
      setShowReadyMessage(true);
      const timer = setTimeout(() => setShowReadyMessage(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [stocks, showReadyMessage]);

  const getRiskColor = (risk: "low" | "medium" | "high") => {
    switch (risk) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
    }
  };

  const getGainColor = (gain: string) => {
    const value = parseFloat(gain);
    if (value > 30) return "text-green-700";
    if (value > 15) return "text-green-600";
    return "text-green-500";
  };

  const toggleRisk = (risk: string) => {
    const current = riskFilter ?? ["low", "medium", "high"];
    let newFilter: string[];
    if (current.includes(risk)) {
      if (current.length > 1) {
        newFilter = current.filter((r) => r !== risk);
      } else {
        return; // Don't allow unchecking last item
      }
    } else {
      newFilter = [...current, risk];
    }
    setRiskFilter(newFilter);

    // Dispatch state change event for display
    const event = new CustomEvent("tambo-component-state-change", {
      detail: {
        componentId: "stock-card-1",
        type: "StockCard",
        state: {
          riskFilters: newFilter,
          sortBy: sortBy ?? "default",
        },
        timestamp: Date.now(),
        summary: `StockCard filtering ${newFilter.join(", ")} risk stocks, sorted by ${sortBy ?? "default"}`,
      },
    });
    window.dispatchEvent(event);
  };

  const handleRefine = () => {
    if (!isIdle) return;
    const risks = (riskFilter ?? ["low", "medium", "high"]).join(", ");
    const sortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "default";
    setValue(
      `Refine stock recommendations. I want ${risks} risk stocks, sorted by ${sortLabel}. Show me more options.`
    );
    setTimeout(() => submit(), 50);
  };

  // Handle streaming - props may be undefined while loading
  if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200 min-h-64">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div className="flex items-center gap-1 h-4">
            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.2s]"></span>
            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.1s]"></span>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">📊 Fetching stock data...</p>
            <p className="text-xs text-gray-400 mt-1">Analyzing recommendations</p>
          </div>
        </div>
      </div>
    );
  }

  // Client-side filter and sort
  const activeFilter = riskFilter ?? ["low", "medium", "high"];
  const filteredStocks = stocks
    .filter((s) => s?.symbol && activeFilter.includes(s.risk))
    .sort((a, b) => {
      if (sortBy === "gainDesc")
        return parseFloat(b.potentialGain) - parseFloat(a.potentialGain);
      if (sortBy === "gainAsc")
        return parseFloat(a.potentialGain) - parseFloat(b.potentialGain);
      if (sortBy === "priceDesc") return b.currentPrice - a.currentPrice;
      return 0;
    });

  return (
    <div>
      {/* Ready indicator */}
      {showReadyMessage && (
        <div className="text-xs font-medium text-green-600 mb-3 animate-pulse">
          ✅ Ready - Use filters to explore
        </div>
      )}

      {/* Filter & Sort Bar */}
      <div className="mb-4">
        <div className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">📊 Filter & Sort</div>
        <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mr-1">Risk:</span>
        {RISK_LEVELS.map((risk) => {
          const active = activeFilter.includes(risk);
          return (
            <button
              key={risk}
              onClick={() => toggleRisk(risk)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                active
                  ? getRiskColor(risk)
                  : "bg-white text-gray-400 border-gray-200"
              }`}
            >
              {risk.charAt(0).toUpperCase() + risk.slice(1)}
            </button>
          );
        })}

        <span className="text-gray-300 mx-1">|</span>

        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mr-1">Sort:</span>
        <select
          value={sortBy ?? "default"}
          onChange={(e) => {
            const newSort = e.target.value;
            setSortBy(newSort);
            // Dispatch state change event for display
            const event = new CustomEvent("tambo-component-state-change", {
              detail: {
                componentId: "stock-card-1",
                type: "StockCard",
                state: {
                  riskFilters: riskFilter ?? ["low", "medium", "high"],
                  sortBy: newSort,
                },
                timestamp: Date.now(),
                summary: `StockCard filtering ${(riskFilter ?? ["low", "medium", "high"]).join(", ")} risk stocks, sorted by ${newSort}`,
              },
            });
            window.dispatchEvent(event);
          }}
          className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700 outline-none focus:border-blue-300"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-gray-400">
            {filteredStocks.length} of {stocks.length}
          </span>
          <button
            onClick={handleRefine}
            disabled={!isIdle}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            Refine with AI
          </button>
        </div>
      </div>
      </div>

      {/* Stock Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStocks.map((stock, index) => {
          if (!stock?.symbol) return null;

          return (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-5 bg-white hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <CompanyLogo logoUrl={stock.logoUrl} symbol={stock.symbol} />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {stock.symbol}
                    </h3>
                    <p className="text-sm text-gray-600">{stock.name ?? ""}</p>
                  </div>
                </div>
                {stock.risk && (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(
                      stock.risk
                    )}`}
                  >
                    {stock.risk.toUpperCase()} RISK
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Current Price</span>
                  <span className="text-lg font-semibold text-gray-900">
                    ${stock.currentPrice?.toFixed(2) ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Target Price</span>
                  <span className="text-lg font-semibold text-blue-600">
                    ${stock.targetPrice?.toFixed(2) ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Potential Gain</span>
                  <span
                    className={`text-lg font-bold ${getGainColor(
                      stock.potentialGain ?? "0"
                    )}`}
                  >
                    +{stock.potentialGain ?? "—"}%
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    {stock.sector ?? ""}
                  </span>
                  {stock.sector && stock.marketCap && (
                    <span className="text-xs text-gray-400">&bull;</span>
                  )}
                  <span className="text-xs text-gray-600">
                    {stock.marketCap ?? ""}
                  </span>
                </div>
              </div>

              {stock.reason && (
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {stock.reason}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredStocks.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          No stocks match the current filters. Try adjusting your risk level selection.
        </div>
      )}
    </div>
  );
}
