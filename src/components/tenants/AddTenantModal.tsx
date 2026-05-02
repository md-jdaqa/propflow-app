"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import type { TenantUnitOption } from "@/app/(app)/tenants/page";

interface Props {
  open: boolean;
  onClose: () => void;
  units: TenantUnitOption[];
}

const ClientSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().optional(),
  phone: z.string().optional(),
  unitId: z.string().optional(),
  leaseStart: z.string().optional(),
  leaseEnd: z.string().optional(),
  monthlyRent: z.string().optional(),
  depositHeld: z.string().optional(),
  notes: z.string().optional(),
});

type FormState = z.infer<typeof ClientSchema>;

const INITIAL: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  unitId: "",
  leaseStart: "",
  leaseEnd: "",
  monthlyRent: "",
  depositHeld: "",
  notes: "",
};

export function AddTenantModal({ open, onClose, units }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function close() {
    setForm(INITIAL);
    setErrors({});
    setServerError(null);
    onClose();
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);

    const parsed = ClientSchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0];
        if (typeof path === "string" && !next[path]) next[path] = issue.message;
      }
      setErrors(next);
      return;
    }
    if (parsed.data.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(parsed.data.email)) {
      setErrors({ email: "Invalid email" });
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const payload = {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        unitId: parsed.data.unitId || null,
        leaseStart: parsed.data.leaseStart || null,
        leaseEnd: parsed.data.leaseEnd || null,
        monthlyRent: parsed.data.monthlyRent
          ? Number(parsed.data.monthlyRent)
          : null,
        depositHeld: parsed.data.depositHeld
          ? Number(parsed.data.depositHeld)
          : null,
        notes: parsed.data.notes || null,
      };

      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (body && typeof body === "object" && "fieldErrors" in body) {
          setErrors((body as { fieldErrors: Record<string, string> }).fieldErrors);
        }
        setServerError(
          (body as { error?: string })?.error ?? "Failed to save tenant",
        );
        return;
      }

      close();
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Network error");
    } finally {
      setSubmitting(false);
    }
  }

  function fieldError(name: string) {
    if (!errors[name]) return null;
    return (
      <p
        data-testid={`add-tenant-error-${name}`}
        className="text-xs text-danger mt-1"
      >
        {errors[name]}
      </p>
    );
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add tenant"
      testId="add-tenant-modal"
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-body">First name</span>
            <input
              data-testid="add-tenant-first-name"
              className="pf-input min-h-11"
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
            />
            {fieldError("firstName")}
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-body">Last name</span>
            <input
              data-testid="add-tenant-last-name"
              className="pf-input min-h-11"
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
            />
            {fieldError("lastName")}
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-body">Email</span>
          <input
            type="email"
            data-testid="add-tenant-email"
            className="pf-input min-h-11"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
          {fieldError("email")}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-body">Phone</span>
          <input
            type="tel"
            data-testid="add-tenant-phone"
            className="pf-input min-h-11"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
          {fieldError("phone")}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-body">Unit</span>
          <select
            data-testid="add-tenant-unit"
            className="pf-input min-h-11"
            value={form.unitId}
            onChange={(e) => set("unitId", e.target.value)}
          >
            <option value="">No unit</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.propertyName} — {u.label}
              </option>
            ))}
          </select>
          {fieldError("unitId")}
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-body">Lease start</span>
            <input
              type="date"
              data-testid="add-tenant-lease-start"
              className="pf-input min-h-11"
              value={form.leaseStart}
              onChange={(e) => set("leaseStart", e.target.value)}
            />
            {fieldError("leaseStart")}
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-body">Lease end</span>
            <input
              type="date"
              data-testid="add-tenant-lease-end"
              className="pf-input min-h-11"
              value={form.leaseEnd}
              onChange={(e) => set("leaseEnd", e.target.value)}
            />
            {fieldError("leaseEnd")}
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-body">Monthly rent</span>
            <input
              data-testid="add-tenant-monthly-rent"
              inputMode="decimal"
              className="pf-input min-h-11"
              value={form.monthlyRent}
              onChange={(e) => set("monthlyRent", e.target.value)}
            />
            {fieldError("monthlyRent")}
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-body">Deposit held</span>
            <input
              data-testid="add-tenant-deposit"
              inputMode="decimal"
              className="pf-input min-h-11"
              value={form.depositHeld}
              onChange={(e) => set("depositHeld", e.target.value)}
            />
            {fieldError("depositHeld")}
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-body">Notes</span>
          <textarea
            data-testid="add-tenant-notes"
            rows={3}
            className="pf-input"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
          {fieldError("notes")}
        </label>

        {serverError ? (
          <p
            data-testid="add-tenant-server-error"
            className="text-sm text-danger"
          >
            {serverError}
          </p>
        ) : null}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={close}
            className="pf-btn pf-btn-secondary min-h-11 px-4"
          >
            Cancel
          </button>
          <button
            type="submit"
            data-testid="add-tenant-submit"
            disabled={submitting}
            className="pf-btn pf-btn-primary min-h-11 px-4 disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save tenant"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
