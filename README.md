# Tambo Generative UI Playground 🎯

**A side-by-side comparison tool demonstrating the transformative power of AI-controlled interactive components vs. plain text responses.**

A production-ready hackathon project showcasing Tambo AI's generative UI capabilities with real-world features including live data integration, CSV analysis, component state management, and comprehensive error handling.

---

## 🌟 Project Overview

### The Core Concept

**Same AI. Same prompt. Same data. Two completely different experiences:**

- **Left Panel**: Interactive, component-driven UI (Tambo Generative UI)
- **Right Panel**: Traditional plain text response (baseline AI)

Users immediately see the difference: interactive components allow exploration, filtering, and drilling-down, while text requires re-asking the same question repeatedly.

### Why This Matters

Traditional chatbots give static text responses. Users have to re-type questions to explore different angles. Tambo enables **interactive responses**—users sort, filter, search, and drill-down without leaving the interface.

---

## 🎬 Key Features

### 1. **Side-by-Side Comparison UI**
- Synchronized prompts across both panels
- Real-time streaming with incremental rendering
- Mobile-responsive tab-based navigation for small screens
- Visual proof of interactive vs. plain text difference
- Component state display for debugging

### 2. **CSV Upload & AI Analysis**
- Upload custom CSV files (up to 10MB)
- AI-powered data exploration with natural language queries
- Interactive DataTable with sorting, searching, and pagination (10 rows/page)
- AI-generated insights with metrics, top performers, and recommendations
- Summary statistics and quick analysis

### 3. **Live API Integration**
- **World Bank API**: Real population data from 2004-2023
- **Stock Analysis**: AI-driven recommendations for NVDA, TSLA, MSFT, COIN, AMD, GOOGL
- **Street Food Database**: Global culinary discoveries from 9 origins
- Graceful fallback to mock data if APIs unavailable
- 10-second API timeouts with error recovery

### 4. **AI-Controlled Interactive Components** (8 total)
AI dynamically renders the best component based on context:

| Component | Use Case | Interactivity |
|-----------|----------|----------------|
| **StockCard** | Investment recommendations | Filter by risk level, sort by gain/price |
| **DataTable** | Raw data exploration | Sort, search, paginate, filter columns |
| **Graph** | Visualizations & trends | Switch chart types (bar/line/pie) |
| **InsightCard** | Analytics & summaries | Displays metrics and top performers |
| **FoodCard** | Food recommendations | Filterable by region, spice level, price |
| **ExplorationCard** | Guided data exploration | Clickable suggestions for analysis paths |
| **ActionCard** | Action plans & prioritization | Prioritized actions with reasoning (NEW) |
| **RiskCard** | Risk assessment & mitigation | Severity-colored risks with actions (NEW) |

### 5. **Production-Ready Architecture**
- **Error Boundaries**: 3 layers of crash protection (global + per-panel)
- **Component State Management**: Track user interactions within components
- **Refinement Detection**: AI knows when user is filtering vs. requesting new component
- **Type Safety**: Zod schemas for all components and tools, TypeScript strict mode
- **Streaming Support**: Progressive UI updates as AI generates data
- **Mobile First**: Fully responsive (mobile, tablet, desktop)

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js with App Router | 15.5.7 |
| **AI Integration** | Tambo AI SDK | 0.70.0 |
| **Language** | TypeScript | 5.0+ |
| **UI Framework** | React | 19.1.1 |
| **Styling** | Tailwind CSS + PostCSS | 4.0 |
| **Data Validation** | Zod | Latest |
| **Charts** | Recharts | 3.5.0 |
| **Icons** | Lucide React | 0.554 |
| **CSV Parsing** | PapaParse | 5.5.3 |
| **Rich Text** | TipTap | 3.17 |
| **Animation** | Framer Motion | 12.23 |

---

## 🏗️ Project Architecture

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface                          │
│  ┌──────────────────────┐      ┌──────────────────────┐    │
│  │  Generative UI Panel │      │  Plain Text Panel    │    │
│  │  (Tambo Components)  │      │  (Baseline AI)       │    │
│  └──────────────────────┘      └──────────────────────┘    │
└──────────────────┬───────────────────────────┬──────────────┘
                   │                           │
                   ▼                           ▼
        ┌─────────────────────┐     ┌──────────────────┐
        │  TamboProvider      │     │  Plain Chat API  │
        │  (Components/Tools) │     │  (Text Response) │
        └────────┬────────────┘     └──────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────┐
