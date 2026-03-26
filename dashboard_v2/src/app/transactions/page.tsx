import { AppShell } from "@/components/dashboard/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TransactionsPage() {
  return (
    <AppShell
      title="Transactions"
      description="Quote-centric flows, status distribution, and object duplicate analysis."
    >
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            Status distribution, object duplicates, and the quote flows table.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            GraphQL-backed transaction explorer is planned for Phase 2 (v1
            parity).
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
