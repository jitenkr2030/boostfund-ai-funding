"use client";

import React, { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { BotMessageSquare, LineChart, FileScan, Scale, Languages, ShieldCheck, Rocket, Video, Mic, FolderLock, Sparkles } from "lucide-react"

// Minimal, self-contained UI stubs for the 10 Next-Gen features
// Tailwind only; no styled-jsx

export default function NextGenFeatures() {
  return (
    <section className="space-y-6">
      <Header />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card title="AI Pitch Coach (Voice + Video)" icon={<BotMessageSquare className="h-4 w-4 text-primary" />}>
          <PitchCoach />
        </Card>

        <Card title="Funding Probability Predictor" icon={<LineChart className="h-4 w-4 text-primary" />}>
          <FundingPredictor />
        </Card>

        <Card title="Tokenized Crowdfunding (Web3)" icon={<Rocket className="h-4 w-4 text-primary" />}>
          <Web3Crowdfunding />
        </Card>

        <Card title="Investor Sentiment Analysis" icon={<Sparkles className="h-4 w-4 text-primary" />}>
          <SentimentAnalysis />
        </Card>

        <Card title="Document Intelligence & Compliance" icon={<FileScan className="h-4 w-4 text-primary" />}>
          <DocIntelligence />
        </Card>

        <Card title="Smart Negotiation Assistant" icon={<Scale className="h-4 w-4 text-primary" />}>
          <NegotiationAssistant />
        </Card>

        <Card title="Multi-Language Investor Outreach" icon={<Languages className="h-4 w-4 text-primary" />}>
          <MultiLanguageOutreach />
        </Card>

        <Card title="AI Deal Room" icon={<FolderLock className="h-4 w-4 text-primary" />}>
          <DealRoom />
        </Card>

        <Card title="Success Stories & Learning Hub" icon={<ShieldCheck className="h-4 w-4 text-primary" />}>
          <LearningHub />
        </Card>

        <Card title="Smart Exit & Growth Planning" icon={<LineChart className="h-4 w-4 text-primary" />}>
          <ExitPlanning />
        </Card>
      </div>
    </section>
  )
}

function Header() {
  return (
    <div className="w-full rounded-xl border border-border bg-card p-5">
      <h2 className="text-base sm:text-lg font-semibold">Next-Gen Features</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Explore advanced AI capabilities. These previews are interactive stubs; full functionality can be connected to APIs when ready.
      </p>
    </div>
  )
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="w-full rounded-xl border border-border bg-surface-1 p-5">
      <div className="flex items-center gap-2">
        <div className="size-8 rounded-lg bg-surface-2 grid place-items-center">{icon}</div>
        <h3 className="text-sm sm:text-base font-semibold">{title}</h3>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

// 1. AI Pitch Coach (Voice + Video)
function PitchCoach() {
  const [notes, setNotes] = useState("")
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" className="gap-2" onClick={() => toast.info("Voice simulation coming soon")}> 
          <Mic className="h-4 w-4" /> Start Voice
        </Button>
        <Button variant="secondary" className="gap-2" onClick={() => toast.info("Video simulation coming soon")}> 
          <Video className="h-4 w-4" /> Start Video
        </Button>
      </div>
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Paste pitch one-liner or deck summary for quick feedback"
        className="bg-surface-2"
        rows={3}
      />
      <div className="flex items-center gap-2">
        <Button onClick={() => toast.success("Analyzing tone, clarity, confidence…")}>Get Feedback</Button>
        <Button variant="secondary" onClick={() => toast.message("Storytelling tips queued")}>Storytelling Tips</Button>
      </div>
    </div>
  )
}

// 2. Funding Probability Predictor
function FundingPredictor() {
  const [stage, setStage] = useState("Seed")
  const [amount, setAmount] = useState(250000)
  const [score, setScore] = useState<number | null>(null)

  const predict = () => {
    // simple deterministic mock using hash
    const base = stage.length * 7 + Math.min(100, Math.round(Math.log10(amount + 10) * 10))
    const pct = Math.max(5, Math.min(92, (base % 100)))
    setScore(pct)
    toast.success("Prediction ready")
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1 text-sm">
          <span className="text-muted-foreground">Stage</span>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            <option>Pre-Seed</option>
            <option>Seed</option>
            <option>Series A</option>
            <option>Series B</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-muted-foreground">Amount ($)</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value || "0"))}
            className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            min={10000}
            step={5000}
          />
        </label>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={predict}>Predict</Button>
        <Button variant="secondary" onClick={() => toast.message("Readiness checklist opened")}>Readiness Checklist</Button>
      </div>
      {typeof score === "number" && (
        <div className="mt-2 rounded-md border border-border bg-surface-2 p-3 text-sm">
          Estimated success probability: <span className="font-semibold text-primary">{score}%</span>
          <div className="mt-1 text-xs text-muted-foreground">Top-fit investors and calibration require data connection.</div>
        </div>
      )}
    </div>
  )
}

// 3. Tokenized Crowdfunding (Web3)
function Web3Crowdfunding() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Preview flows for tokenized shares/NFTs. Connect to Web3 provider later.</p>
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => toast.info("Token contract wizard coming soon")}>Create Token</Button>
        <Button variant="secondary" onClick={() => toast.message("Campaign draft created")}>Launch Campaign</Button>
      </div>
      <ul className="mt-1 text-xs text-muted-foreground list-disc pl-4 space-y-1">
        <li>Accept crypto or fiat (provider integration pending)</li>
        <li>Compliance guardrails with AI policy checks</li>
      </ul>
    </div>
  )
}

