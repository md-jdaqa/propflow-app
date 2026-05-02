"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Building2, User, Wrench, Eye, EyeOff, CheckCircle2 } from "lucide-react";

// Mock token → invite data (in production this would be a DB lookup)
type InviteRole = "Contractor" | "Tenant";

interface InviteData {
  role: InviteRole;
  property: string;
  inviterName: string;
}

function getInviteData(token: string): InviteData {
  // Deterministic mock based on token characteristics
  const isContractor = token.charCodeAt(0) % 2 === 0;
  return {
    role: isContractor ? "Contractor" : "Tenant",
    property: "406 Oak St",
    inviterName: "Md Arifuzzaman",
  };
}

type FieldErrors = {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
};

function validateForm(fields: {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!fields.name.trim()) errors.name = "Full name is required";
  if (!fields.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = "Enter a valid email address";
  }
  if (!fields.password) {
    errors.password = "Password is required";
  } else if (fields.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }
  if (!fields.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (fields.password !== fields.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }
  return errors;
}

export default function InvitePageContent() {
  const params = useParams();
  const token = typeof params?.token === "string" ? params.token : "default";
  const invite = getInviteData(token);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear error on change
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fieldErrors = validateForm(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setSubmitting(true);
    // Simulate async account creation
    await new Promise((r) => setTimeout(r, 800));
    setSuccess(true);
    setTimeout(() => {
      const dest = invite.role === "Contractor" ? "/contractor/jobs" : "/tenant/home";
      window.location.href = dest;
    }, 2000);
  };

  const RoleIcon = invite.role === "Contractor" ? Wrench : User;
  const roleColor = invite.role === "Contractor" ? "#F59E0B" : "#4F6EF7";
  const roleBg = invite.role === "Contractor" ? "rgba(245,158,11,0.12)" : "rgba(79,110,247,0.12)";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#F8FAFC" }}
    >
      <div
        className="w-full max-w-md"
        style={{
          background: "#FFFFFF",
          borderRadius: "20px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.05), 0 20px 60px rgba(0,0,0,0.10)",
          overflow: "hidden",
        }}
      >
        {/* Header band */}
        <div
          className="px-8 pt-8 pb-6 text-center"
          style={{
            background: "linear-gradient(135deg, #1A56DB 0%, #3B82F6 100%)",
          }}
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              <Building2 size={20} color="#fff" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">PropFlow</span>
          </div>
          <h1 className="text-xl font-semibold text-white mb-1">
            You&apos;ve been invited to PropFlow
          </h1>
          <p className="text-sm text-white/75">
            {invite.inviterName} invited you to join their team
          </p>
        </div>

        {/* Context card */}
        <div className="px-8 pt-5">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: roleBg, border: `1px solid ${roleColor}30` }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: roleColor + "20", color: roleColor }}
            >
              <RoleIcon size={16} strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: roleColor }}>
                Join as {invite.role}
              </p>
              <p className="text-sm font-medium mt-0.5" style={{ color: "#1E293B" }}>
                {invite.property}
              </p>
            </div>
          </div>
        </div>

        {/* Form or success */}
        {success ? (
          <div className="px-8 py-10 flex flex-col items-center text-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "rgba(34,197,94,0.12)" }}
            >
              <CheckCircle2 size={32} color="#22C55E" strokeWidth={2} />
            </div>
            <div>
              <p className="text-lg font-semibold" style={{ color: "#0F172A" }}>
                Account created!
              </p>
              <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                Redirecting to your portal…
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="px-8 py-6 flex flex-col gap-4">
            {/* Full Name */}
            <div>
              <label htmlFor="inv-name" className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>
                Full Name <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                id="inv-name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Jane Smith"
                data-testid="inv-name"
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all"
                style={{
                  borderColor: errors.name ? "#EF4444" : "#E2E8F0",
                  background: "#F8FAFC",
                  color: "#0F172A",
                  boxShadow: errors.name ? "0 0 0 3px rgba(239,68,68,0.12)" : "none",
                }}
                onFocus={(e) => {
                  if (!errors.name) e.currentTarget.style.borderColor = "#1A56DB";
                  e.currentTarget.style.boxShadow = errors.name
                    ? "0 0 0 3px rgba(239,68,68,0.12)"
                    : "0 0 0 3px rgba(26,86,219,0.12)";
                  e.currentTarget.style.background = "#fff";
                }}
                onBlur={(e) => {
                  if (!errors.name) e.currentTarget.style.borderColor = "#E2E8F0";
                  if (!errors.name) e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "#F8FAFC";
                }}
              />
              {errors.name && (
                <p className="text-xs mt-1.5 font-medium" style={{ color: "#EF4444" }}>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="inv-email" className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>
                Email Address <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                id="inv-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="jane@example.com"
                data-testid="inv-email"
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all"
                style={{
                  borderColor: errors.email ? "#EF4444" : "#E2E8F0",
                  background: "#F8FAFC",
                  color: "#0F172A",
                  boxShadow: errors.email ? "0 0 0 3px rgba(239,68,68,0.12)" : "none",
                }}
                onFocus={(e) => {
                  if (!errors.email) e.currentTarget.style.borderColor = "#1A56DB";
                  e.currentTarget.style.boxShadow = errors.email
                    ? "0 0 0 3px rgba(239,68,68,0.12)"
                    : "0 0 0 3px rgba(26,86,219,0.12)";
                  e.currentTarget.style.background = "#fff";
                }}
                onBlur={(e) => {
                  if (!errors.email) e.currentTarget.style.borderColor = "#E2E8F0";
                  if (!errors.email) e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "#F8FAFC";
                }}
              />
              {errors.email && (
                <p className="text-xs mt-1.5 font-medium" style={{ color: "#EF4444" }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="inv-phone" className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>
                Phone
                <span className="ml-1 text-xs font-normal" style={{ color: "#94A3B8" }}>(optional)</span>
              </label>
              <input
                id="inv-phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+1 (555) 000-0000"
                data-testid="inv-phone"
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all"
                style={{
                  borderColor: "#E2E8F0",
                  background: "#F8FAFC",
                  color: "#0F172A",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#1A56DB";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,86,219,0.12)";
                  e.currentTarget.style.background = "#fff";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E2E8F0";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "#F8FAFC";
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="inv-password" className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>
                Password <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <div className="relative">
                <input
                  id="inv-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="Min. 8 characters"
                  data-testid="inv-password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border text-sm outline-none transition-all"
                  style={{
                    borderColor: errors.password ? "#EF4444" : "#E2E8F0",
                    background: "#F8FAFC",
                    color: "#0F172A",
                    boxShadow: errors.password ? "0 0 0 3px rgba(239,68,68,0.12)" : "none",
                  }}
                  onFocus={(e) => {
                    if (!errors.password) e.currentTarget.style.borderColor = "#1A56DB";
                    e.currentTarget.style.boxShadow = errors.password
                      ? "0 0 0 3px rgba(239,68,68,0.12)"
                      : "0 0 0 3px rgba(26,86,219,0.12)";
                    e.currentTarget.style.background = "#fff";
                  }}
                  onBlur={(e) => {
                    if (!errors.password) e.currentTarget.style.borderColor = "#E2E8F0";
                    if (!errors.password) e.currentTarget.style.boxShadow = "none";
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="inv-confirm" className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>
                Confirm Password <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <div className="relative">
                <input
                  id="inv-confirm"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  placeholder="Re-enter your password"
                  data-testid="inv-confirm-password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border text-sm outline-none transition-all"
                  style={{
                    borderColor: errors.confirmPassword ? "#EF4444" : "#E2E8F0",
                    background: "#F8FAFC",
                    color: "#0F172A",
                    boxShadow: errors.confirmPassword ? "0 0 0 3px rgba(239,68,68,0.12)" : "none",
                  }}
                  onFocus={(e) => {
                    if (!errors.confirmPassword) e.currentTarget.style.borderColor = "#1A56DB";
                    e.currentTarget.style.boxShadow = errors.confirmPassword
                      ? "0 0 0 3px rgba(239,68,68,0.12)"
                      : "0 0 0 3px rgba(26,86,219,0.12)";
                    e.currentTarget.style.background = "#fff";
                  }}
                  onBlur={(e) => {
                    if (!errors.confirmPassword) e.currentTarget.style.borderColor = "#E2E8F0";
                    if (!errors.confirmPassword) e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.background = "#F8FAFC";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  style={{ color: "#94A3B8" }}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs mt-1.5 font-medium" style={{ color: "#EF4444" }}>
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              data-testid="inv-submit"
              className="w-full py-3 rounded-xl font-semibold text-sm text-white mt-1 transition-all"
              style={{
                background: submitting
                  ? "#93A5D5"
                  : "linear-gradient(135deg, #1A56DB 0%, #3B82F6 100%)",
                cursor: submitting ? "not-allowed" : "pointer",
                boxShadow: submitting ? "none" : "0 4px 14px rgba(26,86,219,0.35)",
              }}
            >
              {submitting ? "Creating account…" : "Create Account & Join"}
            </button>

            {/* Footer links */}
            <div className="text-center pt-1">
              <p className="text-sm" style={{ color: "#64748B" }}>
                Already have an account?{" "}
                <Link
                  href="/auth/signin"
                  className="font-medium underline"
                  style={{ color: "#1A56DB" }}
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
