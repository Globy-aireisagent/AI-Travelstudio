import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Beschermde routes
const protectedRoutes = [
  "/single-microsite-test",
  "/travel-compositor-import",
  "/universal-import",
  "/agent-dashboard",
  "/super-admin",
  "/master-dashboard",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check of de route beschermd is
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Check voor admin cookie
    const adminCookie = request.cookies.get("admin-access")

    if (!adminCookie || adminCookie.value !== "authenticated") {
      // Redirect naar login
      return NextResponse.redirect(new URL("/admin-login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
