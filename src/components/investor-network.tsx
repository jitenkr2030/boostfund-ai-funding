"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Users,
  UserSearch,
  Presentation,
  Contact,
  Linkedin,
  Share2,
  ScreenShare,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

type InvestorType = "vc" | "angel" | "strategic";
type Stage =
  | "pre-seed"
  | "seed"
  | "series-a"
  | "series-b"
  | "growth"
  | "private-equity";
type Geography = "na" | "eu" | "asia" | "latam" | "africa" | "global";

interface Investor {
  id: string;
  name: string;
  type: InvestorType;
  stages: Stage[];
  industries: string[];
  geo: Geography[];
  fundingMin: number;
  fundingMax: number;
  portfolio: string[];
  email?: string;
  linkedin?: string;
  matchScore: number; // 0-100
}

interface EventItem {
  id: string;
  title: string;
  date: string; // ISO
  location: string;
  type: "pitch-competition" | "meetup" | "conference";
  industries: string[];
  aiRecommended?: boolean;
  image?: string; // Unsplash
}

interface OutreachFeedback {
  id: string;
  investorId: string;
  note: string;
  sentiment: "positive" | "neutral" | "negative";
  date: string;
}

interface StartupProfile {
  name: string;
  tagline: string;
  stage?: Stage;
  industry?: string;
  region?: Geography;
  fundingNeed?: string;
  summary: string;
  website?: string;
}

export interface InvestorNetworkProps {
  className?: string;
  style?: React.CSSProperties;
  initialProfile?: Partial<StartupProfile>;
}

const currencyFormat = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const sampleInvestors: Investor[] = [
  {
    id: "inv_1",
    name: "GreenWave Ventures",
    type: "vc",
    stages: ["seed", "series-a"],
    industries: ["ClimateTech", "SaaS"],
    geo: ["na", "eu"],
    fundingMin: 250000,
    fundingMax: 5000000,
    portfolio: ["EcoGrid", "TerraFlow", "Airspan"],
    email: "partners@greenwave.vc",
    linkedin: "",
    matchScore: 92,
  },
  {
    id: "inv_2",
    name: "Nova Angels",
    type: "angel",
    stages: ["pre-seed", "seed"],
    industries: ["AI", "Fintech", "Developer Tools"],
    geo: ["global"],
    fundingMin: 25000,
    fundingMax: 250000,
    portfolio: ["CodeLift", "QubitPay", "SynthAI"],
    email: "intro@novaangels.com",
    linkedin: "",
    matchScore: 84,
  },
  {
    id: "inv_3",
    name: "Orion Strategic Capital",
    type: "strategic",
    stages: ["series-a", "series-b", "growth"],
    industries: ["Healthcare", "BioTech"],
    geo: ["na", "eu", "asia"],
    fundingMin: 2000000,
    fundingMax: 20000000,
    portfolio: ["BioPrime", "CareLoop"],
    email: "bd@orioncap.com",
    linkedin: "",
    matchScore: 77,
  },
  {
    id: "inv_4",
    name: "Latitude Ventures",
    type: "vc",
    stages: ["seed", "series-a", "series-b"],
    industries: ["Fintech", "SaaS"],
    geo: ["na", "latam"],
    fundingMin: 500000,
    fundingMax: 10000000,
    portfolio: ["Mintly", "LedgerIQ", "PayBeam"],
    email: "hello@latitude.vc",
    linkedin: "",
    matchScore: 71,
  },
];

const sampleEvents: EventItem[] = [
  {
    id: "evt_1",
    title: "SaaS Founders Pitch Night",
    date: "2025-10-14T18:00:00Z",
    location: "San Francisco, CA",
    type: "pitch-competition",
    industries: ["SaaS"],
    aiRecommended: true,
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "evt_2",
    title: "ClimateTech Investor Meetup",
    date: "2025-11-05T17:00:00Z",
    location: "Berlin, Germany",
    type: "meetup",
    industries: ["ClimateTech"],
    aiRecommended: true,
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "evt_3",
    title: "AI Innovators Summit",
    date: "2025-12-02T09:00:00Z",
    location: "New York, NY",
    type: "conference",
    industries: ["AI", "Developer Tools"],
    image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1200&auto=format&fit=crop",
  },
];

