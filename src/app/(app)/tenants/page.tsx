import { prisma } from "@/lib/prisma";
import { TenantsPage } from "@/components/tenants/TenantsPage";

export const dynamic = "force-dynamic";

const MOCK_OWNER_ID = "00000000-0000-0000-0000-000000000001";

export type TenantUnitOption = {
  id: string;
  label: string;
  propertyName: string;
};

export type TenantListItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  unitLabel: string | null;
  propertyName: string | null;
  leaseStart: string | null;
  leaseEnd: string | null;
  monthlyRent: number | null;
};

const MOCK_TENANTS: TenantListItem[] = [
  {
    id: "mock-t-1",
    firstName: "Alex",
    lastName: "Johnson",
    email: "alex@example.com",
    phone: "555-0101",
    unitLabel: "Unit 1",
    propertyName: "Brooklyn Brownstone",
    leaseStart: "2025-01-01",
    leaseEnd: "2026-12-31",
    monthlyRent: 2400,
  },
  {
    id: "mock-t-2",
    firstName: "Bri",
    lastName: "Lee",
    email: "bri@example.com",
    phone: "555-0102",
    unitLabel: "Unit 2",
    propertyName: "Brooklyn Brownstone",
    leaseStart: "2024-09-01",
    leaseEnd: "2025-08-31",
    monthlyRent: 1800,
  },
  {
    id: "mock-t-3",
    firstName: "Chris",
    lastName: "Davis",
    email: null,
    phone: "555-0103",
    unitLabel: "Apt B",
    propertyName: "Park Slope Duplex",
    leaseStart: "2025-03-15",
    leaseEnd: "2026-03-14",
    monthlyRent: 3100,
  },
  {
    id: "mock-t-4",
    firstName: "Dana",
    lastName: "Patel",
    email: "dana@example.com",
    phone: null,
    unitLabel: "Apt A",
    propertyName: "Park Slope Duplex",
    leaseStart: "2025-06-01",
    leaseEnd: "2026-05-31",
    monthlyRent: 2900,
  },
  {
    id: "mock-t-5",
    firstName: "Evan",
    lastName: "Quinn",
    email: "evan@example.com",
    phone: "555-0105",
    unitLabel: "Beach 1",
    propertyName: "Beachside STR",
    leaseStart: "2026-04-01",
    leaseEnd: "2026-04-30",
    monthlyRent: 4500,
  },
];

const MOCK_UNITS: TenantUnitOption[] = [
  { id: "mock-u-1", label: "Unit 1", propertyName: "Brooklyn Brownstone" },
  { id: "mock-u-2", label: "Unit 2", propertyName: "Brooklyn Brownstone" },
  { id: "mock-u-3", label: "Apt A", propertyName: "Park Slope Duplex" },
  { id: "mock-u-4", label: "Apt B", propertyName: "Park Slope Duplex" },
  { id: "mock-u-5", label: "Beach 1", propertyName: "Beachside STR" },
];

async function loadData(): Promise<{
  tenants: TenantListItem[];
  units: TenantUnitOption[];
  usingMock: boolean;
}> {
  if (!process.env.DATABASE_URL) {
    return { tenants: MOCK_TENANTS, units: MOCK_UNITS, usingMock: true };
  }
  try {
    type TenantRow = {
      id: string;
      firstName: string;
      lastName: string;
      email: string | null;
      phone: string | null;
      leaseStart: Date | null;
      leaseEnd: Date | null;
      monthlyRent: { toString(): string } | number | null;
      unit: {
        label: string;
        property: { name: string } | null;
      } | null;
    };
    type UnitRow = {
      id: string;
      label: string;
      property: { name: string };
    };
    const [tenantsRaw, unitsRaw] = await Promise.all([
      prisma.tenant.findMany({
        where: { ownerId: MOCK_OWNER_ID, archivedAt: null },
        include: { unit: { include: { property: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.unit.findMany({
        where: {
          property: { ownerId: MOCK_OWNER_ID, archivedAt: null },
        },
        include: { property: true },
        orderBy: { label: "asc" },
      }),
    ]);
    const tenants = tenantsRaw as TenantRow[];
    const units = unitsRaw as UnitRow[];

    return {
      tenants: tenants.map((t) => ({
        id: t.id,
        firstName: t.firstName,
        lastName: t.lastName,
        email: t.email,
        phone: t.phone,
        unitLabel: t.unit?.label ?? null,
        propertyName: t.unit?.property?.name ?? null,
        leaseStart: t.leaseStart ? t.leaseStart.toISOString() : null,
        leaseEnd: t.leaseEnd ? t.leaseEnd.toISOString() : null,
        monthlyRent:
          t.monthlyRent === null || t.monthlyRent === undefined
            ? null
            : Number(t.monthlyRent),
      })),
      units: units.map((u) => ({
        id: u.id,
        label: u.label,
        propertyName: u.property.name,
      })),
      usingMock: false,
    };
  } catch {
    return { tenants: MOCK_TENANTS, units: MOCK_UNITS, usingMock: true };
  }
}

export default async function TenantsRoute({
  searchParams,
}: {
  searchParams?: { action?: string };
}) {
  const initialAction = searchParams?.action ?? null;
  const { tenants, units, usingMock } = await loadData();
  return (
    <TenantsPage
      data={tenants}
      units={units}
      initialAction={initialAction}
      usingMock={usingMock}
    />
  );
}
