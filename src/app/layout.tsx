import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EventTracker } from "@/components/EventTracker";
import SWRProvider from "@/components/SWRProvider";

export const metadata: Metadata = {
  title: "BoostFund AI — Your funding command center",
  description:
    "BoostFund AI helps startups find, track, and win funding with AI-powered search, applications, and investor networking.",
  metadataBase: new URL("https://boostfund.ai"),
  applicationName: "BoostFund AI",
  authors: [{ name: "BoostFund AI" }],
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    title: "BoostFund AI — Your funding command center",
    description:
      "Find grants, track applications, and connect with investors. AI assistance included.",
    url: "https://boostfund.ai",
    siteName: "BoostFund AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BoostFund AI — Your funding command center",
    description:
      "Find grants, track applications, and connect with investors. AI assistance included.",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  themeColor: "#0c1110",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <TooltipProvider delayDuration={200}>
          <SWRProvider>
            <ErrorReporter />
            <Script
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
              strategy="afterInteractive"
              data-target-origin="*"
              data-message-type="ROUTE_CHANGE"
              data-include-search-params="true"
              data-only-in-iframe="true"
              data-debug="true"
              data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
            />
            {children}
            <VisualEditsMessenger />
            <EventTracker />
            <Toaster />
          </SWRProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}