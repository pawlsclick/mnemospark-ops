# Dashboard v1

**Report date:** 2026-03-26  

**Repository:** `mnemospark-ops`  

**Last commit (repo `HEAD` at time of report):**

| Field | Value |
| --- | --- |
| Full SHA | `333f53415a6bd49cef5961808a6b2c626438c875` |
| Short | `333f534` |
| Subject | `chore: ignore AUDIT_FINDINGS.md` |
| Author date | 2026-03-22 09:49:19 +0100 |

---

## Scope

This document describes the **Next.js app** under `dashboard/` in **mnemospark-ops**: the MnemoSpark **internal Ops Console** (metadata title: “MnemoSpark Ops Dashboard”). It is read-only intelligence over DynamoDB (and optional AppSync) per `dashboard/README.md`.

---

## Intent of the code

The `dashboard` package is an **internal operator UI** for **sales and operations**. It aggregates normalized facts from backend tables (quotes, payments, uploads, API calls, wallet auth events, etc.), exposes **revenue and funnel** views for business motion, and **health, failures, Lambdas, and traces** for system reliability. It does **not** mutate backend state; it surfaces query-layer analytics and trace-style panels for investigation.

---

## What the Dashboard seeks to accomplish

1. **Single place** to see business motion (revenue, funnel, wallets) and system health (success/error rates, latency percentiles, failures, Lambda/API noise) side by side with operational context.
2. **Wallet- and quote-centric drill-down**: list wallets, open a wallet detail view, and reconstruct quote flows and recent events.
3. **Event stream visibility**: filterable event list with route/lambda/status context, plus charts for event rate and Lambda errors.
4. **Trace-oriented debugging**: Operations **Trace** tab with `quote_id` / `request_id` lookup and a root-cause summary panel (aligned with README: trace lookups exist at query layer; UI shows panels and data).

Data is loaded server-side; root layout sets `dynamic = "force-dynamic"` so pages reflect current backend data.

---

## Metrics and data captured (by domain)

The UI derives metrics from **quote facts**, **event facts**, **wallet facts**, and direct table reads (see `src/lib/analytics/queries.ts` and type definitions in `src/lib/types/`).

### Revenue and commercial

- **Revenue:** 24h / 7d / 30d totals; daily and weekly time series; **ARPU** and **median transaction size** (where computed).
- **Revenue by network** and **top network** label/value.
- Canonical settled revenue is tied to the payment ledger (per `dashboard/README.md`).

### Funnel and lifecycle

- Stage counts: **quote_created**, **payment_settled**, **upload_started**, **upload_confirmed**.
- Conversion rates: **quote→payment**, **payment→upload**, **upload→confirm**.
- **Drop-off by stage** (Sales).
- **Wallet growth** time series and **new vs returning** breakdown (Sales).

### Health and reliability

- **Health score:** `status` (green / yellow / red), **success rate**, **error rate**, **throughput**, **latency score** (`HealthScore` in `metrics.ts`).
- **Latency percentiles** (ms): quote→payment, payment→upload, upload→confirm (p50 and p95 each).

### Failures and operations

- **Failures over time**, **failure reasons**, **failure rate by stage**, **failures by network**.
- **Recent critical failures** (event rows).
- **Lambda error summary** (by function), **API failures by route**, **API calls by route**.
- **Idempotency conflicts** (breakdown; surfaced on Operations Trace tab).

### Wallets

- **Wallet list** with facts used in tables (revenue, quote/upload counts, etc.—see `WalletFacts` / wallet analytics).
- **Per-wallet detail:** total revenue, quote count, confirmed uploads, failures; **quote flows** table; **recent events** table.

### Transactions (quote-centric)

- **Quote flows** as a full **transaction table** (`TransactionTable`).
- **Status distribution** (chart).
- **Object duplicates:** object id hash → quote count list.

### Events

- **Dashboard events** with rich fields: timestamp, wallet, event type, source, route, Lambda name, status, severity, normalized status/reason, quote/object/request IDs, network, amount, message, etc. (`DashboardEvent`).
- **Event rate per minute** time series.
- **Lambda errors** breakdown chart.

