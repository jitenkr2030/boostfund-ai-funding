"use client"

import * as React from "react"
import {
  ChartArea,
  ChartBar,
  ChartSpline,
  FileChartPie,
  FileChartColumn,
  ReceiptIndianRupee,
  BanknoteArrowUp,
  ChartColumnStacked,
  InspectionPanel,
  ChartColumnBig,
  BadgeIndianRupee,
} from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

type Props = {
  className?: string
  initialMonthlyRevenue?: number
  initialCashReserve?: number
}

type Recommendation = {
  id: string
  label: string
  done: boolean
}

const trendColors = {
  good: "text-[--chart-1]",
  warn: "text-[--warning]",
  bad: "text-[--danger]",
}

const fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 })
const fmtMoney = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)

export default function FinancialAnalysisSection({
  className,
  initialMonthlyRevenue = 85000,
  initialCashReserve = 220000,
}: Props) {
  // Overview datasets (static placeholders, in real app: fetched)
  const revenueSeries = React.useMemo(() => [62, 68, 71, 75, 73, 79, 84, 92, 95, 101, 110, 118], [])
  const cashflowSeries = React.useMemo(
    () => ({
      inflow: [72, 74, 77, 82, 85, 89, 90, 94, 99, 104, 112, 120],
      outflow: [58, 60, 63, 66, 68, 70, 72, 75, 77, 80, 82, 84],
    }),
    []
  )
  const netCash = cashflowSeries.inflow.map((v, i) => v - cashflowSeries.outflow[i])

  // Risk calculator state
  const [creditScore, setCreditScore] = React.useState<number>(720)
  const [monthlyRevenue, setMonthlyRevenue] = React.useState<number>(initialMonthlyRevenue)
  const [burnRate, setBurnRate] = React.useState<number>(65000)
  const [marketVolatility, setMarketVolatility] = React.useState<"low" | "medium" | "high">("medium")
  const [cashReserve, setCashReserve] = React.useState<number>(initialCashReserve)
  const [targetRunway, setTargetRunway] = React.useState<number>(12)

  // Forecasting state
  const [scenario, setScenario] = React.useState<"base" | "optimistic" | "pessimistic">("base")
  const [growthRate, setGrowthRate] = React.useState<number>(6) // % MoM
  const [churnRate, setChurnRate] = React.useState<number>(2) // % MoM
  const [cacPayback, setCacPayback] = React.useState<number>(8) // months

  // Recommendations checklist
  const [recs, setRecs] = React.useState<Recommendation[]>([
    { id: "r1", label: "Reduce non-essential OPEX by 8-12%", done: false },
    { id: "r2", label: "Negotiate 60-day terms with top vendors", done: true },
    { id: "r3", label: "Consolidate SaaS stack to cut tool spend 15%", done: false },
    { id: "r4", label: "Launch pricing test to lift ARPA by 5%", done: false },
    { id: "r5", label: "Strengthen DSO collections with reminders", done: true },
  ])

  const recsProgress = Math.round((recs.filter((r) => r.done).length / recs.length) * 100)

  // Derived metrics for risk and funding requirement
  const riskScore = React.useMemo(() => {
    // Composite score: start from 100, subtract penalties
    let score = 100
    // Credit score mapping
    if (creditScore >= 760) score -= 0
    else if (creditScore >= 700) score -= 6
    else if (creditScore >= 640) score -= 14
    else score -= 28

    // Burn vs revenue
    const burnRatio = burnRate / Math.max(1, monthlyRevenue)
    if (burnRatio > 0.9) score -= 25
    else if (burnRatio > 0.7) score -= 18
    else if (burnRatio > 0.5) score -= 10
    else if (burnRatio > 0.3) score -= 6
    else score -= 2

    // Market volatility
    if (marketVolatility === "high") score -= 18
    else if (marketVolatility === "medium") score -= 9
    else score -= 2

    // Reserve runway buffer
    const monthlyNet = monthlyRevenue - burnRate
    const monthsOfRunwayFromCash = monthlyNet >= 0 ? Infinity : cashReserve / Math.abs(monthlyNet)
    if (monthsOfRunwayFromCash < 4) score -= 20
    else if (monthsOfRunwayFromCash < 8) score -= 10
    else score -= 4

    return Math.max(0, Math.min(100, Math.round(score)))
  }, [creditScore, burnRate, monthlyRevenue, marketVolatility, cashReserve])

  const riskLevel =
    riskScore >= 80 ? "Low" : riskScore >= 60 ? "Moderate" : riskScore >= 40 ? "Elevated" : "High"

  const riskColor =
    riskScore >= 80 ? "bg-[--chart-3]" : riskScore >= 60 ? "bg-[--chart-2]" : riskScore >= 40 ? "bg-[--warning]" : "bg-[--danger]"

  const requiredFunding = React.useMemo(() => {
    // Funding needed to achieve target runway months
    const monthlyNet = monthlyRevenue - burnRate // could be negative
    const deficitPerMonth = monthlyNet >= 0 ? 0 : Math.abs(monthlyNet)
    const targetNeed = deficitPerMonth * targetRunway
    const gap = targetNeed - cashReserve
    return Math.max(0, Math.round(gap))
  }, [monthlyRevenue, burnRate, targetRunway, cashReserve])

  // Forecast projection (simple compounding model)
  const projection = React.useMemo(() => {
    const months = 12
    const baseGrowth = growthRate / 100
    const churn = churnRate / 100
    const scenarioAdj =
      scenario === "optimistic" ? 1.2 : scenario === "pessimistic" ? 0.7 : 1.0

    const arr: number[] = []
    let rev = monthlyRevenue
    for (let i = 0; i < months; i++) {
      rev = rev * (1 + baseGrowth * scenarioAdj - churn * (1 / Math.max(1, cacPayback)))
      arr.push(Math.max(0, Math.round(rev)))
    }
    return arr
  }, [monthlyRevenue, growthRate, churnRate, cacPayback, scenario])

  const last12AvgRevenue = revenueSeries.reduce((a, b) => a + b, 0) / revenueSeries.length
  const marketPotential = Math.min(100, Math.round(65 + (last12AvgRevenue - 70) * 0.9))

  function toggleRec(id: string) {
    setRecs((prev) => prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r)))
  }

  function handleDownload(kind: "investor" | "deck" | "xlsx") {
    toast.success(
      kind === "investor"
        ? "Investor report prepared for download."
        : kind === "deck"
        ? "Presentation exported. Ready to download."
        : "Financial workbook generated."
    )
  }

  return (
    <section
      className={["w-full max-w-full", className].filter(Boolean).join(" ")}
      aria-label="Financial analysis and readiness"
    >
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <InspectionPanel className="h-6 w-6 text-[--chart-1]" aria-hidden="true" />
          <h2 className="text-xl sm:text-2xl font-bold tracking-[-0.02em]">Financial Analysis</h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-prose">
          AI-driven financial readiness, risk assessment, forecasting, and investor-ready reporting. Integrate your accounting data, model scenarios, and benchmark against your industry.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-[--surface-1] border border-[--border]">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[--surface-2]">
            Overview
          </TabsTrigger>
          <TabsTrigger value="risk" className="data-[state=active]:bg-[--surface-2]">
            Risk & Funding
          </TabsTrigger>
          <TabsTrigger value="forecast" className="data-[state=active]:bg-[--surface-2]">
            Forecasting
          </TabsTrigger>
          <TabsTrigger value="compliance" className="data-[state=active]:bg-[--surface-2]">
            Compliance
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-[--surface-2]">
            Integrations
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-[--surface-2]">
            Reports
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card className="bg-[--card] border border-[--border]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ChartBar className="h-4 w-4 text-[--chart-1]" />
                  Financial Health
                </CardTitle>
                <CardDescription>Composite AI health score</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-center gap-5">
                  <div
                    className="relative h-20 w-20 rounded-full"
                    aria-label={`Health score ${riskScore}/100`}
                    style={{
                      background: `conic-gradient(var(--chart-1) ${riskScore * 3.6}deg, #1a1f1d 0deg)`,
                    }}
                  >
                    <div className="absolute inset-1 rounded-full bg-[--surface-1] grid place-items-center">
                      <span className="text-lg font-semibold">{riskScore}</span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-base font-medium">{riskLevel}</span>
                      <Badge className="bg-[--surface-2] text-[--sidebar-foreground]">
                        AI-rated
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground break-words">
                      Focus on reducing burn and stabilizing market exposure to lift score.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[--card] border border-[--border]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ChartArea className="h-4 w-4 text-[--chart-1]" />
                  Revenue Trend
                </CardTitle>
                <CardDescription>Last 12 months (in $1k)</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-28 flex items-end gap-1">
                  {revenueSeries.map((v, i) => {
                    const max = Math.max(...revenueSeries)
                    const h = (v / max) * 100
                    const color =
                      i > 0 && v >= revenueSeries[i - 1]
                        ? trendColors.good
                        : trendColors.warn
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-sm bg-gradient-to-t from-[--surface-2] to-transparent`}
                        aria-hidden="true"
                      >
                        <div
                          className={`w-full rounded-sm ${color}`}
                          style={{ height: `${h}%`, backgroundColor: "currentColor", opacity: 0.9 }}
                        />
                      </div>
                    )
                  })}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-muted-foreground">MRR</span>
                    <span className="ml-2 font-medium">{fmtMoney(monthlyRevenue)}</span>
                  </div>
                  <Badge variant="outline" className="border-[--border]">
                    +{Math.round(((revenueSeries.at(-1)! - revenueSeries[0]) / revenueSeries[0]) * 100)}% YoY
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[--card] border border-[--border]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ChartColumnStacked className="h-4 w-4 text-[--chart-2]" />
                  Cash Flow
                </CardTitle>
                <CardDescription>Inflow vs Outflow (in $1k)</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-28 grid grid-cols-12 items-end gap-1">
                  {cashflowSeries.inflow.map((inV, i) => {
                    const outV = cashflowSeries.outflow[i]
                    const max = Math.max(...cashflowSeries.inflow, ...cashflowSeries.outflow)
                    const inH = (inV / max) * 100
                    const outH = (outV / max) * 100
                    return (
                      <div key={i} className="flex flex-col justify-end gap-0.5">
                        <div
                          className="w-full rounded-sm bg-[--chart-2]/90"
                          style={{ height: `${inH}%` }}
                          aria-label={`Inflow month ${i + 1}: ${inV}k`}
                        />
                        <div
                          className="w-full rounded-sm bg-[--danger]/80"
                          style={{ height: `${outH}%` }}
                          aria-label={`Outflow month ${i + 1}: ${outV}k`}
                        />
                      </div>
                    )
                  })}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Net</span>
                    <span className="ml-2 font-medium">
                      {fmtMoney(netCash.at(-1)! * 1000)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    AR aging healthy • OPEX steady
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[--card] border border-[--border]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ChartSpline className="h-4 w-4 text-[--chart-1]" />
                  Market Potential
                </CardTitle>
                <CardDescription>AI score vs addressable market</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Progress value={marketPotential} className="h-2 bg-[--surface-2]" />
                    <div className="mt-2 text-sm flex items-center justify-between">
                      <span className="text-muted-foreground">Potential</span>
                      <span className="font-medium">{marketPotential}/100</span>
                    </div>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="text-xs text-muted-foreground">
                  Benchmarks suggest above-average growth window in current segment.
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
            <Card className="bg-[--card] border border-[--border] xl:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ChartColumnBig className="h-4 w-4 text-[--chart-1]" />
                  Industry Benchmarks
                </CardTitle>
                <CardDescription>Compare core metrics with top quartile peers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="min-w-[560px] grid grid-cols-4 gap-3 text-sm">
                    <div className="text-muted-foreground">Metric</div>
                    <div className="text-muted-foreground">You</div>
                    <div className="text-muted-foreground">Top Quartile</div>
                    <div className="text-muted-foreground">Gap</div>

                    <div className="py-2">Gross Margin</div>
                    <div className="py-2 font-medium">72%</div>
                    <div className="py-2">76%</div>
                    <div className="py-2">
                      <Badge variant="outline" className="border-[--border]">-4%</Badge>
                    </div>

                    <div className="py-2">Burn Multiple</div>
                    <div className="py-2 font-medium">1.4x</div>
                    <div className="py-2">1.2x</div>
                    <div className="py-2">
                      <Badge variant="outline" className="border-[--border] text-[--warning]">+0.2x</Badge>
                    </div>

                    <div className="py-2">CAC Payback</div>
                    <div className="py-2 font-medium">{cacPayback} mo</div>
                    <div className="py-2">8 mo</div>
                    <div className="py-2">
                      <Badge variant="outline" className="border-[--border]">OK</Badge>
                    </div>

                    <div className="py-2">Net Revenue Retention</div>
                    <div className="py-2 font-medium">108%</div>
                    <div className="py-2">115%</div>
                    <div className="py-2">
                      <Badge variant="outline" className="border-[--border]">-7%</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[--card] border border-[--border]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BanknoteArrowUp className="h-4 w-4 text-[--chart-1]" />
                  Improvement Plan
                </CardTitle>
                <CardDescription>Actionable AI recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recs.map((r) => (
                    <label
                      key={r.id}
                      className="flex items-start gap-3 p-2 rounded-md bg-[--surface-1] border border-[--border] hover:bg-[--surface-2] transition-colors cursor-pointer"
                    >
                      <Switch
                        checked={r.done}
                        onCheckedChange={() => toggleRec(r.id)}
                        aria-label={r.label}
                      />
                      <div className="min-w-0">
                        <div className={`text-sm ${r.done ? "line-through opacity-70" : ""} truncate`}>
                          {r.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {r.done ? "Completed" : "Pending"}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="mt-4">
                  <Progress value={recsProgress} className="h-2 bg-[--surface-2]" />
                  <div className="mt-2 text-xs text-muted-foreground">
                    Progress: {recsProgress}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* RISK & FUNDING */}
        <TabsContent value="risk" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="bg-[--card] border border-[--border] lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileChartColumn className="h-4 w-4 text-[--chart-1]" />
                  Funding Risk Calculator
                </CardTitle>
                <CardDescription>Analyze credit, business metrics, and market conditions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="creditScore">Credit Score</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="creditScore"
                        type="number"
                        min={300}
                        max={850}
                        value={creditScore}
                        onChange={(e) => setCreditScore(Number(e.target.value || 0))}
                        className="bg-[--surface-1] border-[--border]"
                        aria-describedby="creditScoreHelp"
                      />
                      <Badge variant="outline" className="border-[--border]">{creditScore}</Badge>
                    </div>
                    <p id="creditScoreHelp" className="text-xs text-muted-foreground">
                      Typical range 300–850. ≥ 700 preferred.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyRevenue">Monthly Revenue (USD)</Label>
                    <Input
                      id="monthlyRevenue"
                      type="number"
                      min={0}
                      value={monthlyRevenue}
                      onChange={(e) => setMonthlyRevenue(Number(e.target.value || 0))}
                      className="bg-[--surface-1] border-[--border]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="burnRate">Monthly Burn (USD)</Label>
                    <Input
                      id="burnRate"
                      type="number"
                      min={0}
                      value={burnRate}
                      onChange={(e) => setBurnRate(Number(e.target.value || 0))}
                      className="bg-[--surface-1] border-[--border]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Market Volatility</Label>
                    <Select
                      value={marketVolatility}
                      onValueChange={(v: "low" | "medium" | "high") => setMarketVolatility(v)}
                    >
                      <SelectTrigger className="bg-[--surface-1] border-[--border]">
                        <SelectValue placeholder="Select volatility" />
                      </SelectTrigger>
                      <SelectContent className="bg-[--surface-1] border-[--border]">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cashReserve">Cash Reserve (USD)</Label>
                    <Input
                      id="cashReserve"
                      type="number"
                      min={0}
                      value={cashReserve}
                      onChange={(e) => setCashReserve(Number(e.target.value || 0))}
                      className="bg-[--surface-1] border-[--border]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Target Runway (months)</Label>
                    <div className="px-1 py-2 rounded-md bg-[--surface-1] border border-[--border]">
                      <Slider
                        value={[targetRunway]}
                        min={3}
                        max={24}
                        step={1}
                        onValueChange={([v]) => setTargetRunway(v)}
                        aria-label="Target runway months"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">Target: {targetRunway} months</div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Metric
                    icon={<BadgeIndianRupee className="h-4 w-4 text-[--chart-1]" />}
                    label="Risk Score"
                    value={`${riskScore}/100`}
                    hint={riskLevel}
                  />
                  <Metric
                    icon={<ReceiptIndianRupee className="h-4 w-4 text-[--chart-2]" />}
                    label="Required Funding"
                    value={fmtMoney(requiredFunding)}
                    hint={`${targetRunway} mo runway target`}
                  />
                  <Metric
                    icon={<ChartBar className="h-4 w-4 text-[--chart-3]" />}
                    label="Burn Ratio"
                    value={`${Math.round((burnRate / Math.max(1, monthlyRevenue)) * 100)}%`}
                    hint="Burn / Revenue"
                  />
                </div>

                <div className="mt-2 rounded-lg border border-[--border] bg-[--surface-1] p-3">
                  <p className="text-sm font-medium">AI Recommendations</p>
                  <ul className="mt-2 text-sm list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Reduce burn to ≤ 60% of revenue to lift score into "Moderate".</li>
                    <li>Strengthen reserves to cover at least 8 months of runway.</li>
                    <li>Mitigate exposure in high-volatility channels; diversify acquisition.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[--card] border border-[--border]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ChartCandlestick className="h-4 w-4 text-[--chart-1]" />
                  Funding Strategy
                </CardTitle>
                <CardDescription>Tailored approach to match risk profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm">Preferred Instrument</p>
                    <p className="text-xs text-muted-foreground">Based on score and cash flows</p>
                  </div>
                  <Badge className="bg-[--surface-2]">Revenue-based Finance</Badge>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm">Indicative Range</p>
                    <p className="text-xs text-muted-foreground">Non-binding estimate</p>
                  </div>
                  <span className="text-sm font-medium">{fmtMoney(Math.round(requiredFunding * 0.6))} – {fmtMoney(Math.round(requiredFunding * 1.2))}</span>
                </div>
                <Separator />
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="w-full bg-[--primary] text-[--primary-foreground] hover:opacity-90"
                        onClick={() => toast.success("Strategy saved. We’ll refine as data updates.")}
                      >
                        Save Strategy
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[--popover] border-[--border]">
                      Persist current risk parameters and funding plan
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* FORECASTING */}
        <TabsContent value="forecast" className="mt-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <Card className="bg-[--card] border border-[--border] xl:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ChartArea className="h-4 w-4 text-[--chart-1]" />
                  Financial Forecast
                </CardTitle>
                <CardDescription>12-month projection with scenario planning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 w-full rounded-md bg-[--surface-1] border border-[--border] p-2">
                  <div className="relative h-full w-full overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(transparent,transparent_95%,rgba(255,255,255,0.06)_96%,transparent_97%)]" />
                    <div className="absolute inset-2 flex items-end gap-1">
                      {projection.map((v, i) => {
                        const max = Math.max(...projection)
                        const h = (v / max) * 100
                        return (
                          <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-[--chart-1]/10 to-[--chart-1]/30">
                            <div
                              className="w-full rounded-sm bg-[--chart-1]"
                              style={{ height: `${h}%`, opacity: 0.9 }}
                              aria-label={`Month ${i + 1} forecast ${fmt(v)}`}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Metric
                    icon={<FileChartPie className="h-4 w-4 text-[--chart-1]" />}
                    label="Month 12 Revenue"
                    value={fmtMoney(projection.at(-1)!)}
                    hint={`${scenario[0].toUpperCase()}${scenario.slice(1)} scenario`}
                  />
                  <Metric
                    icon={<ChartBar className="h-4 w-4 text-[--chart-2]" />}
                    label="Avg MoM Growth"
                    value={`${Math.round(((projection.at(-1)! / Math.max(1, projection[0])) ** (1 / Math.max(1, projection.length - 1)) - 1) * 100)}%`}
                    hint="Geometric mean"
                  />
                  <Metric
                    icon={<ChartSpline className="h-4 w-4 text-[--chart-3]" />}
                    label="Total Increase"
                    value={fmtMoney(Math.max(0, projection.at(-1)! - projection[0]))}
                    hint="Over 12 months"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[--card] border border-[--border]">
              <CardHeader>
                <CardTitle className="text-base">Scenario Controls</CardTitle>
                <CardDescription>Adjust assumptions to model outcomes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>Scenario</Label>
                  <Select
                    value={scenario}
                    onValueChange={(v: "base" | "optimistic" | "pessimistic") => setScenario(v)}
                  >
                    <SelectTrigger className="bg-[--surface-1] border-[--border]">
                      <SelectValue placeholder="Choose scenario" />
                    </SelectTrigger>
                    <SelectContent className="bg-[--surface-1] border-[--border]">
                      <SelectItem value="base">Base</SelectItem>
                      <SelectItem value="optimistic">Optimistic</SelectItem>
                      <SelectItem value="pessimistic">Pessimistic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <ControlSlider
                  label="Growth Rate (MoM)"
                  value={growthRate}
                  min={0}
                  max={20}
                  step={0.5}
                  onChange={setGrowthRate}
                  suffix="%"
                />

                <ControlSlider
                  label="Churn Rate (MoM)"
                  value={churnRate}
                  min={0}
                  max={10}
                  step={0.5}
                  onChange={setChurnRate}
                  suffix="%"
                />

                <ControlSlider
                  label="CAC Payback (months)"
                  value={cacPayback}
                  min={1}
                  max={24}
                  step={1}
                  onChange={setCacPayback}
                />

                <Button
                  className="w-full bg-[--primary] text-[--primary-foreground] hover:opacity-90"
                  onClick={() => toast.success("Scenario saved. Forecast will update with new data.")}
                >
                  Save Scenario
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* COMPLIANCE */}
        <TabsContent value="compliance" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="bg-[--card] border border-[--border] lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <InspectionPanel className="h-4 w-4 text-[--chart-1]" />
                  Compliance & Utilization
                </CardTitle>
                <CardDescription>Track fund utilization and regulatory requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ComplianceItem
                  title="Use-of-Funds Allocation"
                  description="Capex, payroll, marketing spend aligned with funding agreement."
                  progress={78}
                  status="On Track"
                />
                <ComplianceItem
                  title="KYC/AML Verification"
                  description="Beneficial owners verified and screened."
                  progress={100}
                  status="Complete"
                />
                <ComplianceItem
                  title="Covenant Reporting"
                  description="Monthly revenue covenants and runway thresholds."
                  progress={56}
                  status="Attention"
                />
              </CardContent>
            </Card>

            <Card className="bg-[--card] border border-[--border]">
              <CardHeader>
                <CardTitle className="text-base">Regulatory Checklist</CardTitle>
                <CardDescription>Key documents and deadlines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ChecklistRow label="Audited Financials FY" done />
                <ChecklistRow label="Board Resolution for Financing" done={false} />
                <ChecklistRow label="Updated Cap Table" done />
                <ChecklistRow label="Information Rights Setup" done={false} />
                <Separator />
                <Button
                  variant="outline"
                  className="w-full border-[--border] bg-[--surface-1] hover:bg-[--surface-2]"
                  onClick={() => toast.success("Compliance summary exported.")}
                >
                  Export Compliance Summary
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* INTEGRATIONS */}
        <TabsContent value="integrations" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <IntegrationCard
              name="QuickBooks"
              description="Sync transactions, AR/AP, and chart of accounts."
              onConnect={() => toast.success("QuickBooks connected. Initial sync in progress.")}
            />
            <IntegrationCard
              name="Xero"
              description="Import ledgers and reconcile bank feeds securely."
              onConnect={() => toast.success("Xero connected. Data import started.")}
            />
            <IntegrationCard
              name="Zoho Books"
              description="Bring invoices, expenses, and journals into BoostFund AI."
              onConnect={() => toast.success("Zoho Books connected.")}
            />
          </div>

          <Card className="bg-[--card] border border-[--border] mt-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileChartPie className="h-4 w-4 text-[--chart-1]" />
                Data Import
              </CardTitle>
              <CardDescription>Upload CSV exports for revenue, expenses, or cohorts</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Input type="file" className="bg-[--surface-1] border-[--border]" aria-label="Upload CSV" />
              <Button
                className="bg-[--primary] text-[--primary-foreground] hover:opacity-90"
                onClick={() => toast.success("Import queued. You’ll be notified when complete.")}
              >
                Import Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REPORTS */}
        <TabsContent value="reports" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ReportCard
              icon={<FileChartPie className="h-5 w-5 text-[--chart-1]" />}
              title="Investor Report (PDF)"
              desc="Financial health, risk, and runway summary."
              action={() => handleDownload("investor")}
            />
            <ReportCard
              icon={<ChartBar className="h-5 w-5 text-[--chart-2]" />}
              title="Board Pack (Deck)"
              desc="Charts and insights tailored for board review."
              action={() => handleDownload("deck")}
            />
            <ReportCard
              icon={<ChartColumnBig className="h-5 w-5 text-[--chart-1]" />}
              title="Financial Workbook (XLSX)"
              desc="Raw data tables and assumptions for modeling."
              action={() => handleDownload("xlsx")}
            />
          </div>
        </TabsContent>
      </Tabs>
    </section>
  )
}

function Metric(props: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-md border border-[--border] bg-[--surface-1] p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {props.icon}
          <span className="text-sm text-muted-foreground">{props.label}</span>
        </div>
        <span className="text-sm font-medium">{props.value}</span>
      </div>
      {props.hint ? (
        <div className="mt-1 text-xs text-muted-foreground">{props.hint}</div>
      ) : null}
    </div>
  )
}

function ComplianceItem({
  title,
  description,
  progress,
  status,
}: {
  title: string
  description: string
  progress: number
  status: "On Track" | "Complete" | "Attention"
}) {
  const statusColor =
    status === "Complete"
      ? "bg-[--chart-3]"
      : status === "On Track"
      ? "bg-[--chart-2]"
      : "bg-[--warning]"
  return (
    <div className="rounded-lg border border-[--border] bg-[--surface-1] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{title}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <span className={`inline-flex h-2 w-2 rounded-full ${statusColor} mt-1`} aria-hidden="true" />
      </div>
      <Progress value={progress} className="h-2 bg-[--surface-2] mt-3" />
      <div className="mt-2 text-xs text-muted-foreground">Progress: {progress}% • {status}</div>
    </div>
  )
}

function ChecklistRow({ label, done }: { label: string; done?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-[--surface-1] border border-[--border] p-2">
      <div className={`text-sm ${done ? "opacity-70 line-through" : ""} truncate`}>{label}</div>
      <Badge className={done ? "bg-[--chart-3]" : "bg-[--warning]"}>{done ? "Done" : "Pending"}</Badge>
    </div>
  )
}

function IntegrationCard({
  name,
  description,
  onConnect,
}: {
  name: string
  description: string
  onConnect: () => void
}) {
  return (
    <Card className="bg-[--card] border border-[--border]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{name}</CardTitle>
        <CardDescription className="break-words">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">Secure OAuth • Read-only by default</div>
        <Button
          variant="outline"
          className="border-[--border] bg-[--surface-1] hover:bg-[--surface-2]"
          onClick={onConnect}
        >
          Connect
        </Button>
      </CardContent>
    </Card>
  )
}

function ReportCard({
  icon,
  title,
  desc,
  action,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  action: () => void
}) {
  return (
    <Card className="bg-[--card] border border-[--border] h-full">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </CardTitle>
        <CardDescription className="break-words">{desc}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full bg-[--primary] text-[--primary-foreground] hover:opacity-90"
          onClick={action}
        >
          Download
        </Button>
      </CardContent>
    </Card>
  )
}

function ControlSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  suffix?: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label>{label}</Label>
        <span className="text-xs text-muted-foreground">
          {value}
          {suffix ?? ""}
        </span>
      </div>
      <div className="px-1 py-2 rounded-md bg-[--surface-1] border border-[--border]">
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={([v]) => onChange(v)}
          aria-label={label}
        />
      </div>
    </div>
  )
}