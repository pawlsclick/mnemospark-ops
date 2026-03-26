import { AppShell } from "@/components/dashboard/app-shell";
import { OverviewContent } from "@/components/dashboard/overview-content";

export default function OverviewPage() {
  return (
    <AppShell
      title="Overview"
      description="Dashboard health and revenue summary from the GraphQL API."
    >
      <OverviewContent />
    </AppShell>
  );
}
