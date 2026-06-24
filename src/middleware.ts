import { NextResponse, type NextRequest } from "next/server";

// Ранний редирект по cookie has_session; точная авторизация — на стороне API.
const PROTECTED_PREFIXES = ["/profile", "/events", "/partners", "/notifications", "/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (!isProtected) return NextResponse.next();

  const hasSession = request.cookies.get("has_session")?.value === "1";
  if (hasSession) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/profile/:path*", "/events/:path*", "/partners/:path*", "/notifications/:path*", "/admin/:path*"],
};
