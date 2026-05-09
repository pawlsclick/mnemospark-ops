"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLazyQuery, useQuery } from "@apollo/client";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { QueryStatus } from "@/components/dashboard/query-status";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabBar } from "@/components/ui/tab-bar";
import { graphql } from "@/gql";
import { formatDashboardDate, formatDashboardDateUtc } from "@/lib/datetime";
import { dashboardTimeRangeFromIso } from "@/lib/time-ranges";

const TABS = [
  { id: "health", label: "Health" },
  { id: "failures", label: "Failures" },
  { id: "lambdas", label: "Lambdas" },
  { id: "trace", label: "Trace" },
] as const;

const OpsHealthQuery = graphql(`
  query OpsHealth($timeRange: TimeRangeInput) {
    healthScore(timeRange: $timeRange) {
      status
      successRate
      errorRate
      throughput
      latencyScore
    }
    quoteLatencyPercentiles(timeRange: $timeRange) {
      quoteToPaymentP50
      quoteToPaymentP95
      paymentToUploadP50
      paymentToUploadP95
      uploadToConfirmP50
      uploadToConfirmP95
    }
  }
`);

const OpsFailuresQuery = graphql(`
  query OpsFailures($timeRange: TimeRangeInput) {
    failureReasonBreakdown(timeRange: $timeRange) {
      label
      value
    }
    dashboardEvents(timeRange: $timeRange, limit: 400) {
      id
      timestamp
      eventType
      source
      route
      lambdaName
      status
      message
      walletAddress
      quoteId
      requestId
      normalizedReason
      normalizedStatus
    }
  }
`);

const OpsLambdasQuery = graphql(`
  query OpsLambdas($timeRange: TimeRangeInput) {
    lambdaErrorSummary(timeRange: $timeRange, limit: 40) {
      label
      value
    }
    eventRatePerMinute(timeRange: $timeRange) {
      label
      value
    }
  }
`);

const RootCauseQuery = graphql(`
  query RootCauseTrace($quoteId: String, $requestId: String) {
    rootCauseTrace(quoteId: $quoteId, requestId: $requestId) {
      likelyFailureCategory
      likelyFailedStage
      latestEvent {
        id
        timestamp
        message
        status
        eventType
        source
        route
        quoteId
        requestId
        normalizedReason
      }
      firstFailureEvent {
        id
        timestamp
        message
        eventType
        source
        route
        quoteId
        requestId
        normalizedReason
      }
      relatedEvents {
        id
        timestamp
        eventType
        message
        status
        route
        quoteId
        requestId
        normalizedReason
      }
    }
  }
`);

/** UI-only midpoint between p50 and p95 (not a true mean). */
function midMs(p50: number, p95: number): number {
  return (p50 + p95) / 2;
}

