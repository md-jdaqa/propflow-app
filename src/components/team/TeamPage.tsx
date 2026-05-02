"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Users, UserPlus, Shield, Mail, Clock, Wrench, Check, X } from "lucide-react";
import { InviteModal } from "@/components/team/InviteModal";

type Role = "Owner" | "Manager" | "Maintenance" | "Accountant" | "ViewOnly" | "Contractor";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  properties: string;
  lastActive: string;
  avatar: string;
}

interface PendingInvite {
  id: string;
  email: string;
  role: Role;
  sentDate: string;
}

interface ContractorAssignment {
  id: string;
  name: string;
  company: string;
  properties: string[];
  status: "ACTIVE" | "INACTIVE";
}

const ALL_PROPERTIES = ["406 Oak St", "880 Airport Blvd", "33 Orchard Plaza"];

const ROLE_COLORS: Record<Role, { bg: string; text: string; label: string }> = {
  Owner:       { bg: "var(--primary-muted, rgba(26,86,219,0.15))", text: "var(--primary)",  label: "Owner" },
  Manager:     { bg: "rgba(14,165,160,0.15)",                       text: "var(--secondary)", label: "Manager" },
  Maintenance: { bg: "var(--warning-muted, rgba(217,119,6,0.15))",  text: "var(--warning)",  label: "Maintenance" },
  Accountant:  { bg: "var(--success-muted, rgba(22,163,74,0.15))",  text: "var(--success)",  label: "Accountant" },
  ViewOnly:    { bg: "rgba(148,163,184,0.15)",                       text: "var(--muted)",    label: "View Only" },
  Contractor:  { bg: "rgba(168,85,247,0.15)",                        text: "#a855f7",         label: "Contractor" },
};

const MOCK_MEMBERS: TeamMember[] = [
  {
    id: "1",
    name: "Md Arifuzzaman",
    email: "mohammedarif0411@gmail.com",
    role: "Owner",
    properties: "All Properties",
    lastActive: "Just now",
    avatar: "MA",
  },
  {
    id: "2",
    name: "Joseph Neff",
    email: "joseph.neff@clevvarestate.com",
    role: "Manager",
    properties: "880 Airport Blvd",
    lastActive: "2 days ago",
    avatar: "JN",
  },
  {
    id: "3",
    name: "Marcus Williams",
    email: "marcus.w@contractor.com",
    role: "Maintenance",
    properties: "All Properties",
    lastActive: "5 days ago",
    avatar: "MW",
  },
];

const MOCK_INVITES: PendingInvite[] = [
  { id: "i1", email: "accountant@firm.com",  role: "Accountant", sentDate: "Apr 28, 2026" },
  { id: "i2", email: "viewonly@example.com", role: "ViewOnly",   sentDate: "Apr 30, 2026" },
];

const INITIAL_CONTRACTORS: ContractorAssignment[] = [
  {
    id: "C-001",
    name: "Marcus Rivera",
    company: "Marcus Plumbing & Hardware",
    properties: ["406 Oak St", "880 Airport Blvd"],
    status: "ACTIVE",
  },
  {
    id: "C-002",
    name: "City HVAC Services",
    company: "City HVAC",
    properties: ["880 Airport Blvd"],
    status: "ACTIVE",
  },
];

function RoleBadge({ role }: { role: Role }) {
  const { bg, text, label } = ROLE_COLORS[role];
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: bg, color: text }}
    >
      <Shield size={10} strokeWidth={2.5} />
      {label}
    </span>
  );
}

function AvatarCircle({ initials, role }: { initials: string; role: Role }) {
  const { bg, text } = ROLE_COLORS[role];
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
      style={{ background: bg, color: text, border: `2px solid ${text}` }}
    >
      {initials}
    </div>
  );
}

function ContractorInitials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
      style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7", border: "2px solid #a855f7" }}
    >
      {initials}
    </div>
  );
}

function PropertyChip({ label }: { label: string }) {
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ background: "var(--primary-muted, rgba(26,86,219,0.12))", color: "var(--primary)" }}
    >
      {label}
    </span>
  );
}

interface PropertyPickerProps {
  selected: string[];
  onChange: (next: string[]) => void;
  onSave: () => void;
  onCancel: () => void;
}

function PropertyPicker({ selected, onChange, onSave, onCancel }: PropertyPickerProps) {
  function toggle(prop: string) {
    onChange(
      selected.includes(prop) ? selected.filter((p) => p !== prop) : [...selected, prop]
    );
  }
  return (
    <div
      className="mt-3 p-3 rounded-xl border space-y-2"
      style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
    >
      <p className="text-xs font-semibold mb-2" style={{ color: "var(--body)" }}>
        Assign properties:
      </p>
      {ALL_PROPERTIES.map((prop) => {
        const checked = selected.includes(prop);
        return (
          <label key={prop} className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(prop)}
              className="w-4 h-4 rounded"
            />
            <span className="text-xs" style={{ color: "var(--body)" }}>
              {prop}
            </span>
          </label>
        );
      })}
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onSave}
          className="pf-btn pf-btn-primary text-xs px-3 py-1 flex items-center gap-1"
        >
          <Check size={12} />
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="pf-btn pf-btn-secondary text-xs px-3 py-1 flex items-center gap-1"
        >
          <X size={12} />
          Cancel
        </button>
      </div>
    </div>
  );
}

