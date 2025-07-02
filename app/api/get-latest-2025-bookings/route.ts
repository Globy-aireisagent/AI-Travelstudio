import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get("bookingId") || "RRP-9488"

    console.log(`🎯 Getting LATEST 2025 bookings for: ${bookingId}`)

    // Authenticate
    const authResponse = await fetch("https://online.travelcompositor.com/resources/authentication/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        username: process.env.TRAVEL_COMPOSITOR_USERNAME,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID,
      }),
    })

    if (!authResponse.ok) {
      throw new Error(`Authentication failed: ${authResponse.status}`)
    }

    const authData = await authResponse.json()
    const token = authData.token

    // Strategy: Get ALL 2025 bookings and sort them by booking number (newest first)
    console.log(`📅 Getting ALL 2025 bookings...`)

    const response = await fetch(
      `https://online.travelcompositor.com/resources/booking/getBookings?microsite=${process.env.TRAVEL_COMPOSITOR_MICROSITE_ID}&from=20250101&to=20251231&first=0&limit=5000`,
      {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`)
    }

    const data = await response.json()
    const allBookings = data.bookedTrip || data.bookings || []

    console.log(`📋 Found ${allBookings.length} total 2025 bookings`)

    // Sort by booking number (highest first = newest first)
    const sortedBookings = allBookings
      .map((booking: any) => {
        const bookingNumber = Number.parseInt((booking.id || booking.bookingReference || "").replace(/^RRP-?/i, ""))
        return {
          ...booking,
          bookingNumber: isNaN(bookingNumber) ? 0 : bookingNumber,
        }
      })
      .filter((booking: any) => booking.bookingNumber > 0)
      .sort((a: any, b: any) => b.bookingNumber - a.bookingNumber) // Descending = newest first

    console.log(`🔢 Sorted ${sortedBookings.length} bookings by number`)

    // Get the latest 50 bookings
    const latest50 = sortedBookings.slice(0, 50)

    // Find our target booking
    const targetBooking = latest50.find((booking: any) => {
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

    const bookingRange =
      latest50.length > 0 ? `${latest50[latest50.length - 1].bookingNumber} - ${latest50[0].bookingNumber}` : "none"

    return NextResponse.json({
      success: true,
      searchTarget: bookingId,
      found: !!targetBooking,
      targetBooking: targetBooking
        ? {
            id: targetBooking.id,
            bookingReference: targetBooking.bookingReference,
            bookingNumber: targetBooking.bookingNumber,
            startDate: targetBooking.startDate,
            endDate: targetBooking.endDate,
            status: targetBooking.status,
          }
        : null,
      stats: {
        total2025Bookings: allBookings.length,
        sortedBookings: sortedBookings.length,
        latest50Range: bookingRange,
        highestBookingNumber: sortedBookings[0]?.bookingNumber || 0,
      },
      latest50Bookings: latest50.map((booking: any) => ({
        id: booking.id,
        bookingReference: booking.bookingReference,
        bookingNumber: booking.bookingNumber,
        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status,
      })),
    })
  } catch (error) {
    console.error("❌ Get latest 2025 bookings error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
