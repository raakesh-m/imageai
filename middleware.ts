import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("auth_token");
  const isLoginPage = request.nextUrl.pathname === "/login";

  // Allow access to login page and API routes
  if (isLoginPage || request.nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  if (!authCookie?.value) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}; 