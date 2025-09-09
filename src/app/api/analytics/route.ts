import { NextRequest, NextResponse } from "next/server";

// Lightweight analytics endpoint for client event beacons
// Validates minimal schema and avoids storing PII. Designed for sendBeacon/fetch.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }

    const { event, id, path, ts } = body as { event?: string; id?: string | null; path?: string; ts?: number };

    // Basic validation
    if (!event || typeof event !== "string") {
      return NextResponse.json({ error: "Missing event" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }
    if (path && typeof path !== "string") {
      return NextResponse.json({ error: "Invalid path" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }
    if (id && typeof id !== "string") {
      return NextResponse.json({ error: "Invalid id" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }
    if (ts && typeof ts !== "number") {
      return NextResponse.json({ error: "Invalid ts" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }

    // Derive request context (IP/user-agent without storing raw IP long term)
    const ua = req.headers.get("user-agent") || "";
    const referer = req.headers.get("referer") || "";

    // For now, just log. Later: push to analytics provider or DB.
    console.info("[analytics]", {
      event,
      id: id || null,
      path: path || "",
      ts: ts || Date.now(),
      ua: ua.slice(0, 200),
      referer: referer.slice(0, 200),
    });

    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}

export async function GET() {
  // Simple health/info for this route
  return NextResponse.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
}