import { NextResponse } from "next/server"
import { createFastMultiMicrositeClient } from "@/lib/fast-multi-microsite-client"

export async function GET() {
  try {
    console.log("🧪 Testing booking import with RRP-9263...")

    const fastClient = createFastMultiMicrositeClient()
    const result = await fastClient.searchBookingAcrossAllMicrosites("RRP-9263")

    if (result.booking) {
      // Transform the booking data like the import would
      const transformedBooking = {
        id: result.booking.id || "RRP-9263",
        bookingReference: result.booking.bookingReference || result.booking.id || "RRP-9263",
        title: result.booking.title || result.booking.name || "Test Reis RRP-9263",
        client: {
          name: result.booking.client?.name || result.booking.clientName || "Test Klant",
          email: result.booking.client?.email || result.booking.clientEmail || "test@example.com",
          phone: result.booking.client?.phone || result.booking.clientPhone || "",
        },
        destination: result.booking.destination || "Test Bestemming",
        startDate: result.booking.startDate || result.booking.departureDate || "2025-07-01",
        endDate: result.booking.endDate || result.booking.returnDate || "2025-07-15",
        status: result.booking.status || "Confirmed",
        totalPrice: result.booking.totalPrice || result.booking.price || 2500,
        currency: result.booking.currency || "EUR",

        // Services
        accommodations: result.booking.accommodations || [],
        activities: result.booking.tickets || result.booking.activities || [],
        transports: result.booking.transports || [],
        vouchers: result.booking.vouchers || [],

        // Import metadata
        importedAt: new Date().toISOString(),
        importedFrom: "Travel Compositor",
        foundInMicrosite: result.foundInMicrosite,
        searchMethod: "fast-multi-microsite",
        originalBookingId: "RRP-9263",
      }

      return NextResponse.json({
        success: true,
        message: "✅ Booking import test successful!",
        booking: transformedBooking,
        searchResult: result,
        testData: {
          bookingId: "RRP-9263",
          foundIn: result.foundInMicrosite,
          searchTime: result.totalTime,
          readyForImport: true,
        },
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "❌ Test booking not found",
          searchResult: result,
        },
        { status: 404 },
      )
    }
  } catch (error) {
    console.error("❌ Test booking import error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
