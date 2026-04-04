import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
  const host = req.headers.get("host") ?? "localhost:3000";
  const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const protocol = isLocal || host.match(/^\d+\.\d+/) ? "http" : "https";
  const origin = `${protocol}://${host}`;
  return NextResponse.json({ origin, isLocal });
}
