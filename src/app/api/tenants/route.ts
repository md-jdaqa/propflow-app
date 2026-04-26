import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MOCK_OWNER_ID = "00000000-0000-0000-0000-000000000001";

const TenantCreateSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(80),
  lastName: z.string().min(1, "Last name is required").max(80),
  email: z
    .string()
    .email("Invalid email")
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  phone: z.string().max(40).optional().nullable(),
  unitId: z.string().uuid("Invalid unit").optional().nullable(),
  leaseStart: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? new Date(v) : null)),
  leaseEnd: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? new Date(v) : null)),
  monthlyRent: z.coerce.number().nonnegative().optional().nullable(),
  depositHeld: z.coerce.number().nonnegative().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export async function GET() {
  try {
    const tenants = await prisma.tenant.findMany({
      where: { ownerId: MOCK_OWNER_ID, archivedAt: null },
      include: {
        unit: {
          include: { property: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ tenants });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch tenants" },
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

  const parsed = TenantCreateSchema.safeParse(json);
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

    if (data.unitId) {
      const unit = await prisma.unit.findFirst({
        where: {
          id: data.unitId,
          property: { ownerId: MOCK_OWNER_ID, archivedAt: null },
        },
        select: { id: true },
      });
      if (!unit) {
        return NextResponse.json(
          { error: "Validation failed", fieldErrors: { unitId: "Unit not found" } },
          { status: 400 },
        );
      }
    }

    const tenant = await prisma.tenant.create({
      data: {
        ownerId: MOCK_OWNER_ID,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email ?? null,
        phone: data.phone ?? null,
        unitId: data.unitId ?? null,
        leaseStart: data.leaseStart ?? null,
        leaseEnd: data.leaseEnd ?? null,
        monthlyRent: data.monthlyRent ?? null,
        depositHeld: data.depositHeld ?? null,
        notes: data.notes ?? null,
      },
    });

    revalidatePath("/tenants");
    return NextResponse.json({ tenant }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create tenant" },
      { status: 500 },
    );
  }
}
