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

const PropertyPatchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  propertyType: PropertyTypeEnum.optional(),
  purchasePrice: z.coerce.number().nonnegative().nullable().optional(),
  purchaseDate: z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v === undefined ? undefined : v ? new Date(v) : null)),
  landValue: z.coerce.number().nonnegative().nullable().optional(),
  addressLine1: z.string().min(1).max(200).optional(),
  addressLine2: z.string().max(200).nullable().optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(60).optional(),
  postalCode: z.string().min(1).max(20).optional(),
  country: z.string().max(60).optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const property = await prisma.property.findFirst({
      where: { id: params.id, ownerId: MOCK_OWNER_ID, archivedAt: null },
      include: {
        units: {
          include: { tenants: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }
    return NextResponse.json({ property });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch property" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = PropertyPatchSchema.safeParse(json);
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
    const existing = await prisma.property.findFirst({
      where: { id: params.id, ownerId: MOCK_OWNER_ID, archivedAt: null },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const property = await prisma.property.update({
      where: { id: params.id },
      data: parsed.data,
    });
    revalidatePath("/properties");
    revalidatePath(`/properties/${params.id}`);
    return NextResponse.json({ property });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update property" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const existing = await prisma.property.findFirst({
      where: { id: params.id, ownerId: MOCK_OWNER_ID, archivedAt: null },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    await prisma.property.update({
      where: { id: params.id },
      data: { archivedAt: new Date() },
    });
    revalidatePath("/properties");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete property" },
      { status: 500 },
    );
  }
}
