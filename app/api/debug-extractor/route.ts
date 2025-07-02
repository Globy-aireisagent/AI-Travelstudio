import { NextResponse } from "next/server"
import { createFastMultiMicrositeClient } from "@/lib/travel-compositor-client-fast"
import { extractBookingData } from "@/lib/booking-data-extractor"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get("bookingId") || "RRP-9263"

    console.log(`🧪 Debug extractor for booking: ${bookingId}`)

    // Get raw booking data
    const fastClient = createFastMultiMicrositeClient()
    const searchResult = await fastClient.searchBookingAcrossAllMicrosites(bookingId)

    if (!searchResult.booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Extract using your extractor
    const extractedBooking = extractBookingData(searchResult.booking)

    return NextResponse.json({
      success: true,
      bookingId,
      rawBookingKeys: Object.keys(searchResult.booking),
      extractedBooking: {
        id: extractedBooking.id,
        title: extractedBooking.title,
        client: extractedBooking.client,
        destinations: extractedBooking.destinations,
        totalPrice: extractedBooking.totalPrice,
        services: {
          hotels: extractedBooking.services.hotels.length,
          transports: extractedBooking.services.transports.length,
          tickets: extractedBooking.services.tickets.length,
          transfers: extractedBooking.services.transfers.length,
        },
        hotelDetails: extractedBooking.services.hotels.map((h) => ({
          name: h.name,
          location: h.location,
          nights: h.nights,
          checkIn: h.checkInDate,
          checkOut: h.checkOutDate,
          price: h.price,
        })),
        transportDetails: extractedBooking.services.transports.map((t) => ({
          type: t.type,
          route: t.displayName,
          departure: t.departureDate,
          price: t.price,
        })),
      },
      searchTime: searchResult.searchTime,
      foundInMicrosite: searchResult.foundInMicrosite,
    })
  } catch (error) {
    console.error("❌ Debug extractor error:", error)
    return NextResponse.json(
      {
        error: "Debug failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
