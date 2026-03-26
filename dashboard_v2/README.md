# Dashboard v2 (Ops Console)

Next.js (App Router) internal dashboard that talks to the **mnemospark-backend** dashboard GraphQL API. This app lives at the repository root as `dashboard_v2/`, alongside `dashboard/` (v1).

## Stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS v4, shadcn/ui (base-nova), Recharts (for future charts)
- Apollo Client + GraphQL Code Generator (`graphql/schema.graphql` is the pinned contract for codegen)

## Environment

Create `dashboard_v2/.env.local` (gitignored):

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_GRAPHQL_ENDPOINT` | HTTPS URL of the dashboard GraphQL API (`POST /graphql`). Alias: `NEXT_PUBLIC_GRAPHQL_URL`. |
| `NEXT_PUBLIC_USE_MOCK_GRAPHQL` | Set to `true` to force the in-app mock link (ignores endpoint). |

**Default during backend build-out:** If no public endpoint is set, the app uses a **mock GraphQL link** so local dev and CI stay green without AWS.

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
- **HTTP layer:** See [mnemospark-backend `docs/openapi.yaml`](https://github.com/pawlsclick/mnemospark-backend/blob/main/docs/openapi.yaml) for `POST /graphql` (method, body shape, auth headers) once the dashboard API is documented there.

## Spec

Implementation follows [dashboard_v2_plan.md](https://raw.githubusercontent.com/pawlsclick/mnemospark-ops/refs/heads/main/dev_docs/spec/dashboard_v2_plan.md) (unified frontend/backend plan).
