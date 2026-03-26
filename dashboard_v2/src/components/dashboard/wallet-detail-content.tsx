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

const WalletDetailQuery = graphql(`
  query WalletDetail($walletAddress: String!) {
    walletDetail(walletAddress: $walletAddress) {
      wallet {
        walletAddress
        totalRevenue
        totalQuotes
        totalPaymentsSettled
        totalUploadsConfirmed
        totalFailures
      }
      quotes {
        quoteId
        finalStatus
        lastSeenAt
        hasPaymentSettled
        hasUploadConfirmed
      }
      events {
        id
        timestamp
        eventType
        source
        status
        message
      }
    }
  }
`);

export function WalletDetailContent({ address }: { address: string }) {
  const { data, loading, error } = useQuery(WalletDetailQuery, {
    variables: { walletAddress: address },
  });

  const d = data?.walletDetail;

  return (
    <QueryStatus loading={loading} error={error}>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Wallet summary</CardTitle>
            <CardDescription className="font-mono text-xs break-all">{address}</CardDescription>
          </CardHeader>
          <CardContent>
            {d?.wallet ? (
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Total revenue</dt>
                  <dd>{d.wallet.totalRevenue.toFixed(4)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Quotes</dt>
                  <dd>{d.wallet.totalQuotes}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Payments settled</dt>
                  <dd>{d.wallet.totalPaymentsSettled}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Uploads confirmed</dt>
                  <dd>{d.wallet.totalUploadsConfirmed}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Failures</dt>
                  <dd>{d.wallet.totalFailures}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">No aggregate row for this wallet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quote flows</CardTitle>
            <CardDescription>Quotes touching this wallet.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Quote</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 font-medium">Last seen</th>
                  </tr>
                </thead>
                <tbody>
                  {(d?.quotes ?? []).map((q) => (
                    <tr key={q.quoteId} className="border-b border-border/60">
                      <td className="py-2 pr-4 font-mono text-xs">{q.quoteId}</td>
                      <td className="py-2 pr-4">{q.finalStatus}</td>
                      <td className="py-2 text-muted-foreground">{q.lastSeenAt ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent events</CardTitle>
            <CardDescription>Dashboard events for this wallet (capped).</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {(d?.events ?? []).map((e) => (
                <li key={e.id} className="rounded-md border border-border/60 p-2">
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>{e.timestamp}</span>
                    <span>{e.eventType}</span>
                    <span>{e.source}</span>
                    <span>{e.status}</span>
                  </div>
                  <p className="mt-1">{e.message}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </QueryStatus>
  );
}
