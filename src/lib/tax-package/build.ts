// PropFlow — One-click tax package zip builder.
// Streams a zip containing README, schedule-e.csv, transactions.csv,
// receipts/*.html, and properties.csv. Falls back to demo data if Prisma fails.

import archiver from "archiver";
import type { Readable } from "stream";
import { PassThrough } from "stream";
import { prisma } from "@/lib/prisma";
import { renderReceiptHtml } from "@/lib/receipts/generate";

interface PaymentForExport {
  paidOn: Date;
  amount: number;
  payee: string | null;
  payer: string | null;
  category: string | null;
  scheduleELine: number | null;
  taxBadge: string;
  memo: string | null;
}

interface ReceiptForExport {
  number: string;
  amount: number;
  paidOn: Date;
  method: string;
  notes: string | null;
  payerName: string;
}

interface PropertyForExport {
  name: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  propertyType: string;
  unitsCount: number;
}

interface PackageData {
  payments: PaymentForExport[];
  receipts: ReceiptForExport[];
  properties: PropertyForExport[];
  demoMode: boolean;
}

const SCHEDULE_E_LINES: Array<{ line: number; description: string }> = [
  { line: 3, description: "Rents received" },
  { line: 5, description: "Advertising" },
  { line: 6, description: "Auto and travel" },
  { line: 7, description: "Cleaning and maintenance / commissions" },
  { line: 9, description: "Insurance" },
  { line: 10, description: "Legal and other professional fees" },
  { line: 11, description: "Management fees" },
  { line: 12, description: "Mortgage interest paid to banks" },
  { line: 13, description: "Other interest" },
  { line: 14, description: "Repairs" },
  { line: 15, description: "Supplies" },
  { line: 16, description: "Taxes" },
  { line: 17, description: "Utilities" },
  { line: 18, description: "Depreciation" },
  { line: 19, description: "Other (HOA, pest, security, landscape, software)" },
];

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function csvRow(values: unknown[]): string {
  return values.map(csvEscape).join(",");
}

async function loadPackageData(
  ownerId: string,
  year: number,
): Promise<PackageData> {
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const startOfNextYear = new Date(Date.UTC(year + 1, 0, 1));

  try {
    const [payments, receipts, properties] = await Promise.all([
      prisma.payment.findMany({
        where: {
          ownerId,
          paidOn: { gte: startOfYear, lt: startOfNextYear },
        },
        orderBy: { paidOn: "asc" },
      }),
      prisma.receipt.findMany({
        where: {
          ownerId,
          paidOn: { gte: startOfYear, lt: startOfNextYear },
        },
        include: { tenant: true },
        orderBy: { paidOn: "asc" },
      }),
      prisma.property.findMany({
        where: { ownerId, archivedAt: null },
        include: { _count: { select: { units: true } } },
      }),
    ]);

    // Prisma client may be lagging the schema (enums not regenerated) — narrow
    // through `unknown` rather than relying on the generated row types.
    const paymentsArr = payments as unknown as Array<Record<string, unknown>>;
    const receiptsArr = receipts as unknown as Array<Record<string, unknown>>;
    const propertiesArr = properties as unknown as Array<Record<string, unknown>>;

    return {
      payments: paymentsArr.map((p) => ({
        paidOn: p.paidOn as Date,
        amount: Number(p.amount),
        payee: (p.payee as string | null) ?? null,
        payer: (p.payer as string | null) ?? null,
        category: (p.category as string | null) ?? null,
        scheduleELine: (p.scheduleELine as number | null) ?? null,
        taxBadge: String(p.taxBadge),
        memo: (p.memo as string | null) ?? null,
      })),
      receipts: receiptsArr.map((r) => {
        const tenant = r.tenant as
          | { firstName: string; lastName: string }
          | null;
        return {
          number: String(r.number),
          amount: Number(r.amount),
          paidOn: r.paidOn as Date,
          method: String(r.method),
          notes: (r.notes as string | null) ?? null,
          payerName: tenant
            ? `${tenant.firstName} ${tenant.lastName}`.trim()
            : "Tenant",
        };
      }),
      properties: propertiesArr.map((prop) => {
        const count = prop._count as { units: number } | undefined;
        return {
          name: String(prop.name),
          addressLine1: String(prop.addressLine1),
          addressLine2: (prop.addressLine2 as string | null) ?? null,
          city: String(prop.city),
          state: String(prop.state),
          postalCode: String(prop.postalCode),
          propertyType: String(prop.propertyType),
          unitsCount: count?.units ?? 0,
        };
      }),
      demoMode: false,
    };
  } catch {
    // No DB or query failed — fall back to a small demo dataset so the route
    // still streams a valid zip.
    return {
      demoMode: true,
      payments: [
        {
          paidOn: new Date(Date.UTC(year, 0, 5)),
          amount: 1400,
          payee: null,
          payer: "Demo Tenant",
          category: "Rental income",
          scheduleELine: 3,
          taxBadge: "INCOME",
          memo: "January rent",
        },
        {
          paidOn: new Date(Date.UTC(year, 1, 12)),
          amount: -250,
          payee: "Joseph Neff",
          payer: null,
          category: "Management fees",
          scheduleELine: 11,
          taxBadge: "DEDUCTIBLE",
          memo: "Property management fee",
        },
      ],
      receipts: [],
      properties: [
        {
          name: "Demo Brooklyn Triplex",
          addressLine1: "123 Demo Ave",
          addressLine2: null,
          city: "Brooklyn",
          state: "NY",
          postalCode: "11201",
          propertyType: "RESIDENTIAL_LTR",
          unitsCount: 3,
        },
      ],
    };
  }
}

