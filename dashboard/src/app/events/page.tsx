import { AppShell } from '@/components/dashboard/app-shell'
import { BreakdownBarChart, TimeSeriesChart } from '@/components/dashboard/charts'
import { EventTable } from '@/components/dashboard/tables'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getEventsPageData } from '@/lib/data/events'

export default async function EventsPage() {
  const data = await getEventsPageData()

  return (
    <AppShell title="Events" description="Live and historical stream with route/lambda/wallet tracing context.">
      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <Input placeholder="wallet_address" disabled />
            <Input placeholder="quote_id" disabled />
            <Input placeholder="request_id" disabled />
            <Select disabled><SelectTrigger><SelectValue placeholder="route" /></SelectTrigger><SelectContent><SelectItem value="all">all</SelectItem></SelectContent></Select>
            <Select disabled><SelectTrigger><SelectValue placeholder="lambda" /></SelectTrigger><SelectContent><SelectItem value="all">all</SelectItem></SelectContent></Select>
            <Select disabled><SelectTrigger><SelectValue placeholder="status" /></SelectTrigger><SelectContent><SelectItem value="all">all</SelectItem></SelectContent></Select>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Event rate per minute</CardTitle></CardHeader>
            <CardContent><TimeSeriesChart data={data.eventRate} /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Lambda errors</CardTitle></CardHeader>
            <CardContent><BreakdownBarChart data={data.lambdaErrors} /></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Event stream</CardTitle></CardHeader>
          <CardContent className="max-h-[720px] overflow-auto"><EventTable rows={data.events.slice().reverse()} /></CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
