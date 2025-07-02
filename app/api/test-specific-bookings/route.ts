import { NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: Request) {
  try {
    console.log(`🧪 Testing specific known bookings`)

    const client = createTravelCompositorClient(1)
    const testBookings = ["RRP-9263", "RRP-9488", "RRP-9487", "RRP-9486", "RRP-9485"]

    const results = []

    for (const bookingId of testBookings) {
      try {
        console.log(`Testing ${bookingId}...`)

        // Try direct lookup first
        let booking = null
        let method = "none"

        try {
          booking = await client.getBookingByReference(bookingId)
          method = "direct"
        } catch (error) {
          // Try search method
          try {
            booking = await client.getBooking(bookingId)
            method = "search"
          } catch (searchError) {
            method = "failed"
          }
        }

        results.push({
          bookingId,
          found: !!booking,
          method,
          data: booking
            ? {
                id: booking.id,
                title: booking.title || booking.name,
                status: booking.status,
                startDate: booking.startDate,
                endDate: booking.endDate,
              }
            : null,
        })
      } catch (error) {
        results.push({
          bookingId,
          found: false,
          method: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        found: results.filter((r) => r.found).length,
        notFound: results.filter((r) => !r.found).length,
      },
    })
  } catch (error) {
    console.error("❌ Test specific bookings error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
