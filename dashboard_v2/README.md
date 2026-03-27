# Dashboard v2 (Ops Console)

Next.js (App Router) internal dashboard that talks to the **mnemospark-backend** dashboard GraphQL API. This app lives at the repository root as `dashboard_v2/`, alongside `dashboard/` (v1).

## Stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS v4, shadcn/ui (base-nova), Recharts (for future charts)
- Apollo Client + GraphQL Code Generator (`graphql/schema.graphql` is the pinned contract for codegen)

## Environment

Create `dashboard_v2/.env.local` (gitignored).

**Live data (recommended):** Point the browser at the Next.js BFF and keep the API key on the server.

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_GRAPHQL_ENDPOINT` | client | Apollo `HttpLink` target. Use **`/api/graphql`** (same-origin) so requests hit the proxy route. Alias: `NEXT_PUBLIC_GRAPHQL_URL`. |
| `DASHBOARD_GRAPHQL_URL` | server only | Full HTTPS URL of the backend dashboard GraphQL API (`…/staging/graphql` from stack output `DashboardGraphQLHttpApiUrl`). |
| `DASHBOARD_GRAPHQL_API_KEY` | server only | Plaintext API key; must match the value in AWS Secrets Manager for the authorizer. |
| `NEXT_PUBLIC_DASHBOARD_WALLET_ADDRESS` | client | `0x…` wallet address for the Overview **revenueSummary** query (required field on the API). Valid hex addresses are normalized to **EIP-55 checksum** before calling GraphQL (many backends key the ledger by checksummed address). Overview/Sales also show **quote-based revenue** (sum of `amountNormalized` for `hasPaymentSettled` in `walletDetail.quotes`) when the ledger aggregate disagrees with quote facts. |
| `NEXT_PUBLIC_USE_MOCK_GRAPHQL` | client | Set to `true` to force the in-app mock link (ignores endpoint). |

**Local / CI without AWS:** Omit `NEXT_PUBLIC_GRAPHQL_*` or set `NEXT_PUBLIC_USE_MOCK_GRAPHQL=true` to use the **mock GraphQL link**.

## Scripts

```bash
cd dashboard_v2
npm install
npm run dev      # http://localhost:3001
npm run lint
npm run codegen  # regenerate src/gql/ from graphql/schema.graphql
npm run codegen:check  # fail if generated client is out of date
npm run build
```

## Backend contract

- **GraphQL SDL:** `graphql/schema.graphql` in this repo (keep aligned with mnemospark-backend exports).
- **HTTP layer:** [mnemospark-backend `docs/openapi.yaml`](https://github.com/pawlsclick/mnemospark-backend/blob/main/docs/openapi.yaml) documents `POST /graphql` with **`x-api-key`** (Lambda authorizer + Secrets Manager). This app’s `src/app/api/graphql/route.ts` forwards the browser request and attaches that header from `DASHBOARD_GRAPHQL_API_KEY`.

## Spec

Implementation follows [dashboard_v2_plan.md](https://raw.githubusercontent.com/pawlsclick/mnemospark-ops/refs/heads/main/dev_docs/spec/dashboard_v2_plan.md) (unified frontend/backend plan).
