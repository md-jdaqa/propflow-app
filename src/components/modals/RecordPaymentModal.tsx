"use client";
import { useMemo, useState, type FormEvent } from "react";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { TaxBadgeChip, type TaxBadgeKind } from "@/components/finances/TaxBadgeChip";

const PAYMENT_METHODS = [
  "CASH",
  "CHECK",
  "ACH",
  "CARD",
  "ZELLE",
  "VENMO",
  "OTHER",
] as const;

const MOCK_PROPERTIES = [
  { id: "p-eldert",    name: "257 Eldert St — Brooklyn" },
  { id: "p-saratoga",  name: "412 Saratoga Ave — Brooklyn" },
  { id: "p-hancock",   name: "189 Hancock St — Brooklyn" },
];

const MOCK_TENANTS = [
  { id: "",          name: "— No tenant —" },
  { id: "t-carter",  name: "J. Carter" },
  { id: "t-singh",   name: "M. Singh" },
  { id: "t-rivera",  name: "L. Rivera" },
];

const today = () => new Date().toISOString().slice(0, 10);

const paymentSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.coerce.number().refine((n) => n !== 0, "Amount cannot be zero"),
  paidOn: z.string().min(1, "Date is required"),
  method: z.enum(PAYMENT_METHODS),
  party: z.string().trim().min(1, "Payer/Payee is required"),
  propertyId: z.string().min(1, "Property is required"),
  tenantId: z.string().optional().or(z.literal("")),
  category: z.string().trim().optional().or(z.literal("")),
  scheduleELine: z
    .union([z.literal(""), z.coerce.number().int().min(3).max(19)])
    .optional(),
  memo: z.string().optional().or(z.literal("")),
  generateReceipt: z.boolean().default(false),
});

type FieldErrors = Partial<Record<string, string>>;

/**
 * Compute the auto tax-badge preview from current form state.
 * Mirrors the spec rules in tax-categories.md at a basic level.
 */
function previewBadge(opts: {
  type: "INCOME" | "EXPENSE";
  amount: number;
  category: string;
  scheduleELine: number | null;
}): { badge: TaxBadgeKind; line: number | null } {
  const { type, amount, category, scheduleELine } = opts;
  const cat = category.toLowerCase();

  if (type === "INCOME") return { badge: "INCOME", line: 3 };

  if (cat.includes("principal")) return { badge: "NON_DEDUCTIBLE", line: null };
  if (cat.includes("personal"))  return { badge: "NON_DEDUCTIBLE", line: null };

  // Repairs > $2,500 → CPA review
  if (cat.includes("repair") && Math.abs(amount) > 2500) {
    return { badge: "REVIEW", line: scheduleELine ?? 14 };
  }

  if (scheduleELine) return { badge: "DEDUCTIBLE", line: scheduleELine };

  return { badge: "UNCATEGORIZED", line: null };
}

interface RecordPaymentModalProps {
  open: boolean;
  onClose: () => void;
}

