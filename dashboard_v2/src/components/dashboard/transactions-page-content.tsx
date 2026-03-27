"use client";

import { useMemo } from "react";
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
import { formatDashboardDate } from "@/lib/datetime";

const TransactionsQuery = graphql(`
  query TransactionsPage {
    quoteFacts(limit: 500) {
      quoteId
      walletAddress
      finalStatus
      lastSeenAt
      hasPaymentSettled
      hasUploadConfirmed
      hasFailure
      failedStage
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

  const quoteFacts = data?.quoteFacts;
  const quotes = quoteFacts ?? [];
  const dist = data?.statusDistribution ?? [];
  const dups = data?.objectDuplicateSummary ?? [];

  const failedByStage = useMemo(() => {
    const m = new Map<string, number>();
    for (const q of quoteFacts ?? []) {
      if (q.finalStatus !== "failed") continue;
      const key = q.failedStage?.trim() || "unknown stage";
      m.set(key, (m.get(key) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [quoteFacts]);

  return (
    <QueryStatus loading={loading} error={error}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status distribution</CardTitle>
            <CardDescription>
              Server-side counts of <span className="font-medium">final</span> quote status per quote fact.{" "}
              <span className="font-mono">failed</span> means the quote never reached a successful terminal state
              in the pipeline (see failed stage in the table below).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-1 text-sm">
              {dist.map((s) => (
                <li key={s.label} className="flex justify-between gap-4">
                  <span>{s.label}</span>
                  <span className="text-muted-foreground">{s.value}</span>
                </li>
              ))}
            </ul>
            {failedByStage.length > 0 ? (
              <div className="border-t border-border/50 pt-3">
                <p className="text-xs font-medium text-muted-foreground">Failed quotes in this sample (by stage)</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {failedByStage.map(([stage, n]) => (
                    <li key={stage} className="flex justify-between gap-4">
                      <span className="text-muted-foreground">{stage}</span>
                      <span>{n}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-muted-foreground">
                  Derived from the same <code className="rounded bg-muted px-1">quoteFacts</code> sample (limit 500),
                  not a full-table aggregate.
                </p>
              </div>
            ) : null}
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
          <CardDescription>
            Recent quote-centric rows. <span className="font-mono">failed</span> is the quote fact&apos;s terminal
            status; <span className="font-medium">Failed stage</span> is the pipeline stage where it stopped (from
            the API).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Quote</th>
                  <th className="py-2 pr-4 font-medium">Wallet</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Failed stage</th>
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
                    <td className="py-2 pr-4 text-muted-foreground">{q.failedStage ?? "—"}</td>
                    <td className="py-2 text-muted-foreground">{formatDashboardDate(q.lastSeenAt)}</td>
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
