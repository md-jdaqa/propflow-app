"use client";
import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

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
      className="fixed inset-0 z-40 pf-animate-fade-in"
      style={{
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        display: "grid",
        alignItems: sheet ? "end" : "center",
        justifyItems: "center",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={[
          "w-full max-w-lg max-h-[92vh] overflow-auto pf-scroll",
          "pf-card",
          sheet ? "rounded-b-none md:rounded-2xl md:my-auto pf-animate-slide-up md:pf-animate-scale-in" : "pf-animate-scale-in",
        ].join(" ")}
        style={{ boxShadow: "var(--shadow-modal)" }}
      >
        {/* Drag handle (mobile) */}
        {sheet && (
          <div className="flex justify-center mb-3 md:hidden">
            <div
              className="w-10 h-1 rounded-full"
              style={{ background: "var(--border)" }}
            />
          </div>
        )}

        {/* Header */}
        <div
          className="flex items-center justify-between mb-4 sticky top-0 pb-3 border-b"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <h2
            className="text-base font-semibold"
            style={{ color: "var(--heading)" }}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            data-testid={`${testId}-close`}
            className="pf-btn pf-btn-ghost h-8 min-h-8 w-8 min-w-8 px-0 rounded-lg"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
