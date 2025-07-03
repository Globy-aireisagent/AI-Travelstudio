import { type NextRequest, NextResponse } from "next/server"
import { RouteService } from "@/lib/route-service"
import { createMultiMicrositeClient } from "@/lib/travel-compositor-client"

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID required" }, { status: 400 })
    }

    // Haal booking data op
    const multiClient = createMultiMicrositeClient()
    const result = await multiClient.searchBookingAcrossAllMicrosites(bookingId)

    if (!result) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Genereer route
    const routes = await RouteService.generateRouteForBooking(result.booking)

    return NextResponse.json({
      success: true,
      bookingId,
      routes,
      totalDays: routes.length,
      totalDistance: routes.reduce((sum, route) => sum + route.totalDistance, 0),
      totalDuration: routes.reduce((sum, route) => sum + route.totalDuration, 0),
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Route generation error:", error)
    return NextResponse.json(
      {
        error: "Route generation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
