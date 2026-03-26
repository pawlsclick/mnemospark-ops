import { AppShell } from "@/components/dashboard/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function WalletDetailPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;

  return (
    <AppShell
      title="Wallet detail"
      description="Per-wallet KPIs, quote flows, and recent events."
    >
      <Card>
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
          <CardDescription className="font-mono text-xs break-all">
            {address}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Detail views for a single wallet will load from GraphQL in Phase 2.
            This route is wired so deep links and navigation match v1.
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
