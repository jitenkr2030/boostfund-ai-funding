"use client";

import { SWRConfig } from "swr";
import React from "react";

interface Props {
  children: React.ReactNode;
}

// Global SWR configuration
// - Adds bearer token automatically
// - Revalidates on focus and reconnect
// - Dedupes requests briefly
export const SWRProvider = ({ children }: Props) => {
  return (
    <SWRConfig
      value={{
        fetcher: async (input: RequestInfo | URL, init?: RequestInit) => {
          const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
          const res = await fetch(input, {
            ...init,
            headers: {
              "Content-Type": "application/json",
              ...(init?.headers as Record<string, string>),
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(text || `Request failed: ${res.status}`);
          }
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) return res.json();
          return res.text();
        },
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 1500,
        shouldRetryOnError: true,
        errorRetryCount: 2,
      }}
    >
      {children}
    </SWRConfig>
  );
};

export default SWRProvider;