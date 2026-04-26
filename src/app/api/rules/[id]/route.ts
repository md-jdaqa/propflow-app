// PropFlow — Transaction rules CRUD (update + delete by id).

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MOCK_OWNER_ID = "00000000-0000-0000-0000-000000000001";

const RuleFieldEnum = z.enum(["PAYEE", "PAYER", "MEMO", "AMOUNT", "METHOD"]);
const RuleOperatorEnum = z.enum([
  "EQUALS",
  "CONTAINS",
  "STARTS_WITH",
  "GREATER_THAN",
  "LESS_THAN",
]);
const TaxBadgeEnum = z.enum([
  "DEDUCTIBLE",
  "INCOME",
  "NON_DEDUCTIBLE",
  "REVIEW",
  "UNCATEGORIZED",
]);

const RuleUpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  matchField: RuleFieldEnum.optional(),
  matchOperator: RuleOperatorEnum.optional(),
  matchValue: z.string().min(1).max(200).optional(),
  setCategory: z.string().max(120).optional().nullable(),
  setScheduleELine: z.coerce.number().int().min(1).max(50).optional().nullable(),
  setTaxBadge: TaxBadgeEnum.optional().nullable(),
  priority: z.coerce.number().int().min(0).max(10000).optional(),
  enabled: z.boolean().optional(),
  propertyId: z.string().uuid().optional().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = params.id;
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = RuleUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const existing = await prisma.transactionRule.findUnique({ where: { id } });
    if (!existing || existing.ownerId !== MOCK_OWNER_ID) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }
    const rule = await prisma.transactionRule.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ rule });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update rule" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = params.id;
  try {
    const existing = await prisma.transactionRule.findUnique({ where: { id } });
    if (!existing || existing.ownerId !== MOCK_OWNER_ID) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }
    await prisma.transactionRule.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete rule" },
      { status: 500 },
    );
  }
}
