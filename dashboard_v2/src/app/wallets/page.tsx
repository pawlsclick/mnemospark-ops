import { AppShell } from "@/components/dashboard/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function WalletsPage() {
  return (
    <AppShell
      title="Wallets"
      description="Wallet list with drill-down to per-address metrics and events."
    >
      <Card>
        <CardHeader>
          <CardTitle>Wallet directory</CardTitle>
          <CardDescription>
            Table of wallet facts (revenue, quote/upload counts, etc.) with links
            to detail pages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            GraphQL-backed wallet list and filters are planned for Phase 2. Open a
            wallet address from the URL (e.g.{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              /wallets/&lt;address&gt;
            </code>
            ) when the API surface is ready.
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
