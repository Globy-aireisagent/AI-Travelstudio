import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const configNumber = Number.parseInt(searchParams.get("config") || "1")

  try {
    console.log(`🔍 Analyzing data coverage for Config ${configNumber}...`)

    const client = createTravelCompositorClient(configNumber)
    const suffix = configNumber === 1 ? "" : `_${configNumber}`
    const micrositeId = process.env[`TRAVEL_COMPOSITOR_MICROSITE_ID${suffix}`]

    if (!micrositeId) {
      throw new Error(`No microsite ID found for config ${configNumber}`)
    }

    // Authenticate
    const token = await client.authenticate()

    // Test ALLE mogelijke endpoints en datum ranges
    const testEndpoints = [
      // Verschillende jaar ranges
      {
        endpoint: `/resources/booking/getBookings?microsite=${micrositeId}&from=20250101&to=20251231`,
        name: "2025 Full Year",
      },
      {
        endpoint: `/resources/booking/getBookings?microsite=${micrositeId}&from=20240101&to=20241231`,
        name: "2024 Full Year",
      },
      {
        endpoint: `/resources/booking/getBookings?microsite=${micrositeId}&from=20230101&to=20231231`,
        name: "2023 Full Year",
      },
      {
        endpoint: `/resources/booking/getBookings?microsite=${micrositeId}&from=20220101&to=20221231`,
        name: "2022 Full Year",
      },
      {
        endpoint: `/resources/booking/getBookings?microsite=${micrositeId}&from=20210101&to=20211231`,
        name: "2021 Full Year",
      },
      {
        endpoint: `/resources/booking/getBookings?microsite=${micrositeId}&from=20200101&to=20201231`,
        name: "2020 Full Year",
      },

      // Kleinere ranges voor meer data
      {
        endpoint: `/resources/booking/getBookings?microsite=${micrositeId}&from=20240601&to=20240630`,
        name: "2024 June",
      },
      {
        endpoint: `/resources/booking/getBookings?microsite=${micrositeId}&from=20240701&to=20240731`,
        name: "2024 July",
      },
      {
        endpoint: `/resources/booking/getBookings?microsite=${micrositeId}&from=20240801&to=20240831`,
        name: "2024 August",
      },

      // Verschillende endpoint varianten
      { endpoint: `/resources/bookings?microsite=${micrositeId}&from=20240101&to=20241231`, name: "Alt Endpoint 2024" },
      {
        endpoint: `/resources/booking/list?microsite=${micrositeId}&from=20240101&to=20241231`,
        name: "List Endpoint 2024",
      },
      {
        endpoint: `/resources/booking/search?microsite=${micrositeId}&from=20240101&to=20241231`,
        name: "Search Endpoint 2024",
      },

      // Zonder datum filters
      { endpoint: `/resources/booking/getBookings?microsite=${micrositeId}`, name: "No Date Filter" },
      { endpoint: `/resources/bookings?microsite=${micrositeId}`, name: "Alt No Date Filter" },

      // Pagination test
      {
        endpoint: `/resources/booking/getBookings?microsite=${micrositeId}&from=20240101&to=20241231&limit=1000`,
        name: "2024 with Limit",
      },
      {
        endpoint: `/resources/booking/getBookings?microsite=${micrositeId}&from=20240101&to=20241231&offset=0&limit=500`,
        name: "2024 Paginated",
      },
    ]

    const results = []
    let totalUniqueBookings = 0
    const allBookingIds = new Set<string>()

    for (const test of testEndpoints) {
      try {
        console.log(`🧪 Testing: ${test.name}`)

        const response = await fetch(`https://online.travelcompositor.com${test.endpoint}`, {
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          let bookings: any[] = []

          // Parse verschillende response formaten
          if (data.bookedTrip && Array.isArray(data.bookedTrip)) {
            bookings = data.bookedTrip
          } else if (Array.isArray(data)) {
            bookings = data
          } else if (data.bookings && Array.isArray(data.bookings)) {
            bookings = data.bookings
          } else if (data.results && Array.isArray(data.results)) {
            bookings = data.results
          }

          // Count unique IDs
          const newIds = bookings.filter((b) => b.id && !allBookingIds.has(b.id))
          newIds.forEach((b) => allBookingIds.add(b.id))

          const sampleIds = bookings
            .slice(0, 5)
            .map((b) => b.id)
            .join(", ")
          const idRange =
            bookings.length > 0
              ? {
                  first: bookings[0]?.id,
                  last: bookings[bookings.length - 1]?.id,
                }
              : null

          results.push({
            name: test.name,
            endpoint: test.endpoint,
            status: response.status,
            success: true,
            bookingCount: bookings.length,
            newBookings: newIds.length,
            sampleIds,
            idRange,
            responseKeys: Object.keys(data),
            hasMetadata: !!(data.total || data.count || data.totalCount || data.pagination),
          })

          console.log(`✅ ${test.name}: ${bookings.length} bookings (${newIds.length} new)`)
        } else {
          results.push({
            name: test.name,
            endpoint: test.endpoint,
            status: response.status,
            success: false,
            error: `HTTP ${response.status}`,
            bookingCount: 0,
            newBookings: 0,
          })
          console.log(`❌ ${test.name}: HTTP ${response.status}`)
        }
      } catch (error) {
        results.push({
          name: test.name,
          endpoint: test.endpoint,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          bookingCount: 0,
          newBookings: 0,
        })
        console.log(`❌ ${test.name}: ${error}`)
      }
    }

    totalUniqueBookings = allBookingIds.size

    // Analyze patterns
    const successfulEndpoints = results.filter((r) => r.success && r.bookingCount > 0)
    const bestEndpoints = successfulEndpoints.sort((a, b) => b.bookingCount - a.bookingCount).slice(0, 5)

    const analysis = {
      micrositeId,
      configNumber,
      totalEndpointsTested: testEndpoints.length,
      successfulEndpoints: successfulEndpoints.length,
      totalUniqueBookings,
      bestEndpoints: bestEndpoints.map((e) => ({
        name: e.name,
        bookingCount: e.bookingCount,
        endpoint: e.endpoint,
      })),
      yearlyBreakdown: results
        .filter((r) => r.success && r.name.includes("Full Year"))
        .map((r) => ({
          year: r.name.replace(" Full Year", ""),
          bookingCount: r.bookingCount,
        })),
      recommendations: [],
    }

    // Generate recommendations
    if (totalUniqueBookings < 1000) {
      analysis.recommendations.push("⚠️ Low booking count - API might have pagination or filters")
    }

    if (successfulEndpoints.some((e) => e.hasMetadata)) {
      analysis.recommendations.push("📊 Some endpoints return metadata - check for pagination info")
    }

    const noPaginationEndpoints = successfulEndpoints.filter(
      (e) => !e.endpoint.includes("limit") && !e.endpoint.includes("offset"),
    )
    if (noPaginationEndpoints.length > 0) {
      analysis.recommendations.push("🔄 Try pagination parameters on successful endpoints")
    }

    return NextResponse.json({
      success: true,
      analysis,
      detailedResults: results,
      summary: {
        message: `Found ${totalUniqueBookings} unique bookings across ${successfulEndpoints.length} working endpoints`,
        topEndpoint: bestEndpoints[0]?.name || "None",
        topEndpointCount: bestEndpoints[0]?.bookingCount || 0,
      },
    })
  } catch (error) {
    console.error("❌ Analysis failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
