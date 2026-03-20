# Next.js MVP Customer & Infrastructure Dashboard Spec (Agent-Optimized, Backend-Aware)

## Objective

Build an internal-only MVP frontend that visualizes events, transactions, and wallet-based customer behavior from the existing `mnemospark-backend` AWS serverless backend.

This spec is intentionally agent-directed:
- it points to official repos where applicable
- it points to skills where available
- it maps the actual Lambda functions, API routes, and DynamoDB tables from the backend
- it tells the agent what to reuse instead of inventing abstractions

---

## Primary Backend Source of Truth

Backend repo:
- `mnemospark-backend`
- GitHub: `https://github.com/pawlsclick/mnemospark-backend`

The backend repo states that:
- `template.yaml` is the main SAM stack
- `services/` contains the live Lambda handlers and shared code
- `docs/` contains OpenAPI + endpoint docs for supported routes
- canonical product and API docs live in a separate `mnemospark-docs` repository

For this dashboard effort, treat the following as backend implementation truth:
1. `template.yaml`
2. `services/`
3. `docs/`

Do not invent alternate resource names or alternate data models when the repo already defines them.

---

## Frontend Stack (with Source Repos)

Use exactly this stack unless a small implementation detail requires a minor addition.

### Frontend Core
- **Next.js**
  - Official repo: `https://github.com/vercel/next.js`

- **TypeScript**
  - Official repo: `https://github.com/microsoft/TypeScript`

- **Tailwind CSS**
  - Official repo: `https://github.com/tailwindlabs/tailwindcss`

### UI System
- **shadcn/ui**
  - Official repo: `https://github.com/shadcn-ui/ui`
  - Skill: `https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/SKILL.md`

### Charts
- **Recharts**
  - Official repo: `https://github.com/recharts/recharts`

### AWS Integration
- **AWS SDK for JavaScript v3**
  - Official repo: `https://github.com/aws/aws-sdk-js-v3`

Use the AWS SDK v3 for DynamoDB access and any AWS-side integrations needed by the dashboard.

---

## Skill / Source Usage Rules

### General Rule
For each technology above:
- use the official GitHub repo listed in this spec as the source of truth
- do not rely on memory when implementation details are unclear
- do not swap in third-party wrappers unless the repository already uses them or they are clearly required

### shadcn/ui Rule (Critical)
The dashboard UI system is **shadcn/ui**.

The agent must:
- treat `https://github.com/shadcn-ui/ui` as the canonical source for component structure and usage
- follow the skill at `https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/SKILL.md`
- use the shadcn CLI to initialize/add components
- prefer existing shadcn components over custom UI primitives
- not hand-roll replacements for standard primitives that shadcn already covers

Use shadcn/ui for:
- app shell layout
- cards
- buttons
- inputs
- tables
- tabs
- badges
- dropdown menus
- dialogs / sheets
- skeletons
- separators
- scroll areas
- standard filtering controls

Custom-build only:
- Recharts-based metric visualizations
- live event stream behavior
- wallet-specific domain panels
- transaction lifecycle/timeline views
- backend-specific data composition

---

## Actual Backend Resources to Map Directly

The following resources come from the backend SAM template and must be reflected directly in the dashboard integration.

### DynamoDB Tables

#### 1. QuotesTable
- Logical name: `QuotesTable`
- Physical naming pattern: `${StackName}-quotes`
- Key schema:
  - partition key: `quote_id`
- TTL:
  - `expires_at`

Purpose in dashboard:
- quote lookup
- quote lifecycle visibility
- linkage between pricing, settlement, and upload flows

#### 2. UploadTransactionLogTable
- Logical name: `UploadTransactionLogTable`
- Physical naming pattern: `${StackName}-upload-transaction-log`
- Key schema:
  - partition key: `quote_id`
  - sort key: `trans_id`

Purpose in dashboard:
- primary upload transaction/event reconstruction source
- storage workflow timeline
- housekeeping / overdue object visibility

#### 3. UploadIdempotencyTable
- Logical name: `UploadIdempotencyTable`
- Physical naming pattern: `${StackName}-upload-idempotency`
- Key schema:
  - partition key: `idempotency_key`
- TTL:
  - `expires_at`

Purpose in dashboard:
- idempotent upload tracking
- duplicate/retry visibility
- debugging confirm/upload replay behavior

#### 4. WalletAuthEventsTable
- Logical name: `WalletAuthEventsTable`
- Physical naming pattern: `${StackName}-wallet-auth-events`
- Key schema:
  - partition key: `event_id`
- TTL:
  - `expires_at`

Purpose in dashboard:
- wallet auth activity
- signature verification observability
- recent auth failures/successes

#### 5. ApiCallsTable
- Logical name: `ApiCallsTable`
- Physical naming pattern: `${StackName}-api-calls`
- Key schema:
  - partition key: `request_id`
- TTL:
  - `expires_at`

Purpose in dashboard:
- API request tracing
- per-route volume
- request-level observability
- top failing endpoints / recent errors

#### 6. PaymentLedgerTable
- Logical name: `PaymentLedgerTable`
- Physical naming pattern: `${StackName}-payments`
- Key schema:
  - partition key: `wallet_address`
  - sort key: `quote_id`

Purpose in dashboard:
- wallet-centric payment tracking
- payment settlement status
- quote-to-payment linkage
- customer payment history by wallet

---

## Actual Lambda Functions to Map Directly

These functions are defined in `template.yaml` and should appear explicitly in the ops/event model.

### 1. WalletAuthorizerFunction
- Logical name: `WalletAuthorizerFunction`
- Handler: `services/wallet-authorizer/app.lambda_handler`

Purpose:
- validates `X-Wallet-Signature` wallet proofs
- writes auth events to `WalletAuthEventsTable`

Dashboard usage:
- show auth success/failure activity
- expose recent signature/auth issues
- include in ops page Lambda list

### 2. PriceStorageFunction
- Logical name: `PriceStorageFunction`
- Handler: `services/price_storage_entry.lambda_handler`

Route:
- `POST /price-storage`

Environment/data dependencies:
- `QUOTES_TABLE_NAME`
- `API_CALLS_TABLE_NAME`

Purpose:
- generates storage pricing quotes
- writes quote records
- logs API calls

Dashboard usage:
- quote creation metrics
- pricing request volume
- quote funnel start

### 3. StorageUploadFunction
- Logical name: `StorageUploadFunction`
- Handler: `services/storage_upload_entry.lambda_handler`

Route:
- `POST /storage/upload`

Environment/data dependencies:
- `QUOTES_TABLE_NAME`
- `UPLOAD_TRANSACTION_LOG_TABLE_NAME`
- `UPLOAD_IDEMPOTENCY_TABLE_NAME`
- `PAYMENT_LEDGER_TABLE_NAME`
- `API_CALLS_TABLE_NAME`

Purpose:
- executes upload flow
- consumes quote context
- writes upload transaction log
- checks idempotency
- reads payment ledger

Dashboard usage:
- upload initiation activity
- upload failures
- upload-by-wallet metrics
- transaction timeline reconstruction

### 4. StorageUploadConfirmFunction
- Logical name: `StorageUploadConfirmFunction`
- Handler: `services/storage_upload_entry.confirm_upload_handler`

Route:
- `POST /storage/upload/confirm`

Environment/data dependencies:
- same core upload tables as `StorageUploadFunction`

Purpose:
- confirms upload completion/finalization path

Dashboard usage:
- distinguish upload started vs upload confirmed
- confirm-step failures
- retry / duplicate confirmation visibility

### 5. PaymentSettleFunction
- Logical name: `PaymentSettleFunction`
- Handler: `services/payment_settle_entry.lambda_handler`

Route:
- `POST /payment/settle`

Environment/data dependencies:
- `QUOTES_TABLE_NAME`
- `PAYMENT_LEDGER_TABLE_NAME`
- `API_CALLS_TABLE_NAME`

Purpose:
- settles payment
- records payment ledger entries
- uses configured settlement mode

Dashboard usage:
- payment settlement volume
- payment success/failure
- wallet payment histories
- quote-to-payment tracking

