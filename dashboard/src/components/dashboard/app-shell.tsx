import Link from 'next/link'
import { type ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'

const NAV = [
  { href: '/', label: 'Overview' },
  { href: '/sales', label: 'Sales' },
  { href: '/operations', label: 'Operations' },
  { href: '/wallets', label: 'Wallets' },
  { href: '/transactions', label: 'Transactions' },
  { href: '/events', label: 'Events' },
]

export function AppShell({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 md:grid-cols-[240px_1fr]">
        <aside className="border-r border-border/60 p-4 md:p-5">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">mnemospark</p>
            <h1 className="mt-2 text-lg font-semibold">Ops Console</h1>
            <p className="mt-1 text-xs text-muted-foreground">Wallet and go.</p>
          </div>

          <nav className="space-y-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md border border-transparent px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-muted/40 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="p-4 md:p-6">
          <header className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
              {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
            </div>
            <Badge variant="secondary">internal</Badge>
          </header>
          {children}
        </section>
      </div>
    </div>
  )
}
