"use server"

import { type NextRequest, NextResponse } from "next/server"
import { BookingEndpointDiscoverer } from "@/lib/booking-endpoint-discoverer"

export async function GET() {
  try {
    const discoverer = new BookingEndpointDiscoverer()
    const results = await discoverer.discoverBookingEndpoints()
    return NextResponse.json(results)
  } catch (err) {
    console.error("Discovery failed:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 })
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
    console.error("Booking search error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Booking search failed",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