### 6. StorageLsFunction
- Logical name: `StorageLsFunction`
- Handler: `services/storage_ls_entry.lambda_handler`

Routes:
- `GET /storage/ls`
- `POST /storage/ls`

Purpose:
- lists storage objects / resolves object visibility for a wallet/object pair

Dashboard usage:
- object browsing activity
- object-level request volume
- optional wallet object drill-down

### 7. StorageDownloadFunction
- Logical name: `StorageDownloadFunction`
- Handler: `services/storage_download_entry.lambda_handler`

Routes:
- `GET /storage/download`
- `POST /storage/download`

Purpose:
- downloads/retrieves stored objects

Dashboard usage:
- download activity
- per-wallet retrieval counts
- download failure visibility

### 8. StorageDeleteFunction
- Logical name: `StorageDeleteFunction`
- Handler: `services/storage_delete_entry.lambda_handler`

Routes:
- `DELETE /storage/delete`
- `POST /storage/delete`

Purpose:
- deletes objects/buckets in storage paths

Dashboard usage:
- deletion events
- destructive-operation audit surface
- per-wallet deletion activity

### 9. StorageHousekeepingFunction
- Logical name: `StorageHousekeepingFunction`
- Handler: `services/storage-housekeeping/app.lambda_handler`

Trigger:
- EventBridge schedule
- rule logical name: `StorageHousekeepingScheduleRule`

Purpose:
- scans `UploadTransactionLogTable`
- identifies overdue storage objects
- may delete overdue objects depending on config

Dashboard usage:
- housekeeping job status
- overdue object counts
- storage cleanup audit trail
- scheduled job visibility on ops page

---

## Actual API Routes to Surface in the Dashboard

The backend SAM template defines these routes. The dashboard should use these route names as first-class labels in metrics, filters, and traces.

### Pricing / Quote
- `POST /price-storage`

### Upload
- `POST /storage/upload`
- `POST /storage/upload/confirm`

### Payment
- `POST /payment/settle`

### Storage Read / Browse
- `GET /storage/ls`
- `POST /storage/ls`
- `GET /storage/download`
- `POST /storage/download`

### Storage Delete
- `DELETE /storage/delete`
- `POST /storage/delete`

---

## Canonical Backend Identifiers

The dashboard must preserve these backend identifiers exactly where present.

### Primary Customer Key
- `wallet_address`

This is the canonical customer identifier.
All customer-level analytics should group on `wallet_address`.

### Workflow / Entity Keys
- `quote_id`
- `object_id`
- `object_id_hash`
- `object_key`
- `trans_id`
- `request_id`
- `idempotency_key`

The dashboard should never collapse these into vague generic ids if the backend already distinguishes them.

---

## Actual Request Models the Dashboard Should Respect

The SAM template defines these request model shapes and required fields.
The dashboard does not need to expose raw forms for them, but it should understand the semantics.

### PriceStorageRequest
Required:
- `wallet_address`
- `object_id`
- `object_id_hash`
- `gb`
- `provider`
- `region`

### StorageUploadRequest
Required:
- `quote_id`
- `wallet_address`
- `object_id`
- `object_id_hash`
- `wrapped_dek`

Optional fields of note:
- `object_key`
- `mode`
- `ciphertext`
- `content_sha256`
- `content_length_bytes`
- `provider`
- `location`

### UploadConfirmRequest
Required:
- `wallet_address`
- `object_key`
- `idempotency_key`
- `quote_id`

### StorageObjectRequest
Required:
- `wallet_address`
- `object_key`

Optional:
- `location`

### PaymentSettleRequest
Required:
- `quote_id`
- `wallet_address`

Optional:
- `payment`
- `payment_authorization`

---

## Event Normalization Rules

The backend stores data across multiple tables and Lambda handlers. The frontend must normalize these into a consistent event model without pretending the backend is a single event bus.

Use a canonical event shape close to:

```ts
type DashboardEvent = {
  id: string
  timestamp: string
  walletAddress?: string
  eventType: string
  source: string
  route?: string
  lambdaName?: string
  status?: "success" | "error" | "pending" | "info"
  severity?: "critical" | "high" | "medium" | "low" | "info"
  quoteId?: string
  objectId?: string
  objectKey?: string
  transId?: string
  requestId?: string
  idempotencyKey?: string
  message: string
  metadata?: Record<string, unknown>
}
```

### Suggested Event Types
Normalize to event types close to:

- `wallet_auth_succeeded`
- `wallet_auth_failed`
- `quote_created`
- `quote_expired`
- `upload_started`
- `upload_confirmed`
- `upload_failed`
- `payment_settle_started`
- `payment_settled`
- `payment_settle_failed`
- `storage_list_requested`
- `storage_download_requested`
- `storage_delete_requested`
- `housekeeping_started`
- `housekeeping_deleted_object`
- `housekeeping_completed`
- `api_call_logged`
- `lambda_invoked`
- `lambda_succeeded`
- `lambda_failed`

The agent should adapt to actual payload fields discovered in code, but keep this stable vocabulary in the UI.

---

## Dashboard Data Models

### Wallet Summary
```ts
type WalletSummary = {
  walletAddress: string
  firstSeenAt?: string
  lastSeenAt?: string
  quoteCount?: number
  uploadCount?: number
  confirmedUploadCount?: number
  paymentCount?: number
  successfulPaymentCount?: number
  failedPaymentCount?: number
  authEventCount?: number
  currentState?: string
  lastEventType?: string
}
```

### Transaction Summary
A dashboard “transaction” may need to be reconstructed from backend identifiers rather than assumed to exist as a single canonical table.

Use `quote_id` as the primary grouping anchor when possible, then enrich from:
- `UploadTransactionLogTable`
- `PaymentLedgerTable`
- `QuotesTable`
- `ApiCallsTable`

```ts
type TransactionSummary = {
  quoteId: string
  walletAddress?: string
  objectId?: string
  objectKey?: string
  createdAt?: string
  updatedAt?: string
  uploadStatus?: string
  paymentStatus?: string
  overallStatus: string
  requestIds?: string[]
  transIds?: string[]
  errorCode?: string
  errorMessage?: string
}
```

### Ops / Lambda Summary
```ts
type LambdaSummary = {
  lambdaName: string
  logicalName: string
  invocationCount?: number
  errorCount?: number
  lastSeenAt?: string
  lastErrorAt?: string
  lastErrorMessage?: string
}
```

---

## How the Dashboard Should Reconstruct the System

### Wallet-Centric View
Group by `wallet_address` across:
- `PaymentLedgerTable`
- quote-related records
- upload transaction logs
- wallet auth events
- API call traces where wallet can be derived

### Quote-Centric / Transaction View
Use `quote_id` as the main flow anchor across:
- quote creation (`QuotesTable`)
- upload activity (`UploadTransactionLogTable`)
- payment settlement (`PaymentLedgerTable`)
- API calls (`ApiCallsTable`)

### Retry / Duplicate View
Use:
- `idempotency_key`
- `request_id`
- `trans_id`

to surface duplicate uploads, confirm retries, or replay/debug behavior.

---

## AppSync Events Integration

Use **AppSync Events** for live updates where applicable, but do not rewrite the backend into an event-native architecture just for this MVP.

Preferred approach:
1. emit normalized events at the frontend integration boundary from the existing backend data/log sources
2. bridge key state changes into AppSync Events
3. keep DynamoDB and backend APIs as the source for historical/state views

Live event payloads should carry, when available:
- `wallet_address`
- `quote_id`
- `object_id`
- `object_key`
- `request_id`
- `trans_id`
- `lambdaName`
- `eventType`
- `timestamp`
- `status`

---

## Recommended Pages

### `/`
Overview dashboard:
- KPI cards
- recent live events
- quote/upload/payment trends
- recent failures
- top active wallets
- Lambda error snapshot

### `/events`
Live event stream:
- filter by wallet
- filter by route
- filter by lambda
- filter by event type
- filter by status

### `/wallets`
Wallet list:
- searchable by `wallet_address`
- counts for quotes/uploads/payments/auth events
- last seen

### `/wallets/[address]`
Wallet detail:
- auth history
- quotes
- uploads
- payments
- recent related API calls
- recent related events