export function OperationsTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const rangeFrom = useMemo(() => dashboardTimeRangeFromIso(), []);
  const timeRange = useMemo(() => ({ from: rangeFrom.from7d }), [rangeFrom]);
  const windowLabel = `Rolling window: events since ${formatDashboardDateUtc(rangeFrom.from7d)} (API timeRange.from, UTC) through now`;

  const raw = searchParams.get("tab") ?? "health";
  const activeId = useMemo(() => {
    return TABS.some((t) => t.id === raw) ? raw : "health";
  }, [raw]);

  const setTab = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const healthQ = useQuery(OpsHealthQuery, {
    variables: { timeRange },
    skip: activeId !== "health",
  });
  const failQ = useQuery(OpsFailuresQuery, {
    variables: { timeRange },
    skip: activeId !== "failures",
  });
  const lamQ = useQuery(OpsLambdasQuery, {
    variables: { timeRange },
    skip: activeId !== "lambdas",
  });

  const [quoteId, setQuoteId] = useState("");
  const [requestId, setRequestId] = useState("");
  const [runTrace, { data: traceData, loading: traceLoading, error: traceError }] =
    useLazyQuery(RootCauseQuery);

  const onTrace = () => {
    void runTrace({
      variables: {
        quoteId: quoteId.trim() || null,
        requestId: requestId.trim() || null,
      },
    });
  };

  const failureBreakdown = failQ.data?.failureReasonBreakdown ?? [];
  const onlyUnknown =
    failureBreakdown.length > 0 && failureBreakdown.every((r) => r.label === "unknown");

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">{windowLabel}.</p>

      <TabBar aria-label="Operations sections" tabs={TABS} activeId={activeId} onChange={setTab} />

      {activeId === "health" ? (
        <QueryStatus loading={healthQ.loading} error={healthQ.error}>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Health score</CardTitle>
                <CardDescription>
                  Computed on the <strong>mnemospark</strong> dashboard GraphQL API from aggregated event facts plus
                  latency signals for the selected window. <strong>Status</strong> (green/yellow/red) is a composite
                  from that resolver—not a single threshold in this UI. <strong>Success / error rate</strong> are
                  percentages of classified events in the window. <strong>Throughput (60m)</strong> is whatever the
                  backend puts in <code className="text-xs">healthScore.throughput</code> (often recent-minute volume;
                  if you see 0, the field may be unset for this deployment). <strong>Latency score</strong> is a
                  normalized score from the same API (0 can mean unweighted or missing inputs).
                </CardDescription>
              </CardHeader>
              <CardContent>
                {healthQ.data ? (
                  <dl className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <dt>Status</dt>
                      <dd className="font-medium">{healthQ.data.healthScore.status}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Success rate</dt>
                      <dd>{healthQ.data.healthScore.successRate}%</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Error rate</dt>
                      <dd>{healthQ.data.healthScore.errorRate}%</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Throughput (60m)</dt>
                      <dd>{healthQ.data.healthScore.throughput}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Latency score</dt>
                      <dd>{healthQ.data.healthScore.latencyScore}</dd>
                    </div>
                  </dl>
                ) : null}
                <p className="mt-3 text-xs text-muted-foreground">
                  Red status usually means error rate or latency crossed backend thresholds—confirm in mnemospark
                  backend health-score logic if you need exact rules.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Stage latency (ms)</CardTitle>
                <CardDescription>
                  End-to-end stage transition times from quote facts / events. The API exposes <strong>p50</strong>{" "}
                  (median) and <strong>p95</strong> (slow tail). There is no min/max/average/current in the schema;{" "}
                  <strong>mid (p50–p95)</strong> below is only <em>(p50+p95)/2</em> for quick context—not a statistical
                  mean. High p95 (e.g. hundreds of seconds) usually means a few very slow chain or upload paths.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {healthQ.data ? (
                  <dl className="grid gap-2 text-xs">
                    {(
                      [
                        ["Quote→Payment", "quoteToPaymentP50", "quoteToPaymentP95"],
                        ["Payment→Upload", "paymentToUploadP50", "paymentToUploadP95"],
                        ["Upload→Confirm", "uploadToConfirmP50", "uploadToConfirmP95"],
                      ] as const
                    ).map(([label, k50, k95]) => {
                      const lat = healthQ.data!.quoteLatencyPercentiles;
                      const p50 = lat[k50];
                      const p95 = lat[k95];
                      return (
                        <div key={label} className="border-b border-border/40 pb-2">
                          <dt className="font-medium text-foreground">{label}</dt>
                          <dd className="mt-1 grid grid-cols-2 gap-x-2 text-muted-foreground">
                            <span>p50 (median)</span>
                            <span className="text-right font-mono text-foreground">{p50.toFixed(0)} ms</span>
                            <span>p95 (slow tail)</span>
                            <span className="text-right font-mono text-foreground">{p95.toFixed(0)} ms</span>
                            <span>mid (p50–p95, UI only)</span>
                            <span className="text-right font-mono text-foreground">
                              {midMs(p50, p95).toFixed(0)} ms
                            </span>
                            <span>min / max / avg / current</span>
                            <span className="text-right">not in API</span>
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </QueryStatus>
      ) : null}

      {activeId === "failures" ? (
        <QueryStatus loading={failQ.loading} error={failQ.error}>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Failure reasons</CardTitle>
                <CardDescription>
                  Labels come from <code className="text-xs">failureReasonBreakdown</code> in mnemospark-backend. If
                  everything is <span className="font-mono">unknown</span>, event normalization is not populating
                  failure reasons—improve in the backend normalizer / event ingest, or add a breakdown by{" "}
                  <code className="text-xs">eventType</code> / <code className="text-xs">route</code> there.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                {onlyUnknown ? (
                  <p className="text-sm text-muted-foreground">
                    Only &quot;unknown&quot; in this window—use the error list for raw messages and IDs, or enrich
                    reasons in the backend.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={failureBreakdown.map((r) => ({
                        name: r.label,
                        v: r.value,
                      }))}
                    >
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="v" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent error events</CardTitle>
                <CardDescription>Subset with status error (same window as above).</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="max-h-80 space-y-2 overflow-auto text-xs">
                  {(failQ.data?.dashboardEvents ?? [])
                    .filter((e) => e.status === "error")
                    .slice(0, 40)
                    .map((e) => (
                      <li key={e.id} className="rounded border border-border/50 p-2">
                        <div className="text-muted-foreground">{formatDashboardDate(e.timestamp)}</div>
                        <div>{e.message}</div>
                        <div className="mt-1 grid gap-0.5 font-mono text-[10px] text-muted-foreground">
                          <span>id: {e.id}</span>
                          {e.quoteId ? <span>quote: {e.quoteId}</span> : null}
                          {e.requestId ? <span>request: {e.requestId}</span> : null}
                          {e.route ? <span>route: {e.route}</span> : null}
                          {e.lambdaName ? <span>lambda: {e.lambdaName}</span> : null}
                          {e.normalizedReason ? (
                            <span>reason: {e.normalizedReason}</span>
                          ) : e.normalizedStatus ? (
                            <span>norm.status: {e.normalizedStatus}</span>
                          ) : null}
                        </div>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </QueryStatus>
      ) : null}

      {activeId === "lambdas" ? (
        <QueryStatus loading={lamQ.loading} error={lamQ.error}>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Lambda errors (last 7 days)</CardTitle>
                <CardDescription>
                  Same <code className="text-xs">timeRange</code> as Health/Failures: since{" "}
                  {formatDashboardDateUtc(rangeFrom.from7d)} UTC.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={(lamQ.data?.lambdaErrorSummary ?? []).map((r) => ({
                      name: r.label,
                      v: r.value,
                    }))}
                  >
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" height={70} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="v" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Event rate (minute buckets)</CardTitle>
                <CardDescription>
                  Volume of dashboard events per minute label from the API—useful to see traffic spikes or drops
                  alongside Lambda errors (same time window).
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={(lamQ.data?.eventRatePerMinute ?? []).map((r) => ({
                      name: r.label,
                      v: r.value,
                    }))}
                  >
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="v" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </QueryStatus>
      ) : null}

      {activeId === "trace" ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trace lookup</CardTitle>
              <CardDescription>
                <strong>Quote ID</strong> is the business quote UUID. <strong>Request ID</strong> is the correlation
                id on dashboard events (often API Gateway / Lambda request id when mnemospark-backend records it in{" "}
                <code className="text-xs">requestId</code>); paste the same value you see on Events rows to align
                logs. Richer trace summaries need backend changes to{" "}
                <code className="text-xs">rootCauseTrace</code> (categories, stages, and related event selection).
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <input
                className="min-w-[200px] flex-1 rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs"
                placeholder="quote_id"
                value={quoteId}
                onChange={(e) => setQuoteId(e.target.value)}
              />
              <input
                className="min-w-[200px] flex-1 rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs"
                placeholder="request_id"
                value={requestId}
                onChange={(e) => setRequestId(e.target.value)}
              />
              <Button type="button" onClick={onTrace}>
                Run trace
              </Button>
            </CardContent>
          </Card>

          <QueryStatus loading={traceLoading} error={traceError}>
            {traceData?.rootCauseTrace ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                    <CardDescription>
                      Panel fields are produced by mnemospark-backend. &quot;unknown&quot; means the classifier did not
                      map this trace to a category—improve mapping in the backend.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p>
                      <span className="text-muted-foreground">Likely category: </span>
                      {traceData.rootCauseTrace.likelyFailureCategory ?? "—"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Likely stage: </span>
                      {traceData.rootCauseTrace.likelyFailedStage ?? "—"}
                    </p>
                    <p className="mt-2 text-muted-foreground">Latest event</p>
                    {traceData.rootCauseTrace.latestEvent ? (
                      <div className="rounded border border-border/50 p-2 text-xs">
                        <div>{traceData.rootCauseTrace.latestEvent.message}</div>
                        <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                          <div>id: {traceData.rootCauseTrace.latestEvent.id}</div>
                          <div>{formatDashboardDate(traceData.rootCauseTrace.latestEvent.timestamp)}</div>
                          <div>
                            {traceData.rootCauseTrace.latestEvent.eventType} ·{" "}
                            {traceData.rootCauseTrace.latestEvent.source} ·{" "}
                            {traceData.rootCauseTrace.latestEvent.status}
                          </div>
                          {traceData.rootCauseTrace.latestEvent.route ? (
                            <div>route: {traceData.rootCauseTrace.latestEvent.route}</div>
                          ) : null}
                          {traceData.rootCauseTrace.latestEvent.quoteId ? (
                            <div>quote: {traceData.rootCauseTrace.latestEvent.quoteId}</div>
                          ) : null}
                          {traceData.rootCauseTrace.latestEvent.requestId ? (
                            <div>request: {traceData.rootCauseTrace.latestEvent.requestId}</div>
                          ) : null}
                          {traceData.rootCauseTrace.latestEvent.normalizedReason ? (
                            <div>reason: {traceData.rootCauseTrace.latestEvent.normalizedReason}</div>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <p>—</p>
                    )}
                    <p className="mt-2 text-muted-foreground">First failure</p>
                    {traceData.rootCauseTrace.firstFailureEvent ? (
                      <div className="rounded border border-border/50 p-2 text-xs">
                        <div>{traceData.rootCauseTrace.firstFailureEvent.message}</div>
                        <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                          <div>id: {traceData.rootCauseTrace.firstFailureEvent.id}</div>
                          <div>{formatDashboardDate(traceData.rootCauseTrace.firstFailureEvent.timestamp)}</div>
                          <div>
                            {traceData.rootCauseTrace.firstFailureEvent.eventType} ·{" "}
                            {traceData.rootCauseTrace.firstFailureEvent.source}
                          </div>
                          {traceData.rootCauseTrace.firstFailureEvent.route ? (
                            <div>route: {traceData.rootCauseTrace.firstFailureEvent.route}</div>
                          ) : null}
                          {traceData.rootCauseTrace.firstFailureEvent.quoteId ? (
                            <div>quote: {traceData.rootCauseTrace.firstFailureEvent.quoteId}</div>
                          ) : null}
                          {traceData.rootCauseTrace.firstFailureEvent.requestId ? (
                            <div>request: {traceData.rootCauseTrace.firstFailureEvent.requestId}</div>
                          ) : null}
                          {traceData.rootCauseTrace.firstFailureEvent.normalizedReason ? (
                            <div>reason: {traceData.rootCauseTrace.firstFailureEvent.normalizedReason}</div>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <p>—</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Related events ({traceData.rootCauseTrace.relatedEvents.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="max-h-80 space-y-2 overflow-auto text-xs">
                      {traceData.rootCauseTrace.relatedEvents.map((e) => (
                        <li key={e.id} className="border-b border-border/40 pb-2">
                          <div className="text-muted-foreground">{formatDashboardDate(e.timestamp)}</div>
                          <div>
                            {e.eventType} · {e.status}
                          </div>
                          <div>{e.message}</div>
                          <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                            <div>id: {e.id}</div>
                            {e.quoteId ? <div>quote: {e.quoteId}</div> : null}
                            {e.requestId ? <div>request: {e.requestId}</div> : null}
                            {e.route ? <div>route: {e.route}</div> : null}
                            {e.normalizedReason ? <div>reason: {e.normalizedReason}</div> : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Run a trace to load results.</p>
            )}
          </QueryStatus>
        </div>
      ) : null}
    </div>
  );
}
