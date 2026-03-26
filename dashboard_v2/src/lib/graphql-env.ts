/**
 * GraphQL HTTP endpoint for the dashboard API (mnemospark-backend stack output).
 * Use the public name in the browser; align with backend docs when deployed.
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
