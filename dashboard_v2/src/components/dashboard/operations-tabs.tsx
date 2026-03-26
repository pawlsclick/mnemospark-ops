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

const TABS = [
  { id: "health", label: "Health" },
  { id: "failures", label: "Failures" },
  { id: "lambdas", label: "Lambdas" },
  { id: "trace", label: "Trace" },
] as const;

const OpsHealthQuery = graphql(`
  query OpsHealth {
    healthScore {
      status
      successRate
      errorRate
      throughput
      latencyScore
    }
    quoteLatencyPercentiles {
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
  query OpsFailures {
    failureReasonBreakdown {
      label
      value
    }
    dashboardEvents(limit: 400) {
      id
      timestamp
      eventType
      source
      status
      message
      walletAddress
    }
  }
`);

const OpsLambdasQuery = graphql(`
  query OpsLambdas {
    lambdaErrorSummary(limit: 40) {
      label
      value
    }
    eventRatePerMinute {
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
      }
      firstFailureEvent {
        id
        timestamp
        message
      }
      relatedEvents {
        id
        timestamp
        eventType
        message
        status
      }
    }
  }
`);

export function OperationsTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raw = searchParams.get("tab") ?? "health";
  const activeId = useMemo(() => {
    return TABS.some((t) => t.id === raw) ? raw : "health";
  }, [raw]);

  const setTab = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const healthQ = useQuery(OpsHealthQuery, { skip: activeId !== "health" });
  const failQ = useQuery(OpsFailuresQuery, { skip: activeId !== "failures" });
  const lamQ = useQuery(OpsLambdasQuery, { skip: activeId !== "lambdas" });

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

  return (
    <div className="space-y-6">
      <TabBar aria-label="Operations sections" tabs={TABS} activeId={activeId} onChange={setTab} />

      {activeId === "health" ? (
        <QueryStatus loading={healthQ.loading} error={healthQ.error}>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Health score</CardTitle>
                <CardDescription>Derived from event facts + latency.</CardDescription>
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
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Stage latency (ms)</CardTitle>
              </CardHeader>
              <CardContent>
                {healthQ.data ? (
                  <dl className="grid gap-1 text-xs">
                    <div className="flex justify-between">
                      <dt>Quote→Payment p50</dt>
                      <dd>{healthQ.data.quoteLatencyPercentiles.quoteToPaymentP50.toFixed(0)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Quote→Payment p95</dt>
                      <dd>{healthQ.data.quoteLatencyPercentiles.quoteToPaymentP95.toFixed(0)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Payment→Upload p50</dt>
                      <dd>{healthQ.data.quoteLatencyPercentiles.paymentToUploadP50.toFixed(0)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Upload→Confirm p50</dt>
                      <dd>{healthQ.data.quoteLatencyPercentiles.uploadToConfirmP50.toFixed(0)}</dd>
                    </div>
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
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={(failQ.data?.failureReasonBreakdown ?? []).map((r) => ({
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
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent error events</CardTitle>
                <CardDescription>Subset with status error.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="max-h-64 space-y-2 overflow-auto text-xs">
                  {(failQ.data?.dashboardEvents ?? [])
                    .filter((e) => e.status === "error")
                    .slice(0, 40)
                    .map((e) => (
                      <li key={e.id} className="rounded border border-border/50 p-2">
                        <div className="text-muted-foreground">{e.timestamp}</div>
                        <div>{e.message}</div>
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
                <CardTitle>Lambda errors</CardTitle>
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
              <CardDescription>Provide quote ID and/or request ID (v1 parity).</CardDescription>
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
                    <p>{traceData.rootCauseTrace.latestEvent?.message ?? "—"}</p>
                    <p className="mt-2 text-muted-foreground">First failure</p>
                    <p>{traceData.rootCauseTrace.firstFailureEvent?.message ?? "—"}</p>
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
                          <div className="text-muted-foreground">{e.timestamp}</div>
                          <div>
                            {e.eventType} · {e.status}
                          </div>
                          <div>{e.message}</div>
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
