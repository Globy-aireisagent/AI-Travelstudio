import type { NextRequest } from "next/server"
import { createTravelCompositorClient, createMultiMicrositeClient } from "@/lib/travel-compositor-client"

export async function GET(request: NextRequest, { params }: { params: { bookingReference: string } }) {
  try {
    const bookingId = params.bookingReference
    const searchParams = request.nextUrl.searchParams
    const configNumber = Number.parseInt(searchParams.get("config") || "1")
    const micrositeParam = searchParams.get("microsite") || "rondreis-planner"
    const searchAll = searchParams.get("searchAll") === "true"

    console.log(`🔍 MICROSITE SEARCH DEBUG:`)
    console.log(`- Booking ID: ${bookingId}`)
    console.log(`- Config Number: ${configNumber}`)
    console.log(`- Microsite Param: ${micrositeParam}`)
    console.log(`- Search All: ${searchAll}`)

    if (searchAll) {
      // Search across all microsites
      console.log(`🌐 Searching across ALL microsites...`)

      try {
        const multiClient = createMultiMicrositeClient()
        const result = await multiClient.searchBookingAcrossAllMicrosites(bookingId, 30000)

        console.log(`🎯 Multi-microsite search result:`, {
          found: !!result.booking,
          foundInMicrosite: result.foundInMicrosite,
          searchResults: result.searchResults,
        })

        if (result.booking) {
          return Response.json({
            success: true,
            booking: result.booking,
            foundInMicrosite: result.foundInMicrosite,
            searchResults: result.searchResults,
            method: "multi_microsite_search",
            searchedId: bookingId,
          })
        } else {
          return Response.json({
            success: false,
            error: `Booking ${bookingId} not found in any microsite`,
            searchResults: result.searchResults,
            searchedId: bookingId,
            method: "multi_microsite_search",
          })
        }
      } catch (error) {
        console.error("❌ Multi-microsite search failed:", error)
        return Response.json(
          {
            success: false,
            error: error instanceof Error ? error.message : "Multi-microsite search failed",
            searchedId: bookingId,
          },
          { status: 500 },
        )
      }
    } else {
      // Search in specific microsite
      console.log(`🎯 Searching in specific microsite: ${micrositeParam}`)

      const client = createTravelCompositorClient(configNumber)

      // Try multiple approaches for single microsite
      try {
        // Method 1: Direct booking reference
        console.log(`📋 Method 1: Direct booking reference...`)
        const booking = await client.getBookingByReference(bookingId)

        if (booking) {
          console.log(`✅ Found via direct reference!`)
          return Response.json({
            success: true,
            booking: booking,
            method: "direct_reference",
            microsite: micrositeParam,
            config: configNumber,
            searchedId: bookingId,
          })
        }
      } catch (error) {
        console.log(`⚠️ Direct reference failed:`, error)
      }

      // Method 2: Search in microsite bookings
      try {
        console.log(`📋 Method 2: Search in microsite bookings...`)
        const micrositeId = client.config.micrositeId
        const allBookings = await client.getAllBookingsFromMicrosite(micrositeId)

        console.log(`📊 Found ${allBookings.length} bookings in microsite ${micrositeId}`)

        // Search with variations
        const searchVariations = [bookingId, bookingId.replace(/^RRP-/i, ""), `RRP-${bookingId.replace(/^RRP-/i, "")}`]

        for (const variation of searchVariations) {
          const foundBooking = allBookings.find((b: any) => {
            const possibleIds = [b.id, b.bookingId, b.bookingReference, b.reference, b.tripId].filter(Boolean)

            return possibleIds.some((id) => String(id).toLowerCase() === variation.toLowerCase())
          })

          if (foundBooking) {
            console.log(`✅ Found booking with variation: ${variation}`)
            return Response.json({
              success: true,
              booking: foundBooking,
              method: "microsite_search",
              microsite: micrositeParam,
              config: configNumber,
              searchedId: bookingId,
              foundWithVariation: variation,
            })
          }
        }

        console.log(`❌ No booking found in microsite ${micrositeId}`)

        // Debug info
        const sampleIds = allBookings.slice(0, 5).map((b: any) => ({
          id: b.id,
          bookingReference: b.bookingReference,
        }))

        return Response.json({
          success: false,
          error: `Booking ${bookingId} not found in microsite ${micrositeParam}`,
          microsite: micrositeParam,
          config: configNumber,
          searchedId: bookingId,
          totalBookingsInMicrosite: allBookings.length,
          sampleBookingIds: sampleIds,
          method: "microsite_search",
        })
      } catch (error) {
        console.error(`❌ Microsite search failed:`, error)
        return Response.json(
          {
            success: false,
            error: error instanceof Error ? error.message : "Microsite search failed",
            microsite: micrositeParam,
            config: configNumber,
            searchedId: bookingId,
          },
          { status: 500 },
        )
      }
    }
  } catch (error) {
    console.error("❌ Microsite Search API Error:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        searchedId: params.bookingReference,
      },
      { status: 500 },
    )
  }
}
