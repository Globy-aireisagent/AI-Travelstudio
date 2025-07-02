import { NextResponse } from "next/server"
import { createFastMultiMicrositeClient } from "@/lib/fast-multi-microsite-client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startId = Number.parseInt(searchParams.get("start") || "9480")
    const endId = Number.parseInt(searchParams.get("end") || "9488")

    console.log(`🧪 Testing booking range: RRP-${startId} to RRP-${endId}`)

    const fastClient = createFastMultiMicrositeClient()
    const testResults = []
    const foundBookings = []

    // Test range of booking IDs
    for (let id = startId; id <= endId; id++) {
      const bookingId = `RRP-${id}`

      try {
        const searchResult = await fastClient.searchBookingAcrossAllMicrosites(bookingId)

        const result = {
          bookingId,
          found: !!searchResult.booking,
          foundInMicrosite: searchResult.foundInMicrosite,
          searchTime: searchResult.totalTime,
        }

        testResults.push(result)

        if (searchResult.booking) {
          foundBookings.push({
            ...result,
            bookingData: {
              id: searchResult.booking.id,
              title: searchResult.booking.title || searchResult.booking.name,
              client: searchResult.booking.client?.name || searchResult.booking.clientName,
              destination: searchResult.booking.destination,
              startDate: searchResult.booking.startDate || searchResult.booking.departureDate,
            },
          })
        }

        console.log(
          `${searchResult.booking ? "✅" : "❌"} ${bookingId}: ${searchResult.foundInMicrosite || "Not found"}`,
        )
      } catch (error) {
        console.error(`❌ Error testing ${bookingId}:`, error)
        testResults.push({
          bookingId,
          found: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Booking range test completed: RRP-${startId} to RRP-${endId}`,
      testResults,
      foundBookings,
      summary: {
        totalTested: endId - startId + 1,
        found: testResults.filter((r) => r.found).length,
        notFound: testResults.filter((r) => !r.found).length,
        successRate: `${Math.round((testResults.filter((r) => r.found).length / testResults.length) * 100)}%`,
      },
    })
  } catch (error) {
    console.error("❌ Booking range test error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to test booking range",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
