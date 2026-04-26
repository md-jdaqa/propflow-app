import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/sign-in?error=missing_code", req.url), {
      status: 303,
    });
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, req.url),
        { status: 303 },
      );
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "exchange_failed";
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(msg)}`, req.url),
      { status: 303 },
    );
  }

  return NextResponse.redirect(new URL("/", req.url), { status: 303 });
}
