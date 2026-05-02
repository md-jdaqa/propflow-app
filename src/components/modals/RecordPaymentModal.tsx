"use client";
import { useCallback, useMemo, useRef, useState, type FormEvent } from "react";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { TaxBadgeChip, type TaxBadgeKind } from "@/components/finances/TaxBadgeChip";
import {
  CheckCircle2,
  Camera,
  Sparkles,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";

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
  { id: "p-eldert",   name: "257 Eldert St — Brooklyn" },
  { id: "p-saratoga", name: "412 Saratoga Ave — Brooklyn" },
  { id: "p-hancock",  name: "189 Hancock St — Brooklyn" },
];

const MOCK_TENANTS = [
  { id: "",           name: "— No tenant —" },
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

type ScanState = "idle" | "scanning" | "done" | "error";

interface ScanResult {
  amount: number | null;
  date: string | null;
  method: string | null;
  party: string | null;
  memo: string | null;
  tenantId: string | null;
  tenantName: string | null;
}

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
  if (cat.includes("repair") && Math.abs(amount) > 2500)
    return { badge: "REVIEW", line: scheduleELine ?? 14 };
  if (scheduleELine) return { badge: "DEDUCTIBLE", line: scheduleELine };
  return { badge: "UNCATEGORIZED", line: null };
}

/** Convert a File to base64 string (without the data: prefix) */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip "data:image/xxx;base64,"
      const base64 = result.split(",")[1] ?? result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/** Convert a File to a full data URL */
async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/** Fields that were auto-filled by the AI scanner */
type AiField = "amount" | "date" | "method" | "party" | "tenant" | "memo";

interface RecordPaymentModalProps {
  open: boolean;
  onClose: () => void;
}

