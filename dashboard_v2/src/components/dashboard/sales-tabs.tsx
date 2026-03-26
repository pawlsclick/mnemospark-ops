"use client";

import { TabbedSection } from "@/components/dashboard/tabbed-section";

const TABS = [
  { id: "revenue", label: "Revenue" },
  { id: "funnel", label: "Funnel" },
  { id: "wallets", label: "Wallets" },
  { id: "retention", label: "Retention" },
] as const;

const PANELS: Record<
  (typeof TABS)[number]["id"],
  { title: string; description: string }
> = {
  revenue: {
    title: "Revenue",
    description:
      "24h / 7d / 30d totals, daily and weekly series, ARPU, revenue by network.",
  },
  funnel: {
    title: "Funnel",
    description:
      "Stage counts, conversion rates, and drop-off by stage (quote → payment → upload → confirm).",
  },
  wallets: {
    title: "Wallets",
    description:
      "Leaderboards: top wallets by revenue and by frequency; growth and new vs returning.",
  },
  retention: {
    title: "Retention",
    description: "Retention cohorts and wallet lifecycle views.",
  },
};

export function SalesTabs() {
  return (
    <TabbedSection
      tabs={TABS}
      panels={PANELS}
      defaultTab="revenue"
      ariaLabel="Sales sections"
    />
  );
}
