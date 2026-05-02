"use client";
import { useState } from "react";
import { MessageSquare, Send, Plus, Search, Bot, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface Message {
  id: string;
  from: string;
  fromRole: "TENANT" | "LANDLORD" | "AI";
  body: string;
  timestamp: string;
  read: boolean;
}

interface Thread {
  id: string;
  recipient: string;
  recipientRole: "TENANT" | "VENDOR";
  property: string;
  lastMessage: string;
  lastTimestamp: string;
  unread: number;
  messages: Message[];
}

const INITIAL_THREADS: Thread[] = [
  {
    id: "T-001", recipient: "Jake Tenant", recipientRole: "TENANT", property: "406 Oak St",
    lastMessage: "Hi I just moved in and can't find the mailbox key anywhere",
    lastTimestamp: "2m ago", unread: 1,
    messages: [
      { id: "m1", from: "Jake Tenant", fromRole: "TENANT", body: "Hi I just moved in and can't find the mailbox key anywhere", timestamp: "2m ago", read: false },
    ],
  },
  {
    id: "T-002", recipient: "Sarah Chen", recipientRole: "TENANT", property: "880 Airport Blvd",
    lastMessage: "Thank you, I'll transfer the rent today!", lastTimestamp: "1h ago", unread: 0,
    messages: [
      { id: "m2", from: "Arif", fromRole: "LANDLORD", body: "Hi Sarah, just a reminder that rent is due on the 1st.", timestamp: "2h ago", read: true },
      { id: "m3", from: "Sarah Chen", fromRole: "TENANT", body: "Thank you, I'll transfer the rent today!", timestamp: "1h ago", read: true },
    ],
  },
  {
    id: "T-003", recipient: "Marcus Johnson", recipientRole: "TENANT", property: "33 Orchard Plaza",
    lastMessage: "When will the contractor come to fix the lock?", lastTimestamp: "3h ago", unread: 2,
    messages: [
      { id: "m4", from: "Marcus Johnson", fromRole: "TENANT", body: "The front door lock is still broken.", timestamp: "4h ago", read: true },
      { id: "m5", from: "Arif", fromRole: "LANDLORD", body: "I've scheduled a contractor for tomorrow.", timestamp: "3.5h ago", read: true },
      { id: "m6", from: "Marcus Johnson", fromRole: "TENANT", body: "When will the contractor come to fix the lock?", timestamp: "3h ago", read: false },
    ],
  },
];

export function MessagesPage() {
  const [threads, setThreads] = useState<Thread[]>(INITIAL_THREADS);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [aiAssist, setAiAssist] = useState(false);

  const thread = threads.find((t) => t.id === activeThread);
  const totalUnread = threads.reduce((s, t) => s + t.unread, 0);

  function sendMessage() {
    const body = reply.trim();
    if (!body || !activeThread) return;
    const newMsg: Message = {
      id: `m-${Date.now()}`,
      from: "Arif",
      fromRole: "LANDLORD",
      body,
      timestamp: "Just now",
      read: true,
    };
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThread
          ? { ...t, messages: [...t.messages, newMsg], lastMessage: body, lastTimestamp: "Just now", unread: 0 }
          : t
      )
    );
    setReply("");
  }

  return (
    <div data-testid="messages-page" className="space-y-5 pb-24 md:pb-6">
      {/* Header */}
      <header className="flex items-start justify-between pt-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--heading)", letterSpacing: "-0.02em" }}>
            Messages
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            {totalUnread > 0 ? `${totalUnread} unread · ` : ""}Tenants · Vendors · AI-assisted replies
          </p>
        </div>
        <button type="button" className="pf-btn pf-btn-primary text-sm" data-testid="new-message-btn">
          <Plus size={15} /> New Message
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3" style={{ minHeight: "60vh" }}>
        {/* Thread list — hidden on mobile when a thread is open */}
        <div className={`space-y-2 ${activeThread ? "hidden md:block" : "block"}`}>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
            <input type="text" placeholder="Search messages…" className="pf-input pl-9 text-sm w-full" />
          </div>
          {threads.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveThread(t.id)}
              className="w-full text-left rounded-xl px-3 py-3 transition-colors"
              style={{
                background: activeThread === t.id ? "var(--primary-muted)" : "var(--surface-2)",
                border: `1px solid ${activeThread === t.id ? "rgba(79,110,247,0.3)" : "var(--border)"}`,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--heading)" }}>{t.recipient}</p>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[10px]" style={{ color: "var(--muted)" }}>{t.lastTimestamp}</span>
                  {t.unread > 0 && (
                    <span
                      className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                      style={{ background: "var(--primary)", color: "#fff" }}
                    >
                      {t.unread}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted)" }}>{t.lastMessage}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>{t.property}</p>
            </button>
          ))}
        </div>

        {/* Message view — full width on mobile when thread is open */}
        <div className={`md:col-span-2 ${activeThread ? "block" : "hidden md:block"}`}>
          <Card testId="message-thread">
            {thread ? (
              <div className="flex flex-col" style={{ minHeight: "50vh" }}>
                {/* Thread header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-2">
                    {/* Back button — mobile only */}
                    <button
                      type="button"
                      onClick={() => setActiveThread(null)}
                      className="md:hidden flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: "var(--surface-2)", color: "var(--primary)" }}
                      aria-label="Back to inbox"
                    >
                      <ArrowLeft size={14} /> Inbox
                    </button>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--heading)" }}>{thread.recipient}</p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>{thread.property}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAiAssist((a) => !a)}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors"
                    style={
                      aiAssist
                        ? { background: "var(--primary-muted)", color: "var(--primary)" }
                        : { background: "var(--surface-2)", color: "var(--muted)" }
                    }
                  >
                    <Bot size={13} /> AI Assist
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 space-y-3 overflow-y-auto pf-scroll mb-3">
                  {thread.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.fromRole === "LANDLORD" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className="max-w-[80%] rounded-xl px-3 py-2 text-sm"
                        style={
                          msg.fromRole === "LANDLORD"
                            ? { background: "var(--primary)", color: "#fff" }
                            : msg.fromRole === "AI"
                            ? { background: "rgba(14,165,160,0.12)", color: "var(--body)", border: "1px solid rgba(14,165,160,0.3)" }
                            : { background: "var(--surface-2)", color: "var(--body)", border: "1px solid var(--border)" }
                        }
                      >
                        {msg.fromRole !== "LANDLORD" && (
                          <p className="text-[10px] font-semibold mb-1" style={{ opacity: 0.7 }}>{msg.from}</p>
                        )}
                        {msg.body}
                        <p className="text-[10px] mt-1 text-right" style={{ opacity: 0.6 }}>{msg.timestamp}</p>
                      </div>
                    </div>
                  ))}

                  {/* AI suggestion */}
                  {aiAssist && (
                    <div className="flex justify-start">
                      <div
                        className="max-w-[80%] rounded-xl px-3 py-2 text-sm"
                        style={{ background: "rgba(14,165,160,0.1)", border: "1px dashed rgba(14,165,160,0.4)", color: "var(--body)" }}
                      >
                        <p className="text-[10px] font-semibold mb-1 flex items-center gap-1" style={{ color: "var(--secondary)" }}>
                          <Bot size={10} /> AI Suggested Reply
                        </p>
                        No problem! Can you check the kitchen drawer by the sink? If it&apos;s not there, I&apos;ll get you a replacement right away.
                        <button
                          type="button"
                          onClick={() => setReply("No problem! Can you check the kitchen drawer by the sink? If it's not there, I'll get you a replacement right away.")}
                          className="block text-[10px] mt-1 font-semibold"
                          style={{ color: "var(--secondary)" }}
                        >
                          Use this →
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reply input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                    placeholder="Type a message…"
                    className="pf-input flex-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={sendMessage}
                    disabled={!reply.trim()}
                    className="pf-btn pf-btn-primary p-2.5 rounded-xl flex-shrink-0"
                  >
                    <Send size={15} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <MessageSquare size={32} style={{ color: "var(--muted)" }} />
                <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>Select a conversation</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
