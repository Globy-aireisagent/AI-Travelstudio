import { type NextRequest, NextResponse } from "next/server"
import { extractBookingData } from "@/lib/booking-data-extractor"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const bookingReference = searchParams.get("bookingReference")

  if (!bookingReference) {
    return NextResponse.json({ error: "Booking reference required" }, { status: 400 })
  }

  try {
    console.log(`🔄 FALLBACK: Using working API method for ${bookingReference}`)

    // First, let's try the simple booking cache approach
    const cacheResponse = await fetch(`${request.nextUrl.origin}/api/travel-compositor/cache`, {
      method: "GET",
    })

    if (cacheResponse.ok) {
      const cacheData = await cacheResponse.json()
      console.log(`📊 Cache contains ${cacheData.bookings?.length || 0} bookings`)

      // Search in cache first
      const foundInCache = cacheData.bookings?.find(
        (booking: any) =>
          booking.bookingReference === bookingReference ||
          booking.id === bookingReference ||
          booking.customBookingReference === bookingReference,
      )

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

    // If not in cache, try the multi-microsite client
    const { MultiMicrositeClient } = await import("@/lib/multi-microsite-client")
    const client = new MultiMicrositeClient()

    console.log(`🔍 Searching across all microsite configs...`)
    const searchResult = await client.searchBooking(bookingReference)

    if (!searchResult.success || !searchResult.booking) {
      return NextResponse.json(
        {
          success: false,
          error: `Booking ${bookingReference} not found in any configuration`,
          method: "multi_microsite_search",
          searchDetails: searchResult.details,
        },
        { status: 404 },
      )
    }

    const extractedBooking = extractBookingData(searchResult.booking)

    // Try to fetch images for hotels
    try {
      console.log(`🖼️ Fetching images for ${extractedBooking.services.hotels.length} hotels...`)

      for (const hotel of extractedBooking.services.hotels) {
        try {
          const imageResponse = await fetch(`${request.nextUrl.origin}/api/travel-compositor/hotel-images`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              hotelData: hotel,
              micrositeId: searchResult.configId,
            }),
          })

          if (imageResponse.ok) {
            const imageData = await imageResponse.json()
            if (imageData.images?.foundImages) {
              extractedBooking.images.push(...imageData.images.foundImages)
              console.log(`✅ Added ${imageData.images.foundImages.length} images for ${hotel.displayName}`)
            }
          }
        } catch (error) {
          console.log(`⚠️ Could not fetch images for hotel ${hotel.displayName}:`, error)
        }
      }

      // Remove duplicates
      extractedBooking.images = [...new Set(extractedBooking.images)]
    } catch (error) {
      console.log("⚠️ Error fetching images:", error)
    }

    return NextResponse.json({
      success: true,
      booking: extractedBooking,
      foundInConfig: searchResult.configId,
      method: searchResult.method,
      extractionInfo: {
        originalDataType: searchResult.booking.hotelservice ? "complete_booking" : "single_service",
        hotelsExtracted: extractedBooking.services.hotels.length,
        imagesFound: extractedBooking.images.length,
        totalPrice: extractedBooking.totalPrice.amount,
        clientName: extractedBooking.client.name,
      },
    })
  } catch (error) {
    console.error("❌ Fallback API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        method: "fallback_search",
      },
      { status: 500 },
    )
  }
}