### `/transactions`
Quote/transaction reconstruction view:
- group around `quote_id`
- timeline of quote → payment → upload → confirm
- error / retry visibility

### `/ops`
Operations view:
- all 9 Lambda functions
- invocation/error summaries
- recent failing requests
- route volume
- housekeeping run visibility

---

## Metrics to Show

### Customer / Wallet Metrics
- total unique wallets
- active wallets in last 24h / 7d
- new wallets vs returning wallets
- wallets with most uploads
- wallets with most payments
- wallets with most auth failures

### Quote / Transaction Metrics
- quotes created
- uploads started
- uploads confirmed
- payments settled
- failed quote/payment/upload flows
- quote-to-payment conversion
- payment-to-upload-confirm conversion

### API / Operational Metrics
- API calls by route
- API failures by route
- recent request errors
- Lambda invocations by function
- Lambda errors by function
- housekeeping executions / overdue deletions

---

## Charting Guidance

Use **Recharts** for:
- line chart: quotes / uploads / payments over time
- line chart: active wallets over time
- bar chart: API calls by route
- bar chart: Lambda errors by function
- bar chart: auth failures by wallet or over time
- pie/bar chart: transaction status distribution

Keep charts simple and readable.

---

## Implementation Guidance

### Frontend
- use **Next.js App Router**
- use **TypeScript** strictly
- use **Tailwind CSS**
- use **shadcn/ui** for standard UI primitives
- use **Recharts** for charts
- keep design compact and operationally readable

### Data Access
- create a thin Next.js server-side data layer for normalization if needed
- reuse existing backend APIs where practical
- query DynamoDB directly only where that is cleaner and already supported by deployment/runtime assumptions
- do not introduce a heavy new data warehouse for this MVP

### Do Not Do
- do not invent new backend resource names
- do not create a fake generic “customer table”
- do not hide `quote_id` / `wallet_address` / `request_id` / `trans_id`
- do not rebuild the backend APIs
- do not add multi-user auth/RBAC complexity for this MVP

---

## Deliverables

The agent should produce:
1. a working Next.js dashboard app
2. shadcn/ui initialized and used where applicable
3. typed models matching backend semantics
4. live event stream page
5. overview dashboard page
6. wallet list and wallet detail pages
7. quote/transaction reconstruction page
8. ops page that explicitly lists the 9 backend Lambda functions
9. environment/config documentation
10. README with local run and deploy instructions
11. notes on backend assumptions or gaps found during implementation

---

## Definition of Done

This is complete when:
- the dashboard shows live event activity
- wallet drill-down works from real backend identifiers
- quote/upload/payment flows are visible without inventing fake abstractions
- the 6 DynamoDB tables are mapped correctly
- the 9 Lambda functions are mapped correctly
- route-level metrics reflect actual backend routes
- the UI uses shadcn/ui for standard component primitives
- the dashboard is usable as an internal operator console

---

## Final Instruction to the Agent

Before coding:
1. read `template.yaml`
2. inspect `services/`
3. inspect `docs/`
4. map backend records to the normalized frontend models in this spec
5. only then build the dashboard

Do not guess. Reuse the backend’s actual semantics.


---

# v5 Enhancements: Sales Dashboard + Operations Command Center

## Core Intent

The dashboard must function as BOTH:
1. Sales intelligence system
2. Real-time operations/debugging console

All features below are REQUIRED for MVP v5.

---

## 1. Funnel / Conversion Metrics

The system MUST explicitly model this funnel:

quote_created → payment_settled → upload_started → upload_confirmed

### Required Outputs
- funnel visualization (counts + % conversion)
- drop-off per stage
- conversion rates:
  - quote → payment
  - payment → upload
  - upload → confirm

### Segmentations
- by wallet (top vs long tail)
- new vs returning wallets

---

## 2. Revenue Intelligence

### Required Metrics
- total revenue (24h / 7d / 30d)
- revenue over time (line chart)
- top wallets by total amount
- average revenue per wallet (ARPU)
- median transaction size
- revenue by network

### Notes
- use `amount`
- normalize units (micro-USDC → display currency)

---

## 3. Cohorts & Retention

### Required Metrics
- new wallets per day
- returning wallets per day
- retention:
  - wallets active again after first event

---

## 4. Time-to-Complete (Latency)

Using `event_ts`, compute:

- quote → payment time
- payment → upload time
- upload → confirm time

### Required Outputs
- p50 / p95 latency per stage
- latency trends over time

---

## 5. Failure Intelligence

Using `status` + `reason`:

### Required Views
- failures over time
- failures by stage
- failures by wallet
- failures by network
- top failure reasons

### Normalize reasons into categories:
- auth
- payment
- upload
- confirm
- storage
- validation
- unknown

---

## 6. Debug / Trace View

### Required Feature
Unified trace view using:

- `quote_id`
- `request_id`
- `wallet_address`

### Trace Page Must Show
- ordered timeline of events
- status transitions
- failure reason
- related Lambda
- related API route

---

## 7. Real-Time Operations Panel

### Required Widgets
- live event stream
- active wallets (last N minutes)
- rolling error rate
- recent critical failures

---

## 8. Idempotency & Retry Visibility

Using:
- `idempotency_key`
- `trans_id`

### Required Views
- duplicate requests
- retry counts per quote
- idempotency conflicts

---

## 9. Object-Level Insights

Using:
- `object_id`
- `object_id_hash`

### Required Views
- uploads per object
- duplicate object uploads
- object lifecycle timeline

---

## 10. System Health Score

Compute composite health:

Inputs:
- success rate
- error rate
- latency
- throughput

Output:
- single health score (green / yellow / red)

---

## 11. Dashboard Layout Requirements

### Top Row
- revenue (24h)
- active wallets
- success rate
- error rate

### Middle
- funnel conversion
- revenue over time
- active wallets over time

### Lower
- top wallets
- error breakdown
- recent failures

### Bottom
- live event stream

---

## Implementation Requirements for Agent

- derive metrics from existing DynamoDB tables
- do NOT create new backend systems
- compute aggregates in Next.js data layer if needed
- ensure all charts support time filtering
- ensure drill-down is available from every chart

---

## Critical Constraint

This is NOT a generic analytics dashboard.

This is a:
- wallet-based revenue system
- quote-driven transaction system
- event-driven storage/payment workflow

All metrics MUST align with:
- wallet_address
- quote_id
- request_id



---

# v6 Appendix: Predefined Queries & Aggregations (Agent Contract)

## Global Normalization

- amount_normalized = CAST(amount AS numeric) / 1_000_000
- Use normalized_status mapped to:
  - quote_created
  - payment_settled
  - upload_started
  - upload_confirmed
  - failed

---

## Named Queries

### Revenue

revenue_daily:
GROUP BY DATE_TRUNC('day', event_ts)
SUM(amount_normalized)
WHERE normalized_status = 'payment_settled'

revenue_weekly:
GROUP BY DATE_TRUNC('week', event_ts)
SUM(amount_normalized)
WHERE normalized_status = 'payment_settled'

revenue_monthly:
GROUP BY DATE_TRUNC('month', event_ts)
SUM(amount_normalized)
WHERE normalized_status = 'payment_settled'

top_wallets_by_revenue:
GROUP BY wallet_address
SUM(amount_normalized)
WHERE normalized_status = 'payment_settled'
ORDER BY SUM DESC LIMIT 10

top_wallets_by_frequency:
GROUP BY wallet_address
COUNT(DISTINCT quote_id)
ORDER BY COUNT DESC LIMIT 10

---

### Wallet Growth

wallet_growth_daily:
COUNT(DISTINCT wallet_address)
GROUP BY DATE_TRUNC('day', event_ts)

wallet_retention_cohort:
Compute first_seen_at per wallet
Then measure re-appearance over subsequent days

---

### Funnel

quote_funnel_summary:
COUNT quote_created
COUNT payment_settled
COUNT upload_started
COUNT upload_confirmed

Compute conversion % between each stage

---

### Latency

quote_latency_percentiles:
Compute:
payment_settled_at - quote_created_at
upload_started_at - payment_settled_at
upload_confirmed_at - upload_started_at

