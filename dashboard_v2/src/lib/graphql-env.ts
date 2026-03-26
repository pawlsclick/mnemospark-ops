/**
 * GraphQL HTTP endpoint for the dashboard (browser → Next.js → API Gateway).
 * Prefer same-origin `/api/graphql` so the server route adds `x-api-key` from
 * `DASHBOARD_GRAPHQL_API_KEY` (never expose that key in public env vars).
 */
export function getGraphqlHttpUrl(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT?.trim() ||
    process.env.NEXT_PUBLIC_GRAPHQL_URL?.trim() ||
    undefined
  );
}

export function shouldUseMockGraphql(): boolean {
  if (process.env.NEXT_PUBLIC_USE_MOCK_GRAPHQL === "true") return true;
  return !getGraphqlHttpUrl();
}