│            Component & Tool Registry System                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Components (8 total)                                   │ │
│  │ • StockCard • DataTable • Graph • InsightCard         │ │
│  │ • FoodCard • ExplorationCard • ActionCard • RiskCard  │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Tools (9 total)                                        │ │
│  │ • Stock Analysis • Food Recommendations               │ │
│  │ • Population Data • CSV Analysis                      │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│            Data Services & External APIs                     │
│  • World Bank API (Population Data)                          │
│  • Stock Data Service (NVDA, TSLA, MSFT, etc.)             │
│  • Street Food Database                                      │
│  • CSV Parser & Analyzer                                     │
└──────────────────────────────────────────────────────────────┘
```

### Layered Architecture

**Layer 1: Presentation Layer**
- Chat UI with synchronized inputs
- Side-by-side comparison panels
- Mobile-responsive tab switcher
- Real-time message streaming

**Layer 2: State Management Layer**
- TamboProvider wraps entire app
- Thread persistence per panel
- Component state tracking
- Refinement detection

**Layer 3: Component Layer**
- 8 interactive, AI-controlled components
- Zod schema validation
- Loading states during streaming
- Error boundaries for crash protection

**Layer 4: Tool & Service Layer**
- 9 server-side tools for data operations
- CSV parsing and analysis
- API integrations with fallbacks
- Data transformation and caching

**Layer 5: Data Layer**
- External APIs (World Bank, Stock Data)
- Local CSV uploads
- Mock data for API failures
- Real-time data fetching

### Data Flow Architecture

```
User Input
    ↓
TamboProvider (receives message)
    ↓
Context Helpers (provides AI guidance)
    ↓
Tambo API (streaming response)
    ↓
Component Registry (chooses best component)
    ↓
Tool Execution (if data needed)
    ↓
Zod Validation (ensures data safety)
    ↓
Component Renders (with AI-generated props)
    ↓
State Management (tracks interactions)
    ↓
User Interaction (filter, sort, drill-down)
    ↓
State Update → Re-render or New Component
```

### Component Interaction Flow

```
1. REGISTRATION (src/lib/tambo.ts)
   └─ Define component + Zod schema

2. RENDERING (Tambo streams response)
   └─ AI chooses StockCard, DataTable, Graph, etc.

3. PROPS VALIDATION
   └─ Zod schema validates AI-generated props

4. INTERACTIVE STATE (useTamboComponentState)
   └─ Track user filters, sorts, selections

5. REFINEMENT DETECTION
   └─ Is user filtering? Or requesting new component?

6. STATE UPDATES
   └─ Update component props → Re-render
```

### Error Handling Architecture

```
┌─ Global Error Boundary (entire app)
│  └─ ChatErrorBoundary (per-panel)
│     └─ Component-level error handling
│        └─ Try-catch in API calls
│           └─ Graceful fallback to mock data
```

**3-Layer Protection:**
- Global: Catches entire app crashes
- Panel: Prevents one panel from crashing other
- Local: Prevents individual component failures
- API: Fallback to mock data if APIs fail

### State Management Architecture

```
TamboProvider
├── Global State
│   └─ API key, registered components, tools
├── Thread State (per panel)
│   └─ Chat history, messages, thread ID
├── Component State
│   └─ Filter selections, sort preferences, pagination
└─ Context Helpers
   └─ Available data, current page, timestamps
```

### API Integration Pattern

```
Service Layer (e.g., stock-data.ts)
    ↓
Fetch with 10-second timeout
    ↓
Try: Fetch from API
Catch: Return mock data
    ↓
Return validated data
    ↓
Tool receives data
    ↓
AI includes in response
    ↓