Aggregate:
p50 / p95

---

### Failures

failure_reason_breakdown:
GROUP BY normalized_reason
COUNT(*)

failure_rate_by_stage:
failed_quotes / total_quotes per stage

---

### Operations

event_rate_per_minute:
GROUP BY DATE_TRUNC('minute', event_ts)
COUNT(*)

lambda_error_summary:
GROUP BY lambda_name
COUNT(*)
WHERE is_failure = true

---

### Debug

quote_trace:
WHERE quote_id = ?
ORDER BY event_ts ASC

request_trace:
WHERE request_id = ?
ORDER BY event_ts ASC

---

### Idempotency

idempotency_conflicts:
GROUP BY idempotency_key
COUNT(*) HAVING COUNT > 1

---

### Object Insights

object_duplicate_summary:
GROUP BY object_id_hash
COUNT(DISTINCT quote_id) HAVING COUNT > 1

---

## Required Derived Tables

Agent must build:

quote_facts
wallet_facts
event_facts

These power all metrics above.

---

## Enforcement

Agent MUST:
- implement these queries explicitly
- NOT invent alternate metrics
- ensure charts map directly to these named queries



---

# v7 Appendix: TypeScript Interfaces, Query Functions, and Starter Data Layer Contract

## Goal

This appendix turns the analytics/dashboard requirements into an implementation-ready contract for the agent.

The agent must:
- define these TypeScript interfaces explicitly
- implement the query functions named below
- structure the Next.js data layer around these contracts
- keep the implementation thin and reusable
- avoid inventing alternate naming unless the repo requires a small adaptation

---

## Recommended Project Structure

Use a structure close to:

```text
app/
  (dashboard)/
    page.tsx
    events/page.tsx
    wallets/page.tsx
    wallets/[address]/page.tsx
    transactions/page.tsx
    ops/page.tsx

components/
  dashboard/
  charts/
  events/
  wallets/
  transactions/
  ops/

lib/
  aws/
    dynamodb.ts
    appsync.ts
    cloudwatch.ts
  analytics/
    normalizers.ts
    quote-facts.ts
    wallet-facts.ts
    event-facts.ts
    queries.ts
  data/
    dashboard.ts
    wallets.ts
    transactions.ts
    ops.ts
  types/
    events.ts
    wallet.ts
    transaction.ts
    metrics.ts
    api.ts
```

The exact layout can differ slightly, but the concepts should remain the same.

---

## Environment Variables

The agent should implement environment access through a typed config module.

Suggested env vars:

```ts
type EnvConfig = {
  AWS_REGION: string
  AWS_ACCESS_KEY_ID?: string
  AWS_SECRET_ACCESS_KEY?: string
  AWS_SESSION_TOKEN?: string

  QUOTES_TABLE_NAME: string
  UPLOAD_TRANSACTION_LOG_TABLE_NAME: string
  UPLOAD_IDEMPOTENCY_TABLE_NAME: string
  WALLET_AUTH_EVENTS_TABLE_NAME: string
  API_CALLS_TABLE_NAME: string
  PAYMENT_LEDGER_TABLE_NAME: string

  APPSYNC_EVENTS_ENDPOINT?: string
  APPSYNC_API_KEY?: string

  DEFAULT_TIMEZONE?: string
  DEFAULT_AMOUNT_DECIMALS?: string
}
```

If the deployment platform provides IAM-based access instead of static credentials, use the platform/IAM runtime defaults.

---

## Core TypeScript Interfaces

### Shared Identifiers

```ts
export type WalletAddress = string
export type QuoteId = string
export type RequestId = string
export type TransactionId = string
export type ObjectId = string
export type ObjectIdHash = string
export type ObjectKey = string
export type IdempotencyKey = string
export type ISODateString = string
```

---

### Raw Upload Transaction Log Row

This should mirror the known schema closely.

```ts
export interface UploadTransactionLogRow {
  quote_id: QuoteId
  trans_id: TransactionId
  event_ts: ISODateString
  status: string
  wallet_address?: WalletAddress
  amount?: number | string
  network?: string
  object_id?: ObjectId
  object_id_hash?: ObjectIdHash
  object_key?: ObjectKey
  reason?: string | null
  expires_at?: ISODateString
  request_id?: RequestId
  idempotency_key?: IdempotencyKey
}
```

---

### Raw Quote Row

Use a flexible shape because the full item schema may vary.

```ts
export interface QuoteRow {
  quote_id: QuoteId
  wallet_address?: WalletAddress
  amount?: number | string
  network?: string
  object_id?: ObjectId
  object_id_hash?: ObjectIdHash
  provider?: string
  region?: string
  created_at?: ISODateString
  expires_at?: ISODateString
  status?: string
  [key: string]: unknown
}
```

---

### Raw Payment Ledger Row

```ts
export interface PaymentLedgerRow {
  wallet_address: WalletAddress
  quote_id: QuoteId
  amount?: number | string
  network?: string
  event_ts?: ISODateString
  status?: string
  request_id?: RequestId
  reason?: string | null
  payment?: unknown
  payment_authorization?: unknown
  [key: string]: unknown
}
```

---

### Raw Wallet Auth Event Row

```ts
export interface WalletAuthEventRow {
  event_id: string
  wallet_address?: WalletAddress
  event_ts?: ISODateString
  status?: string
  reason?: string | null
  request_id?: RequestId
  [key: string]: unknown
}
```

---

### Raw API Call Row

```ts
export interface ApiCallRow {
  request_id: RequestId
  route?: string
  method?: string
  wallet_address?: WalletAddress
  quote_id?: QuoteId
  status_code?: number
  event_ts?: ISODateString
  error?: string | null
  lambda_name?: string
  [key: string]: unknown
}
```

---

### Normalized Status / Reason

```ts
export type NormalizedStatus =
  | "quote_created"
  | "payment_settled"
  | "upload_started"
  | "upload_confirmed"
  | "failed"
  | "unknown"

export type FailureCategory =
  | "auth"
  | "payment"
  | "upload"
  | "confirm"
  | "storage"
  | "validation"
  | "unknown"
```

---

### Normalized Event

```ts
export interface DashboardEvent {
  id: string
  timestamp: ISODateString
  walletAddress?: WalletAddress
  eventType: string
  source: string
  route?: string
  lambdaName?: string
  status?: "success" | "error" | "pending" | "info"
  severity?: "critical" | "high" | "medium" | "low" | "info"
  normalizedStatus?: NormalizedStatus
  normalizedReason?: FailureCategory
  quoteId?: QuoteId
  objectId?: ObjectId
  objectIdHash?: ObjectIdHash
  objectKey?: ObjectKey
  transId?: TransactionId
  requestId?: RequestId
  idempotencyKey?: IdempotencyKey
  network?: string
  amount?: number
  message: string
  metadata?: Record<string, unknown>
}
```

---

### Quote Facts

This is the most important derived interface.

```ts
export interface QuoteFacts {
  quoteId: QuoteId
  walletAddress?: WalletAddress
  network?: string
  amountNormalized?: number

  quoteCreatedAt?: ISODateString
  paymentSettledAt?: ISODateString
  uploadStartedAt?: ISODateString
  uploadConfirmedAt?: ISODateString

  hasQuoteCreated: boolean
  hasPaymentSettled: boolean
  hasUploadStarted: boolean
  hasUploadConfirmed: boolean
  hasFailure: boolean

  finalStatus: NormalizedStatus | "unknown"
  failedStage?: "quote" | "payment" | "upload" | "confirm" | "unknown"
  normalizedReason?: FailureCategory

  objectId?: ObjectId
  objectIdHash?: ObjectIdHash
  objectKey?: ObjectKey

  requestIds: RequestId[]
  transIds: TransactionId[]
  idempotencyKeys: IdempotencyKey[]

  firstSeenAt?: ISODateString
  lastSeenAt?: ISODateString
}
```

---

### Wallet Facts

