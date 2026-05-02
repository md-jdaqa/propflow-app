import {
  RentCollectedCard,
  OutstandingCard,
  OccupancyCard,
  RecentPaymentsCard,
  UncategorizedCard,
  UpcomingCard,
  TaxReadinessCard,
} from "@/components/dashboard/DashboardCards";
import Link from "next/link";
import { Sparkles, LayoutDashboard, User, Wrench, ArrowRight, CheckCircle2 } from "lucide-react";

export default function DashboardPage() {
  return (
    <div data-testid="dashboard-page" className="space-y-5 pb-24 md:pb-6">

      {/* Page header */}
      <header className="flex items-start justify-between pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{
                background: "var(--primary-muted)",
                color: "var(--primary)",
              }}
            >
              <Sparkles size={10} />
              Live
            </span>
          </div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--heading)", letterSpacing: "-0.02em" }}
          >
            Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            Brooklyn portfolio · May 2026
          </p>
        </div>
      </header>

      {/* KPI grid — 4 stat cards top row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <RentCollectedCard />
        <OutstandingCard />
        <OccupancyCard />
        <UncategorizedCard />
      </div>

      {/* Detail row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <RecentPaymentsCard />
        <div className="grid grid-cols-1 gap-3">
          <UpcomingCard />
          <TaxReadinessCard />
        </div>
      </div>

      {/* Portal Links */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <h2
            className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: "var(--muted)" }}
          >
            Portals
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Landlord — current */}
          <div
            className="pf-card flex items-start gap-3 p-4 relative"
            style={{ borderColor: "var(--primary)", borderWidth: "1.5px" }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "var(--primary-muted)", color: "var(--primary)" }}
            >
              <LayoutDashboard size={16} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold" style={{ color: "var(--heading)" }}>
                  Landlord Portal
                </span>
                <span
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--primary-muted)",
                    color: "var(--primary)",
                  }}
                >
                  <CheckCircle2 size={10} strokeWidth={2.5} />
                  You&apos;re here
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                Full property management, finances &amp; reporting
              </p>
            </div>
          </div>

          {/* Tenant Portal */}
          <Link
            href="/tenant/home"
            className="pf-card flex items-start gap-3 p-4 cursor-pointer no-underline block"
            style={{ textDecoration: "none" }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "rgba(34,197,94,0.12)", color: "var(--success)" }}
            >
              <User size={16} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold" style={{ color: "var(--heading)" }}>
                  Tenant Portal
                </span>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(34,197,94,0.12)", color: "var(--success)" }}
                >
                  Preview
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                Rent payments, maintenance requests &amp; documents
              </p>
              <div
                className="flex items-center gap-1 mt-2 text-xs font-medium"
                style={{ color: "var(--success)" }}
              >
                Open portal <ArrowRight size={12} strokeWidth={2.5} />
              </div>
            </div>
          </Link>

          {/* Contractor Portal */}
          <Link
            href="/contractor/jobs"
            className="pf-card flex items-start gap-3 p-4 cursor-pointer no-underline block"
            style={{ textDecoration: "none" }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "rgba(245,158,11,0.12)", color: "var(--warning)" }}
            >
              <Wrench size={16} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold" style={{ color: "var(--heading)" }}>
                  Contractor Portal
                </span>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(245,158,11,0.12)", color: "var(--warning)" }}
                >
                  Preview
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                Job assignments, work orders &amp; invoicing
              </p>
              <div
                className="flex items-center gap-1 mt-2 text-xs font-medium"
                style={{ color: "var(--warning)" }}
              >
                Open portal <ArrowRight size={12} strokeWidth={2.5} />
              </div>
            </div>
          </Link>
        </div>
      </section>

    </div>
  );
}
