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
    wd24: walletDetail(walletAddress: $walletAddress, timeRange: { from: $from24h }) {
      wallet {
        walletAddress
        totalRevenue
        totalPaymentsSettled
      }
    }
    wd7: walletDetail(walletAddress: $walletAddress, timeRange: { from: $from7d }) {
      wallet {
        walletAddress
        totalRevenue
        totalPaymentsSettled
      }
    }
    wd30: walletDetail(walletAddress: $walletAddress, timeRange: { from: $from30d }) {
      wallet {
        walletAddress
        totalRevenue
        totalPaymentsSettled
      }
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

  const periodWallet = useMemo(() => {
    if (!revenueQuery.data) return null;
    const d = revenueQuery.data;
    return {
      h24: d.wd24.wallet,
      d7: d.wd7.wallet,
      d30: d.wd30.wallet,
    };
  }, [revenueQuery.data]);

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
        date filter in the API). The configured address is sent as{" "}
        <strong className="font-medium text-foreground">EIP-55 checksum</strong> when it is valid hex.{" "}
        <strong className="font-medium text-foreground">24h / 7d / 30d</strong> use{" "}
        <code className="rounded bg-muted px-1">walletDetail(timeRange)</code> for that wallet only (
        {TIME_RANGE_HELP}) If a period still shows empty, the backend likely has no settled payments in that window
        for this address.
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
            <CardDescription>
              Per-wallet aggregates via <code className="text-xs">walletDetail</code> + timeRange (not the global
              walletFacts leaderboard).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-border/40 pb-2">
                <dt className="text-muted-foreground">Last 24 hours</dt>
                <dd className="text-right font-medium tabular-nums">
                  {periodWallet?.h24
                    ? `${periodWallet.h24.totalRevenue.toFixed(4)} · ${periodWallet.h24.totalPaymentsSettled} settled`
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border/40 pb-2">
                <dt className="text-muted-foreground">Last 7 days</dt>
                <dd className="text-right font-medium tabular-nums">
                  {periodWallet?.d7
                    ? `${periodWallet.d7.totalRevenue.toFixed(4)} · ${periodWallet.d7.totalPaymentsSettled} settled`
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Last 30 days</dt>
                <dd className="text-right font-medium tabular-nums">
                  {periodWallet?.d30
                    ? `${periodWallet.d30.totalRevenue.toFixed(4)} · ${periodWallet.d30.totalPaymentsSettled} settled`
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
