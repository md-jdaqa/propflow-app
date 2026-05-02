import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "../utils/supabase/middleware";

const PUBLIC_PATHS = [
  "/sign-in",
  "/sign-up",
  "/auth/callback",
  "/auth/signin",
  "/auth/signup",
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
  "/maintenance",
  "/messages",
  "/leases",
  "/tasks",
];

function isPublicPath(pathname: string): boolean {
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

  if (isPublicPath(pathname)) return NextResponse.next();
  if (!isProtectedPath(pathname)) return NextResponse.next();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
  if (!supabaseUrl || !supabaseKey) return NextResponse.next();

  const { response, user } = await updateSession(request);

  if (!user) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|version.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|map)$).*)",
  ],
};