Component renders
```

---

## 📁 Project Directory Structure

```
tambo-compare/
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── compare/
│   │   │   └── page.tsx                  # Main comparison page (583 lines)
│   │   ├── layout.tsx                    # Root layout with TamboProvider
│   │   ├── globals.css                   # Global styles
│   │   └── page.tsx                      # Home page
│   │
│   ├── components/tambo/                 # Tambo-Controlled Components
│   │   ├── stock-card.tsx                # Stock recommendations (interactive filtering)
│   │   ├── data-table.tsx                # Data table (sorting, search, pagination)
│   │   ├── graph.tsx                     # Charts (bar, line, pie)
│   │   ├── insight-card.tsx              # Metrics & insights display
│   │   ├── exploration-card.tsx          # Guided exploration suggestions
│   │   ├── food-card.tsx                 # Food recommendations
│   │   ├── action-card.tsx               # Action plans (NEW)
│   │   ├── risk-card.tsx                 # Risk assessment (NEW)
│   │   ├── stock-compare-card.tsx        # Stock comparison
│   │   ├── message.tsx                   # Chat message renderer
│   │   ├── thread-content.tsx            # Thread rendering
│   │   ├── message-input.tsx             # Input interface
│   │   └── error-boundary.tsx            # Error handling wrapper
│   │
│   ├── services/                         # Business Logic & Data Fetching
│   │   ├── stock-data.ts                 # Stock recommendations service
│   │   ├── food-data.ts                  # Food recommendations service
│   │   ├── population-stats.ts           # World Bank API integration
│   │   ├── csv-data.ts                   # CSV parsing & analyzeCSV tool
│   │   ├── data-insights.ts              # generateDataInsights tool
│   │   ├── data-structure-analyzer.ts    # analyzeDataStructure tool
│   │   └── exploration-suggestions.ts    # generateExplorationSuggestions tool
│   │
│   ├── lib/                              # Configuration & Utilities
│   │   ├── tambo.ts                      # 🔑 CENTRAL: Component & tool registration
│   │   ├── thread-hooks.ts               # Thread state management
│   │   ├── refinement-helper.ts          # Detect refinement vs. new requests
│   │   ├── component-state.ts            # Component interaction tracking
│   │   └── utils.ts                      # Helper functions
│   │
│   └── hooks/                            # Custom React Hooks
│
├── public/
│   └── sample-sales-data.csv             # Demo CSV file (46 rows)
│
├── Configuration Files
│   ├── next.config.ts                    # Next.js config
│   ├── tailwind.config.ts                # Tailwind config
│   ├── postcss.config.mjs                # PostCSS config
│   ├── tsconfig.json                     # TypeScript config (strict mode)
│   ├── eslint.config.mjs                 # ESLint config
│   ├── package.json                      # Dependencies & scripts
│   └── .env.local                        # Environment variables (API keys)
│
└── Documentation/
    └── README.md                         # This file
```

---

## 🚀 How Tambo Was Used

### 1. **Component Registration System** (`src/lib/tambo.ts`)

All interactive components are registered with Zod schemas:

```typescript
export const components: TamboComponent[] = [
  {
    name: "StockCard",
    description: "Stock recommendations with risk levels and target prices",
    component: StockCard,
    propsSchema: stockCardSchema  // Zod schema validates runtime data
  },
  {
    name: "DataTable",
    description: "Interactive table with sorting, filtering, and pagination",
    component: DataTable,
    propsSchema: dataTableSchema
  },
  // 6 more components...
];
```

**Key Details:**
- Each component has a **Zod schema** defining its props structure
- Schemas provide **runtime validation** (prevents invalid data from reaching components)
- **Descriptions** guide AI on when to use each component
- Components must be **"use client"** for interactivity

### 2. **Tool System** (Server-Side Functions)

Tools are functions AI can invoke to fetch or process data:

```typescript
export const tools: TamboTool[] = [
  {
    name: "analyzeCSV",
    description: "Filter, sort, and analyze uploaded CSV data",
    tool: analyzeCSV,  // Server function
    inputSchema: z.object({
      query: z.string(),
      sortBy: z.string().optional(),
      limit: z.number().optional(),
    }),
    outputSchema: z.object({
      headers: z.array(z.string()),
      rows: z.array(z.array(z.string())),
      totalRows: z.number(),
    })
  },
  // 8 more tools...
];
```

**Tools Implemented:**
1. `stockRecommendations` - Fetch stock analysis
2. `compareStocks` - Compare two stocks side-by-side
3. `streetFoodRecommendations` - Global food data
4. `countryPopulation` - Query by country/continent
5. `globalPopulation` - Global trends over time
6. `analyzeCSV` - Filter/sort uploaded data
7. `generateDataInsights` - AI analysis of CSV patterns
8. `analyzeDataStructure` - Detect data type (timeseries/ranking/categorical)
9. `generateExplorationSuggestions` - Smart exploration hints

### 3. **Context Helpers** (Guide AI Decision-Making)

Context helpers provide information to help AI make intelligent choices:

```typescript
const getContextHelpers = (): ContextHelpers => ({
  currentTime: currentTimeContextHelper,
  currentPage: currentPageContextHelper,
  availableData: () => {
    const csvData = getCSVData();
    let info = "Available data: Stock symbols are NVDA, TSLA, MSFT...";

    if (csvData) {
      info += `CSV FILE: "${csvData.fileName}" with ${csvData.rows.length} rows`;
      info += `Columns: ${csvData.headers.join(", ")}`;
    }
    return info;
  }
});
```

**What Context Helpers Accomplish:**
- Tell AI what data is currently available
- Explain component capabilities
- List tool descriptions
- Provide domain knowledge
- Guide component selection strategy

### 4. **Streaming Support** (Real-Time UI Updates)

Components handle partial data during streaming:

```typescript
// In StockCard
if (!stocks || stocks.length === 0) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-bounce">📊 Fetching stock data...</div>
    </div>
  );
}
// Component renders once data arrives
```

**Streaming Flow:**
1. User submits prompt
2. Tambo begins streaming response
3. Components render skeleton/loading state
4. Final UI updates as data completes
5. User can interact while more data arrives

### 5. **Component State Management**

Track user interactions within components using `useTamboComponentState`:

```typescript
const [riskFilter, setRiskFilter] = useTamboComponentState<string[]>(
  "riskFilter",
  ["low", "medium", "high"]  // Initial state
);

