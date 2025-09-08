"use client";

import * as React from "react";
import SidebarNavigation from "@/components/sidebar-navigation";
import DashboardOverviewSection from "@/components/dashboard-overview";
import FundingOpportunities from "@/components/funding-opportunities";
import ApplicationsTracker from "@/components/applications-tracker";
import AiChatAssistant from "@/components/ai-chat-assistant";
import InvestorNetwork from "@/components/investor-network";
import FinancialAnalysisSection from "@/components/financial-analysis";
import NextGenFeatures from "@/components/next-gen-features";

type NavKey =
  | "dashboard"
  | "opportunities"
  | "applications"
  | "investors"
  | "analysis"
  | "assistant"
  | "community"
  | "nextgen"
  | "settings";

export default function Page() {
  const [active, setActive] = React.useState<NavKey>("dashboard");

  const title = React.useMemo(() => {
    switch (active) {
      case "dashboard":
        return "Dashboard";
      case "opportunities":
        return "Funding Opportunities";
      case "applications":
        return "Applications";
      case "investors":
        return "Investor Network";
      case "analysis":
        return "Financial Analysis";
      case "assistant":
        return "AI Assistant";
      case "community":
        return "Community Hub";
      case "nextgen":
        return "Next-Gen Features";
      case "settings":
        return "Settings";
      default:
        return "BoostFund AI";
    }
  }, [active]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <SidebarNavigation
          activeKey={active}
          onSelect={(key) => setActive(key as NavKey)}
          user={{
            name: "Alex Morgan",
            welcomeMessage: "Let's secure your next round",
            avatarUrl:
              "https://images.unsplash.com/photo-1544006659-f0b21884ce1d?q=80&w=256&auto=format&fit=crop&ixlib=rb-4.0.3",
          }}
          defaultCollapsed={false}
        />

        <main className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <div className="px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-heading font-semibold tracking-tight truncate">
                    {title}
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground truncate">
                    BoostFund AI — Your funding command center
                  </p>
                </div>
              </div>
            </div>
          </header>

          <div className="px-4 sm:px-6 py-6 space-y-6">
            {active === "dashboard" && (
              <div className="space-y-6">
                <DashboardOverviewSection />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <FundingOpportunities />
                  <ApplicationsTracker />
                </div>
                <InvestorNetwork />
              </div>
            )}

            {active === "opportunities" && (
              <div className="space-y-6">
                <DashboardOverviewSection className="hidden xl:block" />
                <FundingOpportunities />
              </div>
            )}

            {active === "applications" && (
              <div className="space-y-6">
                <ApplicationsTracker />
              </div>
            )}

            {active === "investors" && (
              <div className="space-y-6">
                <InvestorNetwork />
              </div>
            )}

            {active === "analysis" && (
              <div className="space-y-6">
                <FinancialAnalysisSection />
              </div>
            )}

            {active === "assistant" && (
              <div className="space-y-6">
                <AiChatAssistant layout="section" />
              </div>
            )}

            {active === "community" && (
              <div className="space-y-6">
                <section className="w-full rounded-xl border border-border bg-card p-5">
                  <h2 className="text-base sm:text-lg font-semibold">Community Hub</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Connect with founders, share grant tips, and get feedback on your pitch.
                  </p>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    <div className="rounded-lg border border-border bg-surface-1 p-4">
                      <p className="text-sm font-medium">Founder Stories</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Wins, lessons, and funding strategies from the community.
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-surface-1 p-4">
                      <p className="text-sm font-medium">Grant Tips</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Best practices for budgets, impact, and compliance.
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-surface-1 p-4">
                      <p className="text-sm font-medium">Pitch Feedback</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Peer reviews of your deck and one-liners.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {active === "nextgen" && (
              <div className="space-y-6">
                <NextGenFeatures />
              </div>
            )}

            {active === "settings" && (
              <div className="space-y-6">
                <section className="w-full rounded-xl border border-border bg-card p-5">
                  <h2 className="text-base sm:text-lg font-semibold">Settings</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Manage preferences, notifications, and connected accounts.
                  </p>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-lg border border-border bg-surface-1 p-4">
                      <p className="text-sm font-medium">Notifications</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Alerts for deadlines, matches, and updates.
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-surface-1 p-4">
                      <p className="text-sm font-medium">Integrations</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Connect your accounting and workspace tools.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Persistent AI widget accessible across the app */}
      <AiChatAssistant layout="widget" />
    </div>
  );
}