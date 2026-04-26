"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";

interface Props {
  propertyId: string;
}

const ClientSchema = z.object({
  label: z.string().min(1, "Required"),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  squareFeet: z.string().optional(),
  monthlyRent: z.string().optional(),
  occupied: z.boolean(),
});

type FormState = z.infer<typeof ClientSchema>;

const INITIAL: FormState = {
  label: "",
  bedrooms: "",
  bathrooms: "",
  squareFeet: "",
  monthlyRent: "",
  occupied: false,
};

export function UnitFormModal({ propertyId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
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
    setOpen(false);
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
    setErrors({});
    setSubmitting(true);

    try {
      const payload = {
        label: parsed.data.label,
        bedrooms: parsed.data.bedrooms ? Number(parsed.data.bedrooms) : null,
        bathrooms: parsed.data.bathrooms ? Number(parsed.data.bathrooms) : null,
        squareFeet: parsed.data.squareFeet
          ? Number(parsed.data.squareFeet)
          : null,
        monthlyRent: parsed.data.monthlyRent
          ? Number(parsed.data.monthlyRent)
          : null,
        occupied: parsed.data.occupied,
      };

      const res = await fetch(`/api/properties/${propertyId}/units`, {
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
          (body as { error?: string })?.error ?? "Failed to save unit",
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
        data-testid={`add-unit-error-${name}`}
        className="text-xs text-danger mt-1"
      >
        {errors[name]}
      </p>
    );
  }

  return (
    <>
      <button
        type="button"
        data-testid="add-unit-button"
        onClick={() => setOpen(true)}
        className="pf-btn pf-btn-primary min-h-11 px-4"
      >
        + Add unit
      </button>

      <Modal
        open={open}
        onClose={close}
        title="Add unit"
        testId="add-unit-modal"
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-body">Label</span>
            <input
              data-testid="add-unit-label"
              className="pf-input min-h-11"
              placeholder="Unit 1"
              value={form.label}
              onChange={(e) => set("label", e.target.value)}
            />
            {fieldError("label")}
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-body">Bedrooms</span>
              <input
                data-testid="add-unit-bedrooms"
                inputMode="numeric"
                className="pf-input min-h-11"
                value={form.bedrooms}
                onChange={(e) => set("bedrooms", e.target.value)}
              />
              {fieldError("bedrooms")}
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-body">Bathrooms</span>
              <input
                data-testid="add-unit-bathrooms"
                inputMode="decimal"
                className="pf-input min-h-11"
                value={form.bathrooms}
                onChange={(e) => set("bathrooms", e.target.value)}
              />
              {fieldError("bathrooms")}
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-body">Square feet</span>
              <input
                data-testid="add-unit-square-feet"
                inputMode="numeric"
                className="pf-input min-h-11"
                value={form.squareFeet}
                onChange={(e) => set("squareFeet", e.target.value)}
              />
              {fieldError("squareFeet")}
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-body">Monthly rent</span>
              <input
                data-testid="add-unit-monthly-rent"
                inputMode="decimal"
                className="pf-input min-h-11"
                value={form.monthlyRent}
                onChange={(e) => set("monthlyRent", e.target.value)}
              />
              {fieldError("monthlyRent")}
            </label>
          </div>

          <label className="flex items-center gap-2 min-h-11">
            <input
              type="checkbox"
              data-testid="add-unit-occupied"
              checked={form.occupied}
              onChange={(e) => set("occupied", e.target.checked)}
              className="w-5 h-5"
            />
            <span className="text-sm text-body">Currently occupied</span>
          </label>

          {serverError ? (
            <p
              data-testid="add-unit-server-error"
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
              data-testid="add-unit-submit"
              disabled={submitting}
              className="pf-btn pf-btn-primary min-h-11 px-4 disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Save unit"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
