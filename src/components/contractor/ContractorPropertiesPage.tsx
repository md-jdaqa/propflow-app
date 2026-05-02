"use client";
import { useRouter } from "next/navigation";
import { Building2, Phone, Briefcase, ArrowRight } from "lucide-react";

interface AssignedProperty {
  id: string;
  address: string;
  units: number;
  managerName: string;
  managerPhone: string;
  activeJobs: number;
}

const PROPERTIES: AssignedProperty[] = [
  {
    id: "prop-1",
    address: "406 Oak St",
    units: 4,
    managerName: "Arif",
    managerPhone: "718-555-0100",
    activeJobs: 1,
  },
  {
    id: "prop-2",
    address: "880 Airport Blvd",
    units: 1,
    managerName: "Arif",
    managerPhone: "718-555-0100",
    activeJobs: 1,
  },
];

function PropertyCard({ property }: { property: AssignedProperty }) {
  const router = useRouter();

  function handleViewJobs() {
    // Navigate to jobs page — in a real app this would pass a filter param
    router.push("/jobs");
  }

  return (
    <div className="pf-card">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(79,110,247,0.12)", color: "var(--primary)" }}
        >
          <Building2 size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-base" style={{ color: "var(--heading)" }}>
            {property.address}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            {property.units} {property.units === 1 ? "unit" : "units"}
          </p>
        </div>
        {property.activeJobs > 0 && (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
            style={{ background: "rgba(14,165,160,0.12)", color: "var(--secondary)" }}
          >
            {property.activeJobs} active
          </span>
        )}
      </div>

      {/* Contact */}
      <div
        className="mt-3 pt-3 flex items-center gap-2"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
          style={{ background: "rgba(79,110,247,0.15)", color: "var(--primary)" }}
        >
          A
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium" style={{ color: "var(--body)" }}>
            {property.managerName} · Property Manager
          </p>
          <a
            href={`tel:${property.managerPhone}`}
            className="text-xs flex items-center gap-1"
            style={{ color: "var(--muted)" }}
          >
            <Phone size={11} />
            {property.managerPhone}
          </a>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-3">
        <button
          className="pf-btn pf-btn-primary whitespace-nowrap flex-shrink-0"
          onClick={handleViewJobs}
          style={{ minHeight: "40px" }}
        >
          <Briefcase size={15} />
          View Jobs
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

export function ContractorPropertiesPage() {
  return (
    <div className="pb-24">
      <h1 className="text-xl font-bold mb-4" style={{ color: "var(--heading)" }}>My Properties</h1>

      <div className="space-y-3">
        {PROPERTIES.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>

      {/* Footer note */}
      <div
        className="mt-6 p-4 rounded-xl text-center"
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
        }}
      >
        <p className="text-sm font-medium" style={{ color: "var(--body)" }}>
          Property not showing?
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
          Ask your property manager to send you an invitation to be added to additional properties.
        </p>
      </div>
    </div>
  );
}
