import { Suspense } from "react";

import { AppShell } from "@/components/dashboard/app-shell";
import { EventsPageContent } from "@/components/dashboard/events-page-content";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventsPage() {
  return (
    <AppShell
      title="Events"
      description="Filterable event stream aligned with v1 (GraphQL-backed)."
    >
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <EventsPageContent />
      </Suspense>
    </AppShell>
  );
}
