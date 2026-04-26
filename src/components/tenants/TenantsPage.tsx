"use client";

import { useEffect, useMemo, useState } from "react";
import { TenantCard } from "./TenantCard";
import { AddTenantModal } from "./AddTenantModal";
import type { TenantListItem, TenantUnitOption } from "@/app/(app)/tenants/page";

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
      const hay = [
        t.firstName,
        t.lastName,
        t.email ?? "",
        t.phone ?? "",
        t.unitLabel ?? "",
        t.propertyName ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [data, search, filter, now]);

  const chip = (key: Filter, label: string) => (
    <button
      key={key}
      type="button"
      data-testid={`tenants-filter-${key}`}
      onClick={() => setFilter(key)}
      className={`px-3 min-h-9 rounded-full text-sm border ${
        filter === key
          ? "bg-primary text-white border-primary"
          : "bg-surface text-body border-border"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div data-testid="tenants-page" className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-heading">Tenants</h1>
          <p className="text-sm text-muted">
            {data.length} {data.length === 1 ? "tenant" : "tenants"}
            {usingMock ? " (sample data)" : ""}
          </p>
        </div>
        <button
          type="button"
          data-testid="add-tenant-button"
          onClick={() => setOpen(true)}
          className="pf-btn pf-btn-primary min-h-11 px-4"
        >
          + Add tenant
        </button>
      </header>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <input
          data-testid="tenants-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, unit, property…"
          className="pf-input min-h-11 sm:max-w-xs"
        />
        <div className="flex items-center gap-2">
          {chip("all", "All")}
          {chip("active", "Active")}
          {chip("past", "Past")}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          data-testid="tenants-empty"
          className="pf-card flex flex-col items-center text-center gap-3 py-10"
        >
          <div className="text-4xl" aria-hidden>
            👥
          </div>
          <h2 className="text-lg font-semibold text-heading">
            {data.length === 0 ? "No tenants yet" : "No matches"}
          </h2>
          <p className="text-sm text-muted max-w-sm">
            {data.length === 0
              ? "Add your first tenant to track leases and payments."
              : "Try a different search or filter."}
          </p>
          {data.length === 0 ? (
            <button
              type="button"
              data-testid="empty-add-tenant-button"
              onClick={() => setOpen(true)}
              className="pf-btn pf-btn-primary min-h-11 px-4 mt-2"
            >
              Add your first tenant
            </button>
          ) : null}
        </div>
      ) : (
        <ul data-testid="tenants-list" className="flex flex-col gap-2">
          {filtered.map((t) => (
            <li key={t.id}>
              <TenantCard tenant={t} />
            </li>
          ))}
        </ul>
      )}

      <AddTenantModal
        open={open}
        onClose={() => setOpen(false)}
        units={units}
      />
    </div>
  );
}