const handleFilterToggle = (risk: string) => {
  setRiskFilter(newValue);  // Updates component state
  // Dispatch event so Tambo knows state changed
  window.dispatchEvent(new CustomEvent("tambo-component-state-change", {
    detail: { componentId: "stock-card-1", state: { riskFilter: newValue } }
  }));
};
```

### 6. **Refinement Detection**

AI detects when user is refining (not requesting new component):

```typescript
const isRefinementRequest = (message: string) => {
  const refinementKeywords = ["sort by", "filter", "change to", "make it"];
  return refinementKeywords.some(kw => message.includes(kw));
};

// If refinement detected: Update current component's filters/sort
// If new request: Render new component
```

### 7. **TamboProvider Setup** (`src/app/layout.tsx`)

Provides AI access to all components and tools:

```typescript
<TamboProvider
  apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
  components={components}           // All registered components
  tools={tools}                      // All available tools
  contextHelpers={getContextHelpers()}  // AI guidance
  tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
>
  {children}
</TamboProvider>
```

---

## ⚙️ Challenges Faced & Solutions

### **Challenge 1: React Hooks Violation**

**Problem:** Moving `useState`/`useEffect` after conditional returns violates React Rules of Hooks
```typescript
// ❌ WRONG: Hooks after early return
if (!data) return <Loading />;
const [state, setState] = useState();  // Error: rendered more hooks
```

**Solution:** Move all hooks to component top before any conditional logic
```typescript
// ✅ CORRECT
export function StockCard({ stocks }: StockCardProps) {
  // Hooks first
  const [riskFilter, setRiskFilter] = useTamboComponentState(...);
  const [showReadyMessage, setShowReadyMessage] = useState(false);

  useEffect(() => {
    // Effect logic
  }, [stocks, showReadyMessage]);

  // Then conditionals
  if (!stocks || stocks.length === 0) {
    return <LoadingAnimation />;
  }
  // Render logic
}
```

**Impact:** Fixed "rendered more hooks" runtime error, enabled proper component state tracking

---

### **Challenge 2: Component Registration Not Found**

**Problem:** ActionCard and RiskCard components weren't recognized by Tambo
**Root Cause:** Long context helper instructions confused AI about available components

**Solution:** Simplified context helpers to bare essentials
```typescript
// ❌ VERBOSE (caused confusion)
baseData += `
INTENT-AWARE RENDERING:
Detect user intent and render the MOST APPROPRIATE component...
(50+ lines of instructions)
`;

