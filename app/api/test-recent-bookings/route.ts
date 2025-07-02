import { NextResponse } from "next/server"
import { createFastMultiMicrositeClient } from "@/lib/fast-multi-microsite-client"

export async function GET() {
  try {
    console.log("🧪 Testing recent bookings from Travel Compositor...")

    const fastClient = createFastMultiMicrositeClient()

    // Test the most recent bookings
    const recentBookingIds = ["RRP-9488", "RRP-9487", "RRP-9486", "RRP-9485", "RRP-9484"]
    const testResults = []

    for (const bookingId of recentBookingIds) {
      console.log(`🔍 Testing booking: ${bookingId}`)

      try {
        const searchResult = await fastClient.searchBookingAcrossAllMicrosites(bookingId)

        testResults.push({
          bookingId,
          found: !!searchResult.booking,
          foundInMicrosite: searchResult.foundInMicrosite,
          searchTime: searchResult.totalTime,
          hasData: searchResult.booking ? Object.keys(searchResult.booking).length > 0 : false,
        })

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
      message: "Recent bookings test completed",
      testResults,
      summary: {
        totalTested: recentBookingIds.length,
        found: testResults.filter((r) => r.found).length,
        notFound: testResults.filter((r) => !r.found).length,
      },
    })
  } catch (error) {
    console.error("❌ Recent bookings test error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to test recent bookings",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
