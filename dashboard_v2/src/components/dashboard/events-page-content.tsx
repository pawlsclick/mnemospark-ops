"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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

const EventsQuery = graphql(`
  query EventsPage($limit: Int!, $filters: DashboardEventFilterInput) {
    dashboardEvents(limit: $limit, filters: $filters) {
      id
      timestamp
      walletAddress
      eventType
      source
      route
      lambdaName
      status
      quoteId
      requestId
      message
    }
  }
`);

const PAGE_SIZE = 50;

export function EventsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [wallet, setWallet] = useState(searchParams.get("wallet") ?? "");
  const [quoteId, setQuoteId] = useState(searchParams.get("quoteId") ?? "");
  const [requestId, setRequestId] = useState(searchParams.get("requestId") ?? "");
  const [route, setRoute] = useState(searchParams.get("route") ?? "");
  const [lambdaName, setLambdaName] = useState(searchParams.get("lambda") ?? "");

  const [filters, setFilters] = useState(() => {
    const f: {
      walletAddress?: string;
      quoteId?: string;
      requestId?: string;
      route?: string;
      lambdaName?: string;
    } = {};
    if (wallet.trim()) f.walletAddress = wallet.trim();
    if (quoteId.trim()) f.quoteId = quoteId.trim();
    if (requestId.trim()) f.requestId = requestId.trim();
    if (route.trim()) f.route = route.trim();
    if (lambdaName.trim()) f.lambdaName = lambdaName.trim();
    return Object.keys(f).length ? f : undefined;
  });

  const [page, setPage] = useState(0);

  const { data, loading, error } = useQuery(EventsQuery, {
    variables: { limit: 1500, filters },
  });

  const eventRows = data?.dashboardEvents;
  const rowCount = eventRows?.length ?? 0;
  const pageCount = Math.max(1, Math.ceil(rowCount / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pagedRows = useMemo(() => {
    const rows = eventRows ?? [];
    const start = safePage * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [eventRows, safePage]);

  const apply = useCallback(() => {
    const nextFilters: {
      walletAddress?: string;
      quoteId?: string;
      requestId?: string;
      route?: string;
      lambdaName?: string;
    } = {};
    if (wallet.trim()) nextFilters.walletAddress = wallet.trim();
    if (quoteId.trim()) nextFilters.quoteId = quoteId.trim();
    if (requestId.trim()) nextFilters.requestId = requestId.trim();
    if (route.trim()) nextFilters.route = route.trim();
    if (lambdaName.trim()) nextFilters.lambdaName = lambdaName.trim();
    setFilters(Object.keys(nextFilters).length ? nextFilters : undefined);
    setPage(0);

    const params = new URLSearchParams();
    if (wallet.trim()) params.set("wallet", wallet.trim());
    if (quoteId.trim()) params.set("quoteId", quoteId.trim());
    if (requestId.trim()) params.set("requestId", requestId.trim());
    if (route.trim()) params.set("route", route.trim());
    if (lambdaName.trim()) params.set("lambda", lambdaName.trim());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [wallet, quoteId, requestId, route, lambdaName, pathname, router]);

  const clear = useCallback(() => {
    setWallet("");
    setQuoteId("");
    setRequestId("");
    setRoute("");
    setLambdaName("");
    setFilters(undefined);
    setPage(0);
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Optional filters match v1 Events page semantics (query params in URL).{" "}
            <span className="font-medium">Request ID</span> is the API/request correlation id stored on dashboard
            events (e.g. API Gateway or Lambda request id when the backend emits it); use it with Operations → Trace
            when the same value appears on events.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm">
            <span className="text-muted-foreground">Wallet</span>
            <input
              className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">Quote ID</span>
            <input
              className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs"
              value={quoteId}
              onChange={(e) => setQuoteId(e.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">Request ID</span>
            <input
              className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs"
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">Route</span>
            <input
              className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs"
              value={route}
              onChange={(e) => setRoute(e.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">Lambda</span>
            <input
              className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs"
              value={lambdaName}
              onChange={(e) => setLambdaName(e.target.value)}
            />
          </label>
          <div className="flex items-end gap-2">
            <Button type="button" onClick={apply}>
              Apply
            </Button>
            <Button type="button" variant="outline" onClick={clear}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <QueryStatus loading={loading} error={error}>
        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
            <CardDescription>
              {rowCount} rows (capped server-side). Times shown in your local timezone; API is ISO-8601 (usually
              UTC).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-2 pr-2">Time</th>
                    <th className="py-2 pr-2">Type</th>
                    <th className="py-2 pr-2">Source</th>
                    <th className="py-2 pr-2">Status</th>
                    <th className="py-2 pr-2">Quote</th>
                    <th className="py-2 pr-2">Request</th>
                    <th className="py-2">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.map((e) => (
                    <tr key={e.id} className="border-b border-border/40">
                      <td className="py-2 pr-2 align-top whitespace-nowrap">{formatDashboardDate(e.timestamp)}</td>
                      <td className="py-2 pr-2 align-top">{e.eventType}</td>
                      <td className="py-2 pr-2 align-top">{e.source}</td>
                      <td className="py-2 pr-2 align-top">{e.status}</td>
                      <td className="max-w-[120px] truncate py-2 pr-2 align-top font-mono">{e.quoteId ?? "—"}</td>
                      <td className="max-w-[120px] truncate py-2 pr-2 align-top font-mono">{e.requestId ?? "—"}</td>
                      <td className="py-2 align-top">{e.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rowCount > PAGE_SIZE ? (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={safePage <= 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-muted-foreground">
                  Page {safePage + 1} of {pageCount} · {PAGE_SIZE} per page
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={safePage >= pageCount - 1}
                  onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                >
                  Next
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </QueryStatus>
    </div>
  );
}
