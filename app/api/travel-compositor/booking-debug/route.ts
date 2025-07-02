import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const bookingId = searchParams.get("id")

  if (!bookingId) {
    return NextResponse.json({ error: "Booking ID required" }, { status: 400 })
  }

  try {
    console.log(`🔍 DEBUG: Fetching booking ${bookingId}`)

    // Try multiple configs
    const configs = [1, 3] // Skip config 2 (known issues)
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

    // EXTENSIVE LOGGING OF RAW DATA
    console.log("=== COMPLETE RAW BOOKING DATA ===")
    console.log("🔍 Top-level keys:", Object.keys(foundData))
    console.log("📋 Full booking object:", JSON.stringify(foundData, null, 2))

    // Log specific sections
    if (foundData.hotelservice) {
      console.log("🏨 HOTEL SERVICES:")
      foundData.hotelservice.forEach((hotel: any, index: number) => {
        console.log(`Hotel ${index}:`, JSON.stringify(hotel, null, 2))
      })
    }

    if (foundData.contactPerson) {
      console.log("👤 CONTACT PERSON:", JSON.stringify(foundData.contactPerson, null, 2))
    }

    if (foundData.user) {
      console.log("👤 USER:", JSON.stringify(foundData.user, null, 2))
    }

    if (foundData.pricebreakdown) {
      console.log("💰 PRICE BREAKDOWN:", JSON.stringify(foundData.pricebreakdown, null, 2))
    }

    return NextResponse.json({
      success: true,
      booking: foundData,
      foundInConfig,
      debug: {
        topLevelKeys: Object.keys(foundData),
        hasHotelService: !!foundData.hotelservice,
        hotelCount: foundData.hotelservice?.length || 0,
        hasContactPerson: !!foundData.contactPerson,
        hasUser: !!foundData.user,
        hasPriceBreakdown: !!foundData.pricebreakdown,
        bookingId: foundData.id,
        bookingReference: foundData.bookingReference,
      },
    })
  } catch (error) {
    console.error("❌ Debug API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
