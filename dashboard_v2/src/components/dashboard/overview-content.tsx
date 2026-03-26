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

const DashboardOverviewDocument = graphql(`
  query DashboardOverview {
    health {
      ok
    }
    revenueSummary {
      totalCents
      currency
    }
  }
`);

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function OverviewContent() {
  const { data, loading, error, refetch } = useQuery(DashboardOverviewDocument);

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
          <Button type="button" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const healthOk = data?.health.ok ?? false;
  const summary = data?.revenueSummary;

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
            GraphQL revenueSummary (read-only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summary ? (
            <p className="text-2xl font-semibold tabular-nums">
              {formatMoney(summary.totalCents, summary.currency)}
            </p>
          ) : (
            <p className="text-muted-foreground">No data</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
