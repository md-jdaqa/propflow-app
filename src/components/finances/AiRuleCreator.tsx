"use client";
import { useState, type KeyboardEvent } from "react";
import { Sparkles, Loader2, CheckCircle2, X, ArrowRight, AlertCircle } from "lucide-react";
import { TaxBadgeChip, type TaxBadgeKind } from "./TaxBadgeChip";

interface SuggestedRule {
  name: string;
  matchField: string;
  matchOperator: string;
  matchValue: string;
  setCategory: string | null;
  setScheduleELine: number | null;
  setTaxBadge: string | null;
  priority: number;
  enabled: boolean;
}

interface Suggestion {
  rule: SuggestedRule;
  explanation: string;
  example: string;
}

type State = "idle" | "loading" | "preview" | "saving" | "saved" | "error";

const FIELD_LABELS: Record<string, string> = {
  PAYEE: "Payee", PAYER: "Payer", MEMO: "Memo", AMOUNT: "Amount", METHOD: "Method",
};
const OP_LABELS: Record<string, string> = {
  EQUALS: "is exactly", CONTAINS: "contains", STARTS_WITH: "starts with",
  GREATER_THAN: "is greater than", LESS_THAN: "is less than",
};

const PLACEHOLDERS = [
  "Whenever I pay Joseph Neff, tag it as management fees",
  "Any Con Edison payment should be utilities, Schedule E line 17",
  "If the memo says 'principal', mark it non-deductible",
  "All Zelle payments over $1000 should go to rent income",
  "Tag anything from Liberty Mutual as insurance expense",
];

interface AiRuleCreatorProps {
  onSaved?: () => void;
}

