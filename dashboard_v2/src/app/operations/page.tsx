import { Suspense } from "react";

import { AppShell } from "@/components/dashboard/app-shell";
import { OperationsTabs } from "@/components/dashboard/operations-tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function OperationsPage() {
  return (
    <AppShell
      title="Operations"
      description="Health, failures, Lambdas, and trace — v1 parity in Phase 2."
    >
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-10 w-full max-w-lg" />
            <Skeleton className="h-44 w-full" />
          </div>
        }
      >
        <OperationsTabs />
      </Suspense>
    </AppShell>
  );
}
