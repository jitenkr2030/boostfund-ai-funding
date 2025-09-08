"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Search,
  ListFilter,
  FileCheck2,
  FolderMinus,
  FolderSearch2,
  SearchSlash,
  CalendarSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type FundingType = "grant" | "vc" | "angel" | "loan";

export type Opportunity = {
  id: string;
  title: string;
  type: FundingType;
  industry: string;
  location: string;
  amountMin: number;
  amountMax: number;
  currency: string;
  deadline: string; // ISO date
  eligibility: string;
  score: number; // 0-100
  description: string;
  requirements: string[];
  process: string[];
  url?: string;
  saved?: boolean;
  applied?: boolean;
};

type FundingOpportunitiesProps = {
  className?: string;
  style?: React.CSSProperties;
  items?: Opportunity[];
  onSaveChange?: (opportunity: Opportunity, saved: boolean) => void;
  onApply?: (opportunity: Opportunity) => void;
};

const defaultSuggestions = [
  "AI healthcare seed grants",
  "Climate tech pre-seed funding",
  "Fintech female founder grants",
  "Deeptech EU Horizon calls",
  "Non-dilutive funds under 100k",
];

const defaultIndustries = [
  "AI/ML",
  "Healthcare",
  "Climate",
  "Fintech",
  "Consumer",
  "Enterprise",
  "Web3",
  "Education",
];

const defaultLocations = ["Global", "United States", "Europe", "Asia", "Remote"];

const sampleData: Opportunity[] = [
  {
    id: "bf-001",
    title: "Green Innovators Grant 2025",
    type: "grant",
    industry: "Climate",
    location: "Global",
    amountMin: 50000,
    amountMax: 150000,
    currency: "USD",
    deadline: new Date(new Date().setDate(new Date().getDate() + 28)).toISOString(),
    eligibility: "Early-stage startups working on carbon reduction technologies.",
    score: 92,
    description:
      "Support for startups developing scalable solutions that reduce greenhouse gas emissions. Includes mentorship, non-dilutive funding, and access to pilot partners.",
    requirements: [
      "Incorporated entity under 5 years old",
      "MVP or validated prototype",
      "Impact measurement framework",
    ],
    process: [
      "Online application (10 pages max)",
      "Initial screening call",
      "Panel review with domain experts",
      "Final decision and terms",
    ],
    saved: true,
    applied: false,
  },
  {
    id: "bf-002",
    title: "Helix Ventures Seed Program",
    type: "vc",
    industry: "AI/ML",
    location: "United States",
    amountMin: 250000,
    amountMax: 2000000,
    currency: "USD",
    deadline: new Date(new Date().setDate(new Date().getDate() + 60)).toISOString(),
    eligibility: "Technical founding teams with defensible AI moats.",
    score: 78,
    description:
      "Pre-seed and seed checks with hands-on GTM help. Focus on applied AI in healthcare and enterprise automation.",
    requirements: ["2-3 founders", "Early traction or pilots", "Defensible IP or data advantage"],
    process: ["Warm intro preferred", "Partner meeting", "Technical diligence", "Term sheet"],
    saved: false,
    applied: false,
  },
  {
    id: "bf-003",
    title: "Women in Fintech Angel Collective",
    type: "angel",
    industry: "Fintech",
    location: "Europe",
    amountMin: 100000,
    amountMax: 500000,
    currency: "EUR",
    deadline: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
    eligibility: "Women-led fintech startups at MVP to early traction stage.",
    score: 84,
    description:
      "Collective of operators and angels investing in inclusive financial innovation across Europe.",
    requirements: ["Female founder/CEO", "Operating in EEA/UK", "Product in market or pilot-ready"],
    process: ["Submit deck", "Screening committee", "Pitch to collective", "Syndication & close"],
    saved: false,
    applied: true,
  },
  {
    id: "bf-004",
    title: "Founders Growth Loan",
    type: "loan",
    industry: "Enterprise",
    location: "United States",
    amountMin: 150000,
    amountMax: 1000000,
    currency: "USD",
    deadline: new Date(new Date().setDate(new Date().getDate() + 90)).toISOString(),
    eligibility: "Post-revenue SaaS with >$25k MRR.",
    score: 70,
    description:
      "Non-dilutive growth capital with flexible covenants for B2B SaaS. Rapid underwriting and founder-friendly terms.",
    requirements: ["$25k+ MRR", "12+ months runway post-fund", "US entity"],
    process: ["Submit financials", "Underwriting", "Offer", "Funds wired"],
    saved: false,
    applied: false,
  },
];

