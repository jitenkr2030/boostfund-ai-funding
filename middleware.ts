import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// Simple in-memory rate limiter (per IP per window)
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 60; // 60 requests/minute per IP per route

// Map key: `${ip}:${route}` -> { count, resetAt }
const buckets: Map<string, { count: number; resetAt: number }> = new Map();

function getClientIp(req: NextRequest) {
  const xff = req.headers.get("x-forwarded-for") || "";
  const ip = xff.split(",")[0]?.trim();
  return ip || req.ip || "unknown";
}

function checkRateLimit(key: string) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { limited: false, remaining: RATE_LIMIT_MAX - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }
  if (bucket.count >= RATE_LIMIT_MAX) {
    return { limited: true, remaining: 0, resetAt: bucket.resetAt };
  }
  bucket.count += 1;
  buckets.set(key, bucket);
  return { limited: false, remaining: RATE_LIMIT_MAX - bucket.count, resetAt: bucket.resetAt };
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rate limit public API routes
  if (pathname.startsWith("/api")) {
    const ip = getClientIp(request);
    const key = `${ip}:${pathname}`;
    const { limited, remaining, resetAt } = checkRateLimit(key);

    if (limited) {
      const res = NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
      res.headers.set("Retry-After", Math.max(0, Math.ceil((resetAt - Date.now()) / 1000)).toString());
      res.headers.set("X-RateLimit-Limit", RATE_LIMIT_MAX.toString());
      res.headers.set("X-RateLimit-Remaining", "0");
      res.headers.set("X-RateLimit-Reset", Math.floor(resetAt / 1000).toString());
      return res;
    }

    const res = NextResponse.next();
    res.headers.set("X-RateLimit-Limit", RATE_LIMIT_MAX.toString());
    res.headers.set("X-RateLimit-Remaining", remaining.toString());
    res.headers.set("X-RateLimit-Reset", Math.floor(resetAt / 1000).toString());
    return res;
  }

  // Preserve existing auth redirect for root page
  if (pathname === "/") {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: ["/", "/api/:path*"],
};