"use client";
import { useEffect, useState } from "react";

interface Props {
  onClose: () => void;
}

export function ChangelogModal({ onClose }: Props) {
  const [content, setContent] = useState<string>("Loading…");

  useEffect(() => {
    fetch("/api/changelog")
      .then((r) => r.text())
      .then(setContent)
      .catch(() => setContent("Could not load CHANGELOG.md"));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      data-testid="changelog-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Changelog"
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-3"
      onClick={onClose}
    >
      <div
        className="pf-card w-full max-w-2xl max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-heading">Changelog</h2>
          <button
            type="button"
            onClick={onClose}
            data-testid="changelog-close"
            className="pf-btn pf-btn-secondary h-9 min-h-9 px-3 text-sm"
            aria-label="Close changelog"
          >
            ✕
          </button>
        </div>
        <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-body">
{content}
        </pre>
      </div>
    </div>
  );
}
