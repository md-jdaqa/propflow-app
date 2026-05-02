import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = [
  "/sign-in",
  "/sign-up",
  "/auth/callback",
  "/api/changelog",
  "/favicon.ico",
  "/manifest.json",
  "/version.json",
];

const PROTECTED_PREFIXES = [
  "/properties",
  "/tenants",
  "/finances",
  "/settings",
];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/" /* root - handled below */) return false;
  if (pathname.startsWith("/_next")) return true;
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isProtectedPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths through.
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // If not a protected path we care about, pass through.
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  // Supabase not configured — let the request through (dev/local mode).
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  // Refresh session cookies first.
  const response = await updateSession(request);

  // Then check whether we have a session.
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      set(_name: string, _value: string, _options: CookieOptions) {
        // no-op — updateSession already wrote cookies onto `response`.
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      remove(_name: string, _options: CookieOptions) {
        // no-op
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  if (!user) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return response;
}

export const config = {
  // Skip Next internals and static assets.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|version.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|map)$).*)",
  ],
};
