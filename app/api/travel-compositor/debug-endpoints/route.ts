import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const configNumber = Number.parseInt(searchParams.get("config") || "1")

    console.log(`🔍 Debug: Testing ALL possible booking endpoints for config ${configNumber}`)

    const client = createTravelCompositorClient(configNumber)
    await client.authenticate()

    // Test ALLE mogelijke endpoint variaties
    const endpointsToTest = [
      // Basis endpoints
      `/resources/booking/getBookings`,
      `/resources/booking/getBookings?microsite=${client.config.micrositeId}`,
      `/resources/booking/getBookings?operator=${client.config.micrositeId}`,

      // Met verschillende parameters
      `/resources/booking/getBookings?microsite=${client.config.micrositeId}&limit=100`,
      `/resources/booking/getBookings?operator=${client.config.micrositeId}&limit=100`,
      `/resources/booking/getBookings?limit=100`,

      // Met date ranges (breed)
      `/resources/booking/getBookings?microsite=${client.config.micrositeId}&from=20250101&to=20251231`,
      `/resources/booking/getBookings?operator=${client.config.micrositeId}&from=20250101&to=20251231`,
      `/resources/booking/getBookings?from=20250101&to=20251231`,

      // Met date ranges (2024)
      `/resources/booking/getBookings?microsite=${client.config.micrositeId}&from=20240101&to=20241231`,
      `/resources/booking/getBookings?operator=${client.config.micrositeId}&from=20240101&to=20241231`,
      `/resources/booking/getBookings?from=20240101&to=20241231`,

      // Zonder date restrictions
      `/resources/booking/getBookings?microsite=${client.config.micrositeId}&limit=10000`,
      `/resources/booking/getBookings?operator=${client.config.micrositeId}&limit=10000`,
      `/resources/booking/getBookings?limit=10000`,

      // Alternatieve endpoints
      `/resources/bookings`,
      `/resources/bookings?microsite=${client.config.micrositeId}`,
      `/resources/trip/getBookings`,
      `/resources/trip/getBookings?microsite=${client.config.micrositeId}`,

      // Met status filters
      `/resources/booking/getBookings?microsite=${client.config.micrositeId}&status=booked`,
      `/resources/booking/getBookings?microsite=${client.config.micrositeId}&status=confirmed`,

      // Recente bookings (juni 2025 zoals in screenshot)
      `/resources/booking/getBookings?microsite=${client.config.micrositeId}&from=20250601&to=20250630`,
      `/resources/booking/getBookings?operator=${client.config.micrositeId}&from=20250601&to=20250630`,
      `/resources/booking/getBookings?from=20250601&to=20250630`,
    ]

    const results = []

    for (const endpoint of endpointsToTest) {
      try {
        console.log(`🧪 Testing: ${endpoint}`)
        const response = await client.makeAuthenticatedRequest(endpoint)

        const result = {
          endpoint,
          status: response.status,
          success: response.ok,
          data: null as any,
          error: null as any,
          bookingCount: 0,
          sampleBookings: [] as any[],
          bookingIdRange: null as any,
        }

        if (response.ok) {
          try {
            const data = await response.json()

            // Probeer verschillende data structures
            let bookings: any[] = []
            if (data.bookedTrip && Array.isArray(data.bookedTrip)) {
              bookings = data.bookedTrip
            } else if (Array.isArray(data)) {
              bookings = data
            } else if (data.bookings && Array.isArray(data.bookings)) {
              bookings = data.bookings
            } else if (data.trips && Array.isArray(data.trips)) {
              bookings = data.trips
            }

            result.bookingCount = bookings.length
            result.sampleBookings = bookings.slice(0, 5).map((b) => ({
              id: b.id,
              reference: b.bookingReference || b.customBookingReference || b.reference,
              title: b.title || b.name,
              status: b.status,
              client: b.client?.name || b.clientName,
              creationDate: b.creationDate || b.created,
            }))

            // Bepaal ID range
            if (bookings.length > 0) {
              const ids = bookings.map((b) => b.id).filter(Boolean)
              if (ids.length > 0) {
                const sortedIds = ids.sort((a, b) => {
                  const aNum = Number.parseInt(a.replace(/\D/g, "") || "0")
                  const bNum = Number.parseInt(b.replace(/\D/g, "") || "0")
                  return aNum - bNum
                })
                result.bookingIdRange = {
                  first: sortedIds[0],
                  last: sortedIds[sortedIds.length - 1],
                  sample: sortedIds
                    .filter((_, i) => i % Math.max(1, Math.floor(sortedIds.length / 10)) === 0)
                    .slice(0, 10),
                }
              }
            }

            console.log(`✅ ${endpoint}: ${bookings.length} bookings found`)

            // Als we bookings vinden die lijken op de screenshot (RRP-9xxx), markeer als interessant
            if (bookings.some((b) => b.id && b.id.includes("RRP-9"))) {
              result.isHighPriority = true
              console.log(`🎯 HIGH PRIORITY: Found RRP-9xxx bookings in ${endpoint}`)
            }
          } catch (jsonError) {
            const text = await response.text()
            result.error = `JSON parse error: ${text.substring(0, 200)}`
          }
        } else {
          try {
            const errorText = await response.text()
            result.error = errorText.substring(0, 500)
          } catch {
            result.error = `HTTP ${response.status}`
          }
        }

        results.push(result)
      } catch (error) {
        results.push({
          endpoint,
          status: 0,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          bookingCount: 0,
          sampleBookings: [],
          bookingIdRange: null,
        })
      }
    }

    // Sorteer resultaten: succesvolle eerst, dan op booking count
    results.sort((a, b) => {
      if (a.isHighPriority && !b.isHighPriority) return -1
      if (!a.isHighPriority && b.isHighPriority) return 1
      if (a.success && !b.success) return -1
      if (!a.success && b.success) return 1
      return b.bookingCount - a.bookingCount
    })

    const summary = {
      totalEndpointsTested: endpointsToTest.length,
      successfulEndpoints: results.filter((r) => r.success).length,
      endpointsWithBookings: results.filter((r) => r.bookingCount > 0).length,
      maxBookingsFound: Math.max(...results.map((r) => r.bookingCount)),
      highPriorityEndpoints: results.filter((r) => r.isHighPriority).length,
      bestEndpoint: results.find((r) => r.bookingCount > 0)?.endpoint,
      configNumber,
      micrositeId: client.config.micrositeId,
    }

    return NextResponse.json({
      success: true,
      summary,
      results: results.slice(0, 20), // Limiteer output
      recommendations: results
        .filter((r) => r.bookingCount > 0)
        .slice(0, 5)
        .map((r) => ({
          endpoint: r.endpoint,
          bookingCount: r.bookingCount,
          idRange: r.bookingIdRange,
          priority: r.isHighPriority ? "HIGH" : "NORMAL",
        })),
    })
  } catch (error) {
    console.error("❌ Debug endpoints error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
