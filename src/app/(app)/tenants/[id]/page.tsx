import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Static export: provide stub params; real data loads at runtime via mock fallback
export async function generateStaticParams() {
  return [{ id: "demo" }, { id: "sample" }];
}

const MOCK_OWNER_ID = "00000000-0000-0000-0000-000000000001";

type TenantDetailView = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  unitLabel: string | null;
  propertyId: string | null;
  propertyName: string | null;
  leaseStart: string | null;
  leaseEnd: string | null;
  monthlyRent: number | null;
  depositHeld: number | null;
  notes: string | null;
};

const MOCK_DETAIL = (id: string): TenantDetailView => ({
  id,
  firstName: "Sample",
  lastName: "Tenant",
  email: "tenant@example.com",
  phone: "555-0100",
  unitLabel: "Unit 1",
  propertyId: null,
  propertyName: "Brooklyn Brownstone",
  leaseStart: "2025-01-01",
  leaseEnd: "2026-12-31",
  monthlyRent: 2400,
  depositHeld: 2400,
  notes: "Sample tenant — connect DATABASE_URL to load real records.",
});

const MOCK_PAYMENTS = [
  { id: "p1", paidOn: "2026-04-01", amount: 2400, method: "ACH", memo: "April rent" },
  { id: "p2", paidOn: "2026-03-01", amount: 2400, method: "ACH", memo: "March rent" },
  { id: "p3", paidOn: "2026-02-01", amount: 2400, method: "CHECK", memo: "Feb rent" },
  { id: "p4", paidOn: "2026-01-01", amount: 2400, method: "ACH", memo: "Jan rent" },
  { id: "p5", paidOn: "2025-12-01", amount: 2400, method: "ZELLE", memo: "Dec rent" },
  { id: "p6", paidOn: "2025-11-01", amount: 2400, method: "ACH", memo: "Nov rent" },
];

async function loadTenant(id: string): Promise<TenantDetailView | null> {
  if (!process.env.DATABASE_URL) return MOCK_DETAIL(id);
  try {
    const t = (await prisma.tenant.findFirst({
      where: { id, ownerId: MOCK_OWNER_ID, archivedAt: null },
      include: { unit: { include: { property: true } } },
    })) as {
      id: string;
      firstName: string;
      lastName: string;
      email: string | null;
      phone: string | null;
      leaseStart: Date | null;
      leaseEnd: Date | null;
      monthlyRent: { toString(): string } | number | null;
      depositHeld: { toString(): string } | number | null;
      notes: string | null;
      unit: {
        label: string;
        property: { id: string; name: string } | null;
      } | null;
    } | null;
    if (!t) return null;
    return {
      id: t.id,
      firstName: t.firstName,
      lastName: t.lastName,
      email: t.email,
      phone: t.phone,
      unitLabel: t.unit?.label ?? null,
      propertyId: t.unit?.property?.id ?? null,
      propertyName: t.unit?.property?.name ?? null,
      leaseStart: t.leaseStart ? t.leaseStart.toISOString() : null,
      leaseEnd: t.leaseEnd ? t.leaseEnd.toISOString() : null,
      monthlyRent:
        t.monthlyRent === null || t.monthlyRent === undefined
          ? null
          : Number(t.monthlyRent),
      depositHeld:
        t.depositHeld === null || t.depositHeld === undefined
          ? null
          : Number(t.depositHeld),
      notes: t.notes,
    };
  } catch {
    return MOCK_DETAIL(id);
  }
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function TenantDetailRoute({
  params,
}: {
  params: { id: string };
}) {
  const tenant = await loadTenant(params.id);

  if (!tenant) {
    return (
      <div data-testid="tenant-detail-page" className="flex flex-col gap-3">
        <Link href="/tenants" className="text-sm text-primary">
          ← Tenants
        </Link>
        <div className="pf-card text-center py-10">
          <h1 className="text-lg font-semibold text-heading">
            Tenant not found
          </h1>
          <p className="text-sm text-muted mt-2">
            It may have been archived or never existed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="tenant-detail-page" className="flex flex-col gap-4">
      <Link href="/tenants" className="text-sm text-primary">
        ← Tenants
      </Link>

      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-heading">
            {tenant.firstName} {tenant.lastName}
          </h1>
          <p className="text-sm text-muted">
            {tenant.unitLabel ?? "No unit"}
            {tenant.propertyName ? ` · ${tenant.propertyName}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/finances?tab=record&tenant=${tenant.id}`}
            data-testid="tenant-record-payment-cta"
            className="pf-btn pf-btn-primary min-h-11 px-4"
          >
            Record payment
          </Link>
          <button
            type="button"
            data-testid="tenant-end-lease"
            className="pf-btn pf-btn-secondary min-h-11 px-4"
          >
            End lease
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="pf-card">
          <h3 className="text-sm font-semibold text-heading mb-2">Lease</h3>
          <dl className="text-sm grid grid-cols-2 gap-y-1">
            <dt className="text-muted">Start</dt>
            <dd className="text-body">{fmtDate(tenant.leaseStart)}</dd>
            <dt className="text-muted">End</dt>
            <dd className="text-body">{fmtDate(tenant.leaseEnd)}</dd>
            <dt className="text-muted">Monthly rent</dt>
            <dd className="text-body">
              {tenant.monthlyRent
                ? `$${tenant.monthlyRent.toLocaleString()}`
                : "—"}
            </dd>
            <dt className="text-muted">Deposit held</dt>
            <dd className="text-body">
              {tenant.depositHeld
                ? `$${tenant.depositHeld.toLocaleString()}`
                : "—"}
            </dd>
          </dl>
        </div>
        <div className="pf-card">
          <h3 className="text-sm font-semibold text-heading mb-2">Contact</h3>
          <dl className="text-sm grid grid-cols-3 gap-y-1">
            <dt className="text-muted">Email</dt>
            <dd className="col-span-2 text-body break-all">
              {tenant.email ?? "—"}
            </dd>
            <dt className="text-muted">Phone</dt>
            <dd className="col-span-2 text-body">{tenant.phone ?? "—"}</dd>
          </dl>
        </div>
      </section>

      <section className="pf-card">
        <h3 className="text-sm font-semibold text-heading mb-3">
          Payment history
        </h3>
        <div className="overflow-x-auto">
          <table
            data-testid="tenant-payments-table"
            className="w-full text-sm"
          >
            <thead>
              <tr className="text-left text-muted">
                <th className="py-2 pr-3 font-medium">Date</th>
                <th className="py-2 pr-3 font-medium">Method</th>
                <th className="py-2 pr-3 font-medium">Memo</th>
                <th className="py-2 pr-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PAYMENTS.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="py-2 pr-3 text-body">{fmtDate(p.paidOn)}</td>
                  <td className="py-2 pr-3 text-body">{p.method}</td>
                  <td className="py-2 pr-3 text-body">{p.memo}</td>
                  <td className="py-2 pr-3 text-body text-right">
                    ${p.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {tenant.notes ? (
        <section className="pf-card">
          <h3 className="text-sm font-semibold text-heading mb-2">Notes</h3>
          <p className="text-sm text-body whitespace-pre-wrap">
            {tenant.notes}
          </p>
        </section>
      ) : null}
    </div>
  );
}
