"use client";

import { useEffect, useMemo, useState } from "react";
import { TenantCard } from "./TenantCard";
import { AddTenantModal } from "./AddTenantModal";
import type { TenantListItem, TenantUnitOption } from "@/app/(app)/tenants/page";
import { Search, Plus, Users } from "lucide-react";

type Filter = "all" | "active" | "past";

interface Props {
  data: TenantListItem[];
  units: TenantUnitOption[];
  initialAction: string | null;
  usingMock?: boolean;
}

function isActive(t: TenantListItem, now: Date): boolean {
  if (!t.leaseEnd) return true;
  return new Date(t.leaseEnd).getTime() >= now.getTime();
}

export function TenantsPage({ data, units, initialAction, usingMock }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (initialAction === "new") setOpen(true);
  }, [initialAction]);

  const now = useMemo(() => new Date(), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter((t) => {
      if (filter === "active" && !isActive(t, now)) return false;
      if (filter === "past" && isActive(t, now)) return false;
      if (!q) return true;
      const hay = [t.firstName, t.lastName, t.email ?? "", t.phone ?? "", t.unitLabel ?? "", t.propertyName ?? ""]
        .join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [data, search, filter, now]);

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all",    label: `All${data.length ? ` ${data.length}` : ""}` },
    { key: "active", label: "Active" },
    { key: "past",   label: "Past" },
  ];

  return (
    <div data-testid="tenants-page" className="flex flex-col gap-5 pb-24 md:pb-6">

      {/* Header */}
      <header className="flex items-start justify-between gap-3 flex-wrap pt-1">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--heading)", letterSpacing: "-0.02em" }}
          >
            Tenants
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            {data.length} {data.length === 1 ? "tenant" : "tenants"}
            {usingMock ? " · sample data" : ""}
          </p>
        </div>
        <button
          type="button"
          data-testid="add-tenant-button"
          onClick={() => setOpen(true)}
          className="pf-btn pf-btn-primary px-4 gap-2"
        >
          <Plus size={15} />
          Add tenant
        </button>
      </header>

      {/* Search + Filter row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--muted)" }}
          />
          <input
            data-testid="tenants-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, unit, property…"
            className="pf-input pl-9"
          />
        </div>

        {/* Filter pills */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              data-testid={`tenants-filter-${key}`}
              onClick={() => setFilter(key)}
              className="px-3.5 h-8 rounded-lg text-xs font-semibold transition-all duration-200"
              style={
                filter === key
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
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div
          data-testid="tenants-empty"
          className="pf-card flex flex-col items-center text-center gap-4 py-16 pf-animate-fade-in"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "var(--primary-muted)" }}
          >
            <Users size={28} style={{ color: "var(--primary)" }} />
          </div>
          <div>
            <h2 className="text-base font-semibold" style={{ color: "var(--heading)" }}>
              {data.length === 0 ? "No tenants yet" : "No matches"}
            </h2>
            <p className="text-sm mt-1 max-w-xs mx-auto" style={{ color: "var(--muted)" }}>
              {data.length === 0
                ? "Add your first tenant to track leases and payments."
                : "Try a different search or filter."}
            </p>
          </div>
          {data.length === 0 && (
            <button
              type="button"
              data-testid="empty-add-tenant-button"
              onClick={() => setOpen(true)}
              className="pf-btn pf-btn-primary px-6 gap-2"
            >
              <Plus size={15} />
              Add your first tenant
            </button>
          )}
        </div>
      ) : (
        <ul data-testid="tenants-list" className="flex flex-col gap-3">
          {filtered.map((t, i) => (
            <li key={t.id}>
              <TenantCard tenant={t} index={i} />
            </li>
          ))}
        </ul>
      )}

      <AddTenantModal open={open} onClose={() => setOpen(false)} units={units} />
    </div>
  );
}
