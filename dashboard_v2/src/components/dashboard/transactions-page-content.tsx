"use client";

import { useQuery } from "@apollo/client";

import { QueryStatus } from "@/components/dashboard/query-status";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { graphql } from "@/gql";

const TransactionsQuery = graphql(`
  query TransactionsPage {
    quoteFacts(limit: 500) {
      quoteId
      walletAddress
      finalStatus
      lastSeenAt
      hasPaymentSettled
      hasUploadConfirmed
    }
    statusDistribution {
      label
      value
    }
    objectDuplicateSummary {
      objectIdHash
      quoteCount
    }
  }
`);

export function TransactionsPageContent() {
  const { data, loading, error } = useQuery(TransactionsQuery);

  const quotes = data?.quoteFacts ?? [];
  const dist = data?.statusDistribution ?? [];
  const dups = data?.objectDuplicateSummary ?? [];

  return (
    <QueryStatus loading={loading} error={error}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status distribution</CardTitle>
            <CardDescription>Final status across quote facts.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {dist.map((s) => (
                <li key={s.label} className="flex justify-between gap-4">
                  <span>{s.label}</span>
                  <span className="text-muted-foreground">{s.value}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Object duplicates</CardTitle>
            <CardDescription>Hashes referenced by more than one quote.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {dups.length === 0 ? (
                <li className="text-muted-foreground">No duplicate object hashes.</li>
              ) : (
                dups.map((d) => (
                  <li key={d.objectIdHash} className="flex justify-between gap-4 font-mono text-xs">
                    <span className="truncate">{d.objectIdHash}</span>
                    <span>{d.quoteCount}</span>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Quote flows</CardTitle>
          <CardDescription>Recent quote-centric rows.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Quote</th>
                  <th className="py-2 pr-4 font-medium">Wallet</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 font-medium">Last seen</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr key={q.quoteId} className="border-b border-border/60">
                    <td className="py-2 pr-4 font-mono text-xs">{q.quoteId}</td>
                    <td className="max-w-[200px] truncate py-2 pr-4 font-mono text-xs">
                      {q.walletAddress ?? "—"}
                    </td>
                    <td className="py-2 pr-4">{q.finalStatus}</td>
                    <td className="py-2 text-muted-foreground">{q.lastSeenAt ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </QueryStatus>
  );
}
