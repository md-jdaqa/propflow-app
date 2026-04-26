import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption/aes";

export const runtime = "nodejs";

const MOCK_OWNER_ID = "00000000-0000-0000-0000-000000000001";

const NtfySettingsSchema = z.object({
  ntfyTopic: z.string().max(120).optional().or(z.literal("")),
  ntfyToken: z.string().max(500).optional().or(z.literal("")),
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

  const parsed = NtfySettingsSchema.safeParse(json);
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

  const { ntfyTopic, ntfyToken } = parsed.data;

  let tokenEnc: string | null = null;
  try {
    tokenEnc = ntfyToken ? encrypt(ntfyToken) : null;
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
        ntfyTopic: ntfyTopic || null,
        ntfyToken: tokenEnc,
      },
      update: {
        ntfyTopic: ntfyTopic || null,
        ...(tokenEnc !== null ? { ntfyToken: tokenEnc } : {}),
      },
    });
    return NextResponse.json({ ok: true, persisted: true });
  } catch {
    return NextResponse.json({ ok: true, persisted: false });
  }
}
