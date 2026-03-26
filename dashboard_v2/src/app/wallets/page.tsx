import { AppShell } from "@/components/dashboard/app-shell";
import { WalletsPageContent } from "@/components/dashboard/wallets-page-content";

export default function WalletsPage() {
  return (
    <AppShell
      title="Wallets"
      description="Wallet list with drill-down to per-address metrics and events."
    >
      <WalletsPageContent />
    </AppShell>
  );
}
