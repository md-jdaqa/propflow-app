"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import {
  User,
  Wrench,
  Copy,
  Mail,
  Check,
  Building2,
} from "lucide-react";

type InviteRole = "Tenant" | "Contractor";

const PROPERTIES = [
  { id: "p1", name: "406 Oak St" },
  { id: "p2", name: "880 Airport Blvd" },
  { id: "p3", name: "33 Orchard Plaza" },
];

const UNITS_BY_PROPERTY: Record<string, { id: string; label: string }[]> = {
  p1: [
    { id: "u1", label: "Unit 1A" },
    { id: "u2", label: "Unit 1B" },
    { id: "u3", label: "Unit 2A" },
  ],
  p2: [
    { id: "u4", label: "Apt 101" },
    { id: "u5", label: "Apt 102" },
  ],
  p3: [
    { id: "u6", label: "Suite A" },
    { id: "u7", label: "Suite B" },
    { id: "u8", label: "Suite C" },
  ],
};

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
}

function generateToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 24 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export function InviteModal({ open, onClose }: InviteModalProps) {
  const [role, setRole] = useState<InviteRole>("Tenant");
  const [email, setEmail] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [allProperties, setAllProperties] = useState(false);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [sentEmail, setSentEmail] = useState(false);

  const handleRoleChange = (r: InviteRole) => {
    setRole(r);
    setSelectedPropertyId("");
    setSelectedUnitId("");
    setAllProperties(false);
    setSelectedPropertyIds([]);
  };

  const handlePropertyChange = (id: string) => {
    setSelectedPropertyId(id);
    setSelectedUnitId("");
  };

  const handleContractorPropertyToggle = (id: string) => {
    setSelectedPropertyIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleAllProperties = (checked: boolean) => {
    setAllProperties(checked);
    if (checked) setSelectedPropertyIds([]);
  };

  const handleCopyLink = async () => {
    const token = generateToken();
    const link = `${
      typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
    }/invite/${token}`;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Fallback for environments where clipboard API isn't available
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendEmail = () => {
    if (!email) return;
    setSentEmail(true);
    setTimeout(() => setSentEmail(false), 2000);
  };

  const availableUnits = selectedPropertyId
    ? (UNITS_BY_PROPERTY[selectedPropertyId] ?? [])
    : [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invite Member"
      testId="invite-modal"
      bottomSheetOnMobile
    >
      <div className="flex flex-col gap-5">
        {/* Role selector */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--muted)" }}>
            Role
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(["Tenant", "Contractor"] as InviteRole[]).map((r) => {
              const active = role === r;
              const Icon = r === "Tenant" ? User : Wrench;
              return (
                <button
                  key={r}
                  type="button"
                  data-testid={`role-${r.toLowerCase()}`}
                  onClick={() => handleRoleChange(r)}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all"
                  style={{
                    background: active ? "var(--primary-muted)" : "var(--surface-2)",
                    borderColor: active ? "var(--primary)" : "var(--border)",
                    color: active ? "var(--primary)" : "var(--body)",
                    boxShadow: active ? "var(--glow-primary)" : "none",
                  }}
                >
                  <Icon size={16} strokeWidth={2} />
                  {r}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tenant: property + unit */}
        {role === "Tenant" && (
          <div className="flex flex-col gap-3">
            <div>
              <label
                htmlFor="invite-property"
                className="text-xs font-semibold uppercase tracking-wide mb-1.5 block"
                style={{ color: "var(--muted)" }}
              >
                Property
              </label>
              <select
                id="invite-property"
                data-testid="invite-property-select"
                value={selectedPropertyId}
                onChange={(e) => handlePropertyChange(e.target.value)}
                className="pf-input w-full"
              >
                <option value="">Select a property…</option>
                {PROPERTIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="invite-unit"
                className="text-xs font-semibold uppercase tracking-wide mb-1.5 block"
                style={{ color: "var(--muted)" }}
              >
                Unit
              </label>
              <select
                id="invite-unit"
                data-testid="invite-unit-select"
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                disabled={!selectedPropertyId}
                className="pf-input w-full"
                style={{
                  opacity: selectedPropertyId ? 1 : 0.5,
                  cursor: selectedPropertyId ? "default" : "not-allowed",
                }}
              >
                <option value="">
                  {selectedPropertyId ? "Select a unit…" : "Select property first"}
                </option>
                {availableUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Contractor: all properties OR multi-select */}
        {role === "Contractor" && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--muted)" }}>
              Property Access
            </p>
            <div className="flex flex-col gap-2 p-3 rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
              {/* All properties checkbox */}
              <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  data-testid="invite-all-properties"
                  checked={allProperties}
                  onChange={(e) => handleAllProperties(e.target.checked)}
                  className="w-4 h-4 rounded accent-primary"
                  style={{ accentColor: "var(--primary)" }}
                />
                <div className="flex items-center gap-2">
                  <Building2 size={14} style={{ color: "var(--primary)" }} />
                  <span className="text-sm font-medium" style={{ color: "var(--heading)" }}>
                    All Properties
                  </span>
                </div>
              </label>

              {/* Divider */}
              <div className="h-px mx-1" style={{ background: "var(--border-subtle)" }} />

              {/* Individual property checkboxes */}
              {PROPERTIES.map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-3 cursor-pointer min-h-[44px]"
                  style={{ opacity: allProperties ? 0.4 : 1 }}
                >
                  <input
                    type="checkbox"
                    data-testid={`invite-prop-${p.id}`}
                    checked={allProperties || selectedPropertyIds.includes(p.id)}
                    disabled={allProperties}
                    onChange={() => handleContractorPropertyToggle(p.id)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: "var(--primary)" }}
                  />
                  <span className="text-sm" style={{ color: "var(--body)" }}>
                    {p.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Email input */}
        <div>
          <label
            htmlFor="invite-email"
            className="text-xs font-semibold uppercase tracking-wide mb-1.5 block"
            style={{ color: "var(--muted)" }}
          >
            Email Address
          </label>
          <input
            id="invite-email"
            type="email"
            data-testid="invite-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="pf-input w-full"
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            data-testid="invite-copy-link"
            onClick={handleCopyLink}
            className="pf-btn pf-btn-secondary w-full flex items-center justify-center gap-2 min-h-[44px]"
          >
            {copiedLink ? (
              <>
                <Check size={15} style={{ color: "var(--success)" }} />
                <span style={{ color: "var(--success)" }}>Link copied!</span>
              </>
            ) : (
              <>
                <Copy size={15} />
                Copy Invite Link
              </>
            )}
          </button>

          <button
            type="button"
            data-testid="invite-send-email"
            onClick={handleSendEmail}
            disabled={!email}
            className="pf-btn pf-btn-primary w-full flex items-center justify-center gap-2 min-h-[44px]"
            style={{ opacity: email ? 1 : 0.5, cursor: email ? "pointer" : "not-allowed" }}
          >
            {sentEmail ? (
              <>
                <Check size={15} />
                {`Invite sent to ${email}!`}
              </>
            ) : (
              <>
                <Mail size={15} />
                Send via Email
              </>
            )}
          </button>

          <button
            type="button"
            data-testid="invite-cancel"
            onClick={onClose}
            className="pf-btn pf-btn-ghost w-full min-h-[44px] text-sm"
            style={{ color: "var(--muted)" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
