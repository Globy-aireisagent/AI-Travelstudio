import { type NextRequest, NextResponse } from "next/server"
import { TravelCompositorUserManager } from "@/lib/travel-compositor-user-manager"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting Travel Compositor user and agency import...")

    const userManager = new TravelCompositorUserManager()

    // Importeer alle data
    const importResult = await userManager.importAllData()

    // Sla data op in onze database (hier zou je naar Supabase kunnen schrijven)
    // Voor nu returnen we de data

    return NextResponse.json({
      success: true,
      message: "Travel Compositor import completed successfully",
      data: {
        totalAgencies: importResult.agencies.length,
        totalUsers: importResult.totalUsers,
        totalBookings: importResult.totalBookings,
        totalIdeas: importResult.totalIdeas,
        agencies: importResult.agencies.map((agency) => ({
          id: agency.id,
          name: agency.name,
          micrositeId: agency.micrositeId,
          usersCount: agency.users.length,
          creditBalance: agency.creditBalance,
          users: agency.users.map((user) => ({
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            status: user.status,
            bookingsCount: user.bookings.length,
            ideasCount: user.ideas.length,
            lastLogin: user.lastLogin,
          })),
        })),
      },
    })
  } catch (error) {
    console.error("❌ Import failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const micrositeId = searchParams.get("micrositeId") || "1"
    const agencyId = searchParams.get("agencyId")

    const userManager = new TravelCompositorUserManager()

    if (agencyId) {
      // Haal specifieke agency op
      const users = await userManager.getUsersByAgency(micrositeId, agencyId)
      const agencyDetails = await userManager.getAgencyDetails(micrositeId, agencyId)

      return NextResponse.json({
        success: true,
        agency: agencyDetails,
        users: users,
      })
    } else {
      // Haal alle agencies op van microsite
      const agencies = await userManager.getAllAgencies(micrositeId)

      return NextResponse.json({
        success: true,
        micrositeId,
        agencies: agencies,
      })
    }
  } catch (error) {
    console.error("❌ Get users failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
