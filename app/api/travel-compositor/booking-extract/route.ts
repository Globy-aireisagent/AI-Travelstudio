import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"
import { extractBookingData } from "@/lib/booking-data-extractor"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const bookingId = searchParams.get("id")

  if (!bookingId) {
    return NextResponse.json({ error: "Booking ID required" }, { status: 400 })
  }

  try {
    console.log(`🔍 EXTRACT: Fetching and extracting booking ${bookingId}`)

    // Try multiple configs
    const configs = [1, 3]
    let foundData = null
    let foundInConfig = null

    for (const configNum of configs) {
      try {
        console.log(`🧪 Trying config ${configNum}`)
        const client = createTravelCompositorClient(configNum)

        // Get all bookings and search through them
        const allBookings = await client.getAllBookings()
        console.log(`📋 Config ${configNum}: Found ${allBookings.length} total bookings`)

        // Search for our booking
        const booking = allBookings.find((b: any) => {
          const possibleIds = [b.id, b.bookingId, b.bookingReference, b.reference, b.tripId].filter(Boolean)

          return possibleIds.some(
            (id) =>
              String(id).toLowerCase().includes(bookingId.toLowerCase()) ||
              bookingId.toLowerCase().includes(String(id).toLowerCase()),
          )
        })

        if (booking) {
          console.log(`✅ Found booking in config ${configNum}:`, booking.id)
          foundData = booking
          foundInConfig = configNum
          break
        }
      } catch (error) {
        console.log(`❌ Config ${configNum} failed:`, error)
      }
    }

    if (!foundData) {
      return NextResponse.json(
        {
          success: false,
          error: `Booking ${bookingId} not found in any config`,
          searchedConfigs: configs,
        },
        { status: 404 },
      )
    }

    // Extract the booking data using our new extractor
    const extractedBooking = extractBookingData(foundData)

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
              micrositeId: foundInConfig,
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
      foundInConfig,
      extractionInfo: {
        originalDataType: foundData.hotelId ? "hotel_service" : "complete_booking",
        hotelsExtracted: extractedBooking.services.hotels.length,
        imagesFound: extractedBooking.images.length,
        totalPrice: extractedBooking.totalPrice.amount,
        clientName: extractedBooking.client.name,
      },
    })
  } catch (error) {
    console.error("❌ Extract API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
