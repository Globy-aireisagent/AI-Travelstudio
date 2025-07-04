import { type NextRequest, NextResponse } from "next/server"
import { TravelCompositorUserManager } from "@/lib/travel-compositor-user-manager"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Starting Travel Compositor user scan...")

    const { includeInactive = false } = await request.json()

    const userManager = new TravelCompositorUserManager()
    const importData = await userManager.importAllData()

    // Filter en valideer gebruikers voor import
    const importableUsers = []

    for (const agency of importData.agencies) {
      for (const user of agency.users) {
        // Bepaal of deze user geïmporteerd kan worden
        const canImport = validateUserForImport(user)

        importableUsers.push({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          agencyName: agency.name,
          agencyId: user.agencyId,
          micrositeId: user.micrositeId,
          role: user.role,
          status: user.status,
          bookingsCount: user.bookings.length,
          ideasCount: user.ideas.length,
          lastLogin: user.lastLogin,
          canImport: canImport.canImport,
          importReason: canImport.reason,
        })
      }
    }

    // Filter op actieve gebruikers als gewenst
    const filteredUsers = includeInactive ? importableUsers : importableUsers.filter((user) => user.status === "active")

    console.log(
      `✅ Scan complete: ${filteredUsers.length} users found (${filteredUsers.filter((u) => u.canImport).length} importable)`,
    )

    return NextResponse.json({
      success: true,
      users: filteredUsers,
      summary: {
        total: filteredUsers.length,
        importable: filteredUsers.filter((u) => u.canImport).length,
        agencies: importData.agencies.length,
        microsites: [...new Set(filteredUsers.map((u) => u.micrositeId))].length,
      },
    })
  } catch (error) {
    console.error("❌ User scan failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

function validateUserForImport(user: any): { canImport: boolean; reason?: string } {
  // Validatie regels voor import

  if (!user.email || !user.email.includes("@")) {
    return { canImport: false, reason: "Geen geldig email adres" }
  }

  if (user.email.includes("test@") || user.email.includes("demo@")) {
    return { canImport: false, reason: "Test/demo account" }
  }

  if (user.status === "suspended") {
    return { canImport: false, reason: "Account is suspended" }
  }

  if (!user.firstName && !user.lastName) {
    return { canImport: false, reason: "Geen naam informatie" }
  }

  // Systeem accounts uitsluiten
  if (user.role === "system" || user.username?.startsWith("system_")) {
    return { canImport: false, reason: "Systeem account" }
  }

  return { canImport: true }
}
