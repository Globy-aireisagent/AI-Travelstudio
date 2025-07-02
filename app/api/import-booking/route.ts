import { type NextRequest, NextResponse } from "next/server"
import { createMultiMicrositeClient } from "@/lib/travel-compositor-client"

export async function POST(request: NextRequest) {
  try {
    const { bookingId, micrositeId } = await request.json()

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is verplicht" }, { status: 400 })
    }

    console.log(`🔍 Starting import for booking ${bookingId}`)

    // Clean booking ID (remove RRP- prefix if present)
    const cleanBookingId = bookingId.replace(/^RRP-?/i, "").trim()

    // Use our existing working multi-microsite client
    const multiClient = createMultiMicrositeClient()
    const searchResult = await multiClient.searchBookingAcrossAllMicrosites(bookingId, 15000) // 15 second timeout

    if (!searchResult.booking) {
      return NextResponse.json(
        {
          error: `Booking ${bookingId} niet gevonden`,
          details: `Gezocht in alle beschikbare microsites. Controleer of het booking ID correct is.`,
          searchResults: searchResult.searchResults,
        },
        { status: 404 },
      )
    }

    // Transform the data for our system
    const transformedBooking = {
      id: searchResult.booking.id || cleanBookingId,
      bookingReference: searchResult.booking.bookingReference || searchResult.booking.id || cleanBookingId,
      title: searchResult.booking.title || searchResult.booking.name || `Reis ${bookingId}`,
      client: {
        name: searchResult.booking.client?.name || searchResult.booking.clientName || "Onbekende klant",
        email: searchResult.booking.client?.email || searchResult.booking.clientEmail || "",
        phone: searchResult.booking.client?.phone || searchResult.booking.clientPhone || "",
      },
      destination: searchResult.booking.destination || "Onbekende bestemming",
      startDate: searchResult.booking.startDate || searchResult.booking.departureDate,
      endDate: searchResult.booking.endDate || searchResult.booking.returnDate,
      status: searchResult.booking.status || "Confirmed",
      totalPrice: searchResult.booking.totalPrice || searchResult.booking.price,
      currency: searchResult.booking.currency || "EUR",

      // Services
      accommodations: searchResult.booking.accommodations || [],
      activities: searchResult.booking.tickets || searchResult.booking.activities || [],
      transports: searchResult.booking.transports || [],
      vouchers: searchResult.booking.vouchers || [],

      // Import metadata
      importedAt: new Date().toISOString(),
      importedFrom: "Travel Compositor",
      foundInMicrosite: searchResult.foundInMicrosite,
      searchMethod: "multi-microsite-optimized",
      originalBookingId: bookingId,
      cleanedBookingId: cleanBookingId,
    }

    console.log(`✅ Successfully imported booking ${bookingId} from ${searchResult.foundInMicrosite}`)

    return NextResponse.json({
      success: true,
      booking: transformedBooking,
      message: `Booking ${bookingId} succesvol geïmporteerd uit Travel Compositor`,
      foundInMicrosite: searchResult.foundInMicrosite,
      stats: {
        accommodations: transformedBooking.accommodations.length,
        activities: transformedBooking.activities.length,
        transports: transformedBooking.transports.length,
        vouchers: transformedBooking.vouchers.length,
      },
    })
  } catch (error) {
    console.error("❌ Import booking error:", error)

    return NextResponse.json(
      {
        error: "Er is een fout opgetreden bij het importeren van de booking",
        details: error instanceof Error ? error.message : "Onbekende fout",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
