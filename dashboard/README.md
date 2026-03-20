# mnemospark dashboard

Internal operator dashboard for mnemospark sales + operations intelligence.

## Stack

- Next.js 16 App Router
- TypeScript strict mode
- Tailwind CSS v4
- shadcn/ui primitives
- Recharts charts
- AWS SDK v3 (DynamoDB + optional AppSync events)

## Required environment

Create `dashboard/.env.local`:

- `AWS_REGION=us-east-1`
- `AWS_ACCESS_KEY_ID=...`
- `AWS_SECRET_ACCESS_KEY=...`
- `AWS_SESSION_TOKEN=...` (only if temporary creds)
- `QUOTES_TABLE_NAME=mnemospark-staging-quotes`
- `UPLOAD_TRANSACTION_LOG_TABLE_NAME=mnemospark-staging-upload-transaction-log`
- `UPLOAD_IDEMPOTENCY_TABLE_NAME=mnemospark-staging-upload-idempotency`
- `WALLET_AUTH_EVENTS_TABLE_NAME=mnemospark-staging-wallet-auth-events`
- `API_CALLS_TABLE_NAME=mnemospark-staging-api-calls`
- `PAYMENT_LEDGER_TABLE_NAME=mnemospark-staging-payments`
- `DEFAULT_AMOUNT_DECIMALS=1000000`

Optional live events:

- `APPSYNC_EVENTS_ENDPOINT=...`
- `APPSYNC_API_KEY=...`

## Run locally

From `dashboard/`:

- `npm install`
- `npm run dev`
- open `http://localhost:3000`

## Build checks

From `dashboard/`:

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

## Routes

- `/` overview
- `/sales`
- `/operations`
- `/wallets`
- `/wallets/[address]`
- `/transactions`
- `/events`

## Backend mapping (reference only; no backend mutations)

Mapped stack: `mnemospark-staging`

### Tables

- `QuotesTable` -> `mnemospark-staging-quotes`
- `UploadTransactionLogTable` -> `mnemospark-staging-upload-transaction-log`
- `UploadIdempotencyTable` -> `mnemospark-staging-upload-idempotency`
- `WalletAuthEventsTable` -> `mnemospark-staging-wallet-auth-events`
- `ApiCallsTable` -> `mnemospark-staging-api-calls`
- `PaymentLedgerTable` -> `mnemospark-staging-payments`

### Lambda logical names surfaced in UI

- `WalletAuthorizerFunction`
- `PriceStorageFunction`
- `StorageUploadFunction`
- `StorageUploadConfirmFunction`
- `PaymentSettleFunction`
- `StorageLsFunction`
- `StorageDownloadFunction`
- `StorageDeleteFunction`
- `StorageHousekeepingFunction`

## Assumptions and known gaps

- Revenue is derived from `PaymentLedgerTable` as the canonical settled source.
- If AppSync live events are unavailable, events view falls back to recent normalized backend events.
- Failure categorization is heuristic based on status/reason strings and should be tuned as more statuses are observed.
- Trace lookups are implemented at query-layer level; the UI currently shows the panels and data but not a full interactive submit workflow.
