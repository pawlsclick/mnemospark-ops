import { AppShell } from '@/components/dashboard/app-shell'
import { EventTable, TransactionTable } from '@/components/dashboard/tables'
import { MetricCard } from '@/components/dashboard/cards'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getWalletDetailPageData } from '@/lib/data/wallets'
import { money } from '@/lib/format'

export default async function WalletDetailPage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params
  const data = await getWalletDetailPageData(decodeURIComponent(address))

  return (
    <AppShell title="Wallet detail" description={decodeURIComponent(address)}>
      {!data.wallet ? (
        <Card><CardHeader><CardTitle>Wallet not found</CardTitle></CardHeader></Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <MetricCard title="Total revenue" value={money(data.wallet.totalRevenue)} />
            <MetricCard title="Quotes" value={String(data.wallet.totalQuotes)} />
            <MetricCard title="Confirmed uploads" value={String(data.wallet.totalUploadsConfirmed)} />
            <MetricCard title="Failures" value={String(data.wallet.totalFailures)} />
          </div>

          <Card>
            <CardHeader><CardTitle>Quote flows</CardTitle></CardHeader>
            <CardContent className="max-h-[360px] overflow-auto"><TransactionTable rows={data.quotes} /></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Recent events</CardTitle></CardHeader>
            <CardContent className="max-h-[360px] overflow-auto"><EventTable rows={data.events.slice(0, 100)} /></CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  )
}
