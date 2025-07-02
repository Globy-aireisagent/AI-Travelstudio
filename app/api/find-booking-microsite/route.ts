import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get("bookingId") || "RRP-9488"

    console.log(`🔍 Finding which microsite contains: ${bookingId}`)

    const microsites = [
      {
        name: "Primary Microsite (Rondreis Planner)",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!,
      },
      {
        name: "Secondary Microsite",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_2!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_2!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_2!,
      },
      {
        name: "Tertiary Microsite",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_3!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_3!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3!,
      },
      {
        name: "Quaternary Microsite",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_4!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_4!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_4!,
      },
    ].filter((ms) => ms.username && ms.password && ms.micrositeId)

    const results = []

    for (const microsite of microsites) {
      try {
        console.log(`🔍 Checking ${microsite.name}...`)

        // Authenticate
        const authResponse = await fetch("https://online.travelcompositor.com/resources/authentication/authenticate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            username: microsite.username,
            password: microsite.password,
            micrositeId: microsite.micrositeId,
          }),
        })

        if (!authResponse.ok) {
          results.push({
            microsite: microsite.name,
            success: false,
            error: `Authentication failed: ${authResponse.status}`,
            bookingRange: "N/A",
            found: false,
          })
          continue
        }

        const authData = await authResponse.json()
        const token = authData.token

        // Get 2025 bookings with high limit
        const response = await fetch(
          `https://online.travelcompositor.com/resources/booking/getBookings?microsite=${microsite.micrositeId}&from=20250101&to=20251231&first=0&limit=10000`,
          {
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        )

        if (!response.ok) {
          results.push({
            microsite: microsite.name,
            success: false,
            error: `API call failed: ${response.status}`,
            bookingRange: "N/A",
            found: false,
          })
          continue
        }

        const data = await response.json()
        const allBookings = data.bookedTrip || data.bookings || []

        // Get booking number range
        const bookingNumbers = allBookings
          .map((b: any) => {
            const num = Number.parseInt((b.id || b.bookingReference || "").replace(/^RRP-?/i, ""))
            return isNaN(num) ? 0 : num
          })
          .filter((n: number) => n > 0)
          .sort((a: number, b: number) => a - b)

        const range =
          bookingNumbers.length > 0 ? `${bookingNumbers[0]} - ${bookingNumbers[bookingNumbers.length - 1]}` : "none"

        // Search for target booking
        const targetBooking = allBookings.find((booking: any) => {
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

        results.push({
          microsite: microsite.name,
          success: true,
          totalBookings: allBookings.length,
          bookingRange: range,
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
          top5Newest: allBookings
            .map((b: any) => ({
              id: b.id,
              bookingReference: b.bookingReference,
              bookingNumber: Number.parseInt((b.id || "").replace(/^RRP-?/i, "")),
            }))
            .filter((b: any) => !isNaN(b.bookingNumber))
            .sort((a: any, b: any) => b.bookingNumber - a.bookingNumber)
            .slice(0, 5),
        })

        if (targetBooking) {
          console.log(`✅ Found ${bookingId} in ${microsite.name}!`)
          break
        }
      } catch (error) {
        results.push({
          microsite: microsite.name,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          bookingRange: "N/A",
          found: false,
        })
      }
    }

    const foundIn = results.find((r) => r.found)

    return NextResponse.json({
      success: true,
      searchTarget: bookingId,
      found: !!foundIn,
      foundInMicrosite: foundIn?.microsite || null,
      targetBooking: foundIn?.targetBooking || null,
      allMicrositeResults: results,
      summary: {
        totalMicrositesTested: results.length,
        micrositesWithData: results.filter((r) => r.success).length,
        foundInMicrosite: foundIn?.microsite || "Not found",
      },
    })
  } catch (error) {
    console.error("❌ Find booking microsite error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
