"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { QueryStatus } from "@/components/dashboard/query-status";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabBar } from "@/components/ui/tab-bar";
import { graphql } from "@/gql";
import { formatAmount, overviewWallet } from "@/lib/dashboard-format";
import { formatDashboardDate, TIME_RANGE_HELP } from "@/lib/datetime";
import { aggregateSettledQuoteRevenue } from "@/lib/quote-revenue";
import { dashboardTimeRangeFromIso } from "@/lib/time-ranges";

const TABS = [
  { id: "revenue", label: "Revenue" },
  { id: "funnel", label: "Funnel" },
  { id: "wallets", label: "Wallets" },
  { id: "retention", label: "Retention" },
] as const;

const SalesRevenueQuery = graphql(`
  query SalesRevenue($wallet: String!, $limit: Int!) {
    revenueSummary(walletAddress: $wallet) {
      walletAddress
      confirmedPaymentCount
      totalAmount
    }
    walletFacts(limit: $limit) {
      walletAddress
      totalRevenue
      totalQuotes
    }
    wdQuotes: walletDetail(walletAddress: $wallet) {
      quotes {
        hasPaymentSettled
        amountNormalized
        lastSeenAt
      }
    }
  }
`);

const SalesFunnelQuery = graphql(`
  query SalesFunnel {
    quoteFunnel {
      quoteCreated
      paymentSettled
      uploadStarted
      uploadConfirmed
      quoteToPaymentRate
      paymentToUploadRate
      uploadToConfirmRate
    }
  }
`);

const SalesWalletsQuery = graphql(`
  query SalesWallets($limit: Int!) {
    walletFacts(limit: $limit) {
      walletAddress
      totalRevenue
      totalQuotes
      medianTransactionSize
      firstSeenAt
      lastSeenAt
    }
  }
`);

