"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";

const SignInSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormState = z.infer<typeof SignInSchema>;

type Provider = "google" | "apple" | "azure";

export function SignInForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const parsed = SignInSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  };

  const onOAuth = async (provider: Provider) => {
    setError(null);
    try {
      const supabase = createClient();
      const redirectTo =
        typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: redirectTo ? { redirectTo } : undefined,
      });
      if (oauthError) setError(oauthError.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "OAuth failed");
    }
  };

  return (
    <Card>
      <form
        data-testid="sign-in-form"
        onSubmit={onSubmit}
        className="space-y-4"
        noValidate
      >
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-body">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            data-testid="sign-in-email"
            autoComplete="email"
            className="pf-input"
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-body">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            data-testid="sign-in-password"
            autoComplete="current-password"
            className="pf-input"
            required
          />
        </div>

        {error ? (
          <p
            data-testid="sign-in-error"
            role="alert"
            className="text-sm text-danger"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          data-testid="sign-in-submit"
          className="pf-btn pf-btn-primary w-full min-h-touch"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>

        <div className="flex items-center gap-3">
          <span className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted">or continue with</span>
          <span className="flex-1 h-px bg-border" />
        </div>

        <div className="flex flex-col gap-2">
          <OAuthButton
            label="Continue with Google"
            glyph="G"
            testId="oauth-google"
            onClick={() => onOAuth("google")}
          />
          <OAuthButton
            label="Continue with Apple"
            glyph=""
            testId="oauth-apple"
            onClick={() => onOAuth("apple")}
          />
          <OAuthButton
            label="Continue with Microsoft"
            glyph="M"
            testId="oauth-microsoft"
            onClick={() => onOAuth("azure")}
          />
        </div>

        <p className="text-sm text-muted text-center">
          No account?{" "}
          <Link href="/sign-up" className="text-primary underline">
            Sign up
          </Link>
        </p>
      </form>
    </Card>
  );
}

interface OAuthButtonProps {
  label: string;
  glyph: string;
  testId: string;
  onClick: () => void;
}

function OAuthButton({ label, glyph, testId, onClick }: OAuthButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className="pf-btn pf-btn-secondary w-full min-h-touch flex items-center justify-center gap-2"
    >
      <span aria-hidden className="font-semibold">
        {glyph}
      </span>
      <span>{label}</span>
    </button>
  );
}
