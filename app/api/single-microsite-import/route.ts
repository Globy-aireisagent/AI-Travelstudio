import { type NextRequest, NextResponse } from "next/server"
import { SingleMicrositeImporter } from "@/lib/single-microsite-importer"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting complete single microsite import...")

    const importer = new SingleMicrositeImporter()

    // Test eerst de authenticatie
    const authTest = await importer.testAuthentication()
    if (!authTest.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication failed",
          details: authTest.error,
          debug: {
            hasUsername: !!process.env.TRAVEL_COMPOSITOR_USERNAME,
            hasPassword: !!process.env.TRAVEL_COMPOSITOR_PASSWORD,
            hasMicrositeId: !!process.env.TRAVEL_COMPOSITOR_MICROSITE_ID,
            micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID,
          },
        },
        { status: 401 },
      )
    }

    // Complete import met users, bookings en ideas
    const importResult = await importer.importComplete()

    return NextResponse.json({
      success: true,
      message: `Successfully imported complete data from microsite 1: ${importResult.totalAgencies} agencies, ${importResult.totalUsers} users, ${importResult.totalBookings} bookings, ${importResult.totalIdeas} ideas`,
      data: {
        totalAgencies: importResult.totalAgencies,
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
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            bookingsCount: user.bookings.length,
            ideasCount: user.ideas.length,
            bookings: user.bookings.slice(0, 5), // Limiteer voor UI
            ideas: user.ideas.slice(0, 5), // Limiteer voor UI
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