```ts
export interface WalletFacts {
  walletAddress: WalletAddress
  firstSeenAt?: ISODateString
  lastSeenAt?: ISODateString

  totalQuotes: number
  totalUploadsStarted: number
  totalUploadsConfirmed: number
  totalPaymentsSettled: number
  totalFailures: number
  totalAuthFailures: number

  totalRevenue: number
  averageRevenuePerQuote?: number
  medianTransactionSize?: number

  lastNetwork?: string
  lastEventType?: string
}
```

---

### Event Facts

```ts
export interface EventFacts {
  eventId: string
  timestamp: ISODateString
  walletAddress?: WalletAddress
  quoteId?: QuoteId
  requestId?: RequestId
  transId?: TransactionId
  idempotencyKey?: IdempotencyKey
  network?: string
  amountNormalized?: number
  normalizedStatus: NormalizedStatus
  normalizedReason?: FailureCategory
  route?: string
  lambdaName?: string
  source: string
  rawStatus?: string
  rawReason?: string | null
  isFailure: boolean
}
```

---

### Metric Interfaces

```ts
export interface TimeSeriesPoint {
  bucket: ISODateString
  value: number
}

export interface SeriesBreakdownPoint {
  label: string
  value: number
}

export interface FunnelMetrics {
  quoteCreated: number
  paymentSettled: number
  uploadStarted: number
  uploadConfirmed: number

  quoteToPaymentRate: number
  paymentToUploadRate: number
  uploadToConfirmRate: number
}

export interface RevenueMetrics {
  revenue24h: number
  revenue7d: number
  revenue30d: number
  arpu?: number
  medianTransactionSize?: number
}

export interface LatencyMetrics {
  quoteToPaymentP50?: number
  quoteToPaymentP95?: number
  paymentToUploadP50?: number
  paymentToUploadP95?: number
  uploadToConfirmP50?: number
  uploadToConfirmP95?: number
}

export interface HealthScore {
  status: "green" | "yellow" | "red"
  successRate: number
  errorRate: number
  throughput: number
  latencyScore: number
}
```

---

## Normalization Functions

The agent must implement these normalization helpers.

```ts
export function normalizeAmount(value: number | string | undefined | null, decimals = 1_000_000): number

export function normalizeStatus(rawStatus?: string, rawReason?: string | null): NormalizedStatus

export function normalizeFailureCategory(rawReason?: string | null, rawStatus?: string): FailureCategory

export function coerceIsoDate(value?: string | null): ISODateString | undefined
```

### Expected Behavior

- `normalizeAmount`
  - accepts string or number
  - returns `0` or `undefined` safely if unusable
  - normalizes micro-units to display units

- `normalizeStatus`
  - maps backend statuses such as:
    - `transaction_log_written`
    - `confirm_transaction_log_written`
    - payment-settle statuses
    - known failure statuses
  - returns one of the canonical normalized statuses

- `normalizeFailureCategory`
  - maps raw reasons into:
    - auth
    - payment
    - upload
    - confirm
    - storage
    - validation
    - unknown

---

## Required Query Function Signatures

The agent must implement a typed query layer with function names close to these.

### Raw Fetchers

```ts
export interface TimeRangeInput {
  from?: ISODateString
  to?: ISODateString
}

export async function fetchUploadTransactionLogs(input?: TimeRangeInput): Promise<UploadTransactionLogRow[]>

export async function fetchQuotes(input?: TimeRangeInput): Promise<QuoteRow[]>

export async function fetchPaymentLedgerRows(input?: TimeRangeInput): Promise<PaymentLedgerRow[]>

export async function fetchWalletAuthEvents(input?: TimeRangeInput): Promise<WalletAuthEventRow[]>

export async function fetchApiCallRows(input?: TimeRangeInput): Promise<ApiCallRow[]>
```

These can use scans, queries, or backend APIs depending on the most practical implementation path, but the result types should be stable.

---

### Derived Fact Builders

```ts
export async function buildEventFacts(input?: TimeRangeInput): Promise<EventFacts[]>

export async function buildQuoteFacts(input?: TimeRangeInput): Promise<QuoteFacts[]>

export async function buildWalletFacts(input?: TimeRangeInput): Promise<WalletFacts[]>
```

These are the core analytics builders.

---

### Revenue Query Functions

```ts
export async function getRevenueDaily(input?: TimeRangeInput): Promise<TimeSeriesPoint[]>

export async function getRevenueWeekly(input?: TimeRangeInput): Promise<TimeSeriesPoint[]>

export async function getRevenueMonthly(input?: TimeRangeInput): Promise<TimeSeriesPoint[]>

export async function getRevenueMetrics(input?: TimeRangeInput): Promise<RevenueMetrics>

export async function getTopWalletsByRevenue(input?: TimeRangeInput, limit?: number): Promise<WalletFacts[]>

export async function getTopWalletsByFrequency(input?: TimeRangeInput, limit?: number): Promise<WalletFacts[]>

export async function getRevenueByNetwork(input?: TimeRangeInput): Promise<SeriesBreakdownPoint[]>
```

---

### Wallet Query Functions

```ts
export async function getWalletGrowthDaily(input?: TimeRangeInput): Promise<TimeSeriesPoint[]>

export async function getWalletRetentionCohort(input?: TimeRangeInput): Promise<Array<Record<string, unknown>>>

export async function getWalletList(input?: TimeRangeInput): Promise<WalletFacts[]>

export async function getWalletDetail(walletAddress: WalletAddress, input?: TimeRangeInput): Promise<{
  wallet: WalletFacts | null
  quotes: QuoteFacts[]
  events: DashboardEvent[]
}>
```

---

### Funnel / Conversion Query Functions

```ts
export async function getQuoteFunnelSummary(input?: TimeRangeInput): Promise<FunnelMetrics>

export async function getDropoffByStage(input?: TimeRangeInput): Promise<SeriesBreakdownPoint[]>
```

---

### Latency Query Functions

```ts
export async function getQuoteLatencyPercentiles(input?: TimeRangeInput): Promise<LatencyMetrics>

export async function getLatencyTrend(input?: TimeRangeInput): Promise<TimeSeriesPoint[]>
```

---

### Failure Query Functions

```ts
export async function getFailureReasonBreakdown(input?: TimeRangeInput): Promise<SeriesBreakdownPoint[]>

export async function getFailureRateByStage(input?: TimeRangeInput): Promise<SeriesBreakdownPoint[]>

export async function getFailuresOverTime(input?: TimeRangeInput): Promise<TimeSeriesPoint[]>

export async function getFailuresByWallet(input?: TimeRangeInput, limit?: number): Promise<SeriesBreakdownPoint[]>

export async function getFailuresByNetwork(input?: TimeRangeInput): Promise<SeriesBreakdownPoint[]>
```

---

### Operations Query Functions

```ts
export async function getEventRatePerMinute(input?: TimeRangeInput): Promise<TimeSeriesPoint[]>

export async function getLambdaErrorSummary(input?: TimeRangeInput): Promise<SeriesBreakdownPoint[]>

export async function getApiCallsByRoute(input?: TimeRangeInput): Promise<SeriesBreakdownPoint[]>

export async function getApiFailuresByRoute(input?: TimeRangeInput): Promise<SeriesBreakdownPoint[]>

export async function getActiveWallets(input?: { minutes?: number }): Promise<number>

export async function getHealthScore(input?: TimeRangeInput): Promise<HealthScore>
```

---

### Debug / Trace Query Functions

```ts
export async function getQuoteTrace(quoteId: QuoteId): Promise<DashboardEvent[]>

export async function getRequestTrace(requestId: RequestId): Promise<DashboardEvent[]>

export async function getWalletTrace(walletAddress: WalletAddress, input?: TimeRangeInput): Promise<DashboardEvent[]>

export async function getRootCausePanel(input: {
  quoteId?: QuoteId
  requestId?: RequestId
}): Promise<{
  latestEvent?: DashboardEvent
  firstFailureEvent?: DashboardEvent
  relatedEvents: DashboardEvent[]
  likelyFailureCategory?: FailureCategory
  likelyFailedStage?: QuoteFacts["failedStage"]
}>
```

---

### Idempotency / Retry Query Functions

```ts
export async function getIdempotencyConflicts(input?: TimeRangeInput): Promise<SeriesBreakdownPoint[]>

export async function getRetryCountsPerQuote(input?: TimeRangeInput): Promise<Array<{
  quoteId: QuoteId
  retryCount: number
}>>
```

