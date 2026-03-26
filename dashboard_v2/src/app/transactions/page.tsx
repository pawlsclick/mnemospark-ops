import { AppShell } from "@/components/dashboard/app-shell";
import { TransactionsPageContent } from "@/components/dashboard/transactions-page-content";

export default function TransactionsPage() {
  return (
    <AppShell
      title="Transactions"
      description="Quote-centric flows, status distribution, and object duplicate analysis."
    >
      <TransactionsPageContent />
    </AppShell>
  );
}
