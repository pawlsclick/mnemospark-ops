"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/sales", label: "Sales" },
  { href: "/operations", label: "Operations" },
  { href: "/wallets", label: "Wallets" },
  { href: "/transactions", label: "Transactions" },
  { href: "/events", label: "Events" },
] as const;

function isNavActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {NAV.map((item) => {
        const active = isNavActive(item.href, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "block rounded-md border px-3 py-2 text-sm transition-colors",
              active
                ? "border-border bg-muted/50 font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
