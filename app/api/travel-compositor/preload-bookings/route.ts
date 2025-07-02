import { createTravelCompositorClient } from "@/lib/travel-compositor-client"
import { bookingFastCache } from "@/lib/booking-fast-cache"

export async function POST() {
  try {
    console.log(`🔄 PRELOADING BOOKINGS FOR FAST ACCESS`)

    const startTime = Date.now()
    const client = createTravelCompositorClient(1)

    // Fetch all bookings once and cache them
    console.log(`📋 Fetching all bookings...`)
    const allBookings = await client.getAllBookings({ limit: 1000 })

    // Cache all bookings
    bookingFastCache.setAllBookings(allBookings, 30 * 60 * 1000) // 30 minutes TTL

    const endTime = Date.now()
    const stats = bookingFastCache.getStats()

    console.log(`✅ Preloaded ${allBookings.length} bookings in ${endTime - startTime}ms`)

    return Response.json({
      success: true,
      message: "Bookings preloaded successfully",
      bookingsCount: allBookings.length,
      loadTime: `${endTime - startTime}ms`,
      cacheStats: stats,
    })
  } catch (error) {
    console.error("❌ Preload bookings error:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
