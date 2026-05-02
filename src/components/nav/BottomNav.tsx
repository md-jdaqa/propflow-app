"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavOrder } from "./NavOrderProvider";
import { NavIcon } from "./NavIcon";
import { cn } from "@/lib/cn";
import { BOTTOM_NAV_MAX } from "./links";

export function BottomNav() {
  const pathname = usePathname();
  const { bottomLinks } = useNavOrder();
  const visible = bottomLinks.slice(0, BOTTOM_NAV_MAX);

  return (
    <nav
      data-testid="bottom-nav"
      className="fixed bottom-0 inset-x-0 z-30 md:hidden pf-safe-bottom border-t"
      style={{
        background: "color-mix(in srgb, var(--surface) 95%, transparent)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderColor: "var(--border)",
      }}
    >
      <ul className={`grid px-1`} style={{ gridTemplateColumns: `repeat(${visible.length}, 1fr)` }}>
        {visible.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== "/" && pathname.startsWith(link.href));
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                data-testid={link.testId}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center min-h-touch py-2 text-[10px] gap-1 font-medium transition-all duration-150 rounded-xl mx-0.5",
                  active
                    ? "text-[var(--primary)]"
                    : "text-[var(--muted)] active:text-[var(--body)]",
                )}
              >
                <span
                  className={cn(
                    "w-8 h-6 rounded-lg flex items-center justify-center transition-all duration-200",
                    active ? "bg-[var(--primary-muted)]" : "",
                  )}
                >
                  <NavIcon name={link.icon} size={17} strokeWidth={active ? 2.5 : 1.75} />
                </span>
                <span>{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
