import { type NextRequest, NextResponse } from "next/server"
import { SingleMicrositeImporter } from "@/lib/single-microsite-importer"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting single microsite import...")

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

    // Importeer alleen agencies eerst
    const importResult = await importer.importAgenciesOnly()

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${importResult.totalAgencies} agencies from microsite 1`,
      data: {
        totalAgencies: importResult.totalAgencies,
        totalUsers: 0, // Nog niet geïmplementeerd
        totalBookings: 0, // Nog niet geïmplementeerd
        totalIdeas: 0, // Nog niet geïmplementeerd
        agencies: importResult.agencies.map((agency) => ({
          id: agency.id,
          name: agency.name,
          micrositeId: agency.micrositeId,
          usersCount: 0,
          creditBalance: agency.creditBalance,
          users: [],
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
