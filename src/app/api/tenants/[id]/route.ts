import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MOCK_OWNER_ID = "00000000-0000-0000-0000-000000000001";

const TenantPatchSchema = z.object({
  firstName: z.string().min(1).max(80).optional(),
  lastName: z.string().min(1).max(80).optional(),
  email: z
    .string()
    .email()
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  phone: z.string().max(40).nullable().optional(),
  unitId: z.string().uuid().nullable().optional(),
  leaseStart: z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v === undefined ? undefined : v ? new Date(v) : null)),
  leaseEnd: z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v === undefined ? undefined : v ? new Date(v) : null)),
  monthlyRent: z.coerce.number().nonnegative().nullable().optional(),
  depositHeld: z.coerce.number().nonnegative().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const tenant = await prisma.tenant.findFirst({
      where: { id: params.id, ownerId: MOCK_OWNER_ID, archivedAt: null },
      include: {
        unit: { include: { property: true } },
      },
    });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }
    return NextResponse.json({ tenant });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch tenant" },
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

  const parsed = TenantPatchSchema.safeParse(json);
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
    const existing = await prisma.tenant.findFirst({
      where: { id: params.id, ownerId: MOCK_OWNER_ID, archivedAt: null },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const tenant = await prisma.tenant.update({
      where: { id: params.id },
      data: parsed.data,
    });
    revalidatePath("/tenants");
    revalidatePath(`/tenants/${params.id}`);
    return NextResponse.json({ tenant });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update tenant" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const existing = await prisma.tenant.findFirst({
      where: { id: params.id, ownerId: MOCK_OWNER_ID, archivedAt: null },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    await prisma.tenant.update({
      where: { id: params.id },
      data: { archivedAt: new Date() },
    });
    revalidatePath("/tenants");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete tenant" },
      { status: 500 },
    );
  }
}
