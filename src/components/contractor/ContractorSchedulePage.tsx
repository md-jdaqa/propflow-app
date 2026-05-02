"use client";
import { useState } from "react";
import { CalendarDays, Info } from "lucide-react";

interface ScheduledJob {
  id: string;
  description: string;
  property: string;
  dueDate: string; // "YYYY-MM-DD"
}

const SCHEDULED_JOBS: ScheduledJob[] = [
  {
    id: "MR-001",
    description: "Kitchen faucet dripping",
    property: "406 Oak St · Unit 2A",
    dueDate: "2026-05-10",
  },
  {
    id: "MR-002",
    description: "HVAC annual inspection",
    property: "880 Airport Blvd",
    dueDate: "2026-05-15",
  },
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

function getDays(startDate: Date, count: number): Date[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    return d;
  });
}

function toDateString(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function ContractorSchedulePage() {
  const [showContactMessage, setShowContactMessage] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekDays = getDays(today, 7);

  // Build a map: dateString → jobs
  const jobsByDate = SCHEDULED_JOBS.reduce<Record<string, ScheduledJob[]>>((acc, job) => {
    if (!acc[job.dueDate]) acc[job.dueDate] = [];
    acc[job.dueDate].push(job);
    return acc;
  }, {});

  return (
    <div className="pb-24">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays size={20} style={{ color: "var(--primary)" }} />
        <h1 className="text-xl font-bold" style={{ color: "var(--heading)" }}>Schedule</h1>
      </div>

      <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
        Next 7 days — {MONTH_NAMES[today.getMonth()]} {today.getDate()}, {today.getFullYear()}
      </p>

      {/* Week view */}
      <div className="space-y-2">
        {weekDays.map((day) => {
          const dateStr = toDateString(day);
          const dayJobs = jobsByDate[dateStr] ?? [];
          const isToday = dateStr === toDateString(today);

          return (
            <div
              key={dateStr}
              className="pf-card"
              style={{
                padding: "0.875rem 1rem",
                borderColor: isToday ? "var(--primary)" : "var(--border)",
                boxShadow: isToday ? "0 0 0 1px var(--primary)" : undefined,
              }}
            >
              <div className="flex items-start gap-3">
                {/* Day label */}
                <div className="flex-shrink-0 w-12 text-center">
                  <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                    {DAY_NAMES[day.getDay()]}
                  </p>
                  <p
                    className="text-lg font-bold leading-none mt-0.5"
                    style={{ color: isToday ? "var(--primary)" : "var(--heading)" }}
                  >
                    {day.getDate()}
                  </p>
                  {isToday && (
                    <p className="text-xs font-medium mt-0.5" style={{ color: "var(--primary)" }}>
                      Today
                    </p>
                  )}
                </div>

                {/* Jobs for this day */}
                <div className="flex-1 min-w-0">
                  {dayJobs.length === 0 ? (
                    <p className="text-sm" style={{ color: "var(--muted)" }}>—</p>
                  ) : (
                    <div className="space-y-1.5">
                      {dayJobs.map((job) => (
                        <div key={job.id}>
                          <p className="text-sm font-medium" style={{ color: "var(--body)" }}>
                            {job.description}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                            {job.property} · <span className="font-mono">{job.id}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Request new slot */}
      <div className="mt-5">
        <button
          className="pf-btn pf-btn-secondary w-full whitespace-nowrap flex-shrink-0"
          onClick={() => setShowContactMessage((v) => !v)}
          style={{ minHeight: "44px" }}
        >
          <CalendarDays size={16} />
          Request New Slot
        </button>

        {showContactMessage && (
          <div
            className="mt-3 p-4 rounded-xl flex items-start gap-3"
            style={{
              background: "rgba(79,110,247,0.08)",
              border: "1px solid rgba(79,110,247,0.2)",
            }}
          >
            <Info size={16} style={{ color: "var(--primary)", flexShrink: 0, marginTop: "2px" }} />
            <p className="text-sm" style={{ color: "var(--body)" }}>
              Contact your property manager to schedule a new time slot. Reach Arif at{" "}
              <a href="tel:718-555-0100" style={{ color: "var(--primary)" }}>
                718-555-0100
              </a>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
