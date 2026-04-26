import { test, expect } from "@playwright/test";
import {
  consolidatePartials,
  type PaymentRow,
} from "@/lib/payments/consolidate";

const row = (overrides: Partial<PaymentRow>): PaymentRow => ({
  id: Math.random().toString(36).slice(2, 10),
  tenantId: "tenant-1",
  amount: 0,
  paidOn: new Date("2026-01-01"),
  isPartial: true,
  consolidatedId: null,
  ...overrides,
});

test.describe("consolidatePartials() partial payment grouping", () => {
  test("$700 + $700 toward $1400 rent → one consolidated group", () => {
    const rows: PaymentRow[] = [
      row({ amount: 700, paidOn: new Date("2026-03-01") }),
      row({ amount: 700, paidOn: new Date("2026-03-15") }),
    ];
    const expected = new Map<string, number>([["tenant-1", 1400]]);
    const result = consolidatePartials(rows, expected);
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].total).toBe(1400);
    expect(result.groups[0].rows).toHaveLength(2);
    expect(result.groups[0].consolidatedId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(result.unconsolidated).toHaveLength(0);
  });

  test("$500 + $200 + $700 toward $1400 rent → one consolidated group", () => {
    const rows: PaymentRow[] = [
      row({ amount: 500, paidOn: new Date("2026-03-01") }),
      row({ amount: 200, paidOn: new Date("2026-03-05") }),
      row({ amount: 700, paidOn: new Date("2026-03-12") }),
    ];
    const expected = new Map<string, number>([["tenant-1", 1400]]);
    const result = consolidatePartials(rows, expected);
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].total).toBe(1400);
    expect(result.groups[0].rows).toHaveLength(3);
    expect(result.unconsolidated).toHaveLength(0);
  });

  test("partial-only payment with no full match → unconsolidated", () => {
    const rows: PaymentRow[] = [
      row({ amount: 400, paidOn: new Date("2026-03-01") }),
    ];
    const expected = new Map<string, number>([["tenant-1", 1400]]);
    const result = consolidatePartials(rows, expected);
    expect(result.groups).toHaveLength(0);
    expect(result.unconsolidated).toHaveLength(1);
  });

  test("deterministic id is stable across re-runs", () => {
    const rows: PaymentRow[] = [
      row({ id: "a", amount: 700, paidOn: new Date("2026-04-01") }),
      row({ id: "b", amount: 700, paidOn: new Date("2026-04-15") }),
    ];
    const expected = new Map<string, number>([["tenant-1", 1400]]);
    const r1 = consolidatePartials(rows, expected);
    const r2 = consolidatePartials(rows, expected);
    expect(r1.groups[0].consolidatedId).toBe(r2.groups[0].consolidatedId);
  });
});
