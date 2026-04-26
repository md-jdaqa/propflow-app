"use client";

import { useState } from "react";
import { z } from "zod";
import { Card } from "@/components/ui/Card";

const AiSchema = z.object({
  preferredAi: z.enum(["OPENAI", "ANTHROPIC"]),
  openaiApiKey: z.string().max(500).optional().or(z.literal("")),
  anthropicApiKey: z.string().max(500).optional().or(z.literal("")),
});

type AiFormState = z.infer<typeof AiSchema>;

type TestResult = { ok: boolean; message: string } | null;

export function AiSection() {
  const [form, setForm] = useState<AiFormState>({
    preferredAi: "ANTHROPIC",
    openaiApiKey: "",
    anthropicApiKey: "",
  });
  const [showOpenai, setShowOpenai] = useState(false);
  const [showAnthropic, setShowAnthropic] = useState(false);
  const [testResult, setTestResult] = useState<TestResult>(null);
  const [saveStatus, setSaveStatus] = useState<TestResult>(null);
  const [submitting, setSubmitting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof AiFormState>(key: K, value: AiFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onTest = async () => {
    setError(null);
    setTestResult(null);
    const provider = form.preferredAi;
    const apiKey =
      provider === "OPENAI" ? form.openaiApiKey ?? "" : form.anthropicApiKey ?? "";
    if (!apiKey) {
      setTestResult({ ok: false, message: "Enter an API key for the selected provider." });
      return;
    }
    setTesting(true);
    try {
      const res = await fetch("/api/ai/test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider, apiKey }),
      });
      const data = (await res.json().catch(() => ({}))) as TestResult;
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
    setSaveStatus(null);
    const parsed = AiSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/settings/ai", {
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
      setSaveStatus({
        ok: true,
        message: data.persisted === false ? "Saved (memory only — DB offline)" : "Saved.",
      });
    } catch (err) {
      setSaveStatus({
        ok: false,
        message: err instanceof Error ? err.message : "Save failed",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card testId="settings-ai">
      <form onSubmit={onSave} className="space-y-4" data-testid="settings-ai-form">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-heading">
            AI Assistant — Bring Your Own Key
          </h2>
          <p className="text-sm text-muted">
            Provide your own OpenAI or Anthropic API key. Encrypted at rest with
            AES-256-GCM.
          </p>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-body">Preferred provider</legend>
          <div className="flex flex-col sm:flex-row gap-2">
            {(["ANTHROPIC", "OPENAI"] as const).map((p) => (
              <label
                key={p}
                className="flex items-center gap-2 pf-card cursor-pointer min-h-touch px-3 py-2"
              >
                <input
                  type="radio"
                  name="preferredAi"
                  value={p}
                  checked={form.preferredAi === p}
                  onChange={() => update("preferredAi", p)}
                  data-testid={`ai-provider-${p.toLowerCase()}`}
                />
                <span className="text-sm text-body">
                  {p === "ANTHROPIC" ? "Anthropic (Claude)" : "OpenAI (GPT)"}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <PasswordField
          id="openaiApiKey"
          label="OpenAI API key"
          value={form.openaiApiKey ?? ""}
          show={showOpenai}
          onToggle={() => setShowOpenai((s) => !s)}
          onChange={(v) => update("openaiApiKey", v)}
          testId="ai-openai-key"
          placeholder="sk-..."
        />

        <PasswordField
          id="anthropicApiKey"
          label="Anthropic API key"
          value={form.anthropicApiKey ?? ""}
          show={showAnthropic}
          onToggle={() => setShowAnthropic((s) => !s)}
          onChange={(v) => update("anthropicApiKey", v)}
          testId="ai-anthropic-key"
          placeholder="sk-ant-..."
        />

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={onTest}
            disabled={testing}
            data-testid="ai-test-connection"
            className="pf-btn pf-btn-secondary min-h-touch"
          >
            {testing ? "Testing..." : "Test connection"}
          </button>
          <button
            type="submit"
            disabled={submitting}
            data-testid="ai-save"
            className="pf-btn pf-btn-primary min-h-touch"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>

        {testResult ? (
          <p
            data-testid="ai-test-result"
            className={`text-sm ${testResult.ok ? "text-success" : "text-danger"}`}
            role="status"
          >
            {testResult.ok ? "✓ " : "✗ "}
            {testResult.message}
          </p>
        ) : null}
        {saveStatus ? (
          <p
            data-testid="ai-save-result"
            className={`text-sm ${saveStatus.ok ? "text-success" : "text-danger"}`}
            role="status"
          >
            {saveStatus.message}
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

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  show: boolean;
  onToggle: () => void;
  onChange: (v: string) => void;
  testId: string;
  placeholder?: string;
}

function PasswordField({
  id,
  label,
  value,
  show,
  onToggle,
  onChange,
  testId,
  placeholder,
}: PasswordFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium text-body">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          data-testid={testId}
          autoComplete="off"
          className="pf-input flex-1"
        />
        <button
          type="button"
          onClick={onToggle}
          data-testid={`${testId}-toggle`}
          aria-label={show ? "Hide key" : "Show key"}
          className="pf-btn pf-btn-secondary min-h-touch"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
      <p className="text-xs text-muted">Encrypted at rest with AES-256-GCM.</p>
    </div>
  );
}
