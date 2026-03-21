import { AppShell } from '@/components/dashboard/app-shell'
import { BreakdownBarChart, TimeSeriesChart } from '@/components/dashboard/charts'
import { MetricCard } from '@/components/dashboard/cards'
import { WalletTable } from '@/components/dashboard/tables'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getSalesPageData } from '@/lib/data/sales'
import { money, pct } from '@/lib/format'

export default async function SalesPage() {
  const data = await getSalesPageData()

  return (
    <AppShell title="Sales" description="Revenue and wallet intelligence.">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricCard title="Revenue 24h" value={money(data.revenue.revenue24h)} />
          <MetricCard title="Revenue 7d" value={money(data.revenue.revenue7d)} />
          <MetricCard title="Revenue 30d" value={money(data.revenue.revenue30d)} />
        </div>

        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="funnel">Funnel</TabsTrigger>
            <TabsTrigger value="wallets">Wallets</TabsTrigger>
            <TabsTrigger value="retention">Retention</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>Revenue daily</CardTitle></CardHeader>
                <CardContent><TimeSeriesChart data={data.revenueDaily} /></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Revenue weekly</CardTitle></CardHeader>
                <CardContent><TimeSeriesChart data={data.revenueWeekly} /></CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <MetricCard title="ARPU" value={money(data.revenue.arpu ?? 0)} />
              <MetricCard title="Median txn" value={money(data.revenue.medianTransactionSize ?? 0)} />
              <MetricCard title="Top network" value={data.revenueByNetwork[0]?.label ?? 'unknown'} subtitle={money(data.revenueByNetwork[0]?.value ?? 0)} />
            </div>
            <Card>
              <CardHeader><CardTitle>Revenue by network</CardTitle></CardHeader>
              <CardContent><BreakdownBarChart data={data.revenueByNetwork} /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="funnel" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <MetricCard title="Quote→Payment" value={pct(data.funnel.quoteToPaymentRate)} />
              <MetricCard title="Payment→Upload" value={pct(data.funnel.paymentToUploadRate)} />
              <MetricCard title="Upload→Confirm" value={pct(data.funnel.uploadToConfirmRate)} />
            </div>
            <Card>
              <CardHeader><CardTitle>Funnel drop-off</CardTitle></CardHeader>
              <CardContent><BreakdownBarChart data={data.dropoffByStage} /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallets" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Top wallets by revenue</CardTitle></CardHeader>
              <CardContent className="max-h-[480px] overflow-auto"><WalletTable wallets={data.topWalletsByRevenue} /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Top wallets by frequency</CardTitle></CardHeader>
              <CardContent className="max-h-[480px] overflow-auto"><WalletTable wallets={data.topWalletsByFrequency} /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="retention" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Wallet growth</CardTitle></CardHeader>
              <CardContent><TimeSeriesChart data={data.walletGrowth} /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>New vs returning</CardTitle></CardHeader>
              <CardContent><BreakdownBarChart data={data.newVsReturning} /></CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
