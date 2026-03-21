"use client"

import { ColumnDef } from "@tanstack/react-table"
import { WalletFacts } from "@/lib/types/wallet"
import { money } from "@/lib/format"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<WalletFacts>[] = [
  {
    accessorKey: "walletAddress",
    header: "Wallet",
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("walletAddress")}</div>,
  },
  {
    accessorKey: "totalRevenue",
    header: "Revenue",
    cell: ({ row }) => <div>{money(row.getValue("totalRevenue"))}</div>,
  },
  {
    accessorKey: "totalQuotes",
    header: "Quotes",
  },
  {
    accessorKey: "totalUploadsConfirmed",
    header: "Uploads",
  },
  {
    accessorKey: "totalFailures",
    header: "Failures",
  },
  {
    accessorKey: "lastSeenAt",
    header: "Last Seen",
    cell: ({ row }) => {
      const ts = row.getValue("lastSeenAt") as string | undefined
      return <div>{ts?.slice(0, 19) ?? "—"}</div>
    },
  },
]
