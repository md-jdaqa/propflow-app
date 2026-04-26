import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
  testId?: string;
}

export function Card({ children, className, testId }: CardProps) {
  return (
    <div data-testid={testId} className={cn("pf-card", className)}>
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  trend?: { dir: "up" | "down" | "flat"; pct: number };
  accent?: "primary" | "success" | "warning" | "danger" | "secondary";
  testId?: string;
  children?: ReactNode;
}

export function StatCard({
  label,
  value,
  hint,
  trend,
  accent = "primary",
  testId,
  children,
}: StatCardProps) {
  const accentClass = {
    primary:   "text-primary",
    success:   "text-success",
    warning:   "text-warning",
    danger:    "text-danger",
    secondary: "text-secondary",
  }[accent];

  return (
    <div data-testid={testId} className="pf-card">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm text-muted">{label}</span>
        {trend ? (
          <span
            className={cn(
              "text-xs",
              trend.dir === "up" ? "text-success" : trend.dir === "down" ? "text-danger" : "text-muted",
            )}
          >
            {trend.dir === "up" ? "▲" : trend.dir === "down" ? "▼" : "•"} {trend.pct}%
          </span>
        ) : null}
      </div>
      <div className={cn("text-2xl font-semibold mt-1", accentClass)}>{value}</div>
      {hint ? <div className="text-xs text-muted mt-1">{hint}</div> : null}
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}
