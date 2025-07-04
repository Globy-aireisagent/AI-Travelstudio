import { type NextRequest, NextResponse } from "next/server"

// Mock session - in productie zou dit uit een echte auth provider komen
export async function GET(request: NextRequest) {
  try {
    // Haal session uit headers, cookies, of JWT token
    const authHeader = request.headers.get("authorization")
    const sessionCookie = request.cookies.get("session")?.value

    // Mock user session - vervang dit met echte authenticatie
    const mockSessions = {
      "agent@reisbureau.nl": {
        email: "agent@reisbureau.nl",
        role: "agent" as const,
        agencyId: "agency_123",
        agencyName: "Reisburo Jansen",
        micrositeAccess: ["1"], // Alleen toegang tot microsite 1
      },
      "admin@travelstudio.nl": {
        email: "admin@travelstudio.nl",
        role: "admin" as const,
        agencyId: "agency_456",
        agencyName: "Travel Studio Admin",
        micrositeAccess: ["1", "2", "3"], // Toegang tot meerdere microsites
      },
      "superadmin@system.nl": {
        email: "superadmin@system.nl",
        role: "super_admin" as const,
        micrositeAccess: ["1", "2", "3", "4"], // Toegang tot alle microsites
      },
    }

    // Voor demo doeleinden, gebruik query parameter om user te simuleren
    const { searchParams } = new URL(request.url)
    const mockUser = searchParams.get("user") || "agent@reisbureau.nl"

    const session = mockSessions[mockUser as keyof typeof mockSessions]

    if (!session) {
      return NextResponse.json({ error: "No valid session" }, { status: 401 })
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ error: "Session check failed" }, { status: 500 })
  }
}
