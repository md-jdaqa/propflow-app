import { test, expect } from "@playwright/test";
import { applyRules, type RuleSpec } from "@/lib/rules/engine";

const baseRule = (overrides: Partial<RuleSpec>): RuleSpec => ({
  id: "r1",
  matchField: "PAYEE",
  matchOperator: "EQUALS",
  matchValue: "Joseph Neff",
  setCategory: null,
  setScheduleELine: null,
  setTaxBadge: null,
  priority: 100,
  enabled: true,
  ...overrides,
});

test.describe("applyRules() rules engine", () => {
  test("Joseph Neff EQUALS rule sets management fees + line 11", () => {
    const rules: RuleSpec[] = [
      baseRule({
        matchField: "PAYEE",
        matchOperator: "EQUALS",
        matchValue: "Joseph Neff",
        setCategory: "Management fees",
        setScheduleELine: 11,
        setTaxBadge: "DEDUCTIBLE",
      }),
    ];
    const match = applyRules(
      { payee: "joseph neff", amount: -250 },
      rules,
    );
    expect(match).not.toBeNull();
    expect(match?.applied.category).toBe("Management fees");
    expect(match?.applied.scheduleELine).toBe(11);
    expect(match?.applied.taxBadge).toBe("DEDUCTIBLE");
  });

  test("CONTAINS 'depot' on memo sets Supplies", () => {
    const rules: RuleSpec[] = [
      baseRule({
        id: "r2",
        matchField: "MEMO",
        matchOperator: "CONTAINS",
        matchValue: "depot",
        setCategory: "Supplies",
        setScheduleELine: 15,
        setTaxBadge: "DEDUCTIBLE",
      }),
    ];
    const match = applyRules(
      { memo: "Trip to Home Depot for paint", amount: -45 },
      rules,
    );
    expect(match?.applied.category).toBe("Supplies");
    expect(match?.applied.scheduleELine).toBe(15);
  });

  test("AMOUNT GREATER_THAN 2500 sets badge REVIEW", () => {
    const rules: RuleSpec[] = [
      baseRule({
        id: "r3",
        matchField: "AMOUNT",
        matchOperator: "GREATER_THAN",
        matchValue: "2500",
        setTaxBadge: "REVIEW",
      }),
    ];
    const match = applyRules(
      { payee: "Random Co", amount: -3500 },
      rules,
    );
    expect(match?.applied.taxBadge).toBe("REVIEW");
  });

  test("priority order — lower priority wins", () => {
    const rules: RuleSpec[] = [
      baseRule({
        id: "high",
        matchField: "PAYEE",
        matchOperator: "CONTAINS",
        matchValue: "neff",
        priority: 200,
        setCategory: "Other",
      }),
      baseRule({
        id: "low",
        matchField: "PAYEE",
        matchOperator: "CONTAINS",
        matchValue: "neff",
        priority: 10,
        setCategory: "Management fees",
      }),
    ];
    const match = applyRules({ payee: "Joseph Neff", amount: -250 }, rules);
    expect(match?.rule.id).toBe("low");
    expect(match?.applied.category).toBe("Management fees");
  });

  test("disabled rule is skipped", () => {
    const rules: RuleSpec[] = [
      baseRule({
        enabled: false,
        setCategory: "Management fees",
      }),
    ];
    const match = applyRules({ payee: "Joseph Neff", amount: -250 }, rules);
    expect(match).toBeNull();
  });
});
