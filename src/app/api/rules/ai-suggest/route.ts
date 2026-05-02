// PropFlow — AI Rule Suggester
// POST /api/rules/ai-suggest
// Takes a plain-English description of what a rule should do.
// Returns a structured rule + human-readable explanation + example transaction.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption/aes";

export const runtime = "nodejs";

const MOCK_OWNER_ID = "00000000-0000-0000-0000-000000000001";

const RequestSchema = z.object({
  description: z.string().min(5, "Please describe the rule").max(500),
});

// ─── Prompt ──────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a PropFlow transaction rule assistant.
PropFlow lets landlords create rules that automatically categorize financial transactions for Schedule E tax reporting.

A rule has these fields:
- name: short label for the rule (max 60 chars)
- matchField: which transaction field to check. One of: PAYEE, PAYER, MEMO, AMOUNT, METHOD
- matchOperator: how to compare. One of: EQUALS, CONTAINS, STARTS_WITH, GREATER_THAN, LESS_THAN
- matchValue: the value to compare against (string; for AMOUNT comparisons this is a number as string)
- setCategory: the category name to assign (optional, e.g. "Management fees", "Utilities", "Repairs & maintenance")
- setScheduleELine: the IRS Schedule E line number (integer 3–19, or null). Key lines: 3=rent income, 5=advertising, 6=auto/travel, 7=commissions, 9=insurance, 10=legal/professional, 11=management fees, 12=mortgage interest, 13=other interest, 14=repairs & maintenance, 15=supplies, 16=property taxes, 17=utilities, 18=depreciation, 19=other expenses
- setTaxBadge: one of DEDUCTIBLE, INCOME, NON_DEDUCTIBLE, REVIEW, UNCATEGORIZED (or null)
- priority: integer 0–10000, lower runs first (default 100)
- enabled: true

Also return:
- explanation: 1–2 sentence plain-English summary of what the rule does
- example: a short example transaction and what would happen ("e.g. A $150 payment to Con Edison would be tagged as Utilities, Schedule E Line 17, Deductible.")

Respond ONLY with a valid JSON object. No markdown, no explanation outside the JSON.

Example output for "whenever I pay Joseph Neff tag it as management fees":
{
  "name": "Joseph Neff → Management fees",
  "matchField": "PAYEE",
  "matchOperator": "EQUALS",
  "matchValue": "Joseph Neff",
  "setCategory": "Management fees",
  "setScheduleELine": 11,
  "setTaxBadge": "DEDUCTIBLE",
  "priority": 100,
  "enabled": true,
  "explanation": "Any payment where the payee is exactly 'Joseph Neff' will be automatically categorized as Management fees, tagged as deductible, and mapped to Schedule E Line 11.",
  "example": "A $500 payment to Joseph Neff will be instantly tagged: Category → Management fees · Sch. E Line 11 · Deductible badge."
}`;

// ─── AI helpers ───────────────────────────────────────────────────────────────
async function callAnthropic(apiKey: string, description: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: description }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text().catch(() => "")}`);
  const data = (await res.json()) as { content?: Array<{ text?: string }> };
  return data.content?.[0]?.text ?? "";
}

async function callOpenAI(apiKey: string, description: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 600,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: description },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text().catch(() => "")}`);
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content ?? "";
}

// ─── Route ────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let json: unknown;
  try { json = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const parsed = RequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { description } = parsed.data;

  // Load AI settings
  let provider: "OPENAI" | "ANTHROPIC" = "ANTHROPIC";
  let apiKey: string | null = null;
  try {
    const settings = await prisma.userSettings.findUnique({ where: { userId: MOCK_OWNER_ID } });
    if (settings) {
      provider = (settings.preferredAi as "OPENAI" | "ANTHROPIC") ?? "ANTHROPIC";
      const encKey = provider === "OPENAI" ? settings.openaiApiKey : settings.anthropicApiKey;
      if (encKey) { try { apiKey = decrypt(encKey); } catch { apiKey = null; } }
    }
  } catch { /* DB offline */ }

  if (!apiKey) {
    return NextResponse.json(
      { error: "no_ai_key", message: "No AI key configured. Add it in Settings → AI Assistant." },
      { status: 422 },
    );
  }

  // Call AI
  let rawText: string;
  try {
    rawText = provider === "ANTHROPIC"
      ? await callAnthropic(apiKey, description)
      : await callOpenAI(apiKey, description);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI call failed" },
      { status: 502 },
    );
  }

  // Parse response
  let suggestion: Record<string, unknown>;
  try {
    const clean = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    suggestion = JSON.parse(clean) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "AI returned unparseable response", raw: rawText.slice(0, 300) }, { status: 422 });
  }

  // Validate the rule fields
  const VALID_FIELDS = ["PAYEE", "PAYER", "MEMO", "AMOUNT", "METHOD"];
  const VALID_OPS = ["EQUALS", "CONTAINS", "STARTS_WITH", "GREATER_THAN", "LESS_THAN"];
  const VALID_BADGES = ["DEDUCTIBLE", "INCOME", "NON_DEDUCTIBLE", "REVIEW", "UNCATEGORIZED"];

  const rule = {
    name: String(suggestion.name ?? "AI-generated rule").slice(0, 120),
    matchField: VALID_FIELDS.includes(String(suggestion.matchField)) ? String(suggestion.matchField) : "PAYEE",
    matchOperator: VALID_OPS.includes(String(suggestion.matchOperator)) ? String(suggestion.matchOperator) : "CONTAINS",
    matchValue: String(suggestion.matchValue ?? ""),
    setCategory: suggestion.setCategory ? String(suggestion.setCategory) : null,
    setScheduleELine: typeof suggestion.setScheduleELine === "number" ? suggestion.setScheduleELine : null,
    setTaxBadge: VALID_BADGES.includes(String(suggestion.setTaxBadge)) ? String(suggestion.setTaxBadge) : null,
    priority: typeof suggestion.priority === "number" ? suggestion.priority : 100,
    enabled: true,
  };

  return NextResponse.json({
    rule,
    explanation: String(suggestion.explanation ?? ""),
    example: String(suggestion.example ?? ""),
  });
}
