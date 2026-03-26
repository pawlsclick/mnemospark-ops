import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AUTH_CHALLENGE = 'Basic realm="Dashboard GraphQL Proxy"';

function upstreamHeaders(request: NextRequest, apiKey: string): HeadersInit {
  const contentType =
    request.headers.get("content-type")?.trim() || "application/json";
  return {
    "Content-Type": contentType,
    "x-api-key": apiKey,
  };
}

function graphQlErrorResponse(message: string, status: number, headers?: HeadersInit) {
  return NextResponse.json(
    { errors: [{ message }] },
    { status, headers },
  );
}

function isAuthorized(request: NextRequest, username: string, password: string): boolean {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) {
    return false;
  }

  const expected = `Basic ${Buffer.from(`${username}:${password}`, "utf8").toString("base64")}`;
  return authorization === expected;
}

export async function POST(request: NextRequest) {
  const url = process.env.DASHBOARD_GRAPHQL_URL?.trim();
  const apiKey = process.env.DASHBOARD_GRAPHQL_API_KEY?.trim();
  const proxyUsername = process.env.DASHBOARD_GRAPHQL_PROXY_USERNAME?.trim();
  const proxyPassword = process.env.DASHBOARD_GRAPHQL_PROXY_PASSWORD?.trim();

  if (!url || !apiKey || !proxyUsername || !proxyPassword) {
    return graphQlErrorResponse(
      "GraphQL proxy is not configured (DASHBOARD_GRAPHQL_URL / DASHBOARD_GRAPHQL_API_KEY / DASHBOARD_GRAPHQL_PROXY_USERNAME / DASHBOARD_GRAPHQL_PROXY_PASSWORD).",
      503,
    );
  }

  if (!isAuthorized(request, proxyUsername, proxyPassword)) {
    return graphQlErrorResponse(
      "Unauthorized.",
      401,
      { "WWW-Authenticate": AUTH_CHALLENGE },
    );
  }

  const body = await request.text();
  try {
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
  } catch (error) {
    console.error("GraphQL proxy request failed", error);
    return graphQlErrorResponse("GraphQL upstream is unavailable.", 503);
  }
}
