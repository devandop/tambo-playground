/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * This file serves as the central place to register your Tambo components and tools.
 * It exports arrays that will be used by the TamboProvider.
 *
 * Read more about Tambo at https://tambo.co/docs
 */

import { Graph, graphSchema } from "@/components/tambo/graph";
import { DataCard, dataCardSchema } from "@/components/ui/card-data";
import { StockCard, stockCardSchema } from "@/components/tambo/stock-card";
import { FoodCard, foodCardSchema } from "@/components/tambo/food-card";
import { InfoCard, infoCardSchema } from "@/components/tambo/info-card";
import { StockCompareCard, stockCompareCardSchema } from "@/components/tambo/stock-compare-card";
import {
  getCountryPopulations,
  getGlobalPopulationTrend,
} from "@/services/population-stats";
import { getStockRecommendations, compareStocks } from "@/services/stock-data";
import { getStreetFoodRecommendations } from "@/services/food-data";
import { analyzeCSV } from "@/services/csv-data";
import { generateDataInsights } from "@/services/data-insights";
import { analyzeDataStructure } from "@/services/data-structure-analyzer";
import { generateExplorationSuggestions } from "@/services/exploration-suggestions";
import { DataTable, dataTableSchema } from "@/components/tambo/data-table";
import { InsightCard, insightCardSchema } from "@/components/tambo/insight-card";
import { ExplorationCard, explorationCardSchema } from "@/components/tambo/exploration-card";
import { ActionCard, actionCardSchema } from "@/components/tambo/action-card";
import { RiskCard, riskCardSchema } from "@/components/tambo/risk-card";
import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";

/**
 * tools
 *
 * This array contains all the Tambo tools that are registered for use within the application.
 * Each tool is defined with its name, description, and expected props. The tools
 * can be controlled by AI to dynamically fetch data based on user interactions.
 */

