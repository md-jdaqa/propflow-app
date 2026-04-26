import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    await supabase.auth.signOut().catch(() => undefined);
  } catch {
    // ignore — sign out should always succeed for the user
  }
  const url = new URL("/sign-in", req.url);
  return NextResponse.redirect(url, { status: 303 });
}
