import { type NextRequest, NextResponse } from "next/server"
import { createMultiMicrositeClient } from "@/lib/travel-compositor-client"

// Kopieer Travel Studio's werkende methode!
export async function POST(request: NextRequest) {
  try {
    const { action, booking_id, agency_id, service_id, debug } = await request.json()

    if (action !== "import" || !booking_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid parameters",
        },
        { status: 400 },
      )
    }

    console.log(`🔍 Travel Studio style import: ${booking_id}`)

    // Bepaal welke config te gebruiken op basis van service_id
    let configNumber = 1
    if (service_id) {
      // Map service_id naar onze configs
      if (service_id === "2") configNumber = 2
      if (service_id === "3") configNumber = 3
      if (service_id === "4") configNumber = 4
    }

    // Clean booking ID
    const cleanBookingId = booking_id.replace(/^RRP-?/i, "").trim()

    // Use multi-microsite search (onze werkende methode)
    const multiClient = createMultiMicrositeClient()
    const searchResult = await multiClient.searchBookingAcrossAllMicrosites(booking_id, 15000)

    if (!searchResult.booking) {
      return NextResponse.json({
        success: false,
        error: `Booking ${booking_id} niet gevonden in Travel Compositor`,
        data: {
          action: "import",
          booking_id,
          searched_microsites: searchResult.searchResults?.length || 0,
        },
      })
    }

    // Transform data (zoals Travel Studio doet)
    const transformedBooking = {
      id: searchResult.booking.id || cleanBookingId,
      title: searchResult.booking.title || `Reis ${booking_id}`,
      client: searchResult.booking.client || {},
      destination: searchResult.booking.destination || "Onbekende bestemming",
      startDate: searchResult.booking.startDate,
      endDate: searchResult.booking.endDate,
      accommodations: searchResult.booking.accommodations || [],
      activities: searchResult.booking.activities || [],
      transports: searchResult.booking.transports || [],

      // Metadata
      importedAt: new Date().toISOString(),
      foundInMicrosite: searchResult.foundInMicrosite,
      originalBookingId: booking_id,
    }

    // Sla op in onze database (zoals Travel Studio doet)
    // TODO: Implementeer database opslag

    // Return Travel Studio compatible response
    return NextResponse.json({
      success: true,
      text: `Booking ${booking_id} succesvol geïmporteerd!`,
      redirect_url: `/werkblad?booking=${transformedBooking.id}`,
      booking_data: transformedBooking, // ← VOEG DIT TOE
      data: {
        action: "import",
        booking: transformedBooking,
        found_in_microsite: searchResult.foundInMicrosite,
      },
    })
  } catch (error) {
    console.error("❌ Travel Studio style import error:", error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Import failed",
      data: {
        action: "import",
        timestamp: new Date().toISOString(),
      },
    })
  }
}
