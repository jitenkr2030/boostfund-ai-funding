"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  BotMessageSquare,
  Brain,
  FileQuestionMark,
  Info,
  MessageCircle,
  MessageCirclePlus,
  MessageSquareDot,
  MessageSquarePlus,
  MessageSquareText,
  MessagesSquare,
  Speech,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Role = "user" | "assistant" | "system"

type ChatMessage = {
  id: string
  role: Role
  content: string
  createdAt: number
  attachments?: { name: string; size: number }[]
}

type QuickPrompt = {
  id: string
  label: string
  prompt: string
  icon: React.ReactNode
}

type AiChatAssistantProps = {
  className?: string
  initialMessages?: ChatMessage[]
  title?: string
  layout?: "section" | "widget"
  enableVoice?: boolean
  enableFileUpload?: boolean
  onSend?: (message: string) => void
}

const STORAGE_KEY = "boostfund:ai-chat:v1"

export default function AiChatAssistant({
  className,
  initialMessages = [],
  title = "AI Funding Assistant",
  layout = "section",
  enableVoice = true,
  enableFileUpload = true,
  onSend,
}: AiChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [widgetOpen, setWidgetOpen] = useState(layout === "section")
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [reminderAt, setReminderAt] = useState<string>("")
  const [reminderNote, setReminderNote] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Quick prompts
  const quickPrompts: QuickPrompt[] = useMemo(
    () => [
      {
        id: "grants",
        label: "Find grants for my startup",
        prompt:
          "Help me find relevant grants for my startup. Industry: Fintech. Stage: Seed. Region: North America.",
        icon: <MessageSquareText className="h-4 w-4" />,
      },
      {
        id: "review-deck",
        label: "Review my pitch deck",
        prompt:
          "Review my pitch deck and provide specific, actionable feedback on clarity, narrative, and traction slides.",
        icon: <MessagesSquare className="h-4 w-4" />,
      },
      {
        id: "strategy",
        label: "Funding strategy",
        prompt:
          "I need a 6-month fundraising strategy. Include milestones, target investor types, and warm intro tactics.",
        icon: <Brain className="h-4 w-4" />,
      },
      {
        id: "application-help",
        label: "Application help",
        prompt:
          "Guide me through completing a grant application. I need help with the budget and impact sections.",
        icon: <MessageSquareDot className="h-4 w-4" />,
      },
    ],
    []
  )

  // Load history from localStorage after mount
  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[]
        setMessages(parsed)
      } else if (initialMessages.length) {
        setMessages(initialMessages)
      } else {
        // seed conversation
        setMessages([
          {
            id: cryptoRandom(),
            role: "assistant",
            content:
              "Hi! I'm your AI funding assistant. I can help you find grants, refine your pitch, and navigate applications. How can I help today?",
            createdAt: Date.now(),
          },
        ])
      }
    } catch {
      setMessages(initialMessages)
    }
    // Open widget by default for section layout
    if (layout === "widget") setWidgetOpen(false)
  }, [initialMessages, layout])

  // Persist to localStorage
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && messages.length) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
      }
    } catch {
      // ignore
    }
  }, [messages])

  // Voice: setup on-demand
  const canUseVoice = useMemo(() => {
    if (!enableVoice) return false
    if (typeof window === "undefined") return false
    const w = window as unknown as { webkitSpeechRecognition?: any }
    return "webkitSpeechRecognition" in w || "SpeechRecognition" in window
  }, [enableVoice])

  const startVoice = useCallback(() => {
    if (!canUseVoice) {
      toast.info("Voice input is not supported in this browser.")
      return
    }
    try {
      const w = window as any
      const SpeechRec =
        w.SpeechRecognition || w.webkitSpeechRecognition
      const rec: SpeechRecognition = new SpeechRec()
      rec.continuous = false
      rec.interimResults = true
      rec.lang = "en-US"
      recognitionRef.current = rec

      let finalTranscript = ""

      rec.onresult = (event: SpeechRecognitionEvent) => {
        let interim = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " "
          } else {
            interim += transcript
          }
        }
        setInput((finalTranscript + interim).trim())
      }
      rec.onerror = () => {
        setIsRecording(false)
      }
      rec.onend = () => {
        setIsRecording(false)
      }
      rec.start()
      setIsRecording(true)
      toast.success("Listening…")
    } catch {
      setIsRecording(false)
      toast.error("Could not start voice input.")
    }
  }, [canUseVoice])

  const stopVoice = useCallback(() => {
    recognitionRef.current?.stop()
    setIsRecording(false)
  }, [])

  const handleSend = useCallback(
    async (content: string, attachments?: { name: string; size: number }[]) => {
      const trimmed = content.trim()
      if (!trimmed) return
      const userMsg: ChatMessage = {
        id: cryptoRandom(),
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
        attachments,
      }
      setMessages((prev) => [...prev, userMsg])
      setInput("")
      setIsThinking(true)
      onSend?.(trimmed)

      // Simulate AI response (replace with real API)
      await sleep(700)
      const assistantMsg: ChatMessage = {
        id: cryptoRandom(),
        role: "assistant",
        content: generateAssistantReply(trimmed, attachments),
        createdAt: Date.now(),
      }
      setMessages((prev) => [...prev, assistantMsg])
      setIsThinking(false)
    },
    [onSend]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend(input)
    }
  }

  const openFilePicker = () => {
    if (!enableFileUpload) return
    fileInputRef.current?.click()
  }

  const onFilesSelected: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const attachments = files.map((f) => ({ name: f.name, size: f.size }))
    toast.success(`Uploaded ${files.length} file${files.length > 1 ? "s" : ""} for analysis`)
    await handleSend("Please analyze the attached document(s).", attachments)
    // Clear input value to allow re-upload same file
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const scheduleReminder = () => {
    if (!reminderAt) {
      toast.error("Please select a date and time.")
      return
    }
    setScheduleOpen(false)
    const when = new Date(reminderAt)
    toast.success(`Reminder scheduled for ${when.toLocaleString()}`)
    setReminderAt("")
    setReminderNote("")
    // Insert assistant confirmation message into the chat
    setMessages((prev) => [
      ...prev,
      {
        id: cryptoRandom(),
        role: "assistant",
        content: `I'll remind you on ${when.toLocaleString()}${reminderNote ? ` about: ${reminderNote}` : ""}.`,
        createdAt: Date.now(),
      },
    ])
  }

  // Widget toggle behavior
  useEffect(() => {
    if (layout === "widget") {
      // ensure safe default closed; opened via FAB
      // no-op
    }
  }, [layout])

  return (
    <>
      {layout === "widget" && (
        <>
          <Button
            aria-label={widgetOpen ? "Close AI Assistant" : "Open AI Assistant"}
            className={cn(
              "fixed bottom-5 right-5 z-50 h-12 w-12 rounded-full shadow-lg",
              "bg-primary text-[var(--primary-foreground)] hover:opacity-90",
              "focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-[var(--ring)]"
            )}
            onClick={() => setWidgetOpen((v) => !v)}
          >
            <BotMessageSquare className="h-6 w-6" />
          </Button>

          {widgetOpen && (
            <div
              role="dialog"
              aria-label="AI Assistant"
              className={cn(
                "fixed bottom-20 right-5 z-50 w-full sm:w-[380px] md:w-[420px]",
                "rounded-2xl border border-[var(--border)]",
                "bg-[var(--surface-1)] shadow-xl"
              )}
            >
              <header className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="size-7 rounded-lg bg-[var(--surface-2)] grid place-items-center">
                    <BotMessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{title}</p>
                    <p className="text-xs text-muted-foreground truncate">24/7 funding guidance</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setMessages([
                            {
                              id: cryptoRandom(),
                              role: "assistant",
                              content:
                                "New conversation started. What would you like to accomplish?",
                              createdAt: Date.now(),
                            },
                          ])
                          toast.success("Conversation cleared")
                        }}
                        aria-label="New conversation"
                      >
                        <MessageCirclePlus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">New conversation</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => setWidgetOpen(false)}
                        aria-label="Close"
                      >
                        <MessageCircle className="h-4 w-4 rotate-180" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Close</TooltipContent>
                  </Tooltip>
                </div>
              </header>
              <ChatBody
                messages={messages}
                isThinking={isThinking}
                quickPrompts={quickPrompts}
                onQuickPrompt={(p) => handleSend(p)}
              />
              <FooterControls
                input={input}
                setInput={setInput}
                onSend={() => handleSend(input)}
                canUseVoice={canUseVoice}
                isRecording={isRecording}
                startVoice={startVoice}
                stopVoice={stopVoice}
                openFilePicker={openFilePicker}
                enableFileUpload={enableFileUpload}
                fileInputRef={fileInputRef}
                onFilesSelected={onFilesSelected}
                onKeyDown={handleKeyDown}
                openSchedule={() => setScheduleOpen(true)}
              />
            </div>
          )}
        </>
      )}

      {layout === "section" && (
        <section
          className={cn(
            "w-full rounded-xl border border-[var(--border)]",
            "bg-[var(--surface-1)]",
            className
          )}
          aria-label="AI Assistant Section"
        >
          <header className="flex items-center justify-between gap-3 p-4 md:p-5 border-b border-[var(--border)]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 rounded-lg bg-[var(--surface-2)] grid place-items-center">
                <BotMessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-semibold tracking-tight truncate">
                  {title}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Ask about grants, applications, pitch feedback, and more.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="gap-2">
                    <Brain className="h-4 w-4" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-64">
                  <DropdownMenuLabel>Smart actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() =>
                      handleSend(
                        "Analyze my latest application draft and suggest improvements based on my profile and past submissions."
                      )
                    }
                  >
                    <MessageSquarePlus className="h-4 w-4 mr-2" />
                    Analyze my application draft
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() =>
                      handleSend(
                        "Recommend top 5 funding opportunities based on my profile and current applications."
                      )
                    }
                  >
                    <MessagesSquare className="h-4 w-4 mr-2" />
                    Recommend opportunities
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() =>
                      handleSend(
                        "Compare my pitch against investor preferences and provide tailored feedback."
                      )
                    }
                  >
                    <MessageSquareText className="h-4 w-4 mr-2" />
                    Tailored pitch feedback
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setScheduleOpen(true)}>
                    <MessageSquarePlus className="h-4 w-4 mr-2" />
                    Schedule a follow-up reminder
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <ChatBody
            messages={messages}
            isThinking={isThinking}
            quickPrompts={quickPrompts}
            onQuickPrompt={(p) => handleSend(p)}
          />

          <FooterControls
            input={input}
            setInput={setInput}
            onSend={() => handleSend(input)}
            canUseVoice={canUseVoice}
            isRecording={isRecording}
            startVoice={startVoice}
            stopVoice={stopVoice}
            openFilePicker={openFilePicker}
            enableFileUpload={enableFileUpload}
            fileInputRef={fileInputRef}
            onFilesSelected={onFilesSelected}
            onKeyDown={handleKeyDown}
            openSchedule={() => setScheduleOpen(true)}
          />
        </section>
      )}

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule a follow-up</DialogTitle>
            <DialogDescription>
              Set a reminder to revisit funding tasks or follow up on applications.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">When</span>
              <input
                type="datetime-local"
                value={reminderAt}
                onChange={(e) => setReminderAt(e.target.value)}
                className={cn(
                  "rounded-md border border-[var(--border)] bg-[var(--surface-2)]",
                  "px-3 py-2 text-sm outline-none",
                  "focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                )}
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">Note (optional)</span>
              <Textarea
                value={reminderNote}
                onChange={(e) => setReminderNote(e.target.value)}
                placeholder="E.g., Rework budget section before Friday"
                className="bg-[var(--surface-2)]"
                rows={3}
              />
            </label>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setScheduleOpen(false)}>
                Cancel
              </Button>
              <Button onClick={scheduleReminder}>Schedule</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ChatBody({
  messages,
  isThinking,
  quickPrompts,
  onQuickPrompt,
}: {
  messages: ChatMessage[]
  isThinking: boolean
  quickPrompts: QuickPrompt[]
  onQuickPrompt: (prompt: string) => void
}) {
  return (
    <div className="flex flex-col">
      <div className="px-4 pt-3">
        <QuickActions quickPrompts={quickPrompts} onQuickPrompt={onQuickPrompt} />
      </div>

      <div className="relative">
        <ScrollArea className="h-[380px] md:h-[480px]">
          <div className="px-4 pb-4 space-y-4">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {isThinking && <TypingIndicator />}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

function FooterControls({
  input,
  setInput,
  onSend,
  canUseVoice,
  isRecording,
  startVoice,
  stopVoice,
  openFilePicker,
  enableFileUpload,
  fileInputRef,
  onFilesSelected,
  onKeyDown,
  openSchedule,
}: {
  input: string
  setInput: (v: string) => void
  onSend: () => void
  canUseVoice: boolean
  isRecording: boolean
  startVoice: () => void
  stopVoice: () => void
  openFilePicker: () => void
  enableFileUpload: boolean
  fileInputRef: React.RefObject<HTMLInputElement>
  onFilesSelected: React.ChangeEventHandler<HTMLInputElement>
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  openSchedule: () => void
}) {
  return (
    <div className="border-t border-[var(--border)] p-3 sm:p-4">
      <div className="flex items-end gap-2">
        {enableFileUpload && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={onFilesSelected}
              className="hidden"
              aria-hidden="true"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="shrink-0"
                  onClick={openFilePicker}
                  aria-label="Upload files for analysis"
                >
                  <FileQuestionMark className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Upload documents</TooltipContent>
            </Tooltip>
          </>
        )}

        <div className="relative flex-1 min-w-0">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask anything about funding, applications, or your pitch…"
            rows={1}
            className={cn(
              "resize-none pr-24",
              "bg-[var(--surface-2)]",
              "placeholder:text-muted-foreground"
            )}
            aria-label="Message input"
          />
          <div className="absolute right-1.5 bottom-1.5 flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={!canUseVoice}
                    onClick={isRecording ? stopVoice : startVoice}
                    aria-pressed={isRecording}
                    aria-label={isRecording ? "Stop voice input" : "Start voice input"}
                    className={cn(
                      "h-8 w-8",
                      isRecording
                        ? "text-primary animate-pulse"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Speech className="h-4 w-4" />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {canUseVoice ? (isRecording ? "Stop" : "Voice input") : "Voice not supported"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={openSchedule}
                  aria-label="Schedule reminder"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <MessageSquarePlus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Schedule reminder</TooltipContent>
            </Tooltip>

            <Button type="button" onClick={onSend} className="h-8 px-3">
              Send
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Info className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        <p className="text-xs text-muted-foreground">
          Tip: Press Enter to send, Shift+Enter for a new line.
        </p>
      </div>
    </div>
  )
}

function QuickActions({
  quickPrompts,
  onQuickPrompt,
}: {
  quickPrompts: QuickPrompt[]
  onQuickPrompt: (prompt: string) => void
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
      {quickPrompts.map((q) => (
        <Button
          key={q.id}
          size="sm"
          variant="secondary"
          className="h-8 rounded-full gap-2 whitespace-nowrap"
          onClick={() => onQuickPrompt(q.prompt)}
        >
          {q.icon}
          <span className="text-xs">{q.label}</span>
        </Button>
      ))}
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"
  return (
    <div
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
      role="group"
      aria-label={isUser ? "User message" : "Assistant message"}
    >
      <div
        className={cn(
          "max-w-[85%] sm:max-w-[70%] rounded-2xl px-3.5 py-2.5",
          "text-sm leading-relaxed break-words",
          isUser
            ? "bg-primary text-[var(--primary-foreground)]"
            : "bg-[var(--surface-2)] text-foreground border border-[var(--border)]"
        )}
      >
        <div className="flex items-center gap-2 mb-1.5">
          {isUser ? (
            <MessageCircle className="h-3.5 w-3.5 opacity-80" />
          ) : (
            <BotMessageSquare className="h-3.5 w-3.5 text-primary" />
          )}
          <span className="text-[11px] uppercase tracking-wide opacity-70">
            {isUser ? "You" : "Assistant"}
          </span>
          <span className="ml-auto text-[11px] opacity-60">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <div className="prose prose-invert prose-p:my-0 prose-ul:my-1 prose-li:my-0 text-sm">
          {message.content}
        </div>

        {!!message.attachments?.length && (
          <div className="mt-2.5 space-y-1.5">
            {message.attachments.map((a, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5",
                  isUser ? "bg-[color-mix(in_oklab,var(--primary)_50%,transparent)]" : "bg-[var(--surface-1)]"
                )}
              >
                <FileQuestionMark className="h-4 w-4 opacity-80 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs truncate">{a.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatSize(a.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-muted-foreground" aria-live="polite">
      <div className="size-2 rounded-full bg-muted animate-bounce [animation-delay:-0.2s]" />
      <div className="size-2 rounded-full bg-muted animate-bounce" />
      <div className="size-2 rounded-full bg-muted animate-bounce [animation-delay:0.2s]" />
      <span className="text-xs">Assistant is typing…</span>
    </div>
  )
}

/* Utilities */

function cryptoRandom() {
  if (typeof window !== "undefined" && "crypto" in window && window.crypto.randomUUID) {
    return window.crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2)
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

function generateAssistantReply(
  userInput: string,
  attachments?: { name: string; size: number }[]
) {
  const hasFiles = attachments && attachments.length > 0
  if (hasFiles) {
    return `Thanks for the document${attachments!.length > 1 ? "s" : ""}. I'll analyze structure, clarity, and alignment with funding criteria. I'll highlight strengths, gaps, and provide a prioritized revision checklist. Would you like me to focus on budget, impact, or team sections first?`
  }

  const lower = userInput.toLowerCase()
  if (lower.includes("grant") || lower.includes("fund")) {
    return "Here are steps to identify suitable opportunities: 1) Clarify stage, sector, region, and ticket size. 2) Use our Opportunities page to filter by eligibility. 3) Shortlist 5–8 targets and align timelines. I can draft a prioritized list based on your profile—shall I proceed?"
  }
  if (lower.includes("pitch") || lower.includes("deck")) {
    return "I can review your pitch for narrative, traction, and clarity. Share your deck or paste key sections. I'll provide slide-by-slide suggestions and a concise investor summary."
  }
  if (lower.includes("application")) {
    return "Let's work through your application. Which section are you on? I can propose responses, tighten language, and ensure alignment with evaluation criteria."
  }
  return "Got it. I can suggest opportunities, craft outreach, refine your pitch, or guide applications. Tell me your goal and constraints (timeline, target amount, sector, region)."
}