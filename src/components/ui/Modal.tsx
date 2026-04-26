"use client";
import { useEffect, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  testId?: string;
  /** mobile bottom sheet vs centered desktop dialog */
  bottomSheetOnMobile?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  testId,
  bottomSheetOnMobile = true,
}: ModalProps) {
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

  const sheet = bottomSheetOnMobile;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      data-testid={testId}
      className="fixed inset-0 z-40 bg-black/60 grid"
      onClick={onClose}
      style={{ alignItems: sheet ? "end" : "center", justifyItems: "center" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={
          "pf-card w-full max-w-lg max-h-[92vh] overflow-auto " +
          (sheet ? "rounded-b-none md:rounded-lg md:my-auto" : "")
        }
      >
        <div className="flex items-center justify-between mb-3 sticky top-0 bg-surface pt-1">
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
        {children}
      </div>
    </div>
  );
}
