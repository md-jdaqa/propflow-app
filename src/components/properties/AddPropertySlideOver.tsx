"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { SlideOver } from "@/components/ui/SlideOver";

interface Props {
  open: boolean;
  onClose: () => void;
}

const PropertyTypeEnum = z.enum([
  "RESIDENTIAL_LTR",
  "RESIDENTIAL_STR",
  "COMMERCIAL",
  "MIXED_USE",
]);

const ClientSchema = z.object({
  name: z.string().min(1, "Required"),
  propertyType: PropertyTypeEnum,
  purchasePrice: z.string().optional(),
  purchaseDate: z.string().optional(),
  landValue: z.string().optional(),
  addressLine1: z.string().min(1, "Required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "Required"),
  state: z.string().min(1, "Required"),
  postalCode: z.string().min(1, "Required"),
  country: z.string().min(1, "Required"),
  notes: z.string().optional(),
});

type FormState = z.infer<typeof ClientSchema>;

const INITIAL: FormState = {
  name: "",
  propertyType: "RESIDENTIAL_LTR",
  purchasePrice: "",
  purchaseDate: "",
  landValue: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
  notes: "",
};

export function AddPropertySlideOver({ open, onClose }: Props) {
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
    setErrors({});
    setSubmitting(true);

    try {
      const payload = {
        name: parsed.data.name,
        propertyType: parsed.data.propertyType,
        purchasePrice: parsed.data.purchasePrice
          ? Number(parsed.data.purchasePrice)
          : null,
        purchaseDate: parsed.data.purchaseDate || null,
        landValue: parsed.data.landValue ? Number(parsed.data.landValue) : null,
        addressLine1: parsed.data.addressLine1,
        addressLine2: parsed.data.addressLine2 || null,
        city: parsed.data.city,
        state: parsed.data.state,
        postalCode: parsed.data.postalCode,
        country: parsed.data.country || "US",
        notes: parsed.data.notes || null,
      };

      const res = await fetch("/api/properties", {
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
          (body as { error?: string })?.error ?? "Failed to save property",
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
        data-testid={`add-property-error-${name}`}
        className="text-xs text-danger mt-1"
      >
        {errors[name]}
      </p>
    );
  }

  return (
    <SlideOver
      open={open}
      onClose={close}
      title="Add property"
      testId="add-property-slideover"
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-heading">Basic</h3>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-body">Name</span>
            <input
              data-testid="add-property-name"
              className="pf-input min-h-11"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
            {fieldError("name")}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-body">Property type</span>
            <select
              data-testid="add-property-type"
              className="pf-input min-h-11"
              value={form.propertyType}
              onChange={(e) =>
                set("propertyType", e.target.value as FormState["propertyType"])
              }
            >
              <option value="RESIDENTIAL_LTR">Residential — long-term</option>
              <option value="RESIDENTIAL_STR">Residential — short-term</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="MIXED_USE">Mixed-use</option>
            </select>
            {fieldError("propertyType")}
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-body">Purchase price</span>
              <input
                data-testid="add-property-purchase-price"
                inputMode="decimal"
                className="pf-input min-h-11"
                value={form.purchasePrice}
                onChange={(e) => set("purchasePrice", e.target.value)}
              />
              {fieldError("purchasePrice")}
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-body">Purchase date</span>
              <input
                type="date"
                data-testid="add-property-purchase-date"
                className="pf-input min-h-11"
                value={form.purchaseDate}
                onChange={(e) => set("purchaseDate", e.target.value)}
              />
              {fieldError("purchaseDate")}
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-body">Land value</span>
            <input
              data-testid="add-property-land-value"
              inputMode="decimal"
              className="pf-input min-h-11"
              value={form.landValue}
              onChange={(e) => set("landValue", e.target.value)}
            />
            {fieldError("landValue")}
          </label>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-heading">Address</h3>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-body">Address line 1</span>
            <input
              data-testid="add-property-address-line1"
              className="pf-input min-h-11"
              value={form.addressLine1}
              onChange={(e) => set("addressLine1", e.target.value)}
            />
            {fieldError("addressLine1")}
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-body">Address line 2</span>
            <input
              data-testid="add-property-address-line2"
              className="pf-input min-h-11"
              value={form.addressLine2}
              onChange={(e) => set("addressLine2", e.target.value)}
            />
            {fieldError("addressLine2")}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-body">City</span>
              <input
                data-testid="add-property-city"
                className="pf-input min-h-11"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
              {fieldError("city")}
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-body">State</span>
              <input
                data-testid="add-property-state"
                className="pf-input min-h-11"
                value={form.state}
                onChange={(e) => set("state", e.target.value)}
              />
              {fieldError("state")}
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-body">Postal code</span>
              <input
                data-testid="add-property-postal-code"
                className="pf-input min-h-11"
                value={form.postalCode}
                onChange={(e) => set("postalCode", e.target.value)}
              />
              {fieldError("postalCode")}
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-body">Country</span>
              <input
                data-testid="add-property-country"
                className="pf-input min-h-11"
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
              />
              {fieldError("country")}
            </label>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-heading">Notes</h3>
          <textarea
            data-testid="add-property-notes"
            rows={3}
            className="pf-input"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
          {fieldError("notes")}
        </section>

        {serverError ? (
          <p
            data-testid="add-property-server-error"
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
            data-testid="add-property-submit"
            disabled={submitting}
            className="pf-btn pf-btn-primary min-h-11 px-4 disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save property"}
          </button>
        </div>
      </form>
    </SlideOver>
  );
}
