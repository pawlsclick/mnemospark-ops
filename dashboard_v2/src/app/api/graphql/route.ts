import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function upstreamHeaders(request: NextRequest, apiKey: string): HeadersInit {
  const contentType =
    request.headers.get("content-type")?.trim() || "application/json";
  return {
    "Content-Type": contentType,
    "x-api-key": apiKey,
  };
}

export async function POST(request: NextRequest) {
  const url = process.env.DASHBOARD_GRAPHQL_URL?.trim();
  const apiKey = process.env.DASHBOARD_GRAPHQL_API_KEY?.trim();
  if (!url || !apiKey) {
    return NextResponse.json(
      { errors: [{ message: "GraphQL proxy is not configured (DASHBOARD_GRAPHQL_URL / DASHBOARD_GRAPHQL_API_KEY)." }] },
      { status: 503 },
    );
  }

  const body = await request.text();
  const upstream = await fetch(url, {
    method: "POST",
    headers: upstreamHeaders(request, apiKey),
    body,
    cache: "no-store",
  });

  const text = await upstream.text();
  const ct = upstream.headers.get("content-type") || "application/json";
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": ct },
  });
}