---

### Object Insight Query Functions

```ts
export async function getObjectDuplicateSummary(input?: TimeRangeInput): Promise<Array<{
  objectIdHash: ObjectIdHash
  quoteCount: number
}>>

export async function getObjectLifecycle(input: {
  objectId?: ObjectId
  objectIdHash?: ObjectIdHash
}): Promise<DashboardEvent[]>
```

---

## Starter Data Layer Patterns

The agent should implement the data layer using these patterns.

### 1. Raw Source Layer
Create a low-level layer for:
- DynamoDB access
- AppSync event subscription helpers
- optional CloudWatch log access if implemented

Example modules:
- `lib/aws/dynamodb.ts`
- `lib/aws/appsync.ts`
- `lib/aws/cloudwatch.ts`

### 2. Normalization Layer
Create a middle layer that:
- maps raw rows to normalized events/facts
- handles amount normalization
- handles status/reason mapping
- deduplicates repeated records where needed

Example modules:
- `lib/analytics/normalizers.ts`
- `lib/analytics/event-facts.ts`
- `lib/analytics/quote-facts.ts`
- `lib/analytics/wallet-facts.ts`

### 3. Query Layer
Create a typed query layer that:
- exposes the named query functions in this spec
- is UI-facing
- keeps page components thin

Example module:
- `lib/analytics/queries.ts`

### 4. Page Loader Layer
Optional final wrapper that:
- groups multiple query calls into page-specific loaders

Example modules:
- `lib/data/dashboard.ts`
- `lib/data/wallets.ts`
- `lib/data/transactions.ts`
- `lib/data/ops.ts`

---

## Recommended Page Loader Signatures

```ts
export async function getOverviewPageData(input?: TimeRangeInput): Promise<{
  revenue: RevenueMetrics
  funnel: FunnelMetrics
  failures: SeriesBreakdownPoint[]
  revenueSeries: TimeSeriesPoint[]
  walletSeries: TimeSeriesPoint[]
  topWallets: WalletFacts[]
  health: HealthScore
  liveEvents: DashboardEvent[]
}>

export async function getEventsPageData(input?: TimeRangeInput): Promise<{
  events: DashboardEvent[]
  eventRate: TimeSeriesPoint[]
  lambdaErrors: SeriesBreakdownPoint[]
}>

export async function getTransactionsPageData(input?: TimeRangeInput): Promise<{
  transactions: QuoteFacts[]
  funnel: FunnelMetrics
  latency: LatencyMetrics
}>

export async function getOpsPageData(input?: TimeRangeInput): Promise<{
  lambdaErrors: SeriesBreakdownPoint[]
  apiCallsByRoute: SeriesBreakdownPoint[]
  apiFailuresByRoute: SeriesBreakdownPoint[]
  eventRate: TimeSeriesPoint[]
  failuresOverTime: TimeSeriesPoint[]
  health: HealthScore
}>
```

---

## Minimal Example Query Implementations (Pseudocode)

These are not final code, but the agent should follow the shape.

### Build Quote Facts

```ts
export async function buildQuoteFacts(input?: TimeRangeInput): Promise<QuoteFacts[]> {
  const [quotes, uploadLogs, paymentRows, apiCalls] = await Promise.all([
    fetchQuotes(input),
    fetchUploadTransactionLogs(input),
    fetchPaymentLedgerRows(input),
    fetchApiCallRows(input),
  ])

  const grouped = new Map<string, QuoteFacts>()

  // Seed from quote rows
  for (const row of quotes) {
    const existing = grouped.get(row.quote_id) ?? {
      quoteId: row.quote_id,
      walletAddress: row.wallet_address,
      network: row.network,
      amountNormalized: normalizeAmount(row.amount),
      hasQuoteCreated: true,
      hasPaymentSettled: false,
      hasUploadStarted: false,
      hasUploadConfirmed: false,
      hasFailure: false,
      finalStatus: "unknown",
      requestIds: [],
      transIds: [],
      idempotencyKeys: [],
      firstSeenAt: row.created_at,
      lastSeenAt: row.created_at,
      objectId: row.object_id,
      objectIdHash: row.object_id_hash,
    }
    grouped.set(row.quote_id, existing)
  }

  // Enrich from upload logs / payment rows / api calls
  // Map raw statuses to normalized statuses
  // Update stage timestamps
  // Mark failures
  // Collect requestIds, transIds, idempotencyKeys

  return Array.from(grouped.values())
}
```

### Revenue Daily

```ts
export async function getRevenueDaily(input?: TimeRangeInput): Promise<TimeSeriesPoint[]> {
  const facts = await buildQuoteFacts(input)

  // bucket by day using paymentSettledAt
  // include only facts.hasPaymentSettled === true
  // sum facts.amountNormalized
  return []
}
```

### Quote Trace

```ts
export async function getQuoteTrace(quoteId: QuoteId): Promise<DashboardEvent[]> {
  const events = await buildNormalizedEventsForQuote(quoteId)
  return events.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}
```

---

## UI Component Contract

The agent should bind query functions to UI components cleanly.

### Recommended bindings
- `getRevenueDaily` → revenue line chart
- `getTopWalletsByRevenue` → top wallets table/card
- `getTopWalletsByFrequency` → most frequent wallets table/card
- `getQuoteFunnelSummary` → funnel card/chart
- `getQuoteLatencyPercentiles` → latency KPI cards
- `getFailureReasonBreakdown` → failure reason chart
- `getLambdaErrorSummary` → ops error chart
- `getQuoteTrace` / `getRequestTrace` → drill-down timeline panel
- `getHealthScore` → system health badge/card

Every chart on the dashboard should map to one named query function from this appendix.

---

## Implementation Quality Rules

The agent must:
- prefer server-side data aggregation for historical views
- keep client components focused on rendering and interactivity
- avoid duplicating normalization logic across pages
- centralize status/reason mapping
- centralize amount conversion
- keep all dashboard chart inputs typed
- handle missing or partial backend fields gracefully

---

## Final Enforcement

This appendix is part of the execution contract.

The agent must not:
- rename the core query functions arbitrarily
- invent untyped anonymous data blobs for charts
- bypass normalized facts when building core sales/ops metrics
- scatter DynamoDB logic directly through page components

Instead:
- implement the typed interfaces
- implement the named query functions
- implement the raw/normalized/query/page-loader layering
- wire the dashboard UI directly to those functions


---

# v8 Appendix: Information Architecture and UI Separation

## Goal

The dashboard serves two distinct operator use cases:

1. **Sales intelligence**
2. **Operations / debugging**

These must be separated clearly in the interface.

The agent must NOT build a single mixed dashboard where revenue analytics and operational debugging are blended together without structure.

---

## Top-Level Navigation Requirement

The UI must use **top-level route separation** for the major modes of use.

Required top-level views:

- `/` → **Overview**
- `/sales` → **Sales**
- `/operations` → **Operations**
- `/wallets` → **Wallets**
- `/transactions` → **Transactions**
- `/events` → **Events**

Use these as the primary information architecture unless a very small route naming adjustment is required by the repo.

---

## Purpose of Each Top-Level View

### Overview
This is the bridge page and should provide a high-level summary from both sales and operations.

It should answer:
- what is happening overall right now
- is the business moving
- is the system healthy

It should be concise and not overloaded.

### Sales
This is the revenue and customer intelligence surface.

It should answer:
- how the business is performing
- which wallets are driving usage/revenue
- where the funnel is leaking
- whether wallets are returning

### Operations
This is the system health and debugging surface.

It should answer:
- what is broken or degraded
- where failures are occurring
- which Lambda or route is noisy
- why a request/quote likely failed

### Wallets
This is a shared investigation surface.

It should support both:
- sales questions about customer behavior
- ops questions about customer-specific failures

### Transactions
This is a shared investigation surface centered on `quote_id` / reconstructed flow state.

It should support both:
- business flow analysis
- debugging / root-cause analysis

### Events
This is a shared real-time and historical event stream surface.

It should support:
- live system observation
- ad hoc debugging
- event filtering across the entire system

