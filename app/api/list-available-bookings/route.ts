import { NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    console.log(`📋 Listing available bookings (limit: ${limit})`)

    // Use the working client
    const client = createTravelCompositorClient(1)

    // Get recent bookings from 2025-2026
    const allBookings = await client.getAllBookings({
      limit: limit,
      fromDate: "20250101",
      toDate: "20261231",
    })

    // Sort by ID to get most recent
    const sortedBookings = allBookings
      .sort((a, b) => {
        const aNum = Number.parseInt(a.id?.replace(/\D/g, "") || "0")
        const bNum = Number.parseInt(b.id?.replace(/\D/g, "") || "0")
        return bNum - aNum // Descending order (newest first)
      })
      .slice(0, limit)

    const bookingList = sortedBookings.map((booking) => ({
      id: booking.id,
      bookingReference: booking.bookingReference || booking.reference,
      title: booking.title || booking.name,
      status: booking.status,
      startDate: booking.startDate,
      endDate: booking.endDate,
      client: booking.client?.name || "Unknown",
      destination: booking.destination,
    }))

    return NextResponse.json({
      success: true,
      totalFound: allBookings.length,
      showing: bookingList.length,
      bookings: bookingList,
      searchInfo: {
        dateRange: "2025-2026",
        microsite: "Primary",
      },
    })
  } catch (error) {
    console.error("❌ List bookings error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
