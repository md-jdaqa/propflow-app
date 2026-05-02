/**
 * POST /api/ai/command
 * Universal AI command interpreter for PropFlow.
 *
 * Accepts a natural-language instruction from the user and returns:
 *  - action: what to do (navigate, fill_form, show_info, run_query, etc.)
 *  - payload: structured data for that action
 *  - message: human-readable confirmation
 *
 * The frontend GlobalAiBar executes the action.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption/aes";

export const runtime = "nodejs";

const MOCK_OWNER_ID = "00000000-0000-0000-0000-000000000001";

const RequestSchema = z.object({
  command: z.string().min(1).max(2000),
  context: z.record(z.unknown()).optional(), // current page, open modal, etc.
});

const SYSTEM_PROMPT = `You are PropFlow AI, an intelligent assistant embedded in a property management dashboard.
PropFlow helps landlords manage properties, tenants, finances, maintenance, leases, and more.

You interpret natural-language commands and return a structured JSON action for the frontend to execute.

Available actions:
- navigate: go to a page. payload: { href: string }
- open_modal: open a specific modal. payload: { modal: "record_payment" | "add_tenant" | "add_property" | "add_maintenance" | "create_lease" | "send_message" | "add_eviction" | "add_application" }
- fill_form: pre-fill a form with data. payload: { modal: string, fields: Record<string, string> }
- show_info: display information inline. payload: { message: string, data?: Record<string, unknown> }
- run_action: trigger a backend action. payload: { action: string, params: Record<string, unknown> }
- move_nav: reorder nav items. payload: { fromLabel: string, toLabel: string }
- search: search across the app. payload: { query: string, scope?: string }

Pages / routes in PropFlow:
- / → Dashboard (overview, stats, recent activity)
- /properties → Properties (list, add, edit properties)
- /tenants → Tenants (list, add, edit tenants)
- /finances → Finances (income, expenses, transactions, ledger)
- /maintenance → Maintenance requests (create, update, assign contractors)
- /leases → Leases (create lease, renew, eSign, track expirations)
- /applications → Rental applications (review, approve, deny, create lease from)
- /listings → Listings (create listing, syndicate to Zillow/Apartments.com)
- /inspections → Inspections (schedule, complete, photo docs, score)
- /tasks → Tasks (create AI tasks, track to-do/in-progress/done)
- /messages → Messages (tenant communication, AI reply suggestions)
- /evictions → Evictions (case management, legal steps, mediator)
- /bank-reconciliation → Bank Reconciliation (match GL to bank, resolve discrepancies)
- /owner-portal → Owner Portal (statements, repair approvals, portfolio overview)
- /recurring-payments → Recurring Payments (rent schedules, auto-pay, utilities)
- /budget → Budget Tracker (per-property budget vs actuals, NOI, variance)
- /reports → Reports (rent roll, Schedule E, income/expense, custom AI reports)
- /settings → Settings (account, integrations, notifications, themes)

Form fields available:
- record_payment: amount, paidOn (date), method (CASH/CHECK/ZELLE/VENMO/ACH/CREDIT_CARD/OTHER), party (payer name), tenantId, memo, category, scheduleELine
- add_tenant: firstName, lastName, email, phone, unitId, leaseStart, leaseEnd, monthlyRent
- add_property: address, city, state, zip, units, type (SINGLE_FAMILY/MULTI_UNIT/CONDO/COMMERCIAL)
- add_maintenance: title, description, priority (LOW/ROUTINE/URGENT/EMERGENCY), propertyId, tenantId, category
- create_lease: tenantId, propertyId, unitId, startDate, endDate, monthlyRent, securityDeposit
- send_message: recipientId, recipientType (TENANT/VENDOR), subject, body

Examples:
User: "log a $1500 rent payment from Jake for 123 Main"
→ { "action": "fill_form", "payload": { "modal": "record_payment", "fields": { "amount": "1500", "party": "Jake", "memo": "Rent - 123 Main" } }, "message": "Opening payment form pre-filled for Jake — $1,500." }

User: "go to maintenance"
→ { "action": "navigate", "payload": { "href": "/maintenance" }, "message": "Navigating to Maintenance." }

User: "move properties above dashboard"
→ { "action": "move_nav", "payload": { "fromLabel": "Properties", "toLabel": "Dashboard" }, "message": "Moving Properties above Dashboard in the navigation." }

User: "send a message to tenant John about rent due"
→ { "action": "fill_form", "payload": { "modal": "send_message", "fields": { "subject": "Rent Due Reminder", "body": "Hi John, this is a friendly reminder that your rent payment is due soon. Please let us know if you have any questions." } }, "message": "Opening message composer pre-filled for John." }

User: "create an emergency maintenance request for broken pipe at 406 Oak St"
→ { "action": "fill_form", "payload": { "modal": "add_maintenance", "fields": { "title": "Broken Pipe", "description": "Emergency broken pipe at 406 Oak St requiring immediate attention.", "priority": "EMERGENCY" } }, "message": "Opening maintenance form — Emergency broken pipe." }

User: "Show bank reconciliation"
→ { "action": "navigate", "payload": { "href": "/bank-reconciliation" }, "message": "Navigating to Bank Reconciliation." }

User: "Open owner portal"
→ { "action": "navigate", "payload": { "href": "/owner-portal" }, "message": "Navigating to Owner Portal." }

User: "Show recurring payments"
→ { "action": "navigate", "payload": { "href": "/recurring-payments" }, "message": "Navigating to Recurring Payments." }

User: "Check my budget"
→ { "action": "navigate", "payload": { "href": "/budget" }, "message": "Navigating to Budget Tracker." }

User: "Set up auto-pay for Sarah Chen"
→ { "action": "navigate", "payload": { "href": "/recurring-payments" }, "message": "Navigating to Recurring Payments to set up auto-pay for Sarah Chen." }

User: "View May owner statement"
→ { "action": "navigate", "payload": { "href": "/owner-portal" }, "message": "Navigating to Owner Portal to view the May statement." }

Respond ONLY with valid JSON. No markdown. No explanation outside JSON. Always include: action, payload, message.
If the command is unclear, use action "show_info" with a helpful message asking for clarification.`;

async function callAi(apiKey: string, provider: "ANTHROPIC" | "OPENAI", command: string, context: Record<string, unknown>): Promise<string> {
  const userMsg = context && Object.keys(context).length > 0
    ? `${command}\n\n[Context: ${JSON.stringify(context)}]`
    : command;

  if (provider === "ANTHROPIC") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMsg }],
      }),
    });
    if (!res.ok) throw new Error(`Anthropic ${res.status}`);
    const data = (await res.json()) as { content?: Array<{ text?: string }> };
    return data.content?.[0]?.text ?? "";
  } else {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 400,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMsg },
        ],
      }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}`);
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return data.choices?.[0]?.message?.content ?? "";
  }
}

export async function POST(req: NextRequest) {
  let json: unknown;
  try { json = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = RequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { command, context = {} } = parsed.data;

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
      { error: "no_ai_key", message: "No AI key configured. Go to Settings → AI Assistant to add one." },
      { status: 422 },
    );
  }

  let rawText: string;
  try {
    rawText = await callAi(apiKey, provider, command, context);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI call failed" },
      { status: 502 },
    );
  }

  let result: Record<string, unknown>;
  try {
    const clean = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    result = JSON.parse(clean) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "AI returned unparseable response" }, { status: 422 });
  }

  return NextResponse.json(result);
}
