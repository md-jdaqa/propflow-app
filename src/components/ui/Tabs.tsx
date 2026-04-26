"use client";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TabSpec {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: TabSpec[];
  defaultTab?: string;
  testId?: string;
}

export function Tabs({ tabs, defaultTab, testId }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);
  return (
    <div data-testid={testId}>
      <div
        role="tablist"
        className="flex gap-1 overflow-x-auto border-b border-border mb-4"
      >
        {tabs.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              data-testid={`tab-${t.id}`}
              onClick={() => setActive(t.id)}
              className={cn(
                "min-h-touch px-4 text-sm whitespace-nowrap border-b-2 transition",
                isActive
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted hover:text-body",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" data-testid={`tabpanel-${active}`}>
        {tabs.find((t) => t.id === active)?.content}
      </div>
    </div>
  );
}
