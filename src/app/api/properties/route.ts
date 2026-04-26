import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MOCK_OWNER_ID = "00000000-0000-0000-0000-000000000001";

const PropertyTypeEnum = z.enum([
  "RESIDENTIAL_LTR",
  "RESIDENTIAL_STR",
  "COMMERCIAL",
  "MIXED_USE",
]);

const PropertyCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  propertyType: PropertyTypeEnum.default("RESIDENTIAL_LTR"),
  purchasePrice: z.coerce.number().nonnegative().optional().nullable(),
  purchaseDate: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? new Date(v) : null)),
  landValue: z.coerce.number().nonnegative().optional().nullable(),
  addressLine1: z.string().min(1, "Address is required").max(200),
  addressLine2: z.string().max(200).optional().nullable(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(60),
  postalCode: z.string().min(1, "Postal code is required").max(20),
  country: z.string().max(60).default("US"),
  notes: z.string().max(2000).optional().nullable(),
});

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      where: { ownerId: MOCK_OWNER_ID, archivedAt: null },
      include: { _count: { select: { units: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ properties });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch properties" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = PropertyCreateSchema.safeParse(json);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path[0];
      if (typeof path === "string" && !fieldErrors[path]) {
        fieldErrors[path] = issue.message;
      }
    }
    return NextResponse.json(
      { error: "Validation failed", fieldErrors },
      { status: 400 },
    );
  }

  try {
    const data = parsed.data;
    const property = await prisma.property.create({
      data: {
        ownerId: MOCK_OWNER_ID,
        name: data.name,
        propertyType: data.propertyType,
        purchasePrice: data.purchasePrice ?? null,
        purchaseDate: data.purchaseDate ?? null,
        landValue: data.landValue ?? null,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 ?? null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country ?? "US",
        notes: data.notes ?? null,
      },
    });
    revalidatePath("/properties");
    return NextResponse.json({ property }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create property" },
      { status: 500 },
    );
  }
}
