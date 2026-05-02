"use client";
/**
 * nav-order.ts
 * Persists the user's custom nav link order in localStorage.
 * Falls back to default (0..N-1) when nothing is saved.
 */

import { ALL_NAV_LINKS } from "@/components/nav/links";

const LS_KEY = "propflow-nav-order";

export function loadNavOrder(): number[] {
  if (typeof window === "undefined") return defaultOrder();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultOrder();
    const parsed = JSON.parse(raw) as number[];
    // Validate: must contain exactly the right indices
    const n = ALL_NAV_LINKS.length;
    const valid = Array.isArray(parsed) && parsed.length === n &&
      new Set(parsed).size === n &&
      parsed.every((i) => typeof i === "number" && i >= 0 && i < n);
    return valid ? parsed : defaultOrder();
  } catch {
    return defaultOrder();
  }
}

export function saveNavOrder(order: number[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(order));
}

export function resetNavOrder(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LS_KEY);
}

function defaultOrder(): number[] {
  return ALL_NAV_LINKS.map((_, i) => i);
}

/** Move item at `from` index to `to` index in the order array */
export function reorder(order: number[], from: number, to: number): number[] {
  const next = [...order];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
