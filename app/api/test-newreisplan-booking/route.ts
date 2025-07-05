import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get("id")

    if (!bookingId) {
      return NextResponse.json({
        success: false,
        message: "No booking ID provided",
        error: "Missing 'id' parameter",
      })
    }

    console.log(`🎫 Testing booking import for ID: ${bookingId}`)

    const username = process.env.TRAVEL_COMPOSITOR_USERNAME
    const password = process.env.TRAVEL_COMPOSITOR_PASSWORD
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID

    if (!username || !password || !micrositeId) {
      return NextResponse.json({
        success: false,
        message: "Missing credentials",
        error: "Environment variables not configured",
      })
    }

    const authString = Buffer.from(`${username}:${password}`).toString("base64")

    // Try different ID formats and endpoints
    const idVariations = [
      bookingId,
      `RRP-${bookingId}`,
      `NRP-${bookingId}`,
      `TC-${bookingId}`,
      bookingId.replace(/^(RRP-|NRP-|TC-)/, ""), // Remove prefix if exists
    ]

    const endpointTemplates = [
      "https://api.travelcompositor.com/api/v1/booking/{micrositeId}/{bookingId}",
      "https://api.travelcompositor.com/api/v1/bookings/{micrositeId}/{bookingId}",
      "https://api.travelcompositor.com/api/v1/booking/{bookingId}",
      "https://api.travelcompositor.com/api/v1/bookings/{bookingId}",
      "https://api.travelcompositor.com/api/v1/microsite/{micrositeId}/booking/{bookingId}",
      "https://api.travelcompositor.com/api/v1/microsite/{micrositeId}/bookings/{bookingId}",
    ]

    let foundBooking = null
    let successfulEndpoint = null

    // Try each ID variation with each endpoint
    for (const idVariation of idVariations) {
      console.log(`🔍 Trying ID variation: ${idVariation}`)

      for (const template of endpointTemplates) {
        const endpoint = template.replace("{micrositeId}", micrositeId).replace("{bookingId}", idVariation)

        console.log(`🌐 Testing endpoint: ${endpoint}`)

        try {
          const response = await fetch(endpoint, {
            method: "GET",
            headers: {
              Authorization: `Basic ${authString}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          })

          console.log(`📡 Response status: ${response.status}`)

          if (response.ok) {
            const data = await response.json()
            console.log(`✅ Found booking at: ${endpoint}`)

            foundBooking = data
            successfulEndpoint = endpoint
            break
          } else if (response.status === 404) {
            console.log(`❌ Not found: ${endpoint}`)
          } else {
            console.log(`⚠️ Error ${response.status}: ${endpoint}`)
          }
        } catch (error) {
          console.log(`💥 Network error: ${endpoint}`, error)
        }

        // Small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 50))
      }

      if (foundBooking) break
    }

    // If still not found, try searching through booking lists
    if (!foundBooking) {
      console.log("🔍 Booking not found directly, searching through booking lists...")

      const searchEndpoints = [
        `https://api.travelcompositor.com/api/v1/booking/${micrositeId}`,
        `https://api.travelcompositor.com/api/v1/bookings/${micrositeId}`,
        `https://api.travelcompositor.com/api/v1/microsite/${micrositeId}/bookings`,
      ]

      for (const searchEndpoint of searchEndpoints) {
        try {
          console.log(`🔍 Searching in: ${searchEndpoint}`)

          const response = await fetch(searchEndpoint, {
            method: "GET",
            headers: {
              Authorization: `Basic ${authString}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          })

          if (response.ok) {
            const data = await response.json()
            const bookings = Array.isArray(data) ? data : data.bookings ? data.bookings : data.data ? data.data : []

            console.log(`📋 Found ${bookings.length} bookings to search through`)

            // Search for our booking ID in the list
            for (const booking of bookings) {
              const bookingRef = booking.id || booking.bookingId || booking.reference || booking.bookingReference

              if (
                bookingRef &&
                (bookingRef.toString() === bookingId ||
                  bookingRef.toString() === `RRP-${bookingId}` ||
                  bookingRef.toString() === `NRP-${bookingId}` ||
                  bookingRef.toString().replace(/^(RRP-|NRP-|TC-)/, "") === bookingId)
              ) {
                console.log(`✅ Found booking in list: ${bookingRef}`)
                foundBooking = booking
                successfulEndpoint = `${searchEndpoint} (found in list)`
                break
              }
            }

            if (foundBooking) break
          }
        } catch (error) {
          console.log(`💥 Search error: ${searchEndpoint}`, error)
        }
      }
    }

    if (foundBooking) {
      return NextResponse.json({
        success: true,
        message: `Booking ${bookingId} found successfully`,
        data: {
          booking: foundBooking,
          foundAt: successfulEndpoint,
          searchedVariations: idVariations,
        },
      })
    } else {
      return NextResponse.json({
        success: false,
        message: `Booking ${bookingId} not found in Newreisplan microsite`,
        error: "Booking not found after trying all endpoints and ID variations",
        data: {
          searchedVariations: idVariations,
          searchedEndpoints: endpointTemplates.length,
        },
      })
    }
  } catch (error) {
    console.error("💥 Booking test error:", error)

    return NextResponse.json({
      success: false,
      message: "Error testing booking import",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
