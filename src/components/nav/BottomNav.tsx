"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRIMARY_LINKS } from "./links";
import { cn } from "@/lib/cn";

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      data-testid="bottom-nav"
      className="fixed bottom-0 inset-x-0 z-30 md:hidden pf-safe-bottom border-t border-border bg-surface/95 backdrop-blur"
    >
      <ul className="grid grid-cols-5">
        {PRIMARY_LINKS.map((link) => {
          const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                data-testid={link.testId}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center min-h-touch py-2 text-xs gap-0.5",
                  active ? "text-primary" : "text-muted",
                )}
              >
                <span aria-hidden className="text-base leading-none">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
