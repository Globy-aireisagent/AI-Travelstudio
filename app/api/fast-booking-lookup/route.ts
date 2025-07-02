import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function POST(request: NextRequest) {
  try {
    const { bookingId, micrositeId } = await request.json()

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 })
    }

    console.log(`⚡ Fast booking lookup for: ${bookingId}`)

    // Determine config based on micrositeId
    let configNumber = 1
    if (micrositeId) {
      if (micrositeId === process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_2) {
        configNumber = 2
      } else if (micrositeId === process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3) {
        configNumber = 3
      } else if (micrositeId === process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_4) {
        configNumber = 4
      }
    }

    const client = createTravelCompositorClient(configNumber)
    await client.authenticate()

    const authToken = client.authToken
    if (!authToken) {
      throw new Error("Authentication failed")
    }

    // Clean booking ID
    const cleanBookingId = bookingId.replace(/^RRP-?/i, "").trim()

    // Try the fast endpoints we discovered
    const fastEndpoints = [
      {
        name: "direct-search",
        url: `https://online.travelcompositor.com/resources/booking/search?reference=${cleanBookingId}`,
      },
      {
        name: "direct-find",
        url: `https://online.travelcompositor.com/resources/booking/find?id=${cleanBookingId}`,
      },
      {
        name: "search-with-prefix",
        url: `https://online.travelcompositor.com/resources/booking/search?reference=${bookingId}`,
      },
    ]

    for (const endpoint of fastEndpoints) {
      try {
        console.log(`🚀 Trying fast endpoint: ${endpoint.name}`)

        const startTime = Date.now()
        const response = await fetch(endpoint.url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "auth-token": authToken,
          },
        })
        const endTime = Date.now()
        const responseTime = endTime - startTime

        if (response.ok) {
          const data = await response.json()
          console.log(`✅ FAST SUCCESS with ${endpoint.name} in ${responseTime}ms!`)

          return NextResponse.json({
            success: true,
            booking: data,
            method: endpoint.name,
            responseTime: `${responseTime}ms`,
            configUsed: configNumber,
            message: `Found booking using fast ${endpoint.name} endpoint`,
          })
        } else {
          const errorText = await response.text()
          console.log(`❌ ${endpoint.name} failed: ${response.status} - ${errorText.substring(0, 100)}`)
        }
      } catch (endpointError) {
        console.log(`❌ ${endpoint.name} error:`, endpointError)
      }
    }

    // Fallback to existing method
    console.log(`🔄 Falling back to existing booking lookup method`)
    const booking = await client.getBookingByReference(cleanBookingId)

    return NextResponse.json({
      success: true,
      booking,
      method: "fallback-existing",
      configUsed: configNumber,
      message: "Found booking using fallback method",
    })
  } catch (error) {
    console.error("❌ Fast booking lookup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
