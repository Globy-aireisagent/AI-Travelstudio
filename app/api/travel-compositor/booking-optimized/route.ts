import { type NextRequest, NextResponse } from "next/server"
import { createFastTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function POST(request: NextRequest) {
  try {
    const { id, micrositeConfig = "1", optimized = true } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: "Booking ID is required" })
    }

    console.log(`🔍 Optimized booking search: ${id} (config: ${micrositeConfig})`)

    const client = createFastTravelCompositorClient(Number.parseInt(micrositeConfig))

    // Use the fastest search method based on our API knowledge
    let booking = null

    // Method 1: Direct booking reference lookup (fastest)
    try {
      booking = await client.getBookingByReference(id)
      console.log(`✅ Found via direct reference lookup`)
    } catch (error) {
      console.log(`⚪ Direct lookup failed, trying search method`)
    }

    // Method 2: Search through all bookings (fallback)
    if (!booking) {
      try {
        booking = await client.getBooking(id)
        console.log(`✅ Found via search method`)
      } catch (error) {
        console.log(`❌ Search method failed:`, error)
      }
    }

    if (!booking) {
      return NextResponse.json({
        success: false,
        error: `Booking ${id} niet gevonden in microsite ${micrositeConfig}`,
      })
    }

    // Cache the result
    const cacheKey = `booking-${id}`
    // In a real app, you'd use Redis or similar
    // For now, we'll rely on localStorage in the frontend

    return NextResponse.json({
      success: true,
      data: booking,
      metadata: {
        searchMethod: "optimized",
        micrositeConfig,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error("❌ Booking import error:", error)
    return NextResponse.json({
      success: false,
      error: error.message || "Er is een onverwachte fout opgetreden",
    })
  }
}
