import { NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get("bookingId") || "RRP-9263"

    console.log(`🧪 Testing with working client: ${bookingId}`)

    // Use the working client that we know works with RRP-9263
    const client = createTravelCompositorClient(1)

    // First try direct booking lookup
    try {
      const booking = await client.getBookingByReference(bookingId)
      if (booking) {
        return NextResponse.json({
          success: true,
          method: "direct-lookup",
          bookingId,
          found: true,
          booking: {
            id: booking.id || booking.bookingReference,
            title: booking.title || booking.name,
            status: booking.status,
            startDate: booking.startDate,
            endDate: booking.endDate,
          },
        })
      }
    } catch (error) {
      console.log("Direct lookup failed, trying search method...")
    }

    // Fallback to search method
    const booking = await client.getBooking(bookingId)

    return NextResponse.json({
      success: true,
      method: "search-method",
      bookingId,
      found: !!booking,
      booking: booking
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
    console.error("❌ Test working booking error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
