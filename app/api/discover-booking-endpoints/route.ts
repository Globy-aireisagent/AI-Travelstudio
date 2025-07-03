import { type NextRequest, NextResponse } from "next/server"
import { BookingEndpointDiscoverer } from "@/lib/booking-endpoint-discoverer"

export async function GET(request: NextRequest) {
  try {
    const discoverer = new BookingEndpointDiscoverer()
    const results = await discoverer.discoverBookingEndpoints()

    return NextResponse.json({
      success: true,
      results,
      summary: {
        workingEndpoints: results.workingEndpoints.length,
        failedEndpoints: results.failedEndpoints.length,
        agencies: results.agencies.length,
        sampleBookings: results.sampleBookings.length,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Discovery failed",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json({ success: false, error: "Booking ID is required" }, { status: 400 })
    }

    const discoverer = new BookingEndpointDiscoverer()
    const booking = await discoverer.findSpecificBooking(bookingId)

    return NextResponse.json({
      success: true,
      booking,
      message: `Found booking ${bookingId}`,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Booking search failed",
      },
      { status: 500 },
    )
  }
}
