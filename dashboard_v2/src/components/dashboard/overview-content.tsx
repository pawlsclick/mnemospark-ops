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
import { aggregateSettledQuoteRevenue } from "@/lib/quote-revenue";
import { dashboardTimeRangeFromIso } from "@/lib/time-ranges";

const RevenueOverviewDocument = graphql(`
  query RevenueOverview($walletAddress: String!) {
    revenueSummary(walletAddress: $walletAddress) {
      walletAddress
      confirmedPaymentCount
      totalAmount
    }
    wdQuotes: walletDetail(walletAddress: $walletAddress) {
      quotes {
        hasPaymentSettled
        amountNormalized
        lastSeenAt
      }
    }
  }
`);

export function OverviewContent() {
  const wallet = overviewWallet();
  const [rangeFrom] = useState(dashboardTimeRangeFromIso);

  const revenueQuery = useQuery(RevenueOverviewDocument, {
    variables: { walletAddress: wallet },
    skip: !wallet,
  });

  const quoteRollups = useMemo(() => {
    const quotes = revenueQuery.data?.wdQuotes?.quotes ?? [];
    return {
      all: aggregateSettledQuoteRevenue(quotes),
      h24: aggregateSettledQuoteRevenue(quotes, { fromIsoUtc: rangeFrom.from24h }),
      d7: aggregateSettledQuoteRevenue(quotes, { fromIsoUtc: rangeFrom.from7d }),
      d30: aggregateSettledQuoteRevenue(quotes, { fromIsoUtc: rangeFrom.from30d }),
    };
  }, [revenueQuery.data, rangeFrom.from24h, rangeFrom.from7d, rangeFrom.from30d]);

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
        <strong className="font-medium text-foreground">Ledger</strong> uses{" "}
        <code className="rounded bg-muted px-1">revenueSummary</code> from mnemospark-backend. If it shows 0 but you
        see paid quotes on Transactions, the backend ledger may be out of sync with quote facts.{" "}
        <strong className="font-medium text-foreground">Quote-based revenue</strong> sums{" "}
        <code className="rounded bg-muted px-1">amountNormalized</code> for quotes with{" "}
        <code className="rounded bg-muted px-1">hasPaymentSettled</code> from{" "}
        <code className="rounded bg-muted px-1">walletDetail.quotes</code> (same source shape as the wallet detail
        page). Periods filter by <code className="rounded bg-muted px-1">lastSeenAt</code> ≥ window start (
        {TIME_RANGE_HELP}) All-time from quotes may be partial if the API caps how many quotes it returns per wallet.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ledger (revenueSummary)</CardTitle>
            <CardDescription>
              Backend payment ledger — no time range parameter on this field.
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
            <CardTitle>From settled quotes (wallet detail)</CardTitle>
            <CardDescription>
              Sum of <code className="text-xs">amountNormalized</code> where payment settled — aligns with quote-centric
              views when the ledger aggregate is wrong.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {quoteRollups.all.total.toFixed(4)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {quoteRollups.all.count} settled quote{quoteRollups.all.count === 1 ? "" : "s"} in this response
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue by period (quote facts)</CardTitle>
          <CardDescription>
            Settled quotes with <code className="text-xs">lastSeenAt</code> in the rolling window (browser-computed
            window start → now).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-border/40 pb-2">
              <dt className="text-muted-foreground">Last 24 hours</dt>
              <dd className="text-right font-medium tabular-nums">
                {quoteRollups.h24.total.toFixed(4)} · {quoteRollups.h24.count} settled
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-border/40 pb-2">
              <dt className="text-muted-foreground">Last 7 days</dt>
              <dd className="text-right font-medium tabular-nums">
                {quoteRollups.d7.total.toFixed(4)} · {quoteRollups.d7.count} settled
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Last 30 days</dt>
              <dd className="text-right font-medium tabular-nums">
                {quoteRollups.d30.total.toFixed(4)} · {quoteRollups.d30.count} settled
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
