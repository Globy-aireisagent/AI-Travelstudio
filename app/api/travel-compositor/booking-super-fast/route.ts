import type { NextRequest } from "next/server"
import { createMultiMicrositeClient } from "@/lib/travel-compositor-client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bookingId = searchParams.get("bookingId")
    const configNumber = Number.parseInt(searchParams.get("config") || "1")
    const optimized = searchParams.get("optimized") === "true"

    console.log(`🚀 SUPER FAST BOOKING API:`)
    console.log(`- Booking ID: ${bookingId}`)
    console.log(`- Config Number: ${configNumber}`)
    console.log(`- Optimized: ${optimized}`)

    if (!bookingId) {
      return Response.json({ success: false, error: "Missing bookingId parameter" }, { status: 400 })
    }

    // Create multi-microsite client to search across all available microsites
    const multiClient = createMultiMicrositeClient()

    console.log(`🔍 Searching for booking ${bookingId} across all microsites...`)

    // Search across all microsites
    const result = await multiClient.searchBookingAcrossAllMicrosites(bookingId)

    if (result) {
      const { client, booking } = result

      // Transform to roadbook format if optimized
      let transformedBooking = booking
      if (optimized) {
        try {
          transformedBooking = client.transformBookingToRoadbook(booking)
          console.log(`✅ Booking transformed to roadbook format`)
        } catch (error) {
          console.log(`⚠️ Could not transform to roadbook format:`, error)
          // Continue with original booking data
        }
      }

      return Response.json({
        success: true,
        booking: transformedBooking,
        microsite: client.config.micrositeId,
        method: "multi_microsite_search",
        optimized,
        searchedId: bookingId,
      })
    }

    return Response.json({
      success: false,
      error: `Booking ${bookingId} not found in any microsite`,
      searchedId: bookingId,
      availableMicrosites: multiClient.getAllClients().map((c) => c.config.micrositeId),
    })
  } catch (error) {
    console.error("❌ Super Fast Booking API Error:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        searchedId: request.nextUrl.searchParams.get("bookingId"),
      },
      { status: 500 },
    )
  }
}
