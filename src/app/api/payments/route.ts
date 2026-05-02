// PropFlow — Payments API.
// POST: create a payment, run rules + auto-categorize, optionally generate a receipt.
// GET:  list payments for owner with cursor-based pagination.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { categorize } from "@/lib/tax/categorize";
import { applyRules, type RuleSpec, type TaxBadge } from "@/lib/rules/engine";
import { nextReceiptNumber, parseReceiptNumber } from "@/lib/receipts/numbering";
import { renderReceiptHtml } from "@/lib/receipts/generate";

export const runtime = "nodejs";

const MOCK_OWNER_ID = "00000000-0000-0000-0000-000000000001";

const PaymentMethodEnum = z.enum([
  "CASH",
  "CHECK",
  "ACH",
  "CARD",
  "ZELLE",
  "VENMO",
  "OTHER",
]);
const TaxBadgeEnum = z.enum([
  "DEDUCTIBLE",
  "INCOME",
  "NON_DEDUCTIBLE",
  "REVIEW",
  "UNCATEGORIZED",
]);

const PaymentCreateSchema = z.object({
  amount: z.coerce.number(),
  paidOn: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(v) : new Date())),
  method: PaymentMethodEnum.default("CASH"),
  payer: z.string().max(120).optional().nullable(),
  payee: z.string().max(120).optional().nullable(),
  propertyId: z.string().uuid().optional().nullable(),
  unitId: z.string().uuid().optional().nullable(),
  tenantId: z.string().uuid().optional().nullable(),
  memo: z.string().max(2000).optional().nullable(),
  scheduleELine: z.coerce.number().int().min(1).max(50).optional().nullable(),
  category: z.string().max(120).optional().nullable(),
  taxBadge: TaxBadgeEnum.optional().nullable(),
  generateReceipt: z.boolean().default(false),
  isPartial: z.boolean().default(false),
  /** Optional payment proof image as a data URL (e.g. "data:image/jpeg;base64,..."). Max 2 MB. */
  proofImageDataUrl: z
    .string()
    .max(2_800_000) // ~2 MB base64
    .regex(/^data:image\//, "Must be an image data URL")
    .optional()
    .nullable(),
});

const ListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  cursor: z.string().uuid().optional(),
});

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const parsed = ListQuerySchema.safeParse({
    limit: url.searchParams.get("limit") ?? undefined,
    cursor: url.searchParams.get("cursor") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const { limit, cursor } = parsed.data;
  try {
    const payments = await prisma.payment.findMany({
      where: { ownerId: MOCK_OWNER_ID },
      orderBy: { paidOn: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    let nextCursor: string | null = null;
    if (payments.length > limit) {
      const next = payments.pop();
      nextCursor = next?.id ?? null;
    }
    return NextResponse.json({ payments, nextCursor });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load payments" },
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

  const parsed = PaymentCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const warnings: string[] = [];
  let category: string | null = data.category ?? null;
  let scheduleELine: number | null = data.scheduleELine ?? null;
  let taxBadge: TaxBadge = (data.taxBadge ?? "UNCATEGORIZED") as TaxBadge;
  let ruleAppliedId: string | null = null;

  // Step 1 — load + apply rules. Tolerate DB failure.
  try {
    const dbRules = await prisma.transactionRule.findMany({
      where: { ownerId: MOCK_OWNER_ID, enabled: true },
    });
    // Prisma may not have all enums generated yet — narrow via the engine's
    // string-literal aliases.
    const ruleSpecs: RuleSpec[] = (dbRules as Array<Record<string, unknown>>).map(
      (r) => ({
        id: String(r.id),
        matchField: r.matchField as RuleSpec["matchField"],
        matchOperator: r.matchOperator as RuleSpec["matchOperator"],
        matchValue: String(r.matchValue),
        setCategory: (r.setCategory as string | null) ?? null,
        setScheduleELine: (r.setScheduleELine as number | null) ?? null,
        setTaxBadge: (r.setTaxBadge as TaxBadge | null) ?? null,
        priority: Number(r.priority),
        enabled: Boolean(r.enabled),
      }),
    );
    const match = applyRules(
      {
        payee: data.payee ?? null,
        payer: data.payer ?? null,
        memo: data.memo ?? null,
        amount: data.amount,
        method: data.method,
      },
      ruleSpecs,
    );
    if (match) {
      ruleAppliedId = match.rule.id;
      if (!data.category && match.applied.category) category = match.applied.category;
      if (
        (data.scheduleELine === null || data.scheduleELine === undefined) &&
        typeof match.applied.scheduleELine === "number"
      ) {
        scheduleELine = match.applied.scheduleELine;
      }
      if (!data.taxBadge && match.applied.taxBadge) {
        taxBadge = match.applied.taxBadge;
      }
    }
  } catch {
    // Couldn't reach rules — fall through to the categorizer.
  }

  // Step 2 — fill in remaining gaps via auto-categorize.
  if (!category || scheduleELine === null || taxBadge === "UNCATEGORIZED") {
    const auto = categorize({
      amount: data.amount,
      payee: data.payee ?? undefined,
      payer: data.payer ?? undefined,
      memo: data.memo ?? undefined,
      category: data.category ?? undefined,
      method: data.method,
    });
    if (!category) category = auto.category;
    if (scheduleELine === null) scheduleELine = auto.scheduleELine;
    if (taxBadge === "UNCATEGORIZED") taxBadge = auto.taxBadge as TaxBadge;
    warnings.push(...auto.warnings);
  }

  // Step 3 — persist payment.
  try {
    const payment = await prisma.payment.create({
      data: {
        ownerId: MOCK_OWNER_ID,
        propertyId: data.propertyId ?? null,
        unitId: data.unitId ?? null,
        tenantId: data.tenantId ?? null,
        amount: data.amount,
        paidOn: data.paidOn,
        method: data.method,
        scheduleELine: scheduleELine,
        taxBadge,
        category,
        payee: data.payee ?? null,
        payer: data.payer ?? null,
        memo: data.memo ?? null,
        isPartial: data.isPartial,
        ruleAppliedId,
      },
    });

    let receiptInfo: { number: string; html: string } | null = null;

    // Step 4 — optional receipt generation (income only).
    if (data.generateReceipt && data.amount > 0) {
      const year = data.paidOn.getFullYear();
      let lastSeq = 0;
      try {
        const last = await prisma.receipt.findFirst({
          where: {
            ownerId: MOCK_OWNER_ID,
            number: { startsWith: `PF-${year}-` },
          },
          orderBy: { number: "desc" },
        });
        if (last) {
          const parsedNum = parseReceiptNumber(last.number);
          if (parsedNum) lastSeq = parsedNum.seq;
        }
      } catch {
        // ignore
      }
      const number = nextReceiptNumber(year, lastSeq);

      let payerName = data.payer ?? "Tenant";
      if (data.tenantId) {
        try {
          const tenant = await prisma.tenant.findUnique({
            where: { id: data.tenantId },
          });
          if (tenant) payerName = `${tenant.firstName} ${tenant.lastName}`.trim();
        } catch {
          // keep fallback
        }
      }

      const html = renderReceiptHtml({
        number,
        payerName,
        amount: data.amount,
        paidOn: data.paidOn,
        method: data.method,
        notes: data.memo ?? null,
        proofImageDataUrl: data.proofImageDataUrl ?? null,
      });

      try {
        const receipt = await prisma.receipt.create({
          data: {
            ownerId: MOCK_OWNER_ID,
            tenantId: data.tenantId ?? null,
            number,
            amount: data.amount,
            paidOn: data.paidOn,
            method: data.method,
            notes: data.memo ?? null,
          },
        });
        await prisma.payment.update({
          where: { id: payment.id },
          data: { receiptId: receipt.id },
        });
        receiptInfo = { number, html };
      } catch {
        receiptInfo = { number: "PF-DRAFT", html };
      }
    }

    return NextResponse.json(
      { payment, warnings, receipt: receiptInfo },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to create payment",
        warnings,
      },
      { status: 500 },
    );
  }
}
