import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { money } from '@/lib/format'
import type { DashboardEvent } from '@/lib/types/events'
import type { QuoteFacts } from '@/lib/types/transaction'
import type { WalletFacts } from '@/lib/types/wallet'

export function WalletTable({ wallets }: { wallets: WalletFacts[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Wallet</TableHead>
          <TableHead>Revenue</TableHead>
          <TableHead>Quotes</TableHead>
          <TableHead>Uploads</TableHead>
          <TableHead>Failures</TableHead>
          <TableHead>Last seen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {wallets.map((wallet) => (
          <TableRow key={wallet.walletAddress}>
            <TableCell className="font-mono text-xs">{wallet.walletAddress}</TableCell>
            <TableCell>{money(wallet.totalRevenue)}</TableCell>
            <TableCell>{wallet.totalQuotes}</TableCell>
            <TableCell>{wallet.totalUploadsConfirmed}</TableCell>
            <TableCell>{wallet.totalFailures}</TableCell>
            <TableCell>{wallet.lastSeenAt?.slice(0, 19) ?? '—'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function TransactionTable({ rows }: { rows: QuoteFacts[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Quote</TableHead>
          <TableHead>Wallet</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Failures</TableHead>
          <TableHead>Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.quoteId}>
            <TableCell className="font-mono text-xs">{row.quoteId}</TableCell>
            <TableCell className="font-mono text-xs">{row.walletAddress ?? '—'}</TableCell>
            <TableCell>
              <Badge variant={row.finalStatus === 'failed' ? 'destructive' : 'secondary'}>{row.finalStatus}</Badge>
            </TableCell>
            <TableCell>{money(row.amountNormalized)}</TableCell>
            <TableCell>{row.hasFailure ? row.normalizedReason ?? 'unknown' : '—'}</TableCell>
            <TableCell>{row.lastSeenAt?.slice(0, 19) ?? '—'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function EventTable({ rows }: { rows: DashboardEvent[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Wallet</TableHead>
          <TableHead>Quote</TableHead>
          <TableHead>Route</TableHead>
          <TableHead>Lambda</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.timestamp.slice(0, 19)}</TableCell>
            <TableCell>{row.eventType}</TableCell>
            <TableCell className="font-mono text-xs">{row.walletAddress ?? '—'}</TableCell>
            <TableCell className="font-mono text-xs">{row.quoteId ?? '—'}</TableCell>
            <TableCell>{row.route ?? '—'}</TableCell>
            <TableCell>{row.lambdaName ?? '—'}</TableCell>
            <TableCell>
              <Badge variant={row.status === 'error' ? 'destructive' : row.status === 'success' ? 'default' : 'secondary'}>
                {row.status ?? 'info'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