// 4. Investor Sentiment Analysis
function SentimentAnalysis() {
  const hotSectors = useMemo(() => ["AI", "EVs", "Biotech", "Climate", "Fintech"], [])
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {hotSectors.map((s) => (
          <span key={s} className="text-xs px-2 py-1 rounded-full border border-border bg-surface-2">
            {s}
          </span>
        ))}
      </div>
      <Button variant="secondary" onClick={() => toast.success("Refreshing signals from news & social (stub)")}>Refresh Insights</Button>
      <p className="text-xs text-muted-foreground">Signals simulated. Connect to providers for live heatmaps.</p>
    </div>
  )
}

// 5. Document Intelligence & Compliance
function DocIntelligence() {
  const [files, setFiles] = useState<File[]>([])
  const [focus, setFocus] = useState("General")

  const onFiles: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = Array.from(e.target.files || [])
    setFiles(f)
    toast.success(`${f.length} file${f.length === 1 ? "" : "s"} ready for scan`)
  }

  const scan = () => {
    if (!files.length) {
      toast.error("Upload at least one document")
      return
    }
    toast.success(`Scanning ${files.length} doc(s) for gaps & risks…`)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1 text-sm">
          <span className="text-muted-foreground">Focus</span>
          <select
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            <option>General</option>
            <option>Financials</option>
            <option>Legal</option>
            <option>Impact</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-muted-foreground">Upload</span>
          <input
            type="file"
            multiple
            onChange={onFiles}
            className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm"
          />
        </label>
      </div>
      <Button onClick={scan}>Scan Documents</Button>
      {!!files.length && (
        <div className="rounded-md border border-border bg-surface-2 p-3 text-xs text-muted-foreground">
          {files.map((f) => (
            <div key={f.name} className="flex items-center justify-between gap-2">
              <span className="truncate">{f.name}</span>
              <span>{(f.size / 1024).toFixed(1)} KB</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// 6. Smart Negotiation Assistant
function NegotiationAssistant() {
  const [valuation, setValuation] = useState(5000000)
  const [equity, setEquity] = useState(15)
  const [outcome, setOutcome] = useState<string | null>(null)

  const simulate = () => {
    const post = valuation * (1 - equity / 100)
    const msg = `Proposed: $${number(post)} post-money; consider ${Math.max(5, Math.min(20, Math.round(equity - 2)))}%-${Math.max(6, Math.min(25, Math.round(equity + 2)))} equity band.`
    setOutcome(msg)
    toast.message("Simulation generated")
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1 text-sm">
          <span className="text-muted-foreground">Valuation ($ pre)</span>
          <input
            type="number"
            value={valuation}
            onChange={(e) => setValuation(parseInt(e.target.value || "0"))}
            className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            min={100000}
            step={50000}
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-muted-foreground">Equity (%)</span>
          <input
            type="number"
            value={equity}
            onChange={(e) => setEquity(parseInt(e.target.value || "0"))}
            className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            min={1}
            max={50}
          />
        </label>
      </div>
      <Button onClick={simulate}>Simulate Outcomes</Button>
      {outcome && (
        <p className="text-sm mt-2"><span className="text-muted-foreground">Result:</span> {outcome}</p>
      )}
    </div>
  )
}

// 7. Multi-Language Investor Outreach
function MultiLanguageOutreach() {
  const [lang, setLang] = useState("Spanish")
  const [text, setText] = useState("")

  const translate = () => {
    if (!text.trim()) return toast.error("Enter text to translate")
    toast.success(`Translated to ${lang} (stub)`) // integrate later
  }

  return (
    <div className="space-y-3">
      <label className="grid gap-1 text-sm">
        <span className="text-muted-foreground">Target Language</span>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        >
          <option>Spanish</option>
          <option>French</option>
          <option>German</option>
          <option>Japanese</option>
          <option>Arabic</option>
        </select>
      </label>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste pitch paragraph to translate for investor outreach"
        className="bg-surface-2"
        rows={3}
      />
      <div className="flex items-center gap-2">
        <Button onClick={translate}>Translate</Button>
        <Button variant="secondary" onClick={() => toast.message("Auto-translate in chat enabled (stub)")}>Enable in Chat</Button>
      </div>
    </div>
  )
}

// 8. AI Deal Room
function DealRoom() {
  const [roomCreated, setRoomCreated] = useState(false)
  const create = () => { setRoomCreated(true); toast.success("Deal room created (stub)") }
  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border bg-surface-2 p-3 text-sm">
        <p className="font-medium">Documents</p>
        <ul className="mt-2 text-xs text-muted-foreground list-disc pl-4 space-y-1">
          <li>Pitch Deck.pdf</li>
          <li>Financials.xlsx</li>
          <li>Data Room Index.md</li>
        </ul>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={create}>Create Room</Button>
        <Button variant="secondary" onClick={() => toast.message("Shared with investor (stub)")}>Share with Investor</Button>
      </div>
      {roomCreated && (<p className="text-xs text-muted-foreground">Engagement tracking will appear here.</p>)}
    </div>
  )
}

// 9. Success Stories & Learning Hub
function LearningHub() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {[
          "AI SaaS Seed Win",
          "Climate Grant Playbook",
          "Fintech Series A Deck",
          "Gov Grant Budget Template",
        ].map((t) => (
          <div key={t} className="rounded-md border border-border bg-surface-2 p-3 text-xs">
            <p className="font-medium text-foreground">{t}</p>
            <p className="mt-1 text-muted-foreground">Template + case study</p>
          </div>
        ))}
      </div>
      <Button variant="secondary" onClick={() => toast.success("Learning hub opened (stub)")}>Open Hub</Button>
    </div>
  )
}

// 10. Smart Exit & Growth Planning
function ExitPlanning() {
  const [horizon, setHorizon] = useState(36)
  const [strategy, setStrategy] = useState("Acquisition")
  const [plan, setPlan] = useState<string | null>(null)

  const generate = () => {
    const msg = `${strategy} strategy over ${horizon} months with ROI scenarios and KPI milestones generated.`
    setPlan(msg)
    toast.message("Plan generated (stub)")
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1 text-sm">
          <span className="text-muted-foreground">Horizon (months)</span>
          <input
            type="number"
            value={horizon}
            onChange={(e) => setHorizon(parseInt(e.target.value || "0"))}
            className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            min={6}
            step={6}
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-muted-foreground">Strategy</span>
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            <option>Acquisition</option>
            <option>IPO</option>
            <option>Secondary</option>
          </select>
        </label>
      </div>
      <Button onClick={generate}>Generate Plan</Button>
      {plan && <p className="text-sm mt-2"><span className="text-muted-foreground">Result:</span> {plan}</p>}
    </div>
  )
}

function number(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 })
}