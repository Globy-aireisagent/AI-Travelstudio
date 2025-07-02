import { type NextRequest, NextResponse } from "next/server"
import { createFastMultiMicrositeClient } from "@/lib/travel-compositor-client-fast"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get("bookingId") || "RRP-9263"

    console.log(`🔍 Debug booking data for: ${bookingId}`)

    // Use the fast multi-microsite client
    const fastClient = createFastMultiMicrositeClient()
    const searchResult = await fastClient.searchBookingAcrossAllMicrosites(bookingId)

    if (!searchResult.booking) {
      return NextResponse.json({
        error: `Booking ${bookingId} not found`,
        searchResults: searchResult.searchResults,
      })
    }

    // Show raw booking data
    console.log("📋 Raw booking data:", JSON.stringify(searchResult.booking, null, 2))

    // Transform the booking data (same as import API)
    const cleanBookingId = bookingId.replace(/^RRP-?/i, "").trim()

    const transformedBooking = {
      id: searchResult.booking.id || cleanBookingId,
      bookingReference: searchResult.booking.bookingReference || searchResult.booking.id || cleanBookingId,
      title: searchResult.booking.title || searchResult.booking.name || `Reis ${bookingId}`,
      client: {
        name: searchResult.booking.client?.name || searchResult.booking.clientName || "Onbekende klant",
        email: searchResult.booking.client?.email || searchResult.booking.clientEmail || "",
        phone: searchResult.booking.client?.phone || searchResult.booking.clientPhone || "",
      },
      destination: searchResult.booking.destination || searchResult.booking.location || "Onbekende bestemming",
      startDate: searchResult.booking.startDate || searchResult.booking.departureDate,
      endDate: searchResult.booking.endDate || searchResult.booking.returnDate,
      status: searchResult.booking.status || "Confirmed",
      totalPrice: searchResult.booking.totalPrice || searchResult.booking.price,
      currency: searchResult.booking.currency || "EUR",

      // Services - check multiple possible field names
      accommodations: searchResult.booking.accommodations || searchResult.booking.hotels || [],
      activities:
        searchResult.booking.tickets || searchResult.booking.activities || searchResult.booking.excursions || [],
      transports: searchResult.booking.transports || searchResult.booking.flights || [],
      vouchers: searchResult.booking.vouchers || searchResult.booking.documents || [],

      // Import metadata
      importedAt: new Date().toISOString(),
      importedFrom: "Travel Compositor",
      foundInMicrosite: searchResult.foundInMicrosite,
      searchMethod: "fast-multi-microsite",
      originalBookingId: bookingId,
      cleanedBookingId: cleanBookingId,
    }

    return NextResponse.json({
      success: true,
      rawBooking: searchResult.booking,
      transformedBooking: transformedBooking,
      fieldMapping: {
        title: {
          found: searchResult.booking.title || searchResult.booking.name,
          used: transformedBooking.title,
        },
        destination: {
          found: searchResult.booking.destination || searchResult.booking.location,
          used: transformedBooking.destination,
        },
        client: {
          found: searchResult.booking.client || searchResult.booking.clientName,
          used: transformedBooking.client,
        },
        accommodations: {
          found: searchResult.booking.accommodations || searchResult.booking.hotels,
          count: transformedBooking.accommodations.length,
        },
        activities: {
          found: searchResult.booking.tickets || searchResult.booking.activities || searchResult.booking.excursions,
          count: transformedBooking.activities.length,
        },
      },
      searchTime: searchResult.searchTime,
      foundInMicrosite: searchResult.foundInMicrosite,
    })
  } catch (error) {
    console.error("❌ Debug booking error:", error)
    return NextResponse.json(
      {
        error: "Failed to debug booking data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