export const tools: TamboTool[] = [
  {
    name: "countryPopulation",
    description:
      "A tool to get population statistics by country with advanced filtering options",
    tool: getCountryPopulations,
    inputSchema: z.object({
      continent: z.string().optional(),
      sortBy: z.enum(["population", "growthRate"]).optional(),
      limit: z.number().optional(),
      order: z.enum(["asc", "desc"]).optional(),
    }),
    outputSchema: z.array(
      z.object({
        countryCode: z.string(),
        countryName: z.string(),
        continent: z.enum([
          "Asia",
          "Africa",
          "Europe",
          "North America",
          "South America",
          "Oceania",
        ]),
        population: z.number(),
        year: z.number(),
        growthRate: z.number(),
      }),
    ),
  },
  {
    name: "globalPopulation",
    description:
      "A tool to get global population trends with optional year range filtering",
    tool: getGlobalPopulationTrend,
    inputSchema: z.object({
      startYear: z.number().optional(),
      endYear: z.number().optional(),
    }),
    outputSchema: z.array(
      z.object({
        year: z.number(),
        population: z.number(),
        growthRate: z.number(),
      }),
    ),
  },
  {
    name: "stockRecommendations",
    description:
      "A tool to get stock recommendations for 2026 with detailed analysis, target prices, and risk levels",
    tool: getStockRecommendations,
    inputSchema: z.object({
      sector: z.string().optional(),
      riskLevel: z.enum(["low", "medium", "high"]).optional(),
      limit: z.number().optional(),
    }),
    outputSchema: z.array(
      z.object({
        symbol: z.string(),
        name: z.string(),
        sector: z.string(),
        currentPrice: z.number(),
        targetPrice: z.number(),
        potentialGain: z.string(),
        marketCap: z.string(),
        reason: z.string(),
        risk: z.enum(["low", "medium", "high"]),
        logoUrl: z.string().optional(),
      })
    ),
  },
  {
    name: "streetFoodRecommendations",
    description:
      "A tool to get global street food recommendations with prices, locations, and spice levels",
    tool: getStreetFoodRecommendations,
    inputSchema: z.object({
      region: z.string().optional(),
      spiceLevel: z.enum(["mild", "medium", "hot", "very hot"]).optional(),
      priceRange: z.enum(["budget", "moderate"]).optional(),
      limit: z.number().optional(),
    }),
    outputSchema: z.array(
      z.object({
        name: z.string(),
        origin: z.string(),
        description: z.string(),
        price: z.string(),
        popularIn: z.array(z.string()),
        bestTime: z.string(),
        spiceLevel: z.enum(["mild", "medium", "hot", "very hot"]),
        imageUrl: z.string().optional(),
      })
    ),
  },
  {
    name: "compareStocks",
    description:
      "Compare two stocks side by side with detailed metrics including current price, target price, potential gain, risk level, and market cap. Use this when the user wants to compare two specific stocks.",
    tool: compareStocks,
    inputSchema: z.object({
      symbolA: z.string().describe("First stock ticker symbol (e.g., NVDA)"),
      symbolB: z.string().describe("Second stock ticker symbol (e.g., AMD)"),
    }),
    outputSchema: z.object({
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
      metrics: z.array(
        z.object({
          metric: z.string(),
          valueA: z.string(),
          valueB: z.string(),
          winner: z.enum(["A", "B", "tie"]),
        })
      ),
    }),
  },
  {
    name: "analyzeCSV",
    description:
      "Analyze uploaded CSV data. Filter, sort, and aggregate data based on user queries. Use this when the user has uploaded a CSV file and wants to explore the data.",
    tool: analyzeCSV,
    inputSchema: z.object({
      query: z.string().describe("The user's query about the data"),
      sortBy: z.string().optional().describe("Column name to sort by"),
      sortOrder: z.enum(["asc", "desc"]).optional().describe("Sort direction"),
      limit: z.number().optional().describe("Maximum number of rows to return"),
      filterColumn: z.string().optional().describe("Column to filter on"),
      filterValue: z.string().optional().describe("Value to filter for"),
    }),
    outputSchema: z.object({
      headers: z.array(z.string()),
      rows: z.array(z.array(z.string())),
      totalRows: z.number(),
      summary: z.array(
        z.object({
          label: z.string(),
          value: z.string(),
        })
      ).optional(),
    }),
  },
  {
    name: "generateDataInsights",
    description:
      "Generate AI-powered insights from uploaded CSV data. Analyzes data and returns summaries, top performers, trends, or recommendations. Use this when the user wants to understand patterns and insights in their data.",
    tool: generateDataInsights,
    inputSchema: z.object({
      analysisType: z
        .enum(["summary", "top_performers", "trends", "recommendations"])
        .describe(
          "Type of analysis: summary (overview), top_performers (best items), trends (changes over time), recommendations (action items)"
        ),
      column: z
        .string()
        .optional()
        .describe("Column to focus on for top_performers analysis (e.g., 'Revenue', 'Sales')"),
      limit: z
        .number()
        .optional()
        .describe("Number of top performers to return (default: 5)"),
    }),
    outputSchema: z.object({
      title: z.string(),
      description: z.string(),
      metrics: z.array(
        z.object({
          label: z.string(),
          value: z.string(),
          type: z.enum(["positive", "neutral", "warning"]),
        })
      ),
      topPerformers: z
        .array(
          z.object({
            rank: z.number(),
            name: z.string(),
            value: z.string(),
            details: z.string(),
          })
        )
        .optional(),
      recommendations: z.array(z.string()).optional(),
    }),
  },
  {
    name: "analyzeDataStructure",
    description:
      "Analyze the structure of uploaded CSV data and recommend the best Tambo component to visualize it. Returns data type (timeseries, ranking, etc.) and suggested component (Graph, DataTable, InsightCard).",
    tool: analyzeDataStructure,
    inputSchema: z.object({}),
    outputSchema: z.object({
      dataType: z.enum(["timeseries", "categorical", "ranking", "comparison", "unknown"]),
      suggestedComponent: z.enum(["Graph", "DataTable", "InsightCard", "InfoCard"]),
      reasoning: z.string(),
      confidence: z.number(),
    }),
  },
  {
    name: "generateExplorationSuggestions",
    description:
      "Generate personalized exploration suggestions for uploaded CSV data based on its structure. Returns smart suggestions for what to analyze next (compare categories, find outliers, analyze trends, etc.)",
    tool: generateExplorationSuggestions,
    inputSchema: z.object({}),
    outputSchema: z.object({
      mainInsight: z.string(),
      suggestions: z.array(
        z.object({
          label: z.string(),
          description: z.string(),
          action: z.string(),
        })
      ),
    }),
  },
  // Add more tools here
];

