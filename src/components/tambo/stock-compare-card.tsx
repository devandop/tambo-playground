"use client";

import { z } from "zod";

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

export const stockCompareCardSchema = z.object({
  stockA: z.object({
    symbol: z.string(),
    name: z.string(),
    sector: z.string(),
    currentPrice: z.number(),
    targetPrice: z.number(),
    potentialGain: z.string(),
    marketCap: z.string(),
    reason: z.string(),
    risk: z.enum(["low", "medium", "high"]),
  }),
  stockB: z.object({
    symbol: z.string(),
    name: z.string(),
    sector: z.string(),
    currentPrice: z.number(),
    targetPrice: z.number(),
    potentialGain: z.string(),
    marketCap: z.string(),
    reason: z.string(),
    risk: z.enum(["low", "medium", "high"]),
  }),
  metrics: z.array(z.object({
    metric: z.string(),
    valueA: z.string(),
    valueB: z.string(),
    winner: z.enum(["A", "B", "tie"]),
  })),
});

export type StockCompareCardProps = z.infer<typeof stockCompareCardSchema>;

export function StockCompareCard({ stockA, stockB, metrics }: StockCompareCardProps) {
  if (!stockA?.symbol || !stockB?.symbol) {
    return <div className="w-full h-32 bg-gray-100 rounded animate-pulse" />;
  }

  const StockHeader = ({ stock }: { stock: typeof stockA }) => (
    <div className={`bg-gradient-to-br ${getGradient(stock.symbol)} rounded-lg p-4 text-white`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-2xl font-bold">{stock.symbol}</div>
          <div className="text-sm opacity-90">{stock.name}</div>
        </div>
        <div className="px-2 py-1 rounded text-xs font-semibold bg-white/20">
          {stock.risk.toUpperCase()}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div><div className="opacity-75">Sector</div><div className="font-semibold">{stock.sector}</div></div>
        <div><div className="opacity-75">Market Cap</div><div className="font-semibold">{stock.marketCap}</div></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <StockHeader stock={stockA} />
        <StockHeader stock={stockB} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-3 py-2 font-semibold text-gray-700">{stockA.symbol}</th>
            <th className="text-center px-2 py-2 font-semibold text-gray-700">Metric</th>
            <th className="text-right px-3 py-2 font-semibold text-gray-700">{stockB.symbol}</th>
          </tr></thead>
          <tbody>
            {metrics?.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                <td className={`px-3 py-2 font-semibold ${row.winner === "A" ? "bg-green-50 text-green-700" : ""}`}>
                  {row.valueA}
                </td>
                <td className="px-2 py-2 text-center text-xs text-gray-500">
                  <div className="font-medium">{row.metric}</div>
                  {row.winner === "A" && <div className="text-green-600">←</div>}
                  {row.winner === "B" && <div className="text-green-600">→</div>}
                  {row.winner === "tie" && <div className="text-gray-400">=</div>}
                </td>
                <td className={`px-3 py-2 text-right font-semibold ${row.winner === "B" ? "bg-green-50 text-green-700" : ""}`}>
                  {row.valueB}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4">
        <div className="bg-blue-50 rounded-lg p-3 text-sm"><div className="font-semibold text-gray-700 mb-1">Analysis (A)</div><p className="text-gray-600">{stockA.reason}</p></div>
        <div className="bg-purple-50 rounded-lg p-3 text-sm"><div className="font-semibold text-gray-700 mb-1">Analysis (B)</div><p className="text-gray-600">{stockB.reason}</p></div>
      </div>
    </div>
  );
}