---

## Required UI Separation Rules

### Rule 1: Separate Sales and Operations at the Route Level
Do not rely on a single page with mixed charts and a tab strip as the only separation.

Sales and Operations must be separate top-level views.

### Rule 2: Tabs Are for Subsections, Not the Primary Domain Split
Tabs should be used **inside** Sales and Operations, not instead of them.

### Rule 3: Shared Drill-Down Pages Stay Outside the Split
`/wallets`, `/transactions`, and `/events` should remain shared drill-down/investigation views rather than being duplicated under both Sales and Operations.

### Rule 4: Overview Is Allowed to Mix, But Only Lightly
Overview may show:
- a small revenue summary
- a small funnel summary
- a small system-health summary
- a recent failures panel
- a live events preview

It should not become a giant all-in-one wall of mixed analytics and debugging widgets.

---

## Required Navigation Pattern

Use a **sidebar navigation** as the primary navigation pattern.

Recommended sidebar entries:
- Overview
- Sales
- Operations
- Wallets
- Transactions
- Events

The exact visual style can vary, but the navigation hierarchy must remain clear and stable.

---

## Sales Page Requirements

The `/sales` route should use tabs internally.

Required tabs:

- **Revenue**
- **Funnel**
- **Wallets**
- **Retention**

### Revenue Tab
Must include:
- revenue 24h / 7d / 30d
- revenue by day / week / month
- top wallets by revenue
- ARPU
- median transaction size
- revenue by network

### Funnel Tab
Must include:
- quote → payment → upload → confirm funnel
- stage conversion %
- stage drop-off counts
- funnel segmented by wallet cohort where practical

### Wallets Tab
Must include:
- most frequent wallets
- top wallets by amount
- wallet activity ranking
- wallets with highest repeat activity

### Retention Tab
Must include:
- new wallets vs returning wallets
- wallet growth
- retention / cohort views

---

## Operations Page Requirements

The `/operations` route should use tabs internally.

Required tabs:

- **Health**
- **Failures**
- **Lambdas**
- **Trace**

### Health Tab
Must include:
- system health score
- rolling error rate
- success rate
- throughput / event rate
- latency summary (p50 / p95)

### Failures Tab
Must include:
- failures over time
- failure reasons
- failures by stage
- failures by network
- recent critical failures

### Lambdas Tab
Must include:
- the 9 Lambda functions from the backend
- error counts by Lambda
- activity by Lambda
- latest failure per Lambda where available

### Trace Tab
Must include:
- quote trace lookup
- request trace lookup
- wallet trace lookup
- root-cause panel
- retry/idempotency visibility

---

## Overview Page Requirements

The `/` route should be concise and summary-driven.

Required sections:

### KPI Row
- revenue (24h)
- active wallets
- success rate
- error rate

### Compact Trend Row
- revenue over time
- active wallets over time
- small funnel summary

### Compact Incident Row
- recent failures
- health score
- live event preview

Do not place full trace/debug panels on Overview.

---

## Shared Investigation Surfaces

### Wallets
Use `/wallets` and `/wallets/[address]` for shared investigation.

Wallet detail pages should show:
- sales-relevant summary:
  - total revenue
  - quote count
  - confirmed uploads
  - payment history
- ops-relevant summary:
  - failures
  - auth issues
  - trace links
  - recent related events

### Transactions
Use `/transactions` for reconstructed quote-centric flow investigation.

The page should support:
- status filtering
- likely failed stage
- revenue amount
- timestamps
- drill-down to quote trace / request trace

### Events
Use `/events` as the universal event stream surface.

It should support:
- route filter
- lambda filter
- wallet filter
- quote filter
- request filter
- status filter

---

## shadcn/ui Implementation Guidance for Separation

Use shadcn/ui to support the information architecture cleanly.

Recommended shadcn patterns:
- **Sidebar / app shell** for top-level navigation
- **Tabs** for Sales and Operations subsections
- **Cards** for KPI and summary modules
- **Tables** for wallets / transactions / events
- **Sheet or Dialog** for detail drill-down where appropriate
- **ScrollArea** for long event streams
- **Badge** for status and severity indicators
- **Select / DropdownMenu** for filters

Do not build custom navigation primitives if shadcn/ui already provides the required patterns.

---

## Page Loader Separation

The agent should reflect the IA split in the page data layer.

Recommended page-level loaders:

```ts
export async function getOverviewPageData(input?: TimeRangeInput): Promise<{
  revenue: RevenueMetrics
  funnel: FunnelMetrics
  failures: SeriesBreakdownPoint[]
  revenueSeries: TimeSeriesPoint[]
  walletSeries: TimeSeriesPoint[]
  topWallets: WalletFacts[]
  health: HealthScore
  liveEvents: DashboardEvent[]
}>

export async function getSalesPageData(input?: TimeRangeInput): Promise<{
  revenue: RevenueMetrics
  revenueDaily: TimeSeriesPoint[]
  revenueWeekly: TimeSeriesPoint[]
  revenueMonthly: TimeSeriesPoint[]
  topWalletsByRevenue: WalletFacts[]
  topWalletsByFrequency: WalletFacts[]
  funnel: FunnelMetrics
  walletGrowth: TimeSeriesPoint[]
  retention: Array<Record<string, unknown>>
}>

export async function getOperationsPageData(input?: TimeRangeInput): Promise<{
  health: HealthScore
  eventRate: TimeSeriesPoint[]
  failuresOverTime: TimeSeriesPoint[]
  failureReasons: SeriesBreakdownPoint[]
  failureRateByStage: SeriesBreakdownPoint[]
  lambdaErrors: SeriesBreakdownPoint[]
  apiCallsByRoute: SeriesBreakdownPoint[]
  apiFailuresByRoute: SeriesBreakdownPoint[]
}>
```

These may delegate to the lower-level query functions already defined in the spec.

---

## Implementation Quality Rule

The UI should feel like:

- one clean business dashboard
- one clean operational dashboard
- three shared investigation tools

It should not feel like:
- a single noisy admin page
- a jumble of unrelated cards
- mixed sales and debugging context on every screen

---

## Final Enforcement

The agent must:
- separate Sales and Operations at the route level
- use tabs within each domain
- keep Wallets / Transactions / Events as shared drill-down surfaces
- keep Overview compact and mixed only lightly
- align the visual hierarchy with the two distinct operator use cases


---

# v9 Appendix: Brand, Visual Language, and Product Style Alignment

## Goal

The dashboard must visually align with the existing mnemospark product website and product language.

Primary brand reference:
- Product website: `https://pawlsclick.github.io/mnemospark-website/pre-launch-test.html`

The agent should use the website as the primary visual and tone reference for:
- brand voice
- page density
- UI mood
- headline style
- product terminology
- spacing rhythm
- visual restraint

The dashboard should feel like it belongs to the same product family as the website, even though it is an internal tool.

---

## Brand Positioning Cues to Carry Into the Dashboard

The current product site positions mnemospark as:
- **"Wallet and go."**
- **agentic**
- **wallet-proof**
- **x402-native**
- **cloud storage first**
- **minimal**
- **fast**
- **no human onboarding / no API keys / no dashboard complexity** in the customer story

The internal dashboard should preserve the same product identity while adapting it to an operator use case.

That means:
- concise language
- low visual noise
- confidence over ornament
- compact, direct labeling
- modern infra/product feel rather than generic enterprise admin UI

---

## Visual Style Requirements

### Overall Mood
The UI should feel:
- clean
- sharp
- modern
- compact
- technical
- premium but restrained

It should NOT feel:
- cartoonish
- playful
- over-illustrated
- bloated
- generic bootstrap admin
- corporate enterprise beige

### Product Personality Translation for the Dashboard
Translate the website’s tone into an internal dashboard as:
- **clear over decorative**
- **precise over chatty**
- **signal-heavy over chrome-heavy**
- **dark/infra/product aesthetic over spreadsheet aesthetic**

---

## Layout and Density

The dashboard should inherit the site’s minimalist product framing.

Use:
- generous whitespace between major sections
- compact content inside cards/tables
- strong alignment
- short labels
- readable section headers
- restrained visual hierarchy

