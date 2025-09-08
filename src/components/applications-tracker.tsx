"use client";

import * as React from "react";
import {
  ClipboardCheck,
  FileCheck2,
  FileX2,
  Kanban,
  ListChecks,
  Logs,
  SaveAll,
  Sheet as SheetIcon,
  SquareChartGantt,
  TableOfContents,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type ApplicationStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected";

export interface ApplicationRecord {
  id: string;
  name: string;
  source: string;
  amountRequested: number;
  submissionDate?: string; // ISO date
  status: ApplicationStatus;
  deadline?: string; // ISO date
  nextAction?: string;
  documents: { id: string; name: string; type: "pdf" | "docx" | "xls" | "other"; updatedAt: string }[];
  history: { id: string; event: string; at: string; by?: string }[];
  insights?: string;
  compliance?: { label: string; done: boolean }[];
}

export interface ApplicationsTrackerProps {
  className?: string;
  style?: React.CSSProperties;
  applications?: ApplicationRecord[];
  onExportCSV?: (apps: ApplicationRecord[]) => Promise<void> | void;
  onCreateFromTemplate?: (template: string) => void;
  onGenerateAIForm?: (seed?: Partial<ApplicationRecord>) => void;
}

const CURRENCY_FORMAT = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const STATUS_META: Record<
  ApplicationStatus,
  { label: string; tint: string; dot: string; ring: string; bg: string }
> = {
  draft: {
    label: "Draft",
    tint: "text-muted-foreground",
    dot: "bg-muted-foreground",
    ring: "ring-1 ring-muted-foreground/20",
    bg: "bg-surface-2",
  },
  submitted: {
    label: "Submitted",
    tint: "text-chart-2",
    dot: "bg-chart-2",
    ring: "ring-1 ring-chart-2/25",
    bg: "bg-surface-2",
  },
  under_review: {
    label: "Under Review",
    tint: "text-primary",
    dot: "bg-primary",
    ring: "ring-1 ring-primary/25",
    bg: "bg-surface-2",
  },
  approved: {
    label: "Approved",
    tint: "text-success",
    dot: "bg-success",
    ring: "ring-1 ring-success/25",
    bg: "bg-surface-2",
  },
  rejected: {
    label: "Rejected",
    tint: "text-danger",
    dot: "bg-danger",
    ring: "ring-1 ring-danger/25",
    bg: "bg-surface-2",
  },
};

const DEFAULT_APPS: ApplicationRecord[] = [
  {
    id: "app-101",
    name: "Clean Energy Pilot - Phase II",
    source: "DOE Innovation Fund",
    amountRequested: 350000,
    submissionDate: "2025-06-12",
    status: "under_review",
    deadline: "2025-06-30",
    nextAction: "Respond to reviewer questions",
    documents: [
      { id: "d1", name: "Project_Proposal.pdf", type: "pdf", updatedAt: "2025-06-10" },
      { id: "d2", name: "Budget.xlsx", type: "xls", updatedAt: "2025-06-09" },
    ],
    history: [
      { id: "h1", event: "Submitted application", at: "2025-06-12T10:15:00Z", by: "alex@boostfund.ai" },
      { id: "h2", event: "Reviewer requested clarifications", at: "2025-06-18T14:42:00Z" },
    ],
    insights: "Strong alignment with funding priorities. Increase clarity on milestone KPIs to boost approval odds.",
    compliance: [
      { label: "Signed letters of support", done: true },
      { label: "Environmental impact statement", done: false },
      { label: "Financial audit (last FY)", done: true },
    ],
  },
  {
    id: "app-102",
    name: "Community Broadband Expansion",
    source: "NTIA Grants",
    amountRequested: 1200000,
    submissionDate: "2025-05-20",
    status: "submitted",
    deadline: "2025-07-01",
    nextAction: "Await confirmation",
    documents: [{ id: "d3", name: "Application_Form.docx", type: "docx", updatedAt: "2025-05-19" }],
    history: [{ id: "h3", event: "Submitted application", at: "2025-05-20T09:05:00Z" }],
    insights: "Competitive category. Consider adding community impact metrics as an addendum if allowed.",
    compliance: [
      { label: "501(c)(3) verification", done: true },
      { label: "Digital equity plan", done: true },
    ],
  },
  {
    id: "app-103",
    name: "AgriTech Water Efficiency",
    source: "USDA Innovation Challenge",
    amountRequested: 220000,
    status: "draft",
    deadline: "2025-07-15",
    nextAction: "Complete budget narrative",
    documents: [],
    history: [],
    insights: "Draft stage. Use template: 'USDA Narrative v2' to speed up completion by ~45%.",
    compliance: [{ label: "SAM.gov registration", done: false }],
  },
  {
    id: "app-104",
    name: "AI for Public Safety",
    source: "NSF - Secure & Trustworthy",
    amountRequested: 600000,
    submissionDate: "2025-04-02",
    status: "rejected",
    deadline: "2025-04-01",
    nextAction: "Review feedback; plan resubmission",
    documents: [{ id: "d7", name: "Reviewer_Feedback.pdf", type: "pdf", updatedAt: "2025-04-10" }],
    history: [
      { id: "h8", event: "Submitted application", at: "2025-04-02T12:00:00Z" },
      { id: "h9", event: "Decision received (Rejected)", at: "2025-05-12T08:15:00Z" },
    ],
    insights: "Main gaps: evaluation plan rigor and ethics review. Add RCT design and IRB pre-approval.",
    compliance: [{ label: "Ethics compliance checklist", done: false }],
  },
  {
    id: "app-105",
    name: "Decarbonized Logistics Network",
    source: "Private Foundation A",
    amountRequested: 900000,
    submissionDate: "2025-03-10",
    status: "approved",
    deadline: "2025-03-01",
    nextAction: "Post-award onboarding",
    documents: [
      { id: "d9", name: "Final_Proposal.pdf", type: "pdf", updatedAt: "2025-03-05" },
      { id: "d10", name: "Grant_Agreement.pdf", type: "pdf", updatedAt: "2025-03-15" },
    ],
    history: [
      { id: "h10", event: "Submitted application", at: "2025-03-10T09:20:00Z" },
      { id: "h11", event: "Decision received (Approved)", at: "2025-04-01T16:52:00Z" },
    ],
    insights: "Approval won with strong cost-benefit analysis. Use this framework for future applications.",
    compliance: [
      { label: "Bank details submitted", done: true },
      { label: "Post-award reporting schedule", done: false },
    ],
  },
];

function statusToPercent(status: ApplicationStatus) {
  switch (status) {
    case "draft":
      return 10;
    case "submitted":
      return 35;
    case "under_review":
      return 65;
    case "approved":
      return 100;
    case "rejected":
      return 100;
    default:
      return 0;
  }
}

function formatISODate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function ApplicationsTracker({
  className,
  style,
  applications = DEFAULT_APPS,
  onExportCSV,
  onCreateFromTemplate,
  onGenerateAIForm,
}: ApplicationsTrackerProps) {
  const [tab, setTab] = React.useState<string>("overview");
  const [statusFilter, setStatusFilter] = React.useState<ApplicationStatus | "all">("all");
  const [query, setQuery] = React.useState("");
  const [selectedApp, setSelectedApp] = React.useState<ApplicationRecord | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [calendarDate, setCalendarDate] = React.useState<Date | undefined>(undefined);
  const [remindersOn, setRemindersOn] = React.useState(true);
  const [exporting, setExporting] = React.useState(false);
  const [newDocName, setNewDocName] = React.useState("");
  const [aiOpen, setAiOpen] = React.useState(false);
  const [template, setTemplate] = React.useState<string | undefined>(undefined);

  const statusCounts = React.useMemo(() => {
    const counts: Record<ApplicationStatus, number> = {
      draft: 0,
      submitted: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
    };
    for (const a of applications) counts[a.status] += 1;
    return counts;
  }, [applications]);

  const filteredApps = React.useMemo(() => {
    return applications
      .filter((a) => (statusFilter === "all" ? true : a.status === statusFilter))
      .filter((a) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          a.name.toLowerCase().includes(q) ||
          a.source.toLowerCase().includes(q) ||
          a.nextAction?.toLowerCase().includes(q)
        );
      });
  }, [applications, statusFilter, query]);

  function openDetail(app: ApplicationRecord) {
    setSelectedApp(app);
    setDetailOpen(true);
  }

  async function handleExport() {
    const data = applications;
    try {
      setExporting(true);
      if (onExportCSV) {
        await Promise.resolve(onExportCSV(data));
      } else {
        // Fallback client-side CSV generation for demo purposes
        const header = [
          "ID",
          "Name",
          "Source",
          "Amount Requested",
          "Submission Date",
          "Status",
          "Deadline",
          "Next Action",
        ];
        const rows = data.map((a) => [
          a.id,
          a.name,
          a.source,
          String(a.amountRequested),
          a.submissionDate ?? "",
          a.status,
          a.deadline ?? "",
          a.nextAction ?? "",
        ]);
        const csv = [header, ...rows]
          .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
          .join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "applications_export.csv";
        anchor.style.display = "none";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
      }
      toast.success("Export complete", { description: "Your applications report has been exported." });
    } catch (e) {
      toast.error("Export failed", { description: "Please try again or contact support." });
    } finally {
      setExporting(false);
    }
  }

  function addDocument() {
    if (!selectedApp) return;
    if (!newDocName.trim()) {
      toast.message("Enter a document name");
      return;
    }
    const now = new Date().toISOString().slice(0, 10);
    const updated: ApplicationRecord = {
      ...selectedApp,
      documents: [
        ...selectedApp.documents,
        {
          id: `doc-${Math.random().toString(36).slice(2, 8)}`,
          name: newDocName.trim(),
          type: "other",
          updatedAt: now,
        },
      ],
      history: [
        ...selectedApp.history,
        { id: `his-${Math.random().toString(36).slice(2, 8)}`, event: `Added document: ${newDocName.trim()}`, at: new Date().toISOString() },
      ],
    };
    updateSelectedApp(updated);
    setNewDocName("");
    toast.success("Document added");
  }

  function updateSelectedApp(updated: ApplicationRecord) {
    setSelectedApp(updated);
    // In a real app, you'd also update parent state or persist to server
  }

  function scheduleReminder(date?: Date) {
    if (!selectedApp) return;
    if (!date) {
      toast.message("Select a date for the reminder");
      return;
    }
    toast.success("Reminder scheduled", { description: `Reminder set for ${date.toLocaleDateString()}` });
  }

  function handleTemplateCreate() {
    const t = template ?? "General Proposal Template";
    onCreateFromTemplate?.(t);
    toast.success("Template created", { description: `Started new application using "${t}"` });
  }

  function handleAIGenerate() {
    onGenerateAIForm?.();
    toast.success("AI form started", { description: "Pre-filling required sections based on your profile." });
    setAiOpen(false);
  }

  const totalRequested = applications.reduce((sum, a) => sum + a.amountRequested, 0);
  const approvedRequested = applications
    .filter((a) => a.status === "approved")
    .reduce((sum, a) => sum + a.amountRequested, 0);

  return (
    <section className={cn("w-full max-w-full bg-surface-1 rounded-lg border border-border", className)} style={style} aria-label="Applications manager">
      <div className="px-4 sm:px-6 pt-5 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-heading font-semibold tracking-tight">Applications & Proposals</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Track progress, manage documents, and optimize your success across all funding applications.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="secondary" className="bg-secondary hover:bg-secondary/80" onClick={() => setAiOpen(true)} aria-label="AI-assisted form filling">
                    <Kanban className="h-4 w-4 mr-2" />
                    AI Assist
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">AI-assisted form filling</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button size="sm" onClick={handleExport} disabled={exporting} aria-label="Export applications">
              <SaveAll className="h-4 w-4 mr-2" />
              {exporting ? "Exporting…" : "Export"}
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="px-4 sm:px-6 pb-6">
        <TabsList className="bg-secondary/60">
          <TabsTrigger value="overview" className="data-[state=active]:bg-card">
            <SquareChartGantt className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="applications" className="data-[state=active]:bg-card">
            <TableOfContents className="h-4 w-4 mr-2" />
            Applications
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-card">
            <SheetIcon className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-card">
            <Logs className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-card">
            <ListChecks className="h-4 w-4 mr-2" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {(
              [
                { key: "draft", icon: ClipboardCheck },
                { key: "submitted", icon: SheetIcon },
                { key: "under_review", icon: SquareChartGantt },
                { key: "approved", icon: FileCheck2 },
                { key: "rejected", icon: FileX2 },
              ] as { key: ApplicationStatus; icon: React.ComponentType<any> }[]
            ).map(({ key, icon: Icon }) => {
              const meta = STATUS_META[key];
              const count = statusCounts[key];
              return (
                <Card key={key} className={cn("border-border/60 bg-card/60", meta.ring)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{meta.label}</CardTitle>
                      <span className={cn("h-2.5 w-2.5 rounded-full", meta.dot)} aria-hidden />
                    </div>
                    <CardDescription className={cn("text-xs", meta.tint)}>
                      {key === "approved" ? "Completed" : "In pipeline"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4", meta.tint)} />
                      <span className="text-2xl font-semibold">{count}</span>
                    </div>
                    <Progress value={count > 0 ? statusToPercent(key) : 0} className="mt-3 h-1.5 bg-secondary" />
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="mt-6 bg-card/60 border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Funding Summary</CardTitle>
              <CardDescription className="text-sm">Overview across all applications</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-md bg-surface-2 border border-border/60 p-4">
                <div className="text-sm text-muted-foreground">Total Requested</div>
                <div className="text-xl font-semibold mt-1">{CURRENCY_FORMAT.format(totalRequested)}</div>
              </div>
              <div className="rounded-md bg-surface-2 border border-border/60 p-4">
                <div className="text-sm text-muted-foreground">Approved Amount</div>
                <div className="text-xl font-semibold mt-1">{CURRENCY_FORMAT.format(approvedRequested)}</div>
              </div>
              <div className="rounded-md bg-surface-2 border border-border/60 p-4">
                <div className="text-sm text-muted-foreground">Win Rate</div>
                <div className="text-xl font-semibold mt-1">
                  {applications.length ? Math.round((statusCounts.approved / applications.length) * 100) : 0}%
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="mt-6">
          <Card className="bg-card/60 border-border/60">
            <CardHeader className="pb-0">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by name, source, or action"
                      className="bg-surface-2 border-border/60"
                      aria-label="Search applications"
                    />
                    <Select onValueChange={(v) => setStatusFilter(v as ApplicationStatus | "all")} value={statusFilter}>
                      <SelectTrigger className="w-[160px] bg-surface-2 border-border/60">
                        <SelectValue placeholder="Filter status" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="secondary" className="bg-secondary hover:bg-secondary/80">
                          <SquareChartGantt className="h-4 w-4 mr-2" />
                          Deadlines
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-popover">
                        <Calendar
                          mode="single"
                          selected={calendarDate}
                          onSelect={setCalendarDate}
                          initialFocus
                          className="rounded-md border border-border/60 bg-card/60"
                        />
                        <div className="p-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Switch id="reminders" checked={remindersOn} onCheckedChange={setRemindersOn} />
                            <Label htmlFor="reminders" className="text-sm text-muted-foreground">
                              Email reminders
                            </Label>
                          </div>
                          <Button size="sm" onClick={() => scheduleReminder(calendarDate)}>
                            Schedule
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {filteredApps.length} of {applications.length} applications shown
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="hidden md:block">
                <div className="w-full max-w-full overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-border/60">
                        <th className="py-2 pr-3 font-medium">Application</th>
                        <th className="py-2 px-3 font-medium">Source</th>
                        <th className="py-2 px-3 font-medium">Amount</th>
                        <th className="py-2 px-3 font-medium">Submitted</th>
                        <th className="py-2 px-3 font-medium">Status</th>
                        <th className="py-2 pl-3 text-right font-medium">Next Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApps.map((a) => {
                        const meta = STATUS_META[a.status];
                        return (
                          <tr
                            key={a.id}
                            className="border-b border-border/50 hover:bg-surface-2/60 transition-colors"
                            onClick={() => openDetail(a)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") openDetail(a);
                            }}
                            aria-label={`Open details for ${a.name}`}
                          >
                            <td className="py-3 pr-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", meta.dot)} aria-hidden />
                                <div className="min-w-0">
                                  <div className="font-medium truncate">{a.name}</div>
                                  <div className="text-xs text-muted-foreground">ID: {a.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3">{a.source}</td>
                            <td className="py-3 px-3">{CURRENCY_FORMAT.format(a.amountRequested)}</td>
                            <td className="py-3 px-3">{formatISODate(a.submissionDate)}</td>
                            <td className="py-3 px-3">
                              <Badge variant="secondary" className={cn("rounded-md", meta.bg)}>
                                {meta.label}
                              </Badge>
                            </td>
                            <td className="py-3 pl-3 text-right">
                              <span className="text-muted-foreground">{a.nextAction ?? "—"}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid md:hidden grid-cols-1 gap-3">
                {filteredApps.map((a) => {
                  const meta = STATUS_META[a.status];
                  return (
                    <div
                      key={a.id}
                      className={cn(
                        "rounded-lg border border-border/60 bg-surface-2 p-4 shadow-sm hover:shadow transition-shadow",
                        meta.ring
                      )}
                      onClick={() => openDetail(a)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") openDetail(a);
                      }}
                      aria-label={`Open details for ${a.name}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn("h-2.5 w-2.5 rounded-full", meta.dot)} />
                            <h3 className="font-medium truncate">{a.name}</h3>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{a.source}</p>
                        </div>
                        <Badge variant="secondary" className={meta.bg}>
                          {meta.label}
                        </Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>Amount</div>
                        <div className="text-right text-foreground">{CURRENCY_FORMAT.format(a.amountRequested)}</div>
                        <div>Submitted</div>
                        <div className="text-right">{formatISODate(a.submissionDate)}</div>
                        <div>Next</div>
                        <div className="text-right">{a.nextAction ?? "—"}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <Card className="bg-card/60 border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Document Templates</CardTitle>
              <CardDescription>Use templates and AI to accelerate new applications.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {["USDA Narrative v2", "NSF Project Description", "Budget Justification"].map((t) => (
                  <div key={t} className="rounded-md border border-border/60 bg-surface-2 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{t}</div>
                        <div className="text-xs text-muted-foreground">Last updated recently</div>
                      </div>
                      <FileCheck2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" onClick={() => { setTemplate(t); handleTemplateCreate(); }}>
                        Use Template
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-secondary hover:bg-secondary/80"
                        onClick={() => {
                          setTemplate(t);
                          setAiOpen(true);
                        }}
                      >
                        <Kanban className="h-4 w-4 mr-2" />
                        AI Fill
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card className="bg-card/60 border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Success Analytics</CardTitle>
              <CardDescription>Insights and recommendations to improve win rates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-md border border-border/60 bg-surface-2 p-4">
                  <div className="text-sm text-muted-foreground">Average review time</div>
                  <div className="text-xl font-semibold mt-1">23 days</div>
                </div>
                <div className="rounded-md border border-border/60 bg-surface-2 p-4">
                  <div className="text-sm text-muted-foreground">Top funding source</div>
                  <div className="text-xl font-semibold mt-1">Private Foundation A</div>
                </div>
                <div className="rounded-md border border-border/60 bg-surface-2 p-4">
                  <div className="text-sm text-muted-foreground">Approval ratio (last 6 mo)</div>
                  <div className="text-xl font-semibold mt-1">
                    {applications.length ? Math.round((statusCounts.approved / applications.length) * 100) : 0}%
                  </div>
                </div>
              </div>

              <Separator className="bg-border/60" />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">Recommendations</h4>
                </div>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
                  <li>Strengthen methodology sections with measurable KPIs to improve reviewer confidence.</li>
                  <li>Leverage prior approved budget narratives as reusable modules for similar calls.</li>
                  <li>Submit at least 5 business days before deadlines to allow AI review and refinement.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card className="bg-card/60 border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Compliance & Checklists</CardTitle>
              <CardDescription>Track compliance items across applications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {applications.slice(0, 3).map((a) => (
                <div key={a.id} className="rounded-md border border-border/60 bg-surface-2 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{a.name}</div>
                      <div className="text-xs text-muted-foreground">{a.source}</div>
                    </div>
                    <Badge variant="secondary" className={STATUS_META[a.status].bg}>
                      {STATUS_META[a.status].label}
                    </Badge>
                  </div>
                  <div className="mt-3 space-y-2">
                    {(a.compliance ?? []).length === 0 ? (
                      <div className="text-sm text-muted-foreground">No compliance items.</div>
                    ) : (
                      (a.compliance ?? []).map((c, idx) => (
                        <label key={idx} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={c.done}
                            onChange={() => {
                              const updated = { ...a, compliance: (a.compliance ?? []).map((x, i) => (i === idx ? { ...x, done: !x.done } : x)) };
                              if (selectedApp && selectedApp.id === a.id) setSelectedApp(updated);
                              toast.message(c.done ? "Marked incomplete" : "Marked complete");
                            }}
                            className="accent-primary"
                            aria-label={c.label}
                          />
                          <span className={cn("break-words", c.done ? "line-through text-muted-foreground" : "text-foreground")}>
                            {c.label}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl bg-popover">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <SquareChartGantt className="h-5 w-5 text-primary" />
              {selectedApp?.name ?? "Application"}
            </SheetTitle>
            {selectedApp && (
              <SheetDescription className="flex items-center gap-2">
                <Badge variant="secondary" className={STATUS_META[selectedApp.status].bg}>
                  {STATUS_META[selectedApp.status].label}
                </Badge>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{selectedApp.source}</span>
              </SheetDescription>
            )}
          </SheetHeader>
          <div className="mt-4 space-y-6">
            {selectedApp && (
              <>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-md border border-border/60 bg-surface-2 p-3">
                    <div className="text-muted-foreground">Amount</div>
                    <div className="font-medium">{CURRENCY_FORMAT.format(selectedApp.amountRequested)}</div>
                  </div>
                  <div className="rounded-md border border-border/60 bg-surface-2 p-3">
                    <div className="text-muted-foreground">Submission</div>
                    <div className="font-medium">{formatISODate(selectedApp.submissionDate)}</div>
                  </div>
                  <div className="col-span-2 rounded-md border border-border/60 bg-surface-2 p-3">
                    <div className="text-muted-foreground">Next action</div>
                    <div className="font-medium break-words">{selectedApp.nextAction ?? "—"}</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 text-primary" />
                    Documents
                  </h4>
                  <div className="space-y-2">
                    {(selectedApp.documents ?? []).length === 0 ? (
                      <div className="text-sm text-muted-foreground">No documents yet.</div>
                    ) : (
                      selectedApp.documents.map((d) => (
                        <div key={d.id} className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-surface-2 p-3">
                          <div className="min-w-0">
                            <div className="font-medium truncate">{d.name}</div>
                            <div className="text-xs text-muted-foreground">Updated {formatISODate(d.updatedAt)}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="bg-secondary hover:bg-secondary/80"
                              onClick={() => toast.message("Preview not implemented in demo")}
                            >
                              Preview
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = {
                                  ...selectedApp,
                                  documents: selectedApp.documents.filter((x) => x.id !== d.id),
                                  history: [
                                    ...selectedApp.history,
                                    { id: `his-${Math.random().toString(36).slice(2, 8)}`, event: `Removed document: ${d.name}`, at: new Date().toISOString() },
                                  ],
                                };
                                updateSelectedApp(updated);
                                toast.success("Document removed");
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <Input
                        value={newDocName}
                        onChange={(e) => setNewDocName(e.target.value)}
                        placeholder="New document name"
                        className="bg-surface-2 border-border/60"
                        aria-label="New document name"
                      />
                      <Button size="sm" onClick={addDocument}>
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Logs className="h-4 w-4 text-primary" />
                    Submission History
                  </h4>
                  <div className="rounded-md border border-border/60 bg-surface-2 divide-y divide-border/60">
                    {(selectedApp.history ?? []).length === 0 ? (
                      <div className="p-3 text-sm text-muted-foreground">No history yet.</div>
                    ) : (
                      selectedApp.history
                        .slice()
                        .reverse()
                        .map((h) => (
                          <div key={h.id} className="p-3 text-sm">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0 break-words">{h.event}</div>
                              <div className="text-xs text-muted-foreground shrink-0">{formatISODate(h.at)}</div>
                            </div>
                            {h.by && <div className="text-xs text-muted-foreground mt-0.5">by {h.by}</div>}
                          </div>
                        ))
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Kanban className="h-4 w-4 text-primary" />
                    AI Insights
                  </h4>
                  <div className="rounded-md border border-border/60 bg-surface-2 p-3 text-sm text-muted-foreground">
                    {selectedApp.insights ?? "AI has no insights for this application yet."}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-primary" />
                    Compliance
                  </h4>
                  <div className="space-y-2">
                    {(selectedApp.compliance ?? []).length === 0 ? (
                      <div className="text-sm text-muted-foreground">No compliance items.</div>
                    ) : (
                      (selectedApp.compliance ?? []).map((c, idx) => (
                        <label key={idx} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={c.done}
                            onChange={() => {
                              const updated = { ...selectedApp, compliance: (selectedApp.compliance ?? []).map((x, i) => (i === idx ? { ...x, done: !x.done } : x)) };
                              updateSelectedApp(updated);
                            }}
                            className="accent-primary"
                            aria-label={c.label}
                          />
                          <span className={cn("break-words", c.done ? "line-through text-muted-foreground" : "text-foreground")}>
                            {c.label}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Deadline: {formatISODate(selectedApp.deadline)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button size="sm" variant="secondary" className="bg-secondary hover:bg-secondary/80">
                          Set Reminder
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-popover">
                        <Calendar
                          mode="single"
                          selected={calendarDate}
                          onSelect={setCalendarDate}
                          initialFocus
                          className="rounded-md border border-border/60 bg-card/60"
                        />
                        <div className="p-3 flex items-center justify-end">
                          <Button size="sm" onClick={() => scheduleReminder(calendarDate)}>
                            Save
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button
                      size="sm"
                      onClick={() => {
                        toast.success("Report generated", { description: "Application report is ready to download." });
                      }}
                    >
                      <SaveAll className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="bg-popover">
          <DialogHeader>
            <DialogTitle>AI-assisted Form Filling</DialogTitle>
            <DialogDescription>
              BoostFund AI will pre-fill forms using your organization profile and the selected template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="ai-template">Template</Label>
              <Select value={template} onValueChange={setTemplate}>
                <SelectTrigger id="ai-template" className="mt-1 bg-surface-2 border-border/60">
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="USDA Narrative v2">USDA Narrative v2</SelectItem>
                  <SelectItem value="NSF Project Description">NSF Project Description</SelectItem>
                  <SelectItem value="Budget Justification">Budget Justification</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ai-notes">Notes for AI (optional)</Label>
              <Textarea
                id="ai-notes"
                placeholder="Provide context, priorities, or past feedback to guide the AI…"
                className="mt-1 bg-surface-2 border-border/60"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="secondary" className="bg-secondary hover:bg-secondary/80" onClick={() => setAiOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAIGenerate}>
              <Kanban className="h-4 w-4 mr-2" />
              Start Filling
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}