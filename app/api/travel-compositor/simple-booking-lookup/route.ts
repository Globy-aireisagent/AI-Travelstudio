import { type NextRequest, NextResponse } from "next/server"
import { extractBookingData } from "@/lib/booking-data-extractor"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const bookingReference = searchParams.get("bookingReference")

  if (!bookingReference) {
    return NextResponse.json({ error: "Booking reference required" }, { status: 400 })
  }

  try {
    console.log(`🔍 SIMPLE LOOKUP: Searching for ${bookingReference}`)

    // Try cache first
    try {
      const cacheResponse = await fetch(`${request.nextUrl.origin}/api/travel-compositor/cache`, {
        method: "GET",
      })

      if (cacheResponse.ok) {
        const cacheData = await cacheResponse.json()
        console.log(`📊 Cache contains ${cacheData.bookings?.length || 0} bookings`)

        if (cacheData.bookings && Array.isArray(cacheData.bookings)) {
          const foundInCache = cacheData.bookings.find((booking: any) => {
            return (
              booking.bookingReference === bookingReference ||
              booking.id === bookingReference ||
              booking.customBookingReference === bookingReference
            )
          })

          if (foundInCache) {
            console.log(`✅ Found booking in cache: ${foundInCache.id}`)
            const extractedBooking = extractBookingData(foundInCache)

            return NextResponse.json({
              success: true,
              booking: extractedBooking,
              foundInConfig: "cache",
              method: "cache_lookup",
              extractionInfo: {
                originalDataType: foundInCache.hotelservice ? "complete_booking" : "single_service",
                hotelsExtracted: extractedBooking.services.hotels.length,
                imagesFound: extractedBooking.images.length,
                totalPrice: extractedBooking.totalPrice.amount,
                clientName: extractedBooking.client.name,
              },
            })
          }
        }
      }
    } catch (cacheError) {
      console.log("⚠️ Cache lookup failed:", cacheError)
    }

    // If not in cache, return not found
    return NextResponse.json(
      {
        success: false,
        error: `Booking ${bookingReference} not found in cache`,
        method: "cache_only",
        suggestion: "Try refreshing the cache first",
      },
      { status: 404 },
    )
  } catch (error) {
    console.error("❌ Simple lookup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        method: "cache_only",
      },
      { status: 500 },
    )
  }
}
