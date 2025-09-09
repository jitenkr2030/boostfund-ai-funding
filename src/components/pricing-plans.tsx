"use client";

import * as React from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface PlanCardProps {
  name: string;
  price: string;
  priceNote?: string;
  badgeLabel?: string;
  features: string[];
  ctaLabel: string;
  onClick: () => void;
  highlight?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({
  name,
  price,
  priceNote,
  badgeLabel,
  features,
  ctaLabel,
  onClick,
  highlight = false
}) => {
  return (
    <Card
      className={
        "h-full flex flex-col" +
        (highlight ? " border border-primary/40 shadow-lg shadow-primary/10" : "")
      }
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-xl font-heading">{name}</CardTitle>
          {badgeLabel && (
            <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">
              {badgeLabel}
            </Badge>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-heading font-bold">{price}</span>
          {name !== "Elite" && price !== "$0" && (
            <span className="text-sm text-muted-foreground">/mo</span>
          )}
        </div>
        {priceNote && (
          <CardDescription className="text-xs mt-1 text-muted-foreground">
            {priceNote}
          </CardDescription>
        )}
      </CardHeader>

      <Separator />

      <CardContent className="pt-4 flex-grow flex flex-col">
        <ul className="space-y-3 flex-grow">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <span className="text-primary mt-0.5">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={onClick}
          variant={name === "Elite" ? "default" : "outline"}
          className="mt-6 w-full"
          aria-label={`Select the ${name} plan`}
        >
          {ctaLabel}
        </Button>
      </CardContent>
    </Card>
  );
};

export default function PricingPlans(): JSX.Element {
  const handleCta = (plan: string) => {
    toast.success(`You selected the ${plan} plan`);
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      features: [
        "Basic Funding Search (limited)",
        "AI Funding Match (Lite) – Top 3/mo",
        "Profile & Business Setup",
        "Basic Application Templates",
        "Weekly Funding Alerts",
        "AI Chatbot (Basic)",
        "Community Access"
      ],
      ctaLabel: "Continue Free"
    },
    {
      name: "Pro",
      price: "$49",
      priceNote: "$29–$99/mo based on usage",
      badgeLabel: "Most Popular",
      features: [
        "Unlimited Funding Matches (daily)",
        "AI Proposal & Pitch Deck Generator",
        "Investor Discovery & Outreach",
        "Funding Probability Predictor",
        "Document Intelligence",
        "Smart Negotiation Assistant",
        "Real-time Funding Alerts",
        "Collaboration Hub",
        "Investor Analytics",
        "Priority Support"
      ],
      ctaLabel: "Upgrade to Pro"
    },
    {
      name: "Elite",
      price: "Custom",
      priceNote: "$299+/mo or commission-based",
      badgeLabel: "Best for Teams",
      features: [
        "AI Pitch Coach (Voice + Video)",
        "AI Deal Room",
        "Tokenized Crowdfunding (Web3)",
        "Investor Sentiment Analysis",
        "Multi-Language Outreach",
        "Smart Exit & Growth Planning",
        "Dedicated Success Manager",
        "Custom Integrations"
      ],
      ctaLabel: "Contact Sales",
      highlight: true
    }
  ];

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-title"
      className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="text-center mb-12">
        <h2 id="pricing-title" className="text-3xl md:text-4xl font-heading font-bold mb-3">
          Plans &amp; Pricing
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose a plan that fits your funding journey. Start free and scale as you grow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <PlanCard
            key={plan.name}
            name={plan.name}
            price={plan.price}
            priceNote={plan.priceNote}
            badgeLabel={plan.badgeLabel}
            features={plan.features}
            ctaLabel={plan.ctaLabel}
            onClick={() => handleCta(plan.name)}
            highlight={plan.name === "Elite"}
          />
        ))}
      </div>
    </section>
  );
}