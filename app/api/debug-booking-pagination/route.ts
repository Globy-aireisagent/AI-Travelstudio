import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get("bookingId") || "RRP-9488"

    console.log(`🔍 Testing pagination for: ${bookingId}`)

    const username = process.env.TRAVEL_COMPOSITOR_USERNAME!
    const password = process.env.TRAVEL_COMPOSITOR_PASSWORD!
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!

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

    const authData = await authResponse.json()
    const token = authData.token

    // Test different pagination settings
    const paginationTests = [
      { first: 0, limit: 100, name: "First 100" },
      { first: 0, limit: 500, name: "First 500" },
      { first: 0, limit: 1000, name: "First 1000" },
      { first: 0, limit: 2000, name: "First 2000" },
      { first: 900, limit: 200, name: "Skip 900, take 200" },
      { first: 800, limit: 300, name: "Skip 800, take 300" },
    ]

    const results = []

    for (const test of paginationTests) {
      try {
        console.log(`📋 Testing: ${test.name}`)

        const response = await fetch(
          `https://online.travelcompositor.com/resources/booking/getBookings?microsite=${micrositeId}&from=20250101&to=20261231&first=${test.first}&limit=${test.limit}`,
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

          // Check if our target booking is in this batch
          const foundBooking = bookings.find(
            (b: any) =>
              String(b.id).toUpperCase() === bookingId.toUpperCase() ||
              String(b.bookingReference).toUpperCase() === bookingId.toUpperCase(),
          )

          // Get ID range for this batch
          const ids = bookings.map((b: any) => Number.parseInt(b.id.replace("RRP-", ""))).filter((n) => !isNaN(n))
          const minId = ids.length > 0 ? Math.min(...ids) : 0
          const maxId = ids.length > 0 ? Math.max(...ids) : 0

          results.push({
            test: test.name,
            found: !!foundBooking,
            totalBookings: bookings.length,
            idRange: `RRP-${minId} to RRP-${maxId}`,
            foundBooking: foundBooking
              ? {
                  id: foundBooking.id,
                  bookingReference: foundBooking.bookingReference,
                  startDate: foundBooking.startDate,
                }
              : null,
            sampleIds: bookings.slice(0, 3).map((b: any) => b.id),
          })

          if (foundBooking) {
            console.log(`✅ Found ${bookingId} in ${test.name}!`)
            break
          }
        } else {
          results.push({
            test: test.name,
            found: false,
            error: `HTTP ${response.status}`,
            totalBookings: 0,
            idRange: "N/A",
          })
        }
      } catch (error) {
        results.push({
          test: test.name,
          found: false,
          error: error instanceof Error ? error.message : "Unknown error",
          totalBookings: 0,
          idRange: "N/A",
        })
      }
    }

    return NextResponse.json({
      success: true,
      searchTarget: bookingId,
      paginationResults: results,
      summary: {
        totalTests: results.length,
        foundInTests: results.filter((r) => r.found).length,
        bestStrategy: results.find((r) => r.found)?.test || "None found",
      },
    })
  } catch (error) {
    console.error("❌ Pagination debug error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
