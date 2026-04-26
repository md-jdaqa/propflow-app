import { prisma } from "@/lib/prisma";
import { PropertiesPage } from "@/components/properties/PropertiesPage";

export const dynamic = "force-dynamic";

const MOCK_OWNER_ID = "00000000-0000-0000-0000-000000000001";

export type PropertyListItem = {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  propertyType: "RESIDENTIAL_LTR" | "RESIDENTIAL_STR" | "COMMERCIAL" | "MIXED_USE";
  unitsCount: number;
  occupiedCount: number;
};

const MOCK_PROPERTIES: PropertyListItem[] = [
  {
    id: "mock-1",
    name: "Brooklyn Brownstone",
    addressLine1: "123 Main St",
    addressLine2: null,
    city: "Brooklyn",
    state: "NY",
    postalCode: "11201",
    propertyType: "RESIDENTIAL_LTR",
    unitsCount: 3,
    occupiedCount: 2,
  },
  {
    id: "mock-2",
    name: "Park Slope Duplex",
    addressLine1: "456 Park Ave",
    addressLine2: "Apt B",
    city: "Brooklyn",
    state: "NY",
    postalCode: "11215",
    propertyType: "RESIDENTIAL_LTR",
    unitsCount: 2,
    occupiedCount: 2,
  },
  {
    id: "mock-3",
    name: "Beachside STR",
    addressLine1: "789 Shore Rd",
    addressLine2: null,
    city: "Long Beach",
    state: "NY",
    postalCode: "11561",
    propertyType: "RESIDENTIAL_STR",
    unitsCount: 1,
    occupiedCount: 0,
  },
];

async function loadProperties(): Promise<{
  items: PropertyListItem[];
  usingMock: boolean;
}> {
  if (!process.env.DATABASE_URL) {
    return { items: MOCK_PROPERTIES, usingMock: true };
  }
  try {
    const properties = (await prisma.property.findMany({
      where: { ownerId: MOCK_OWNER_ID, archivedAt: null },
      include: {
        _count: { select: { units: true } },
        units: { select: { occupied: true } },
      },
      orderBy: { createdAt: "desc" },
    })) as Array<{
      id: string;
      name: string;
      addressLine1: string;
      addressLine2: string | null;
      city: string;
      state: string;
      postalCode: string;
      propertyType: PropertyListItem["propertyType"];
      _count: { units: number };
      units: Array<{ occupied: boolean }>;
    }>;
    const items: PropertyListItem[] = properties.map((p) => ({
      id: p.id,
      name: p.name,
      addressLine1: p.addressLine1,
      addressLine2: p.addressLine2,
      city: p.city,
      state: p.state,
      postalCode: p.postalCode,
      propertyType: p.propertyType,
      unitsCount: p._count.units,
      occupiedCount: p.units.filter((u) => u.occupied).length,
    }));
    return { items, usingMock: false };
  } catch {
    return { items: MOCK_PROPERTIES, usingMock: true };
  }
}

export default async function PropertiesRoute({
  searchParams,
}: {
  searchParams?: { action?: string };
}) {
  const initialAction = searchParams?.action ?? null;
  const { items, usingMock } = await loadProperties();
  return (
    <PropertiesPage
      data={items}
      initialAction={initialAction}
      usingMock={usingMock}
    />
  );
}
