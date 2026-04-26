"use client";
import { useState, type FormEvent } from "react";
import { z } from "zod";

const RULE_FIELDS = ["PAYEE", "PAYER", "MEMO", "AMOUNT", "METHOD"] as const;
const RULE_OPERATORS = [
  "EQUALS",
  "CONTAINS",
  "STARTS_WITH",
  "GREATER_THAN",
  "LESS_THAN",
] as const;
const TAX_BADGES = [
  "DEDUCTIBLE",
  "INCOME",
  "NON_DEDUCTIBLE",
  "REVIEW",
  "UNCATEGORIZED",
] as const;

const ruleSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    matchField: z.enum(RULE_FIELDS),
    matchOperator: z.enum(RULE_OPERATORS),
    matchValue: z.string().trim().min(1, "Match value is required"),
    setCategory: z.string().trim().optional().or(z.literal("")),
    setScheduleELine: z
      .union([z.literal(""), z.coerce.number().int().min(3).max(19)])
      .optional(),
    setTaxBadge: z.enum(TAX_BADGES).optional().or(z.literal("")),
    priority: z.coerce.number().int().min(0).default(100),
    enabled: z.boolean().default(true),
  })
  .superRefine((val, ctx) => {
    if (
      (val.matchField === "AMOUNT") &&
      (val.matchOperator === "GREATER_THAN" || val.matchOperator === "LESS_THAN")
    ) {
      const n = Number(val.matchValue);
      if (Number.isNaN(n)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["matchValue"],
          message: "Must be a number for amount comparisons",
        });
      }
    }
  });

type FieldErrors = Partial<Record<string, string>>;

interface RuleFormProps {
  onSaved?: () => void;
}

export function RuleForm({ onSaved }: RuleFormProps) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitMsg(null);
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const raw = {
      name: String(fd.get("name") ?? ""),
      matchField: String(fd.get("matchField") ?? ""),
      matchOperator: String(fd.get("matchOperator") ?? ""),
      matchValue: String(fd.get("matchValue") ?? ""),
      setCategory: String(fd.get("setCategory") ?? ""),
      setScheduleELine: String(fd.get("setScheduleELine") ?? ""),
      setTaxBadge: String(fd.get("setTaxBadge") ?? ""),
      priority: String(fd.get("priority") ?? "100"),
      enabled: fd.get("enabled") === "on",
    };

    const parsed = ruleSchema.safeParse(raw);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".") || "_form";
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        setSubmitMsg("Could not save rule. Try again.");
        return;
      }
      setSubmitMsg("Rule saved.");
      (e.target as HTMLFormElement).reset();
      onSaved?.();
    } catch {
      setSubmitMsg("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const errorText = (key: string) =>
    errors[key] ? (
      <p
        data-testid={`rule-form-error-${key}`}
        className="text-xs text-danger mt-1"
      >
        {errors[key]}
      </p>
    ) : null;

  return (
    <form
      data-testid="rule-form"
      onSubmit={onSubmit}
      className="space-y-3"
      noValidate
    >
      <div>
        <label htmlFor="rule-name" className="block text-sm text-muted mb-1">
          Rule name
        </label>
        <input
          id="rule-name"
          name="name"
          type="text"
          className="pf-input"
          data-testid="rule-form-name"
          placeholder="e.g. Joseph Neff → Mgmt fees"
        />
        {errorText("name")}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="rule-field" className="block text-sm text-muted mb-1">
            Match field
          </label>
          <select
            id="rule-field"
            name="matchField"
            className="pf-input"
            data-testid="rule-form-matchField"
            defaultValue="PAYEE"
          >
            {RULE_FIELDS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          {errorText("matchField")}
        </div>
        <div>
          <label
            htmlFor="rule-operator"
            className="block text-sm text-muted mb-1"
          >
            Operator
          </label>
          <select
            id="rule-operator"
            name="matchOperator"
            className="pf-input"
            data-testid="rule-form-matchOperator"
            defaultValue="EQUALS"
          >
            {RULE_OPERATORS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          {errorText("matchOperator")}
        </div>
        <div>
          <label
            htmlFor="rule-value"
            className="block text-sm text-muted mb-1"
          >
            Match value
          </label>
          <input
            id="rule-value"
            name="matchValue"
            type="text"
            className="pf-input"
            data-testid="rule-form-matchValue"
            placeholder="Joseph Neff"
          />
          {errorText("matchValue")}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label
            htmlFor="rule-category"
            className="block text-sm text-muted mb-1"
          >
            Set category (optional)
          </label>
          <input
            id="rule-category"
            name="setCategory"
            type="text"
            className="pf-input"
            data-testid="rule-form-setCategory"
            placeholder="Management fees"
          />
        </div>
        <div>
          <label
            htmlFor="rule-line"
            className="block text-sm text-muted mb-1"
          >
            Schedule E line (3–19, optional)
          </label>
          <input
            id="rule-line"
            name="setScheduleELine"
            type="number"
            min={3}
            max={19}
            className="pf-input"
            data-testid="rule-form-setScheduleELine"
            placeholder="11"
          />
          {errorText("setScheduleELine")}
        </div>
        <div>
          <label
            htmlFor="rule-badge"
            className="block text-sm text-muted mb-1"
          >
            Tax badge (optional)
          </label>
          <select
            id="rule-badge"
            name="setTaxBadge"
            className="pf-input"
            data-testid="rule-form-setTaxBadge"
            defaultValue=""
          >
            <option value="">—</option>
            {TAX_BADGES.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="rule-priority"
            className="block text-sm text-muted mb-1"
          >
            Priority (lower runs first)
          </label>
          <input
            id="rule-priority"
            name="priority"
            type="number"
            min={0}
            defaultValue={100}
            className="pf-input"
            data-testid="rule-form-priority"
          />
          {errorText("priority")}
        </div>
        <div className="flex items-end">
          <label className="inline-flex items-center gap-2 text-sm text-body min-h-touch">
            <input
              type="checkbox"
              name="enabled"
              defaultChecked
              data-testid="rule-form-enabled"
              className="h-5 w-5 accent-[var(--primary)]"
            />
            Enabled
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        {submitMsg ? (
          <p
            data-testid="rule-form-message"
            className="text-sm text-muted"
          >
            {submitMsg}
          </p>
        ) : <span />}
        <button
          type="submit"
          disabled={submitting}
          data-testid="rule-form-submit"
          className="pf-btn pf-btn-primary text-sm"
        >
          {submitting ? "Saving…" : "Save rule"}
        </button>
      </div>
    </form>
  );
}
