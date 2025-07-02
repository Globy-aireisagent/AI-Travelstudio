import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET() {
  try {
    console.log(`🔍 SIMPLE BOOKING DEBUG TEST`)

    // Test with config 1 (rondreis-planner)
    const client = createTravelCompositorClient(1)

    console.log(`📋 Client config:`, {
      username: client.config.username,
      micrositeId: client.config.micrositeId,
      baseUrl: client.config.baseUrl,
    })

    // Test authentication
    console.log(`🔐 Testing authentication...`)
    await client.authenticate()
    console.log(`✅ Authentication successful`)

    // Get all bookings to see what's available
    console.log(`📊 Getting all bookings...`)
    const allBookings = await client.getAllBookings()
    console.log(`📋 Found ${allBookings.length} total bookings`)

    // Look for RRP-9263 specifically
    const targetBooking = allBookings.find((b: any) => {
      const possibleIds = [b.id, b.bookingReference, b.reference].filter(Boolean)
      return possibleIds.some(
        (id) => String(id).toLowerCase().includes("9263") || String(id).toLowerCase().includes("rrp-9263"),
      )
    })

    if (targetBooking) {
      console.log(`✅ FOUND RRP-9263!`, {
        id: targetBooking.id,
        bookingReference: targetBooking.bookingReference,
        reference: targetBooking.reference,
      })
    } else {
      console.log(`❌ RRP-9263 not found`)

      // Show first 10 booking IDs for debugging
      const sampleBookings = allBookings.slice(0, 10).map((b: any) => ({
        id: b.id,
        bookingReference: b.bookingReference,
        reference: b.reference,
        status: b.status,
      }))
      console.log(`📋 Sample bookings:`, sampleBookings)
    }

    // Try direct booking reference call
    try {
      console.log(`🎯 Testing direct booking reference call...`)
      const directBooking = await client.getBookingByReference("RRP-9263")
      console.log(`✅ Direct booking call successful:`, {
        id: directBooking.id,
        bookingReference: directBooking.bookingReference,
      })
    } catch (error) {
      console.log(`❌ Direct booking call failed:`, error)
    }

    return Response.json({
      success: true,
      totalBookings: allBookings.length,
      foundRRP9263: !!targetBooking,
      targetBooking: targetBooking || null,
      clientConfig: {
        username: client.config.username,
        micrositeId: client.config.micrositeId,
      },
      sampleBookings: allBookings.slice(0, 5).map((b: any) => ({
        id: b.id,
        bookingReference: b.bookingReference,
        reference: b.reference,
      })),
    })
  } catch (error) {
    console.error("❌ Debug test failed:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
