import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bookingId = searchParams.get("bookingId") || "RRP-9263"
    const configNumber = Number.parseInt(searchParams.get("config") || "1")

    console.log(`🏨 GETTING RICH HOTEL DATA for booking: ${bookingId}`)

    const client = createTravelCompositorClient(configNumber)

    // Get the booking first
    const booking = await client.getBooking(bookingId)
    if (!booking) {
      return Response.json({ error: "Booking not found" }, { status: 404 })
    }

    const deepData = booking.rawData || booking
    const hotelServices = deepData.hotelservice || deepData.services?.hotels || []

    console.log("🏨 Found hotels in booking:", hotelServices.length)

    const richHotelData = []

    // Get RICH hotel data for each hotel
    for (const hotel of hotelServices.slice(0, 5)) {
      try {
        const hotelId = hotel.hotelId || hotel.providerHotelId
        if (!hotelId) continue

        console.log(`🔍 Getting RICH data for hotel: ${hotel.hotelName} (ID: ${hotelId})`)

        // Try to get the rich hotel data using GetHotelRS endpoint
        const richHotel = await client.getHotelDetails(hotelId, "nl")

        console.log(`✅ RICH hotel data for ${hotel.hotelName}:`, {
          hasGiataId: !!richHotel.giataId,
          hasDescription: !!richHotel.description,
          hasImages: !!richHotel.images,
          imageCount: richHotel.images?.length || 0,
          hasFacilities: !!richHotel.facilities,
          hasIncludedServices: !!richHotel.includedServices,
          hasRatings: !!richHotel.ratings,
          hasAddress: !!richHotel.address,
          accommodationType: richHotel.accommodationType,
        })

        richHotelData.push({
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
          richData: {
            // GIATA Data
            giataId: richHotel.giataId || null,

            // Basic Info
            name: richHotel.name || hotel.hotelName,
            description: richHotel.description || null, // REAL description
            category: richHotel.category || hotel.category,
            accommodationType: richHotel.accommodationType || null,
            accommodationSubtype: richHotel.accommodationSubtype || null,
            chain: richHotel.chain || null,

            // Images
            images: richHotel.images || [], // REAL images

            // Location & Contact
            address: richHotel.address || null,
            phoneNumber: richHotel.phoneNumber || null,
            destination: richHotel.destination || null,
            geolocation: richHotel.geolocation || null,

            // Services (VERY DETAILED)
            includedServices: richHotel.includedServices || [], // What's included
            nonIncludedServices: richHotel.nonIncludedServices || [], // What's NOT included
            otherServices: richHotel.otherServices || [], // Additional services

            // Facilities (DETAILED)
            facilities: richHotel.facilities || null, // Rich facilities object

            // Ratings & Reviews
            ratings: richHotel.ratings || null,

            // Internal
            internalRemark: richHotel.internalRemark || null,

            hasRichContent: !!(
              richHotel.description ||
              richHotel.images?.length > 0 ||
              richHotel.facilities ||
              richHotel.includedServices?.length > 0 ||
              richHotel.giataId
            ),
          },
        })
      } catch (error) {
        console.log(`⚠️ Could not get RICH data for hotel ${hotel.hotelName}:`, error.message)
        richHotelData.push({
          bookingHotel: {
            name: hotel.hotelName,
            location: hotel.locationName,
            hotelId: hotel.hotelId || hotel.providerHotelId,
            category: hotel.category,
          },
          richData: null,
          error: error.message,
        })
      }
    }

    console.log("✅ RICH hotel data analysis complete")

    return Response.json({
      success: true,
      richHotelData,
      summary: {
        hotelsAnalyzed: richHotelData.length,
        hotelsWithRichData: richHotelData.filter((h) => h.richData && h.richData.hasRichContent).length,
        hotelsWithGiataId: richHotelData.filter((h) => h.richData?.giataId).length,
        hotelsWithDescriptions: richHotelData.filter((h) => h.richData?.description).length,
        hotelsWithImages: richHotelData.filter((h) => h.richData?.images?.length > 0).length,
        hotelsWithFacilities: richHotelData.filter((h) => h.richData?.facilities).length,
        hotelsWithServices: richHotelData.filter((h) => h.richData?.includedServices?.length > 0).length,
        totalImages: richHotelData.reduce((sum, h) => sum + (h.richData?.images?.length || 0), 0),
      },
      note: "🏨 RICH HOTEL DATA from GetHotelRS endpoint with GIATA, services, facilities, ratings",
    })
  } catch (error) {
    console.error("❌ Rich Hotel Data Error:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { hotelId, hotelName, location, micrositeId } = await request.json()

    console.log(`🏨 POST: Getting rich hotel data for: ${hotelName} (ID: ${hotelId})`)

    const client = createTravelCompositorClient()
    const token = await client.authenticate()

    const richHotelData = {
      images: [] as string[],
      facilities: [] as string[],
      description: null as string | null,
      amenities: [] as string[],
      locationDescription: null as string | null,
    }

    // Try to get hotel datasheet
    if (hotelId) {
      try {
        console.log(`📋 Trying hotel datasheet for ID: ${hotelId}`)

        const datasheetResponse = await fetch(
          `https://online.travelcompositor.com/resources/accommodations/${hotelId}/datasheet?lang=nl`,
          {
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        )

        if (datasheetResponse.ok) {
          const datasheetData = await datasheetResponse.json()
          console.log("✅ Hotel datasheet found")

          // Extract data
          if (datasheetData.images) {
            richHotelData.images = Array.isArray(datasheetData.images)
              ? datasheetData.images.map((img: any) => img.url || img.src || img)
              : [datasheetData.images]
          }

          if (datasheetData.description) {
            richHotelData.description = datasheetData.description
          }

          if (datasheetData.facilities) {
            richHotelData.facilities = Array.isArray(datasheetData.facilities)
              ? datasheetData.facilities.map((f: any) => f.name || f.description || f)
              : [datasheetData.facilities]
          }

          if (datasheetData.amenities) {
            richHotelData.amenities = Array.isArray(datasheetData.amenities)
              ? datasheetData.amenities.map((a: any) => a.name || a.description || a)
              : [datasheetData.amenities]
          }
        }
      } catch (error) {
        console.error("❌ Error fetching hotel datasheet:", error)
      }
    }

    return NextResponse.json({
      success: true,
      hotelData: richHotelData,
      hotel: hotelName,
      location: location,
    })
  } catch (error) {
    console.error("❌ Error in rich hotel data API:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        hotelData: {
          images: [],
          facilities: [],
          description: null,
          amenities: [],
          locationDescription: null,
        },
      },
      { status: 500 },
    )
  }
}