Avoid:
- overly dense card mosaics
- giant marketing-style hero sections inside the app
- unnecessary icons everywhere
- too many competing colors

---

## Typography and Copy Style

Follow the website’s concise, product-led language style.

### Copy Guidelines
Prefer:
- short section titles
- direct labels
- brief helper text
- operational phrasing

Examples of the product tone from the site:
- "Wallet and go."
- "Just Base"
- "Three steps. Zero complexity."
- "Everything you need. Nothing you don't."

The dashboard should echo that style in a more operational form.

Examples of preferred dashboard phrasing:
- "Revenue"
- "Failures"
- "Wallets"
- "Trace"
- "Live events"
- "Top wallets"
- "Recent failures"
- "Health"

Avoid verbose enterprise labels such as:
- "Customer Revenue Optimization Performance Overview Panel"
- "Operational Incident and Diagnostics Management Console"

Keep naming short and product-consistent.

---

## Color and Theme Guidance

The website content strongly emphasizes:
- wallet identity
- Base / USDC context
- cloud/storage
- modern infra minimalism

The dashboard should use a restrained palette that supports that identity.

### Recommended Theme Direction
- prefer a **dark-first** dashboard theme or dark-capable neutral theme
- use neutral surfaces with one restrained accent family
- keep success/warning/error states clear and functional
- use accent color sparingly for:
  - selected nav
  - key KPI emphasis
  - active charts
  - interactive highlights

### Color Usage Rules
- do not create a rainbow dashboard
- use semantic color only where it carries meaning
- reserve red for failures/errors
- reserve green for success/healthy states
- use muted neutrals for most chrome and layout

### Accent Strategy
If the website’s CSS exposes a primary accent or token set in the repo/site source, the agent should reuse those values directly where practical.

If exact tokens are not easily extractable, preserve the website feel by using:
- dark neutral background
- soft contrast cards
- one cool-toned accent family
- subtle borders
- restrained gradients only if already present on the site

Do not invent a bright unrelated palette.

---

## shadcn/ui Styling Guidance

Use shadcn/ui components, but style them to match mnemospark’s product identity rather than the default demo look.

The agent should:
- customize the app shell, cards, tables, tabs, and badges to feel product-specific
- avoid leaving the UI as raw out-of-the-box shadcn defaults
- align spacing, radius, border contrast, and typography with the site’s minimal product aesthetic

### Component Styling Intent
- **Cards:** subtle, crisp, low-noise
- **Tabs:** compact and product-like, not oversized
- **Tables:** readable, technical, lightly bordered
- **Badges:** semantic and understated
- **Sidebar:** clean, dark-capable, strong active state
- **Charts:** simple, low-clutter, matching the product accent strategy

---

## Page-Specific Brand Application

### Overview
Should feel like a concise command snapshot.
Think:
- strong headline
- compact KPI row
- minimal clutter
- immediate signal

### Sales
Should feel like:
- product analytics
- commercial clarity
- wallet-driven business intelligence

### Operations
Should feel like:
- infra control room
- debugging clarity
- traceability
- seriousness

### Shared Detail Views
Wallets, Transactions, and Events should feel:
- technical
- drillable
- precise
- compact

---

## Terminology Alignment

Use product terminology already present on the site/backend wherever possible.

Prefer:
- wallet
- quote
- upload
- confirm
- payment
- Base
- USDC
- cloud storage
- wallet-proof
- audit trail

Avoid introducing unrelated business terminology unless needed.

Do not rename core concepts into generic SaaS abstractions if the product already has better terms.

---

## Branding Implementation Instructions for the Agent

The agent must:

1. inspect the existing product website for visual/style cues
2. inspect the related CSS/styles if accessible in the repo/site source
3. carry those cues into:
   - layout
   - colors
   - card styling
   - nav styling
   - typography choices
   - chart styling
4. keep the dashboard consistent with the product family

The dashboard should look like:
- the internal operator console for mnemospark

It should not look like:
- a generic admin template with mnemospark text pasted on top

---

## Final Brand Enforcement

The agent must produce a UI that is:
- brand-consistent with the mnemospark website
- visually restrained
- dark-capable and modern
- concise in copy
- aligned with wallet/cloud/agentic product identity

Brand consistency is a functional requirement, not an optional design extra.


---

# v10 Appendix: Execution Order, Ambiguities, and Acceptance Criteria

## Execution Order (Strict)

The agent must follow this sequence:

1. **Read backend sources**
   - `template.yaml`
   - `services/`
   - `docs/`

2. **Read frontend/style sources**
   - mnemospark website
   - shadcn/ui repo and skill

3. **Validate backend semantics**
   - identify actual status values
   - confirm amount meaning and precision
   - confirm timestamp usage
   - confirm request_id and tracing fields

4. **Build normalization layer**
   - normalize amount
   - normalize status → canonical states
   - normalize failure reason categories

5. **Implement raw data fetchers**
   - DynamoDB
   - API calls
   - optional logs

6. **Build derived datasets**
   - `event_facts`
   - `quote_facts`
   - `wallet_facts`

7. **Implement named query functions**

8. **Implement page data loaders**

9. **Build UI shell and routes**
   - Overview
   - Sales
   - Operations
   - Wallets
   - Transactions
   - Events

10. **Build charts and tables**

11. **Integrate live events (AppSync)**

12. **Validate metrics and flows**

13. **Document assumptions and gaps**

---

## Do First (Before UI Work)

The agent MUST complete these before building pages:

- backend resource mapping
- status normalization mapping
- failure category mapping
- amount normalization
- quote lifecycle reconstruction
- typed query layer

Do not build UI on top of undefined semantics.

---

## Known Ambiguities to Resolve

The agent must verify (not assume):

- mapping of raw backend statuses to:
  - quote_created
  - payment_settled
  - upload_started
  - upload_confirmed
  - failed

- whether `amount` represents:
  - settled value
  - quoted value
  - mixed semantics

- number of decimals for `amount`

- canonical revenue source:
  - PaymentLedgerTable vs UploadTransactionLogTable

- completeness of request tracing via `request_id`

- whether AppSync Events already exists or must be introduced

- availability of CloudWatch logs for initial version

If ambiguity exists:
- choose the most reasonable interpretation
- document it explicitly

---

## Acceptance Criteria

### Overview Page
- shows revenue (24h)
- shows active wallets
- shows success rate
- shows error rate
- shows compact funnel
- shows recent failures
- shows live events preview

### Sales Page
- revenue charts (day/week/month) render
- top wallets by revenue render
- top wallets by frequency render
- funnel renders with conversion %
- retention/new vs returning renders

### Operations Page
- health score renders
- error rate renders
- failures over time renders
- failures by reason render
- Lambda error view renders
- trace lookup works (quote_id, request_id)

### Wallets
- wallet list renders
- wallet detail shows revenue, activity, failures

### Transactions
- quote-centric flows render
- stage and failure states visible
- drill-down works

### Events
- event stream renders
- filtering works

---

## Fallback Behavior Rules

If backend elements are missing or incomplete:

- if live events unavailable:
  - ship historical dashboard first
  - stub AppSync integration

- if revenue source unclear:
  - default to PaymentLedgerTable
  - document assumption

- if fields missing:
  - degrade UI gracefully
  - do not block build

- if logs unavailable:
  - rely on DynamoDB + API traces

---

## Assumptions Log (Required Output)

The agent must produce a section or document listing:

- confirmed backend mappings
- assumptions made
- unresolved ambiguities
- limitations in current implementation
- suggested improvements (optional)

---

## Out of Scope

The agent must NOT implement:

- multi-user authentication
- customer-facing UI
- full BI warehouse
- major backend redesign
- API changes
- mobile-first redesign
- advanced anomaly detection

---

## Core Principle

The system is **backend-first, UI-second**.

- do not reshape backend semantics to fit generic dashboards
- adapt the UI to reflect real system behavior
- preserve wallet, quote, request, and transaction identity exactly

---

## Final Enforcement

The agent must:

- follow execution order strictly
- resolve ambiguities explicitly
- meet acceptance criteria per page
- log assumptions
- avoid speculative implementations
