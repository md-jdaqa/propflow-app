import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  // Stub — real account deletion requires authenticated user context and is
  // out of scope for this subagent. Returning ok:true so the UI confirm flow
  // can be exercised end-to-end.
  return NextResponse.json({ ok: true, message: "Deletion stub acknowledged." });
}
