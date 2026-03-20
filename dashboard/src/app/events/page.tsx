import { AppShell } from '@/components/dashboard/app-shell'
import { BreakdownBarChart, TimeSeriesChart } from '@/components/dashboard/charts'
import { EventTable } from '@/components/dashboard/tables'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getEventsPageData } from '@/lib/data/events'
import type { DashboardEvent } from '@/lib/types/events'

type Params = {
  wallet?: string
  quote?: string
  request?: string
  route?: string
  lambda?: string
  status?: string
}

function filterEvents(events: DashboardEvent[], params: Params): DashboardEvent[] {
  return events.filter((event) => {
    if (params.wallet && event.walletAddress !== params.wallet) return false
    if (params.quote && event.quoteId !== params.quote) return false
    if (params.request && event.requestId !== params.request) return false
    if (params.route && params.route !== 'all' && event.route !== params.route) return false
    if (params.lambda && params.lambda !== 'all' && event.lambdaName !== params.lambda) return false
    if (params.status && params.status !== 'all' && event.status !== params.status) return false
    return true
  })
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const rawSearch = await searchParams
  const params: Params = {
    wallet: typeof rawSearch.wallet === 'string' ? rawSearch.wallet : undefined,
    quote: typeof rawSearch.quote === 'string' ? rawSearch.quote : undefined,
    request: typeof rawSearch.request === 'string' ? rawSearch.request : undefined,
    route: typeof rawSearch.route === 'string' ? rawSearch.route : undefined,
    lambda: typeof rawSearch.lambda === 'string' ? rawSearch.lambda : undefined,
    status: typeof rawSearch.status === 'string' ? rawSearch.status : undefined,
  }

  const data = await getEventsPageData()
  const filteredEvents = filterEvents(data.events, params)
  const routeOptions = Array.from(new Set(data.events.map((event) => event.route).filter(Boolean))) as string[]
  const lambdaOptions = Array.from(new Set(data.events.map((event) => event.lambdaName).filter(Boolean))) as string[]
  const statusOptions = Array.from(new Set(data.events.map((event) => event.status).filter(Boolean))) as string[]

  return (
    <AppShell title="Events" description="Live and historical stream with route/lambda/wallet tracing context.">
      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <Input placeholder="wallet_address" value={params.wallet ?? ''} readOnly />
            <Input placeholder="quote_id" value={params.quote ?? ''} readOnly />
            <Input placeholder="request_id" value={params.request ?? ''} readOnly />
            <Select value={params.route ?? 'all'} disabled={routeOptions.length === 0}>
              <SelectTrigger><SelectValue placeholder="route" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">all</SelectItem>
                {routeOptions.map((route) => (
                  <SelectItem key={route} value={route}>
                    {route}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={params.lambda ?? 'all'} disabled={lambdaOptions.length === 0}>
              <SelectTrigger><SelectValue placeholder="lambda" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">all</SelectItem>
                {lambdaOptions.map((lambdaName) => (
                  <SelectItem key={lambdaName} value={lambdaName}>
                    {lambdaName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={params.status ?? 'all'} disabled={statusOptions.length === 0}>
              <SelectTrigger><SelectValue placeholder="status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">all</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <CardContent className="max-h-[720px] overflow-auto">
            <EventTable rows={filteredEvents.slice().reverse()} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
