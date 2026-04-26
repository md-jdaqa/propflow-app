// PropFlow — fetch a single receipt as printable HTML.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderReceiptHtml } from "@/lib/receipts/generate";

export const runtime = "nodejs";

const MOCK_OWNER_ID = "00000000-0000-0000-0000-000000000001";

export async function GET(
  _req: NextRequest,
  { params }: { params: { number: string } },
) {
  const number = params.number;
  if (!number) {
    return NextResponse.json({ error: "Receipt number required" }, { status: 400 });
  }

  try {
    const receipt = await prisma.receipt.findUnique({
      where: { number },
      include: { tenant: true },
    });

    if (!receipt || receipt.ownerId !== MOCK_OWNER_ID) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    const payerName = receipt.tenant
      ? `${receipt.tenant.firstName} ${receipt.tenant.lastName}`.trim()
      : "Tenant";

    const html = renderReceiptHtml({
      number: receipt.number,
      payerName,
      amount: Number(receipt.amount),
      paidOn: receipt.paidOn,
      method: receipt.method,
      notes: receipt.notes,
    });

    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load receipt" },
      { status: 500 },
    );
  }
}
