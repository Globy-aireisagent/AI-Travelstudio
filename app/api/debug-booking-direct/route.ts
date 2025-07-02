import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get("bookingId")

    if (!bookingId) {
      return NextResponse.json({ success: false, error: "Booking ID is required" })
    }

    console.log(`🔍 Getting booking details for: ${bookingId}`)

    // Probeer alle microsites
    for (let config = 1; config <= 4; config++) {
      try {
        const response = await fetch(
          `/api/travel-compositor/booking-super-fast?config=${config}&bookingId=${bookingId}`,
        )
        const data = await response.json()

        if (data.success && data.booking) {
          return NextResponse.json({
            success: true,
            booking: data.booking,
            microsite: config,
            transportServices: data.booking.transportServices || [],
            segments: data.booking.transportServices?.[0]?.segment || [],
          })
        }
      } catch (error) {
        console.log(`Config ${config} failed:`, error)
        continue
      }
    }

    return NextResponse.json({ success: false, error: "Booking not found in any microsite" })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message })
  }
}
