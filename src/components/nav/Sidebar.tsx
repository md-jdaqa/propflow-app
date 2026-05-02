"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GripVertical } from "lucide-react";
import { useNavOrder } from "./NavOrderProvider";
import { NavIcon } from "./NavIcon";
import { cn } from "@/lib/cn";

export function Sidebar() {
  const pathname = usePathname();
  const { orderedLinks, moveItem } = useNavOrder();

  // Drag state
  const dragIdx = useRef<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  function onDragStart(e: React.DragEvent, idx: number) {
    dragIdx.current = idx;
    e.dataTransfer.effectAllowed = "move";
  }

  function onDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverIdx(idx);
  }

  function onDrop(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIdx.current !== null && dragIdx.current !== idx) {
      moveItem(dragIdx.current, idx);
    }
    dragIdx.current = null;
    setOverIdx(null);
  }

  function onDragEnd() {
    dragIdx.current = null;
    setOverIdx(null);
  }

  return (
    <aside
      data-testid="sidebar"
      className="hidden md:flex md:fixed md:top-14 md:bottom-0 md:left-0 md:w-60 flex-col border-r"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto pf-scroll" aria-label="Main navigation">
        {orderedLinks.map((link, idx) => {
          const active =
            pathname === link.href ||
            (link.href !== "/" && pathname.startsWith(link.href));
          const isOver = overIdx === idx;

          return (
            <div
              key={link.href}
              draggable
              onDragStart={(e) => onDragStart(e, idx)}
              onDragOver={(e) => onDragOver(e, idx)}
              onDrop={(e) => onDrop(e, idx)}
              onDragEnd={onDragEnd}
              className={cn(
                "group flex items-center rounded-xl transition-all duration-150",
                isOver ? "ring-2 ring-[var(--primary)] ring-offset-1" : "",
              )}
            >
              {/* Drag handle — visible on hover */}
              <span
                className="flex-shrink-0 w-4 flex items-center justify-center opacity-0 group-hover:opacity-30 cursor-grab active:cursor-grabbing transition-opacity duration-150 ml-0.5"
                aria-hidden="true"
              >
                <GripVertical size={12} style={{ color: "var(--muted)" }} />
              </span>

              <Link
                href={link.href}
                data-testid={`sidebar-${link.testId}`}
                className={cn(
                  "flex-1 flex items-center gap-3 px-2 py-2.5 rounded-xl text-sm font-medium min-h-touch transition-all duration-150",
                  active
                    ? "bg-[var(--primary-muted)] text-[var(--primary)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--body)]",
                )}
              >
                {/* Icon */}
                <span
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-150",
                    active
                      ? "bg-[var(--primary)] text-white shadow-sm"
                      : "bg-[var(--surface-2)] group-hover:bg-[var(--border)]",
                  )}
                  style={active ? { boxShadow: "0 2px 6px rgba(79,110,247,0.3)" } : {}}
                >
                  <NavIcon name={link.icon} size={15} strokeWidth={2} />
                </span>
                {link.label}

                {/* Active indicator dot */}
                {active && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--primary)" }}
                  />
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="p-4 border-t text-xs"
        style={{ borderColor: "var(--border-subtle, var(--border))", color: "var(--muted)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
            style={{ background: "var(--primary)" }}
          >
            A
          </div>
          <div>
            <div style={{ color: "var(--body)" }} className="font-medium text-xs">Arif</div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>Clevvar Estate</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
