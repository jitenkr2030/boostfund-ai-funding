"use client";

import * as React from "react";
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutTemplate,
  PanelRightDashed,
  PanelTopOpen,
  UserRound,
  AlignVerticalDistributeStart,
  CircleEllipsis,
  SquareDashedTopSolid,
  PanelRightClose,
} from "lucide-react";

type SidebarNavigationProps = {
  className?: string;
  style?: React.CSSProperties;
  activeKey?: string;
  defaultCollapsed?: boolean;
  onSelect?: (key: string) => void;
  user?: {
    name: string;
    avatarUrl?: string;
    welcomeMessage?: string;
  };
  onUpgradeClick?: () => void;
};

type NavConfig = {
  key: string;
  label: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavConfig[] = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutTemplate className="h-5 w-5" aria-hidden="true" /> },
  { key: "opportunities", label: "Funding Opportunities", icon: <PanelRightDashed className="h-5 w-5" aria-hidden="true" /> },
  { key: "applications", label: "My Applications", icon: <PanelTopOpen className="h-5 w-5" aria-hidden="true" /> },
  { key: "investors", label: "Investor Network", icon: <UserRound className="h-5 w-5" aria-hidden="true" /> },
  { key: "analysis", label: "Financial Analysis", icon: <AlignVerticalDistributeStart className="h-5 w-5" aria-hidden="true" /> },
  { key: "assistant", label: "AI Assistant", icon: <CircleEllipsis className="h-5 w-5" aria-hidden="true" /> },
  { key: "community", label: "Community Hub", icon: <SquareDashedTopSolid className="h-5 w-5" aria-hidden="true" /> },
  { key: "settings", label: "Settings", icon: <PanelRightClose className="h-5 w-5" aria-hidden="true" /> },
];

