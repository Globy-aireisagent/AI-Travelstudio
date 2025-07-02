import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get("bookingId") || "RRP-9488"

    console.log(`🔍 Reverse searching for: ${bookingId}`)

    // Extract booking number for smart pagination
    const bookingNumber = Number.parseInt(bookingId.replace(/^RRP-?/i, ""))
    console.log(`📊 Booking number: ${bookingNumber}`)

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

    // Strategy 1: Get total count first
    const countResponse = await fetch(
      `https://online.travelcompositor.com/resources/booking/getBookings?microsite=${process.env.TRAVEL_COMPOSITOR_MICROSITE_ID}&from=20200101&to=20261231&first=0&limit=1`,
      {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    )

    let totalCount = 0
    if (countResponse.ok) {
      const countData = await countResponse.json()
      totalCount = countData.totalCount || countData.total || 0
      console.log(`📈 Total bookings: ${totalCount}`)
    }

    // Strategy 2: Smart reverse search based on booking number
    const searchStrategies = []

    if (bookingNumber > 9000) {
      // Very recent bookings - start from the end
      searchStrategies.push({ first: Math.max(0, totalCount - 200), limit: 200, name: "Last 200" })
      searchStrategies.push({ first: Math.max(0, totalCount - 500), limit: 500, name: "Last 500" })
    } else if (bookingNumber > 8000) {
      // Recent bookings
      searchStrategies.push({ first: Math.max(0, totalCount - 1000), limit: 1000, name: "Last 1000" })
    }

    // Always try a large batch as fallback
    searchStrategies.push({ first: 0, limit: 2000, name: "First 2000" })

    for (const strategy of searchStrategies) {
      console.log(`🎯 Trying strategy: ${strategy.name} (first: ${strategy.first}, limit: ${strategy.limit})`)

      const response = await fetch(
        `https://online.travelcompositor.com/resources/booking/getBookings?microsite=${process.env.TRAVEL_COMPOSITOR_MICROSITE_ID}&from=20200101&to=20261231&first=${strategy.first}&limit=${strategy.limit}`,
        {
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      )

      if (response.ok) {
        const data = await response.json()
        const bookings = data.bookedTrip || data.bookings || []

        console.log(`📋 Found ${bookings.length} bookings with ${strategy.name}`)

        // Show range of booking numbers in this batch
        const bookingNumbers = bookings
          .map((b: any) => Number.parseInt((b.id || b.bookingReference || "").replace(/^RRP-?/i, "")))
          .filter((n: number) => !isNaN(n))
          .sort((a: number, b: number) => a - b)

        if (bookingNumbers.length > 0) {
          console.log(`📊 Booking range: ${bookingNumbers[0]} - ${bookingNumbers[bookingNumbers.length - 1]}`)
        }

        // Search for our target booking
        const targetBooking = bookings.find((b: any) => {
          const possibleIds = [b.id, b.bookingId, b.reservationId, b.bookingReference, b.reference, b.tripId].filter(
            Boolean,
          )
          return possibleIds.some((id) => String(id).toUpperCase() === bookingId.toUpperCase())
        })

        if (targetBooking) {
          console.log(`✅ Found ${bookingId} using ${strategy.name}!`)
          return NextResponse.json({
            success: true,
            found: true,
            bookingId,
            strategy: strategy.name,
            totalCount,
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
              first: strategy.first,
              limit: strategy.limit,
              foundInBatch: bookings.length,
              bookingRange:
                bookingNumbers.length > 0
                  ? `${bookingNumbers[0]}-${bookingNumbers[bookingNumbers.length - 1]}`
                  : "unknown",
            },
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      found: false,
      bookingId,
      totalCount,
      strategiesTried: searchStrategies.map((s) => s.name),
      message: "Booking not found with any reverse search strategy",
    })
  } catch (error) {
    console.error("❌ Reverse search error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
