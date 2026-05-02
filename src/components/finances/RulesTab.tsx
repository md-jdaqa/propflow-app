"use client";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { TaxBadgeChip, type TaxBadgeKind } from "./TaxBadgeChip";
import { RuleForm } from "./RuleForm";
import { AiRuleCreator } from "./AiRuleCreator";
import { ChevronDown, Wand2 } from "lucide-react";

interface MockRule {
  id: string;
  name: string;
  matchField: string;
  matchOperator: string;
  matchValue: string;
  setCategory: string | null;
  setScheduleELine: number | null;
  setTaxBadge: TaxBadgeKind | null;
  priority: number;
  enabled: boolean;
}

const FIELD_LABELS: Record<string, string> = {
  PAYEE: "Payee", PAYER: "Payer", MEMO: "Memo", AMOUNT: "Amount", METHOD: "Method",
};
const OP_LABELS: Record<string, string> = {
  EQUALS: "equals", CONTAINS: "contains", STARTS_WITH: "starts with",
  GREATER_THAN: ">", LESS_THAN: "<",
};

const INITIAL_RULES: MockRule[] = [
  {
    id: "r1",
    name: "Joseph Neff → Mgmt fees",
    matchField: "PAYEE",
    matchOperator: "EQUALS",
    matchValue: "Joseph Neff",
    setCategory: "Management fees",
    setScheduleELine: 11,
    setTaxBadge: "DEDUCTIBLE",
    priority: 10,
    enabled: true,
  },
  {
    id: "r2",
    name: "Con Edison → Utilities",
    matchField: "PAYEE",
    matchOperator: "CONTAINS",
    matchValue: "Con Edison",
    setCategory: "Utilities",
    setScheduleELine: 17,
    setTaxBadge: "DEDUCTIBLE",
    priority: 20,
    enabled: true,
  },
  {
    id: "r3",
    name: "Mortgage principal → Non-deductible",
    matchField: "MEMO",
    matchOperator: "CONTAINS",
    matchValue: "principal",
    setCategory: "Mortgage principal",
    setScheduleELine: null,
    setTaxBadge: "NON_DEDUCTIBLE",
    priority: 30,
    enabled: true,
  },
];

export function RulesTab() {
  const [rules] = useState<MockRule[]>(INITIAL_RULES);
  const [showManual, setShowManual] = useState(false);

  return (
    <div data-testid="finances-rules" className="space-y-4">

      {/* ── AI Rule Creator — always on top ── */}
      <AiRuleCreator onSaved={() => { /* TODO: refresh rules list from API */ }} />

      {/* ── Manual form (collapsed by default) ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
      >
        <button
          type="button"
          onClick={() => setShowManual((s) => !s)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
          aria-expanded={showManual}
          data-testid="manual-rule-toggle"
        >
          <div className="flex items-center gap-2.5">
            <Wand2 size={15} style={{ color: "var(--muted)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--body)" }}>
              Build rule manually
            </span>
          </div>
          <ChevronDown
            size={15}
            className="transition-transform duration-200"
            style={{
              color: "var(--muted)",
              transform: showManual ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </button>
        {showManual && (
          <div className="px-4 pb-4 border-t" style={{ borderColor: "var(--border)" }}>
            <div className="pt-4">
              <RuleForm onSaved={() => setShowManual(false)} />
            </div>
          </div>
        )}
      </div>

      {/* ── Existing rules list ── */}
      <Card testId="rules-list">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold" style={{ color: "var(--heading)" }}>
            Active rules
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: "var(--surface-2)", color: "var(--muted)" }}>
            {rules.filter((r) => r.enabled).length} of {rules.length}
          </span>
        </div>

        {rules.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: "var(--muted)" }}>
            No rules yet. Create one above.
          </p>
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--border-subtle, var(--border))" }}>
            {rules.map((rule) => (
              <li
                key={rule.id}
                data-testid={`rule-row-${rule.id}`}
                className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: rule.enabled ? "var(--success)" : "var(--muted)" }}
                    />
                    <p className="text-sm font-medium truncate" style={{ color: "var(--body)" }}>
                      {rule.name}
                    </p>
                  </div>
                  <p className="text-xs mt-0.5 pl-3.5" style={{ color: "var(--muted)" }}>
                    if {FIELD_LABELS[rule.matchField] ?? rule.matchField}{" "}
                    <span style={{ color: "var(--secondary)" }}>
                      {OP_LABELS[rule.matchOperator] ?? rule.matchOperator}
                    </span>{" "}
                    <span style={{ color: "var(--body)" }}>&quot;{rule.matchValue}&quot;</span>
                    {rule.setCategory && (
                      <> → <span style={{ color: "var(--body)" }}>{rule.setCategory}</span></>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap pl-3.5 sm:pl-0">
                  {rule.setTaxBadge ? (
                    <TaxBadgeChip badge={rule.setTaxBadge} scheduleELine={rule.setScheduleELine} />
                  ) : null}
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                    style={{ background: "var(--surface-2)", color: "var(--muted)" }}
                  >
                    P{rule.priority}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