export default function SidebarNavigation({
  className,
  style,
  activeKey,
  defaultCollapsed,
  onSelect,
  user,
  onUpgradeClick,
}: SidebarNavigationProps) {
  const [collapsed, setCollapsed] = React.useState<boolean>(!!defaultCollapsed);
  const [mobileOpen, setMobileOpen] = React.useState<boolean>(false);

  // Close mobile sidebar on Escape
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
  }, []);

  const isActive = (key: string) => activeKey === key;

  const userName = user?.name ?? "Investor";
  const userAvatar =
    user?.avatarUrl ??
    "https://images.unsplash.com/photo-1544006659-f0b21884ce1d?q=80&w=256&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=Mnwx";
  const welcomeText = user?.welcomeMessage ?? "Welcome back";

  // Shared styles
  const surfaceBg = "bg-[var(--sidebar-background)]";
  const surfaceAccent = "bg-[var(--sidebar-accent)]";
  const textMuted = "text-[var(--sidebar-foreground)]/70";
  const textStrong = "text-[var(--sidebar-foreground)]";
  const ring = "ring-1 ring-[var(--sidebar-ring)]/40";
  const borderColor = "border-[var(--sidebar-border)]";

  // Widths
  const expandedWidth = "w-72";
  const collapsedWidth = "w-20";

  return (
    <>
      {/* Mobile top bar trigger (only visible on small screens) */}
      <div className="md:hidden fixed top-3 left-3 z-[60]">
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={() => setMobileOpen(true)}
          className={`${surfaceAccent} text-[var(--sidebar-foreground)]/80 hover:text-[var(--sidebar-foreground)] border ${borderColor} rounded-md p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sidebar-ring)]`}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <button
          aria-label="Close sidebar overlay"
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        role="navigation"
        aria-label="Primary"
        className={[
          "fixed inset-y-0 left-0 z-50",
          surfaceBg,
          "border-r",
          borderColor,
          "transition-[width] duration-200 ease-out",
          "flex flex-col",
          "max-h-screen",
          "group/sidebar",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "md:transition-transform",
          collapsed ? collapsedWidth : expandedWidth,
          className ?? "",
        ].join(" ")}
        style={style}
      >
        {/* Header: brand, user profile, collapse control */}
        <div className="px-3 py-3 md:py-4 border-b border-[var(--sidebar-border)]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="h-9 w-9 rounded-md flex items-center justify-center bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
                aria-hidden="true"
              >
                <span className="font-heading text-base font-bold">BF</span>
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <div className="font-heading text-[var(--sidebar-foreground)] text-base md:text-lg font-semibold leading-tight truncate">
                    BoostFund AI
                  </div>
                  <div className="text-xs text-[var(--sidebar-foreground)]/60 leading-tight">
                    Funding Intelligence
                  </div>
                </div>
              )}
            </div>

            {/* Collapse / Close controls */}
            <div className="flex items-center gap-1">
              {/* Close (mobile) */}
              <button
                type="button"
                aria-label={mobileOpen ? "Close sidebar" : "Open sidebar"}
                onClick={() => setMobileOpen(false)}
                className="md:hidden text-[var(--sidebar-foreground)]/70 hover:text-[var(--sidebar-foreground)] rounded-md p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sidebar-ring)]"
              >
                <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
              </button>
              {/* Collapse (desktop) */}
              <button
                type="button"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                onClick={() => setCollapsed((c) => !c)}
                className="hidden md:inline-flex text-[var(--sidebar-foreground)]/70 hover:text-[var(--sidebar-foreground)] rounded-md p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sidebar-ring)]"
              >
                {collapsed ? (
                  <PanelLeftOpen className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* User profile */}
          <div className="mt-3 md:mt-4 flex items-center gap-3">
            <div className="relative">
              <img
                src={userAvatar}
                alt={`${userName} avatar`}
                className="h-9 w-9 rounded-full object-cover border border-[var(--sidebar-border)]"
              />
              <span
                className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[var(--success)] ring-2 ring-[var(--sidebar-background)]"
                aria-hidden="true"
              />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--sidebar-foreground)] truncate">{userName}</p>
                <p className="text-xs text-[var(--sidebar-foreground)]/60 truncate">{welcomeText}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin scrollbar-thumb-[var(--sidebar-accent)]/60 scrollbar-track-transparent">
          <ul className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.key);
              return (
                <li key={item.key}>
                  <button
                    type="button"
                    aria-current={active ? "page" : undefined}
                    onClick={() => onSelect?.(item.key)}
                    className={[
                      "w-full flex items-center gap-3 rounded-md border",
                      active ? "border-[var(--sidebar-ring)]/60" : "border-transparent",
                      "px-2 py-2 transition-colors",
                      active
                        ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-foreground)]"
                        : "text-[var(--sidebar-foreground)]/75 hover:text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]/70",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sidebar-ring)]",
                      "relative",
                    ].join(" ")}
                  >
                    {/* Active indicator */}
                    <span
                      className={[
                        "absolute left-0 top-1/2 -translate-y-1/2 h-6 rounded-r",
                        active ? "w-1 bg-[var(--sidebar-primary)]" : "w-0 bg-transparent",
                      ].join(" ")}
                      aria-hidden="true"
                    />
                    <span className="shrink-0 text-[var(--sidebar-foreground)]">{item.icon}</span>
                    {!collapsed && (
                      <span className="min-w-0 flex-1 text-sm font-medium text-left truncate">{item.label}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Upgrade card */}
        <div className="px-3 py-3 border-t border-[var(--sidebar-border)]">
          <div
            className={[
              "relative overflow-hidden rounded-lg",
              surfaceAccent,
              "border",
              borderColor,
              "p-3",
            ].join(" ")}
          >
            {/* Decorative accent */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-[var(--primary)]/15 blur-2xl"
            />
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md flex items-center justify-center bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--sidebar-border)]">
                <CircleEllipsis className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--sidebar-foreground)] truncate">
                  Upgrade to Pro
                </p>
                <p className="text-xs text-[var(--sidebar-foreground)]/70 truncate">
                  Unlock advanced analytics & priority AI
                </p>
              </div>
            </div>

            {!collapsed && (
              <div className="mt-3 space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-[var(--sidebar-foreground)] font-semibold text-lg">$19</span>
                  <span className="text-xs text-[var(--sidebar-foreground)]/60">/month</span>
                </div>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2 text-xs text-[var(--sidebar-foreground)]/75">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" aria-hidden="true" />
                    Deeper funding insights
                  </li>
                  <li className="flex items-center gap-2 text-xs text-[var(--sidebar-foreground)]/75">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" aria-hidden="true" />
                    AI proposal enhancer
                  </li>
                  <li className="flex items-center gap-2 text-xs text-[var(--sidebar-foreground)]/75">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" aria-hidden="true" />
                    Priority investor matches
                  </li>
                </ul>
              </div>
            )}

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={onUpgradeClick}
                className={[
                  "inline-flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-medium",
                  "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-95 transition-opacity",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sidebar-ring)]",
                  ring,
                ].join(" ")}
              >
                Get Pro
              </button>
              {!collapsed && (
                <button
                  type="button"
                  aria-label="Collapse sidebar"
                  onClick={() => setCollapsed(true)}
                  className="hidden md:inline-flex shrink-0 items-center justify-center rounded-md p-2 text-[var(--sidebar-foreground)]/70 hover:text-[var(--sidebar-foreground)] border border-[var(--sidebar-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sidebar-ring)]"
                >
                  <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Spacer to prevent content underlap on desktop; parent can override if not needed */}
      <div
        aria-hidden="true"
        className={[
          "hidden md:block",
          "shrink-0",
          collapsed ? collapsedWidth : expandedWidth,
        ].join(" ")}
      />
    </>
  );
}