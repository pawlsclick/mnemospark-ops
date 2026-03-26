"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SectionPlaceholder } from "@/components/dashboard/section-placeholder";
import { TabBar } from "@/components/ui/tab-bar";

type TabbedSectionTab<TTabId extends string> = { id: TTabId; label: string };
type TabbedSectionPanel = { title: string; description: string };

export function TabbedSection<TTabId extends string>({
  tabs,
  panels,
  defaultTab,
  ariaLabel,
}: {
  tabs: readonly TabbedSectionTab<TTabId>[];
  panels: Record<TTabId, TabbedSectionPanel>;
  defaultTab: TTabId;
  ariaLabel: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raw = searchParams.get("tab") ?? defaultTab;
  const activeId = useMemo(() => {
    return tabs.some((t) => t.id === raw) ? (raw as TTabId) : defaultTab;
  }, [defaultTab, raw, tabs]);

  const setTab = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const panel = panels[activeId];

  return (
    <div className="space-y-6">
      <TabBar
        aria-label={ariaLabel}
        tabs={tabs}
        activeId={activeId}
        onChange={setTab}
      />
      <div role="tabpanel" aria-labelledby={`tab-${activeId}`}>
        <SectionPlaceholder title={panel.title} description={panel.description} />
      </div>
    </div>
  );
}