function buildScheduleECsv(payments: PaymentForExport[]): string {
  const totals = new Map<number, number>();
  for (const p of payments) {
    if (p.scheduleELine === null || p.scheduleELine === undefined) continue;
    const cur = totals.get(p.scheduleELine) ?? 0;
    // Income (line 3) stays positive; expenses are absolute values.
    const value = p.scheduleELine === 3 ? p.amount : Math.abs(p.amount);
    totals.set(p.scheduleELine, cur + value);
  }
  const lines = ["line,description,amount"];
  for (const { line, description } of SCHEDULE_E_LINES) {
    const total = totals.get(line) ?? 0;
    lines.push(csvRow([line, description, total.toFixed(2)]));
  }
  return lines.join("\n") + "\n";
}

function buildTransactionsCsv(payments: PaymentForExport[]): string {
  const lines = [
    "date,type,amount,payee,payer,category,scheduleELine,taxBadge,memo",
  ];
  for (const p of payments) {
    lines.push(
      csvRow([
        p.paidOn.toISOString().slice(0, 10),
        p.amount >= 0 ? "income" : "expense",
        p.amount.toFixed(2),
        p.payee ?? "",
        p.payer ?? "",
        p.category ?? "",
        p.scheduleELine ?? "",
        p.taxBadge,
        p.memo ?? "",
      ]),
    );
  }
  return lines.join("\n") + "\n";
}

function buildPropertiesCsv(properties: PropertyForExport[]): string {
  const lines = [
    "name,address,city,state,postalCode,propertyType,unitsCount",
  ];
  for (const prop of properties) {
    const addr = [prop.addressLine1, prop.addressLine2].filter(Boolean).join(" ");
    lines.push(
      csvRow([
        prop.name,
        addr,
        prop.city,
        prop.state,
        prop.postalCode,
        prop.propertyType,
        prop.unitsCount,
      ]),
    );
  }
  return lines.join("\n") + "\n";
}

function buildReadme(data: PackageData, year: number): string {
  const incomeTotal = data.payments
    .filter((p) => p.amount > 0)
    .reduce((acc, p) => acc + p.amount, 0);
  const expenseTotal = data.payments
    .filter((p) => p.amount < 0)
    .reduce((acc, p) => acc + Math.abs(p.amount), 0);

  const banner = data.demoMode
    ? "DEMO MODE — connect Supabase for real data.\n\n"
    : "";

  return (
    `${banner}PropFlow Tax Package — ${year}\n` +
    `=================================\n\n` +
    `Generated: ${new Date().toISOString()}\n` +
    `Properties: ${data.properties.length}\n` +
    `Transactions: ${data.payments.length}\n` +
    `Receipts: ${data.receipts.length}\n\n` +
    `Total income: $${incomeTotal.toFixed(2)}\n` +
    `Total expenses: $${expenseTotal.toFixed(2)}\n` +
    `Net: $${(incomeTotal - expenseTotal).toFixed(2)}\n\n` +
    `Files:\n` +
    `  - schedule-e.csv   Schedule E line totals (lines 3, 5-19)\n` +
    `  - transactions.csv Every payment for ${year}\n` +
    `  - properties.csv   Each property with address & unit count\n` +
    `  - receipts/*.html  Printable receipts (if any)\n\n` +
    `Hand this package to your CPA at year-end. Numbers are reference only —\n` +
    `final return prep requires CPA review (depreciation, capital improvements,\n` +
    `1099-NEC filings).\n`
  );
}

function safeReceiptFileName(num: string): string {
  return `${num.replace(/[^A-Za-z0-9_-]/g, "_")}.html`;
}

export async function buildTaxPackageStream(
  ownerId: string,
  year: number,
): Promise<{ filename: string; stream: Readable }> {
  const data = await loadPackageData(ownerId, year);
  const archive = archiver("zip", { zlib: { level: 9 } });
  const passthrough = new PassThrough();

  // Surface any archiver errors on the passthrough stream.
  archive.on("error", (err) => passthrough.destroy(err));
  archive.pipe(passthrough);

  archive.append(buildReadme(data, year), { name: "README.txt" });
  archive.append(buildScheduleECsv(data.payments), { name: "schedule-e.csv" });
  archive.append(buildTransactionsCsv(data.payments), { name: "transactions.csv" });
  archive.append(buildPropertiesCsv(data.properties), { name: "properties.csv" });

  for (const receipt of data.receipts) {
    const html = renderReceiptHtml({
      number: receipt.number,
      payerName: receipt.payerName,
      amount: receipt.amount,
      paidOn: receipt.paidOn,
      method: receipt.method,
      notes: receipt.notes,
    });
    archive.append(html, { name: `receipts/${safeReceiptFileName(receipt.number)}` });
  }

  // Fire-and-forget — errors propagate via the "error" listener above.
  archive.finalize().catch((err) => passthrough.destroy(err));

  return {
    filename: `propflow-tax-package-${year}.zip`,
    stream: passthrough,
  };
}
