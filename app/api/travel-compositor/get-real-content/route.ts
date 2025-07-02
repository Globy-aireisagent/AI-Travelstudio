import type { NextRequest } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bookingId = searchParams.get("bookingId") || "RRP-9263"
    const configNumber = Number.parseInt(searchParams.get("config") || "1")

    console.log(`🔍 GETTING REAL LONG CONTENT for booking: ${bookingId}`)

    const client = createTravelCompositorClient(configNumber)

    // Get the booking first
    const booking = await client.getBooking(bookingId)
    if (!booking) {
      return Response.json({ error: "Booking not found" }, { status: 404 })
    }

    const deepData = booking.rawData || booking
    const hotelServices = deepData.hotelservice || deepData.services?.hotels || []

    const realContent = {
      destinations: [],
      hotels: [],
      bookingImages: deepData.images || [], // All booking images
    }

    // Get REAL destination content with FULL descriptions and images
    const uniqueDestinations = [
      ...new Set(
        hotelServices
          .map((h: any) => ({
            name: h.locationName || h.location || h.destinationName,
            destinationCode: h.destinationCode,
            country: h.country,
          }))
          .filter((d: any) => d.name),
      ),
    ]

    console.log(
      "🏙️ Getting REAL destination content for:",
      uniqueDestinations.map((d) => d.name),
    )

    try {
      const destinationsResponse = await client.getDestinationsByMicrosite(client.config.micrositeId, {
        language: "nl",
      })

      for (const bookingDest of uniqueDestinations) {
        const matchingDest = destinationsResponse.destination?.find(
          (d: any) =>
            d.name?.toLowerCase().includes(bookingDest.name.toLowerCase()) ||
            bookingDest.name.toLowerCase().includes(d.name?.toLowerCase()) ||
            d.code === bookingDest.destinationCode,
        )

        if (matchingDest) {
          try {
            // Get FULL destination details
            const detailedDest = await client.getDestinationById(client.config.micrositeId, matchingDest.id, "nl")

            console.log(`✅ REAL destination content for ${bookingDest.name}:`, {
              hasDescription: !!detailedDest.description,
              descriptionLength: detailedDest.description?.length || 0,
              hasImages: !!detailedDest.images,
              imageCount: detailedDest.images?.length || 0,
            })

            realContent.destinations.push({
              name: bookingDest.name,
              realDescription: detailedDest.description || null, // FULL REAL description
              realImages: detailedDest.images || [], // REAL images
              realFacilities: detailedDest.facilities || [],
              realAttractions: detailedDest.attractions || [],
              realThemes: detailedDest.themes || [],
              coordinates: detailedDest.coordinates,
              country: detailedDest.country,
              region: detailedDest.region,
            })
          } catch (error) {
            console.log(`⚠️ Could not get detailed destination for ${matchingDest.id}`)
            realContent.destinations.push({
              name: bookingDest.name,
              realDescription: matchingDest.description || null,
              realImages: matchingDest.images || [],
              realFacilities: [],
              realAttractions: [],
            })
          }
        } else {
          console.log(`❌ No destination found for ${bookingDest.name}`)
          realContent.destinations.push({
            name: bookingDest.name,
            realDescription: null,
            realImages: [],
            realFacilities: [],
            realAttractions: [],
          })
        }
      }
    } catch (error) {
      console.error("❌ Error getting destinations:", error)
    }

    // Get REAL hotel content with FULL descriptions and images
    console.log("🏨 Getting REAL hotel content...")

    for (const hotel of hotelServices.slice(0, 10)) {
      const hotelId = hotel.hotelId || hotel.providerHotelId
      if (!hotelId) continue

      try {
        console.log(`🔍 Getting REAL content for hotel: ${hotel.hotelName} (ID: ${hotelId})`)

        const hotelDatasheet = await client.getAccommodationDatasheet(hotelId, "nl")

        console.log(`✅ REAL hotel content for ${hotel.hotelName}:`, {
          hasDescription: !!hotelDatasheet.description,
          descriptionLength: hotelDatasheet.description?.length || 0,
          hasImages: !!hotelDatasheet.images,
          imageCount: hotelDatasheet.images?.length || 0,
          hasFacilities: !!hotelDatasheet.facilities,
          facilityCount: hotelDatasheet.facilities?.length || 0,
          hasGiataData: !!hotelDatasheet.giataId,
        })

        realContent.hotels.push({
          bookingHotel: {
            name: hotel.hotelName,
            location: hotel.locationName,
            hotelId: hotelId,
            category: hotel.category,
            checkIn: hotel.startDate,
            checkOut: hotel.endDate,
            nights: hotel.nights,
            roomType: hotel.room?.[0]?.roomType || hotel.room?.[0]?.roomTypeDescription,
            mealPlan: hotel.mealPlan,
            address: hotel.hotelData?.address,
            phone: hotel.hotelData?.phoneNumber,
          },
          realContent: {
            description: hotelDatasheet.description || null, // FULL REAL description
            images: hotelDatasheet.images || [], // REAL images
            facilities: hotelDatasheet.facilities || [], // REAL facilities
            themes: hotelDatasheet.themes || [],
            giataId: hotelDatasheet.giataId,
            giataData: hotelDatasheet.giata,
            address: hotelDatasheet.address,
            coordinates: hotelDatasheet.coordinates,
            category: hotelDatasheet.category,
            stars: hotelDatasheet.stars,
          },
        })
      } catch (error) {
        console.log(`⚠️ Could not get datasheet for hotel ${hotelId}:`, error.message)
        realContent.hotels.push({
          bookingHotel: {
            name: hotel.hotelName,
            location: hotel.locationName,
            hotelId: hotelId,
            category: hotel.category,
            checkIn: hotel.startDate,
            checkOut: hotel.endDate,
            nights: hotel.nights,
            roomType: hotel.room?.[0]?.roomType,
            mealPlan: hotel.mealPlan,
          },
          realContent: null,
          error: error.message,
        })
      }
    }

    console.log("✅ REAL content retrieval complete")

    return Response.json({
      success: true,
      realContent,
      summary: {
        destinationsWithRealContent: realContent.destinations.filter(
          (d) => d.realDescription || d.realImages.length > 0,
        ).length,
        hotelsWithRealContent: realContent.hotels.filter(
          (h) => h.realContent?.description || h.realContent?.images?.length > 0,
        ).length,
        totalDestinationImages: realContent.destinations.reduce((sum, d) => sum + d.realImages.length, 0),
        totalHotelImages: realContent.hotels.reduce((sum, h) => sum + (h.realContent?.images?.length || 0), 0),
        totalBookingImages: realContent.bookingImages.length,
      },
    })
  } catch (error) {
    console.error("❌ Real Content Error:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
