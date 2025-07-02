import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get("bookingId") || "RRP-9488"

    console.log(`🔍 Detailed debug search for: ${bookingId}`)

    // Use the same credentials as the working client
    const username = process.env.TRAVEL_COMPOSITOR_USERNAME!
    const password = process.env.TRAVEL_COMPOSITOR_PASSWORD!
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!

    // Step 1: Authenticate
    console.log("🔐 Step 1: Authenticating...")
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

    console.log("✅ Step 1: Authentication successful")

    // Step 2: Get all bookings
    console.log("📋 Step 2: Getting all bookings...")
    const bookingsResponse = await fetch(
      `https://online.travelcompositor.com/resources/booking/getBookings?microsite=${micrositeId}&from=20250101&to=20261231&first=0&limit=1000`,
      {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    )

    if (!bookingsResponse.ok) {
      throw new Error(`Get bookings failed: ${bookingsResponse.status}`)
    }

    const bookingsData = await bookingsResponse.json()
    const allBookings = bookingsData.bookedTrip || bookingsData.bookings || []

    console.log(`📋 Step 2: Found ${allBookings.length} total bookings`)

    // Step 3: Search for our specific booking
    console.log(`🔍 Step 3: Searching for ${bookingId}...`)

    const targetBooking = allBookings.find((booking: any) => {
      const possibleIds = [
        booking.id,
        booking.bookingId,
        booking.reservationId,
        booking.bookingReference,
        booking.reference,
        booking.tripId,
      ].filter(Boolean)

      console.log(`Checking booking with IDs:`, possibleIds)

      return possibleIds.some((id) => String(id).toUpperCase() === bookingId.toUpperCase())
    })

    // Step 4: Also try direct API call
    console.log("🎯 Step 4: Trying direct API call...")
    let directBooking = null
    try {
      const directResponse = await fetch(`https://online.travelcompositor.com/resources/booking/${bookingId}`, {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (directResponse.ok) {
        directBooking = await directResponse.json()
        console.log("✅ Step 4: Direct API call successful")
      } else {
        console.log(`⚠️ Step 4: Direct API call failed: ${directResponse.status}`)
      }
    } catch (error) {
      console.log("⚠️ Step 4: Direct API call error:", error)
    }

    // Step 5: Show first few bookings for comparison
    const sampleBookings = allBookings.slice(0, 5).map((b: any) => ({
      id: b.id,
      bookingReference: b.bookingReference,
      reference: b.reference,
      allPossibleIds: [b.id, b.bookingId, b.reservationId, b.bookingReference, b.reference, b.tripId].filter(Boolean),
    }))

    return NextResponse.json({
      success: true,
      searchTarget: bookingId,
      results: {
        foundViaSearch: !!targetBooking,
        foundViaDirect: !!directBooking,
        totalBookingsFound: allBookings.length,
      },
      targetBooking: targetBooking || null,
      directBooking: directBooking || null,
      sampleBookings,
      debugInfo: {
        micrositeId,
        username: `${username.substring(0, 3)}***`,
        authWorked: !!token,
        getBookingsWorked: bookingsResponse.ok,
      },
    })
  } catch (error) {
    console.error("❌ Detailed debug error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
