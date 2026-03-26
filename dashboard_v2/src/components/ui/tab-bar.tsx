"use client";

import { cn } from "@/lib/utils";

export function TabBar({
  tabs,
  activeId,
  onChange,
  "aria-label": ariaLabel,
}: {
  tabs: readonly { id: string; label: string }[];
  activeId: string;
  onChange: (id: string) => void;
  "aria-label"?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex flex-wrap gap-1 border-b border-border/60"
    >
      {tabs.map((t) => {
        const selected = activeId === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={selected}
            id={`tab-${t.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t.id)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              selected
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
