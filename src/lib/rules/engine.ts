// PropFlow — Transaction rules engine.
// Pure function: pick the highest-priority enabled rule that matches.

// String-literal types kept in sync with prisma/schema.prisma. Avoids a hard
// dependency on `prisma generate` having been run with the latest schema.
export type RuleField = "PAYEE" | "PAYER" | "MEMO" | "AMOUNT" | "METHOD";
export type RuleOperator =
  | "EQUALS"
  | "CONTAINS"
  | "STARTS_WITH"
  | "GREATER_THAN"
  | "LESS_THAN";
export type TaxBadge =
  | "DEDUCTIBLE"
  | "INCOME"
  | "NON_DEDUCTIBLE"
  | "REVIEW"
  | "UNCATEGORIZED";

export interface RuleSpec {
  id: string;
  matchField: RuleField;
  matchOperator: RuleOperator;
  matchValue: string;
  setCategory?: string | null;
  setScheduleELine?: number | null;
  setTaxBadge?: TaxBadge | null;
  priority: number;
  enabled: boolean;
}

export interface PaymentLike {
  payee?: string | null;
  payer?: string | null;
  memo?: string | null;
  amount: number;
  method?: string | null;
}

export interface RuleMatch {
  rule: RuleSpec;
  applied: {
    category?: string;
    scheduleELine?: number;
    taxBadge?: TaxBadge;
  };
}

function fieldValue(
  payment: PaymentLike,
  field: RuleField,
): string | number | null {
  switch (field) {
    case "PAYEE":
      return payment.payee ?? null;
    case "PAYER":
      return payment.payer ?? null;
    case "MEMO":
      return payment.memo ?? null;
    case "METHOD":
      return payment.method ?? null;
    case "AMOUNT":
      return Math.abs(payment.amount);
    default:
      return null;
  }
}

function compareString(
  actual: string,
  operator: RuleOperator,
  expected: string,
): boolean {
  const a = actual.toLowerCase();
  const e = expected.toLowerCase();
  switch (operator) {
    case "EQUALS":
      return a === e;
    case "CONTAINS":
      return a.includes(e);
    case "STARTS_WITH":
      return a.startsWith(e);
    default:
      return false;
  }
}

function compareNumber(
  actual: number,
  operator: RuleOperator,
  expected: number,
): boolean {
  if (Number.isNaN(expected)) return false;
  switch (operator) {
    case "GREATER_THAN":
      return actual > expected;
    case "LESS_THAN":
      return actual < expected;
    case "EQUALS":
      return actual === expected;
    default:
      return false;
  }
}

function ruleMatches(payment: PaymentLike, rule: RuleSpec): boolean {
  const value = fieldValue(payment, rule.matchField);
  if (value === null) return false;

  // AMOUNT field is numeric.
  if (rule.matchField === "AMOUNT") {
    const expected = parseFloat(rule.matchValue);
    return compareNumber(value as number, rule.matchOperator, expected);
  }

  // String operators.
  if (typeof value !== "string") return false;
  return compareString(value, rule.matchOperator, rule.matchValue);
}

export function applyRules(
  payment: PaymentLike,
  rules: RuleSpec[],
): RuleMatch | null {
  const enabled = rules
    .filter((r) => r.enabled)
    .slice()
    .sort((a, b) => a.priority - b.priority);

  for (const rule of enabled) {
    if (ruleMatches(payment, rule)) {
      const applied: RuleMatch["applied"] = {};
      if (rule.setCategory) applied.category = rule.setCategory;
      if (typeof rule.setScheduleELine === "number")
        applied.scheduleELine = rule.setScheduleELine;
      if (rule.setTaxBadge) applied.taxBadge = rule.setTaxBadge;
      return { rule, applied };
    }
  }
  return null;
}
