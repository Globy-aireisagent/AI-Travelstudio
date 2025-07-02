import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const configNumber = Number.parseInt(searchParams.get("config") || "1")

    console.log(`🔢 Getting booking count for config ${configNumber}`)

    const client = createTravelCompositorClient(configNumber)
    const countResult = await client.getBookingCount()

    return NextResponse.json({
      success: true,
      total: countResult.total,
      details: countResult.details,
      configNumber,
    })
  } catch (error) {
    console.error("❌ Error getting booking count:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
