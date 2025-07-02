import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get("bookingId") || "RRP-9488"

    console.log(`🔄 REVERSE search starting from HIGHEST booking number for: ${bookingId}`)

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

    // Strategy: Start from a very high offset and work backwards
    // If RRP-9488 exists, it should be in the most recent bookings
    const searchStrategies = [
      { offset: 900, limit: 200, description: "Last 200 bookings (offset 900)" },
      { offset: 800, limit: 200, description: "Bookings 800-1000" },
      { offset: 700, limit: 200, description: "Bookings 700-900" },
      { offset: 600, limit: 200, description: "Bookings 600-800" },
      { offset: 500, limit: 200, description: "Bookings 500-700" },
    ]

    for (const strategy of searchStrategies) {
      try {
        console.log(`🎯 Trying: ${strategy.description}`)

        const response = await fetch(
          `https://online.travelcompositor.com/resources/booking/getBookings?microsite=${process.env.TRAVEL_COMPOSITOR_MICROSITE_ID}&from=20250101&to=20251231&first=${strategy.offset}&limit=${strategy.limit}`,
          {
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        )

        if (!response.ok) {
          console.log(`⚠️ Strategy failed: ${response.status}`)
          continue
        }

        const data = await response.json()
        const bookings = data.bookedTrip || data.bookings || []

        console.log(`📋 Found ${bookings.length} bookings with ${strategy.description}`)

        if (bookings.length === 0) {
          console.log(`⚠️ No bookings found with offset ${strategy.offset}, trying next strategy`)
          continue
        }

        // Show booking number range for this batch
        const bookingNumbers = bookings
          .map((b: any) => Number.parseInt((b.id || "").replace(/^RRP-?/i, "")))
          .filter((n: number) => !isNaN(n))
          .sort((a: number, b: number) => b - a) // Highest first

        const range =
          bookingNumbers.length > 0 ? `${bookingNumbers[bookingNumbers.length - 1]} - ${bookingNumbers[0]}` : "unknown"

        console.log(`🔢 Booking range in this batch: RRP-${range}`)

        // Search for our target booking
        const targetBooking = bookings.find((booking: any) => {
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

        if (targetBooking) {
          console.log(`✅ FOUND ${bookingId} using ${strategy.description}!`)
          return NextResponse.json({
            success: true,
            found: true,
            bookingId,
            targetBooking: {
              id: targetBooking.id,
              bookingReference: targetBooking.bookingReference,
              startDate: targetBooking.startDate,
              endDate: targetBooking.endDate,
              status: targetBooking.status,
            },
            foundWith: strategy.description,
            bookingRange: `RRP-${range}`,
            totalInBatch: bookings.length,
          })
        }

        // If we found bookings but not our target, show the range
        console.log(`❌ ${bookingId} not found in range RRP-${range}`)
      } catch (error) {
        console.log(`❌ Error with ${strategy.description}:`, error)
        continue
      }
    }

    return NextResponse.json({
      success: true,
      found: false,
      bookingId,
      message: "Booking not found with any reverse search strategy",
      strategiesTried: searchStrategies.map((s) => s.description),
    })
  } catch (error) {
    console.error("❌ Reverse booking search error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
