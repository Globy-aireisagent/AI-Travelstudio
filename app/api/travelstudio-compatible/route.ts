import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get("bookingId") || "RRP-9263"

    console.log(`🎯 TravelStudio-compatible search for: ${bookingId}`)

    // Try to mimic TravelStudio's approach
    const client = createTravelCompositorClient(1)
    await client.authenticate()

    // Strategy 1: Direct booking reference (like TravelStudio does)
    console.log(`📋 Strategy 1: Direct booking reference lookup`)
    try {
      const booking = await client.getBookingByReference(bookingId.replace(/^RRP-?/i, ""))

      if (booking) {
        console.log(`✅ Found booking via direct reference!`)
        return NextResponse.json({
          success: true,
          method: "direct-reference",
          booking: booking,
          searchTime: "< 1 second",
          message: "Found using TravelStudio-compatible direct lookup",
        })
      }
    } catch (error) {
      console.log(`⚠️ Direct reference failed:`, error.message)
    }

    // Strategy 2: Try with different ID formats
    const idVariations = [
      bookingId,
      bookingId.replace(/^RRP-?/i, ""),
      `RRP-${bookingId.replace(/^RRP-?/i, "")}`,
      bookingId.padStart(8, "0"), // 00009263 format like in TravelStudio
      `RRP-${bookingId.replace(/^RRP-?/i, "").padStart(8, "0")}`,
    ]

    console.log(`🔍 Strategy 2: Trying ID variations:`, idVariations)

    for (const variation of idVariations) {
      try {
        const booking = await client.getBookingByReference(variation)
        if (booking) {
          console.log(`✅ Found booking with variation: ${variation}`)
          return NextResponse.json({
            success: true,
            method: "id-variation",
            variation: variation,
            originalId: bookingId,
            booking: booking,
            message: `Found using ID variation: ${variation}`,
          })
        }
      } catch (error) {
        console.log(`⚠️ Variation ${variation} failed:`, error.message)
      }
    }

    // Strategy 3: Search in recent bookings (optimized)
    console.log(`📋 Strategy 3: Recent bookings search`)
    try {
      const recentBookings = await client.getAllBookingsFromMicrosite(client.config.micrositeId)

      // Sort by creation date (newest first) like TravelStudio
      const sortedBookings = recentBookings.sort((a, b) => {
        const dateA = new Date(a.creationDate || a.created || 0).getTime()
        const dateB = new Date(b.creationDate || b.created || 0).getTime()
        return dateB - dateA
      })

      console.log(`📊 Searching through ${sortedBookings.length} recent bookings`)

      // Search through recent bookings first (more likely to find recent bookings)
      for (const booking of sortedBookings.slice(0, 100)) {
        // Check first 100 recent bookings
        const possibleIds = [
          booking.id,
          booking.bookingReference,
          booking.reference,
          booking.customBookingReference,
        ].filter(Boolean)

        for (const id of possibleIds) {
          if (
            String(id).toLowerCase().includes(bookingId.toLowerCase()) ||
            bookingId.toLowerCase().includes(String(id).toLowerCase())
          ) {
            console.log(`✅ Found booking in recent search: ${id}`)
            return NextResponse.json({
              success: true,
              method: "recent-search",
              foundId: id,
              searchedId: bookingId,
              booking: booking,
              message: `Found in recent bookings with ID: ${id}`,
            })
          }
        }
      }
    } catch (error) {
      console.log(`⚠️ Recent bookings search failed:`, error.message)
    }

    return NextResponse.json(
      {
        success: false,
        error: `Booking ${bookingId} not found with TravelStudio-compatible methods`,
        searchedId: bookingId,
        testedVariations: idVariations,
        message: "All TravelStudio-compatible search strategies failed",
      },
      { status: 404 },
    )
  } catch (error) {
    console.error("❌ TravelStudio-compatible search error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
