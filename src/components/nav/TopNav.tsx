"use client";
import Link from "next/link";

export function TopNav() {
  return (
    <header
      data-testid="top-nav"
      className="sticky top-0 z-30 pf-safe-top w-full bg-bg/85 backdrop-blur border-b border-border"
    >
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-heading">
          <span className="inline-block w-7 h-7 rounded bg-primary/20 text-primary grid place-items-center">P</span>
          <span>PropFlow</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/finances?tab=record"
            className="pf-btn pf-btn-primary text-sm h-9 min-h-9 px-3"
            data-testid="top-record-payment"
          >
            <span aria-hidden>＋</span>
            <span className="hidden sm:inline">Record Payment</span>
            <span className="sm:hidden">Pay</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
