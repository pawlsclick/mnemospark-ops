"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { graphql } from "@/gql";
import { formatAmount, overviewWallet } from "@/lib/dashboard-format";
import { TIME_RANGE_HELP } from "@/lib/datetime";
import { dashboardTimeRangeFromIso } from "@/lib/time-ranges";
import { findWalletFactRow } from "@/lib/wallet-facts";

const RevenueOverviewDocument = graphql(`
  query RevenueOverview(
    $walletAddress: String!
    $from24h: String!
    $from7d: String!
    $from30d: String!
  ) {
    revenueSummary(walletAddress: $walletAddress) {
      walletAddress
      confirmedPaymentCount
      totalAmount
    }
    wf24: walletFacts(timeRange: { from: $from24h }, limit: 500) {
      walletAddress
      totalRevenue
      totalPaymentsSettled
    }
    wf7: walletFacts(timeRange: { from: $from7d }, limit: 500) {
      walletAddress
      totalRevenue
      totalPaymentsSettled
    }
    wf30: walletFacts(timeRange: { from: $from30d }, limit: 500) {
      walletAddress
      totalRevenue
      totalPaymentsSettled
    }
  }
`);

export function OverviewContent() {
  const wallet = overviewWallet();
  const [rangeFrom] = useState(dashboardTimeRangeFromIso);

  const revenueQuery = useQuery(RevenueOverviewDocument, {
    variables: {
      walletAddress: wallet,
      from24h: rangeFrom.from24h,
      from7d: rangeFrom.from7d,
      from30d: rangeFrom.from30d,
    },
    skip: !wallet,
  });

  const periodRows = useMemo(() => {
    if (!revenueQuery.data || !wallet) return null;
    const d = revenueQuery.data;
    return {
      h24: findWalletFactRow(d.wf24, wallet),
      d7: findWalletFactRow(d.wf7, wallet),
      d30: findWalletFactRow(d.wf30, wallet),
    };
  }, [revenueQuery.data, wallet]);

  if (!wallet) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue summary</CardTitle>
          <CardDescription>
            GraphQL revenueSummary (read-only, ledger-backed). Times below are shown in your browser&apos;s
            local timezone; API timestamps are ISO-8601 (usually UTC).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Set{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              NEXT_PUBLIC_DASHBOARD_WALLET_ADDRESS
            </code>{" "}
            to a wallet address to load revenue for that wallet.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (revenueQuery.loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (revenueQuery.error) {
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle>Could not load overview</CardTitle>
          <CardDescription>{revenueQuery.error.message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="outline" onClick={() => void revenueQuery.refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const summary = revenueQuery.data?.revenueSummary;

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        <strong className="font-medium text-foreground">All-time revenue</strong> uses{" "}
        <code className="rounded bg-muted px-1">revenueSummary</code> (full payment ledger for the wallet, no
        date filter in the API). <strong className="font-medium text-foreground">24h / 7d / 30d</strong> use{" "}
        <code className="rounded bg-muted px-1">walletFacts(timeRange)</code> — revenue and settled payment
        counts in that rolling window ({TIME_RANGE_HELP}) If this wallet is outside the top 500 rows for a
        window, the period may show empty even if there was activity.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>All-time revenue (ledger)</CardTitle>
            <CardDescription>
              <code className="text-xs">revenueSummary</code> — no time range parameter on this field.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summary ? (
              <>
                <p className="text-2xl font-semibold tabular-nums">{formatAmount(summary.totalAmount)}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {summary.confirmedPaymentCount} confirmed payments · {summary.walletAddress}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by period</CardTitle>
            <CardDescription>Same wallet via walletFacts + timeRange (rolling windows).</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-border/40 pb-2">
                <dt className="text-muted-foreground">Last 24 hours</dt>
                <dd className="text-right font-medium tabular-nums">
                  {periodRows?.h24
                    ? `${periodRows.h24.totalRevenue.toFixed(4)} · ${periodRows.h24.totalPaymentsSettled} settled`
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border/40 pb-2">
                <dt className="text-muted-foreground">Last 7 days</dt>
                <dd className="text-right font-medium tabular-nums">
                  {periodRows?.d7
                    ? `${periodRows.d7.totalRevenue.toFixed(4)} · ${periodRows.d7.totalPaymentsSettled} settled`
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Last 30 days</dt>
                <dd className="text-right font-medium tabular-nums">
                  {periodRows?.d30
                    ? `${periodRows.d30.totalRevenue.toFixed(4)} · ${periodRows.d30.totalPaymentsSettled} settled`
                    : "—"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
