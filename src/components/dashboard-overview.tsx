"use client";

import * as React from "react";
import { Gauge, TrendingUp, ChartPie, ChartBarIncreasing, PanelsTopLeft, ChartNoAxesCombined, SquareActivity, ChartArea, ChartColumnBig } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Kpi = {
  id: string;
  label: string;
  value: string;
  sublabel?: string;
  trend?: { delta: string; up?: boolean };
  icon: React.ReactNode;
};

type ActivityItem = {
  id: string;
  title: string;
  description?: string;
  time: string;
  status?: "success" | "warning" | "danger" | "default";
};

type PipelinePoint = { x: number; y: number };

export interface DashboardOverviewProps {
  className?: string;
  kpis?: Kpi[];
  readinessScore?: number; // 0 - 100
  readinessSuggestions?: string[];
  activities?: ActivityItem[];
  pipelineData?: PipelinePoint[]; // 0-100 normalized for y
  successBars?: { label: string; value: number }[]; // 0-100
}

function srOnly(text: string) {
  return <span className="sr-only">{text}</span>;
}

function ProgressRing({
  value,
  size = 108,
  stroke = 8,
  trackColor = "#232825",
  indicatorColor = "#2ed3b7",
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  trackColor?: string;
  indicatorColor?: string;
  label?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" aria-label={label} role="img" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)}>
      <svg width={size} height={size} className="block">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="none"
          className="opacity-60"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={indicatorColor}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-semibold font-heading">{Math.round(value)}%</div>
        <div className="text-xs text-muted-foreground">Ready</div>
      </div>
    </div>
  );
}