export function TeamPage() {
  const totalMembers = MOCK_MEMBERS.length;
  const pendingCount = MOCK_INVITES.length;

  const [inviteOpen, setInviteOpen] = useState(false);
  const [contractors, setContractors] = useState<ContractorAssignment[]>(INITIAL_CONTRACTORS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftSelections, setDraftSelections] = useState<string[]>([]);

  function startEdit(c: ContractorAssignment) {
    setEditingId(c.id);
    setDraftSelections([...c.properties]);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraftSelections([]);
  }

  function saveEdit(id: string) {
    setContractors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, properties: draftSelections } : c))
    );
    setEditingId(null);
    setDraftSelections([]);
  }

  return (
    <div data-testid="team-page" className="pf-page-content flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--heading)" }}>
            Team
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            Manage who has access to your properties
          </p>
        </div>
        <button
          className="pf-btn pf-btn-primary flex items-center gap-2"
          data-testid="invite-member-btn"
          onClick={() => setInviteOpen(true)}
        >
          <UserPlus size={16} />
          Invite Member
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="flex flex-col gap-1 p-4">
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Total Members
          </span>
          <span className="text-2xl font-bold" style={{ color: "var(--primary)" }}>
            {totalMembers}
          </span>
        </Card>
        <Card className="flex flex-col gap-1 p-4">
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Pending Invites
          </span>
          <span className="text-2xl font-bold" style={{ color: "var(--warning)" }}>
            {pendingCount}
          </span>
        </Card>
        <Card className="flex flex-col gap-1 p-4">
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Active Roles
          </span>
          <span className="text-2xl font-bold" style={{ color: "var(--success)" }}>
            3
          </span>
        </Card>
        <Card className="flex flex-col gap-1 p-4">
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Properties Covered
          </span>
          <span className="text-2xl font-bold" style={{ color: "var(--body)" }}>
            2
          </span>
        </Card>
      </div>

      {/* Team Members */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--muted)" }}>
          <Users size={14} className="inline mr-1.5" />
          Team Members
        </h2>
        <div className="flex flex-col gap-3">
          {MOCK_MEMBERS.map((member) => (
            <Card key={member.id} className="p-4">
              <div className="flex items-start gap-3">
                <AvatarCircle initials={member.avatar} role={member.role} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm" style={{ color: "var(--heading)" }}>
                      {member.name}
                    </span>
                    <RoleBadge role={member.role} />
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: "var(--muted)" }}>
                    <Mail size={11} />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-2 mt-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ background: "var(--surface-2)", color: "var(--body)" }}
                    >
                      {member.properties}
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: "var(--muted)" }}>
                      <Clock size={11} />
                      {member.lastActive}
                    </span>
                  </div>
                </div>
                <button className="pf-btn pf-btn-secondary text-xs px-3 py-1 flex-shrink-0">
                  Edit
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Contractor Assignments */}
      <div data-testid="contractor-assignments">
        <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--muted)" }}>
          <Wrench size={14} className="inline mr-1.5" />
          Contractor Assignments
        </h2>
        <div className="flex flex-col gap-3">
          {contractors.map((c) => {
            const isEditing = editingId === c.id;
            const isUnassigned = c.properties.length === 0;
            return (
              <Card key={c.id} className="p-4" testId={`contractor-row-${c.id}`}>
                <div className="flex items-start gap-3">
                  <ContractorInitials name={c.name} />
                  <div className="flex-1 min-w-0">
                    {/* Name + badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm" style={{ color: "var(--heading)" }}>
                        {c.name}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(168,85,247,0.12)", color: "#a855f7" }}
                      >
                        <Shield size={10} strokeWidth={2.5} />
                        Contractor
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                      {c.company}
                    </p>

                    {/* Property chips */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {isUnassigned ? (
                        <span className="text-xs italic" style={{ color: "var(--muted)" }}>
                          No properties assigned
                        </span>
                      ) : (
                        c.properties.map((p) => <PropertyChip key={p} label={p} />)
                      )}
                    </div>

                    {/* Inline property picker */}
                    {isEditing && (
                      <PropertyPicker
                        selected={draftSelections}
                        onChange={setDraftSelections}
                        onSave={() => saveEdit(c.id)}
                        onCancel={cancelEdit}
                      />
                    )}
                  </div>

                  {/* Edit / Assign button — hidden while picker is open */}
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="pf-btn pf-btn-secondary text-xs px-3 py-1 flex-shrink-0"
                      data-testid={`contractor-edit-${c.id}`}
                    >
                      {isUnassigned ? "Assign Properties" : "Edit"}
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Pending Invites */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--muted)" }}>
          <Mail size={14} className="inline mr-1.5" />
          Pending Invites
        </h2>
        {MOCK_INVITES.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-sm" style={{ color: "var(--muted)" }}>No pending invites</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {MOCK_INVITES.map((invite) => (
              <Card key={invite.id} className="p-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--surface-2)", color: "var(--muted)" }}
                  >
                    <Mail size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate" style={{ color: "var(--body)" }}>
                        {invite.email}
                      </span>
                      <RoleBadge role={invite.role} />
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: "var(--muted)" }}>
                      <Clock size={11} />
                      Sent {invite.sentDate}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button className="pf-btn pf-btn-secondary text-xs px-3 py-1">
                      Resend
                    </button>
                    <button
                      className="pf-btn text-xs px-3 py-1"
                      style={{ color: "var(--danger)", borderColor: "var(--danger)" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
