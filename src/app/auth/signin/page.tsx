"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Eye, EyeOff, Wrench, User, LayoutDashboard } from "lucide-react";

type FieldErrors = {
  email?: string;
  password?: string;
};

type PortalHint = "landlord" | "tenant" | "contractor" | null;

function detectPortal(email: string): PortalHint {
  const lower = email.toLowerCase();
  if (lower.includes("contractor")) return "contractor";
  if (lower.includes("tenant")) return "tenant";
  if (email.length > 0) return "landlord";
  return null;
}

const PORTAL_META: Record<
  NonNullable<PortalHint>,
  { label: string; icon: React.ReactNode; color: string; bg: string; href: string }
> = {
  landlord: {
    label: "Landlord Dashboard",
    icon: <LayoutDashboard size={14} strokeWidth={2} />,
    color: "#4F6EF7",
    bg: "rgba(79,110,247,0.10)",
    href: "/",
  },
  tenant: {
    label: "Tenant Portal",
    icon: <User size={14} strokeWidth={2} />,
    color: "#22C55E",
    bg: "rgba(34,197,94,0.10)",
    href: "/tenant/home",
  },
  contractor: {
    label: "Contractor Portal",
    icon: <Wrench size={14} strokeWidth={2} />,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.10)",
    href: "/contractor/jobs",
  },
};

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const portalHint = detectPortal(email);
  const portalMeta = portalHint ? PORTAL_META[portalHint] : null;

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Enter a valid email address";
    }
    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    // Simulate async auth
    await new Promise((r) => setTimeout(r, 600));
    // Mock routing based on email
    const dest = portalMeta?.href ?? "/";
    window.location.href = dest;
  };

  const inputBase: React.CSSProperties = {
    background: "#F8FAFC",
    color: "#0F172A",
    borderRadius: "10px",
    border: "1.5px solid #E2E8F0",
    fontSize: "14px",
    padding: "10px 14px",
    width: "100%",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
  };

  const inputError: React.CSSProperties = {
    ...inputBase,
    borderColor: "#EF4444",
    boxShadow: "0 0 0 3px rgba(239,68,68,0.12)",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#F1F5F9" }}
    >
      <div
        className="w-full max-w-sm"
        style={{
          background: "#FFFFFF",
          borderRadius: "20px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.05), 0 20px 60px rgba(0,0,0,0.10)",
          overflow: "hidden",
        }}
      >
        {/* Top branding */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #1A56DB 0%, #3B82F6 100%)" }}
            >
              <Building2 size={22} color="#fff" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold tracking-tight" style={{ color: "#0F172A" }}>
              PropFlow
            </span>
          </div>
          <h1 className="text-lg font-semibold" style={{ color: "#0F172A" }}>
            Welcome back
          </h1>
          <p className="text-sm mt-1" style={{ color: "#64748B" }}>
            Sign in to your account
          </p>
        </div>

        {/* Portal hint chip */}
        {portalMeta && (
          <div className="px-8 pb-2">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
              style={{ background: portalMeta.bg, color: portalMeta.color }}
            >
              {portalMeta.icon}
              <span>You&apos;ll be taken to: <strong>{portalMeta.label}</strong></span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="px-8 pb-8 flex flex-col gap-4">
          {/* Email */}
          <div>
            <label
              htmlFor="signin-email"
              className="block text-sm font-medium mb-1.5"
              style={{ color: "#374151" }}
            >
              Email
            </label>
            <input
              id="signin-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="you@example.com"
              data-testid="signin-email"
              style={errors.email ? inputError : inputBase}
              onFocus={(e) => {
                if (!errors.email) {
                  e.currentTarget.style.borderColor = "#1A56DB";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,86,219,0.12)";
                }
                e.currentTarget.style.background = "#fff";
              }}
              onBlur={(e) => {
                if (!errors.email) {
                  e.currentTarget.style.borderColor = "#E2E8F0";
                  e.currentTarget.style.boxShadow = "none";
                }
                e.currentTarget.style.background = "#F8FAFC";
              }}
            />
            {errors.email && (
              <p className="text-xs mt-1.5 font-medium" style={{ color: "#EF4444" }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="signin-password"
                className="text-sm font-medium"
                style={{ color: "#374151" }}
              >
                Password
              </label>
              <Link
                href="#"
                className="text-xs font-medium"
                style={{ color: "#1A56DB" }}
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="signin-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="••••••••"
                data-testid="signin-password"
                style={errors.password ? { ...inputError, paddingRight: "40px" } : { ...inputBase, paddingRight: "40px" }}
                onFocus={(e) => {
                  if (!errors.password) {
                    e.currentTarget.style.borderColor = "#1A56DB";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,86,219,0.12)";
                  }
                  e.currentTarget.style.background = "#fff";
                }}
                onBlur={(e) => {
                  if (!errors.password) {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                    e.currentTarget.style.boxShadow = "none";
                  }
                  e.currentTarget.style.background = "#F8FAFC";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{ color: "#94A3B8" }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs mt-1.5 font-medium" style={{ color: "#EF4444" }}>
                {errors.password}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            data-testid="signin-submit"
            className="w-full py-3 rounded-xl font-semibold text-sm text-white mt-1 transition-all"
            style={{
              background: submitting
                ? "#93A5D5"
                : "linear-gradient(135deg, #1A56DB 0%, #3B82F6 100%)",
              cursor: submitting ? "not-allowed" : "pointer",
              boxShadow: submitting ? "none" : "0 4px 14px rgba(26,86,219,0.35)",
            }}
          >
            {submitting ? "Signing in…" : "Sign In"}
          </button>

          {/* Footer */}
          <p className="text-center text-sm mt-1" style={{ color: "#64748B" }}>
            Don&apos;t have an account?{" "}
            <span style={{ color: "#94A3B8" }}>Use your invite link</span>
          </p>
        </form>
      </div>
    </div>
  );
}