const sampleFeedback: OutreachFeedback[] = [
  {
    id: "fb_1",
    investorId: "inv_1",
    note: "Interested in learning more. Requested metrics on retention and unit economics.",
    sentiment: "positive",
    date: "2025-08-10",
  },
  {
    id: "fb_2",
    investorId: "inv_4",
    note: "Stage is a bit early; suggested to reconnect post next milestone.",
    sentiment: "neutral",
    date: "2025-08-18",
  },
];

export default function InvestorNetwork({
  className,
  style,
  initialProfile,
}: InvestorNetworkProps) {
  const [query, setQuery] = React.useState("");
  const [type, setType] = React.useState<InvestorType | undefined>(undefined);
  const [stage, setStage] = React.useState<Stage | undefined>(undefined);
  const [geo, setGeo] = React.useState<Geography | undefined>(undefined);
  const [industry, setIndustry] = React.useState<string | undefined>(undefined);

  const [profile, setProfile] = React.useState<StartupProfile>({
    name: initialProfile?.name ?? "",
    tagline: initialProfile?.tagline ?? "",
    stage: initialProfile?.stage,
    industry: initialProfile?.industry,
    region: initialProfile?.region,
    fundingNeed: initialProfile?.fundingNeed ?? "",
    summary: initialProfile?.summary ?? "",
    website: initialProfile?.website ?? "",
  });

  const [messageOpen, setMessageOpen] = React.useState<string | null>(null);
  const [meetingOpen, setMeetingOpen] = React.useState<string | null>(null);
  const [pitchOpen, setPitchOpen] = React.useState<boolean>(false);

  const filtered = React.useMemo(() => {
    return sampleInvestors
      .filter((inv) =>
        !query
          ? true
          : inv.name.toLowerCase().includes(query.toLowerCase()) ||
            inv.industries.some((i) =>
              i.toLowerCase().includes(query.toLowerCase())
            ) ||
            inv.portfolio.some((p) =>
              p.toLowerCase().includes(query.toLowerCase())
            )
      )
      .filter((inv) => (type ? inv.type === type : true))
      .filter((inv) => (stage ? inv.stages.includes(stage) : true))
      .filter((inv) => (geo ? inv.geo.includes(geo) : true))
      .filter((inv) =>
        industry ? inv.industries.map((i) => i.toLowerCase()).includes(industry.toLowerCase()) : true
      )
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [query, type, stage, geo, industry]);

  const totalOutreach = 18;
  const positive = 7;
  const pending = 6;
  const negative = totalOutreach - positive - pending;

  function handleAIMatch() {
    toast.message("AI Match updated", {
      description:
        "We refined investor matches using your stage, industry and funding need.",
    });
  }

  function handleSaveProfile() {
    toast.success("Profile saved", {
      description: "Your startup profile is now visible to potential investors.",
    });
  }

  function handleSendMessage(investorId: string) {
    setMessageOpen(null);
    toast.success("Message sent", { description: "We’ll notify you on replies." });
  }

  function handleScheduleMeeting(investorId: string) {
    setMeetingOpen(null);
    toast.message("Meeting request sent", {
      description: "We’ll add it to your calendar once confirmed.",
    });
  }

  function handleSubmitPitch() {
    setPitchOpen(false);
    toast.success("Pitch submitted", {
      description: "We’ll track responses and notify you of feedback.",
    });
  }

  return (
    <section
      className={cn(
        "w-full max-w-full bg-surface-1 rounded-lg border border-border",
        "p-4 sm:p-6 md:p-8",
        className
      )}
      style={style}
      aria-label="Investor Network"
    >
      <header className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 text-foreground">
          <UserSearch className="size-5 text-primary" aria-hidden="true" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-semibold tracking-tight">
            Investor Network
          </h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground max-w-prose">
          Discover and connect with aligned investors. Use AI-powered matching, advanced filters,
          and manage outreach, meetings, pitches, and feedback.
        </p>
      </header>

      <Tabs defaultValue="investors" className="w-full">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="bg-secondary/60">
            <TabsTrigger value="investors" className="gap-2">
              <Users className="size-4" aria-hidden="true" />
              Investors
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <ScreenShare className="size-4" aria-hidden="true" />
              Events
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <Share2 className="size-4" aria-hidden="true" />
              Public Profile
            </TabsTrigger>
            <TabsTrigger value="outreach" className="gap-2">
              <Presentation className="size-4" aria-hidden="true" />
              Outreach
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" className="gap-2" onClick={handleAIMatch}>
                    <Terminal className="size-4" aria-hidden="true" />
                    AI Match
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-popover border-border">
                  Refresh recommendations using your startup profile
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Dialog open={pitchOpen} onOpenChange={setPitchOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Presentation className="size-4" aria-hidden="true" />
                  Submit Pitch
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Submit Pitch</DialogTitle>
                  <DialogDescription>
                    Share your deck and details to reach aligned investors.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="pitch-title">Pitch Title</Label>
                    <Input id="pitch-title" placeholder="e.g., BoostFund AI - Seed Round" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="pitch-summary">Summary</Label>
                    <Textarea id="pitch-summary" placeholder="Brief overview of your company and round..." />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="round">Round</Label>
                      <Select>
                        <SelectTrigger id="round" aria-label="Funding round">
                          <SelectValue placeholder="Select round" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                          <SelectItem value="seed">Seed</SelectItem>
                          <SelectItem value="series-a">Series A</SelectItem>
                          <SelectItem value="series-b">Series B</SelectItem>
                          <SelectItem value="growth">Growth</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Target Amount (USD)</Label>
                      <Input id="amount" type="number" placeholder="1000000" inputMode="numeric" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="deck">Pitch Deck (URL)</Label>
                    <Input id="deck" type="url" placeholder="https://..." />
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="secondary" onClick={() => setPitchOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitPitch}>Submit</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Separator className="my-4 bg-border" />

        <TabsContent value="investors" className="mt-0">
          <Card className="bg-card border-border">
            <CardHeader className="gap-4">
              <CardTitle className="text-lg">Find Investors</CardTitle>
              <CardDescription>
                Use filters to narrow down by type, stage, geography and industry.
              </CardDescription>
              <div className="grid gap-3 md:grid-cols-5">
                <div className="md:col-span-2">
                  <Label htmlFor="search" className="sr-only">
                    Search investors
                  </Label>
                  <div className="relative">
                    <Input
                      id="search"
                      placeholder="Search by name, industry, or portfolio..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="pl-9"
                    />
                    <UserSearch className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Investor Type</Label>
                  <Select onValueChange={(v: InvestorType) => setType(v)} value={type}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vc">VC</SelectItem>
                      <SelectItem value="angel">Angel</SelectItem>
                      <SelectItem value="strategic">Strategic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stage">Investment Stage</Label>
                  <Select onValueChange={(v: Stage) => setStage(v)} value={stage}>
                    <SelectTrigger id="stage">
                      <SelectValue placeholder="Any stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                      <SelectItem value="seed">Seed</SelectItem>
                      <SelectItem value="series-a">Series A</SelectItem>
                      <SelectItem value="series-b">Series B</SelectItem>
                      <SelectItem value="growth">Growth</SelectItem>
                      <SelectItem value="private-equity">Private Equity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="geo">Geography</Label>
                  <Select onValueChange={(v: Geography) => setGeo(v)} value={geo}>
                    <SelectTrigger id="geo">
                      <SelectValue placeholder="Anywhere" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="na">North America</SelectItem>
                      <SelectItem value="eu">Europe</SelectItem>
                      <SelectItem value="asia">Asia</SelectItem>
                      <SelectItem value="latam">LATAM</SelectItem>
                      <SelectItem value="africa">Africa</SelectItem>
                      <SelectItem value="global">Global</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select onValueChange={(v: string) => setIndustry(v)} value={industry}>
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Any industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SaaS">SaaS</SelectItem>
                      <SelectItem value="Fintech">Fintech</SelectItem>
                      <SelectItem value="AI">AI</SelectItem>
                      <SelectItem value="ClimateTech">ClimateTech</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="BioTech">BioTech</SelectItem>
                      <SelectItem value="Developer Tools">Developer Tools</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {filtered.length === 0 ? (
                <div className="text-sm text-muted-foreground py-8 text-center">
                  No investors match your filters. Try broadening your search.
                </div>
              ) : (
                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((inv) => (
                    <li key={inv.id} className="min-w-0">
                      <Card className="bg-surface-2 border-border h-full flex flex-col">
                        <CardHeader className="space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar className="size-10 ring-1 ring-border">
                                <AvatarFallback className="bg-secondary text-foreground">
                                  {inv.name
                                    .split(" ")
                                    .map((s) => s[0])
                                    .slice(0, 2)
                                    .join("")
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <h3 className="font-medium truncate">{inv.name}</h3>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Badge variant="secondary" className="bg-secondary/70">
                                    {inv.type.toUpperCase()}
                                  </Badge>
                                  <span className="truncate">
                                    {inv.stages.map(capitalizeStage).join(" • ")}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="shrink-0">
                              <span
                                aria-label="Match score"
                                className="inline-flex items-center rounded-full bg-primary/10 text-primary text-xs font-medium px-2.5 py-1"
                                title="AI Match Score"
                              >
                                {inv.matchScore}% match
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {inv.industries.map((i) => (
                              <Badge key={i} variant="outline" className="border-border text-foreground">
                                {i}
                              </Badge>
                            ))}
                          </div>
                        </CardHeader>

                        <CardContent className="grid gap-3 text-sm">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-secondary/50 rounded-md p-3">
                              <p className="text-xs text-muted-foreground">Funding Range</p>
                              <p className="font-medium">
                                {currencyFormat(inv.fundingMin)} – {currencyFormat(inv.fundingMax)}
                              </p>
                            </div>
                            <div className="bg-secondary/50 rounded-md p-3">
                              <p className="text-xs text-muted-foreground">Geography</p>
                              <p className="font-medium truncate">{inv.geo.map(capitalizeGeo).join(", ")}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Portfolio</p>
                            <div className="flex flex-wrap gap-1.5">
                              {inv.portfolio.map((p) => (
                                <Badge key={p} variant="secondary" className="bg-secondary/70">
                                  {p}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>

                        <CardFooter className="mt-auto pt-2">
                          <div className="flex flex-wrap items-center gap-2 w-full">
                            <Dialog open={messageOpen === inv.id} onOpenChange={(o) => setMessageOpen(o ? inv.id : null)}>
                              <DialogTrigger asChild>
                                <Button size="sm" className="gap-2">
                                  <Contact className="size-4" aria-hidden="true" />
                                  Message
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-card border-border">
                                <DialogHeader>
                                  <DialogTitle>Message {inv.name}</DialogTitle>
                                  <DialogDescription>
                                    Introduce your startup and request a conversation.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-3">
                                  <div className="grid gap-2">
                                    <Label htmlFor={`subject-${inv.id}`}>Subject</Label>
                                    <Input id={`subject-${inv.id}`} placeholder="Intro: BoostFund AI - Seed round" />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor={`message-${inv.id}`}>Message</Label>
                                    <Textarea
                                      id={`message-${inv.id}`}
                                      placeholder="Keep it concise — who you are, what you do, traction, and the ask."
                                    />
                                  </div>
                                </div>
                                <DialogFooter className="gap-2">
                                  <Button variant="secondary" onClick={() => setMessageOpen(null)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={() => handleSendMessage(inv.id)}>Send</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <Dialog open={meetingOpen === inv.id} onOpenChange={(o) => setMeetingOpen(o ? inv.id : null)}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="secondary" className="gap-2">
                                  <ScreenShare className="size-4" aria-hidden="true" />
                                  Schedule
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-card border-border">
                                <DialogHeader>
                                  <DialogTitle>Request a Meeting</DialogTitle>
                                  <DialogDescription>
                                    Propose times for a 30-minute intro call.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-3">
                                  <div className="grid sm:grid-cols-2 gap-3">
                                    <div className="grid gap-2">
                                      <Label htmlFor={`date-${inv.id}`}>Preferred Date</Label>
                                      <Input id={`date-${inv.id}`} type="date" />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor={`time-${inv.id}`}>Time</Label>
                                      <Input id={`time-${inv.id}`} type="time" />
                                    </div>
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor={`duration-${inv.id}`}>Duration</Label>
                                    <Select>
                                      <SelectTrigger id={`duration-${inv.id}`}>
                                        <SelectValue placeholder="30 minutes" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="15m">15 minutes</SelectItem>
                                        <SelectItem value="30m">30 minutes</SelectItem>
                                        <SelectItem value="45m">45 minutes</SelectItem>
                                        <SelectItem value="60m">60 minutes</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor={`notes-${inv.id}`}>Notes (optional)</Label>
                                    <Textarea id={`notes-${inv.id}`} placeholder="Add agenda or context..." />
                                  </div>
                                </div>
                                <DialogFooter className="gap-2">
                                  <Button variant="secondary" onClick={() => setMeetingOpen(null)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={() => handleScheduleMeeting(inv.id)}>Send Request</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            {inv.email ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="ml-auto"
                                asChild
                              >
                                <a
                                  href={`mailto:${inv.email}`}
                                  aria-label={`Email ${inv.name}`}
                                  className="inline-flex items-center gap-2"
                                >
                                  <Linkedin className="size-4" aria-hidden="true" />
                                  Contact
                                </a>
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" className="ml-auto" disabled>
                                <Linkedin className="size-4" aria-hidden="true" />
                                Contact
                              </Button>
                            )}
                          </div>
                        </CardFooter>
                      </Card>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="mt-0">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">Networking & Pitch Events</CardTitle>
                  <CardDescription>AI-recommended opportunities to showcase your startup.</CardDescription>
                </div>
                <Button variant="secondary" className="gap-2" onClick={() => toast.message("Event recommendations refreshed")}>
                  <Terminal className="size-4" aria-hidden="true" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {sampleEvents.map((evt) => (
                  <li key={evt.id} className="min-w-0">
                    <Card className="bg-surface-2 border-border overflow-hidden h-full flex flex-col">
                      {evt.image ? (
                        <div className="relative aspect-[16/9] w-full overflow-hidden">
                          <img
                            src={evt.image}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {evt.aiRecommended ? (
                            <div className="absolute left-2 top-2">
                              <Badge className="bg-primary text-primary-foreground">AI Recommended</Badge>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                      <CardHeader className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-medium leading-tight min-w-0 truncate">{evt.title}</h3>
                          <Badge variant="outline" className="border-border text-foreground">
                            {formatEventType(evt.type)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(evt.date)} • {evt.location}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {evt.industries.map((i) => (
                            <Badge key={i} variant="secondary" className="bg-secondary/70">
                              {i}
                            </Badge>
                          ))}
                        </div>
                      </CardHeader>
                      <CardFooter className="mt-auto pt-2">
                        <div className="flex items-center gap-2 w-full">
                          <Button size="sm" className="gap-2">
                            <Presentation className="size-4" aria-hidden="true" />
                            Apply to Pitch
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="gap-2"
                            onClick={() => toast.success("Saved to calendar")}
                          >
                            <ScreenShare className="size-4" aria-hidden="true" />
                            Save
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="mt-0">
          <Card className="bg-card border-border">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">Public Startup Profile</CardTitle>
                  <CardDescription>Help investors quickly understand your company.</CardDescription>
                </div>
                <Button variant="outline" className="gap-2" onClick={() => toast.message("Profile link copied")}>
                  <Share2 className="size-4" aria-hidden="true" />
                  Share
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="pf-name">Company Name</Label>
                  <Input
                    id="pf-name"
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Your company name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pf-tagline">Tagline</Label>
                  <Input
                    id="pf-tagline"
                    value={profile.tagline}
                    onChange={(e) => setProfile((p) => ({ ...p, tagline: e.target.value }))}
                    placeholder="One compelling sentence"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="pf-stage">Stage</Label>
                  <Select
                    value={profile.stage}
                    onValueChange={(v: Stage) => setProfile((p) => ({ ...p, stage: v }))}
                  >
                    <SelectTrigger id="pf-stage">
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                      <SelectItem value="seed">Seed</SelectItem>
                      <SelectItem value="series-a">Series A</SelectItem>
                      <SelectItem value="series-b">Series B</SelectItem>
                      <SelectItem value="growth">Growth</SelectItem>
                      <SelectItem value="private-equity">Private Equity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pf-industry">Industry</Label>
                  <Select
                    value={profile.industry}
                    onValueChange={(v: string) => setProfile((p) => ({ ...p, industry: v }))}
                  >
                    <SelectTrigger id="pf-industry">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SaaS">SaaS</SelectItem>
                      <SelectItem value="Fintech">Fintech</SelectItem>
                      <SelectItem value="AI">AI</SelectItem>
                      <SelectItem value="ClimateTech">ClimateTech</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="BioTech">BioTech</SelectItem>
                      <SelectItem value="Developer Tools">Developer Tools</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pf-region">Region</Label>
                  <Select
                    value={profile.region}
                    onValueChange={(v: Geography) => setProfile((p) => ({ ...p, region: v }))}
                  >
                    <SelectTrigger id="pf-region">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="na">North America</SelectItem>
                      <SelectItem value="eu">Europe</SelectItem>
                      <SelectItem value="asia">Asia</SelectItem>
                      <SelectItem value="latam">LATAM</SelectItem>
                      <SelectItem value="africa">Africa</SelectItem>
                      <SelectItem value="global">Global</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="pf-funding">Funding Requirement</Label>
                  <Input
                    id="pf-funding"
                    value={profile.fundingNeed}
                    onChange={(e) => setProfile((p) => ({ ...p, fundingNeed: e.target.value }))}
                    placeholder="e.g., Raising $1.5M to accelerate growth"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pf-website">Website</Label>
                  <Input
                    id="pf-website"
                    type="url"
                    value={profile.website}
                    onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))}
                    placeholder="https://yourdomain.com"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pf-summary">Summary</Label>
                <Textarea
                  id="pf-summary"
                  value={profile.summary}
                  onChange={(e) => setProfile((p) => ({ ...p, summary: e.target.value }))}
                  placeholder="What you do, why now, traction, and the opportunity..."
                  className="min-h-28"
                />
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Your profile is discoverable in AI matches for investors.
              </div>
              <Button className="gap-2" onClick={handleSaveProfile}>
                Save Profile
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="outreach" className="mt-0">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="bg-card border-border lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Pitch Feedback</CardTitle>
                <CardDescription>Centralized notes and sentiment on investor responses.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <ul className="divide-y divide-border">
                    {sampleFeedback.map((f) => {
                      const inv = sampleInvestors.find((i) => i.id === f.investorId);
                      return (
                        <li key={f.id} className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium">{inv?.name ?? "Investor"}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(f.date)}</p>
                            </div>
                            <Badge
                              className={cn(
                                "shrink-0",
                                f.sentiment === "positive" && "bg-success/20 text-foreground",
                                f.sentiment === "neutral" && "bg-secondary/60",
                                f.sentiment === "negative" && "bg-danger/20"
                              )}
                              variant="secondary"
                            >
                              {capitalize(f.sentiment)}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm leading-relaxed">{f.note}</p>
                        </li>
                      );
                    })}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Success Tracking</CardTitle>
                <CardDescription>Monitor outreach performance at a glance.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-3 gap-3">
                  <Stat label="Outreach" value={totalOutreach.toString()} />
                  <Stat label="Positive" value={positive.toString()} />
                  <Stat label="Pending" value={pending.toString()} />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Positive Rate</span>
                    <span className="font-medium">
                      {Math.round((positive / totalOutreach) * 100)}%
                    </span>
                  </div>
                  <Progress value={(positive / totalOutreach) * 100} color="var(--success)" />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Pending</span>
                    <span className="font-medium">
                      {Math.round((pending / totalOutreach) * 100)}%
                    </span>
                  </div>
                  <Progress value={(pending / totalOutreach) * 100} color="var(--chart-4)" />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Negative</span>
                    <span className="font-medium">
                      {Math.round((negative / totalOutreach) * 100)}%
                    </span>
                  </div>
                  <Progress value={(negative / totalOutreach) * 100} color="var(--danger)" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface-2 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function Progress({ value, color }: { value: number; color?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full h-2 rounded-full bg-secondary/60 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${clamped}%`, backgroundColor: color ?? "var(--primary)" }}
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        role="progressbar"
      />
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function capitalizeStage(s: Stage) {
  switch (s) {
    case "pre-seed":
      return "Pre-Seed";
    case "seed":
      return "Seed";
    case "series-a":
      return "Series A";
    case "series-b":
      return "Series B";
    case "growth":
      return "Growth";
    case "private-equity":
      return "Private Equity";
    default:
      return s;
  }
}

function capitalizeGeo(g: Geography) {
  switch (g) {
    case "na":
      return "North America";
    case "eu":
      return "Europe";
    case "asia":
      return "Asia";
    case "latam":
      return "LATAM";
    case "africa":
      return "Africa";
    case "global":
      return "Global";
    default:
      return g;
  }
}

function formatEventType(t: EventItem["type"]) {
  switch (t) {
    case "pitch-competition":
      return "Pitch";
    case "meetup":
      return "Meetup";
    case "conference":
      return "Conference";
    default:
      return t;
  }
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}