import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MOCK_OWNER_ID = "00000000-0000-0000-0000-000000000001";

const UnitCreateSchema = z.object({
  label: z.string().min(1, "Label is required").max(60),
  bedrooms: z.coerce.number().int().nonnegative().max(50).optional().nullable(),
  bathrooms: z.coerce.number().nonnegative().max(50).optional().nullable(),
  squareFeet: z.coerce.number().int().nonnegative().max(1_000_000).optional().nullable(),
  monthlyRent: z.coerce.number().nonnegative().max(10_000_000).optional().nullable(),
  occupied: z.coerce.boolean().optional().default(false),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = UnitCreateSchema.safeParse(json);
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
    const property = await prisma.property.findFirst({
      where: { id: params.id, ownerId: MOCK_OWNER_ID, archivedAt: null },
      select: { id: true },
    });
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const data = parsed.data;
    const unit = await prisma.unit.create({
      data: {
        propertyId: params.id,
        label: data.label,
        bedrooms: data.bedrooms ?? null,
        bathrooms: data.bathrooms ?? null,
        squareFeet: data.squareFeet ?? null,
        monthlyRent: data.monthlyRent ?? null,
        occupied: data.occupied ?? false,
      },
    });

    revalidatePath(`/properties/${params.id}`);
    revalidatePath("/properties");
    return NextResponse.json({ unit }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create unit" },
      { status: 500 },
    );
  }
}
