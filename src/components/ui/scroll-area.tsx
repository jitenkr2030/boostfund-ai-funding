"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Lightweight ScrollArea replacement to avoid ref/state loops
const ScrollArea = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="scroll-area"
      className={cn("relative overflow-auto", className)}
      {...props}
    >
      <div data-slot="scroll-area-viewport" className="min-h-0">
        {children}
      </div>
    </div>
  )
)
ScrollArea.displayName = "ScrollArea"

// No-op ScrollBar to preserve exports if referenced elsewhere
const ScrollBar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-slot="scroll-area-scrollbar" className={cn("hidden", className)} {...props} />
  )
)
ScrollBar.displayName = "ScrollBar"

export { ScrollArea, ScrollBar }