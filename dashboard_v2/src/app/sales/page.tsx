import { Suspense } from "react";

import { AppShell } from "@/components/dashboard/app-shell";
import { SalesTabs } from "@/components/dashboard/sales-tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function SalesPage() {
  return (
    <AppShell
      title="Sales"
      description="Revenue, funnel, wallet leaderboards, and retention — v1 parity in Phase 2."
    >
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-10 w-full max-w-lg" />
            <Skeleton className="h-44 w-full" />
          </div>
        }
      >
        <SalesTabs />
      </Suspense>
    </AppShell>
  );
}
