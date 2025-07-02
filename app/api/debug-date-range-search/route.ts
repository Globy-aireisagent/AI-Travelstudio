import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get("bookingId") || "RRP-9488"

    console.log(`📅 Testing different date ranges for: ${bookingId}`)

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

    // Test different date ranges (this is what works in list-available-bookings!)
    const dateRanges = [
      { from: "20250101", to: "20261231", name: "2025-2026" },
      { from: "20240101", to: "20261231", name: "2024-2026" },
      { from: "20200101", to: "20261231", name: "2020-2026" },
      { from: "20100101", to: "20301231", name: "2010-2030" },
    ]

    const results = []

    for (const dateRange of dateRanges) {
      console.log(`📅 Testing date range: ${dateRange.name}`)

      try {
        // Test with large limit to get more bookings
        const response = await fetch(
          `https://online.travelcompositor.com/resources/booking/getBookings?microsite=${process.env.TRAVEL_COMPOSITOR_MICROSITE_ID}&from=${dateRange.from}&to=${dateRange.to}&first=0&limit=2000`,
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

          console.log(`📋 Found ${bookings.length} bookings in ${dateRange.name}`)

          // Get booking number range
          const bookingNumbers = bookings
            .map((b: any) => {
              const id = b.id || b.bookingReference || ""
              const num = Number.parseInt(id.replace(/^RRP-?/i, ""))
              return isNaN(num) ? 0 : num
            })
            .filter((n: number) => n > 0)
            .sort((a: number, b: number) => a - b)

          const range =
            bookingNumbers.length > 0
              ? `${bookingNumbers[0]} - ${bookingNumbers[bookingNumbers.length - 1]}`
              : "no valid numbers"

          // Search for our target booking
          const targetBooking = bookings.find((b: any) => {
            const possibleIds = [b.id, b.bookingId, b.reservationId, b.bookingReference, b.reference, b.tripId].filter(
              Boolean,
            )
            return possibleIds.some((id) => String(id).toUpperCase() === bookingId.toUpperCase())
          })

          results.push({
            dateRange: dateRange.name,
            from: dateRange.from,
            to: dateRange.to,
            totalFound: bookings.length,
            bookingNumberRange: range,
            targetFound: !!targetBooking,
            targetBooking: targetBooking
              ? {
                  id: targetBooking.id,
                  bookingReference: targetBooking.bookingReference,
                  startDate: targetBooking.startDate,
                  endDate: targetBooking.endDate,
                }
              : null,
            // Show first few bookings for reference
            sampleBookings: bookings.slice(0, 3).map((b: any) => ({
              id: b.id,
              bookingReference: b.bookingReference,
              startDate: b.startDate,
              endDate: b.endDate,
            })),
          })

          if (targetBooking) {
            console.log(`✅ Found ${bookingId} in date range ${dateRange.name}!`)
            break // Found it, no need to continue
          }
        } else {
          results.push({
            dateRange: dateRange.name,
            error: `HTTP ${response.status}`,
            totalFound: 0,
            targetFound: false,
          })
        }
      } catch (error) {
        results.push({
          dateRange: dateRange.name,
          error: error instanceof Error ? error.message : "Unknown error",
          totalFound: 0,
          targetFound: false,
        })
      }
    }

    const foundResult = results.find((r) => r.targetFound)

    return NextResponse.json({
      success: true,
      searchTarget: bookingId,
      found: !!foundResult,
      workingDateRange: foundResult?.dateRange || null,
      results,
      summary: {
        totalRangesTested: results.length,
        rangesWithData: results.filter((r) => r.totalFound > 0).length,
        targetFound: !!foundResult,
      },
    })
  } catch (error) {
    console.error("❌ Date range search error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
