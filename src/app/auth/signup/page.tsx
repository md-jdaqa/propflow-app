"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState<null | "google" | "email">(null);
  const [error, setError] = useState<string | null>(null);
  const [signupSent, setSignupSent] = useState(false);

  const handleGoogle = async () => {
    setError(null);
    setSubmitting("google");
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setSubmitting(null);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting("email");
    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (signupError) {
      setError(signupError.message);
    } else {
      setSignupSent(true);
    }
    setSubmitting(null);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: "var(--background, #0D1B2A)" }}
    >
      <div
        className="w-full max-w-sm"
        style={{
          background: "var(--surface-2, #132337)",
          borderRadius: "16px",
          border: "1px solid var(--border, #1E3A5F)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div className="px-7 pt-8 pb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary, #1A56DB) 0%, #3B82F6 100%)",
              }}
            >
              <Building2 size={22} color="#fff" strokeWidth={2.5} />
            </div>
            <span
              className="text-2xl font-bold tracking-tight"
              style={{ color: "var(--heading, #FFFFFF)" }}
            >
              PropFlow
            </span>
          </div>
          <h1
            className="text-lg font-semibold"
            style={{ color: "var(--heading, #FFFFFF)" }}
          >
            Create your account
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--muted-text, #94A3B8)" }}
          >
            Start managing your properties in minutes
          </p>
        </div>

        <div className="px-7 pb-8 flex flex-col gap-4">
          {/* Error banner */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 p-3 rounded-lg text-sm"
              style={{
                background: "rgba(220,38,38,0.10)",
                border: "1px solid rgba(220,38,38,0.30)",
                color: "#FCA5A5",
              }}
            >
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success banner */}
          {signupSent && (
            <div
              role="status"
              className="flex items-start gap-2 p-3 rounded-lg text-sm"
              style={{
                background: "rgba(22,163,74,0.10)",
                border: "1px solid rgba(22,163,74,0.30)",
                color: "#86EFAC",
              }}
            >
              <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
              <span>
                Check your email — we sent a confirmation link to{" "}
                <strong>{email}</strong>.
              </span>
            </div>
          )}

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={submitting !== null}
            data-testid="signup-google"
            className="w-full flex items-center justify-center gap-3 rounded-xl font-semibold text-sm transition-all"
            style={{
              minHeight: "48px",
              padding: "12px 16px",
              background: "#FFFFFF",
              color: "#0F172A",
              border: "1px solid #E2E8F0",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting && submitting !== "google" ? 0.6 : 1,
            }}
          >
            {submitting === "google" ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <div
              className="flex-1 h-px"
              style={{ background: "var(--border, #1E3A5F)" }}
            />
            <span
              className="text-xs uppercase tracking-wider"
              style={{ color: "var(--muted-text, #94A3B8)" }}
            >
              or
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: "var(--border, #1E3A5F)" }}
            />
          </div>

          {/* Email + password */}
          <form onSubmit={handleEmailSignup} noValidate className="flex flex-col gap-3">
            <div>
              <label
                htmlFor="signup-email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--body, #E2E8F0)" }}
              >
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (signupSent) setSignupSent(false);
                  if (error) setError(null);
                }}
                placeholder="you@example.com"
                data-testid="signup-email"
                disabled={submitting !== null}
                style={{
                  width: "100%",
                  minHeight: "48px",
                  padding: "12px 14px",
                  background: "var(--background, #0D1B2A)",
                  color: "var(--body, #E2E8F0)",
                  border: "1px solid var(--border, #1E3A5F)",
                  borderRadius: "10px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor =
                    "var(--primary, #1A56DB)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(26,86,219,0.20)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor =
                    "var(--border, #1E3A5F)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            <div>
              <label
                htmlFor="signup-password"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--body, #E2E8F0)" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="At least 8 characters"
                  data-testid="signup-password"
                  disabled={submitting !== null}
                  style={{
                    width: "100%",
                    minHeight: "48px",
                    padding: "12px 44px 12px 14px",
                    background: "var(--background, #0D1B2A)",
                    color: "var(--body, #E2E8F0)",
                    border: "1px solid var(--border, #1E3A5F)",
                    borderRadius: "10px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      "var(--primary, #1A56DB)";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(26,86,219,0.20)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      "var(--border, #1E3A5F)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center"
                  style={{
                    right: "8px",
                    width: "36px",
                    height: "36px",
                    color: "var(--muted-text, #94A3B8)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting !== null}
              data-testid="signup-submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl font-semibold text-sm text-white transition-all"
              style={{
                minHeight: "48px",
                padding: "12px 16px",
                background:
                  submitting !== null
                    ? "rgba(26,86,219,0.50)"
                    : "linear-gradient(135deg, var(--primary, #1A56DB) 0%, #3B82F6 100%)",
                cursor: submitting ? "not-allowed" : "pointer",
                boxShadow:
                  submitting !== null
                    ? "none"
                    : "0 4px 14px rgba(26,86,219,0.35)",
              }}
            >
              {submitting === "email" ? (
                <Loader2 size={18} className="animate-spin" />
              ) : null}
              <span>
                {submitting === "email" ? "Creating account…" : "Create account"}
              </span>
            </button>
          </form>

          {/* Footer */}
          <p
            className="text-center text-sm mt-2"
            style={{ color: "var(--muted-text, #94A3B8)" }}
          >
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              style={{ color: "var(--primary, #1A56DB)", fontWeight: 600 }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
