import { AppShell } from '@/components/dashboard/app-shell'
import { BreakdownBarChart } from '@/components/dashboard/charts'
import { TransactionTable } from '@/components/dashboard/tables'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getTransactionsPageData } from '@/lib/data/transactions'

export default async function TransactionsPage() {
  const data = await getTransactionsPageData()

  return (
    <AppShell title="Transactions" description="Quote-centric flow reconstruction and retry visibility.">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Status distribution</CardTitle></CardHeader>
            <CardContent><BreakdownBarChart data={data.statusDistribution} /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Object duplicates</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {data.objectDuplicates.map((item) => (
                  <li key={item.objectIdHash} className="font-mono text-xs">
                    {item.objectIdHash}: {item.quoteCount} quotes
                  </li>
                ))}
                {data.objectDuplicates.length === 0 ? <li className="text-muted-foreground">No duplicate object hashes found.</li> : null}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Quote flows</CardTitle></CardHeader>
          <CardContent className="max-h-[680px] overflow-auto"><TransactionTable rows={data.transactions} /></CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
