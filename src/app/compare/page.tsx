"use client";

import { useState, useEffect, useRef } from "react";
import {
  TamboProvider,
  useTamboThread,
  useTamboThreadInput,
  currentTimeContextHelper,
  currentPageContextHelper,
} from "@tambo-ai/react";
import type { ContextHelpers } from "@tambo-ai/react";
import { components, tools } from "@/lib/tambo";
import { ScrollableMessageContainer } from "@/components/tambo/scrollable-message-container";
import { ThreadContent, ThreadContentMessages } from "@/components/tambo/thread-content";
import { ComponentStateDisplay } from "@/components/component-state-display";
// import { MessageSuggestions, MessageSuggestionsList, MessageSuggestionsStatus } from "@/components/tambo/message-suggestions";
import { Sparkles, MessageSquare, Send, Loader2, Clock, ArrowDown, Plus, X, Upload } from "lucide-react";
import { WatchlistPanel } from "@/components/tambo/watchlist-panel";
import { ChatErrorBoundary } from "@/components/error-boundary";
import { ThreadPersistence } from "@/components/thread-persistence";
import { CSVUpload } from "@/components/csv-upload";
import { setCSVData, clearCSVData, getCSVData } from "@/services/csv-data";
import { buildRefinementContext, isRefinementRequest } from "@/lib/refinement-helper";
import type { ComponentStateSnapshot } from "@/lib/component-state";

const EXAMPLE_PROMPTS = [
  {
    id: "stocks",
    title: "Stocks to Watch For in 2026",
    prompt: "Show me the top stocks to watch for in 2026 with detailed analysis, target prices, and risk levels",
    icon: "📈",
  },
  {
    id: "food",
    title: "Top Global Street Food",
    prompt: "Show me the most popular street food from around the world with prices, locations, and spice levels",
    icon: "🌮",
  },
  {
    id: "population",
    title: "Global Population Trends",
    prompt: "Show me global population trends and statistics for the fastest growing countries",
    icon: "🌍",
  },
  {
    id: "explore",
    title: "Explore Investment Sectors",
    prompt: "Help me explore investment options. Show me the available stock sectors as clickable cards so I can drill down into each one.",
    icon: "🔍",
  },
  {
    id: "csv",
    title: "Explore Your Data",
    prompt: "Show me the first 10 rows of the uploaded data and a summary",
    icon: "📊",
    requiresCsv: true,
  },
  {
    id: "csv-insights",
    title: "Analyze & Get Insights",
    prompt: "Analyze the uploaded data and provide insights about top performers, trends, and recommendations",
    icon: "✨",
    requiresCsv: true,
  },
  {
    id: "smart-viz",
    title: "Smart Visualization",
    prompt: "Analyze the structure of this CSV data and display it using the component that best fits the data type. First call analyzeDataStructure to determine the best visualization, then render that component with the data.",
    icon: "🎯",
    requiresCsv: true,
  },
  {
    id: "guided-explore",
    title: "Guided Exploration",
    prompt: "Generate personalized exploration suggestions for this CSV data. Call generateExplorationSuggestions to get smart suggestions based on the data structure, then render the ExplorationCard to show the user interesting ways to explore their data.",
    icon: "🧭",
    requiresCsv: true,
  },
];

// --- Hooks ---

function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsMobile(e.matches);
    handler(mql);
    mql.addEventListener("change", handler as (e: MediaQueryListEvent) => void);
    return () =>
      mql.removeEventListener("change", handler as (e: MediaQueryListEvent) => void);
  }, [breakpoint]);

  return isMobile;
}

// --- New Chat handler (temporarily disabled) ---
// function NewChatHandler({
//   onNewChat,
// }: {
//   onNewChat?: number;
// }) {
//   const { startNewThread } = useTamboThread();
//   const prevNewChatRef = useRef(onNewChat);

//   useEffect(() => {
//     if (onNewChat !== undefined && onNewChat !== prevNewChatRef.current) {
//       prevNewChatRef.current = onNewChat;
//       startNewThread();
//     }
//   }, [onNewChat, startNewThread]);

//   return null;
// }

// --- Chat Panel ---

