"use client";
import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

interface Message {
  id: string;
  from: "tenant" | "landlord";
  text: string;
  time: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    from: "landlord",
    text: "Hi Carlos! Just a reminder that the building exterminator will be coming by on May 8th between 10am–12pm. Please make sure the unit is accessible.",
    time: "Apr 29, 10:14 AM",
  },
  {
    id: "m2",
    from: "tenant",
    text: "Got it, thanks for the heads up! I'll make sure to be home or leave a key with the super.",
    time: "Apr 29, 11:02 AM",
  },
];

export function TenantMessagesPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const text = draft.trim();
    if (!text) return;

    const now = new Date();
    const time = now.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    setMessages((prev) => [
      ...prev,
      { id: `m${Date.now()}`, from: "tenant", text, time },
    ]);
    setDraft("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem-4rem)]">
      {/* Thread header */}
      <div
        className="px-4 py-3 border-b flex-shrink-0"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
            style={{ background: "var(--primary)" }}
          >
            A
          </div>
          <div>
            <p className="text-sm font-semibold text-heading leading-tight">
              Arif (Landlord)
            </p>
            <p className="text-xs text-muted">406 Oak St · Unit 2A</p>
          </div>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-w-2xl mx-auto w-full">
        {messages.map((msg) => {
          const isTenant = msg.from === "tenant";
          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-0.5 ${isTenant ? "items-end" : "items-start"}`}
            >
              <div
                className="max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
                style={
                  isTenant
                    ? {
                        background: "var(--primary)",
                        color: "white",
                        borderBottomRightRadius: "4px",
                      }
                    : {
                        background: "var(--surface-2)",
                        color: "var(--body)",
                        border: "1px solid var(--border)",
                        borderBottomLeftRadius: "4px",
                      }
                }
              >
                {msg.text}
              </div>
              <p className="text-[10px] text-muted px-1">{msg.time}</p>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div
        className="flex-shrink-0 border-t px-4 py-3"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <form
          onSubmit={handleSend}
          className="flex items-end gap-2 max-w-2xl mx-auto"
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message your landlord…"
            rows={1}
            className="flex-1 resize-none rounded-xl border px-3 py-2.5 text-sm focus:outline-none"
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--border)",
              color: "var(--body)",
              maxHeight: "120px",
            }}
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="pf-btn pf-btn-primary flex items-center justify-center w-11 h-11 p-0 flex-shrink-0"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </form>
        <p className="text-[10px] text-muted mt-1.5 max-w-2xl mx-auto">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
