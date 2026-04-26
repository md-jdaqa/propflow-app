import { test, expect } from "@playwright/test";
import { categorize } from "@/lib/tax/categorize";

test.describe("categorize() Schedule E auto-categorization", () => {
  test("rent income → Line 3, INCOME badge", () => {
    const out = categorize({ amount: 1400, payer: "Jane Doe", memo: "March rent" });
    expect(out.scheduleELine).toBe(3);
    expect(out.taxBadge).toBe("INCOME");
    expect(out.category).toBe("Rental income");
  });

  test("mortgage principal → NON_DEDUCTIBLE, no line", () => {
    const out = categorize({
      amount: -800,
      payee: "Chase Bank",
      memo: "Mortgage principal payment",
    });
    expect(out.taxBadge).toBe("NON_DEDUCTIBLE");
    expect(out.scheduleELine).toBeNull();
  });

  test("Joseph Neff payment → Line 11 management fees", () => {
    const out = categorize({
      amount: -250,
      payee: "Joseph Neff",
      memo: "Property mgmt fee",
    });
    expect(out.scheduleELine).toBe(11);
    expect(out.taxBadge).toBe("DEDUCTIBLE");
    expect(out.category).toBe("Management fees");
  });

  test("$3,000 plumbing repair → REVIEW with capital improvement warning", () => {
    const out = categorize({
      amount: -3000,
      payee: "ABC Plumbing",
      memo: "Plumbing repair",
    });
    expect(out.scheduleELine).toBe(14);
    expect(out.taxBadge).toBe("REVIEW");
    expect(out.warnings.some((w) => /capital improvement/i.test(w))).toBe(true);
  });

  test("utility bill → Line 17 utilities", () => {
    const out = categorize({
      amount: -120,
      payee: "National Grid",
      memo: "Electric bill",
    });
    expect(out.scheduleELine).toBe(17);
    expect(out.taxBadge).toBe("DEDUCTIBLE");
    expect(out.category).toBe("Utilities");
  });

  test("uncategorized $50 expense → null line, UNCATEGORIZED", () => {
    const out = categorize({ amount: -50, memo: "Misc thingy" });
    expect(out.scheduleELine).toBeNull();
    expect(out.taxBadge).toBe("UNCATEGORIZED");
  });

  test("contractor $700 payment → 1099-NEC warning", () => {
    const out = categorize({
      amount: -700,
      payee: "Bob the Repairman",
      memo: "Repair work on bathroom",
    });
    expect(out.scheduleELine).toBe(14);
    expect(out.warnings.some((w) => /1099-NEC/.test(w))).toBe(true);
  });
});
