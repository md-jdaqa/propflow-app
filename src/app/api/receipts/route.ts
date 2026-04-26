// PropFlow — receipts API.
// POST creates a receipt with auto-numbered sequence; GET via [number]/route.ts.
// Falls back to a draft number + rendered HTML when DB is unavailable so the
// landlord can still print on the spot.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
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

const ReceiptCreateSchema = z.object({
  tenantId: z.string().uuid().optional().nullable(),
  payerName: z.string().min(1).max(120).optional(),
  amount: z.coerce.number().positive(),
  paidOn: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(v) : new Date())),
  method: PaymentMethodEnum.default("CASH"),
  notes: z.string().max(2000).optional().nullable(),
});

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = ReceiptCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const year = data.paidOn.getFullYear();
  let payerName = data.payerName ?? "Tenant";

  // Try DB first; fall back to draft on failure.
  try {
    if (data.tenantId) {
      try {
        const tenant = await prisma.tenant.findUnique({
          where: { id: data.tenantId },
        });
        if (tenant) payerName = `${tenant.firstName} ${tenant.lastName}`.trim();
      } catch {
        // Non-fatal — keep whatever payerName we have.
      }
    }

    // Find the most recent receipt for this owner this year to derive next seq.
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
      // ignore — we'll start at 0.
    }

    const number = nextReceiptNumber(year, lastSeq);

    const html = renderReceiptHtml({
      number,
      payerName,
      amount: data.amount,
      paidOn: data.paidOn,
      method: data.method,
      notes: data.notes ?? null,
    });

    try {
      await prisma.receipt.create({
        data: {
          ownerId: MOCK_OWNER_ID,
          tenantId: data.tenantId ?? null,
          number,
          amount: data.amount,
          paidOn: data.paidOn,
          method: data.method,
          notes: data.notes ?? null,
        },
      });
    } catch {
      // DB write failed — still return the rendered receipt so the landlord
      // can print, but mark as draft.
      return NextResponse.json({ number: "PF-DRAFT", html, persisted: false });
    }

    return NextResponse.json({ number, html, persisted: true }, { status: 201 });
  } catch (err) {
    // Catastrophic — still return a draft.
    const html = renderReceiptHtml({
      number: "PF-DRAFT",
      payerName,
      amount: data.amount,
      paidOn: data.paidOn,
      method: data.method,
      notes: data.notes ?? null,
    });
    return NextResponse.json({
      number: "PF-DRAFT",
      html,
      persisted: false,
      error: err instanceof Error ? err.message : "Receipt persistence failed",
    });
  }
}
