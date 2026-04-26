"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";

export function AccountSection() {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSignOut = async () => {
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/sign-out", {
        method: "POST",
        redirect: "follow",
      });
      if (res.redirected) {
        window.location.href = res.url;
        return;
      }
      if (!res.ok) throw new Error("Sign out failed");
      window.location.href = "/sign-in";
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Sign out failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card testId="settings-account">
      <div className="mb-3 space-y-1">
        <h2 className="text-lg font-semibold text-heading">Account</h2>
        <p className="text-sm text-muted">Your profile and session.</p>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <dt className="text-xs text-muted">Name</dt>
          <dd className="text-sm text-body">Arif</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Email</dt>
          <dd className="text-sm text-body break-all">mohammedarif0411@gmail.com</dd>
        </div>
      </dl>
      <button
        type="button"
        onClick={onSignOut}
        disabled={submitting}
        data-testid="account-sign-out"
        className="pf-btn pf-btn-secondary min-h-touch"
      >
        {submitting ? "Signing out..." : "Sign out"}
      </button>
      {message ? (
        <p className="mt-2 text-sm text-danger" role="alert">
          {message}
        </p>
      ) : null}
    </Card>
  );
}
