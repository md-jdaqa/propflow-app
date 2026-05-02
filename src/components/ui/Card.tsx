import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

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
  icon?: ReactNode;
  testId?: string;
  children?: ReactNode;
  animationDelay?: number;
}

export function StatCard({
  label,
  value,
  hint,
  trend,
  accent = "primary",
  icon,
  testId,
  children,
  animationDelay = 0,
}: StatCardProps) {
  const accentVar = {
    primary:   "var(--primary)",
    success:   "var(--success)",
    warning:   "var(--warning)",
    danger:    "var(--danger)",
    secondary: "var(--secondary)",
  }[accent];

  const accentMuted = {
    primary:   "var(--primary-muted)",
    success:   "var(--success-muted)",
    warning:   "var(--warning-muted)",
    danger:    "var(--danger-muted)",
    secondary: "rgba(14,165,160,0.12)",
  }[accent];

  const TrendIcon =
    trend?.dir === "up" ? TrendingUp :
    trend?.dir === "down" ? TrendingDown :
    Minus;

  const trendColor =
    trend?.dir === "up" ? "var(--success)" :
    trend?.dir === "down" ? "var(--danger)" :
    "var(--muted)";

  return (
    <div
      data-testid={testId}
      className="pf-card pf-animate-fade-up flex flex-col gap-3 overflow-hidden relative"
      style={{
        animationDelay: `${animationDelay}ms`,
        borderTop: `2px solid ${accentVar}`,
      }}
    >
      {/* Subtle accent glow behind */}
      <div
        className="absolute top-0 left-0 right-0 h-12 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, ${accentMuted} 0%, transparent 100%)`,
          opacity: 0.5,
        }}
      />

      <div className="flex items-start justify-between gap-2 relative">
        <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--muted)" }}>
          {label}
        </span>
        <div className="flex items-center gap-2">
          {trend && (
            <span
              className="flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md"
              style={{
                color: trendColor,
                background: `color-mix(in srgb, ${trendColor} 12%, transparent)`,
              }}
            >
              <TrendIcon size={11} strokeWidth={2.5} />
              {trend.pct}%
            </span>
          )}
          {icon && (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: accentMuted, color: accentVar }}
            >
              {icon}
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <div className="text-2xl font-bold tracking-tight" style={{ color: accentVar }}>
          {value}
        </div>
        {hint && (
          <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            {hint}
          </div>
        )}
      </div>

      {children && <div className="mt-auto">{children}</div>}
    </div>
  );
}
