"use client";

import { useState } from "react";
import { z } from "zod";
import { Card } from "@/components/ui/Card";

const NtfySchema = z.object({
  ntfyTopic: z.string().max(120).optional().or(z.literal("")),
  ntfyToken: z.string().max(500).optional().or(z.literal("")),
});

type NtfyFormState = z.infer<typeof NtfySchema>;
type ApiResult = { ok: boolean; message: string } | null;

export function NtfySection() {
  const [form, setForm] = useState<NtfyFormState>({ ntfyTopic: "", ntfyToken: "" });
  const [showToken, setShowToken] = useState(false);
  const [testResult, setTestResult] = useState<ApiResult>(null);
  const [saveResult, setSaveResult] = useState<ApiResult>(null);
  const [submitting, setSubmitting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof NtfyFormState>(key: K, value: NtfyFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onTest = async () => {
    setError(null);
    setTestResult(null);
    if (!form.ntfyTopic) {
      setTestResult({ ok: false, message: "Enter a topic first." });
      return;
    }
    setTesting(true);
    try {
      const res = await fetch("/api/ntfy/test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ topic: form.ntfyTopic, token: form.ntfyToken ?? "" }),
      });
      const data = (await res.json().catch(() => ({}))) as ApiResult;
      setTestResult(data ?? { ok: false, message: "No response" });
    } catch (err) {
      setTestResult({
        ok: false,
        message: err instanceof Error ? err.message : "Test failed",
      });
    } finally {
      setTesting(false);
    }
  };

  const onSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaveResult(null);
    const parsed = NtfySchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/settings/ntfy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        persisted?: boolean;
        message?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? "Save failed");
      }
      setSaveResult({
        ok: true,
        message: data.persisted === false ? "Saved (memory only — DB offline)" : "Saved.",
      });
    } catch (err) {
      setSaveResult({
        ok: false,
        message: err instanceof Error ? err.message : "Save failed",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card testId="settings-ntfy">
      <form onSubmit={onSave} className="space-y-4" data-testid="settings-ntfy-form">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-heading">
            Push notifications (ntfy)
          </h2>
          <p className="text-sm text-muted">
            Run notify.sh from CI or local builds. Topic is unique to your device.
          </p>
        </div>

        <div className="space-y-1">
          <label htmlFor="ntfyTopic" className="text-sm font-medium text-body">
            Topic
          </label>
          <input
            id="ntfyTopic"
            type="text"
            value={form.ntfyTopic ?? ""}
            onChange={(e) => update("ntfyTopic", e.target.value)}
            placeholder="propflow-arif-9k2x"
            data-testid="ntfy-topic"
            className="pf-input"
            autoComplete="off"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="ntfyToken" className="text-sm font-medium text-body">
            Access token
          </label>
          <div className="flex gap-2">
            <input
              id="ntfyToken"
              type={showToken ? "text" : "password"}
              value={form.ntfyToken ?? ""}
              onChange={(e) => update("ntfyToken", e.target.value)}
              placeholder="tk_..."
              data-testid="ntfy-token"
              autoComplete="off"
              className="pf-input flex-1"
            />
            <button
              type="button"
              onClick={() => setShowToken((s) => !s)}
              data-testid="ntfy-token-toggle"
              aria-label={showToken ? "Hide token" : "Show token"}
              className="pf-btn pf-btn-secondary min-h-touch"
            >
              {showToken ? "Hide" : "Show"}
            </button>
          </div>
          <p className="text-xs text-muted">Encrypted at rest with AES-256-GCM.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={onTest}
            disabled={testing}
            data-testid="ntfy-test-send"
            className="pf-btn pf-btn-secondary min-h-touch"
          >
            {testing ? "Sending..." : "Send test notification"}
          </button>
          <button
            type="submit"
            disabled={submitting}
            data-testid="ntfy-save"
            className="pf-btn pf-btn-primary min-h-touch"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>

        {testResult ? (
          <p
            data-testid="ntfy-test-result"
            className={`text-sm ${testResult.ok ? "text-success" : "text-danger"}`}
            role="status"
          >
            {testResult.ok ? "✓ " : "✗ "}
            {testResult.message}
          </p>
        ) : null}
        {saveResult ? (
          <p
            data-testid="ntfy-save-result"
            className={`text-sm ${saveResult.ok ? "text-success" : "text-danger"}`}
            role="status"
          >
            {saveResult.message}
          </p>
        ) : null}
        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </Card>
  );
}