/**
 * components
 *
 * This array contains all the Tambo components that are registered for use within the application.
 * Each component is defined with its name, description, and expected props. The components
 * can be controlled by AI to dynamically render UI elements based on user interactions.
 */
export const components: TamboComponent[] = [
  {
    name: "Graph",
    description:
      "A component that renders various types of charts (bar, line, pie) using Recharts. Supports customizable data visualization with labels, datasets, and styling options. User can ask to switch chart types (e.g., 'Make it a bar chart'), change data ranges, or filter data. Use this for time-series data, comparisons, and distributions.",
    component: Graph,
    propsSchema: graphSchema,
  },
  {
    name: "DataCard",
    description:
      "A component that displays options as clickable cards with links and summaries with the ability to select multiple items.",
    component: DataCard,
    propsSchema: dataCardSchema,
  },
  {
    name: "StockCard",
    description:
      "A component that displays stock recommendations with prices, target prices, potential gains, risk levels, and analyst reasons. Perfect for showcasing investment opportunities. User can ask to filter by risk level, sort by gain/price, or refine recommendations (e.g., 'Show only low-risk stocks', 'Sort by gain descending', 'Show tech sector stocks'). Supports interactive refinement via filters and sorting controls.",
    component: StockCard,
    propsSchema: stockCardSchema,
  },
  {
    name: "FoodCard",
    description:
      "A component that displays street food recommendations with descriptions, prices, locations, spice levels, and best times to eat. Perfect for food discovery.",
    component: FoodCard,
    propsSchema: foodCardSchema,
  },
  {
    name: "DataTable",
    description:
      "An interactive data table with sorting, filtering, search, and pagination. Use this to display CSV data or any tabular data. Shows summary statistics and allows users to explore the data. User can ask to sort, filter, search, or change which columns are visible (e.g., 'Sort by revenue descending', 'Show only Q1 data', 'Hide the ID column'). Supports refinement through natural language.",
    component: DataTable,
    propsSchema: dataTableSchema,
  },
  {
    name: "StockCompareCard",
    description:
      "A component that displays a side-by-side comparison of two stocks with detailed metrics table and winner indicators. Use this ONLY when the compareStocks tool has been called and returned results comparing two stocks.",
    component: StockCompareCard,
    propsSchema: stockCompareCardSchema,
  },
  {
    name: "ExplorationCard",
    description:
      "Displays personalized exploration suggestions for CSV data. Shows a main insight about the data and clickable suggestions for interesting analyses (compare categories, find outliers, analyze trends). Use this when calling generateExplorationSuggestions.",
    component: ExplorationCard,
    propsSchema: explorationCardSchema,
  },
  {
    name: "InsightCard",
    description:
      "A component that displays AI-generated insights from CSV data analysis. Shows metrics, top performers, and actionable recommendations. Use this when displayinginformation from generateDataInsights tool results.",
    component: InsightCard,
    propsSchema: insightCardSchema,
  },
  {
    name: "ActionCard",
    description:
      "A component that displays a prioritized action plan with recommended steps to take. Use this when the user asks 'What should I focus on?', 'What should I do?', or requests actionable recommendations. Shows numbered actions with priorities (high/medium/low), reasoning, and expected impact.",
    component: ActionCard,
    propsSchema: actionCardSchema,
  },
  {
    name: "RiskCard",
    description:
      "A component that displays identified risks with severity levels, descriptions, and recommended actions. Use this when the user asks 'What are the risks?', 'What could go wrong?', or requests a risk assessment. Shows critical risks prominently with severity indicators and immediate action items.",
    component: RiskCard,
    propsSchema: riskCardSchema,
  },
  // {
  //   name: "InfoCard",
  //   description:
  //     "A general-purpose component for displaying any list of items, recommendations, comparisons, or results as rich visual cards. Use this for any topic: movies, books, travel destinations, products, people, apps, recipes, courses, etc. Each item can have a title, subtitle, description, imageUrl, highlight value, tags, and key-value details. Prefer this component whenever the user asks for a list or recommendations on any topic that does not match a more specific component.",
  //   component: InfoCard,
  //   propsSchema: infoCardSchema,
  // },
  // Add more components here
];
