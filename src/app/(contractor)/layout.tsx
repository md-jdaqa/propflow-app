"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wrench, Building2, Calendar, MessageSquare } from "lucide-react";

const CONTRACTOR_NAME = "Marcus Rivera";

const NAV_LINKS = [
  { href: "/contractor/jobs",       label: "Jobs",       icon: <Wrench      size={20} /> },
  { href: "/contractor/properties", label: "Properties", icon: <Building2   size={20} /> },
  { href: "/contractor/schedule",   label: "Schedule",   icon: <Calendar    size={20} /> },
  { href: "/contractor/messages",   label: "Messages",   icon: <MessageSquare size={20} /> },
];

export default function ContractorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--body)" }}>
      {/* Top Nav */}
      <header
        className="sticky top-0 z-30 w-full border-b"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="mx-auto max-w-2xl px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className="inline-flex w-7 h-7 rounded items-center justify-center text-sm font-bold"
              style={{ background: "rgba(79,110,247,0.15)", color: "var(--primary)" }}
            >
              P
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-semibold text-sm" style={{ color: "var(--heading)" }}>
                PropFlow
              </span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                Contractor Portal
              </span>
            </div>
          </div>
          <div
            className="text-sm font-medium px-3 py-1 rounded-full"
            style={{
              background: "rgba(79,110,247,0.1)",
              color: "var(--primary)",
              border: "1px solid rgba(79,110,247,0.2)",
            }}
          >
            {CONTRACTOR_NAME}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-2xl px-4 pt-4">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav
        className="fixed bottom-0 inset-x-0 z-30 border-t"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          backdropFilter: "blur(12px)",
        }}
      >
        <ul className="grid grid-cols-4 mx-auto max-w-2xl">
          {NAV_LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className="flex flex-col items-center justify-center py-2 gap-0.5 min-h-[56px] text-xs transition-colors"
                  style={{ color: active ? "var(--primary)" : "var(--muted)" }}
                >
                  <span aria-hidden>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
