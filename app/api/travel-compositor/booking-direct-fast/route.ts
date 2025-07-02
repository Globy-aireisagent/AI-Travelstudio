import type { NextRequest } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bookingId = searchParams.get("bookingId")
    const configNumber = Number.parseInt(searchParams.get("config") || "1")

    if (!bookingId) {
      return Response.json({ success: false, error: "Missing bookingId parameter" })
    }

    console.log(`🚀 FAST DIRECT BOOKING CALL`)
    console.log(`- Booking ID: ${bookingId}`)
    console.log(`- Config: ${configNumber}`)

    const startTime = Date.now()
    const client = createTravelCompositorClient(configNumber)

    // 🎯 SINGLE DIRECT API CALL - NO FALLBACKS
    try {
      console.log(`📞 Making direct API call to Travel Compositor...`)
      const booking = await client.getBookingByReference(bookingId)
      const endTime = Date.now()

      console.log(`✅ Direct booking call successful in ${endTime - startTime}ms`)

      return Response.json({
        success: true,
        booking: booking,
        method: "direct_api_call",
        responseTime: `${endTime - startTime}ms`,
        bookingId: bookingId,
        config: configNumber,
      })
    } catch (error) {
      const endTime = Date.now()
      console.log(`❌ Direct API call failed in ${endTime - startTime}ms:`, error)

      return Response.json({
        success: false,
        error: error instanceof Error ? error.message : "Direct API call failed",
        method: "direct_api_call_failed",
        responseTime: `${endTime - startTime}ms`,
        bookingId: bookingId,
        config: configNumber,
      })
    }
  } catch (error) {
    console.error("❌ Fast booking API error:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
