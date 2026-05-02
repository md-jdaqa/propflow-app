"use client";

import { useEffect, useState } from "react";
import { PropertyCard } from "./PropertyCard";
import { AddPropertySlideOver } from "./AddPropertySlideOver";
import type { PropertyListItem } from "@/app/(app)/properties/page";

interface Props {
  data: PropertyListItem[];
  initialAction: string | null;
  usingMock?: boolean;
}

export function PropertiesPage({ data, initialAction, usingMock }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (initialAction === "new") setOpen(true);
  }, [initialAction]);

  return (
    <div data-testid="properties-page" className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-heading" style={{ letterSpacing: "-0.02em" }}>Properties</h1>
          <p className="text-sm text-muted">
            {data.length} {data.length === 1 ? "property" : "properties"}
            {usingMock ? " (sample data)" : ""}
          </p>
        </div>
        <button
          type="button"
          data-testid="add-property-button"
          onClick={() => setOpen(true)}
          className="pf-btn pf-btn-primary px-4"
        >
          + Add property
        </button>
      </header>

      {data.length === 0 ? (
        <div
          data-testid="properties-empty"
          className="pf-card flex flex-col items-center text-center gap-3 py-10"
        >
          <div className="text-4xl" aria-hidden>
            🏠
          </div>
          <h2 className="text-lg font-semibold text-heading">
            No properties yet
          </h2>
          <p className="text-sm text-muted max-w-sm">
            Add your first property to start tracking units, tenants, and
            payments.
          </p>
          <button
            type="button"
            data-testid="empty-add-property-button"
            onClick={() => setOpen(true)}
            className="pf-btn pf-btn-primary min-h-11 px-4 mt-2"
          >
            Add your first property
          </button>
        </div>
      ) : (
        <div
          data-testid="properties-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {data.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}

      <AddPropertySlideOver open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
