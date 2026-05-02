"use client";
import { useState } from "react";
import { APP_VERSION, RELEASE_DATE } from "@/lib/version";
import { ChangelogModal } from "./ChangelogModal";

export function Footer() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <footer
        data-testid="footer"
        className="mt-12 mb-24 md:mb-6 px-4 py-3 flex items-center justify-center gap-2"
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          data-testid="version-badge"
          aria-label={`PropFlow version ${APP_VERSION}, click to open changelog`}
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all hover:border-[var(--primary)] hover:text-[var(--primary)]"
          style={{
            color: "var(--muted)",
            borderColor: "var(--border)",
            background: "var(--surface)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: "var(--success)" }}
          />
          v{APP_VERSION} · {RELEASE_DATE}
        </button>
      </footer>
      {open ? <ChangelogModal onClose={() => setOpen(false)} /> : null}
    </>
  );
}
