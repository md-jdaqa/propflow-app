"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  CreditCard,
  Wrench,
  MessageSquare,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/tenant/home",        label: "Home",        icon: Home },
  { href: "/tenant/lease",       label: "My Lease",    icon: FileText },
  { href: "/tenant/payments",    label: "Payments",    icon: CreditCard },
  { href: "/tenant/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/tenant/messages",    label: "Messages",    icon: MessageSquare },
] as const;

export default function TenantPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-bg text-body">
      {/* Top nav */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 h-14 border-b"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center gap-2">
          {/* Logo mark */}
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
            style={{ background: "var(--primary)" }}
          >
            P
          </div>
          <span className="font-semibold text-sm text-heading leading-none">
            PropFlow
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium leading-none"
            style={{
              background: "var(--primary-muted)",
              color: "var(--primary)",
            }}
          >
            Tenant Portal
          </span>
        </div>

        {/* Tenant avatar */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted hidden sm:block">Carlos Rivera</span>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
            style={{ background: "var(--primary)" }}
          >
            CR
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 pb-24">
        {children}
      </main>

      {/* Bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t safe-area-inset-bottom"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-stretch h-16">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 min-w-0 transition-colors"
                style={{
                  color: active ? "var(--primary)" : "var(--muted)",
                }}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.5 : 1.8}
                  aria-hidden="true"
                />
                <span className="text-[10px] font-medium truncate leading-none">
                  {label}
                </span>
                {active && (
                  <span
                    className="absolute bottom-0 w-8 h-0.5 rounded-full"
                    style={{ background: "var(--primary)" }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
