"use client";

import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import * as React from "react";
import * as RechartsCore from "recharts";
import { z } from "zod/v3";
import { BarChart3, TrendingUp, PieChart, Download } from "lucide-react";
import { useTamboComponentState, useTamboThreadInput } from "@tambo-ai/react";

/**
 * Type for graph variant
 */
type GraphVariant = "default" | "solid" | "bordered";

/**
 * Type for graph size
 */
type GraphSize = "default" | "sm" | "lg";

/**
 * Variants for the Graph component
 */
export const graphVariants = cva(
  "w-full rounded-lg overflow-hidden transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-background",
        solid: [
          "shadow-lg shadow-zinc-900/10 dark:shadow-zinc-900/20",
          "bg-muted",
        ].join(" "),
        bordered: ["border-2", "border-border"].join(" "),
      },
      size: {
        default: "h-64",
        sm: "h-48",
        lg: "h-96",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

/**
 * Props for the error boundary
 */
interface GraphErrorBoundaryProps {
  children: React.ReactNode;
  className?: string;
  variant?: GraphVariant;
  size?: GraphSize;
}

/**
 * Error boundary for catching rendering errors in the Graph component
 */
class GraphErrorBoundary extends React.Component<
  GraphErrorBoundaryProps,
  { hasError: boolean; error?: Error }
> {
  constructor(props: GraphErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error rendering chart:", error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className={cn(
            graphVariants({
              variant: this.props.variant,
              size: this.props.size,
            }),
            this.props.className,
          )}
        >
          <div className="p-4 flex items-center justify-center h-full">
            <div className="text-destructive text-center">
              <p className="font-medium">Error loading chart</p>
              <p className="text-sm mt-1">
                An error occurred while rendering. Please try again.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Zod schema for GraphData
 */
export const graphDataSchema = z.object({
  type: z.enum(["bar", "line", "pie"]).describe("Type of graph to render"),
  labels: z.array(z.string()).describe("Labels for the graph"),
  datasets: z
    .array(
      z.object({
        label: z.string().describe("Label for the dataset"),
        data: z.array(z.number()).describe("Data points for the dataset"),
        color: z.string().optional().describe("Optional color for the dataset"),
      }),
    )
    .describe("Data for the graph"),
});

/**
 * Zod schema for Graph
 */
export const graphSchema = z.object({
  data: graphDataSchema.describe(
    "Data object containing chart configuration and values",
  ),
  title: z.string().describe("Title for the chart"),
  showLegend: z
    .boolean()
    .optional()
    .describe("Whether to show the legend (default: true)"),
  variant: z
    .enum(["default", "solid", "bordered"])
    .optional()
    .describe("Visual style variant of the graph"),
  size: z
    .enum(["default", "sm", "lg"])
    .optional()
    .describe("Size of the graph"),
  className: z
    .string()
    .optional()
    .describe("Additional CSS classes for styling"),
});

/**
 * TypeScript type inferred from the Zod schema
 */
export type GraphProps = z.infer<typeof graphSchema>;

/**
 * TypeScript type inferred from the Zod schema
 */
export type GraphDataType = z.infer<typeof graphDataSchema>;

/**
 * Default colors for the Graph component.
 *
 * Color handling: our v4 theme defines CSS variables like `--border`,
 * `--muted-foreground`, and `--chart-1` as full OKLCH color values in
 * `globals-v4.css`, so we pass them directly as `var(--token)` to
 * Recharts/SVG props instead of wrapping them in `hsl()`/`oklch()`.
 */
const defaultColors = [
  "hsl(220, 100%, 62%)", // Blue
  "hsl(160, 82%, 47%)", // Green
  "hsl(32, 100%, 62%)", // Orange
  "hsl(340, 82%, 66%)", // Pink
];

/**
 * A component that renders various types of charts using Recharts
 * @component
 * @example
 * ```tsx
 * <Graph
 *   data={{
 *     type: "bar",
 *     labels: ["Jan", "Feb", "Mar"],
 *     datasets: [{
 *       label: "Sales",
 *       data: [100, 200, 300]
 *     }]
 *   }}
 *   title="Monthly Sales"
 *   variant="solid"
 *   size="lg"
 *   className="custom-styles"
 * />
 * ```
 */
export const Graph = React.forwardRef<HTMLDivElement, GraphProps>(
  (
    { className, variant, size, data, title, showLegend = true, ...props },
    ref,
  ) => {
    // Component state for chart type switching
    const [chartType, setChartType] = useTamboComponentState<string>(
      "chartType",
      data?.type || "line",
    );
    const { setValue, submit } = useTamboThreadInput();
    const [showReadyMessage, setShowReadyMessage] = React.useState(false);

    // Update chartType when data changes
    React.useEffect(() => {
      if (data?.type) {
        setChartType(data.type);
      }
    }, [data?.type, setChartType]);

    // Check if we have the minimum viable data structure
    const hasValidStructure =
      data?.type &&
      data?.labels &&
      data?.datasets &&
      Array.isArray(data.labels) &&
      Array.isArray(data.datasets) &&
      data.labels.length > 0 &&
      data.datasets.length > 0;

    // Show ready message when chart becomes ready (must be before early returns)
    React.useEffect(() => {
      if (hasValidStructure && !showReadyMessage) {
        setShowReadyMessage(true);
        const timer = setTimeout(() => setShowReadyMessage(false), 2000);
        return () => clearTimeout(timer);
      }
    }, [hasValidStructure, showReadyMessage]);

    const handleChartTypeChange = (newType: "bar" | "line" | "pie") => {
      setChartType(newType);
      // Dispatch state change event for display
      const event = new CustomEvent("tambo-component-state-change", {
        detail: {
          componentId: "graph-1",
          type: "Graph",
          state: {
            chartType: newType,
            dataRange: data?.labels?.length ? `${data.labels.length} points` : "all",
          },
          timestamp: Date.now(),
          summary: `Graph (${newType}) showing ${data?.labels?.length || 0} data points`,
        },
      });
      window.dispatchEvent(event);

      // Notify AI of the change
      setTimeout(() => {
        setValue(`Switch this chart to ${newType} type`);
        submit();
      }, 100);
    };

    const handleExport = () => {
      // Export chart as image (basic implementation)
      const canvas = document.querySelector("canvas");
      if (canvas) {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `chart-${Date.now()}.png`;
        link.click();
      }
    };

    // If no data received yet, show loading with progress messages
    if (!data) {
      return (
        <div
          ref={ref}
          className={cn(graphVariants({ variant, size }), className)}
          {...props}
        >
          <div className="p-4 h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-foreground">
              <div className="flex items-center gap-1 h-4">
                <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.2s]"></span>
                <span className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.1s]"></span>
              </div>
              <div className="text-center">
                <span className="text-sm font-medium">⚙️ Analyzing data structure...</span>
                <p className="text-xs text-foreground mt-1">Preparing visualization</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!hasValidStructure) {
      return (
        <div
          ref={ref}
          className={cn(graphVariants({ variant, size }), className)}
          {...props}
        >
          <div className="p-4 h-full flex items-center justify-center">
            <div className="text-foreground text-center">
              <p className="text-sm font-medium">🎨 Generating visualization...</p>
              <p className="text-xs text-foreground mt-1">Configuring chart options</p>
            </div>
          </div>
        </div>
      );
    }

    // Filter datasets to only include those with valid data
    const validDatasets = data.datasets.filter(
      (dataset) =>
        dataset.label &&
        dataset.data &&
        Array.isArray(dataset.data) &&
        dataset.data.length > 0,
    );

    if (validDatasets.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(graphVariants({ variant, size }), className)}
          {...props}
        >
          <div className="p-4 h-full flex items-center justify-center">
            <div className="text-foreground text-center">
              <p className="text-sm">Preparing datasets...</p>
            </div>
          </div>
        </div>
      );
    }

    // Use the minimum length between labels and the shortest dataset
    const maxDataPoints = Math.min(
      data.labels.length,
      Math.min(...validDatasets.map((d) => d.data.length)),
    );

    // Transform data for Recharts using only available data points
    const chartData = data.labels
      .slice(0, maxDataPoints)
      .map((label, index) => ({
        name: label,
        ...Object.fromEntries(
          validDatasets.map((dataset) => [
            dataset.label,
            dataset.data[index] ?? 0,
          ]),
        ),
      }));

    const renderChart = () => {
      const displayType = (chartType || data.type) as "bar" | "line" | "pie";

      if (!["bar", "line", "pie"].includes(displayType)) {
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-foreground text-center">
              <p className="text-sm">Unsupported chart type: {displayType}</p>
            </div>
          </div>
        );
      }

      switch (displayType) {
        case "bar":
          return (
            <RechartsCore.BarChart data={chartData}>
              <RechartsCore.CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
              />
              <RechartsCore.XAxis
                dataKey="name"
                stroke="var(--muted-foreground)"
                axisLine={false}
                tickLine={false}
              />
              <RechartsCore.YAxis
                stroke="var(--muted-foreground)"
                axisLine={false}
                tickLine={false}
              />
              <RechartsCore.Tooltip
                cursor={{
                  fill: "var(--muted-foreground)",
                  fillOpacity: 0.1,
                  radius: 4,
                }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "var(--radius)",
                  color: "var(--foreground)",
                }}
              />
              {showLegend && (
                <RechartsCore.Legend
                  wrapperStyle={{
                    color: "var(--foreground)",
                  }}
                />
              )}
              {validDatasets.map((dataset, index) => (
                <RechartsCore.Bar
                  key={dataset.label}
                  dataKey={dataset.label}
                  fill={
                    dataset.color ?? defaultColors[index % defaultColors.length]
                  }
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </RechartsCore.BarChart>
          );

        case "line":
          return (
            <RechartsCore.LineChart data={chartData}>
              <RechartsCore.CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
              />
              <RechartsCore.XAxis
                dataKey="name"
                stroke="var(--muted-foreground)"
                axisLine={false}
                tickLine={false}
              />
              <RechartsCore.YAxis
                stroke="var(--muted-foreground)"
                axisLine={false}
                tickLine={false}
              />
              <RechartsCore.Tooltip
                cursor={{
                  stroke: "var(--muted)",
                  strokeWidth: 2,
                  strokeOpacity: 0.3,
                }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "var(--radius)",
                  color: "var(--foreground)",
                }}
              />
              {showLegend && (
                <RechartsCore.Legend
                  wrapperStyle={{
                    color: "var(--foreground)",
                  }}
                />
              )}
              {validDatasets.map((dataset, index) => (
                <RechartsCore.Line
                  key={dataset.label}
                  type="monotone"
                  dataKey={dataset.label}
                  stroke={
                    dataset.color ?? defaultColors[index % defaultColors.length]
                  }
                  dot={false}
                />
              ))}
            </RechartsCore.LineChart>
          );

        case "pie": {
          // For pie charts, use the first valid dataset
          const pieDataset = validDatasets[0];
          if (!pieDataset) {
            return (
              <div className="h-full flex items-center justify-center">
                <div className="text-muted-foreground text-center">
                  <p className="text-sm">No valid dataset for pie chart</p>
                </div>
              </div>
            );
          }

          return (
            <RechartsCore.PieChart>
              <RechartsCore.Pie
                data={pieDataset.data
                  .slice(0, maxDataPoints)
                  .map((value, index) => ({
                    name: data.labels[index],
                    value,
                    fill: defaultColors[index % defaultColors.length],
                  }))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
              />
              <RechartsCore.Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "var(--radius)",
                  color: "var(--foreground)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
                itemStyle={{
                  color: "var(--foreground)",
                }}
                labelStyle={{
                  color: "var(--foreground)",
                }}
              />
              {showLegend && (
                <RechartsCore.Legend
                  wrapperStyle={{
                    color: "var(--foreground)",
                  }}
                />
              )}
            </RechartsCore.PieChart>
          );
        }
      }
    };

    return (
      <GraphErrorBoundary className={className} variant={variant} size={size}>
        <div
          ref={ref}
          className={cn(graphVariants({ variant, size }), className)}
          {...props}
        >
          <div className="p-4 h-full flex flex-col">
            <div className="mb-3">
              {title && (
                <h3 className="text-lg font-medium mb-2 text-foreground">
                  {title}
                </h3>
              )}
              {/* Ready indicator */}
              {showReadyMessage && (
                <div className="text-xs font-medium text-green-600 mb-2 animate-pulse">
                  ✅ Ready to interact
                </div>
              )}
              {/* Chart Controls */}
              <div className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">⚙️ Chart Controls</div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-gray-600">View Type:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleChartTypeChange("bar")}
                    className={`p-1.5 rounded transition-colors ${
                      (chartType || data.type) === "bar"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    title="Bar Chart"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleChartTypeChange("line")}
                    className={`p-1.5 rounded transition-colors ${
                      (chartType || data.type) === "line"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    title="Line Chart"
                  >
                    <TrendingUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleChartTypeChange("pie")}
                    className={`p-1.5 rounded transition-colors ${
                      (chartType || data.type) === "pie"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    title="Pie Chart"
                  >
                    <PieChart className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleExport}
                  className="p-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors ml-auto"
                  title="Export as Image"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 w-full min-h-0">
              <RechartsCore.ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </RechartsCore.ResponsiveContainer>
            </div>
          </div>
        </div>
      </GraphErrorBoundary>
    );
  },
);
Graph.displayName = "Graph";