### Trace (Operations)

- **Root-cause panel:** latest event, first failure, likely failure category, likely failed stage, related event count.
- **Trace events** table for related events.

---

## Pages presented (routes)

| Route | Purpose |
| --- | --- |
| `/` | Overview — summary KPIs, revenue chart, funnel snapshot, top wallets, live events preview |
| `/sales` | Sales — revenue charts, funnel, wallet leaderboards, retention |
| `/operations` | Operations — health, failures, Lambdas, trace |
| `/wallets` | Wallet list with links to detail |
| `/wallets/[address]` | Wallet detail — KPIs, quote flows, recent events |
| `/transactions` | Transactions — status distribution, object duplicates, quote flows table |
| `/events` | Events — filters, event rate, Lambda errors, full stream |

---

## Navigation and tabs

### Global navigation (all main pages)

A **left sidebar** (`AppShell` in `src/components/dashboard/app-shell.tsx`) labels the product **“Ops Console”** (mnemospark) with these **primary nav links**:

1. **Overview** → `/`
2. **Sales** → `/sales`
3. **Operations** → `/operations`
4. **Wallets** → `/wallets`
5. **Transactions** → `/transactions`
6. **Events** → `/events`

The shell also shows a header **“internal”** badge and per-page **title** and **description**.

### Page-level tabs (shadcn `Tabs`)

- **`/sales`:** **Revenue** | **Funnel** | **Wallets** | **Retention**
- **`/operations`:** **Health** | **Failures** | **Lambdas** | **Trace**  
  - Default tab can follow URL `?tab=health|failures|lambdas|trace` or switch to **Trace** when `quote_id` or `request_id` is present.

### Other interactive navigation

- **`/wallets`:** Inline links “open {address}” → `/wallets/[address]`.
- **`/events`:** GET form **filters** (wallet, quote, request, route, lambda, status) with **Apply** / **Clear**; not labeled as tabs but primary sub-navigation for the page.
- **`/operations` (Trace):** GET form for **quote_id** / **request_id** lookup.

---

## Cross-page duplication and overlap

The following **information or concepts appear on more than one page** (intentional summary vs deep-dive in some cases):

1. **Revenue (24h)** — **Overview** metric card and **Sales** (metric + expanded revenue context). **Overview** also plots **revenue over time** vs **Sales** daily/weekly charts (same family of metrics, different granularity/layout).
2. **Funnel counts and conversion rates** — **Overview** “Funnel (24h)” block vs **Sales → Funnel** tab (same funnel metrics; Sales adds **drop-off by stage** chart).
3. **Top wallets by revenue** — **Overview** “Top wallets” vs **Sales → Wallets** “Top wallets by revenue” (same role; Sales also adds **top by frequency**).
4. **Success rate / error rate** — **Overview** metric cards vs **Operations → Health** (full health card set including throughput and expanded context).
5. **Event rate (time series)** — **Operations → Health** vs **Events** page (same conceptual chart; different page framing: ops health vs event explorer).
6. **Lambda errors (breakdown chart)** — **Operations → Lambdas** vs **Events** (parallel breakdowns for Lambda error counts).
7. **Event rows (`EventTable`)** — **Overview** (live preview), **Operations** (failures list + trace-related events), **Events** (full stream), **Wallet detail** (recent events). Same component pattern; overlapping **event** semantics with different scope and filters.
8. **Quote / request investigation** — **Operations → Trace** (explicit quote_id/request_id lookup and root-cause panel) vs **Events** (quote/request/wallet filters). Different UX, overlapping **incident lookup** intent.
9. **Wallet address as navigation context** — **Wallets list** → detail; **Events** filter by wallet; events often show wallet columns—same identifier threaded through multiple surfaces.

### Implementation note (not user-visible duplication)

`getTransactionsPageData` loads **funnel** and **latency** alongside transactions (`src/lib/data/transactions.ts`), but **`/transactions` page UI** currently displays **status distribution**, **object duplicates**, and the **quote flows** table only—those extra series are **not rendered** on that route.

---

*End of report.*
