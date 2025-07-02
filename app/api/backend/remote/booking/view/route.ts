import { type NextRequest, NextResponse } from "next/server"
import { createMultiMicrositeClient } from "@/lib/travel-compositor-client"

// Travel Studio's view endpoint
export async function POST(request: NextRequest) {
  try {
    const { action, booking_id, agency_id, service_id } = await request.json()

    if (action !== "view" || !booking_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid parameters",
        },
        { status: 400 },
      )
    }

    // Get booking data
    const multiClient = createMultiMicrositeClient()
    const searchResult = await multiClient.searchBookingAcrossAllMicrosites(booking_id, 10000)

    if (!searchResult.booking) {
      return NextResponse.json({
        success: false,
        error: `Booking ${booking_id} niet gevonden`,
      })
    }

    // Generate HTML preview (zoals Travel Studio)
    const booking = searchResult.booking
    const previewHtml = `
      <div class="booking-preview">
        <h3>${booking.title || `Booking ${booking_id}`}</h3>
        <p><strong>Client:</strong> ${booking.client?.name || "Onbekend"}</p>
        <p><strong>Destination:</strong> ${booking.destination || "Onbekend"}</p>
        <p><strong>Dates:</strong> ${booking.startDate || "TBD"} - ${booking.endDate || "TBD"}</p>
        <p><strong>Found in:</strong> ${searchResult.foundInMicrosite}</p>
        
        <div class="booking-services">
          <h4>Services:</h4>
          <ul>
            <li>Accommodations: ${booking.accommodations?.length || 0}</li>
            <li>Activities: ${booking.activities?.length || 0}</li>
            <li>Transports: ${booking.transports?.length || 0}</li>
          </ul>
        </div>
        
        <div class="booking-actions">
          <button id="backend-remote-booking-view__button-close">Close</button>
          <button id="backend-remote-booking-view__button-import">Import</button>
        </div>
      </div>
    `

    return NextResponse.json({
      success: true,
      html: previewHtml,
      data: {
        action: "view",
        booking: booking,
        found_in_microsite: searchResult.foundInMicrosite,
      },
    })
  } catch (error) {
    console.error("❌ Booking view error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "View failed",
    })
  }
}
