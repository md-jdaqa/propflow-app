// PropFlow — Transaction rules CRUD (list + create).
// Falls back to in-memory storage if Prisma is unavailable in dev.

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

const RuleCreateSchema = z.object({
  name: z.string().min(1).max(120),
  matchField: RuleFieldEnum,
  matchOperator: RuleOperatorEnum,
  matchValue: z.string().min(1).max(200),
  setCategory: z.string().max(120).optional().nullable(),
  setScheduleELine: z.coerce.number().int().min(1).max(50).optional().nullable(),
  setTaxBadge: TaxBadgeEnum.optional().nullable(),
  priority: z.coerce.number().int().min(0).max(10000).default(100),
  enabled: z.boolean().default(true),
  propertyId: z.string().uuid().optional().nullable(),
});

// In-memory fallback — annotated: dev convenience, lost on reload.
type InMemoryRule = z.infer<typeof RuleCreateSchema> & {
  id: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
};
const inMemoryRules: InMemoryRule[] = [];
function memoryId(): string {
  return `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function GET() {
  try {
    const rules = await prisma.transactionRule.findMany({
      where: { ownerId: MOCK_OWNER_ID },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ rules });
  } catch {
    return NextResponse.json({
      rules: inMemoryRules.filter((r) => r.ownerId === MOCK_OWNER_ID),
      degraded: true,
    });
  }
}

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = RuleCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data = parsed.data;
  try {
    const rule = await prisma.transactionRule.create({
      data: {
        ownerId: MOCK_OWNER_ID,
        propertyId: data.propertyId ?? null,
        name: data.name,
        matchField: data.matchField,
        matchOperator: data.matchOperator,
        matchValue: data.matchValue,
        setCategory: data.setCategory ?? null,
        setScheduleELine: data.setScheduleELine ?? null,
        setTaxBadge: data.setTaxBadge ?? null,
        priority: data.priority,
        enabled: data.enabled,
      },
    });
    return NextResponse.json({ rule }, { status: 201 });
  } catch {
    const rule: InMemoryRule = {
      ...data,
      id: memoryId(),
      ownerId: MOCK_OWNER_ID,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryRules.push(rule);
    return NextResponse.json({ rule, degraded: true }, { status: 201 });
  }
}
