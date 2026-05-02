"use client";
import Link from "next/link";
import { MapPin, Calendar, Wrench, MessageSquare, CreditCard } from "lucide-react";
import { Card } from "@/components/ui/Card";

const TENANT = {
  name: "Carlos Rivera",
  address: "406 Oak St",
  unit: "Unit 2A",
  nextRent: { amount: 1_900, due: "June 1, 2026" },
  leaseEnd: "Oct 31, 2026",
  openMaintenance: 1,
  unreadMessages: 2,
};

export function TenantDashboard() {
  return (
    <div className="px-4 sm:px-6 py-5 max-w-2xl mx-auto space-y-4">
      {/* Welcome */}
      <div className="space-y-0.5">
        <h1 className="text-xl font-bold text-heading">
          Hi, {TENANT.name.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-muted flex items-center gap-1">
          <MapPin size={13} />
          {TENANT.address}, {TENANT.unit}
        </p>
      </div>

      {/* Rent due card */}
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted mb-1">
              Next Rent Due
            </p>
            <p className="text-2xl font-bold text-heading">
              ${TENANT.nextRent.amount.toLocaleString()}
            </p>
            <p className="text-sm text-muted mt-0.5">Due {TENANT.nextRent.due}</p>
          </div>
          <span
            className="mt-1 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
            style={{
              background: "var(--success-muted)",
              color: "var(--success)",
            }}
          >
            On Time
          </span>
        </div>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <div
          className="pf-card flex flex-col items-center text-center gap-1 py-3"
          style={{ padding: "0.75rem" }}
        >
          <Calendar size={18} style={{ color: "var(--primary)" }} />
          <p className="text-[10px] text-muted leading-tight">Lease Ends</p>
          <p className="text-xs font-semibold text-heading leading-tight">
            Oct 31, 2026
          </p>
        </div>

        <div
          className="pf-card flex flex-col items-center text-center gap-1"
          style={{ padding: "0.75rem" }}
        >
          <Wrench size={18} style={{ color: "var(--warning)" }} />
          <p className="text-[10px] text-muted leading-tight">Open Requests</p>
          <p className="text-xl font-bold" style={{ color: "var(--warning)" }}>
            {TENANT.openMaintenance}
          </p>
        </div>

        <div
          className="pf-card flex flex-col items-center text-center gap-1"
          style={{ padding: "0.75rem" }}
        >
          <MessageSquare size={18} style={{ color: "var(--secondary)" }} />
          <p className="text-[10px] text-muted leading-tight">Unread Msgs</p>
          <p className="text-xl font-bold" style={{ color: "var(--secondary)" }}>
            {TENANT.unreadMessages}
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <Card>
        <p className="text-xs font-medium uppercase tracking-wide text-muted mb-3">
          Quick Actions
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/payments"
            className="pf-btn pf-btn-primary text-sm flex items-center gap-2 whitespace-nowrap flex-shrink-0"
          >
            <CreditCard size={15} />
            Pay Rent
          </Link>
          <Link
            href="/maintenance"
            className="pf-btn pf-btn-secondary text-sm flex items-center gap-2 whitespace-nowrap flex-shrink-0"
          >
            <Wrench size={15} />
            Submit Maintenance
          </Link>
          <Link
            href="/messages"
            className="pf-btn pf-btn-secondary text-sm flex items-center gap-2 whitespace-nowrap flex-shrink-0"
          >
            <MessageSquare size={15} />
            Message Landlord
          </Link>
        </div>
      </Card>
    </div>
  );
}
