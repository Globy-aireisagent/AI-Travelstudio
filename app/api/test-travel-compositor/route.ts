import { type NextRequest, NextResponse } from "next/server"
import { createFastMultiMicrositeClient } from "@/lib/travel-compositor-client-fast"

export async function GET(request: NextRequest) {
  try {
    console.log("🧪 Testing Travel Compositor connection...")

    // Test environment variables
    const envCheck = {
      config1: {
        username: !!process.env.TRAVEL_COMPOSITOR_USERNAME,
        password: !!process.env.TRAVEL_COMPOSITOR_PASSWORD,
        micrositeId: !!process.env.TRAVEL_COMPOSITOR_MICROSITE_ID,
      },
      config2: {
        username: !!process.env.TRAVEL_COMPOSITOR_USERNAME_2,
        password: !!process.env.TRAVEL_COMPOSITOR_PASSWORD_2,
        micrositeId: !!process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_2,
      },
      config3: {
        username: !!process.env.TRAVEL_COMPOSITOR_USERNAME_3,
        password: !!process.env.TRAVEL_COMPOSITOR_PASSWORD_3,
        micrositeId: !!process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3,
      },
      config4: {
        username: !!process.env.TRAVEL_COMPOSITOR_USERNAME_4,
        password: !!process.env.TRAVEL_COMPOSITOR_PASSWORD_4,
        micrositeId: !!process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_4,
      },
    }

    console.log("🔧 Environment variables check:", envCheck)

    // Test a known booking ID
    const testBookingId = "RRP-9263" // Use a known booking ID

    try {
      const fastClient = createFastMultiMicrositeClient()
      const searchResult = await fastClient.searchBookingAcrossAllMicrosites(testBookingId)

      return NextResponse.json({
        success: true,
        message: "Travel Compositor test completed",
        envCheck,
        testBookingId,
        searchResult: {
          found: !!searchResult.booking,
          foundInMicrosite: searchResult.foundInMicrosite,
          searchTime: searchResult.searchTime,
          searchResults: searchResult.searchResults,
          bookingData: searchResult.booking
            ? {
                id: searchResult.booking.id,
                title: searchResult.booking.title,
                destination: searchResult.booking.destination,
              }
            : null,
        },
      })
    } catch (searchError) {
      console.error("❌ Search test failed:", searchError)

      return NextResponse.json({
        success: false,
        message: "Travel Compositor search test failed",
        envCheck,
        testBookingId,
        error: searchError instanceof Error ? searchError.message : "Unknown search error",
      })
    }
  } catch (error) {
    console.error("❌ Travel Compositor test failed:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Travel Compositor test failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
