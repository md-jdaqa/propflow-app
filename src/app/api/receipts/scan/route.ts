// PropFlow — AI Receipt Scanner
// POST /api/receipts/scan
// Accepts a payment screenshot/receipt image, extracts fields via AI vision,
// and fuzzy-matches the payer against known tenants.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption/aes";

export const runtime = "nodejs";

const MOCK_OWNER_ID = "00000000-0000-0000-0000-000000000001";

const ScanSchema = z.object({
  imageBase64: z.string().min(10, "Image data required"),
  mimeType: z
    .string()
    .regex(/^image\/(jpeg|png|webp|gif|heic|heif)$/, "Unsupported image type")
    .default("image/jpeg"),
});

// ─── Extraction prompt ────────────────────────────────────────────────────────
const EXTRACTION_PROMPT = `Analyze this payment screenshot or receipt image and extract payment details.

Return ONLY a valid JSON object with these fields:
- amount: number (the payment amount as a decimal number, no currency symbol, e.g. 1400.00)
- date: string (the payment date in YYYY-MM-DD format, or null if not visible)
- method: string (one of: CASH, CHECK, ACH, CARD, ZELLE, VENMO, OTHER — pick the closest match)
- party: string (the full name of the person who sent the money, or null if not visible)
- memo: string (any note, memo, or description on the payment, or null if not visible)

Rules:
- For Zelle, Venmo, CashApp, PayPal → use ZELLE, VENMO, CARD, or OTHER respectively
- For bank transfers → use ACH
- Extract the SENDER name (who paid), not the recipient
- If amount appears multiple times, use the final/total amount
- Return null for any field you cannot determine with confidence

Example output:
{"amount": 1400.00, "date": "2026-05-02", "method": "ZELLE", "party": "Marissa Johnson", "memo": "April rent Apt 2"}

Respond with JSON only. No explanation, no markdown code blocks.`;

// ─── Simple fuzzy tenant match ────────────────────────────────────────────────
function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function matchScore(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.85;
  // Token overlap
  const ta = na.split(/\s+/).filter(Boolean);
  const tb = nb.split(/\s+/).filter(Boolean);
  const intersection = ta.filter((t) => tb.includes(t)).length;
  const union = new Set([...ta, ...tb]).size;
  return union === 0 ? 0 : intersection / union;
}

interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
}

function findTenantMatch(
  party: string | null,
  tenants: Tenant[],
): { id: string; name: string } | null {
  if (!party || tenants.length === 0) return null;
  let best: { id: string; name: string; score: number } | null = null;
  for (const t of tenants) {
    const fullName = `${t.firstName} ${t.lastName}`.trim();
    const score = matchScore(party, fullName);
    if (score > 0.6 && (!best || score > best.score)) {
      best = { id: t.id, name: fullName, score };
    }
  }
  return best ? { id: best.id, name: best.name } : null;
}

// ─── AI call helpers ──────────────────────────────────────────────────────────
async function callAnthropic(
  apiKey: string,
  imageBase64: string,
  mimeType: string,
): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: imageBase64,
              },
            },
            { type: "text", text: EXTRACTION_PROMPT },
          ],
        },
      ],
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Anthropic ${res.status}: ${err.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  return data.content?.[0]?.text ?? "";
}

async function callOpenAI(
  apiKey: string,
  imageBase64: string,
  mimeType: string,
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${imageBase64}` },
            },
            { type: "text", text: EXTRACTION_PROMPT },
          ],
        },
      ],
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`OpenAI ${res.status}: ${err.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? "";
}

// ─── Route ────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = ScanSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { imageBase64, mimeType } = parsed.data;

  // Load AI settings from DB
  let provider: "OPENAI" | "ANTHROPIC" = "ANTHROPIC";
  let apiKey: string | null = null;

  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId: MOCK_OWNER_ID },
    });
    if (settings) {
      provider = (settings.preferredAi as "OPENAI" | "ANTHROPIC") ?? "ANTHROPIC";
      const encKey =
        provider === "OPENAI" ? settings.openaiApiKey : settings.anthropicApiKey;
      if (encKey) {
        try {
          apiKey = decrypt(encKey);
        } catch {
          apiKey = null;
        }
      }
    }
  } catch {
    // DB offline — fall through to error below
  }

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "no_ai_key",
        message:
          "No AI API key configured. Add your key in Settings → AI Assistant.",
      },
      { status: 422 },
    );
  }

  // Call AI vision
  let rawText: string;
  try {
    rawText =
      provider === "ANTHROPIC"
        ? await callAnthropic(apiKey, imageBase64, mimeType)
        : await callOpenAI(apiKey, imageBase64, mimeType);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI call failed" },
      { status: 502 },
    );
  }

  // Parse JSON from AI response (strip any markdown fences)
  let extracted: {
    amount?: number | null;
    date?: string | null;
    method?: string | null;
    party?: string | null;
    memo?: string | null;
  } = {};

  try {
    const clean = rawText
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();
    extracted = JSON.parse(clean) as typeof extracted;
  } catch {
    return NextResponse.json(
      { error: "AI returned unparseable response", raw: rawText.slice(0, 300) },
      { status: 422 },
    );
  }

  // Validate extracted amount
  const amount =
    typeof extracted.amount === "number" && Number.isFinite(extracted.amount)
      ? Math.abs(extracted.amount)
      : null;

  // Validate date
  const dateRaw = extracted.date ?? null;
  const date =
    dateRaw && /^\d{4}-\d{2}-\d{2}$/.test(dateRaw) ? dateRaw : null;

  // Validate method
  const VALID_METHODS = ["CASH", "CHECK", "ACH", "CARD", "ZELLE", "VENMO", "OTHER"];
  const method =
    extracted.method && VALID_METHODS.includes(extracted.method.toUpperCase())
      ? extracted.method.toUpperCase()
      : "OTHER";

  const party = extracted.party ?? null;
  const memo = extracted.memo ?? null;

  // Tenant matching
  let tenantMatch: { id: string; name: string } | null = null;
  if (party) {
    try {
      const tenants = await prisma.tenant.findMany({
        where: { ownerId: MOCK_OWNER_ID },
        select: { id: true, firstName: true, lastName: true },
      });
      tenantMatch = findTenantMatch(party, tenants);
    } catch {
      // Non-fatal
    }
  }

  return NextResponse.json({
    amount,
    date,
    method,
    party,
    memo,
    tenantId: tenantMatch?.id ?? null,
    tenantName: tenantMatch?.name ?? null,
    confidence: amount !== null ? "high" : "low",
  });
}
