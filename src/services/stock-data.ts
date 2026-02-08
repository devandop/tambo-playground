/**
 * Stock data service
 * Provides mock data for stock recommendations
 */

interface StockData {
  symbol: string;
  name: string;
  sector: string;
  currentPrice: number;
  targetPrice: number;
  potentialGain: string;
  marketCap: string;
  reason: string;
  risk: "low" | "medium" | "high";
  logoUrl?: string;
}

const stockDatabase: StockData[] = [
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    sector: "Semiconductors",
    currentPrice: 875.50,
    targetPrice: 1150.00,
    potentialGain: "31.4",
    marketCap: "$2.2T",
    reason: "Leading AI chip manufacturer with strong demand for H100/H200 GPUs. Data center revenue continues to surge as companies invest heavily in AI infrastructure.",
    risk: "medium",
    logoUrl: "https://logo.clearbit.com/nvidia.com",
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    sector: "Automotive",
    currentPrice: 248.30,
    targetPrice: 350.00,
    potentialGain: "41.0",
    marketCap: "$790B",
    reason: "Full Self-Driving technology advancement and Cybertruck production ramp-up. Energy storage business showing strong growth trajectory.",
    risk: "high",
    logoUrl: "https://logo.clearbit.com/tesla.com",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    sector: "Software",
    currentPrice: 418.75,
    targetPrice: 500.00,
    potentialGain: "19.4",
    marketCap: "$3.1T",
    reason: "Azure cloud growth accelerating with AI services. GitHub Copilot and Office 365 showing strong adoption. OpenAI partnership providing competitive advantage.",
    risk: "low",
    logoUrl: "https://logo.clearbit.com/microsoft.com",
  },
  {
    symbol: "COIN",
    name: "Coinbase Global",
    sector: "Cryptocurrency",
    currentPrice: 212.40,
    targetPrice: 320.00,
    potentialGain: "50.6",
    marketCap: "$51B",
    reason: "Bitcoin ETF approval driving institutional crypto adoption. Regulatory clarity improving. Transaction volumes increasing with market recovery.",
    risk: "high",
    logoUrl: "https://logo.clearbit.com/coinbase.com",
  },
  {
    symbol: "AMD",
    name: "Advanced Micro Devices",
    sector: "Semiconductors",
    currentPrice: 157.20,
    targetPrice: 220.00,
    potentialGain: "40.0",
    marketCap: "$254B",
    reason: "MI300 AI accelerators gaining market share. Strong data center CPU growth. Gaming and embedded segments stabilizing.",
    risk: "medium",
    logoUrl: "https://logo.clearbit.com/amd.com",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    sector: "Technology",
    currentPrice: 142.80,
    targetPrice: 180.00,
    potentialGain: "26.1",
    marketCap: "$1.8T",
    reason: "Gemini AI integration across products. Cloud revenue growing steadily. Search dominance with AI enhancements. YouTube revenue resilient.",
    risk: "low",
    logoUrl: "https://logo.clearbit.com/google.com",
  },
];

export interface StockComparison {
  stockA: StockData;
  stockB: StockData;
  metrics: Array<{
    metric: string;
    valueA: string;
    valueB: string;
    winner: "A" | "B" | "tie";
  }>;
}

export interface CompareStocksParams {
  symbolA: string;
  symbolB: string;
}

export async function compareStocks(
  params: CompareStocksParams
): Promise<StockComparison> {
  const stockA = stockDatabase.find(
    (s) => s.symbol.toUpperCase() === params.symbolA.toUpperCase()
  );
  const stockB = stockDatabase.find(
    (s) => s.symbol.toUpperCase() === params.symbolB.toUpperCase()
  );

  if (!stockA || !stockB) {
    throw new Error(
      `Stock not found: ${!stockA ? params.symbolA : params.symbolB}`
    );
  }

  const gainA = parseFloat(stockA.potentialGain);
  const gainB = parseFloat(stockB.potentialGain);

  const metrics = [
    {
      metric: "Current Price",
      valueA: `$${stockA.currentPrice.toFixed(2)}`,
      valueB: `$${stockB.currentPrice.toFixed(2)}`,
      winner: "tie" as const,
    },
    {
      metric: "Target Price",
      valueA: `$${stockA.targetPrice.toFixed(2)}`,
      valueB: `$${stockB.targetPrice.toFixed(2)}`,
      winner: (stockA.targetPrice > stockB.targetPrice ? "A" : stockA.targetPrice < stockB.targetPrice ? "B" : "tie") as "A" | "B" | "tie",
    },
    {
      metric: "Potential Gain",
      valueA: `${stockA.potentialGain}%`,
      valueB: `${stockB.potentialGain}%`,
      winner: (gainA > gainB ? "A" : gainA < gainB ? "B" : "tie") as "A" | "B" | "tie",
    },
    {
      metric: "Market Cap",
      valueA: stockA.marketCap,
      valueB: stockB.marketCap,
      winner: "tie" as const,
    },
    {
      metric: "Risk Level",
      valueA: stockA.risk.charAt(0).toUpperCase() + stockA.risk.slice(1),
      valueB: stockB.risk.charAt(0).toUpperCase() + stockB.risk.slice(1),
      winner: "tie" as const,
    },
    {
      metric: "Sector",
      valueA: stockA.sector,
      valueB: stockB.sector,
      winner: "tie" as const,
    },
  ];

  return { stockA, stockB, metrics };
}

export interface GetStocksParams {
  sector?: string;
  riskLevel?: "low" | "medium" | "high";
  limit?: number;
}

export async function getStockRecommendations(
  params?: GetStocksParams
): Promise<StockData[]> {
  let filtered = [...stockDatabase];

  if (params?.sector) {
    filtered = filtered.filter(
      (stock) => stock.sector.toLowerCase() === params.sector!.toLowerCase()
    );
  }

  if (params?.riskLevel) {
    filtered = filtered.filter((stock) => stock.risk === params.riskLevel);
  }

  if (params?.limit) {
    filtered = filtered.slice(0, params.limit);
  }

  return filtered;
}
