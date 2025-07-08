import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /admin, /dashboard)
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const publicPaths = [
    "/",
    "/about",
    "/help",
    "/privacy",
    "/terms",
    "/feature-request",
    "/test-neon",
    "/database-setup",
    "/api/feature-requests",
    "/api/test-neon",
    "/api/test-database-url",
    "/api/travel-buddies",
  ]

  // Define admin paths that require special permissions
  const adminPaths = ["/admin", "/super-admin"]

  // Check if the path is public
  const isPublicPath = publicPaths.some((publicPath) => path.startsWith(publicPath))

  // Allow public paths
  if (isPublicPath) {
    return NextResponse.next()
  }

  // For now, allow all other paths (since we don't have authentication yet)
  // In the future, you can add authentication logic here
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
