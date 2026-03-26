"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SectionPlaceholder } from "@/components/dashboard/section-placeholder";
import { TabBar } from "@/components/ui/tab-bar";

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raw = searchParams.get("tab") ?? "revenue";
  const activeId = useMemo(() => {
    return TABS.some((t) => t.id === raw) ? raw : "revenue";
  }, [raw]);

  const setTab = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const panel = PANELS[activeId as keyof typeof PANELS];

  return (
    <div className="space-y-6">
      <TabBar
        aria-label="Sales sections"
        tabs={TABS}
        activeId={activeId}
        onChange={setTab}
      />
      <div role="tabpanel" aria-labelledby={`tab-${activeId}`}>
        <SectionPlaceholder title={panel.title} description={panel.description} />
      </div>
    </div>
  );
}
