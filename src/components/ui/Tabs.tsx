"use client";
import { useState, type ReactNode } from "react";

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
  const current = tabs.find((t) => t.id === active);

  return (
    <div data-testid={testId}>
      {/* Pill tab bar */}
      <div
        role="tablist"
        className="flex gap-1 p-1 rounded-xl overflow-x-auto mb-5"
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
        }}
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
              className="flex-1 min-h-9 px-4 text-sm whitespace-nowrap rounded-lg font-medium transition-all duration-200"
              style={
                isActive
                  ? {
                      background: "var(--primary)",
                      color: "white",
                      boxShadow: "0 2px 8px rgba(79,110,247,0.35)",
                    }
                  : {
                      background: "transparent",
                      color: "var(--muted)",
                    }
              }
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab panel */}
      <div
        role="tabpanel"
        data-testid={`tabpanel-${active}`}
        key={active}
        style={{ animation: "pf-tab-slide 250ms cubic-bezier(0.22,1,0.36,1) both" }}
      >
        {current?.content}
      </div>
    </div>
  );
}
