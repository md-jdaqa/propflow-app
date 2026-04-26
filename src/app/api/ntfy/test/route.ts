import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const NtfyTestSchema = z.object({
  topic: z.string().min(1, "topic is required").max(120),
  token: z.string().max(500).optional().or(z.literal("")),
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

  const parsed = NtfyTestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? "Validation failed" },
      { status: 400 },
    );
  }

  const { topic, token } = parsed.data;
  const headers: Record<string, string> = {
    "content-type": "text/plain",
    Title: "PropFlow",
    Tags: "bell",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
      method: "POST",
      headers,
      body: "PropFlow test notification",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json({
        ok: false,
        message: `ntfy ${res.status}: ${text.slice(0, 200) || res.statusText}`,
      });
    }
    return NextResponse.json({
      ok: true,
      message: "Sent. Check your ntfy app.",
    });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      message: err instanceof Error ? err.message : "Network error",
    });
  }
}