export function RecordPaymentModal({ open, onClose }: RecordPaymentModalProps) {
  const [type, setType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [scheduleELine, setScheduleELine] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);

  const preview = useMemo(() => {
    const amt = Number(amount);
    return previewBadge({
      type,
      amount: Number.isFinite(amt) ? amt : 0,
      category,
      scheduleELine: scheduleELine ? Number(scheduleELine) : null,
    });
  }, [type, amount, category, scheduleELine]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setSubmitMsg(null);
    const fd = new FormData(e.currentTarget);
    const raw = {
      type,
      amount: String(fd.get("amount") ?? ""),
      paidOn: String(fd.get("paidOn") ?? ""),
      method: String(fd.get("method") ?? "CASH"),
      party: String(fd.get("party") ?? ""),
      propertyId: String(fd.get("propertyId") ?? ""),
      tenantId: String(fd.get("tenantId") ?? ""),
      category: String(fd.get("category") ?? ""),
      scheduleELine: String(fd.get("scheduleELine") ?? ""),
      memo: String(fd.get("memo") ?? ""),
      generateReceipt: fd.get("generateReceipt") === "on",
    };

    const parsed = paymentSchema.safeParse(raw);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".") || "_form";
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    // Income positive, Expense negative on the wire
    const signedAmount =
      parsed.data.type === "EXPENSE"
        ? -Math.abs(parsed.data.amount)
        : Math.abs(parsed.data.amount);

    const payload = {
      amount: signedAmount,
      paidOn: parsed.data.paidOn,
      method: parsed.data.method,
      payer: parsed.data.type === "INCOME" ? parsed.data.party : null,
      payee: parsed.data.type === "EXPENSE" ? parsed.data.party : null,
      propertyId: parsed.data.propertyId,
      tenantId: parsed.data.tenantId || null,
      category: parsed.data.category || null,
      scheduleELine:
        parsed.data.scheduleELine === "" || parsed.data.scheduleELine == null
          ? null
          : Number(parsed.data.scheduleELine),
      memo: parsed.data.memo || null,
      generateReceipt: parsed.data.generateReceipt,
      taxBadge: preview.badge,
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setSubmitMsg("Could not save payment. Try again.");
        return;
      }
      setSubmitMsg("Payment saved.");
      onClose();
    } catch {
      setSubmitMsg("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const errorText = (key: string) =>
    errors[key] ? (
      <p
        data-testid={`record-payment-error-${key}`}
        className="text-xs text-danger mt-1"
      >
        {errors[key]}
      </p>
    ) : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record payment"
      testId="record-payment-modal"
      bottomSheetOnMobile
    >
      <form onSubmit={onSubmit} className="space-y-3" noValidate>
        {/* Type toggle */}
        <div
          role="radiogroup"
          aria-label="Payment type"
          className="grid grid-cols-2 gap-2"
        >
          {(["INCOME", "EXPENSE"] as const).map((t) => {
            const active = type === t;
            return (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={active}
                data-testid={`record-payment-type-${t.toLowerCase()}`}
                onClick={() => setType(t)}
                className={
                  "pf-btn text-sm " +
                  (active ? "pf-btn-primary" : "pf-btn-secondary")
                }
              >
                {t === "INCOME" ? "Income" : "Expense"}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="rp-amount"
              className="block text-sm text-muted mb-1"
            >
              Amount (USD)
            </label>
            <input
              id="rp-amount"
              name="amount"
              type="number"
              step="0.01"
              inputMode="decimal"
              className="pf-input"
              data-testid="record-payment-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1400.00"
            />
            {errorText("amount")}
          </div>
          <div>
            <label
              htmlFor="rp-date"
              className="block text-sm text-muted mb-1"
            >
              Date
            </label>
            <input
              id="rp-date"
              name="paidOn"
              type="date"
              defaultValue={today()}
              className="pf-input"
              data-testid="record-payment-date"
            />
            {errorText("paidOn")}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="rp-method"
              className="block text-sm text-muted mb-1"
            >
              Method
            </label>
            <select
              id="rp-method"
              name="method"
              className="pf-input"
              data-testid="record-payment-method"
              defaultValue="CASH"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="rp-party"
              className="block text-sm text-muted mb-1"
            >
              {type === "INCOME" ? "Payer" : "Payee"}
            </label>
            <input
              id="rp-party"
              name="party"
              type="text"
              className="pf-input"
              data-testid="record-payment-party"
              placeholder={type === "INCOME" ? "J. Carter" : "Joseph Neff"}
            />
            {errorText("party")}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="rp-property"
              className="block text-sm text-muted mb-1"
            >
              Property
            </label>
            <select
              id="rp-property"
              name="propertyId"
              className="pf-input"
              data-testid="record-payment-property"
              defaultValue=""
            >
              <option value="">— Select property —</option>
              {MOCK_PROPERTIES.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {errorText("propertyId")}
          </div>
          <div>
            <label
              htmlFor="rp-tenant"
              className="block text-sm text-muted mb-1"
            >
              Tenant (optional)
            </label>
            <select
              id="rp-tenant"
              name="tenantId"
              className="pf-input"
              data-testid="record-payment-tenant"
              defaultValue=""
            >
              {MOCK_TENANTS.map((t) => (
                <option key={t.id || "none"} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="rp-category"
              className="block text-sm text-muted mb-1"
            >
              Category (optional, auto-suggested from rules)
            </label>
            <input
              id="rp-category"
              name="category"
              type="text"
              className="pf-input"
              data-testid="record-payment-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Management fees"
            />
          </div>
          <div>
            <label
              htmlFor="rp-line"
              className="block text-sm text-muted mb-1"
            >
              Schedule E line
            </label>
            <input
              id="rp-line"
              name="scheduleELine"
              type="number"
              min={3}
              max={19}
              className="pf-input"
              data-testid="record-payment-line"
              value={scheduleELine}
              onChange={(e) => setScheduleELine(e.target.value)}
              placeholder="11"
            />
            {errorText("scheduleELine")}
          </div>
        </div>

        <div>
          <label htmlFor="rp-memo" className="block text-sm text-muted mb-1">
            Memo
          </label>
          <textarea
            id="rp-memo"
            name="memo"
            rows={2}
            className="pf-input py-2"
            data-testid="record-payment-memo"
            placeholder="April rent — Apt 2"
          />
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-body min-h-touch">
          <input
            type="checkbox"
            name="generateReceipt"
            data-testid="record-payment-receipt"
            className="h-5 w-5 accent-[var(--primary)]"
          />
          Generate cash receipt
        </label>

        <div
          data-testid="record-payment-preview"
          className="flex items-center justify-between gap-3 border-t border-border pt-3"
        >
          <span className="text-xs text-muted">Computed tax badge</span>
          <TaxBadgeChip
            badge={preview.badge}
            scheduleELine={preview.line}
            testId="record-payment-preview-badge"
          />
        </div>

        {submitMsg ? (
          <p
            data-testid="record-payment-message"
            className="text-sm text-muted"
          >
            {submitMsg}
          </p>
        ) : null}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="pf-btn pf-btn-secondary text-sm"
            data-testid="record-payment-cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            data-testid="record-payment-submit"
            className="pf-btn pf-btn-primary text-sm"
          >
            {submitting ? "Saving…" : "Save payment"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/** Small hook to control the modal's open state from anywhere. */
export function useRecordPaymentModal() {
  const [open, setOpen] = useState(false);
  return { open, setOpen };
}
