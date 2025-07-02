import { NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get("bookingId") || "RRP-9488"

    console.log(`🔍 Debugging how list-available-bookings finds: ${bookingId}`)

    // Use the EXACT same method as list-available-bookings
    const client = createTravelCompositorClient(1)

    // Get bookings with the EXACT same parameters
    const allBookings = await client.getAllBookings({
      limit: 2000, // Much higher limit
      fromDate: "20250101",
      toDate: "20261231",
    })

    console.log(`📋 Total bookings found: ${allBookings.length}`)

    // Sort by ID to get most recent (same as list-available-bookings)
    const sortedBookings = allBookings.sort((a, b) => {
      const aNum = Number.parseInt(a.id?.replace(/\D/g, "") || "0")
      const bNum = Number.parseInt(b.id?.replace(/\D/g, "") || "0")
      return bNum - aNum // Descending order (newest first)
    })

    // Get booking number range
    const bookingNumbers = sortedBookings
      .map((b) => {
        const num = Number.parseInt(b.id?.replace(/^RRP-?/i, "") || "0")
        return isNaN(num) ? 0 : num
      })
      .filter((n) => n > 0)

    const range = bookingNumbers.length > 0 ? `${Math.min(...bookingNumbers)} - ${Math.max(...bookingNumbers)}` : "none"

    // Find our target booking
    const targetBooking = sortedBookings.find((booking) => {
      const possibleIds = [
        booking.id,
        booking.bookingId,
        booking.reservationId,
        booking.bookingReference,
        booking.reference,
        booking.tripId,
      ].filter(Boolean)
      return possibleIds.some((id) => String(id).toUpperCase() === bookingId.toUpperCase())
    })

    // Show top 20 bookings (newest first)
    const top20 = sortedBookings.slice(0, 20).map((booking) => ({
      id: booking.id,
      bookingReference: booking.bookingReference || booking.reference,
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: booking.status,
    }))

    return NextResponse.json({
      success: true,
      searchTarget: bookingId,
      found: !!targetBooking,
      targetBooking: targetBooking
        ? {
            id: targetBooking.id,
            bookingReference: targetBooking.bookingReference,
            startDate: targetBooking.startDate,
            endDate: targetBooking.endDate,
            status: targetBooking.status,
          }
        : null,
      stats: {
        totalBookings: allBookings.length,
        bookingNumberRange: range,
        highestBookingNumber: Math.max(...bookingNumbers),
        lowestBookingNumber: Math.min(...bookingNumbers),
      },
      top20BookingsNewestFirst: top20,
      debugInfo: {
        method: "client.getAllBookings()",
        limit: 2000,
        dateRange: "20250101-20261231",
        sortedByNumber: true,
      },
    })
  } catch (error) {
    console.error("❌ Debug list bookings method error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
