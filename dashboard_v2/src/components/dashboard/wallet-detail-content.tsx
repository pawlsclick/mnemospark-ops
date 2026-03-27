"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";

import { QueryStatus } from "@/components/dashboard/query-status";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { graphql } from "@/gql";
import { formatDashboardDate } from "@/lib/datetime";

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
        hasFailure
        failedStage
      }
      events {
        id
        timestamp
        eventType
        source
        status
        message
        quoteId
        requestId
      }
    }
  }
`);

const EVENTS_PAGE_SIZE = 10;

export function WalletDetailContent({ address }: { address: string }) {
  const { data, loading, error } = useQuery(WalletDetailQuery, {
    variables: { walletAddress: address },
  });

  const d = data?.walletDetail;
  const eventList = d?.events;
  const [eventPage, setEventPage] = useState(0);
  const eventCount = eventList?.length ?? 0;
  const eventPageCount = Math.max(1, Math.ceil(eventCount / EVENTS_PAGE_SIZE));
  const safeEventPage = Math.min(eventPage, eventPageCount - 1);
  const pagedEvents = useMemo(() => {
    const all = eventList ?? [];
    const start = safeEventPage * EVENTS_PAGE_SIZE;
    return all.slice(start, start + EVENTS_PAGE_SIZE);
  }, [eventList, safeEventPage]);

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
            <CardDescription>
              <span className="font-mono">failed</span> means the quote fact&apos;s terminal state is failure
              (pipeline did not complete successfully). Use <span className="font-medium">Failed stage</span> for
              where it stopped; flags show settled payment / confirmed upload.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Quote</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 pr-4 font-medium">Failed stage</th>
                    <th className="py-2 pr-4 font-medium">Flags</th>
                    <th className="py-2 font-medium">Last seen</th>
                  </tr>
                </thead>
                <tbody>
                  {(d?.quotes ?? []).map((q) => (
                    <tr key={q.quoteId} className="border-b border-border/60">
                      <td className="py-2 pr-4 font-mono text-xs">{q.quoteId}</td>
                      <td className="py-2 pr-4">{q.finalStatus}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{q.failedStage ?? "—"}</td>
                      <td className="py-2 pr-4 text-xs text-muted-foreground">
                        pay {q.hasPaymentSettled ? "Y" : "N"} · up {q.hasUploadConfirmed ? "Y" : "N"}
                        {q.hasFailure ? " · fail" : ""}
                      </td>
                      <td className="py-2 text-muted-foreground">{formatDashboardDate(q.lastSeenAt)}</td>
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
            <CardDescription>
              Dashboard events for this wallet (capped server-side). Times are formatted in your local timezone;
              API values are ISO-8601 (usually UTC).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {pagedEvents.map((e) => (
                <li key={e.id} className="rounded-md border border-border/60 p-2">
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>{formatDashboardDate(e.timestamp)}</span>
                    <span>{e.eventType}</span>
                    <span>{e.source}</span>
                    <span>{e.status}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
                    {e.quoteId ? <span>quote: {e.quoteId}</span> : null}
                    {e.requestId ? <span>request: {e.requestId}</span> : null}
                    <span>id: {e.id}</span>
                  </div>
                  <p className="mt-1">{e.message}</p>
                </li>
              ))}
            </ul>
            {eventCount > EVENTS_PAGE_SIZE ? (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={safeEventPage <= 0}
                  onClick={() => setEventPage((p) => Math.max(0, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-muted-foreground">
                  Page {safeEventPage + 1} of {eventPageCount} · {eventCount} events
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={safeEventPage >= eventPageCount - 1}
                  onClick={() => setEventPage((p) => Math.min(eventPageCount - 1, p + 1))}
                >
                  Next
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </QueryStatus>
  );
}
