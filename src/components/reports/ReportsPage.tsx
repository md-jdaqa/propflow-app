"use client";
import { useState } from "react";
import { BarChart2, Download, FileText, TrendingUp, Building2, DollarSign, Wrench, Sparkles, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: string;
  schedule?: string;
}

const REPORTS: ReportCard[] = [
  {
    id: "rent-roll",
    title: "Rent Roll",
    description: "All units, tenants, lease dates, rent amounts, and current status.",
    icon: Building2,
    category: "Properties",
    schedule: "Monthly",
  },
  {
    id: "income-expense",
    title: "Income & Expense",
    description: "P&L by property and category — ready for Schedule E.",
    icon: DollarSign,
    category: "Financials",
    schedule: "Monthly",
  },
  {
    id: "owner-statement",
    title: "Owner Statement",
    description: "Net operating income summary per property — shareable with co-owners.",
    icon: TrendingUp,
    category: "Financials",
    schedule: "Monthly",
  },
  {
    id: "tax-summary",
    title: "Tax Summary (Schedule E)",
    description: "IRS Schedule E categorized income and expenses. Export to CPA.",
    icon: FileText,
    category: "Tax",
    schedule: "Annual",
  },
  {
    id: "maintenance-log",
    title: "Maintenance Log",
    description: "All requests, resolution times, contractor costs by property.",
    icon: Wrench,
    category: "Operations",
    schedule: "Monthly",
  },
  {
    id: "occupancy",
    title: "Occupancy Report",
    description: "Occupancy rate trend, vacancy days, and turnover cost per unit.",
    icon: BarChart2,
    category: "Properties",
  },
  {
    id: "custom",
    title: "Custom AI Report",
    description: "Build any report with AI — just describe what you need.",
    icon: Sparkles,
    category: "AI",
  },
];

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  Properties: { bg: "rgba(79,110,247,0.1)",  color: "var(--primary)" },
  Financials:  { bg: "rgba(14,165,160,0.1)",  color: "var(--secondary)" },
  Tax:         { bg: "rgba(234,179,8,0.1)",   color: "#ca8a04" },
  Operations:  { bg: "rgba(22,163,74,0.1)",   color: "var(--success)" },
  AI:          { bg: "linear-gradient(135deg, rgba(79,110,247,0.1), rgba(14,165,160,0.1))", color: "var(--primary)" },
};

type GenerateState = "idle" | "generating" | "ready";

export function ReportsPage() {
  // Report generation state: idle → generating → ready
  const [generateState, setGenerateState] = useState<Record<string, GenerateState>>({});

  // Custom AI report prompt
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [customPromptText, setCustomPromptText] = useState("");

  function handleGenerate(reportId: string) {
    setGenerateState((prev) => ({ ...prev, [reportId]: "generating" }));
    setTimeout(() => {
      setGenerateState((prev) => ({ ...prev, [reportId]: "ready" }));
    }, 1000);
  }

  function getExportLabel(reportId: string): string {
    const state = generateState[reportId] ?? "idle";
    if (state === "generating") return "Generating...";
    if (state === "ready") return "✓ Download PDF";
    return "Export";
  }

  function getExportDisabled(reportId: string): boolean {
    return generateState[reportId] === "generating";
  }

  return (
    <div data-testid="reports-page" className="space-y-5 pb-24 md:pb-6">
      <header className="flex items-start justify-between pt-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--heading)", letterSpacing: "-0.02em" }}>
            Reports
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            Owner statements · Schedule E · rent rolls · custom AI reports
          </p>
        </div>
      </header>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "YTD Income",   value: "$47,200", color: "var(--success)" },
          { label: "YTD Expenses", value: "$12,840", color: "var(--danger)" },
          { label: "Net Operating", value: "$34,360", color: "var(--body)" },
        ].map((s) => (
          <Card key={s.label} testId={`report-stat-${s.label}`}>
            <p className="text-xs" style={{ color: "var(--muted)" }}>{s.label}</p>
            <p className="text-xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Custom AI prompt (shown when custom card button clicked) */}
      {showCustomPrompt && (
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{
            background: "linear-gradient(135deg, rgba(79,110,247,0.08) 0%, rgba(14,165,160,0.05) 100%)",
            border: "1.5px solid rgba(79,110,247,0.25)",
          }}
        >
          <div className="flex items-center gap-2">
            <Sparkles size={14} style={{ color: "var(--primary)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--primary)" }}>Custom AI Report</span>
          </div>
          <input
            type="text"
            className="pf-input w-full text-sm py-2"
            placeholder='e.g. "Show me all expenses over $500 by property for Q1 2026"'
            value={customPromptText}
            onChange={(e) => setCustomPromptText(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="pf-btn pf-btn-primary text-sm flex items-center gap-1.5"
              onClick={() => handleGenerate("custom")}
              disabled={!customPromptText.trim() || getExportDisabled("custom")}
            >
              <Sparkles size={13} />
              {generateState["custom"] === "generating" ? "Generating..." : generateState["custom"] === "ready" ? "✓ Download PDF" : "Generate"}
            </button>
            <button
              type="button"
              className="pf-btn pf-btn-secondary text-sm"
              onClick={() => {
                setShowCustomPrompt(false);
                setCustomPromptText("");
                setGenerateState((prev) => ({ ...prev, custom: "idle" }));
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Report grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {REPORTS.map((report) => {
          const catStyle = CATEGORY_COLORS[report.category] ?? CATEGORY_COLORS.Properties;
          const Icon = report.icon;
          const isCustom = report.id === "custom";
          const exportLabel = getExportLabel(report.id);
          const isGenerating = generateState[report.id] === "generating";
          const isReady = generateState[report.id] === "ready";

          return (
            <Card key={report.id} testId={`report-card-${report.id}`}>
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: catStyle.bg }}
                >
                  <Icon size={18} style={{ color: catStyle.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold" style={{ color: "var(--heading)" }}>{report.title}</p>
                    <span
                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: catStyle.bg, color: catStyle.color }}
                    >
                      {report.category}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{report.description}</p>
                  {report.schedule && (
                    <p className="text-[10px] mt-1" style={{ color: "var(--muted)" }}>
                      Auto-generated: {report.schedule}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                {isCustom ? (
                  <button
                    type="button"
                    className="pf-btn pf-btn-primary text-xs flex-1 flex items-center justify-center gap-1.5"
                    onClick={() => setShowCustomPrompt((v) => !v)}
                  >
                    <Sparkles size={11} /> Ask AI
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="pf-btn pf-btn-secondary text-xs flex-1 flex items-center justify-center gap-1.5"
                    >
                      <BarChart2 size={11} /> View
                    </button>
                    <button
                      type="button"
                      className="pf-btn pf-btn-secondary text-xs flex-1 flex items-center justify-center gap-1.5"
                      onClick={() => handleGenerate(report.id)}
                      disabled={isGenerating}
                      style={isReady ? { color: "var(--success)", borderColor: "var(--success)" } : {}}
                    >
                      <Download size={11} />
                      {exportLabel}
                    </button>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
