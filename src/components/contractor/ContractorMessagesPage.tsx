"use client";
import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

interface Message {
  id: string;
  sender: "me" | "manager";
  senderName: string;
  text: string;
  timestamp: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "msg-1",
    sender: "manager",
    senderName: "Arif",
    text: "Hey Marcus, just a reminder the HVAC inspection at 880 Airport is coming up on the 15th. Let me know if you need access codes.",
    timestamp: "May 1, 9:12 AM",
  },
  {
    id: "msg-2",
    sender: "me",
    senderName: "Marcus Rivera",
    text: "Got it, thanks Arif. I'll need the gate code for the side entrance. Also, the Oak St faucet repair is underway — should wrap up by Thursday.",
    timestamp: "May 1, 10:45 AM",
  },
];

export function ContractorMessagesPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const text = draft.trim();
    if (!text) return;
    const now = new Date();
    const hours = now.getHours();
    const mins = String(now.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const timestamp = `${months[now.getMonth()]} ${now.getDate()}, ${h12}:${mins} ${ampm}`;

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: "me",
        senderName: "Marcus Rivera",
        text,
        timestamp,
      },
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
    <div className="pb-24 flex flex-col" style={{ minHeight: "calc(100vh - 120px)" }}>
      {/* Thread header */}
      <div
        className="flex items-center gap-3 mb-4 pb-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-base font-semibold flex-shrink-0"
          style={{ background: "rgba(79,110,247,0.15)", color: "var(--primary)" }}
        >
          A
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: "var(--heading)" }}>
            Arif
          </p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>Property Manager · Clevvar Estate</p>
        </div>
      </div>

      {/* Message thread */}
      <div className="flex-1 space-y-3 mb-4">
        {messages.map((msg) => {
          const isMe = msg.sender === "me";
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 self-end"
                style={{
                  background: isMe
                    ? "rgba(14,165,160,0.15)"
                    : "rgba(79,110,247,0.15)",
                  color: isMe ? "var(--secondary)" : "var(--primary)",
                }}
              >
                {isMe ? "M" : "A"}
              </div>

              {/* Bubble */}
              <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div
                  className="px-3 py-2 rounded-2xl text-sm leading-relaxed"
                  style={
                    isMe
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
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Compose */}
      <div
        className="sticky bottom-24 flex gap-2 items-end pt-3"
        style={{ background: "var(--bg)", borderTop: "1px solid var(--border)" }}
      >
        <textarea
          className="pf-input flex-1 resize-none"
          rows={1}
          placeholder="Message Arif…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            height: "auto",
            minHeight: "44px",
            paddingTop: "0.625rem",
            paddingBottom: "0.625rem",
            lineHeight: "1.4",
          }}
        />
        <button
          className="pf-btn pf-btn-primary flex-shrink-0 whitespace-nowrap"
          onClick={handleSend}
          disabled={!draft.trim()}
          style={{ minHeight: "44px", minWidth: "44px", padding: "0 0.875rem" }}
          aria-label="Send message"
        >
          <Send size={16} />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
}
