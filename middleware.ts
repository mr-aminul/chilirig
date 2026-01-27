import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes (except login page)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!isAuthenticated(request)) {
      // Redirect to login page
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow all other requests
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    "/admin/:path*",
  ],
};