export function AiRuleCreator({ onSaved }: AiRuleCreatorProps) {
  const [description, setDescription] = useState("");
  const [state, setState] = useState<State>("idle");
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [placeholderIdx] = useState(() => Math.floor(Math.random() * PLACEHOLDERS.length));

  async function suggest() {
    if (!description.trim() || state === "loading") return;
    setState("loading");
    setError(null);
    setSuggestion(null);

    try {
      const res = await fetch("/api/rules/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim() }),
      });
      const data = (await res.json()) as Suggestion & { error?: string; message?: string };
      if (!res.ok) {
        setError(data.message ?? data.error ?? "AI suggestion failed. Try again.");
        setState("error");
        return;
      }
      setSuggestion(data);
      setState("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error. Try again.");
      setState("error");
    }
  }

  async function accept() {
    if (!suggestion) return;
    setState("saving");
    try {
      const res = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(suggestion.rule),
      });
      if (!res.ok) {
        setError("Could not save rule. Try again.");
        setState("preview");
        return;
      }
      setState("saved");
      setTimeout(() => {
        setState("idle");
        setDescription("");
        setSuggestion(null);
        onSaved?.();
      }, 2000);
    } catch {
      setError("Network error. Try again.");
      setState("preview");
    }
  }

  function reset() {
    setState("idle");
    setSuggestion(null);
    setError(null);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      suggest();
    }
  }

  const r = suggestion?.rule;

  return (
    <div
      data-testid="ai-rule-creator"
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(79,110,247,0.08) 0%, rgba(14,165,160,0.05) 100%)",
        border: "1.5px solid rgba(79,110,247,0.25)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
            boxShadow: "0 2px 8px rgba(79,110,247,0.35)",
          }}
        >
          <Sparkles size={15} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--heading)" }}>
            Create rule with AI
          </p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Describe what you want — AI builds the rule for you
          </p>
        </div>
      </div>

      <div className="px-4 pb-4 space-y-3">
        {/* ── Input ── */}
        {(state === "idle" || state === "error") && (
          <>
            <div className="relative">
              <textarea
                data-testid="ai-rule-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={onKeyDown}
                rows={2}
                placeholder={PLACEHOLDERS[placeholderIdx]}
                className="pf-input py-2 resize-none pr-10"
                style={{ fontSize: "15px" }}
              />
              {description.trim() && (
                <button
                  type="button"
                  onClick={() => setDescription("")}
                  className="absolute right-2.5 top-2.5 p-0.5 rounded"
                  style={{ color: "var(--muted)" }}
                  aria-label="Clear"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {error && (
              <div
                className="flex items-start gap-2 rounded-lg px-3 py-2"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}
              >
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: "var(--danger)" }} />
                <p className="text-xs" style={{ color: "var(--danger)" }}>{error}</p>
              </div>
            )}

            <button
              type="button"
              data-testid="ai-rule-suggest-btn"
              onClick={suggest}
              disabled={!description.trim()}
              className="pf-btn pf-btn-primary text-sm w-full gap-2"
            >
              <Sparkles size={14} />
              Suggest rule
              <ArrowRight size={13} className="ml-auto opacity-60" />
            </button>

            <p className="text-[11px] text-center" style={{ color: "var(--muted)" }}>
              Press Enter to submit · Shift+Enter for new line
            </p>
          </>
        )}

        {/* ── Loading ── */}
        {state === "loading" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--primary-muted)" }}
            >
              <Loader2 size={22} className="animate-spin" style={{ color: "var(--primary)" }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: "var(--body)" }}>
                Thinking…
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                Building the perfect rule for you
              </p>
            </div>
          </div>
        )}

        {/* ── Saved ── */}
        {state === "saved" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center pf-animate-bounce-in"
              style={{ background: "var(--success-muted)" }}
            >
              <CheckCircle2 size={22} style={{ color: "var(--success)" }} />
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--success)" }}>
              Rule saved!
            </p>
          </div>
        )}

        {/* ── Preview card ── */}
        {(state === "preview" || state === "saving") && r && (
          <div className="space-y-3">
            {/* Rule logic card */}
            <div
              className="rounded-xl p-4 space-y-3"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
            >
              {/* Rule name */}
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold" style={{ color: "var(--heading)" }}>
                  {r.name}
                </p>
                {r.setTaxBadge && (
                  <TaxBadgeChip
                    badge={r.setTaxBadge as TaxBadgeKind}
                    scheduleELine={r.setScheduleELine}
                  />
                )}
              </div>

              {/* If / Then */}
              <div
                className="rounded-lg px-3 py-2 space-y-1.5 text-xs font-mono"
                style={{ background: "rgba(0,0,0,0.2)" }}
              >
                <div>
                  <span style={{ color: "var(--primary)" }}>IF </span>
                  <span style={{ color: "var(--muted)" }}>{FIELD_LABELS[r.matchField] ?? r.matchField} </span>
                  <span style={{ color: "var(--secondary)" }}>{OP_LABELS[r.matchOperator] ?? r.matchOperator} </span>
                  <span style={{ color: "var(--body)" }}>"{r.matchValue}"</span>
                </div>
                <div>
                  <span style={{ color: "var(--primary)" }}>THEN </span>
                  {r.setCategory && (
                    <span style={{ color: "var(--body)" }}>category = "{r.setCategory}" </span>
                  )}
                  {r.setScheduleELine && (
                    <span style={{ color: "var(--muted)" }}>· Sch. E Line {r.setScheduleELine} </span>
                  )}
                  {r.setTaxBadge && (
                    <span style={{ color: "var(--warning)" }}>· {r.setTaxBadge}</span>
                  )}
                </div>
              </div>

              {/* Explanation */}
              {suggestion?.explanation && (
                <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
                  {suggestion.explanation}
                </p>
              )}
            </div>

            {/* Example block */}
            {suggestion?.example && (
              <div
                className="rounded-lg px-3 py-2.5 flex items-start gap-2"
                style={{ background: "rgba(79,110,247,0.08)", border: "1px solid rgba(79,110,247,0.2)" }}
              >
                <Sparkles size={13} className="flex-shrink-0 mt-0.5" style={{ color: "var(--primary)" }} />
                <p className="text-xs leading-relaxed" style={{ color: "var(--body)" }}>
                  <span className="font-semibold" style={{ color: "var(--primary)" }}>Example: </span>
                  {suggestion.example}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={reset}
                disabled={state === "saving"}
                className="pf-btn pf-btn-secondary text-sm flex-1"
                data-testid="ai-rule-decline"
              >
                <X size={14} />
                Decline
              </button>
              <button
                type="button"
                onClick={accept}
                disabled={state === "saving"}
                className="pf-btn pf-btn-primary text-sm flex-1 gap-2"
                data-testid="ai-rule-accept"
              >
                {state === "saving" ? (
                  <><Loader2 size={14} className="animate-spin" /> Saving…</>
                ) : (
                  <><CheckCircle2 size={14} /> Accept rule</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
