import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Alleen beschermen van admin routes
  if (
    request.nextUrl.pathname.startsWith("/single-microsite-test") ||
    request.nextUrl.pathname.startsWith("/travel-compositor-import") ||
    request.nextUrl.pathname.startsWith("/admin")
  ) {
    const isAuthenticated = request.cookies.get("admin-auth")?.value === "authenticated"

    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/admin-login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/single-microsite-test/:path*", "/travel-compositor-import/:path*", "/admin/:path*"],
}
