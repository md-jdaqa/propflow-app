import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption/aes";

export const runtime = "nodejs";

const MOCK_OWNER_ID = "00000000-0000-0000-0000-000000000001";

const AiSettingsSchema = z.object({
  preferredAi: z.enum(["OPENAI", "ANTHROPIC"]),
  openaiApiKey: z.string().max(500).optional().or(z.literal("")),
  anthropicApiKey: z.string().max(500).optional().or(z.literal("")),
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

  const parsed = AiSettingsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Validation failed",
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 },
    );
  }

  const { preferredAi, openaiApiKey, anthropicApiKey } = parsed.data;

  let openaiEnc: string | null = null;
  let anthropicEnc: string | null = null;
  try {
    openaiEnc = openaiApiKey ? encrypt(openaiApiKey) : null;
    anthropicEnc = anthropicApiKey ? encrypt(anthropicApiKey) : null;
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        message:
          err instanceof Error
            ? `Encryption failed: ${err.message}`
            : "Encryption failed",
      },
      { status: 500 },
    );
  }

  try {
    await prisma.userSettings.upsert({
      where: { userId: MOCK_OWNER_ID },
      create: {
        userId: MOCK_OWNER_ID,
        preferredAi,
        openaiApiKey: openaiEnc,
        anthropicApiKey: anthropicEnc,
      },
      update: {
        preferredAi,
        ...(openaiEnc !== null ? { openaiApiKey: openaiEnc } : {}),
        ...(anthropicEnc !== null ? { anthropicApiKey: anthropicEnc } : {}),
      },
    });
    return NextResponse.json({ ok: true, persisted: true });
  } catch {
    return NextResponse.json({ ok: true, persisted: false });
  }
}
