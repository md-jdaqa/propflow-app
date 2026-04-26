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
        className="mt-12 mb-20 md:mb-6 px-4 py-3 flex items-center justify-center gap-2 text-xs text-muted"
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          data-testid="version-badge"
          className="hover:text-body transition"
          aria-label={`PropFlow version ${APP_VERSION}, click to open changelog`}
        >
          v{APP_VERSION} · {RELEASE_DATE}
        </button>
      </footer>
      {open ? <ChangelogModal onClose={() => setOpen(false)} /> : null}
    </>
  );
}
