"use client";
import { useState } from "react";
import { Home, Plus, ExternalLink, Share2, Eye, Edit3, X, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface Listing {
  id: string;
  property: string;
  unit: string;
  address: string;
  monthlyRent: number;
  beds: number;
  baths: number;
  sqft: number;
  available: string;
  status: "ACTIVE" | "DRAFT" | "RENTED" | "PAUSED";
  views: number;
  leads: number;
  syndicated: string[];
  photoCount: number;
}

const INITIAL_LISTINGS: Listing[] = [
  {
    id: "LST-001", property: "406 Oak St", unit: "2A", address: "406 Oak St, Unit 2A, Brooklyn NY 11201",
    monthlyRent: 1900, beds: 2, baths: 1, sqft: 850, available: "2026-06-01",
    status: "ACTIVE", views: 142, leads: 8,
    syndicated: ["Zillow", "Apartments.com", "Realtor.com"],
    photoCount: 12,
  },
  {
    id: "LST-002", property: "33 Orchard Plaza", unit: "1A", address: "33 Orchard Plaza, Unit 1A, Brooklyn NY 11205",
    monthlyRent: 1600, beds: 1, baths: 1, sqft: 620, available: "2026-07-01",
    status: "DRAFT", views: 0, leads: 0,
    syndicated: [],
    photoCount: 0,
  },
];

const PLATFORMS = ["Zillow", "Apartments.com", "Realtor.com", "Rentler"];

const STATUS_CFG = {
  ACTIVE:  { label: "Active",  color: "var(--success)",  bg: "rgba(22,163,74,0.1)" },
  DRAFT:   { label: "Draft",   color: "var(--muted)",    bg: "var(--surface-2)" },
  RENTED:  { label: "Rented",  color: "var(--primary)",  bg: "rgba(79,110,247,0.1)" },
  PAUSED:  { label: "Paused",  color: "#ca8a04",         bg: "rgba(234,179,8,0.1)" },
};

interface EditValues {
  monthlyRent: number;
  available: string;
}

export function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "DRAFT" | "ALL">("ALL");

  // Edit mode per listing
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [editValues, setEditValues] = useState<Record<string, EditValues>>({});

  // Syndicate panel per listing
  const [syndicateMode, setSyndicateMode] = useState<Record<string, boolean>>({});
  const [syndicateChecked, setSyndicateChecked] = useState<Record<string, string[]>>({});
  const [syndicatePublished, setSyndicatePublished] = useState<Record<string, boolean>>({});

  // Leads panel per listing
  const [leadsMode, setLeadsMode] = useState<Record<string, boolean>>({});

  const filtered = activeTab === "ALL" ? listings : listings.filter((l) => l.status === activeTab);

  function startEdit(listing: Listing) {
    setEditValues((prev) => ({
      ...prev,
      [listing.id]: { monthlyRent: listing.monthlyRent, available: listing.available },
    }));
    setEditMode((prev) => ({ ...prev, [listing.id]: true }));
    // close other panels
    setSyndicateMode((prev) => ({ ...prev, [listing.id]: false }));
    setLeadsMode((prev) => ({ ...prev, [listing.id]: false }));
  }

  function cancelEdit(id: string) {
    setEditMode((prev) => ({ ...prev, [id]: false }));
  }

  function saveEdit(id: string) {
    const vals = editValues[id];
    if (vals) {
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, monthlyRent: vals.monthlyRent, available: vals.available } : l))
      );
    }
    setEditMode((prev) => ({ ...prev, [id]: false }));
  }

  function openSyndicate(listing: Listing) {
    setSyndicateChecked((prev) => ({
      ...prev,
      [listing.id]: prev[listing.id] ?? [...listing.syndicated],
    }));
    setSyndicateMode((prev) => ({ ...prev, [listing.id]: true }));
    setSyndicatePublished((prev) => ({ ...prev, [listing.id]: false }));
    setEditMode((prev) => ({ ...prev, [listing.id]: false }));
    setLeadsMode((prev) => ({ ...prev, [listing.id]: false }));
  }

  function togglePlatform(listingId: string, platform: string) {
    setSyndicateChecked((prev) => {
      const current = prev[listingId] ?? [];
      return {
        ...prev,
        [listingId]: current.includes(platform)
          ? current.filter((p) => p !== platform)
          : [...current, platform],
      };
    });
  }

  function publishSyndication(listingId: string) {
    const platforms = syndicateChecked[listingId] ?? [];
    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, syndicated: platforms } : l))
    );
    setSyndicatePublished((prev) => ({ ...prev, [listingId]: true }));
    setSyndicateMode((prev) => ({ ...prev, [listingId]: false }));
  }

  function toggleLeads(listingId: string) {
    setLeadsMode((prev) => ({ ...prev, [listingId]: !prev[listingId] }));
    setEditMode((prev) => ({ ...prev, [listingId]: false }));
    setSyndicateMode((prev) => ({ ...prev, [listingId]: false }));
  }

  return (
    <div data-testid="listings-page" className="space-y-5 pb-24 md:pb-6">
      <header className="flex items-start justify-between pt-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--heading)", letterSpacing: "-0.02em" }}>
            Listings
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            Syndicate to Zillow, Apartments.com, Realtor.com, Rentler — one click
          </p>
        </div>
        <button type="button" className="pf-btn pf-btn-primary text-sm" data-testid="create-listing-btn">
          <Plus size={15} /> New Listing
        </button>
      </header>

      {/* Syndication quick-launch */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: "linear-gradient(135deg, rgba(79,110,247,0.08) 0%, rgba(14,165,160,0.05) 100%)",
          border: "1.5px solid rgba(79,110,247,0.2)",
        }}
      >
        <p className="text-sm font-semibold mb-3" style={{ color: "var(--heading)" }}>
          One-click syndication
        </p>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <div
              key={p}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--body)" }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: "var(--success)" }} />
              {p}
            </div>
          ))}
          <button type="button" className="text-xs px-3 py-1.5 rounded-lg" style={{ color: "var(--primary)", background: "var(--primary-muted)" }}>
            + Connect more
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card testId="listing-stat-active">
          <p className="text-xs" style={{ color: "var(--muted)" }}>Active Listings</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--success)" }}>
            {listings.filter((l) => l.status === "ACTIVE").length}
          </p>
        </Card>
        <Card testId="listing-stat-views">
          <p className="text-xs" style={{ color: "var(--muted)" }}>Total Views</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--body)" }}>
            {listings.reduce((s, l) => s + l.views, 0)}
          </p>
        </Card>
        <Card testId="listing-stat-leads">
          <p className="text-xs" style={{ color: "var(--muted)" }}>Leads Received</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--primary)" }}>
            {listings.reduce((s, l) => s + l.leads, 0)}
          </p>
        </Card>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5">
        {(["ALL", "ACTIVE", "DRAFT"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setActiveTab(f)}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
            style={
              activeTab === f
                ? { background: "var(--primary)", color: "#fff" }
                : { background: "var(--surface-2)", color: "var(--muted)" }
            }
          >
            {f === "ALL" ? "All" : STATUS_CFG[f].label}
          </button>
        ))}
      </div>

      {/* Listings */}
      <div className="space-y-3">
        {filtered.map((listing) => {
          const cfg = STATUS_CFG[listing.status];
          const isEditing = !!editMode[listing.id];
          const isSyndicating = !!syndicateMode[listing.id];
          const isLeads = !!leadsMode[listing.id];
          const justPublished = !!syndicatePublished[listing.id];
          const checkedPlatforms = syndicateChecked[listing.id] ?? listing.syndicated;

          return (
            <Card key={listing.id} testId={`listing-row-${listing.id}`}>
              <div className="flex items-start gap-3">
                {/* Photo placeholder */}
                <div
                  className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center"
                  style={{ background: "var(--surface-2)" }}
                >
                  {listing.photoCount > 0 ? (
                    <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>{listing.photoCount} 📷</span>
                  ) : (
                    <Home size={20} style={{ color: "var(--muted)" }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--heading)" }}>
                        {listing.property} · {listing.unit}
                      </p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>{listing.address}</p>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                  </div>

                  {/* Edit mode: show editable fields */}
                  {isEditing ? (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="text-xs w-24 flex-shrink-0" style={{ color: "var(--muted)" }}>Monthly Rent</label>
                        <input
                          type="number"
                          className="pf-input text-xs py-1 flex-1"
                          value={editValues[listing.id]?.monthlyRent ?? listing.monthlyRent}
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              [listing.id]: { ...prev[listing.id]!, monthlyRent: Number(e.target.value) },
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs w-24 flex-shrink-0" style={{ color: "var(--muted)" }}>Available Date</label>
                        <input
                          type="date"
                          className="pf-input text-xs py-1 flex-1"
                          value={editValues[listing.id]?.available ?? listing.available}
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              [listing.id]: { ...prev[listing.id]!, available: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3 mt-1.5 text-xs" style={{ color: "var(--body)" }}>
                      <span className="font-semibold">${listing.monthlyRent.toLocaleString()}/mo</span>
                      <span>{listing.beds}bd · {listing.baths}ba · {listing.sqft} sqft</span>
                      <span style={{ color: "var(--muted)" }}>Available {listing.available}</span>
                    </div>
                  )}

                  {!isEditing && listing.status === "ACTIVE" && (
                    <div className="flex gap-3 mt-1.5 text-xs" style={{ color: "var(--muted)" }}>
                      <span><Eye size={10} className="inline mr-1" />{listing.views} views</span>
                      <span>{listing.leads} leads</span>
                      {listing.syndicated.length > 0 && (
                        <span style={{ color: "var(--success)" }}>
                          ✓ {listing.syndicated.join(", ")}
                        </span>
                      )}
                      {justPublished && (
                        <span style={{ color: "var(--success)", fontWeight: 600 }}>Syndicated ✓</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Syndicate panel */}
              {isSyndicating && (
                <div className="mt-3 pt-3 border-t space-y-2" style={{ borderColor: "var(--border)" }}>
                  <p className="text-xs font-semibold" style={{ color: "var(--heading)" }}>Select platforms to syndicate:</p>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map((platform) => (
                      <label key={platform} className="flex items-center gap-1.5 cursor-pointer text-xs" style={{ color: "var(--body)" }}>
                        <input
                          type="checkbox"
                          checked={checkedPlatforms.includes(platform)}
                          onChange={() => togglePlatform(listing.id, platform)}
                          className="rounded"
                        />
                        {platform}
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      className="pf-btn pf-btn-primary text-xs flex items-center gap-1.5"
                      onClick={() => publishSyndication(listing.id)}
                    >
                      <Check size={11} /> Publish
                    </button>
                    <button
                      type="button"
                      className="pf-btn pf-btn-secondary text-xs"
                      onClick={() => setSyndicateMode((prev) => ({ ...prev, [listing.id]: false }))}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Leads panel */}
              {isLeads && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "var(--heading)" }}>
                        {listing.leads} lead{listing.leads !== 1 ? "s" : ""} received
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Lead management coming soon</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLeadsMode((prev) => ({ ...prev, [listing.id]: false }))}
                      style={{ color: "var(--muted)" }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Button row */}
              <div className="flex gap-2 mt-3 pt-3 border-t flex-wrap" style={{ borderColor: "var(--border)" }}>
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      className="pf-btn pf-btn-primary text-xs flex items-center gap-1.5"
                      onClick={() => saveEdit(listing.id)}
                    >
                      <Check size={11} /> Save
                    </button>
                    <button
                      type="button"
                      className="pf-btn pf-btn-secondary text-xs flex items-center gap-1.5"
                      onClick={() => cancelEdit(listing.id)}
                    >
                      <X size={11} /> Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="pf-btn pf-btn-secondary text-xs flex items-center gap-1.5"
                      onClick={() => startEdit(listing)}
                    >
                      <Edit3 size={11} /> Edit
                    </button>
                    <button
                      type="button"
                      className="pf-btn pf-btn-secondary text-xs flex items-center gap-1.5"
                      onClick={() => openSyndicate(listing)}
                    >
                      <Share2 size={11} /> Syndicate
                    </button>
                    <button type="button" className="pf-btn pf-btn-secondary text-xs flex items-center gap-1.5">
                      <ExternalLink size={11} /> View Listing
                    </button>
                    {listing.status === "ACTIVE" && (
                      <button
                        type="button"
                        className="pf-btn pf-btn-primary text-xs"
                        onClick={() => toggleLeads(listing.id)}
                      >
                        Review Leads ({listing.leads})
                      </button>
                    )}
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
