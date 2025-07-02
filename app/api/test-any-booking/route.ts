import { NextResponse } from "next/server"
import { createFastMultiMicrositeClient } from "@/lib/fast-multi-microsite-client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get("bookingId") || "RRP-9488"

    console.log(`🧪 Testing any booking: ${bookingId}`)

    const fastClient = createFastMultiMicrositeClient()
    const searchResult = await fastClient.searchBookingAcrossAllMicrosites(bookingId)

    return NextResponse.json({
      success: true,
      bookingId,
      found: !!searchResult.booking,
      foundInMicrosite: searchResult.foundInMicrosite,
      totalTime: `${searchResult.totalTime}ms`,
      searchResults: searchResult.searchResults.map((r) => ({
        microsite: r.microsite,
        success: r.success,
        responseTime: `${r.responseTime}ms`,
        error: r.error,
      })),
      bookingData: searchResult.booking
        ? {
            id: searchResult.booking.id,
            title: searchResult.booking.title || searchResult.booking.name,
            status: searchResult.booking.status,
            startDate: searchResult.booking.startDate,
            endDate: searchResult.booking.endDate,
          }
        : null,
    })
  } catch (error) {
    console.error("❌ Test any booking error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
