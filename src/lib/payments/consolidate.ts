// PropFlow — partial-payment consolidation engine.
// Groups consecutive partial payments by tenant whose running sum equals
// the expected rent. Pure function.

import { createHash } from "crypto";

export interface PaymentRow {
  id: string;
  tenantId: string | null;
  amount: number;
  paidOn: Date;
  isPartial: boolean;
  consolidatedId: string | null;
}

export interface ConsolidationGroup {
  consolidatedId: string;
  tenantId: string;
  total: number;
  rows: PaymentRow[];
}

export interface ConsolidationResult {
  groups: ConsolidationGroup[];
  unconsolidated: PaymentRow[];
}

// Stable id derived from tenant + first/last paidOn so re-runs produce the same id.
function deterministicId(
  tenantId: string,
  firstPaidOn: Date,
  lastPaidOn: Date,
): string {
  const h = createHash("sha1");
  h.update(`${tenantId}-${firstPaidOn.toISOString()}-${lastPaidOn.toISOString()}`);
  const hex = h.digest("hex");
  // Format as a UUID-ish string (8-4-4-4-12) so it fits into a uuid column.
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(
    16,
    20,
  )}-${hex.slice(20, 32)}`;
}

// Money is messy — compare cents to dodge float drift.
function toCents(n: number): number {
  return Math.round(n * 100);
}

export function consolidatePartials(
  rows: PaymentRow[],
  expectedRent: Map<string, number>,
): ConsolidationResult {
  const groups: ConsolidationGroup[] = [];
  const unconsolidated: PaymentRow[] = [];

  // Group rows by tenant first.
  const byTenant = new Map<string | null, PaymentRow[]>();
  for (const row of rows) {
    const key = row.tenantId;
    if (!byTenant.has(key)) byTenant.set(key, []);
    byTenant.get(key)!.push(row);
  }

  for (const [tenantId, tenantRows] of Array.from(byTenant.entries())) {
    if (tenantId === null) {
      // No tenant means we can't match against expected rent.
      unconsolidated.push(...tenantRows);
      continue;
    }

    const expected = expectedRent.get(tenantId);
    // Sort tenant rows by paidOn ascending so consecutive grouping is meaningful.
    const sorted = tenantRows
      .slice()
      .sort((a, b) => a.paidOn.getTime() - b.paidOn.getTime());

    if (typeof expected !== "number" || expected <= 0) {
      // No expected rent → can't consolidate. Emit non-partials? Still pass through.
      unconsolidated.push(...sorted);
      continue;
    }

    const expectedCents = toCents(expected);
    let buffer: PaymentRow[] = [];
    let bufferCents = 0;

    for (const row of sorted) {
      // Non-partial rows that match the full rent stand alone.
      if (!row.isPartial) {
        // Flush any pending buffer first as unconsolidated (didn't reach expected).
        if (buffer.length > 0) {
          unconsolidated.push(...buffer);
          buffer = [];
          bufferCents = 0;
        }
        unconsolidated.push(row);
        continue;
      }

      buffer.push(row);
      bufferCents += toCents(row.amount);

      if (bufferCents === expectedCents) {
        const first = buffer[0];
        const last = buffer[buffer.length - 1];
        groups.push({
          consolidatedId: deterministicId(tenantId, first.paidOn, last.paidOn),
          tenantId,
          total: bufferCents / 100,
          rows: buffer,
        });
        buffer = [];
        bufferCents = 0;
      } else if (bufferCents > expectedCents) {
        // Overflow: keep all but the last in the group, push the last as unconsolidated.
        const overflow = buffer.pop()!;
        bufferCents -= toCents(overflow.amount);

        if (bufferCents === expectedCents && buffer.length > 0) {
          const first = buffer[0];
          const last = buffer[buffer.length - 1];
          groups.push({
            consolidatedId: deterministicId(tenantId, first.paidOn, last.paidOn),
            tenantId,
            total: bufferCents / 100,
            rows: buffer,
          });
        } else {
          // Buffered partials never matched cleanly — flush as unconsolidated.
          unconsolidated.push(...buffer);
        }
        unconsolidated.push(overflow);
        buffer = [];
        bufferCents = 0;
      }
    }

    if (buffer.length > 0) {
      unconsolidated.push(...buffer);
    }
  }

  return { groups, unconsolidated };
}
