import { AppShell } from "@/components/dashboard/app-shell";
import { WalletDetailContent } from "@/components/dashboard/wallet-detail-content";

export default async function WalletDetailPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address: raw } = await params;
  const address = decodeURIComponent(raw);

  return (
    <AppShell
      title="Wallet detail"
      description="Per-wallet KPIs, quote flows, and recent events."
    >
      <WalletDetailContent key={address} address={address} />
    </AppShell>
  );
}
