"use client";
import Link from "next/link";
import { Bell, Plus, Building2 } from "lucide-react";
import { useState } from "react";
import { RecordPaymentModal } from "@/components/modals/RecordPaymentModal";
import { PortalSwitcher } from "@/components/nav/PortalSwitcher";

export function TopNav() {
  const [payOpen, setPayOpen] = useState(false);

  return (
    <>
      <header
        data-testid="top-nav"
        className="sticky top-0 z-30 pf-safe-top w-full border-b border-border"
        style={{
          background: "color-mix(in srgb, var(--bg) 85%, transparent)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 60%, var(--secondary)) 100%)",
                boxShadow: "0 2px 8px rgba(79,110,247,0.35)",
              }}
            >
              <Building2 size={16} className="text-white" />
            </div>
            <span
              className="font-semibold text-heading tracking-tight hidden sm:block"
              style={{ letterSpacing: "-0.01em" }}
            >
              PropFlow
            </span>
          </Link>

          {/* Right actions */}
          <nav className="flex items-center gap-1">
            <PortalSwitcher current="Admin Portal" />
            {/* Notification bell */}
            <button
              type="button"
              aria-label="Notifications"
              className="pf-btn pf-btn-ghost h-9 min-h-9 w-9 min-w-9 px-0 rounded-lg relative"
            >
              <Bell size={17} />
              {/* Unread dot */}
              <span
                className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--primary)" }}
              />
            </button>

            {/* Record Payment */}
            <button
              type="button"
              onClick={() => setPayOpen(true)}
              className="pf-btn pf-btn-primary h-9 min-h-9 px-3 text-sm"
              data-testid="top-record-payment"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Record Payment</span>
              <span className="sm:hidden">Pay</span>
            </button>
          </nav>
        </div>
      </header>

      <RecordPaymentModal open={payOpen} onClose={() => setPayOpen(false)} />
    </>
  );
}