// ✅ MINIMAL (clear & focused)
baseData += `
REFINEMENT: If user says "sort by", "filter by" → Update current component
`;
```

**Impact:** Reduced token usage, improved AI understanding of component names

---

### **Challenge 3: Layout Compression Broke Component Rendering**

**Problem:** Aggressively compressed header caused React render order issues
```typescript
// Reduced padding: py-3 → py-1.5
// Smaller buttons and font sizes
// Result: Components wouldn't render properly
```

**Solution:** Reverted to original header sizing, accepted space tradeoff for stability
```typescript
// py-3 sm:py-4 (original)
// This gives more consistent rendering
```

**Impact:** Stable component rendering, though chat panels have less vertical space

---

### **Challenge 4: Streaming & Partial Data**

**Problem:** Components crashed when receiving incomplete data during AI streaming
```typescript
// Data streaming gradually:
// { stocks: undefined } → { stocks: null } → { stocks: [] } → { stocks: [...] }
```

**Solution:** Added loading guards with skeleton screens at component start
```typescript
if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
  return <LoadingAnimation />;
}
// Safe to use stocks here
```

**Impact:** Smooth streaming experience without crashes during data load

---

### **Challenge 5: CSV Data Type Detection**

**Problem:** Different CSV structures (time-series, categorical, ranking) need different visualizations
```typescript
// CSV: Date | Sales | Profit  → Should use Graph
// CSV: Region | Rank | Score  → Should use DataTable
// CSV: Product | Revenue       → Should use InsightCard
```

**Solution:** Implemented `analyzeDataStructure` tool
```typescript
export async function analyzeDataStructure(): Promise<{
  dataType: "timeseries" | "categorical" | "ranking" | "comparison";
  suggestedComponent: "Graph" | "DataTable" | "InsightCard";
  reasoning: string;
}> {
  // Analyze CSV headers and sample rows
  // Return recommendation
}
```

**Impact:** AI can now intelligently choose best component for any dataset

---

### **Challenge 6: State Sync Between Panels**

**Problem:** Left (Tambo) and right (Plain Text) panels share same data but need separate UI state
```typescript
// Both panels see same CSV upload
// But they should have separate chat histories
```

**Solution:** Separated thread persistence by panel key
```typescript
<ThreadPersistence panelKey="generative" onNewChat={newChatKey} />
<ThreadPersistence panelKey="plaintext" onNewChat={newChatKey} />
```

**Impact:** Each panel maintains independent chat history while sharing data

---

### **Challenge 7: Mobile Responsiveness**

**Problem:** Side-by-side panels can't fit on mobile screens
```
Desktop: [Generative Panel] [Plain Text Panel]
Mobile: Both panels stacked → unusable
```

**Solution:** Implemented tab-based switcher for mobile
```typescript
{isMobile && (
  <div className="flex border-b border-gray-200">
    <button onClick={() => setActiveTab("generative")}>Generative UI</button>
    <button onClick={() => setActiveTab("plaintext")}>Plain Text</button>
  </div>
)}

{(!isMobile || activeTab === "generative") && <GenerativePanel />}
{(!isMobile || activeTab === "plaintext") && <PlainTextPanel />}
```

**Impact:** Fully responsive on all screen sizes

---

### **Challenge 8: Error Boundaries & API Failures**

**Problem:** API timeouts or failures crashed entire panels
```typescript
// World Bank API times out
// Exception propagates → whole panel crashes
// User sees blank white screen
```

**Solution:** Implemented 3 layers of error boundaries + graceful fallbacks
```typescript
<ChatErrorBoundary panelName="Generative UI">
  <TamboProvider>
    {/* Content with try-catch around API calls */}
  </TamboProvider>
</ChatErrorBoundary>

// Inside services:
try {
  const data = await fetchWorldBankAPI();
  return data;
} catch (error) {
  console.warn("API failed, using mock data");
  return MOCK_DATA;
}
```

**Impact:** App stays running even if APIs fail, with automatic fallbacks

---

### **Challenge 9: TypeScript Type Safety**

**Problem:** Using `z.any()` in Zod schemas allows invalid data through
```typescript
// ❌ WRONG
propsSchema: z.any()  // Accepts literally anything

// Results in: Any shape of data can reach component
// Component crashes on unexpected fields
```

**Solution:** Strict Zod schemas for all components and tools
```typescript
// ✅ CORRECT
propsSchema: z.object({
  stocks: z.array(z.object({
    symbol: z.string(),
    price: z.number(),
    risk: z.enum(["low", "medium", "high"]),
    // All properties typed explicitly
  }))
})
```

**Impact:** Compile-time type checking + runtime validation, zero type errors in production

---

### **Challenge 10: Token Usage & Context Length**

**Problem:** Verbose context helper instructions consumed too many tokens
```typescript
// 50+ lines of detailed instructions
// Each request costs ~500+ extra tokens
// Reduces context for actual AI response
```

**Solution:** Stripped instructions to essentials
```typescript
// Before: 50+ lines
// After: 2 lines
// Result: Same AI behavior, 10x fewer tokens
```

**Impact:** Reduced API costs, faster responses, room for larger user inputs

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Tambo AI API key from [tambo.co/dashboard](https://tambo.co/dashboard)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd tambo-compare

# Install dependencies
npm install

# Set up environment variables
cp example.env.local .env.local

# Edit .env.local and add:
# NEXT_PUBLIC_TAMBO_API_KEY=your_api_key_here
# NEXT_PUBLIC_TAMBO_URL=https://api.tambo.co
```

