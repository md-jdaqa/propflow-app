import { Card } from "@/components/ui/Card";
import { TaxBadgeChip, type TaxBadgeKind } from "./TaxBadgeChip";
import { RuleForm } from "./RuleForm";

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

const MOCK_RULES: MockRule[] = [
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
  return (
    <div data-testid="finances-rules" className="space-y-4">
      <Card testId="rules-list">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-heading">Existing rules</h3>
          <span className="text-xs text-muted">
            {MOCK_RULES.length} active
          </span>
        </div>

        <ul className="divide-y divide-border">
          {MOCK_RULES.map((rule) => (
            <li
              key={rule.id}
              data-testid={`rule-row-${rule.id}`}
              className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-body truncate">
                  {rule.name}
                </div>
                <div className="text-xs text-muted">
                  if <span className="text-body">{rule.matchField}</span>{" "}
                  {rule.matchOperator.replace("_", " ").toLowerCase()}{" "}
                  <span className="text-body">"{rule.matchValue}"</span>
                  {rule.setCategory ? (
                    <> → set <span className="text-body">{rule.setCategory}</span></>
                  ) : null}
                  {rule.setScheduleELine ? (
                    <> · L{rule.setScheduleELine}</>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {rule.setTaxBadge ? (
                  <TaxBadgeChip
                    badge={rule.setTaxBadge}
                    scheduleELine={rule.setScheduleELine}
                  />
                ) : null}
                <span className="pf-badge bg-muted/10 text-muted">
                  P{rule.priority}
                </span>
                <span
                  className={
                    rule.enabled
                      ? "pf-badge bg-success/10 text-success"
                      : "pf-badge bg-muted/10 text-muted"
                  }
                >
                  {rule.enabled ? "On" : "Off"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card testId="rules-create">
        <h3 className="font-semibold text-heading mb-3">Create a new rule</h3>
        <RuleForm />
      </Card>
    </div>
  );
}
