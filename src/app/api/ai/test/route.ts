import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const TestSchema = z.object({
  provider: z.enum(["OPENAI", "ANTHROPIC"]),
  apiKey: z.string().min(1, "apiKey is required").max(500),
});

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = TestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? "Validation failed" },
      { status: 400 },
    );
  }

  const { provider, apiKey } = parsed.data;

  try {
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
          max_tokens: 5,
          messages: [{ role: "user", content: "ping" }],
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return NextResponse.json({
          ok: false,
          message: `Anthropic ${res.status}: ${text.slice(0, 200) || res.statusText}`,
        });
      }
      return NextResponse.json({ ok: true, message: "Anthropic key works." });
    }

    // OPENAI
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 5,
        messages: [{ role: "user", content: "ping" }],
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json({
        ok: false,
        message: `OpenAI ${res.status}: ${text.slice(0, 200) || res.statusText}`,
      });
    }
    return NextResponse.json({ ok: true, message: "OpenAI key works." });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      message: err instanceof Error ? err.message : "Network error",
    });
  }
}