function formatCurrency(n: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${currency} ${n.toLocaleString()}`;
  }
}

function withinRange(min: number | undefined, max: number | undefined, oppMin: number, oppMax: number) {
  if (min == null && max == null) return true;
  if (min == null) return oppMin <= (max as number);
  if (max == null) return oppMax >= (min as number);
  return oppMax >= min && oppMin <= max;
}

export default function FundingOpportunities({
  className,
  style,
  items = sampleData,
  onSaveChange,
  onApply,
}: FundingOpportunitiesProps) {
  const [q, setQ] = useState("");
  const [type, setType] = useState<FundingType | "all">("all");
  const [industry, setIndustry] = useState<string | "all">("all");
  const [location, setLocation] = useState<string | "all">("all");
  const [minAmount, setMinAmount] = useState<number | undefined>(undefined);
  const [maxAmount, setMaxAmount] = useState<number | undefined>(undefined);
  const [deadlineBefore, setDeadlineBefore] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [tab, setTab] = useState<"all" | "saved">("all");
  const [local, setLocal] = useState<Opportunity[]>(items);

  useEffect(() => {
    setLocal(items);
  }, [items]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const suggestions = useMemo(() => {
    if (!q) return defaultSuggestions.slice(0, 5);
    const lower = q.toLowerCase();
    return defaultSuggestions
      .filter((s) => s.toLowerCase().includes(lower))
      .concat(q.length > 8 ? [`${q} funding opportunities`] : [])
      .slice(0, 5);
  }, [q]);

  const handleSearch = async () => {
    try {
      setError(null);
      setLoading(true);
      // Simulate async search latency and occasional error
      await new Promise((r) => setTimeout(r, 650));
      if (q.toLowerCase().includes("error")) {
        throw new Error("AI search service temporarily unavailable. Try refining your query.");
      }
      // In real implementation, call server action / api with filters
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
      toast.error("Search failed", { description: "Please adjust filters and try again." });
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setType("all");
    setIndustry("all");
    setLocation("all");
    setMinAmount(undefined);
    setMaxAmount(undefined);
    setDeadlineBefore("");
  };

  const filtered = useMemo(() => {
    const base = tab === "saved" ? local.filter((i) => i.saved) : local;
    return base.filter((op) => {
      if (type !== "all" && op.type !== type) return false;
      if (industry !== "all" && op.industry !== industry) return false;
      if (location !== "all" && op.location !== location) return false;
      if (!withinRange(minAmount, maxAmount, op.amountMin, op.amountMax)) return false;
      if (deadlineBefore) {
        const by = new Date(deadlineBefore).getTime();
        if (new Date(op.deadline).getTime() > by) return false;
      }
      const qq = q.trim().toLowerCase();
      if (qq) {
        const hay = `${op.title} ${op.industry} ${op.location} ${op.eligibility} ${op.description}`.toLowerCase();
        if (!hay.includes(qq)) return false;
      }
      return true;
    });
  }, [local, tab, type, industry, location, minAmount, maxAmount, deadlineBefore, q]);

  const onToggleSave = (op: Opportunity) => {
    setLocal((prev) =>
      prev.map((o) => (o.id === op.id ? { ...o, saved: !o.saved } : o)),
    );
    onSaveChange?.(op, !op.saved);
    toast(op.saved ? "Removed from saved" : "Saved opportunity", {
      description: op.title,
    });
  };

  const onApplyClick = (op: Opportunity) => {
    setLocal((prev) => prev.map((o) => (o.id === op.id ? { ...o, applied: true } : o)));
    onApply?.(op);
    toast.success("Application started", {
      description: "We’ve queued application steps and reminders.",
    });
  };

  const hasResults = filtered.length > 0;

  const DetailBody = ({ opp }: { opp: Opportunity }) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Stat label="Funding Range" value={`${formatCurrency(opp.amountMin, opp.currency)} - ${formatCurrency(opp.amountMax, opp.currency)}`} />
        <Stat label="Application Deadline" value={new Date(opp.deadline).toLocaleDateString()} />
        <Stat label="Type" value={capitalize(opp.type)} />
        <Stat label="Location" value={opp.location} />
      </div>
      <section>
        <h4 className="text-sm font-medium text-foreground mb-2">Overview</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{opp.description}</p>
      </section>
      <section>
        <h4 className="text-sm font-medium text-foreground mb-2">Eligibility</h4>
        <p className="text-sm text-muted-foreground">{opp.eligibility}</p>
      </section>
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Requirements</h4>
          <ul className="list-disc pl-5 space-y-1">
            {opp.requirements.map((r, i) => (
              <li key={i} className="text-sm text-muted-foreground">{r}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Application Process</h4>
          <ol className="list-decimal pl-5 space-y-1">
            {opp.process.map((p, i) => (
              <li key={i} className="text-sm text-muted-foreground">{p}</li>
            ))}
          </ol>
        </div>
      </section>
      <section className="rounded-lg bg-[var(--surface-1)] border border-[var(--border)] p-4">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <CalendarSearch className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
            <h4 className="text-sm font-medium">AI Application Assistance</h4>
          </div>
          <Badge variant="secondary" className="bg-[var(--surface-2)] text-xs">Beta</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Get tailored guidance, requirement checklists, and draft responses aligned to this opportunity.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
            onClick={() => {
              toast("AI assistance ready", {
                description: "We’ve generated a checklist and draft answers in Applications.",
              });
            }}
          >
            <FileCheck2 className="mr-2 h-4 w-4" />
            Generate Checklist & Drafts
          </Button>
          <Button
            variant="secondary"
            className="bg-[var(--secondary)] hover:bg-[var(--surface-2)]"
            onClick={() => {
              toast("Reminder set", { description: "We’ll remind you 72 hours before the deadline." });
            }}
          >
            <CalendarSearch className="mr-2 h-4 w-4" />
            Set Deadline Reminder
          </Button>
        </div>
      </section>
    </div>
  );

  return (
    <section
      className={cn(
        "w-full max-w-full bg-[var(--card)] border border-[var(--border)] rounded-lg",
        "p-4 sm:p-6",
        className,
      )}
      style={style}
      aria-label="Funding Opportunities"
    >
      <div className="space-y-4">
        <header className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-heading">Funding Opportunities</h2>
          <p className="text-sm text-muted-foreground">
            AI-powered discovery with precise filters. Save, apply, and track in one place.
          </p>
        </header>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-3 sm:p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-stretch gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  aria-label="Search funding opportunities"
                  placeholder="Search by keywords (e.g., climate tech seed grant)"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  className="pl-9 bg-[var(--surface-2)] border-[var(--border)] focus-visible:ring-[var(--ring)]"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
                aria-label="Run search"
              >
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQ(s);
                      handleSearch();
                    }}
                    className="text-xs sm:text-sm rounded-full border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--surface-2)] px-3 py-1 transition-colors"
                    aria-label={`Use suggestion ${s}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-1">
              <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "saved")}>
                <div className="flex items-center justify-between gap-2">
                  <TabsList className="bg-[var(--surface-2)]">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="saved">Saved</TabsTrigger>
                  </TabsList>
                  <div className="flex items-center gap-2">
                    <ListFilter className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-xs text-muted-foreground">Filters</span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="type">Type</Label>
                    <Select value={type} onValueChange={(v) => setType(v as any)}>
                      <SelectTrigger id="type" className="bg-[var(--surface-2)]">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="grant">Grant</SelectItem>
                        <SelectItem value="vc">VC</SelectItem>
                        <SelectItem value="angel">Angel</SelectItem>
                        <SelectItem value="loan">Loan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={industry} onValueChange={(v) => setIndustry(v as any)}>
                      <SelectTrigger id="industry" className="bg-[var(--surface-2)]">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {defaultIndustries.map((ind) => (
                          <SelectItem key={ind} value={ind}>
                            {ind}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="location">Location</Label>
                    <Select value={location} onValueChange={(v) => setLocation(v as any)}>
                      <SelectTrigger id="location" className="bg-[var(--surface-2)]">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {defaultLocations.map((l) => (
                          <SelectItem key={l} value={l}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label>Amount min</Label>
                    <Input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="e.g., 100000"
                      value={minAmount == null ? "" : String(minAmount)}
                      onChange={(e) => setMinAmount(e.target.value ? Number(e.target.value) : undefined)}
                      className="bg-[var(--surface-2)]"
                      aria-label="Minimum amount"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Amount max</Label>
                    <Input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="e.g., 500000"
                      value={maxAmount == null ? "" : String(maxAmount)}
                      onChange={(e) => setMaxAmount(e.target.value ? Number(e.target.value) : undefined)}
                      className="bg-[var(--surface-2)]"
                      aria-label="Maximum amount"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <Label htmlFor="deadline">Apply before</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={deadlineBefore}
                      onChange={(e) => setDeadlineBefore(e.target.value)}
                      className="bg-[var(--surface-2)]"
                    />
                  </div>

                  <div className="flex items-end gap-2 md:col-span-3">
                    <Button
                      variant="secondary"
                      onClick={clearFilters}
                      className="bg-[var(--secondary)] hover:bg-[var(--surface-2)]"
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={handleSearch}
                      className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Apply Filters
                    </Button>
                  </div>
                </div>

                <TabsContent value="all" />
                <TabsContent value="saved" />
              </Tabs>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {loading
              ? "Searching..."
              : error
              ? "Search error"
              : hasResults
              ? `${filtered.length} opportunities`
              : "No opportunities"}
          </span>
          <div className="flex items-center gap-2">
            <Badge className="bg-[var(--surface-2)]">Real-time</Badge>
          </div>
        </div>

        <Separator className="bg-[var(--border)]" />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`sk-${i}`}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-4 w-2/3 bg-[var(--surface-2)]" />
                  <Skeleton className="h-6 w-12 rounded-full bg-[var(--surface-2)]" />
                </div>
                <Skeleton className="h-3 w-1/2 bg-[var(--surface-2)] mb-2" />
                <Skeleton className="h-3 w-3/4 bg-[var(--surface-2)] mb-2" />
                <Skeleton className="h-3 w-1/3 bg-[var(--surface-2)] mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-20 bg-[var(--surface-2)]" />
                  <Skeleton className="h-9 w-24 bg-[var(--surface-2)]" />
                </div>
              </div>
            ))}

          {!loading && error && (
            <div className="col-span-full rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-6 text-center">
              <SearchSlash className="mx-auto h-6 w-6 text-[var(--danger)] mb-2" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <div className="mt-3">
                <Button
                  variant="secondary"
                  className="bg-[var(--secondary)] hover:bg-[var(--surface-2)]"
                  onClick={() => {
                    setError(null);
                    handleSearch();
                  }}
                >
                  Try again
                </Button>
              </div>
            </div>
          )}

          {!loading && !error && !hasResults && (
            <div className="col-span-full rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-8 text-center">
              <SearchSlash className="mx-auto h-8 w-8 text-muted-foreground mb-2" aria-hidden="true" />
              <h3 className="font-medium">No matching opportunities</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting filters or using broader keywords.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                {["Global", "Grant", "Under 100k"].map((chip) => (
                  <button
                    key={chip}
                    className="text-xs rounded-full border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--surface-2)] px-3 py-1"
                    onClick={() => {
                      if (chip === "Grant") setType("grant");
                      if (chip === "Global") setLocation("Global");
                      if (chip === "Under 100k") setMaxAmount(100000);
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading &&
            !error &&
            hasResults &&
            filtered.map((op) => (
              <article
                key={op.id}
                className="group rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-4 hover:border-[var(--primary)]/60 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-medium truncate">{op.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5">
                        {capitalize(op.type)}
                      </span>
                      <span>{op.industry}</span>
                      <span>•</span>
                      <span className="truncate">{op.location}</span>
                    </div>
                  </div>
                  <MatchScore score={op.score} />
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Funding</span>
                    <span className="font-medium">
                      {formatCurrency(op.amountMin, op.currency)} - {formatCurrency(op.amountMax, op.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Deadline</span>
                    <span className="font-medium">{new Date(op.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Eligibility</span>
                    <p className="text-sm ml-auto text-right text-muted-foreground line-clamp-2">
                      {op.eligibility}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
                    onClick={() => onApplyClick(op)}
                  >
                    <FileCheck2 className="mr-2 h-4 w-4" />
                    {op.applied ? "Continue Application" : "Apply"}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className={cn(
                      "bg-[var(--secondary)] hover:bg-[var(--surface-2)]",
                      op.saved && "border-[var(--primary)]/60",
                    )}
                    onClick={() => onToggleSave(op)}
                  >
                    <FolderMinus className="mr-2 h-4 w-4" />
                    {op.saved ? "Saved" : "Save"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="hover:bg-[var(--surface-2)]"
                    onClick={() => setSelected(op)}
                  >
                    <FolderSearch2 className="mr-2 h-4 w-4" />
                    Details
                  </Button>
                </div>
              </article>
            ))}
        </div>

        <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface-1)]">
          <div className="p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Saved Opportunities</h3>
              <p className="text-xs text-muted-foreground">
                Quick access to your shortlist and application alerts.
              </p>
            </div>
            <Badge className="bg-[var(--surface-2)]">{local.filter((i) => i.saved).length}</Badge>
          </div>
          <Separator className="bg-[var(--border)]" />
          <ScrollArea className="max-h-56">
            <ul className="p-3 space-y-2">
              {local.filter((i) => i.saved).length === 0 && (
                <li className="text-sm text-muted-foreground px-1 py-2">No saved opportunities yet.</li>
              )}
              {local
                .filter((i) => i.saved)
                .map((op) => (
                  <li
                    key={`saved-${op.id}`}
                    className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-[var(--surface-2)] transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate">{op.title}</p>
                        <span className="text-xs text-muted-foreground">
                          {daysLeft(op.deadline)}d left
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{capitalize(op.type)}</span>
                        <span>•</span>
                        <span className="truncate">{op.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-3 hover:bg-[var(--card)]"
                        onClick={() => setSelected(op)}
                        aria-label={`View details for ${op.title}`}
                      >
                        <FolderSearch2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-3 hover:bg-[var(--card)]"
                        onClick={() => onToggleSave(op)}
                        aria-label={`Remove ${op.title} from saved`}
                      >
                        <FolderMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
            </ul>
          </ScrollArea>
        </div>
      </div>

      {/* Details Modal / Drawer */}
      {selected && !isMobile && (
        <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent className="max-w-2xl bg-[var(--card)] border-[var(--border)] text-foreground">
            <DialogHeader>
              <DialogTitle className="flex items-start justify-between gap-3">
                <span className="text-base sm:text-lg">{selected.title}</span>
                <MatchScore score={selected.score} />
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {capitalize(selected.type)} • {selected.industry} • {selected.location}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-2">
              <DetailBody opp={selected} />
            </ScrollArea>
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-[var(--surface-2)]">
                  Deadline: {new Date(selected.deadline).toLocaleDateString()}
                </Badge>
                <Badge variant="secondary" className="bg-[var(--surface-2)]">
                  {formatCurrency(selected.amountMin, selected.currency)} - {formatCurrency(selected.amountMax, selected.currency)}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
                  onClick={() => onApplyClick(selected)}
                >
                  <FileCheck2 className="mr-2 h-4 w-4" />
                  {selected.applied ? "Continue Application" : "Start Application"}
                </Button>
                <Button
                  variant="secondary"
                  className="bg-[var(--secondary)] hover:bg-[var(--surface-2)]"
                  onClick={() => onToggleSave(selected)}
                >
                  <FolderMinus className="mr-2 h-4 w-4" />
                  {selected.saved ? "Saved" : "Save"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {selected && isMobile && (
        <Drawer open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <DrawerContent className="bg-[var(--card)] border-t border-[var(--border)]">
            <DrawerHeader>
              <DrawerTitle className="flex items-start justify-between gap-3">
                <span className="text-base">{selected.title}</span>
                <MatchScore score={selected.score} />
              </DrawerTitle>
              <DrawerDescription className="text-xs text-muted-foreground">
                {capitalize(selected.type)} • {selected.industry} • {selected.location}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-4">
              <ScrollArea className="max-h-[52vh] pr-2">
                <DetailBody opp={selected} />
              </ScrollArea>
            </div>
            <DrawerFooter className="px-4">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-[var(--surface-2)]">
                    Deadline: {new Date(selected.deadline).toLocaleDateString()}
                  </Badge>
                  <Badge variant="secondary" className="bg-[var(--surface-2)]">
                    {formatCurrency(selected.amountMin, selected.currency)} - {formatCurrency(selected.amountMax, selected.currency)}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
                    onClick={() => onApplyClick(selected)}
                  >
                    <FileCheck2 className="mr-2 h-4 w-4" />
                    {selected.applied ? "Continue" : "Apply"}
                  </Button>
                  <Button
                    variant="secondary"
                    className="bg-[var(--secondary)] hover:bg-[var(--surface-2)]"
                    onClick={() => onToggleSave(selected)}
                  >
                    <FolderMinus className="mr-2 h-4 w-4" />
                    {selected.saved ? "Saved" : "Save"}
                  </Button>
                </div>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </section>
  );
}

function MatchScore({ score }: { score: number }) {
  const tone =
    score >= 85
      ? "text-[var(--success)]"
      : score >= 70
      ? "text-[var(--chart-4)]"
      : "text-[var(--warning)]";
  const bg =
    score >= 85
      ? "bg-[var(--success)]/15"
      : score >= 70
      ? "bg-[var(--chart-4)]/15"
      : "bg-[var(--warning)]/15";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium",
        bg,
        tone,
      )}
      aria-label={`AI match score ${score} percent`}
    >
      {score}% match
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[var(--surface-2)]/40 border border-[var(--border)] p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium mt-0.5 break-words">{value}</div>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function daysLeft(iso: string) {
  const d = Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return d > 0 ? d : 0;
}