export function SalesTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const rangeFrom = useMemo(() => dashboardTimeRangeFromIso(), []);
  const raw = searchParams.get("tab") ?? "revenue";
  const activeId = useMemo(() => {
    return TABS.some((t) => t.id === raw) ? raw : "revenue";
  }, [raw]);

  const setTab = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const wallet = overviewWallet();

  const revenueQ = useQuery(SalesRevenueQuery, {
    variables: { wallet, limit: 15 },
    skip: !wallet || activeId !== "revenue",
  });

  const quoteRollups = useMemo(() => {
    const quotes = revenueQ.data?.wdQuotes?.quotes ?? [];
    return {
      all: aggregateSettledQuoteRevenue(quotes),
      h24: aggregateSettledQuoteRevenue(quotes, { fromIsoUtc: rangeFrom.from24h }),
      d7: aggregateSettledQuoteRevenue(quotes, { fromIsoUtc: rangeFrom.from7d }),
      d30: aggregateSettledQuoteRevenue(quotes, { fromIsoUtc: rangeFrom.from30d }),
    };
  }, [revenueQ.data, rangeFrom.from24h, rangeFrom.from7d, rangeFrom.from30d]);

  const funnelQ = useQuery(SalesFunnelQuery, { skip: activeId !== "funnel" });

  const walletsQ = useQuery(SalesWalletsQuery, {
    variables: { limit: 50 },
    skip: activeId !== "wallets" && activeId !== "retention",
  });

  return (
    <div className="space-y-6">
      <TabBar aria-label="Sales sections" tabs={TABS} activeId={activeId} onChange={setTab} />

      {activeId === "revenue" ? (
        <QueryStatus
          loading={revenueQ.loading}
          error={revenueQ.error}
          empty={
            !wallet ? (
              <Card>
                <CardHeader>
                  <CardTitle>Configure wallet</CardTitle>
                  <CardDescription>
                    Set NEXT_PUBLIC_DASHBOARD_WALLET_ADDRESS for the configured revenue card.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : undefined
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Configured wallet revenue</CardTitle>
                <CardDescription>
                  <strong>Ledger</strong>: <code className="text-xs">revenueSummary</code>.{" "}
                  <strong>Quotes</strong>: sum <code className="text-xs">amountNormalized</code> for{" "}
                  <code className="text-xs">hasPaymentSettled</code> from <code className="text-xs">walletDetail</code>{" "}
                  (same idea as Overview when ledger is 0). Periods filter by <code className="text-xs">lastSeenAt</code>{" "}
                  ≥ window start. {TIME_RANGE_HELP}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">All-time (ledger)</p>
                  <p className="text-2xl font-semibold">
                    {formatAmount(revenueQ.data?.revenueSummary.totalAmount ?? "0")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {revenueQ.data?.revenueSummary.confirmedPaymentCount ?? 0} confirmed payments
                  </p>
                </div>
                <div className="border-t border-border/50 pt-3">
                  <p className="text-xs font-medium text-muted-foreground">All-time (settled quotes in response)</p>
                  <p className="text-xl font-semibold tabular-nums">{quoteRollups.all.total.toFixed(4)}</p>
                  <p className="text-sm text-muted-foreground">
                    {quoteRollups.all.count} settled quote{quoteRollups.all.count === 1 ? "" : "s"}
                  </p>
                </div>
                <dl className="space-y-2 border-t border-border/50 pt-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">24h</dt>
                    <dd className="text-right font-medium tabular-nums">
                      {quoteRollups.h24.total.toFixed(4)} · {quoteRollups.h24.count} settled
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">7d</dt>
                    <dd className="text-right font-medium tabular-nums">
                      {quoteRollups.d7.total.toFixed(4)} · {quoteRollups.d7.count} settled
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">30d</dt>
                    <dd className="text-right font-medium tabular-nums">
                      {quoteRollups.d30.total.toFixed(4)} · {quoteRollups.d30.count} settled
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top wallets by revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {(revenueQ.data?.walletFacts ?? []).map((w) => (
                    <li key={w.walletAddress} className="flex justify-between gap-2 font-mono text-xs">
                      <span className="truncate">{w.walletAddress}</span>
                      <span>{w.totalRevenue.toFixed(4)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </QueryStatus>
      ) : null}

      {activeId === "funnel" ? (
        <QueryStatus loading={funnelQ.loading} error={funnelQ.error}>
          {(() => {
            const f = funnelQ.data?.quoteFunnel;
            if (!f) return null;
            const chart = [
              { stage: "Quotes", count: f.quoteCreated },
              { stage: "Paid", count: f.paymentSettled },
              { stage: "Upload", count: f.uploadStarted },
              { stage: "Done", count: f.uploadConfirmed },
            ];
            return (
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Funnel counts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <dt>Quote created</dt>
                        <dd>{f.quoteCreated}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Payment settled</dt>
                        <dd>{f.paymentSettled}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Upload started</dt>
                        <dd>{f.uploadStarted}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Upload confirmed</dt>
                        <dd>{f.uploadConfirmed}</dd>
                      </div>
                    </dl>
                    <p className="mt-4 text-xs text-muted-foreground">
                      Conversion: quote→payment {f.quoteToPaymentRate}% · payment→upload{" "}
                      {f.paymentToUploadRate}% · upload→confirm {f.uploadToConfirmRate}%
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Funnel chart</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chart}>
                        <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            );
          })()}
        </QueryStatus>
      ) : null}

      {activeId === "wallets" ? (
        <QueryStatus loading={walletsQ.loading} error={walletsQ.error}>
          <Card>
            <CardHeader>
              <CardTitle>Wallet leaderboard</CardTitle>
              <CardDescription>Top {walletsQ.data?.walletFacts.length ?? 0} by revenue.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">Wallet</th>
                      <th className="py-2 pr-4 font-medium">Revenue</th>
                      <th className="py-2 font-medium">Quotes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(walletsQ.data?.walletFacts ?? []).map((w) => (
                      <tr key={w.walletAddress} className="border-b border-border/60">
                        <td className="py-2 pr-4 font-mono text-xs">{w.walletAddress}</td>
                        <td className="py-2 pr-4">{w.totalRevenue.toFixed(4)}</td>
                        <td className="py-2">{w.totalQuotes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </QueryStatus>
      ) : null}

      {activeId === "retention" ? (
        <QueryStatus loading={walletsQ.loading} error={walletsQ.error}>
          <Card>
            <CardHeader>
              <CardTitle>First vs last activity</CardTitle>
              <CardDescription>Simple retention proxy from wallet facts.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">Wallet</th>
                      <th className="py-2 pr-4 font-medium">First seen</th>
                      <th className="py-2 font-medium">Last seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(walletsQ.data?.walletFacts ?? []).map((w) => (
                      <tr key={w.walletAddress} className="border-b border-border/60">
                        <td className="py-2 pr-4 font-mono text-xs">{w.walletAddress}</td>
                        <td className="py-2 pr-4 text-muted-foreground">
                          {formatDashboardDate(w.firstSeenAt)}
                        </td>
                        <td className="py-2 text-muted-foreground">{formatDashboardDate(w.lastSeenAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </QueryStatus>
      ) : null}
    </div>
  );
}
