import { AppShell } from '@/components/dashboard/app-shell'
import { BreakdownBarChart, TimeSeriesChart } from '@/components/dashboard/charts'
import { EventTable } from '@/components/dashboard/tables'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getOperationsPageData } from '@/lib/data/operations'

function pct(value: number): string {
  return `${value.toFixed(1)}%`
}

export default async function OperationsPage() {
  const data = await getOperationsPageData()

  return (
    <AppShell title="Operations" description="Health, failures, lambda noise, and traces.">
      <Tabs defaultValue="health" className="space-y-4">
        <TabsList>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="failures">Failures</TabsTrigger>
          <TabsTrigger value="lambdas">Lambdas</TabsTrigger>
          <TabsTrigger value="trace">Trace</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card><CardHeader><CardTitle>Health</CardTitle></CardHeader><CardContent>{data.health.status}</CardContent></Card>
            <Card><CardHeader><CardTitle>Success rate</CardTitle></CardHeader><CardContent>{pct(data.health.successRate)}</CardContent></Card>
            <Card><CardHeader><CardTitle>Error rate</CardTitle></CardHeader><CardContent>{pct(data.health.errorRate)}</CardContent></Card>
            <Card><CardHeader><CardTitle>Throughput</CardTitle></CardHeader><CardContent>{data.health.throughput}</CardContent></Card>
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Event rate</CardTitle></CardHeader>
              <CardContent><TimeSeriesChart data={data.eventRate} /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Latency summary</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>quote→payment p50: {Math.round(data.latency.quoteToPaymentP50 ?? 0)} ms</p>
                <p>quote→payment p95: {Math.round(data.latency.quoteToPaymentP95 ?? 0)} ms</p>
                <p>payment→upload p50: {Math.round(data.latency.paymentToUploadP50 ?? 0)} ms</p>
                <p>payment→upload p95: {Math.round(data.latency.paymentToUploadP95 ?? 0)} ms</p>
                <p>upload→confirm p50: {Math.round(data.latency.uploadToConfirmP50 ?? 0)} ms</p>
                <p>upload→confirm p95: {Math.round(data.latency.uploadToConfirmP95 ?? 0)} ms</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="failures" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card><CardHeader><CardTitle>Failures over time</CardTitle></CardHeader><CardContent><TimeSeriesChart data={data.failuresOverTime} /></CardContent></Card>
            <Card><CardHeader><CardTitle>Failure reasons</CardTitle></CardHeader><CardContent><BreakdownBarChart data={data.failureReasons} /></CardContent></Card>
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card><CardHeader><CardTitle>Failures by stage</CardTitle></CardHeader><CardContent><BreakdownBarChart data={data.failureRateByStage} /></CardContent></Card>
            <Card><CardHeader><CardTitle>Failures by network</CardTitle></CardHeader><CardContent><BreakdownBarChart data={data.failuresByNetwork} /></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Recent critical failures</CardTitle></CardHeader>
            <CardContent className="max-h-[420px] overflow-auto"><EventTable rows={data.recentCriticalFailures} /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lambdas" className="space-y-4">
          <Card><CardHeader><CardTitle>Lambda errors by function</CardTitle></CardHeader><CardContent><BreakdownBarChart data={data.lambdaErrors} /></CardContent></Card>
          <Card><CardHeader><CardTitle>API failures by route</CardTitle></CardHeader><CardContent><BreakdownBarChart data={data.apiFailuresByRoute} /></CardContent></Card>
          <Card><CardHeader><CardTitle>API calls by route</CardTitle></CardHeader><CardContent><BreakdownBarChart data={data.apiCallsByRoute} /></CardContent></Card>
        </TabsContent>

        <TabsContent value="trace" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Trace lookup</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Input placeholder="quote_id" disabled />
              <Input placeholder="request_id" disabled />
              <Input placeholder="wallet_address" disabled />
              <p className="text-xs text-muted-foreground md:col-span-3">Lookup fields are wired to query functions in data layer; interactive submit is intentionally deferred for MVP simplicity.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Idempotency conflicts</CardTitle></CardHeader>
            <CardContent><BreakdownBarChart data={data.idempotencyConflicts} /></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  )
}
