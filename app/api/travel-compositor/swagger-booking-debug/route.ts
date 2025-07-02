import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const bookingId = searchParams.get("bookingId") || "RRP-9200"
  const configNumber = Number.parseInt(searchParams.get("config") || "1")

  console.log(`🔍 Comprehensive booking debug for: ${bookingId}`)

  try {
    const client = createTravelCompositorClient(configNumber)
    await client.authenticate()

    // 1. First check Swagger documentation
    const swaggerInfo = await checkSwaggerDocumentation(client)

    // 2. Test all possible booking endpoints
    const endpointTests = await testAllBookingEndpoints(client, bookingId)

    // 3. Check if booking exists in different date ranges
    const dateRangeTests = await testDifferentDateRanges(client, bookingId)

    // 4. Test different query parameters
    const parameterTests = await testDifferentParameters(client, bookingId)

    return NextResponse.json({
      success: true,
      bookingId,
      configNumber,
      micrositeId: client.config.micrositeId,
      results: {
        swaggerInfo,
        endpointTests,
        dateRangeTests,
        parameterTests,
      },
      recommendations: generateRecommendations(endpointTests, dateRangeTests, parameterTests),
    })
  } catch (error) {
    console.error("❌ Comprehensive debug error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

async function checkSwaggerDocumentation(client: any) {
  console.log("📚 Checking Swagger documentation...")

  const swaggerEndpoints = [
    "/swagger.json",
    "/api-docs",
    "/swagger-ui.html",
    "/docs",
    "/swagger/v1/swagger.json",
    "/api/swagger.json",
  ]

  const results = []

  for (const endpoint of swaggerEndpoints) {
    try {
      const response = await client.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        results.push({
          endpoint,
          success: true,
          hasBookingPaths: JSON.stringify(data).includes("booking"),
          pathsFound: extractBookingPaths(data),
        })
      } else {
        results.push({
          endpoint,
          success: false,
          status: response.status,
        })
      }
    } catch (error) {
      results.push({
        endpoint,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return results
}

function extractBookingPaths(swaggerData: any): string[] {
  const paths = []

  if (swaggerData.paths) {
    for (const [path, methods] of Object.entries(swaggerData.paths)) {
      if (path.toLowerCase().includes("booking")) {
        paths.push(path)
      }
    }
  }

  return paths
}

async function testAllBookingEndpoints(client: any, bookingId: string) {
  console.log("🧪 Testing all possible booking endpoints...")

  const micrositeId = client.config.micrositeId

  // Alle mogelijke endpoint variaties
  const endpoints = [
    // Basis endpoints
    `/resources/booking/getBookings`,
    `/booking/getBookings`,
    `/api/booking/getBookings`,
    `/v1/booking/getBookings`,

    // Met microsite parameter
    `/resources/booking/getBookings?microsite=${micrositeId}`,
    `/booking/getBookings?microsite=${micrositeId}`,
    `/api/booking/getBookings?microsite=${micrositeId}`,

    // Specifieke booking endpoints
    `/resources/booking/getBooking/${bookingId}`,
    `/booking/getBooking/${bookingId}`,
    `/api/booking/${bookingId}`,
    `/resources/booking/${bookingId}`,

    // Search endpoints
    `/resources/booking/search?id=${bookingId}`,
    `/booking/search?query=${bookingId}`,
    `/api/booking/search?bookingId=${bookingId}`,

    // Trip endpoints (alternatief)
    `/resources/trip/getTrips`,
    `/resources/trip/getTrips?microsite=${micrositeId}`,
    `/trip/getTrips?microsite=${micrositeId}`,

    // Reservation endpoints
    `/resources/reservation/getReservations`,
    `/resources/reservation/getReservations?microsite=${micrositeId}`,
    `/reservation/getReservations?microsite=${micrositeId}`,
  ]

  const results = []

  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testing: ${endpoint}`)

      const response = await client.makeAuthenticatedRequest(endpoint)

      let data = null
      let bookingFound = false
      let totalBookings = 0

      if (response.ok) {
        try {
          data = await response.json()

          // Check verschillende data structures
          const bookings = extractBookingsFromResponse(data)
          totalBookings = bookings.length

          // Zoek naar de specifieke booking
          bookingFound = bookings.some((booking: any) => matchesBookingId(booking, bookingId))
        } catch (parseError) {
          data = { parseError: "Could not parse JSON" }
        }
      }

      results.push({
        endpoint,
        status: response.status,
        success: response.ok,
        totalBookings,
        bookingFound,
        contentType: response.headers.get("content-type"),
        dataStructure: data ? Object.keys(data).slice(0, 10) : null,
      })
    } catch (error) {
      results.push({
        endpoint,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return results
}

async function testDifferentDateRanges(client: any, bookingId: string) {
  console.log("📅 Testing different date ranges...")

  const micrositeId = client.config.micrositeId

  // Uitgebreide datum ranges
  const dateRanges = [
    { name: "2025 Full Year", from: "20250101", to: "20251231" },
    { name: "2024 Full Year", from: "20240101", to: "20241231" },
    { name: "2023 Full Year", from: "20230101", to: "20231231" },
    { name: "2022 Full Year", from: "20220101", to: "20221231" },
    { name: "2021 Full Year", from: "20210101", to: "20211231" },
    { name: "Last 6 Months", from: "20240601", to: "20241231" },
    { name: "Current Month", from: "20241201", to: "20241231" },
    { name: "Wide Range", from: "20200101", to: "20251231" },
    { name: "No Date Filter", from: null, to: null },
  ]

  const results = []

  for (const range of dateRanges) {
    try {
      let endpoint = `/resources/booking/getBookings?microsite=${micrositeId}`

      if (range.from && range.to) {
        endpoint += `&from=${range.from}&to=${range.to}`
      }

      console.log(`📅 Testing range: ${range.name}`)

      const response = await client.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        const bookings = extractBookingsFromResponse(data)

        const bookingFound = bookings.some((booking: any) => matchesBookingId(booking, bookingId))

        results.push({
          range: range.name,
          success: true,
          totalBookings: bookings.length,
          bookingFound,
          endpoint,
          sampleIds: bookings
            .slice(0, 5)
            .map((b: any) => b.id)
            .filter(Boolean),
        })
      } else {
        results.push({
          range: range.name,
          success: false,
          status: response.status,
          endpoint,
        })
      }
    } catch (error) {
      results.push({
        range: range.name,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return results
}

async function testDifferentParameters(client: any, bookingId: string) {
  console.log("🔧 Testing different parameters...")

  const micrositeId = client.config.micrositeId

  const parameterTests = [
    // Pagination parameters
    { name: "With Pagination", params: `microsite=${micrositeId}&first=0&limit=1000` },
    { name: "Large Limit", params: `microsite=${micrositeId}&limit=10000` },
    { name: "No Limit", params: `microsite=${micrositeId}` },

    // Status filters
    { name: "All Statuses", params: `microsite=${micrositeId}&status=all` },
    { name: "Confirmed Only", params: `microsite=${micrositeId}&status=confirmed` },
    { name: "Booked Only", params: `microsite=${micrositeId}&status=booked` },

    // Different ID formats
    { name: "Search by Reference", params: `microsite=${micrositeId}&reference=${bookingId}` },
    { name: "Search by BookingId", params: `microsite=${micrositeId}&bookingId=${bookingId}` },
    { name: "Search by TripId", params: `microsite=${micrositeId}&tripId=${bookingId}` },

    // Alternative microsite formats
    { name: "Operator Parameter", params: `operator=${micrositeId}` },
    { name: "Site Parameter", params: `site=${micrositeId}` },
    { name: "MicrositeId Parameter", params: `micrositeId=${micrositeId}` },
  ]

  const results = []

  for (const test of parameterTests) {
    try {
      const endpoint = `/resources/booking/getBookings?${test.params}`

      console.log(`🔧 Testing: ${test.name}`)

      const response = await client.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        const bookings = extractBookingsFromResponse(data)

        const bookingFound = bookings.some((booking: any) => matchesBookingId(booking, bookingId))

        results.push({
          test: test.name,
          success: true,
          totalBookings: bookings.length,
          bookingFound,
          endpoint,
          params: test.params,
        })
      } else {
        results.push({
          test: test.name,
          success: false,
          status: response.status,
          endpoint,
        })
      }
    } catch (error) {
      results.push({
        test: test.name,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return results
}

function extractBookingsFromResponse(data: any): any[] {
  // Probeer verschillende data structures
  if (data.bookedTrip && Array.isArray(data.bookedTrip)) {
    return data.bookedTrip
  }
  if (data.bookings && Array.isArray(data.bookings)) {
    return data.bookings
  }
  if (data.trips && Array.isArray(data.trips)) {
    return data.trips
  }
  if (data.reservations && Array.isArray(data.reservations)) {
    return data.reservations
  }
  if (Array.isArray(data)) {
    return data
  }
  if (data.data && Array.isArray(data.data)) {
    return data.data
  }
  if (data.results && Array.isArray(data.results)) {
    return data.results
  }

  return []
}

function matchesBookingId(booking: any, searchId: string): boolean {
  const possibleIds = [
    booking.id,
    booking.bookingId,
    booking.reservationId,
    booking.bookingReference,
    booking.reference,
    booking.tripId,
    booking.customBookingReference,
    booking.externalId,
  ].filter(Boolean)

  return possibleIds.some((id) => {
    const idStr = String(id).toLowerCase()
    const searchStr = searchId.toLowerCase()
    return idStr === searchStr || idStr.includes(searchStr) || searchStr.includes(idStr)
  })
}

function generateRecommendations(endpointTests: any[], dateRangeTests: any[], parameterTests: any[]) {
  const recommendations = []

  // Check welke endpoints werken
  const workingEndpoints = endpointTests.filter((test) => test.success && test.totalBookings > 0)
  if (workingEndpoints.length > 0) {
    recommendations.push({
      type: "working_endpoints",
      message: `Found ${workingEndpoints.length} working endpoints`,
      endpoints: workingEndpoints.map((e) => e.endpoint),
    })
  }

  // Check welke date ranges bookings hebben
  const workingDateRanges = dateRangeTests.filter((test) => test.success && test.totalBookings > 0)
  if (workingDateRanges.length > 0) {
    recommendations.push({
      type: "working_date_ranges",
      message: `Found bookings in ${workingDateRanges.length} date ranges`,
      ranges: workingDateRanges.map((r) => ({ range: r.range, bookings: r.totalBookings })),
    })
  }

  // Check of booking gevonden is
  const foundInEndpoint = endpointTests.find((test) => test.bookingFound)
  const foundInDateRange = dateRangeTests.find((test) => test.bookingFound)
  const foundInParameter = parameterTests.find((test) => test.bookingFound)

  if (foundInEndpoint || foundInDateRange || foundInParameter) {
    recommendations.push({
      type: "booking_found",
      message: "Booking was found!",
      details: {
        endpoint: foundInEndpoint?.endpoint,
        dateRange: foundInDateRange?.range,
        parameters: foundInParameter?.params,
      },
    })
  } else {
    recommendations.push({
      type: "booking_not_found",
      message: "Booking not found in any test",
      suggestions: [
        "Check if booking ID format is correct",
        "Verify booking exists in the system",
        "Try different microsite configurations",
        "Check if booking is in a different date range",
      ],
    })
  }

  return recommendations
}
