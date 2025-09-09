import { NextResponse } from "next/server";

export async function GET() {
  const payload = {
    status: "ok" as const,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };

  // Basic server log (can be picked up by hosting provider logs)
  // Avoid logging sensitive data
  console.info("[health]", payload);

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}