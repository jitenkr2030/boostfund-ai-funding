import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = "https://boostfund.ai";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/_next/", "/static/"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}