function ChatPanel({
  title,
  description,
  icon,
  label,
  withComponents = true,
  triggerPrompt,
  triggerKey,
  headerClass,
  headerBorder,
  bgClass,
  labelClass,
  hint,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  label?: string;
  withComponents?: boolean;
  triggerPrompt?: string;
  triggerKey?: number;
  headerClass?: string;
  headerBorder?: string;
  bgClass?: string;
  labelClass?: string;
  hint?: string;
}) {
  const { thread, isIdle } = useTamboThread();
  const { setValue, submit } = useTamboThreadInput();
  const lastTriggerKeyRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const prevIsIdleRef = useRef(true);
  const [hintDismissed, setHintDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(`hint-dismissed-${label}`) === "true";
    } catch {
      return false;
    }
  });

  const dismissHint = () => {
    setHintDismissed(true);
    try {
      localStorage.setItem(`hint-dismissed-${label}`, "true");
    } catch {
      // ignore
    }
  };

  // Track response timing
  useEffect(() => {
    if (!isIdle && prevIsIdleRef.current) {
      startTimeRef.current = performance.now();
      setResponseTime(null);
    } else if (isIdle && !prevIsIdleRef.current && startTimeRef.current) {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      setResponseTime(parseFloat(elapsed.toFixed(1)));
      startTimeRef.current = null;
    }
    prevIsIdleRef.current = isIdle;
  }, [isIdle]);

  // Handle exploration suggestion clicks
  useEffect(() => {
    const handleExplorationAction = (event: any) => {
      const { action } = event.detail;
      if (action) {
        setValue(action);
        setTimeout(() => {
          submit();
        }, 50);
      }
    };

    window.addEventListener("exploration-action", handleExplorationAction);
    return () =>
      window.removeEventListener("exploration-action", handleExplorationAction);
  }, [setValue, submit]);

  // Submit when triggerPrompt changes
  useEffect(() => {
    if (triggerPrompt && triggerKey !== undefined && triggerKey !== lastTriggerKeyRef.current) {
      lastTriggerKeyRef.current = triggerKey;
      setValue(triggerPrompt);
      setTimeout(() => {
        submit();
      }, 50);
    }
  }, [triggerPrompt, triggerKey, setValue, submit]);

  const messages = thread?.messages ?? [];
  const isGenerating = !isIdle;

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Header */}
      <div className={`px-4 sm:px-6 py-3 sm:py-4 ${headerClass ?? "bg-slate-800/50 border-b border-slate-700"} ${headerBorder ?? "border-b border-slate-700"}`}>
        <div className="flex items-center gap-3 mb-1 sm:mb-2">
          <div className="p-2 rounded-lg bg-slate-700/50 backdrop-blur-sm">
            {icon}
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-slate-100">{title}</h2>
            {label && (
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${labelClass ?? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"}`}>
                {label}
              </span>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            {isGenerating && (
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
            )}
            {!isGenerating && responseTime !== null && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-300 bg-slate-700/50 px-2 py-1 rounded-full backdrop-blur-sm">
                <Clock className="w-3 h-3" />
                {responseTime}s
              </span>
            )}
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">{description}</p>
      </div>

      {/* Component State Display */}
      <ComponentStateDisplay />

      {/* Messages */}
      <ScrollableMessageContainer className={`min-h-0 p-4 sm:p-6 ${bgClass ?? "bg-slate-900/20"}`}>
        <ThreadContent>
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-slate-400 max-w-md">
                <div className="mb-4">
                  {withComponents ? (
                    <Sparkles className="w-12 h-12 mx-auto text-slate-500" />
                  ) : (
                    <MessageSquare className="w-12 h-12 mx-auto text-slate-500" />
                  )}
                </div>
                <p className="text-sm text-slate-300">
                  Select an example above or type a message to see the {withComponents ? "interactive response" : "text-only response"}
                </p>
              </div>
            </div>
          ) : (
            <>
              <ThreadContentMessages />
              {hint && !isGenerating && messages.length >= 2 && !hintDismissed && (
                <div className="mt-4 mx-1 flex items-start gap-2 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 relative backdrop-blur-sm">
                  <ArrowDown className="w-4 h-4 flex-shrink-0 mt-0.5 text-cyan-400" />
                  <p className="text-xs leading-relaxed flex-1">{hint}</p>
                  <button
                    onClick={dismissHint}
                    className="flex-shrink-0 p-0.5 hover:bg-cyan-500/20 rounded transition-colors"
                    aria-label="Dismiss hint"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </ThreadContent>
      </ScrollableMessageContainer>

      {/* Suggestion chips — temporarily disabled for debugging */}
    </div>
  );
}

const getContextHelpers = (): ContextHelpers => ({
  currentTime: currentTimeContextHelper,
  currentPage: currentPageContextHelper,
  availableData: () => {
    const csvData = getCSVData();
    let baseData = "Available data: Stock symbols are NVDA, TSLA, MSFT, COIN, AMD, GOOGL. " +
      "Sectors: Semiconductors, Automotive, Software, Cryptocurrency, Technology. " +
      "Street food origins: Thailand, Mexico, Vietnam, India, Germany, Japan, Venezuela/Colombia, China, Spain. " +
      "Population data is LIVE from the World Bank API — covers 2004-2023 globally and 20 countries across all continents (CHN, IND, USA, IDN, PAK, BRA, NGA, DEU, AUS, JPN, GBR, FRA, MEX, ETH, EGY, ZAF, KOR, ARG, COL, THA). ";

    if (csvData) {
      baseData += `CSV FILE UPLOADED: "${csvData.fileName}" with ${csvData.rows.length} rows and columns: ${csvData.headers.join(", ")}.
AVAILABLE TOOLS:
1. analyzeDataStructure - Analyzes CSV structure and recommends best component (timeseries→Graph, ranking→InsightCard, complex→DataTable). Use this to determine how to visualize the data.
2. analyzeCSV - Query/filter data, get summaries, find top performers.
3. generateDataInsights - Analyze patterns, find top performers, trends, and generate recommendations. `;
    }

    baseData += `

REFINEMENT: If user says "make it", "sort by", "filter by", "change to" → Update current component, don't render new one.`;

    return baseData;
  },
});

function CompareContent() {
  const [inputValue, setInputValue] = useState("");
  const [submittedPrompt, setSubmittedPrompt] = useState<string>("");
  const [promptKey, setPromptKey] = useState(0);
  const [newChatKey, setNewChatKey] = useState(0);
  const [activeTab, setActiveTab] = useState<"generative" | "plaintext">("generative");
  const [csvUploaded, setCsvUploaded] = useState(false);
  const isMobile = useIsMobile();

  const handleExampleClick = (prompt: string) => {
    setInputValue(prompt);
    handleSend(prompt);
  };

  const handleSend = (prompt?: string) => {
    const messageToSend = prompt || inputValue;
    if (!messageToSend.trim()) return;

    setSubmittedPrompt(messageToSend);
    setPromptKey(prev => prev + 1);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setNewChatKey(prev => prev + 1);
    setSubmittedPrompt("");
    setInputValue("");
    clearCSVData();
    setCsvUploaded(false);
  };

  const handleCsvUploaded = (data: { headers: string[]; rows: any[]; fileName: string }) => {
    setCSVData(data);
    setCsvUploaded(true);
  };

  const handleCsvCleared = () => {
    clearCSVData();
    setCsvUploaded(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section - Modern Design */}
      <div className="flex-shrink-0 border-b border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Title Section */}
          <div className="text-center mb-3">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="text-2xl">⚡</div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent">
                Tambo Playground
              </h1>
              <button
                onClick={handleNewChat}
                className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 hover:border-cyan-400/60 hover:from-cyan-500/30 hover:to-blue-500/30 rounded-lg transition-all flex items-center gap-1.5 flex-shrink-0 backdrop-blur-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Chat</span>
              </button>
            </div>
            <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Witness the rebellion against static interfaces. <span className="text-cyan-300 font-medium">Left: Interactive. Right: Plain text.</span> <br className="hidden sm:block" />
              <span className="text-xs text-slate-400 mt-1 block">Same AI. Same data. Completely different experience.</span>
            </p>
          </div>

          {/* Quick-Start Demo Buttons - Glowing Effect */}
          <div className="mb-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-5xl mx-auto">
              <button
                onClick={() => handleExampleClick("Show me the top stocks to watch for in 2026 with detailed analysis and target prices")}
                className="group p-2.5 rounded-lg border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/60 transition-all text-left backdrop-blur-sm hover:shadow-lg hover:shadow-cyan-500/20"
              >
                <span className="block text-lg mb-1 group-hover:scale-110 transition-transform">📈</span>
                <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">Stocks</span>
              </button>
              <button
                onClick={() => handleExampleClick("Show me global population trends over the last 20 years with growth rates")}
                className="group p-2.5 rounded-lg border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-green-500/10 hover:from-emerald-500/20 hover:to-green-500/20 hover:border-emerald-400/60 transition-all text-left backdrop-blur-sm hover:shadow-lg hover:shadow-emerald-500/20"
              >
                <span className="block text-lg mb-1 group-hover:scale-110 transition-transform">🌍</span>
                <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors">Population</span>
              </button>
              <button
                onClick={() => handleExampleClick("Show me popular street food recommendations from around the world with prices and locations")}
                className="group p-2.5 rounded-lg border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 hover:border-amber-400/60 transition-all text-left backdrop-blur-sm hover:shadow-lg hover:shadow-amber-500/20"
              >
                <span className="block text-lg mb-1 group-hover:scale-110 transition-transform">🍜</span>
                <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 transition-colors">Food</span>
              </button>
              <button
                onClick={() => {
                  const fileInput = document.getElementById("csv-file-input") as HTMLInputElement | null;
                  if (fileInput) fileInput.click();
                }}
                className="group p-2.5 rounded-lg border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-purple-500/10 hover:from-violet-500/20 hover:to-purple-500/20 hover:border-violet-400/60 transition-all text-left backdrop-blur-sm hover:shadow-lg hover:shadow-violet-500/20"
              >
                <span className="block text-lg mb-1 group-hover:scale-110 transition-transform">📊</span>
                <span className="text-xs font-semibold text-slate-200 group-hover:text-violet-300 transition-colors">CSV</span>
              </button>
            </div>
          </div>


          {/* CSV Upload Section */}
          <div className="max-w-3xl mx-auto mb-2.5">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-semibold text-slate-300">Upload Your Data</h3>
              {csvUploaded && (
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium border border-emerald-500/30">✓ Uploaded</span>
              )}
            </div>
            <CSVUpload onDataParsed={handleCsvUploaded} onClear={handleCsvCleared} />
          </div>

          {/* Unified Input */}
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything... 'Show me tech stocks' • 'Best street food' • 'Analyze my data'"
                className="w-full px-4 py-3 pr-12 rounded-lg border border-slate-600 bg-slate-800/50 text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 outline-none resize-none transition-all text-sm backdrop-blur-sm hover:border-slate-500"
                rows={1}
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputValue.trim()}
                className="absolute right-2 bottom-2 p-2 rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 group-hover:shadow-cyan-500/30"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      {isMobile && (
        <div className="flex-shrink-0 flex border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab("generative")}
            className={`flex-1 py-3 text-sm font-medium text-center transition-all ${
              activeTab === "generative"
                ? "text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/10"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Interactive
            </span>
          </button>
          <button
            onClick={() => setActiveTab("plaintext")}
            className={`flex-1 py-3 text-sm font-medium text-center transition-all ${
              activeTab === "plaintext"
                ? "text-blue-400 border-b-2 border-blue-400 bg-blue-500/10"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" /> Plain Text
            </span>
          </button>
        </div>
      )}

      {/* Comparison Grid */}
      <div className={`flex-1 min-h-0 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 ${
        isMobile ? "p-2" : "grid grid-cols-2 gap-5 p-4"
      }`}>
        {/* With Generative UI */}
        {(!isMobile || activeTab === "generative") && (
          <div className={`rounded-xl overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-shadow ${isMobile ? "h-full" : ""}`}>
            <ChatErrorBoundary panelName="Generative UI">
              <TamboProvider
                apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
                components={components}
                tools={tools}
                contextHelpers={getContextHelpers()}
                tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
              >
                <ThreadPersistence panelKey="generative" onNewChat={newChatKey} />
                <div className="flex flex-col h-full">
                  <WatchlistPanel />
                  <div className="flex-1 min-h-0">
                    <ChatPanel
                      title="Generative UI"
                      description="Rich, interactive components powered by Tambo"
                      icon={<Sparkles className="w-5 h-5 text-cyan-400" />}
                      label="Tambo"
                      withComponents={true}
                      triggerPrompt={submittedPrompt}
                      triggerKey={promptKey}
                      hint="Try it: Filter by risk level, change the sort order, click a card to drill down, or hit 'Refine with AI' to get tailored results."
                    />
                  </div>
                </div>
              </TamboProvider>
            </ChatErrorBoundary>
          </div>
        )}

        {/* Without Generative UI */}
        {(!isMobile || activeTab === "plaintext") && (
          <div className={`rounded-xl overflow-hidden border border-slate-500/30 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm shadow-2xl shadow-slate-600/10 hover:shadow-slate-600/20 transition-shadow ${isMobile ? "h-full" : ""}`}>
            <ChatErrorBoundary panelName="Plain Text">
              <TamboProvider
                apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
                components={[]}
                tools={tools}
                contextHelpers={getContextHelpers()}
                tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
              >
                <ThreadPersistence panelKey="plaintext" onNewChat={newChatKey} />
                <ChatPanel
                  title="Plain Text"
                  description="Standard text-only AI response"
                  icon={<MessageSquare className="w-5 h-5 text-slate-400" />}
                  label="Baseline"
                  withComponents={false}
                  triggerPrompt={submittedPrompt}
                  triggerKey={promptKey}
                  hint="Now try filtering, sorting, or drilling down here. You can't — the only option is to re-type your question."
                />
              </TamboProvider>
            </ChatErrorBoundary>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ComparePage() {
  return <CompareContent />;
}