function MiniLegend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: it.color }} />
          <span className="text-xs text-muted-foreground">{it.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardOverviewSection({
  className,
  kpis,
  readinessScore = 72,
  readinessSuggestions,
  activities,
  pipelineData,
  successBars,
}: DashboardOverviewProps) {
  const safeKpis: Kpi[] =
    kpis ??
    [
      {
        id: "matches",
        label: "Total Matches",
        value: "128",
        sublabel: "This month",
        trend: { delta: "+12%", up: true },
        icon: <ChartPie className="h-5 w-5 text-primary" aria-hidden="true" />,
      },
      {
        id: "in-progress",
        label: "Applications In Progress",
        value: "9",
        sublabel: "Across 3 programs",
        icon: <PanelsTopLeft className="h-5 w-5 text-primary" aria-hidden="true" />,
      },
      {
        id: "success-rate",
        label: "Success Rate",
        value: "38%",
        sublabel: "Last 90 days",
        trend: { delta: "+6%", up: true },
        icon: <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />,
      },
      {
        id: "potential",
        label: "Potential Funding",
        value: "$1.2M",
        sublabel: "Eligible amount",
        icon: <ChartColumnBig className="h-5 w-5 text-primary" aria-hidden="true" />,
      },
    ];

  const safeSuggestions =
    readinessSuggestions ??
    [
      "Strengthen traction narrative with 2 new customer proofs.",
      "Clarify runway: attach 12-month cash flow projection.",
      "Tighten GTM milestones with measurable KPIs.",
    ];

  const safeActivities: ActivityItem[] =
    activities ??
    [
      {
        id: "a1",
        title: "Deadline tomorrow: InnovateSeed Microgrant",
        description: "Submit pitch deck and budget by 5pm.",
        time: "in 22h",
        status: "warning",
      },
      {
        id: "a2",
        title: "Application moved to Review: GreenTech Fund",
        description: "Reviewer assigned: A. Patel.",
        time: "2h ago",
        status: "success",
      },
      {
        id: "a3",
        title: "New match found: Climate Action Accelerator",
        description: "Score 84% match to your profile.",
        time: "Today, 9:14",
        status: "default",
      },
      {
        id: "a4",
        title: "Investor intro available",
        description: "Warm intro to Riverstone Capital partner.",
        time: "Yesterday",
        status: "success",
      },
    ];

  const safePipeline: PipelinePoint[] =
    pipelineData ??
    Array.from({ length: 16 }).map((_, i) => ({
      x: i,
      y: Math.round(
        30 + 20 * Math.sin(i / 2) + (i > 8 ? 10 : 0) + (i === 12 ? 18 : 0)
      ),
    }));

  const safeSuccessBars =
    successBars ??
    [
      { label: "Discovery", value: 78 },
      { label: "Qualified", value: 62 },
      { label: "Submitted", value: 44 },
      { label: "Interview", value: 31 },
      { label: "Awarded", value: 18 },
    ];

  // SVG path generator for simple area chart
  const areaPath = React.useMemo(() => {
    if (!safePipeline.length) return "";
    const w = 360;
    const h = 120;
    const maxX = Math.max(...safePipeline.map((p) => p.x));
    const stepX = w / (maxX || 1);
    const toX = (x: number) => x * stepX;
    const toY = (y: number) => h - (y / 100) * h;

    const d = ["M", toX(safePipeline[0].x), toY(safePipeline[0].y)];
    for (let i = 1; i < safePipeline.length; i++) {
      const p = safePipeline[i];
      d.push("L", toX(p.x), toY(p.y));
    }
    // close area
    d.push("L", toX(safePipeline[safePipeline.length - 1].x), h, "L", toX(safePipeline[0].x), h, "Z");
    return { d: d.join(" "), width: w, height: h };
  }, [safePipeline]);

  return (
    <section className={["w-full max-w-full", className].filter(Boolean).join(" ")}>
      {/* Heading row */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-heading font-semibold tracking-tight">Dashboard Overview</h2>
          <p className="mt-1 text-sm text-muted-foreground break-words">
            Personalized funding metrics, AI insights, and your current pipeline.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Button variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
            <Gauge className="mr-2 h-4 w-4" aria-hidden="true" />
            Refresh Insights
          </Button>
          <Button className="bg-primary text-primary-foreground hover:opacity-90">
            <TrendingUp className="mr-2 h-4 w-4" aria-hidden="true" />
            Improve Score
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
        {safeKpis.map((kpi) => (
          <Card key={kpi.id} className="bg-card text-card-foreground border border-border/60">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                  {kpi.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    {kpi.trend ? (
                      <Badge
                        variant="outline"
                        className={[
                          "border-transparent px-1.5 py-0.5 text-[10px] font-medium",
                          kpi.trend.up ? "bg-[var(--success)]/15 text-[var(--success)]" : "bg-[var(--danger)]/15 text-[var(--danger)]",
                        ].join(" ")}
                      >
                        {kpi.trend.delta}
                        <span className="sr-only">{kpi.trend.up ? "Up" : "Down"}</span>
                      </Badge>
                    ) : null}
                  </div>
                  <div className="mt-1 flex items-baseline justify-between gap-2">
                    <div className="text-lg sm:text-xl font-semibold font-heading">{kpi.value}</div>
                    {kpi.sublabel ? <span className="text-xs text-muted-foreground truncate">{kpi.sublabel}</span> : null}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content: Readiness + Charts + Quick actions + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left column: AI Readiness + Quick Actions */}
        <div className="space-y-4">
          <Card className="bg-card text-card-foreground border border-border/60">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Gauge className="h-4 w-4 text-primary" aria-hidden="true" />
                AI Funding Readiness
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center gap-5">
                <ProgressRing value={Math.max(0, Math.min(100, readinessScore))} label="Funding readiness score" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">
                    Your current readiness score is{" "}
                    <span className="text-foreground font-medium">{Math.round(readinessScore)}%</span>. Improve the following to boost your success odds.
                  </p>
                  <ul className="mt-3 space-y-2">
                    {safeSuggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                        <span className="text-sm">{s}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90">
                      <TrendingUp className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
                      View Recommendations
                    </Button>
                    <Button size="sm" variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
                      <ChartBarIncreasing className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
                      Benchmark Peers
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground border border-border/60">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  variant="secondary"
                  className="group bg-secondary text-secondary-foreground hover:bg-secondary/80 justify-start sm:justify-center"
                >
                  <PanelsTopLeft className="h-4 w-4 mr-2 text-primary group-hover:scale-105 transition-transform" aria-hidden="true" />
                  <span className="min-w-0">Start Application</span>
                </Button>
                <Button
                  variant="secondary"
                  className="group bg-secondary text-secondary-foreground hover:bg-secondary/80 justify-start sm:justify-center"
                >
                  <ChartNoAxesCombined className="h-4 w-4 mr-2 text-primary group-hover:scale-105 transition-transform" aria-hidden="true" />
                  <span className="min-w-0">Search Opportunities</span>
                </Button>
                <Button
                  variant="secondary"
                  className="group bg-secondary text-secondary-foreground hover:bg-secondary/80 justify-start sm:justify-center"
                >
                  <SquareActivity className="h-4 w-4 mr-2 text-primary group-hover:scale-105 transition-transform" aria-hidden="true" />
                  <span className="min-w-0">Schedule Investor</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle column: Charts */}
        <div className="space-y-4 xl:col-span-2">
          <Card className="bg-card text-card-foreground border border-border/60">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ChartArea className="h-4 w-4 text-primary" aria-hidden="true" />
                  Funding Pipeline
                </CardTitle>
                <MiniLegend
                  items={[
                    { label: "Matches", color: "var(--chart-1)" },
                    { label: "Submissions", color: "var(--chart-2)" },
                  ]}
                />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Tabs defaultValue="pipeline">
                <TabsList className="bg-secondary text-secondary-foreground">
                  <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
                  <TabsTrigger value="success">Success Metrics</TabsTrigger>
                </TabsList>
                <TabsContent value="pipeline" className="mt-4">
                  <div className="relative w-full overflow-hidden rounded-lg bg-[var(--surface-1)]">
                    <svg
                      width="100%"
                      height={areaPath.height}
                      viewBox={`0 0 ${areaPath.width} ${areaPath.height}`}
                      preserveAspectRatio="none"
                      className="block"
                      aria-hidden="true"
                    >
                      <path d={areaPath.d} fill="var(--chart-1)" opacity="0.25" />
                      {/* Stroke path */}
                      <path d={areaPath.d.replace(/L [\d.]+ [\d.]+ L [\d.]+ 120 L [\d.]+ 120 Z$/, "")} fill="none" stroke="var(--chart-1)" strokeWidth="2" />
                      {/* Overlay submissions as subtle bars */}
                      {safePipeline.map((p) => (
                        <rect
                          key={`bar-${p.x}`}
                          x={(p.x / (safePipeline[safePipeline.length - 1]?.x || 1)) * areaPath.width - 2}
                          y={areaPath.height - (p.y / 100) * areaPath.height}
                          width="3"
                          height={(p.y / 100) * areaPath.height}
                          fill="var(--chart-2)"
                          opacity="0.18"
                        />
                      ))}
                    </svg>
                  </div>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Metric label="New matches" value="36" tone="default" />
                    <Metric label="Shortlisted" value="14" tone="default" />
                    <Metric label="Submitted" value="9" tone="default" />
                    <Metric label="Interviews" value="4" tone="success" />
                  </div>
                </TabsContent>
                <TabsContent value="success" className="mt-4">
                  <div className="space-y-3">
                    {safeSuccessBars.map((b, i) => (
                      <div key={b.label} className="min-w-0">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{b.label}</span>
                          <span className="text-xs text-muted-foreground">{b.value}%</span>
                        </div>
                        <div className="h-2 w-full rounded bg-[var(--surface-2)]">
                          <div
                            className="h-2 rounded bg-[var(--chart-4)] transition-[width] duration-700 ease-out"
                            style={{ width: `${Math.max(0, Math.min(100, b.value))}%` }}
                            aria-label={`${b.label} conversion ${b.value}%`}
                          >
                            {srOnly(`${b.label} ${b.value} percent`)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-card text-card-foreground border border-border/60">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ul className="space-y-4">
                {safeActivities.map((act, idx) => (
                  <li key={act.id} className="flex items-start gap-3">
                    <div className="relative">
                      <span
                        className={[
                          "mt-1 inline-block h-2.5 w-2.5 rounded-full",
                          act.status === "success"
                            ? "bg-[var(--success)]"
                            : act.status === "warning"
                            ? "bg-[var(--warning)]"
                            : act.status === "danger"
                            ? "bg-[var(--danger)]"
                            : "bg-primary",
                        ].join(" ")}
                        aria-hidden="true"
                      />
                      {idx !== safeActivities.length - 1 && (
                        <span className="absolute left-1 top-3 h-8 w-px bg-border/70" aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{act.title}</p>
                      {act.description ? (
                        <p className="text-sm text-muted-foreground mt-0.5 break-words">{act.description}</p>
                      ) : null}
                      <div className="mt-1">
                        <Badge variant="outline" className="border-border/60 text-[10px]">
                          {act.time}
                        </Badge>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "success" | "warning" | "danger" }) {
  const toneClass =
    tone === "success"
      ? "text-[var(--success)]"
      : tone === "warning"
      ? "text-[var(--warning)]"
      : tone === "danger"
      ? "text-[var(--danger)]"
      : "text-foreground";
  return (
    <div className="rounded-lg border border-border/60 bg-[var(--surface-1)] p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={["mt-1 text-lg font-semibold font-heading", toneClass].join(" ")}>{value}</div>
    </div>
  );
}