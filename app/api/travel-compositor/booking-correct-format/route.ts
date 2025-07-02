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

    console.log(`🎯 TESTING CORRECT BOOKING FORMAT`)
    console.log(`- Booking ID: ${bookingId}`)
    console.log(`- Config: ${configNumber}`)

    const startTime = Date.now()
    const client = createTravelCompositorClient(configNumber)

    // Probeer de bestaande werkende methode uit travel-compositor-client.ts
    try {
      console.log(`📞 Using existing getBookingByReference method...`)
      const booking = await client.getBookingByReference(bookingId)
      const endTime = Date.now()

      console.log(`✅ getBookingByReference successful in ${endTime - startTime}ms`)

      return Response.json({
        success: true,
        booking: booking,
        method: "getBookingByReference",
        responseTime: `${endTime - startTime}ms`,
        bookingId: bookingId,
        config: configNumber,
      })
    } catch (error) {
      console.log(`❌ getBookingByReference failed:`, error)
    }

    // Probeer de getBooking methode (search method)
    try {
      console.log(`📞 Using existing getBooking method...`)
      const booking = await client.getBooking(bookingId)
      const endTime = Date.now()

      if (booking) {
        console.log(`✅ getBooking successful in ${endTime - startTime}ms`)
        return Response.json({
          success: true,
          booking: booking,
          method: "getBooking_search",
          responseTime: `${endTime - startTime}ms`,
          bookingId: bookingId,
          config: configNumber,
        })
      } else {
        console.log(`❌ getBooking returned null`)
      }
    } catch (error) {
      console.log(`❌ getBooking failed:`, error)
    }

    // Als beide falen, geef details terug
    const endTime = Date.now()
    return Response.json({
      success: false,
      error: "Both getBookingByReference and getBooking methods failed",
      responseTime: `${endTime - startTime}ms`,
      bookingId: bookingId,
      config: configNumber,
      suggestion: "Check /api/travel-compositor/debug-booking-endpoints for working endpoints",
    })
  } catch (error) {
    console.error("❌ Booking format test error:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
