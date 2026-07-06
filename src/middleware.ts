import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/onboarding",
  "/profile",
  "/me",
  "/settings",
  "/notifications",
  "/admin",
  "/my-venues",
  "/games/new",
  "/trainings/new",
  "/partners/new",
  "/tournaments/new",
  "/venues/new",
];

const PROTECTED_SUFFIXES = ["/manage", "/responses", "/edit"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected =
    PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    PROTECTED_SUFFIXES.some((s) => pathname.endsWith(s));
  if (!isProtected) return NextResponse.next();

  const hasSession = request.cookies.get("has_session")?.value === "1";
  if (hasSession) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/onboarding",
    "/profile/:path*",
    "/me/:path*",
    "/settings/:path*",
    "/notifications/:path*",
    "/admin/:path*",
    "/my-venues",
    "/games/:path*",
    "/trainings/:path*",
    "/partners/:path*",
    "/tournaments/:path*",
    "/venues/:path*",
  ],
};
