import type { NextRequest } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bookingId = searchParams.get("bookingId") || "RRP-9263"
    const configNumber = Number.parseInt(searchParams.get("config") || "1")

    console.log(`🔍 ANALYZING REAL TRAVEL COMPOSITOR CONTENT for booking: ${bookingId}`)

    const client = createTravelCompositorClient(configNumber)

    // Get the booking first
    const booking = await client.getBooking(bookingId)
    if (!booking) {
      return Response.json({ error: "Booking not found" }, { status: 404 })
    }

    console.log("📋 Found booking:", booking.bookingReference || booking.id)

    const analysis = {
      bookingId: bookingId,
      micrositeId: client.config.micrositeId,
      realDestinations: [],
      realHotels: [],
      realAccommodationDatasheets: [],
      availableRealContent: {
        destinations: null,
        accommodations: null,
        facilities: null,
        themes: null,
      },
    }

    // Extract destinations from booking
    const deepData = booking.rawData || booking
    const hotelServices = deepData.hotelservice || deepData.services?.hotels || []
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

    console.log("🏙️ Found destinations in booking:", uniqueDestinations)

    // Get REAL destination content from Travel Compositor
    try {
      console.log("🔍 Getting REAL destinations from Travel Compositor...")
      const destinationsResponse = await client.getDestinationsByMicrosite(client.config.micrositeId, {
        language: "nl",
      })

      console.log("📍 Travel Compositor destinations response:", {
        found: destinationsResponse.destination?.length || 0,
        sample: destinationsResponse.destination?.slice(0, 3).map((d: any) => ({
          id: d.id,
          name: d.name,
          hasDescription: !!d.description,
          hasImages: !!d.images,
        })),
      })

      // Match booking destinations with Travel Compositor destinations
      for (const bookingDest of uniqueDestinations) {
        const matchingDest = destinationsResponse.destination?.find(
          (d: any) =>
            d.name?.toLowerCase().includes(bookingDest.name.toLowerCase()) ||
            bookingDest.name.toLowerCase().includes(d.name?.toLowerCase()) ||
            d.code === bookingDest.destinationCode,
        )

        if (matchingDest) {
          console.log(`✅ Found REAL destination data for ${bookingDest.name}`)

          // Get detailed destination info from Travel Compositor
          try {
            const detailedDest = await client.getDestinationById(client.config.micrositeId, matchingDest.id, "nl")

            analysis.realDestinations.push({
              bookingDestination: bookingDest,
              travelCompositorData: {
                id: detailedDest.id,
                name: detailedDest.name,
                description: detailedDest.description || null, // REAL description or null
                images: detailedDest.images || [], // REAL images or empty
                facilities: detailedDest.facilities || [], // REAL facilities or empty
                attractions: detailedDest.attractions || [], // REAL attractions or empty
                themes: detailedDest.themes || [], // REAL themes or empty
                coordinates: detailedDest.coordinates || null,
                country: detailedDest.country || null,
                region: detailedDest.region || null,
              },
              hasRealContent: !!(detailedDest.description || detailedDest.images?.length > 0),
            })
          } catch (error) {
            console.log(`⚠️ Could not get detailed destination for ${matchingDest.id}:`, error.message)
            analysis.realDestinations.push({
              bookingDestination: bookingDest,
              travelCompositorData: {
                id: matchingDest.id,
                name: matchingDest.name,
                description: matchingDest.description || null,
                images: matchingDest.images || [],
                facilities: [],
                attractions: [],
              },
              hasRealContent: !!(matchingDest.description || matchingDest.images?.length > 0),
            })
          }
        } else {
          console.log(`❌ No REAL destination data found in Travel Compositor for ${bookingDest.name}`)
          analysis.realDestinations.push({
            bookingDestination: bookingDest,
            travelCompositorData: null,
            hasRealContent: false,
          })
        }
      }
    } catch (error) {
      console.error("❌ Error getting REAL destinations:", error)
    }

    // Get REAL hotel content from Travel Compositor
    const hotelIds = hotelServices
      .map((h: any) => h.hotelId || h.providerHotelId)
      .filter(Boolean)
      .slice(0, 10) // Limit to first 10 hotels

    console.log("🏨 Testing REAL hotel data for IDs:", hotelIds)

    // Test REAL accommodation datasheets
    if (hotelIds.length > 0) {
      try {
        console.log("🔍 Getting REAL accommodation datasheets from Travel Compositor...")
        const datasheets = await client.getAccommodationDatasheets(hotelIds, "nl")

        console.log("🏨 Travel Compositor accommodation datasheets response:", {
          found: datasheets.accommodations?.length || 0,
          sample: datasheets.accommodations?.slice(0, 2).map((acc: any) => ({
            id: acc.id,
            name: acc.name,
            hasDescription: !!acc.description,
            hasImages: !!acc.images,
            hasFacilities: !!acc.facilities,
            hasGiataData: !!acc.giataId,
          })),
        })

        if (datasheets.accommodations) {
          analysis.realAccommodationDatasheets = datasheets.accommodations.map((acc: any) => ({
            id: acc.id,
            name: acc.name,
            description: acc.description || null, // REAL description or null
            images: acc.images || [], // REAL images or empty
            facilities: acc.facilities || [], // REAL facilities or empty
            themes: acc.themes || [], // REAL themes or empty
            giataId: acc.giataId || null, // REAL GIATA ID or null
            giataData: acc.giata || null, // REAL GIATA data or null
            address: acc.address || null,
            coordinates: acc.coordinates || null,
            category: acc.category || null,
            stars: acc.stars || null,
            provider: acc.provider || null,
            hasRealContent: !!(acc.description || acc.images?.length > 0 || acc.facilities?.length > 0),
          }))
        }
      } catch (error) {
        console.error("❌ Error getting REAL accommodation datasheets:", error)
      }
    }

    // Test individual REAL hotel details
    for (const hotel of hotelServices.slice(0, 3)) {
      try {
        const hotelId = hotel.hotelId || hotel.providerHotelId
        if (!hotelId) continue

        console.log(`🔍 Getting REAL individual hotel data: ${hotel.hotelName} (ID: ${hotelId})`)

        try {
          const hotelDatasheet = await client.getAccommodationDatasheet(hotelId, "nl")

          console.log(`✅ REAL hotel datasheet for ${hotel.hotelName}:`, {
            hasDescription: !!hotelDatasheet.description,
            hasImages: !!hotelDatasheet.images,
            imageCount: hotelDatasheet.images?.length || 0,
            hasFacilities: !!hotelDatasheet.facilities,
            facilityCount: hotelDatasheet.facilities?.length || 0,
            hasGiataData: !!hotelDatasheet.giataId,
          })

          analysis.realHotels.push({
            bookingHotel: {
              name: hotel.hotelName,
              location: hotel.locationName,
              hotelId: hotelId,
              category: hotel.category,
            },
            realDatasheet: {
              description: hotelDatasheet.description || null, // REAL or null
              images: hotelDatasheet.images || [], // REAL or empty
              facilities: hotelDatasheet.facilities || [], // REAL or empty
              themes: hotelDatasheet.themes || [], // REAL or empty
              giataId: hotelDatasheet.giataId || null, // REAL GIATA ID or null
              giataData: hotelDatasheet.giata || null, // REAL GIATA data or null
              address: hotelDatasheet.address || null,
              coordinates: hotelDatasheet.coordinates || null,
              category: hotelDatasheet.category || null,
              stars: hotelDatasheet.stars || null,
              hasRealContent: !!(
                hotelDatasheet.description ||
                hotelDatasheet.images?.length > 0 ||
                hotelDatasheet.facilities?.length > 0
              ),
            },
          })
        } catch (error) {
          console.log(`⚠️ Could not get REAL datasheet for hotel ${hotelId}:`, error.message)
          analysis.realHotels.push({
            bookingHotel: {
              name: hotel.hotelName,
              location: hotel.locationName,
              hotelId: hotelId,
              category: hotel.category,
            },
            realDatasheet: null,
            error: error.message,
          })
        }
      } catch (error) {
        console.error(`❌ Error testing REAL hotel ${hotel.hotelName}:`, error)
      }
    }

    // Test REAL content endpoints
    try {
      console.log("🔍 Getting REAL facilities from Travel Compositor...")
      const facilities = await client.getAllFacilities("nl")
      analysis.availableRealContent.facilities = {
        available: true,
        count: facilities.facilities?.length || 0,
        sample: facilities.facilities?.slice(0, 10) || [],
      }
      console.log("✅ REAL facilities found:", facilities.facilities?.length || 0)
    } catch (error) {
      analysis.availableRealContent.facilities = { available: false, error: error.message }
    }

    try {
      console.log("🔍 Getting REAL themes from Travel Compositor...")
      const themes = await client.getThemesByMicrosite(client.config.micrositeId)
      analysis.availableRealContent.themes = {
        available: true,
        count: themes.theme?.length || 0,
        sample: themes.theme?.slice(0, 10) || [],
      }
      console.log("✅ REAL themes found:", themes.theme?.length || 0)
    } catch (error) {
      analysis.availableRealContent.themes = { available: false, error: error.message }
    }

    console.log("✅ REAL content analysis complete")

    return Response.json({
      success: true,
      analysis,
      summary: {
        destinationsInBooking: uniqueDestinations.length,
        destinationsFoundInTC: analysis.realDestinations.filter((d) => d.travelCompositorData).length,
        destinationsWithRealContent: analysis.realDestinations.filter((d) => d.hasRealContent).length,
        hotelsAnalyzed: analysis.realHotels.length,
        hotelsWithRealDatasheets: analysis.realHotels.filter((h) => h.realDatasheet && h.realDatasheet.hasRealContent)
          .length,
        hotelsWithGiataData: analysis.realHotels.filter((h) => h.realDatasheet?.giataId).length,
        totalRealDestinationImages: analysis.realDestinations.reduce(
          (sum, d) => sum + (d.travelCompositorData?.images?.length || 0),
          0,
        ),
        totalRealHotelImages: analysis.realHotels.reduce((sum, h) => sum + (h.realDatasheet?.images?.length || 0), 0),
        realFacilitiesAvailable: analysis.availableRealContent.facilities?.count || 0,
        realThemesAvailable: analysis.availableRealContent.themes?.count || 0,
      },
      note: "🚨 ONLY REAL DATA FROM TRAVEL COMPOSITOR - NO GENERATED CONTENT",
    })
  } catch (error) {
    console.error("❌ REAL Content Analysis Error:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
