"use client";

import Link from "next/link";
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

const WalletFactsQuery = graphql(`
  query WalletFactsPage($limit: Int!) {
    walletFacts(limit: $limit) {
      walletAddress
      totalRevenue
      totalQuotes
      medianTransactionSize
      lastSeenAt
      firstSeenAt
    }
  }
`);

export function WalletsPageContent() {
  const { data, loading, error } = useQuery(WalletFactsQuery, {
    variables: { limit: 200 },
  });

  const rows = data?.walletFacts ?? [];

  return (
    <QueryStatus loading={loading} error={error}>
      <Card>
        <CardHeader>
          <CardTitle>Wallets</CardTitle>
          <CardDescription>
            Sorted by total revenue (GraphQL). Open a row for detail. Last seen is formatted in your local
            timezone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Wallet</th>
                  <th className="py-2 pr-4 font-medium">Revenue</th>
                  <th className="py-2 pr-4 font-medium">Quotes</th>
                  <th className="py-2 pr-4 font-medium">Median tx</th>
                  <th className="py-2 font-medium">Last seen</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((w) => (
                  <tr key={w.walletAddress} className="border-b border-border/60">
                    <td className="py-2 pr-4 font-mono text-xs">
                      <Link
                        href={`/wallets/${encodeURIComponent(w.walletAddress)}`}
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        {w.walletAddress}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">{w.totalRevenue.toFixed(4)}</td>
                    <td className="py-2 pr-4">{w.totalQuotes}</td>
                    <td className="py-2 pr-4">{w.medianTransactionSize.toFixed(4)}</td>
                    <td className="py-2 text-muted-foreground">{formatDashboardDate(w.lastSeenAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No wallet facts in range.</p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </QueryStatus>
  );
}
