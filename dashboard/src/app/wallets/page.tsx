import Link from 'next/link'
import { AppShell } from '@/components/dashboard/app-shell'
import { WalletTable } from '@/components/dashboard/tables'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getWalletsPageData } from '@/lib/data/wallets'

export default async function WalletsPage() {
  const { wallets } = await getWalletsPageData()

  return (
    <AppShell title="Wallets" description="Search and investigate wallet-centric activity.">
      <Card>
        <CardHeader>
          <CardTitle>Wallet list</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[680px] overflow-auto">
          <WalletTable wallets={wallets} />
          <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-muted-foreground">
            {wallets.slice(0, 20).map((wallet) => (
              <Link key={wallet.walletAddress} href={`/wallets/${encodeURIComponent(wallet.walletAddress)}`} className="underline">
                open {wallet.walletAddress}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  )
}
