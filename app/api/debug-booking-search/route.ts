import { NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get("bookingId") || "RRP-9488"

    console.log(`🔍 Debug search for: ${bookingId}`)

    const client = createTravelCompositorClient(1)

    // Get ALL bookings and search through them
    console.log("Fetching all bookings...")
    const allBookings = await client.getAllBookings({
      fromDate: "20240101", // Broader date range
      toDate: "20261231",
    })

    console.log(`Found ${allBookings.length} total bookings`)

    // Search for our booking ID in various ways
    const searchPatterns = [
      bookingId,
      bookingId.toUpperCase(),
      bookingId.toLowerCase(),
      bookingId.replace(/^RRP-?/i, ""),
      `RRP-${bookingId.replace(/^RRP-?/i, "")}`,
    ]

    const matches = []

    for (const booking of allBookings) {
      const possibleIds = [
        booking.id,
        booking.bookingId,
        booking.reservationId,
        booking.bookingReference,
        booking.reference,
        booking.tripId,
      ].filter(Boolean)

      for (const pattern of searchPatterns) {
        for (const id of possibleIds) {
          if (
            String(id).toLowerCase() === pattern.toLowerCase() ||
            String(id).toLowerCase().includes(pattern.toLowerCase()) ||
            pattern.toLowerCase().includes(String(id).toLowerCase())
          ) {
            matches.push({
              searchPattern: pattern,
              matchedField: possibleIds.indexOf(id),
              matchedValue: id,
              booking: {
                id: booking.id,
                title: booking.title || booking.name,
                status: booking.status,
                startDate: booking.startDate,
                endDate: booking.endDate,
              },
            })
          }
        }
      }
    }

    // Also show some recent bookings for reference
    const recentBookings = allBookings
      .sort((a, b) => {
        const aNum = Number.parseInt(a.id?.replace(/\D/g, "") || "0")
        const bNum = Number.parseInt(b.id?.replace(/\D/g, "") || "0")
        return bNum - aNum
      })
      .slice(0, 10)
      .map((b) => ({
        id: b.id,
        reference: b.bookingReference || b.reference,
        title: b.title || b.name,
        status: b.status,
      }))

    return NextResponse.json({
      success: true,
      searchFor: bookingId,
      searchPatterns,
      totalBookings: allBookings.length,
      matches: matches.length > 0 ? matches : "No matches found",
      recentBookings,
      debug: {
        firstBooking: allBookings[0]
          ? {
              id: allBookings[0].id,
              allFields: Object.keys(allBookings[0]),
            }
          : "No bookings found",
      },
    })
  } catch (error) {
    console.error("❌ Debug booking search error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
