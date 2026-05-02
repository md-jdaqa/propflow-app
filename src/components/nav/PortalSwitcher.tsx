"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";

interface PortalOption {
  label: string;
  href: string;
}

const PORTALS: PortalOption[] = [
  { label: "Admin Portal",      href: "/" },
  { label: "Tenant Portal",     href: "/tenant/home" },
  { label: "Contractor Portal", href: "/contractor/jobs" },
];

interface PortalSwitcherProps {
  current?: string;
}

export function PortalSwitcher({ current = "Admin Portal" }: PortalSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="pf-btn pf-btn-ghost h-9 min-h-9 px-3 text-sm flex items-center gap-1.5 font-medium"
        data-testid="portal-switcher-btn"
        style={{ color: "var(--body)" }}
      >
        {current}
        <ChevronDown
          size={14}
          className="transition-transform duration-150"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border py-1 shadow-xl z-50"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
          }}
          data-testid="portal-switcher-dropdown"
        >
          {PORTALS.map((p) => {
            const isCurrent = p.label === current;
            return (
              <button
                key={p.href}
                type="button"
                onClick={() => {
                  router.push(p.href);
                  setOpen(false);
                }}
                className="w-full text-left flex items-center justify-between px-4 py-2.5 text-sm transition-colors"
                style={{
                  color: isCurrent ? "var(--primary)" : "var(--body)",
                  background: "transparent",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
                data-testid={`portal-option-${p.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <span className="font-medium">{p.label}</span>
                {isCurrent ? (
                  <Check size={14} style={{ color: "var(--primary)" }} />
                ) : (
                  <span className="text-xs" style={{ color: "var(--muted)" }}>
                    preview
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
