import { type NextRequest, NextResponse } from "next/server"
import { BookingEndpointDiscoverer } from "@/lib/booking-endpoint-discoverer"

export async function GET() {
  try {
    console.log("🔍 Starting booking endpoint discovery...")
    const discoverer = new BookingEndpointDiscoverer()
    const results = await discoverer.discoverBookingEndpoints()

    console.log(`✅ Discovery complete: ${results.workingEndpoints.length} working endpoints found`)
    return NextResponse.json(results)
  } catch (err) {
    console.error("❌ Discovery failed:", err)
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
        workingEndpoints: [],
        failedEndpoints: [],
        agencies: [],
        sampleBookings: [],
        testedConfigs: [],
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

    console.log(`🔍 Searching for booking: ${bookingId}`)
    const discoverer = new BookingEndpointDiscoverer()
    const booking = await discoverer.findSpecificBooking(bookingId)

    console.log(`✅ Found booking: ${bookingId}`)
    return NextResponse.json({
      success: true,
      booking,
      message: `Found booking ${bookingId}`,
    })
  } catch (error) {
    console.error("❌ Booking search error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Booking search failed",
      },
      { status: 500 },
    )
  }
}
