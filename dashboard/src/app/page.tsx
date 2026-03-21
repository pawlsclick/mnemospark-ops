import { AppShell } from '@/components/dashboard/app-shell'
import { TimeSeriesChart } from '@/components/dashboard/charts'
import { MetricCard } from '@/components/dashboard/cards'
import { EventTable, WalletTable } from '@/components/dashboard/tables'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getOverviewPageData } from '@/lib/data/dashboard'
import { money, pct } from '@/lib/format'

export default async function OverviewPage() {
  const data = await getOverviewPageData()

  return (
    <AppShell
      title="Overview"
      description="Business motion and system health at a glance."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Revenue (24h)" value={money(data.revenue.revenue24h)} subtitle="Payment settled" />
          <MetricCard title="Active wallets" value={`${new Set(data.liveEvents.map((e) => e.walletAddress).filter(Boolean)).size}`} subtitle="Recent event activity" />
          <MetricCard title="Success rate" value={pct(data.health.successRate)} subtitle="Across normalized events" />
          <MetricCard title="Error rate" value={pct(data.health.errorRate)} subtitle="Across normalized events" />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Revenue over time</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeSeriesChart data={data.revenueSeries} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Funnel snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>quote_created: {data.funnel.quoteCreated}</p>
              <p>payment_settled: {data.funnel.paymentSettled}</p>
              <p>upload_started: {data.funnel.uploadStarted}</p>
              <p>upload_confirmed: {data.funnel.uploadConfirmed}</p>
              <p className="text-muted-foreground">quote→payment {pct(data.funnel.quoteToPaymentRate)}</p>
              <p className="text-muted-foreground">payment→upload {pct(data.funnel.paymentToUploadRate)}</p>
              <p className="text-muted-foreground">upload→confirm {pct(data.funnel.uploadToConfirmRate)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top wallets</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[420px] overflow-auto">
              <WalletTable wallets={data.topWallets} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Live events preview</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[420px] overflow-auto">
              <EventTable rows={data.liveEvents.slice(0, 20)} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
