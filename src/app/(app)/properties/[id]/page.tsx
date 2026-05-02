import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { UnitFormModal } from "@/components/properties/UnitFormModal";

// Static export: provide stub params; real data loads at runtime via mock fallback
export async function generateStaticParams() {
  return [{ id: "demo" }, { id: "sample" }];
}

const MOCK_OWNER_ID = "00000000-0000-0000-0000-000000000001";

export type UnitView = {
  id: string;
  label: string;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFeet: number | null;
  monthlyRent: number | null;
  occupied: boolean;
};

export type PropertyDetailView = {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  propertyType: string;
  notes: string | null;
  units: UnitView[];
};

const MOCK_DETAIL = (id: string): PropertyDetailView => ({
  id,
  name: "Sample Property",
  addressLine1: "123 Sample St",
  addressLine2: null,
  city: "Brooklyn",
  state: "NY",
  postalCode: "11201",
  propertyType: "RESIDENTIAL_LTR",
  notes: "Sample data — connect DATABASE_URL to load real records.",
  units: [
    {
      id: "mock-u-1",
      label: "Unit 1",
      bedrooms: 2,
      bathrooms: 1,
      squareFeet: 850,
      monthlyRent: 2400,
      occupied: true,
    },
    {
      id: "mock-u-2",
      label: "Unit 2",
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 600,
      monthlyRent: 1800,
      occupied: false,
    },
  ],
});

async function loadProperty(id: string): Promise<PropertyDetailView | null> {
  if (!process.env.DATABASE_URL) return MOCK_DETAIL(id);
  try {
    const p = (await prisma.property.findFirst({
      where: { id, ownerId: MOCK_OWNER_ID, archivedAt: null },
      include: { units: { orderBy: { createdAt: "asc" } } },
    })) as {
      id: string;
      name: string;
      addressLine1: string;
      addressLine2: string | null;
      city: string;
      state: string;
      postalCode: string;
      propertyType: string;
      notes: string | null;
      units: Array<{
        id: string;
        label: string;
        bedrooms: number | null;
        bathrooms: { toString(): string } | number | null;
        squareFeet: number | null;
        monthlyRent: { toString(): string } | number | null;
        occupied: boolean;
      }>;
    } | null;
    if (!p) return null;
    return {
      id: p.id,
      name: p.name,
      addressLine1: p.addressLine1,
      addressLine2: p.addressLine2,
      city: p.city,
      state: p.state,
      postalCode: p.postalCode,
      propertyType: p.propertyType,
      notes: p.notes,
      units: p.units.map((u) => ({
        id: u.id,
        label: u.label,
        bedrooms: u.bedrooms,
        bathrooms:
          u.bathrooms === null || u.bathrooms === undefined
            ? null
            : Number(u.bathrooms),
        squareFeet: u.squareFeet,
        monthlyRent:
          u.monthlyRent === null || u.monthlyRent === undefined
            ? null
            : Number(u.monthlyRent),
        occupied: u.occupied,
      })),
    };
  } catch {
    return MOCK_DETAIL(id);
  }
}

export default async function PropertyDetailRoute({
  params,
}: {
  params: { id: string };
}) {
  const property = await loadProperty(params.id);

  if (!property) {
    return (
      <div data-testid="property-detail-page" className="flex flex-col gap-3">
        <Link href="/properties" className="text-sm text-primary">
          ← Properties
        </Link>
        <div className="pf-card text-center py-10">
          <h1 className="text-lg font-semibold text-heading">
            Property not found
          </h1>
          <p className="text-sm text-muted mt-2">
            It may have been archived or never existed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="property-detail-page" className="flex flex-col gap-4">
      <Link href="/properties" className="text-sm text-primary">
        ← Properties
      </Link>

      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-heading">
            {property.name}
          </h1>
          <p className="text-sm text-muted">
            {property.addressLine1}
            {property.addressLine2 ? `, ${property.addressLine2}` : ""} —{" "}
            {property.city}, {property.state} {property.postalCode}
          </p>
        </div>
      </header>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-heading">Units</h2>
          <UnitFormModal propertyId={property.id} />
        </div>

        {property.units.length === 0 ? (
          <div
            data-testid="units-empty"
            className="pf-card text-center text-sm text-muted py-6"
          >
            No units yet. Add one to start tracking rent.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {property.units.map((u) => (
              <li
                key={u.id}
                data-testid={`unit-row-${u.id}`}
                className="pf-card flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-heading truncate">
                      {u.label}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        u.occupied
                          ? "bg-success/15 text-success"
                          : "bg-muted/15 text-muted"
                      }`}
                    >
                      {u.occupied ? "Occupied" : "Vacant"}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    {u.bedrooms ?? "—"} bd · {u.bathrooms ?? "—"} ba ·{" "}
                    {u.squareFeet ? `${u.squareFeet} sqft` : "— sqft"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-heading">
                    {u.monthlyRent
                      ? `$${u.monthlyRent.toLocaleString()}/mo`
                      : "—"}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {property.notes ? (
        <section className="pf-card">
          <h3 className="text-sm font-semibold text-heading mb-2">Notes</h3>
          <p className="text-sm text-body whitespace-pre-wrap">
            {property.notes}
          </p>
        </section>
      ) : null}
    </div>
  );
}
