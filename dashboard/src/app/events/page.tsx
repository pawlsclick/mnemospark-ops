import { AppShell } from '@/components/dashboard/app-shell'
import { BreakdownBarChart, TimeSeriesChart } from '@/components/dashboard/charts'
import { EventTable } from '@/components/dashboard/tables'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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

  return (
    <AppShell title="Events" description="Live and historical stream with route/lambda/wallet tracing context.">
      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
          <CardContent>
            <form method="GET" className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <Input name="wallet" placeholder="wallet_address" defaultValue={params.wallet ?? ''} />
              <Input name="quote" placeholder="quote_id" defaultValue={params.quote ?? ''} />
              <Input name="request" placeholder="request_id" defaultValue={params.request ?? ''} />
              <Input name="route" placeholder="route" defaultValue={params.route ?? ''} />
              <Input name="lambda" placeholder="lambda" defaultValue={params.lambda ?? ''} />
              <Input name="status" placeholder="status (success|error|pending|info)" defaultValue={params.status ?? ''} />
              <div className="xl:col-span-6 flex gap-2">
                <Button type="submit" variant="outline">Apply filters</Button>
                <Link href="/events">
                  <Button type="button" variant="ghost">Clear</Button>
                </Link>
              </div>
            </form>
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
