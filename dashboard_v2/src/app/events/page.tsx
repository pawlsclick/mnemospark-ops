import { AppShell } from "@/components/dashboard/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function EventsPage() {
  return (
    <AppShell
      title="Events"
      description="Filterable event stream, rate charts, and Lambda error breakdown."
    >
      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
          <CardDescription>
            Filters, event rate per minute, Lambda errors, and full stream.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            GraphQL-backed events explorer is planned for Phase 2 (v1 parity).
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
