import type { NextRequest } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bookingId = searchParams.get("bookingId") || "RRP-9263"
    const configNumber = Number.parseInt(searchParams.get("config") || "1")

    console.log(`🗺️ GETTING RICH DESTINATION DATA for booking: ${bookingId}`)

    const client = createTravelCompositorClient(configNumber)

    // Get the booking first
    const booking = await client.getBooking(bookingId)
    if (!booking) {
      return Response.json({ error: "Booking not found" }, { status: 404 })
    }

    const deepData = booking.rawData || booking
    const hotelServices = deepData.hotelservice || deepData.services?.hotels || []

    // Extract unique destinations from hotels
    const destinationNames = new Set<string>()
    const destinationCodes = new Set<string>()

    hotelServices.forEach((hotel: any) => {
      if (hotel.locationName) destinationNames.add(hotel.locationName)
      if (hotel.destinationName) destinationNames.add(hotel.destinationName)
      if (hotel.destinationCode) destinationCodes.add(hotel.destinationCode)
      if (hotel.city) destinationNames.add(hotel.city)
    })

    console.log("🗺️ Found destinations:", {
      names: Array.from(destinationNames),
      codes: Array.from(destinationCodes),
    })

    const richDestinationData = []

    // Get all destinations for this microsite
    const allDestinations = await client.getDestinationsByMicrosite(client.config.micrositeId, {
      language: "nl",
    })

    console.log(`📍 Found ${allDestinations.destination?.length || 0} destinations in microsite`)

    // Match booking destinations with rich destination data
    for (const destName of destinationNames) {
      try {
        console.log(`🔍 Looking for RICH data for destination: ${destName}`)

        // Find matching destination in microsite data
        const matchingDest = allDestinations.destination?.find(
          (d: any) =>
            d.name?.toLowerCase().includes(destName.toLowerCase()) ||
            destName.toLowerCase().includes(d.name?.toLowerCase()),
        )

        if (matchingDest) {
          console.log(`✅ Found RICH destination data for ${destName}:`, {
            code: matchingDest.code,
            hasImages: !!matchingDest.images,
            imageCount: matchingDest.images?.length || 0,
            hasGeolocation: !!matchingDest.geolocation,
            country: matchingDest.country,
            active: matchingDest.active,
          })

          // Get even more detailed destination info if available
          let detailedDestination = null
          if (matchingDest.code) {
            try {
              detailedDestination = await client.getDestinationById(client.config.micrositeId, matchingDest.code, "nl")
              console.log(`📋 Got detailed destination data for ${destName}`)
            } catch (error) {
              console.log(`⚠️ Could not get detailed destination for ${destName}:`, error.message)
            }
          }

          richDestinationData.push({
            bookingDestination: {
              name: destName,
              fromBooking: true,
            },
            richData: {
              // Basic Info
              code: matchingDest.code || null,
              name: matchingDest.name || destName,
              country: matchingDest.country || null,
              provincePostalPrefix: matchingDest.provincePostalPrefix || null,
              active: matchingDest.active || true,

              // Location
              geolocation: matchingDest.geolocation || null, // GPS coordinates!
              latitude: matchingDest.geolocation?.latitude || null,
              longitude: matchingDest.geolocation?.longitude || null,

              // Images
              images: matchingDest.images || [], // REAL destination images

              // Detailed info (if available)
              detailedInfo: detailedDestination || null,
              description: detailedDestination?.description || null,
              attractions: detailedDestination?.attractions || null,
              climate: detailedDestination?.climate || null,
              currency: detailedDestination?.currency || null,
              language: detailedDestination?.language || null,
              timeZone: detailedDestination?.timeZone || null,

              hasRichContent: !!(
                matchingDest.images?.length > 0 ||
                matchingDest.geolocation ||
                detailedDestination?.description
              ),
            },
          })
        } else {
          console.log(`❌ No RICH data found for destination: ${destName}`)
          richDestinationData.push({
            bookingDestination: {
              name: destName,
              fromBooking: true,
            },
            richData: null,
            error: "No matching destination found in microsite",
          })
        }
      } catch (error) {
        console.log(`⚠️ Error getting RICH data for destination ${destName}:`, error.message)
        richDestinationData.push({
          bookingDestination: {
            name: destName,
            fromBooking: true,
          },
          richData: null,
          error: error.message,
        })
      }
    }

    console.log("✅ RICH destination data analysis complete")

    return Response.json({
      success: true,
      richDestinationData,
      summary: {
        destinationsAnalyzed: richDestinationData.length,
        destinationsWithRichData: richDestinationData.filter((d) => d.richData && d.richData.hasRichContent).length,
        destinationsWithImages: richDestinationData.filter((d) => d.richData?.images?.length > 0).length,
        destinationsWithGPS: richDestinationData.filter((d) => d.richData?.geolocation).length,
        destinationsWithDescriptions: richDestinationData.filter((d) => d.richData?.description).length,
        totalImages: richDestinationData.reduce((sum, d) => sum + (d.richData?.images?.length || 0), 0),
        totalGPSPoints: richDestinationData.filter((d) => d.richData?.geolocation).length,
      },
      note: "🗺️ RICH DESTINATION DATA with GPS coordinates, images, and detailed info",
    })
  } catch (error) {
    console.error("❌ Rich Destination Data Error:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
