"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";

const SignUpSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(120),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type FormState = z.infer<typeof SignUpSchema>;
type Provider = "google" | "apple" | "azure";

export function SignUpForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    const parsed = SignUpSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: { data: { name: parsed.data.name } },
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      setInfo("Account created. Check your email to confirm.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
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
        data-testid="sign-up-form"
        onSubmit={onSubmit}
        className="space-y-4"
        noValidate
      >
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium text-body">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            data-testid="sign-up-name"
            autoComplete="name"
            className="pf-input"
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-body">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            data-testid="sign-up-email"
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
            data-testid="sign-up-password"
            autoComplete="new-password"
            className="pf-input"
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-body">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            data-testid="sign-up-confirm"
            autoComplete="new-password"
            className="pf-input"
            required
          />
        </div>

        {error ? (
          <p
            data-testid="sign-up-error"
            role="alert"
            className="text-sm text-danger"
          >
            {error}
          </p>
        ) : null}
        {info ? (
          <p
            data-testid="sign-up-info"
            role="status"
            className="text-sm text-success"
          >
            {info}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          data-testid="sign-up-submit"
          className="pf-btn pf-btn-primary w-full min-h-touch"
        >
          {submitting ? "Creating account..." : "Create account"}
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
          Already have an account?{" "}
          <Link href="/sign-in" className="text-primary underline">
            Sign in
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
