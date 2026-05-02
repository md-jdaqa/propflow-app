"use client";
/**
 * GlobalAiBar
 * Floating AI command interface — sits on every page.
 * Users type natural-language commands to control the entire app.
 *
 * Examples:
 *   "log a $1500 payment from Jake"
 *   "move properties above dashboard"
 *   "create an emergency maintenance request for broken pipe"
 *   "go to reports"
 *   "send a rent reminder to all tenants"
 */

import {
  useState,
  useRef,
  useEffect,
  type KeyboardEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  AlertCircle,
  ChevronDown,
  Mic,
} from "lucide-react";
import { useNavOrder } from "@/components/nav/NavOrderProvider";
import { ALL_NAV_LINKS } from "@/components/nav/links";

// ── Types ───────────────────────────────────────────────────────────────
interface AiResult {
  action: "navigate" | "open_modal" | "fill_form" | "show_info" | "run_action" | "move_nav" | "search";
  payload: Record<string, unknown>;
  message: string;
}

interface AiEvent {
  role: "user" | "ai" | "system";
  text: string;
  action?: AiResult["action"];
}

// ── Constants ────────────────────────────────────────────────────────────
const EXAMPLES = [
  "Log a $1,500 payment from Jake",
  "Create an emergency maintenance request",
  "Move Properties above Dashboard",
  "Send a rent reminder to all tenants",
  "Show me unpaid invoices this month",
  "Add a new tenant to 406 Oak St",
  "Open a new lease for John Smith",
  "Go to reports",
  "Reconcile bank transactions for April",
  "Show owner portal statements",
  "Set up recurring rent for 406 Oak St",
  "Check budget variance this month",
  "Order background check for new applicant",
  "View team member permissions",
];

// ── Modal opener registry (populated by individual pages) ────────────────
// Pages register their modal openers here so GlobalAiBar can trigger them.
type ModalOpener = (fields?: Record<string, string>) => void;
const modalRegistry: Record<string, ModalOpener> = {};
export function registerModalOpener(modal: string, fn: ModalOpener) {
  modalRegistry[modal] = fn;
}
export function unregisterModalOpener(modal: string) {
  delete modalRegistry[modal];
}

