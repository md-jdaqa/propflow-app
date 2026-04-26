"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRIMARY_LINKS } from "./links";
import { cn } from "@/lib/cn";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside
      data-testid="sidebar"
      className="hidden md:flex md:fixed md:top-14 md:bottom-0 md:left-0 md:w-60 flex-col border-r border-border bg-surface"
    >
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {PRIMARY_LINKS.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  data-testid={`sidebar-${link.testId}`}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded min-h-touch text-sm",
                    active ? "bg-primary/10 text-primary" : "text-body hover:bg-bg",
                  )}
                >
                  <span aria-hidden className="text-base">{link.icon}</span>
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-3 text-xs text-muted border-t border-border">
        Built for landlords by Arif
      </div>
    </aside>
  );
}
