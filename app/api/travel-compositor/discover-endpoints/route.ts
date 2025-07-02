import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const configNumber = Number.parseInt(searchParams.get("config") || "1")

    console.log(`🔍 Discovering ALL possible endpoints for config ${configNumber}`)

    const client = createTravelCompositorClient(configNumber)
    await client.authenticate()

    // MASSIVE endpoint discovery - test EVERYTHING
    const endpointsToTest = [
      // Basic resource endpoints
      "/resources",
      "/resources/",

      // Booking variations
      "/resources/booking",
      "/resources/bookings",
      "/resources/booking/",
      "/resources/bookings/",

      // GetBookings variations
      "/resources/booking/getBookings",
      "/resources/bookings/getBookings",
      "/resources/booking/getAllBookings",
      "/resources/bookings/getAllBookings",
      "/resources/booking/list",
      "/resources/bookings/list",
      "/resources/booking/search",
      "/resources/bookings/search",

      // Trip variations
      "/resources/trip",
      "/resources/trips",
      "/resources/trip/getBookings",
      "/resources/trips/getBookings",
      "/resources/trip/list",
      "/resources/trips/list",

      // Reservation variations
      "/resources/reservation",
      "/resources/reservations",
      "/resources/reservation/list",
      "/resources/reservations/list",

      // Client/Customer variations
      "/resources/client",
      "/resources/clients",
      "/resources/customer",
      "/resources/customers",

      // Order variations
      "/resources/order",
      "/resources/orders",
      "/resources/order/list",
      "/resources/orders/list",

      // API variations
      "/api/booking",
      "/api/bookings",
      "/api/booking/list",
      "/api/bookings/list",
      "/api/trip",
      "/api/trips",

      // V1/V2 API versions
      "/api/v1/bookings",
      "/api/v2/bookings",
      "/resources/v1/bookings",
      "/resources/v2/bookings",

      // With microsite parameter variations
      `/resources/booking?microsite=${client.config.micrositeId}`,
      `/resources/bookings?microsite=${client.config.micrositeId}`,
      `/resources/trip?microsite=${client.config.micrositeId}`,
      `/resources/trips?microsite=${client.config.micrositeId}`,

      // With operator parameter
      `/resources/booking?operator=${client.config.micrositeId}`,
      `/resources/bookings?operator=${client.config.micrositeId}`,

      // With site parameter
      `/resources/booking?site=${client.config.micrositeId}`,
      `/resources/bookings?site=${client.config.micrositeId}`,

      // With micrositeId parameter
      `/resources/booking?micrositeId=${client.config.micrositeId}`,
      `/resources/bookings?micrositeId=${client.config.micrositeId}`,

      // Different HTTP methods on same endpoints
      "/resources/booking/getBookings",
      "/resources/bookings/getBookings",

      // Common REST patterns
      "/resources/booking/all",
      "/resources/bookings/all",
      "/resources/booking/find",
      "/resources/bookings/find",

      // Swagger/OpenAPI discovery
      "/swagger",
      "/swagger.json",
      "/api-docs",
      "/api-docs.json",
      "/openapi.json",
      "/docs",
      "/documentation",

      // Health/Status endpoints
      "/health",
      "/status",
      "/ping",
      "/version",

      // Root exploration
      "/",

      // Test the EXACT endpoints that work in multi-microsite mode
      `/resources/booking/getBookings?microsite=${client.config.micrositeId}&from=20210101&to=20251231`,
      `/resources/booking/getBookings?microsite=${client.config.micrositeId}&from=20240101&to=20241231`,
      `/resources/booking/getBookings?microsite=${client.config.micrositeId}&from=20250101&to=20251231`,
    ]

    const results = []
    const workingEndpoints = []
    const endpointsWithData = []

    for (const endpoint of endpointsToTest) {
      try {
        console.log(`🧪 Testing: ${endpoint}`)

        // Try both GET and POST methods
        const methods = ["GET"]
        if (endpoint.includes("getBookings") || endpoint.includes("search") || endpoint.includes("find")) {
          methods.push("POST")
        }

        for (const method of methods) {
          try {
            const response = await client.makeAuthenticatedRequest(endpoint, {
              method,
              ...(method === "POST" && {
                body: JSON.stringify({
                  microsite: client.config.micrositeId,
                  operator: client.config.micrositeId,
                  limit: 10,
                }),
              }),
            })

            const result = {
              endpoint,
              method,
              status: response.status,
              success: response.ok,
              contentType: response.headers.get("content-type"),
              data: null as any,
              error: null as any,
              hasBookingData: false,
              bookingCount: 0,
              sampleData: null as any,
            }

            if (response.ok) {
              workingEndpoints.push(`${method} ${endpoint}`)

              try {
                const text = await response.text()

                // Try to parse as JSON
                try {
                  const data = JSON.parse(text)
                  result.data = data

                  // Check if this looks like booking data
                  let bookings: any[] = []
                  if (data.bookedTrip && Array.isArray(data.bookedTrip)) {
                    bookings = data.bookedTrip
                  } else if (Array.isArray(data)) {
                    bookings = data
                  } else if (data.bookings && Array.isArray(data.bookings)) {
                    bookings = data.bookings
                  } else if (data.trips && Array.isArray(data.trips)) {
                    bookings = data.trips
                  } else if (data.reservations && Array.isArray(data.reservations)) {
                    bookings = data.reservations
                  }

                  if (bookings.length > 0) {
                    result.hasBookingData = true
                    result.bookingCount = bookings.length
                    result.sampleData = bookings.slice(0, 3).map((b) => ({
                      id: b.id,
                      reference: b.bookingReference || b.reference,
                      title: b.title || b.name,
                      status: b.status,
                    }))
                    endpointsWithData.push(`${method} ${endpoint} (${bookings.length} bookings)`)
                  }

                  // Check for API documentation
                  if (data.swagger || data.openapi || data.paths || data.info) {
                    result.isApiDoc = true
                  }
                } catch (jsonError) {
                  // Not JSON, store as text
                  result.data = text.substring(0, 500)

                  // Check if HTML contains useful info
                  if (text.includes("booking") || text.includes("trip") || text.includes("reservation")) {
                    result.hasBookingReferences = true
                  }
                }

                console.log(`✅ ${method} ${endpoint}: ${response.status} - ${result.bookingCount} bookings`)
              } catch (textError) {
                result.error = `Failed to read response: ${textError}`
              }
            } else {
              try {
                const errorText = await response.text()
                result.error = errorText.substring(0, 300)
              } catch {
                result.error = `HTTP ${response.status}`
              }
            }

            results.push(result)

            // Break after first successful method for this endpoint
            if (response.ok) break
          } catch (methodError) {
            results.push({
              endpoint,
              method,
              status: 0,
              success: false,
              error: methodError instanceof Error ? methodError.message : String(methodError),
              hasBookingData: false,
              bookingCount: 0,
            })
          }
        }
      } catch (error) {
        results.push({
          endpoint,
          method: "GET",
          status: 0,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          hasBookingData: false,
          bookingCount: 0,
        })
      }
    }

    // Sort results: booking data first, then working endpoints, then by status
    results.sort((a, b) => {
      if (a.hasBookingData && !b.hasBookingData) return -1
      if (!a.hasBookingData && b.hasBookingData) return 1
      if (a.success && !b.success) return -1
      if (!a.success && b.success) return 1
      return b.bookingCount - a.bookingCount
    })

    const summary = {
      totalEndpointsTested: endpointsToTest.length,
      workingEndpoints: workingEndpoints.length,
      endpointsWithBookingData: endpointsWithData.length,
      maxBookingsFound: Math.max(...results.map((r) => r.bookingCount)),
      configNumber,
      micrositeId: client.config.micrositeId,
      bestEndpoints: endpointsWithData.slice(0, 5),
      workingEndpointsList: workingEndpoints.slice(0, 10),
    }

    return NextResponse.json({
      success: true,
      summary,
      results: results.slice(0, 50), // Limit output
      recommendations: results
        .filter((r) => r.hasBookingData)
        .slice(0, 10)
        .map((r) => ({
          endpoint: r.endpoint,
          method: r.method,
          bookingCount: r.bookingCount,
          sampleData: r.sampleData,
          status: r.status,
        })),
      workingEndpoints: results
        .filter((r) => r.success)
        .slice(0, 20)
        .map((r) => ({
          endpoint: r.endpoint,
          method: r.method,
          status: r.status,
          contentType: r.contentType,
          hasData: r.hasBookingData,
        })),
    })
  } catch (error) {
    console.error("❌ Endpoint discovery error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
