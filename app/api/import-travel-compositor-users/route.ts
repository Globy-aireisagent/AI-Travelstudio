import { type NextRequest, NextResponse } from "next/server"
import { TravelCompositorUserManager } from "@/lib/travel-compositor-user-manager"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting Travel Compositor user and agency import...")

    const userManager = new TravelCompositorUserManager()

    // Test eerst authenticatie voor elke microsite
    const authResults = []
    for (let micrositeId = 1; micrositeId <= 4; micrositeId++) {
      try {
        const token = await userManager.authenticate(micrositeId.toString())
        authResults.push({ micrositeId, success: true, token: token.substring(0, 10) + "..." })
        console.log(`✅ Authentication successful for microsite ${micrositeId}`)
      } catch (error) {
        authResults.push({ micrositeId, success: false, error: error.message })
        console.log(`❌ Authentication failed for microsite ${micrositeId}:`, error.message)
      }
    }

    // Importeer alle data
    const importResult = await userManager.importAllData()

    console.log("📊 Import results:", {
      agencies: importResult.agencies.length,
      totalUsers: importResult.totalUsers,
      totalBookings: importResult.totalBookings,
      totalIdeas: importResult.totalIdeas,
    })

    // Als we geen data hebben, geef debug info terug
    if (importResult.agencies.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No data imported - check authentication and API endpoints",
          debug: {
            authResults,
            importResult,
            micrositeConfigs: {
              microsite1: !!process.env.TRAVEL_COMPOSITOR_USERNAME,
              microsite2: !!process.env.TRAVEL_COMPOSITOR_USERNAME_2,
              microsite3: !!process.env.TRAVEL_COMPOSITOR_USERNAME_3,
              microsite4: !!process.env.TRAVEL_COMPOSITOR_USERNAME_4,
            },
          },
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Travel Compositor import completed successfully",
      debug: { authResults },
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
            bookings: user.bookings,
            ideas: user.ideas,
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
        stack: error instanceof Error ? error.stack : undefined,
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
