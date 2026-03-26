"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SectionPlaceholder } from "@/components/dashboard/section-placeholder";
import { TabBar } from "@/components/ui/tab-bar";

const TABS = [
  { id: "health", label: "Health" },
  { id: "failures", label: "Failures" },
  { id: "lambdas", label: "Lambdas" },
  { id: "trace", label: "Trace" },
] as const;

const PANELS: Record<
  (typeof TABS)[number]["id"],
  { title: string; description: string }
> = {
  health: {
    title: "Health",
    description:
      "Health score, success and error rates, throughput, latency percentiles across stages.",
  },
  failures: {
    title: "Failures",
    description:
      "Failures over time, reasons, rate by stage, critical failures list.",
  },
  lambdas: {
    title: "Lambdas",
    description: "Lambda error summary and API failures by route.",
  },
  trace: {
    title: "Trace",
    description:
      "Quote ID / request ID lookup, root-cause summary, and related events (aligned with v1 Operations → Trace).",
  },
};

export function OperationsTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raw = searchParams.get("tab") ?? "health";
  const activeId = useMemo(() => {
    return TABS.some((t) => t.id === raw) ? raw : "health";
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
        aria-label="Operations sections"
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
