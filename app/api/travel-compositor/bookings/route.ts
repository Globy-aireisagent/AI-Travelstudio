import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const configNumber = Number.parseInt(searchParams.get("config") || "1")
    const includeAll = searchParams.get("includeAll") === "true"
    const requestedLimit = Number.parseInt(searchParams.get("limit") || "1000")

    console.log(`📋 Fetching bookings (config: ${configNumber}, includeAll: ${includeAll})`)

    const client = createTravelCompositorClient(configNumber)

    if (includeAll) {
      console.log("🔄 Fetching ALL bookings from proven date ranges...")

      // Gebruik de bewezen werkende date ranges
      const allBookings = await client.getAllBookings({
        includeAll: true,
        limit: requestedLimit,
      })

      console.log(`✅ Final result: ${allBookings.length} bookings`)

      // Groepeer per jaar voor overzicht
      const bookingsByYear = allBookings.reduce((acc, booking) => {
        const year = booking.creationDate ? new Date(booking.creationDate).getFullYear() : "unknown"
        if (!acc[year]) acc[year] = []
        acc[year].push(booking)
        return acc
      }, {})

      return NextResponse.json({
        success: true,
        bookings: allBookings,
        count: allBookings.length,
        configNumber,
        strategy: "multi-year-date-ranges",
        breakdown: Object.keys(bookingsByYear).map((year) => ({
          year,
          count: bookingsByYear[year].length,
          idRange: {
            first: bookingsByYear[year][0]?.id,
            last: bookingsByYear[year][bookingsByYear[year].length - 1]?.id,
          },
        })),
        idRange: {
          first: allBookings[0]?.id,
          last: allBookings[allBookings.length - 1]?.id,
        },
      })
    } else {
      // Normale fetch (beperkt tot 2025-2026 data)
      const bookings = await client.getAllBookings({
        includeAll: false,
        limit: requestedLimit,
        fromDate: "20250101",
        toDate: "20261231",
      })

      return NextResponse.json({
        success: true,
        bookings,
        count: bookings.length,
        configNumber,
        note: "Limited to 2025-2026 data - use includeAll=true for all years",
      })
    }
  } catch (error) {
    console.error("❌ Error fetching bookings:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
