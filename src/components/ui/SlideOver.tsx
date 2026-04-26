"use client";
import { useEffect, type ReactNode } from "react";

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  testId?: string;
  children: ReactNode;
}

/**
 * Right-side panel on desktop; full-height bottom sheet on mobile (<768px).
 */
export function SlideOver({ open, onClose, title, testId, children }: SlideOverProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      data-testid={testId}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-40 bg-black/60"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={
          "absolute bg-surface border border-border " +
          "left-0 right-0 bottom-0 max-h-[92vh] rounded-t-lg " +
          "md:left-auto md:top-0 md:bottom-0 md:right-0 md:w-[28rem] md:max-h-none md:rounded-none " +
          "overflow-auto pf-no-scroll"
        }
      >
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-surface">
          <h2 className="text-lg font-semibold text-heading">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            data-testid={`${testId}-close`}
            className="pf-btn pf-btn-secondary h-9 min-h-9 px-3 text-sm"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