export function RecordPaymentModal({ open, onClose }: RecordPaymentModalProps) {
  // Form state
  const [type, setType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [amount, setAmount] = useState("");
  const [paidOn, setPaidOn] = useState(today());
  const [method, setMethod] = useState<typeof PAYMENT_METHODS[number]>("CASH");
  const [party, setParty] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [category, setCategory] = useState("");
  const [scheduleELine, setScheduleELine] = useState("");
  const [memo, setMemo] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Scan state
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [proofDataUrl, setProofDataUrl] = useState<string | null>(null);
  const [aiFields, setAiFields] = useState<Set<AiField>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const preview = useMemo(() => {
    const amt = Number(amount);
    return previewBadge({
      type,
      amount: Number.isFinite(amt) ? amt : 0,
      category,
      scheduleELine: scheduleELine ? Number(scheduleELine) : null,
    });
  }, [type, amount, category, scheduleELine]);

  // ── Scan logic ───────────────────────────────────────────────────────────────
  const processImage = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setScanError("Please upload an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setScanError("Image too large. Max 10 MB.");
      return;
    }

    setScanState("scanning");
    setScanError(null);

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      const [base64, dataUrl] = await Promise.all([
        fileToBase64(file),
        fileToDataUrl(file),
      ]);
      setProofDataUrl(dataUrl);

      const res = await fetch("/api/receipts/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
      });

      const data = (await res.json()) as ScanResult & {
        error?: string;
        message?: string;
      };

      if (!res.ok) {
        const msg =
          data.message ??
          data.error ??
          "Scan failed. Check your AI key in Settings.";
        setScanError(msg);
        setScanState("error");
        return;
      }

      setScanResult(data);
      setScanState("done");

      // Auto-fill form fields from scan result
      const filled = new Set<AiField>();
      if (data.amount !== null) {
        setAmount(String(data.amount));
        filled.add("amount");
      }
      if (data.date) {
        setPaidOn(data.date);
        filled.add("date");
      }
      if (data.method) {
        const m = data.method as typeof PAYMENT_METHODS[number];
        if (PAYMENT_METHODS.includes(m)) {
          setMethod(m);
          filled.add("method");
        }
      }
      if (data.party) {
        setParty(data.party);
        filled.add("party");
      }
      if (data.tenantId) {
        setTenantId(data.tenantId);
        filled.add("tenant");
      }
      if (data.memo) {
        setMemo(data.memo);
        filled.add("memo");
      }
      setAiFields(filled);
    } catch (err) {
      setScanError(
        err instanceof Error ? err.message : "Network error. Try again.",
      );
      setScanState("error");
    }
  }, []);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processImage(file);
      // Reset so same file can re-trigger
      e.target.value = "";
    },
    [processImage],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processImage(file);
    },
    [processImage],
  );

  const clearScan = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setProofDataUrl(null);
    setScanState("idle");
    setScanError(null);
    setScanResult(null);
    setAiFields(new Set());
  }, [previewUrl]);

  // ── Submit ───────────────────────────────────────────────────────────────────
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setSubmitMsg(null);

    const fd = new FormData(e.currentTarget);
    const raw = {
      type,
      amount,
      paidOn,
      method,
      party,
      propertyId: String(fd.get("propertyId") ?? ""),
      tenantId,
      category,
      scheduleELine,
      memo,
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

    const signedAmount =
      parsed.data.type === "EXPENSE"
        ? -Math.abs(parsed.data.amount)
        : Math.abs(parsed.data.amount);

    const payload: Record<string, unknown> = {
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

    // Attach proof image if scanned
    if (proofDataUrl) {
      payload.proofImageDataUrl = proofDataUrl;
      // Also auto-enable receipt generation when proof is attached
      if (!payload.generateReceipt) payload.generateReceipt = true;
    }

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
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        // Reset form
        clearScan();
        setAmount("");
        setPaidOn(today());
        setMethod("CASH");
        setParty("");
        setTenantId("");
        setCategory("");
        setScheduleELine("");
        setMemo("");
      }, 1800);
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
        className="text-xs mt-1"
        style={{ color: "var(--danger)" }}
      >
        {errors[key]}
      </p>
    ) : null;

  /** Small "AI" badge shown next to auto-filled fields */
  const AiBadge = () => (
    <span
      className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ml-1.5"
      style={{
        background: "rgba(79,110,247,0.15)",
        color: "var(--primary)",
      }}
    >
      <Sparkles size={8} strokeWidth={2.5} />
      AI
    </span>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record payment"
      testId="record-payment-modal"
      bottomSheetOnMobile
    >
      {/* ── Success overlay ── */}
      {showSuccess && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-2xl pf-animate-fade-in"
          style={{ background: "var(--surface)" }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center pf-animate-bounce-in"
            style={{
              background: "var(--success-muted)",
              boxShadow: "0 0 0 8px rgba(22,163,74,0.12)",
            }}
          >
            <CheckCircle2 size={40} style={{ color: "var(--success)" }} />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold" style={{ color: "var(--heading)" }}>
              Payment Recorded!
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              {amount && `$${parseFloat(amount).toLocaleString()} · `}{type}
              {proofDataUrl && " · Proof attached"}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-3" noValidate>

        {/* ── AI Scan Zone ──────────────────────────────────────────────────── */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          aria-hidden
          onChange={onFileChange}
          data-testid="receipt-scan-file-input"
        />

        {scanState === "idle" ? (
          /* Drop zone / tap to scan */
          <div
            ref={dropZoneRef}
            role="button"
            tabIndex={0}
            aria-label="Upload payment receipt for AI auto-fill"
            data-testid="receipt-scan-zone"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className="relative flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-all duration-200 select-none"
            style={{
              border: isDragging
                ? "1.5px solid var(--primary)"
                : "1.5px dashed var(--border)",
              background: isDragging
                ? "var(--primary-muted)"
                : "var(--surface-2)",
            }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "var(--primary-muted)",
              }}
            >
              <Camera size={17} style={{ color: "var(--primary)" }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium" style={{ color: "var(--body)" }}>
                Scan receipt
              </p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Upload a Zelle, Venmo, or CashApp screenshot — fields fill automatically
              </p>
            </div>
            <div
              className="ml-auto flex-shrink-0 text-xs font-semibold px-2 py-1 rounded-lg"
              style={{
                background: "var(--primary-muted)",
                color: "var(--primary)",
              }}
            >
              AI
            </div>
          </div>
        ) : scanState === "scanning" ? (
          /* Scanning animation */
          <div
            className="relative overflow-hidden rounded-xl px-4 py-4 flex items-center gap-3"
            style={{
              background: "var(--surface-2)",
              border: "1.5px solid var(--primary)",
            }}
          >
            {/* shimmer sweep */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(105deg, transparent 35%, rgba(79,110,247,0.15) 50%, transparent 65%)",
                animation: "pf-shimmer-sweep 1.2s infinite",
              }}
            />
            <Loader2
              size={20}
              className="flex-shrink-0 animate-spin"
              style={{ color: "var(--primary)" }}
            />
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--body)" }}>
                Scanning receipt…
              </p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Extracting amount, date, payer, and more
              </p>
            </div>
          </div>
        ) : scanState === "error" ? (
          /* Error state */
          <div
            className="rounded-xl px-4 py-3 flex items-start gap-3"
            style={{
              background: "var(--danger-muted, rgba(220,38,38,0.1))",
              border: "1.5px solid rgba(220,38,38,0.3)",
            }}
          >
            <AlertCircle size={17} className="flex-shrink-0 mt-0.5" style={{ color: "var(--danger)" }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium" style={{ color: "var(--danger)" }}>
                Scan failed
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                {scanError}
              </p>
            </div>
            <button
              type="button"
              onClick={clearScan}
              className="flex-shrink-0 p-1 rounded"
              style={{ color: "var(--muted)" }}
              aria-label="Dismiss error"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          /* Done — preview + summary */
          <div
            className="rounded-xl overflow-hidden"
            style={{
              border: "1.5px solid rgba(79,110,247,0.4)",
              background: "var(--surface-2)",
            }}
          >
            <div className="flex items-start gap-3 px-3 py-3">
              {/* Thumbnail */}
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Receipt preview"
                  className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                  style={{ border: "1px solid var(--border)" }}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles size={12} style={{ color: "var(--primary)" }} />
                  <span className="text-xs font-semibold" style={{ color: "var(--primary)" }}>
                    {aiFields.size} field{aiFields.size !== 1 ? "s" : ""} filled automatically
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {Array.from(aiFields).map((f) => (
                    <span
                      key={f}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full capitalize"
                      style={{
                        background: "var(--primary-muted)",
                        color: "var(--primary)",
                      }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
                {scanResult?.tenantName && (
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                    Matched tenant: <strong style={{ color: "var(--body)" }}>{scanResult.tenantName}</strong>
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={clearScan}
                aria-label="Remove scan"
                className="flex-shrink-0 p-1 rounded transition-colors"
                style={{ color: "var(--muted)" }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Type toggle ──────────────────────────────────────────────────── */}
        <div role="radiogroup" aria-label="Payment type" className="grid grid-cols-2 gap-2">
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
                className={"pf-btn text-sm " + (active ? "pf-btn-primary" : "pf-btn-secondary")}
              >
                {t === "INCOME" ? "Income" : "Expense"}
              </button>
            );
          })}
        </div>

        {/* ── Amount + Date ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="rp-amount" className="block text-sm mb-1" style={{ color: "var(--muted)" }}>
              Amount (USD){aiFields.has("amount") && <AiBadge />}
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
              onChange={(e) => { setAmount(e.target.value); setAiFields((s) => { const n = new Set(s); n.delete("amount"); return n; }); }}
              placeholder="1400.00"
            />
            {errorText("amount")}
          </div>
          <div>
            <label htmlFor="rp-date" className="block text-sm mb-1" style={{ color: "var(--muted)" }}>
              Date{aiFields.has("date") && <AiBadge />}
            </label>
            <input
              id="rp-date"
              name="paidOn"
              type="date"
              value={paidOn}
              onChange={(e) => { setPaidOn(e.target.value); setAiFields((s) => { const n = new Set(s); n.delete("date"); return n; }); }}
              className="pf-input"
              data-testid="record-payment-date"
            />
            {errorText("paidOn")}
          </div>
        </div>

        {/* ── Method + Payer ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="rp-method" className="block text-sm mb-1" style={{ color: "var(--muted)" }}>
              Method{aiFields.has("method") && <AiBadge />}
            </label>
            <select
              id="rp-method"
              name="method"
              className="pf-input"
              data-testid="record-payment-method"
              value={method}
              onChange={(e) => { setMethod(e.target.value as typeof PAYMENT_METHODS[number]); setAiFields((s) => { const n = new Set(s); n.delete("method"); return n; }); }}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="rp-party" className="block text-sm mb-1" style={{ color: "var(--muted)" }}>
              {type === "INCOME" ? "Payer" : "Payee"}{aiFields.has("party") && <AiBadge />}
            </label>
            <input
              id="rp-party"
              name="party"
              type="text"
              className="pf-input"
              data-testid="record-payment-party"
              value={party}
              onChange={(e) => { setParty(e.target.value); setAiFields((s) => { const n = new Set(s); n.delete("party"); return n; }); }}
              placeholder={type === "INCOME" ? "J. Carter" : "Joseph Neff"}
            />
            {errorText("party")}
          </div>
        </div>

        {/* ── Property + Tenant ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="rp-property" className="block text-sm mb-1" style={{ color: "var(--muted)" }}>
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
            <label htmlFor="rp-tenant" className="block text-sm mb-1" style={{ color: "var(--muted)" }}>
              Tenant{aiFields.has("tenant") && <AiBadge />}
            </label>
            <select
              id="rp-tenant"
              name="tenantId"
              className="pf-input"
              data-testid="record-payment-tenant"
              value={tenantId}
              onChange={(e) => { setTenantId(e.target.value); setAiFields((s) => { const n = new Set(s); n.delete("tenant"); return n; }); }}
            >
              {MOCK_TENANTS.map((t) => (
                <option key={t.id || "none"} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Memo (full width) ─────────────────────────────────────────────── */}
        <div>
          <label htmlFor="rp-memo" className="block text-sm mb-1" style={{ color: "var(--muted)" }}>
            Memo{aiFields.has("memo") && <AiBadge />}
          </label>
          <textarea
            id="rp-memo"
            name="memo"
            rows={2}
            className="pf-input py-2"
            data-testid="record-payment-memo"
            value={memo}
            onChange={(e) => { setMemo(e.target.value); setAiFields((s) => { const n = new Set(s); n.delete("memo"); return n; }); }}
            placeholder="April rent — Apt 2"
          />
        </div>

        {/* ── Advanced (category + schedule E) ─────────────────────────────── */}
        <details className="group">
          <summary
            className="flex items-center gap-2 text-xs cursor-pointer select-none py-1"
            style={{ color: "var(--muted)" }}
          >
            <span
              className="w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 transition-transform group-open:rotate-90"
              style={{ borderColor: "var(--border)" }}
            >
              <svg width="6" height="8" viewBox="0 0 6 8" fill="currentColor">
                <path d="M1 1l4 3-4 3" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            Advanced — category &amp; Schedule E
          </summary>
          <div className="pt-2 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="rp-category" className="block text-sm mb-1" style={{ color: "var(--muted)" }}>
                  Category
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
                <label htmlFor="rp-line" className="block text-sm mb-1" style={{ color: "var(--muted)" }}>
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
          </div>
        </details>

        {/* ── Tax preview + receipt checkbox ────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 border-t pt-3" style={{ borderColor: "var(--border)" }}>
          <label className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--body)", minHeight: "44px" }}>
            <input
              type="checkbox"
              name="generateReceipt"
              data-testid="record-payment-receipt"
              defaultChecked={!!proofDataUrl}
              className="h-5 w-5 accent-[var(--primary)]"
            />
            Generate receipt{proofDataUrl && " (proof attached)"}
          </label>
          <div data-testid="record-payment-preview">
            <TaxBadgeChip
              badge={preview.badge}
              scheduleELine={preview.line}
              testId="record-payment-preview-badge"
            />
          </div>
        </div>

        {submitMsg && (
          <p data-testid="record-payment-message" className="text-sm" style={{ color: "var(--muted)" }}>
            {submitMsg}
          </p>
        )}

        {/* ── Actions ───────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-2 pt-1">
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
            {submitting ? "Saving…" : proofDataUrl ? "Save + attach proof" : "Save payment"}
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
