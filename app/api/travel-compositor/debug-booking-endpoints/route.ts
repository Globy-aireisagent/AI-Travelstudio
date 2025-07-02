import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET() {
  try {
    console.log("🔍 DEBUGGING BOOKING ENDPOINTS")

    const client = createTravelCompositorClient(1)

    // Test verschillende booking endpoint formaten
    const testBookingId = "RRP-9263"
    const cleanId = "9263"

    console.log(`📋 Testing booking endpoints for: ${testBookingId}`)

    const results = {
      endpoints: [],
      workingEndpoint: null,
      authToken: null,
      config: client.config,
    }

    // Eerst authenticeren
    try {
      const token = await client.authenticate()
      results.authToken = token ? "✅ Valid" : "❌ Invalid"
      console.log("✅ Authentication successful")
    } catch (error) {
      console.error("❌ Authentication failed:", error)
      return Response.json({
        success: false,
        error: "Authentication failed",
        details: error instanceof Error ? error.message : String(error),
      })
    }

    // Test verschillende endpoint formaten
    const endpointsToTest = [
      `/resources/booking/${testBookingId}`,
      `/resources/booking/${cleanId}`,
      `/resources/booking/getBooking?bookingReference=${testBookingId}`,
      `/resources/booking/getBooking?bookingReference=${cleanId}`,
      `/resources/booking/getBookings?bookingReference=${testBookingId}`,
      `/resources/booking/details/${testBookingId}`,
      `/resources/booking/details/${cleanId}`,
      `/resources/bookings/${testBookingId}`,
      `/resources/bookings/${cleanId}`,
    ]

    for (const endpoint of endpointsToTest) {
      try {
        console.log(`🧪 Testing: ${endpoint}`)
        const response = await client.makeAuthenticatedRequest(endpoint)

        const result = {
          endpoint,
          status: response.status,
          ok: response.ok,
          contentType: response.headers.get("content-type"),
          hasData: false,
          error: null,
        }

        if (response.ok) {
          try {
            const data = await response.json()
            result.hasData = !!data && Object.keys(data).length > 0
            if (result.hasData && !results.workingEndpoint) {
              results.workingEndpoint = endpoint
              console.log(`✅ WORKING ENDPOINT FOUND: ${endpoint}`)
            }
          } catch (e) {
            result.error = "Invalid JSON response"
          }
        } else {
          const errorText = await response.text()
          result.error = errorText.substring(0, 200)
        }

        results.endpoints.push(result)
        console.log(`📊 ${endpoint}: ${response.status} ${response.ok ? "✅" : "❌"}`)
      } catch (error) {
        results.endpoints.push({
          endpoint,
          status: 0,
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        })
        console.log(`❌ ${endpoint}: ${error}`)
      }
    }

    // Test ook de getAllBookings methode om te zien of die werkt
    try {
      console.log("🧪 Testing getAllBookings method...")
      const allBookings = await client.getAllBookings({ limit: 5 })
      console.log(`📊 getAllBookings returned ${Array.isArray(allBookings) ? allBookings.length : "non-array"} results`)

      if (Array.isArray(allBookings) && allBookings.length > 0) {
        const sampleBooking = allBookings[0]
        console.log("📋 Sample booking structure:", {
          id: sampleBooking.id,
          bookingReference: sampleBooking.bookingReference,
          reference: sampleBooking.reference,
          keys: Object.keys(sampleBooking),
        })
      }
    } catch (error) {
      console.log("❌ getAllBookings failed:", error)
    }

    return Response.json({
      success: true,
      results,
      summary: {
        totalEndpointsTested: results.endpoints.length,
        workingEndpoints: results.endpoints.filter((e) => e.ok).length,
        authenticationWorking: !!results.authToken,
        recommendedEndpoint: results.workingEndpoint,
      },
    })
  } catch (error) {
    console.error("❌ Debug booking endpoints error:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
