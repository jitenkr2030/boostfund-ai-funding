import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";

interface Opportunity {
  id: number;
  title: string;
  summary?: string;
  description?: string;
  amount?: string;
  stage?: string;
  region?: string;
  deadline?: string;
  image?: string;
  logo?: string;
}

async function getOpportunity(id: string): Promise<Opportunity | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "https://boostfund.ai"}/api/opportunities/${id}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const opportunity = await getOpportunity(params.id);
  if (!opportunity) return {};
  const description = opportunity.summary || opportunity.description || "";
  return {
    title: `${opportunity.title} — Opportunity`,
    description: description.length > 160 ? description.slice(0, 157) + "..." : description,
    alternates: { canonical: `https://boostfund.ai/opportunities/${params.id}` },
    openGraph: {
      images: `https://boostfund.ai/opportunities/${params.id}/opengraph-image`,
    },
    twitter: {
      images: `https://boostfund.ai/opportunities/${params.id}/twitter-image`,
    },
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const opportunity = await getOpportunity(params.id);
  if (!opportunity) notFound();

  return (
    <div className="min-h-screen bg-surface-1 text-foreground">
      <div className="container py-8">
        <div className="rounded-xl bg-card border border-border p-6">
          <div className="flex flex-col gap-6">
            {(opportunity.image || opportunity.logo) && (
              <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden">
                <Image
                  src={opportunity.image || opportunity.logo || ""}
                  alt={opportunity.title}
                  fill
                  className="object-cover"
                  placeholder="empty"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                />
              </div>
            )}

            <div className="flex flex-col gap-3">
              <h1 className="text-2xl md:text-3xl font-heading text-foreground">
                {opportunity.title}
              </h1>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-muted-foreground text-sm">
                {opportunity.amount && (
                  <div>
                    <span className="block text-muted-foreground">Amount</span>
                    <span className="text-foreground font-medium">{opportunity.amount}</span>
                  </div>
                )}
                {opportunity.stage && (
                  <div>
                    <span className="block text-muted-foreground">Stage</span>
                    <span className="text-foreground font-medium">{opportunity.stage}</span>
                  </div>
                )}
                {opportunity.region && (
                  <div>
                    <span className="block text-muted-foreground">Region</span>
                    <span className="text-foreground font-medium">{opportunity.region}</span>
                  </div>
                )}
                {opportunity.deadline && (
                  <div>
                    <span className="block text-muted-foreground">Deadline</span>
                    <span className="text-foreground font-medium">{opportunity.deadline}</span>
                  </div>
                )}
              </div>

              {(opportunity.description || opportunity.summary) && (
                <p className="text-foreground leading-relaxed mt-2">
                  {opportunity.description || opportunity.summary}
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
                data-evt="save"
                data-id={opportunity.id}
              >
                Save
              </button>
              <button
                className="inline-flex items-center justify-center rounded-md bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
                data-evt="apply"
                data-id={opportunity.id}
              >
                Apply
              </button>
              <button
                className="inline-flex items-center justify-center rounded-md bg-secondary text-secondary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
                data-evt="share"
                data-id={opportunity.id}
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}