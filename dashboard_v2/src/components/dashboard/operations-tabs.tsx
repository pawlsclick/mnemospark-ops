"use client";

import { TabbedSection } from "@/components/dashboard/tabbed-section";

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
  return (
    <TabbedSection
      tabs={TABS}
      panels={PANELS}
      defaultTab="health"
      ariaLabel="Operations sections"
    />
  );
}