// ── Component ────────────────────────────────────────────────────────────
export function GlobalAiBar() {
  const router = useRouter();
  const { moveItem, orderedLinks } = useNavOrder();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AiEvent[]>([]);
  const [exampleIdx] = useState(() => Math.floor(Math.random() * EXAMPLES.length));

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  // Auto-focus when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  // Scroll history to bottom
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function handler(e: globalThis.KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  async function submit() {
    const cmd = input.trim();
    if (!cmd || loading) return;

    setHistory((h) => [...h, { role: "user", text: cmd }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      let data: AiResult & { error?: string; message?: string };

      try {
        const res = await fetch("/api/ai/command", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: cmd }),
        });

        data = (await res.json()) as AiResult & { error?: string; message?: string };

        if (!res.ok) {
          throw new Error(data.message ?? data.error ?? "AI command failed.");
        }
      } catch {
        // API not available (static hosting) — fall back to client-side keyword nav
        data = clientSideFallback(cmd);
      }

      // Execute the action
      executeAction(data);

      setHistory((h) => [
        ...h,
        { role: "ai", text: data.message, action: data.action },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error.";
      setError(msg);
      setHistory((h) => [...h, { role: "system", text: msg }]);
    } finally {
      setLoading(false);
    }
  }

  function executeAction(result: AiResult) {
    switch (result.action) {
      case "navigate": {
        const href = result.payload.href as string;
        if (href) router.push(href);
        setOpen(false);
        break;
      }

      case "open_modal":
      case "fill_form": {
        const modal = result.payload.modal as string;
        const fields = (result.payload.fields ?? {}) as Record<string, string>;
        if (modal && modalRegistry[modal]) {
          modalRegistry[modal](fields);
          setOpen(false);
        } else {
          // Navigate to the relevant page with a query param so the page opens the modal
          const href = modalToRoute(modal);
          if (href) {
            const params = new URLSearchParams({ modal, ...fields });
            router.push(`${href}?${params.toString()}`);
            setOpen(false);
          }
        }
        break;
      }

      case "move_nav": {
        const fromLabel = result.payload.fromLabel as string;
        const toLabel = result.payload.toLabel as string;
        const fromIdx = orderedLinks.findIndex((l) => l.label.toLowerCase() === fromLabel?.toLowerCase());
        const toIdx = orderedLinks.findIndex((l) => l.label.toLowerCase() === toLabel?.toLowerCase());
        if (fromIdx !== -1 && toIdx !== -1) {
          moveItem(fromIdx, toIdx);
        }
        break;
      }

      case "search": {
        const query = result.payload.query as string;
        if (query) {
          router.push(`/search?q=${encodeURIComponent(query)}`);
          setOpen(false);
        }
        break;
      }

      // show_info and run_action are handled in the history display
      default:
        break;
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        data-testid="global-ai-bar-trigger"
        aria-label="Open AI assistant (⌘K)"
        className="fixed bottom-20 right-4 md:bottom-6 z-40 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
          boxShadow: "0 4px 20px rgba(79,110,247,0.45)",
        }}
      >
        {open ? <X size={18} className="text-white" /> : <Sparkles size={18} className="text-white" />}
      </button>

      {/* Panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel itself */}
          <div
            data-testid="global-ai-bar-panel"
            className="fixed bottom-20 right-4 md:bottom-6 md:right-20 z-50 w-[calc(100vw-2rem)] max-w-md rounded-2xl overflow-hidden flex flex-col"
            style={{
              maxHeight: "70vh",
              background: "var(--surface)",
              border: "1.5px solid rgba(79,110,247,0.3)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-2.5 px-4 py-3 border-b flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(79,110,247,0.1) 0%, rgba(14,165,160,0.06) 100%)",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                }}
              >
                <Sparkles size={13} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: "var(--heading)" }}>
                  PropFlow AI
                </p>
                <p className="text-[11px]" style={{ color: "var(--muted)" }}>
                  Control anything · ⌘K to toggle
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg"
                style={{ color: "var(--muted)" }}
              >
                <ChevronDown size={15} />
              </button>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div
                ref={historyRef}
                className="flex-1 overflow-y-auto px-4 py-3 space-y-3 pf-scroll"
                style={{ minHeight: 0 }}
              >
                {history.map((evt, i) => (
                  <div key={i} className={`flex ${evt.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className="text-sm px-3 py-2 rounded-xl max-w-[85%]"
                      style={
                        evt.role === "user"
                          ? { background: "var(--primary)", color: "#fff" }
                          : evt.role === "system"
                          ? { background: "rgba(239,68,68,0.12)", color: "var(--danger)", border: "1px solid rgba(239,68,68,0.25)" }
                          : { background: "var(--surface-2)", color: "var(--body)", border: "1px solid var(--border)" }
                      }
                    >
                      {evt.role === "ai" && (
                        <span className="text-[10px] font-semibold block mb-1" style={{ color: "var(--primary)" }}>
                          ✦ PropFlow AI
                          {evt.action && (
                            <span className="ml-2 opacity-60 normal-case font-normal">
                              {evt.action}
                            </span>
                          )}
                        </span>
                      )}
                      {evt.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div
                      className="text-sm px-3 py-2 rounded-xl flex items-center gap-2"
                      style={{ background: "var(--surface-2)", color: "var(--muted)" }}
                    >
                      <Loader2 size={13} className="animate-spin" />
                      Thinking…
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty state */}
            {history.length === 0 && !loading && (
              <div className="px-4 py-3 flex-1">
                <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>Try asking:</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {EXAMPLES.slice(exampleIdx, exampleIdx + 4).map((ex, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setInput(ex)}
                      className="text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors"
                      style={{
                        background: "var(--surface-2)",
                        color: "var(--body)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div
                className="mx-4 mb-2 flex items-start gap-2 rounded-lg px-3 py-2"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                <AlertCircle size={13} className="flex-shrink-0 mt-0.5" style={{ color: "var(--danger)" }} />
                <p className="text-xs" style={{ color: "var(--danger)" }}>{error}</p>
              </div>
            )}

            {/* Input */}
            <div
              className="flex items-end gap-2 p-3 border-t flex-shrink-0"
              style={{ borderColor: "var(--border)" }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder={`"${EXAMPLES[exampleIdx]}"`}
                disabled={loading}
                className="pf-input flex-1 resize-none py-2 text-sm"
                style={{ minHeight: "40px", maxHeight: "120px", fontSize: "14px" }}
              />
              <button
                type="button"
                onClick={() => submit()}
                disabled={!input.trim() || loading}
                className="pf-btn pf-btn-primary flex-shrink-0 p-2.5 rounded-xl"
                data-testid="global-ai-bar-submit"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ── Client-side fallback when API is unavailable (static hosting) ────────
function clientSideFallback(cmd: string): AiResult {
  const lower = cmd.toLowerCase();

  // Navigation keywords → route map
  const navMap: Array<[string[], string, string]> = [
    [["dashboard", "home"], "/", "Navigating to Dashboard"],
    [["properties", "property"], "/properties", "Navigating to Properties"],
    [["tenant", "tenants"], "/tenants", "Navigating to Tenants"],
    [["finances", "finance", "payment", "payments", "invoice"], "/finances", "Navigating to Finances"],
    [["maintenance", "repair", "work order"], "/maintenance", "Navigating to Maintenance"],
    [["lease", "leases"], "/leases", "Navigating to Leases"],
    [["message", "messages", "chat"], "/messages", "Navigating to Messages"],
    [["report", "reports"], "/reports", "Navigating to Reports"],
    [["listing", "listings"], "/listings", "Navigating to Listings"],
    [["application", "applications"], "/applications", "Navigating to Applications"],
    [["inspection", "inspections"], "/inspections", "Navigating to Inspections"],
    [["budget"], "/budget", "Navigating to Budget"],
    [["bank", "reconcil"], "/bank-reconciliation", "Navigating to Bank Reconciliation"],
    [["task", "tasks"], "/tasks", "Navigating to Tasks"],
    [["team", "member"], "/team", "Navigating to Team"],
    [["eviction", "evictions"], "/evictions", "Navigating to Evictions"],
    [["owner portal", "owner"], "/owner-portal", "Navigating to Owner Portal"],
    [["recurring"], "/recurring-payments", "Navigating to Recurring Payments"],
  ];

  for (const [keywords, href, message] of navMap) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return { action: "navigate", payload: { href }, message };
    }
  }

  return {
    action: "show_info",
    payload: {},
    message:
      "AI commands require a live server. On this static preview, navigation commands work — try \"Go to tenants\" or \"Open maintenance\".",
  };
}

// ── Helper: modal → page route mapping ──────────────────────────────────
function modalToRoute(modal: string): string | null {
  const map: Record<string, string> = {
    record_payment: "/finances",
    add_tenant: "/tenants",
    add_property: "/properties",
    add_maintenance: "/maintenance",
    create_lease: "/leases",
    send_message: "/messages",
    add_eviction: "/evictions",
    add_application: "/applications",
  };
  return map[modal] ?? null;
}
