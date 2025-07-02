import { type NextRequest, NextResponse } from "next/server"
import { createFastMultiMicrositeClient } from "@/lib/travel-compositor-client-fast"

export async function POST(request: NextRequest) {
  try {
    const { micrositeId } = await request.json()

    // Get credentials for specific microsite
    const suffix = micrositeId === 1 ? "" : `_${micrositeId}`
    const username = process.env[`TRAVEL_COMPOSITOR_USERNAME${suffix}`]
    const password = process.env[`TRAVEL_COMPOSITOR_PASSWORD${suffix}`]
    const microsite = process.env[`TRAVEL_COMPOSITOR_MICROSITE_ID${suffix}`]

    if (!username || !password || !microsite) {
      return NextResponse.json({
        success: false,
        error: "Missing credentials",
      })
    }

    // Test connection by trying to fetch a booking
    const fastClient = createFastMultiMicrositeClient()
    const testResult = await fastClient.testMicrositeConnection(micrositeId)

    return NextResponse.json({
      success: testResult.success,
      error: testResult.error,
      details: {
        username: username.substring(0, 3) + "***",
        micrositeId: microsite,
        responseTime: testResult.responseTime,
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
