"use client";

import { useQuery } from "@apollo/client";

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
  query HealthCheckSidebar {
    health {
      ok
    }
  }
`);

export function HealthSidebarCard() {
  const { data, loading, error } = useQuery(HealthCheckDocument);

  return (
    <Card className="mt-8 border-border/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">API health</CardTitle>
        <CardDescription className="text-xs">GraphQL health probe</CardDescription>
      </CardHeader>
      <CardContent className="text-xs">
        {loading ? <Skeleton className="h-8 w-full" /> : null}
        {error ? (
          <p className="text-destructive">{error.message}</p>
        ) : null}
        {!loading && !error && data ? (
          <>
            <p className="text-base font-semibold">
              {data.health.ok ? "Healthy" : "Unhealthy"}
            </p>
            <p className="mt-1 text-muted-foreground">
              {data.health.ok
                ? "Resolver responded successfully."
                : "Health check returned false."}
            </p>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
