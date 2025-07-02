import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get("bookingId") || "RRP-9488"

    console.log(`🎯 Testing PRIMARY microsite only for: ${bookingId}`)

    // Use the exact same credentials as the working client
    const username = process.env.TRAVEL_COMPOSITOR_USERNAME!
    const password = process.env.TRAVEL_COMPOSITOR_PASSWORD!
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!

    console.log(`🔐 Using credentials: ${username.substring(0, 3)}*** / microsite: ${micrositeId}`)

    // Authenticate
    const authResponse = await fetch("https://online.travelcompositor.com/resources/authentication/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        micrositeId,
      }),
    })

    if (!authResponse.ok) {
      throw new Error(`Authentication failed: ${authResponse.status}`)
    }

    const authData = await authResponse.json()
    const token = authData.token

    console.log(`✅ Authenticated successfully`)

    // Search for the booking using getBookings (same as list-available-bookings)
    const searchResponse = await fetch(
      `https://online.travelcompositor.com/resources/booking/getBookings?microsite=${micrositeId}&from=20250101&to=20261231&first=0&limit=1000`,
      {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    )

    if (!searchResponse.ok) {
      throw new Error(`Search failed: ${searchResponse.status}`)
    }

    const searchData = await searchResponse.json()
    const bookings = searchData.bookedTrip || searchData.bookings || []

    console.log(`📋 Found ${bookings.length} total bookings`)

    // Look for our specific booking
    const targetBooking = bookings.find((b: any) => {
      const possibleIds = [b.id, b.bookingId, b.reservationId, b.bookingReference, b.reference, b.tripId].filter(
        Boolean,
      )
      return possibleIds.some((id) => String(id).toUpperCase() === bookingId.toUpperCase())
    })

    if (targetBooking) {
      console.log(`✅ Found booking: ${targetBooking.id}`)
      return NextResponse.json({
        success: true,
        found: true,
        bookingId,
        microsite: "Primary",
        booking: {
          id: targetBooking.id,
          bookingReference: targetBooking.bookingReference,
          title: targetBooking.title || targetBooking.name,
          status: targetBooking.status,
          startDate: targetBooking.startDate,
          endDate: targetBooking.endDate,
          client: targetBooking.client,
        },
        searchInfo: {
          totalBookings: bookings.length,
          searchMethod: "getBookings",
        },
      })
    } else {
      // Show some sample booking IDs for debugging
      const sampleIds = bookings.slice(0, 10).map((b: any) => ({
        id: b.id,
        bookingReference: b.bookingReference,
      }))

      return NextResponse.json({
        success: true,
        found: false,
        bookingId,
        microsite: "Primary",
        searchInfo: {
          totalBookings: bookings.length,
          searchMethod: "getBookings",
          sampleBookingIds: sampleIds,
        },
      })
    }
  } catch (error) {
    console.error("❌ Primary microsite test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
