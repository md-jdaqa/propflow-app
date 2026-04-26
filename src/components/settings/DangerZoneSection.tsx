"use client";

import { useState } from "react";

export function DangerZoneSection() {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onDelete = async () => {
    const confirmed =
      typeof window !== "undefined" &&
      window.confirm(
        "Delete your account? This cannot be undone. All properties, tenants, and payments will be removed.",
      );
    if (!confirmed) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? "Delete failed");
      }
      setMessage("Account deletion queued.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      data-testid="settings-danger"
      className="pf-card border-2 border-danger/50 bg-danger/5"
    >
      <div className="mb-3 space-y-1">
        <h2 className="text-lg font-semibold text-danger">Danger zone</h2>
        <p className="text-sm text-muted">
          Permanently delete your PropFlow account and all associated data.
        </p>
      </div>
      <button
        type="button"
        onClick={onDelete}
        disabled={submitting}
        data-testid="danger-delete-account"
        className="pf-btn min-h-touch bg-danger text-white hover:opacity-90"
      >
        {submitting ? "Deleting..." : "Delete account"}
      </button>
      {message ? (
        <p className="mt-2 text-sm text-body" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
