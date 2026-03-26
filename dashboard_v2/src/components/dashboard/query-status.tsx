"use client";

import { type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function QueryStatus({
  loading,
  error,
  children,
  empty,
}: {
  loading: boolean;
  error: Error | undefined;
  children: ReactNode;
  empty?: ReactNode;
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  if (error) {
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle>Could not load data</CardTitle>
          <CardDescription>{error.message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }
  if (empty) {
    return <>{empty}</>;
  }
  return <>{children}</>;
}
