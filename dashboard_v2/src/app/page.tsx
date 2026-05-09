import { AppShell } from "@/components/dashboard/app-shell";
import { OverviewContent } from "@/components/dashboard/overview-content";

export default function OverviewPage() {
  return (
    <AppShell
      title="Overview"
      description="Revenue by period and all-time ledger totals from the mnemospark GraphQL API."
    >
      <OverviewContent />
    </AppShell>
  );
}
