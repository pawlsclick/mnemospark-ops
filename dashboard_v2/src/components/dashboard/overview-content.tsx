"use client";

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

const HealthCheckDocument = graphql(`
  query HealthCheck {
    health {
      ok
    }
  }
`);

const RevenueOverviewDocument = graphql(`
  query RevenueOverview($walletAddress: String!) {
    revenueSummary(walletAddress: $walletAddress) {
      walletAddress
      confirmedPaymentCount
      totalAmount
    }
  }
`);

function overviewWallet(): string {
  return process.env.NEXT_PUBLIC_DASHBOARD_WALLET_ADDRESS?.trim() ?? "";
}

function formatAmount(totalAmount: string) {
  const n = Number.parseFloat(totalAmount);
  if (Number.isNaN(n)) {
    return totalAmount;
  }
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(n);
}

export function OverviewContent() {
  const wallet = overviewWallet();

  const healthQuery = useQuery(HealthCheckDocument);
  const revenueQuery = useQuery(RevenueOverviewDocument, {
    variables: { walletAddress: wallet },
    skip: !wallet,
  });

  const loading =
    healthQuery.loading || (!wallet ? false : revenueQuery.loading);
  const error = healthQuery.error ?? revenueQuery.error;

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle>Could not load overview</CardTitle>
          <CardDescription>{error.message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void healthQuery.refetch();
              if (wallet) void revenueQuery.refetch();
            }}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const healthOk = healthQuery.data?.health.ok ?? false;
  const summary = revenueQuery.data?.revenueSummary;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>API health</CardTitle>
          <CardDescription>GraphQL health probe</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">
            {healthOk ? "Healthy" : "Unhealthy"}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {healthOk
              ? "Resolver responded successfully."
              : "Health check returned false."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue summary</CardTitle>
          <CardDescription>
            GraphQL revenueSummary (read-only, ledger-backed)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!wallet ? (
            <p className="text-sm text-muted-foreground">
              Set{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                NEXT_PUBLIC_DASHBOARD_WALLET_ADDRESS
              </code>{" "}
              to a wallet address to load revenue for that wallet.
            </p>
          ) : summary ? (
            <>
              <p className="text-2xl font-semibold tabular-nums">
                {formatAmount(summary.totalAmount)}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {summary.confirmedPaymentCount} confirmed payments ·{" "}
                {summary.walletAddress}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">No data</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