### Development

```bash
# Start dev server on http://localhost:3000
npm run dev

# Navigate to http://localhost:3000/compare
```

### Building for Production

```bash
# Build optimized bundle
npm run build

# Test production build locally
npm start
```

---

## 🎬 Demo Flow (5 Minutes)

### 1. **Setup** (30 seconds)
- Show page loaded with both panels visible
- Explain: "Same AI. Same prompt. Different UX."

### 2. **Stock Analysis** (1.5 minutes)
```
Prompt: "Show me the top stocks to watch for in 2026"
```
- Left: Interactive StockCard (can filter by risk, sort by gain)
- Right: Plain text list (static, no interaction)
- **Key Point**: "With Tambo, users explore. Without it, they re-ask."

### 3. **CSV Analysis** (2 minutes)
- Click "Upload CSV"
- Select `public/sample-sales-data.csv`
- Prompt: "Analyze this data and show me the top performers"
- Left: Interactive DataTable + InsightCard with metrics
- Right: Text summary requiring follow-up questions
- **Key Point**: "Insights become interactive dashboards"

### 4. **Wrap Up** (1 minute)
- Recap: "Same data, two experiences"
- "This is what Tambo enables"

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| **Total Development Time** | 14+ hours |
| **TypeScript Errors** | 0 ✅ |
| **Components Registered** | 8 |
| **Tools Registered** | 9 |
| **Example Prompts** | 8 |
| **Data Sources** | 4 (stocks, food, population, CSV) |
| **Mobile Support** | Fully responsive |
| **Error Boundaries** | 3 layers |
| **Max CSV Size** | 10 MB |
| **API Timeout** | 10 seconds |

---

## 🎯 Architecture Highlights

### Component Hierarchy
```
TamboProvider (API key, components, tools)
├── GenerativeUI Panel
│   ├── ChatPanel
│   │   ├── Input (textarea)
│   │   └── Messages (with rendered components)
│   │       └── StockCard / DataTable / Graph / etc.
└── PlainText Panel
    ├── ChatPanel
    │   ├── Input (textarea)
    │   └── Messages (text only)
```

### Data Flow
```
User Input
    ↓
Tambo API (streaming)
    ↓
Component Registry (choose best component)
    ↓
Render Component (with AI-generated props)
    ↓
User can interact (sort, filter, drill-down)
    ↓
State updates trigger re-render
```

### Tool Execution
```
AI Request
    ↓
Tool needed? (e.g., analyzeCSV)
    ↓
Browser executes tool (client-side)
    ↓
Tool returns data (validated by Zod)
    ↓
AI includes data in response
    ↓
Component renders with data
```

---

## 🔮 Future Enhancements

### Phase 2: Multi-Step Workflows
- Guided research assistant
- Multi-turn data exploration
- Checkpoint/history system

### Phase 3: Collaboration
- Real-time multi-user editing
- Shared workspaces
- Comment & annotation system

### Phase 4: Advanced Analytics
- Predictive analysis
- Custom formula engine
- Data quality scoring
- Anomaly detection

---

## 💡 Key Learnings

1. **Streaming is complex but worth it** - Progressive UI updates dramatically improve UX
2. **Zod validation is essential** - Prevents silent failures and type mismatches
3. **Error boundaries save you** - Apps stay running even when AI responses are malformed
4. **Component descriptions matter** - Good descriptions help AI make better decisions
5. **Less context > more context** - Shorter, clearer instructions work better
6. **Mobile first from day 1** - Retrofitting responsiveness is painful
7. **State management is hard** - Tracking component state + refinement detection requires careful design
8. **API failures are inevitable** - Always have graceful fallbacks

---

## 🤝 Contributing

For improvements or bug fixes:

1. Test thoroughly on both panels
2. Keep TypeScript strict mode clean
3. Add Zod schemas for all new props
4. Update context helpers when adding tools
5. Test on mobile (use Chrome DevTools)
6. Check browser console for warnings

---

## 📝 License

MIT License 

---

## 🙏 Acknowledgments

- **Tambo AI** - Generative UI framework
- **Next.js** - React framework
- **World Bank API** - Real data
- **Recharts** - Visualization library
- **Tailwind CSS** - Utility-first styling
- **Claude** - AI assistance for brainstorming and code generation

---


