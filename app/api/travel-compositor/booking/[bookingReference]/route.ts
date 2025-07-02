import type { NextRequest } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: NextRequest, { params }: { params: { bookingReference: string } }) {
  try {
    const bookingId = params.bookingReference
    const searchParams = request.nextUrl.searchParams
    const configNumber = Number.parseInt(searchParams.get("config") || "1")
    const micrositeParam = searchParams.get("microsite") || "rondreis-planner"

    console.log(`🔍 BOOKING API DEBUG:`)
    console.log(`- Booking ID: ${bookingId}`)
    console.log(`- Config Number: ${configNumber}`)
    console.log(`- Microsite Param: ${micrositeParam}`)

    // Create client with specified config
    const client = createTravelCompositorClient(configNumber)
    console.log(`- Client Config: ${JSON.stringify(client.config)}`)

    // Try to get booking by reference first (most direct method)
    try {
      console.log(`🎯 Strategy 1: Direct booking by reference...`)
      const booking = await client.getBookingByReference(bookingId)

      if (booking) {
        console.log(`✅ Found booking via direct reference!`)
        return Response.json({
          success: true,
          booking: booking,
          method: "direct_reference",
          searchedId: bookingId,
          config: configNumber,
        })
      }
    } catch (error) {
      console.log(`⚠️ Direct reference failed:`, error)
    }

    // Try searching in all bookings
    try {
      console.log(`🎯 Strategy 2: Search in all bookings...`)
      const allBookings = await client.getAllBookings()
      console.log(`📋 Found ${allBookings.length} total bookings`)

      // Search with multiple ID variations
      const searchVariations = [
        bookingId,
        bookingId.replace(/^RRP-/i, ""),
        `RRP-${bookingId.replace(/^RRP-/i, "")}`,
        bookingId.toUpperCase(),
        bookingId.toLowerCase(),
      ]

      console.log(`🔍 Searching with variations:`, searchVariations)

      for (const variation of searchVariations) {
        const foundBooking = allBookings.find((b: any) => {
          const possibleIds = [b.id, b.bookingId, b.bookingReference, b.reference, b.tripId, b.reservationId].filter(
            Boolean,
          )

          return possibleIds.some((id) => {
            const match = String(id).toLowerCase() === variation.toLowerCase()
            if (match) {
              console.log(`✅ MATCH FOUND: ${id} === ${variation}`)
            }
            return match
          })
        })

        if (foundBooking) {
          console.log(`✅ Found booking with variation: ${variation}`)
          return Response.json({
            success: true,
            booking: foundBooking,
            method: "search_all_bookings",
            searchedId: bookingId,
            foundWithVariation: variation,
            config: configNumber,
          })
        }
      }

      console.log(`❌ No booking found with any variation`)

      // Debug: show first few booking IDs for comparison
      const sampleIds = allBookings.slice(0, 10).map((b: any) => ({
        id: b.id,
        bookingReference: b.bookingReference,
        reference: b.reference,
      }))
      console.log(`📋 Sample booking IDs for comparison:`, sampleIds)
    } catch (error) {
      console.log(`⚠️ Search in all bookings failed:`, error)
    }

    return Response.json({
      success: false,
      error: `Booking ${bookingId} not found`,
      searchedId: bookingId,
      config: configNumber,
      microsite: micrositeParam,
      message: "Tried direct reference and search in all bookings",
    })
  } catch (error) {
    console.error("❌ Booking API Error:", error)
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
