import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get("id")

    if (!bookingId) {
      return NextResponse.json({
        success: false,
        message: "No booking ID provided",
        error: "Missing 'id' parameter",
      })
    }

    console.log(`🎫 Testing booking import for ID: ${bookingId}`)

    const client = createTravelCompositorClient(1)

    // Authenticate first
    await client.authenticate()
    console.log("✅ Authentication successful")

    // Try to get the booking using the client's getBooking method
    try {
      const booking = await client.getBooking(bookingId)

      if (booking) {
        console.log(`✅ Found booking: ${booking.id}`)
        return NextResponse.json({
          success: true,
          message: `Booking ${bookingId} found successfully`,
          data: {
            booking: {
              id: booking.id,
              bookingReference: booking.bookingReference,
              title: booking.title,
              clientName: booking.client?.name,
              clientEmail: booking.client?.email,
              status: booking.status,
              totalPrice: booking.totalPrice,
              startDate: booking.period?.startDate,
              endDate: booking.period?.endDate,
            },
            foundWith: "client.getBooking()",
          },
        })
      }
    } catch (error) {
      console.log(`❌ Error with client.getBooking():`, error)
    }

    // If client.getBooking() didn't work, try direct API calls
    console.log("🔍 Trying direct API calls...")

    // Try different ID formats and endpoints
    const idVariations = [
      bookingId,
      `RRP-${bookingId}`,
      `NRP-${bookingId}`,
      bookingId.replace(/^(RRP-|NRP-)/, ""), // Remove prefix if exists
    ]

    const endpointTemplates = [
      `/resources/booking/{bookingId}`,
      `/resources/booking/getBooking?microsite=${client.config.micrositeId}&bookingId={bookingId}`,
      `/resources/booking/getBookings?microsite=${client.config.micrositeId}&bookingReference={bookingId}`,
      `/resources/booking/${client.config.micrositeId}/{bookingId}`,
    ]

    let foundBooking = null
    let successfulEndpoint = null

    // Try each ID variation with each endpoint
    for (const idVariation of idVariations) {
      console.log(`🔍 Trying ID variation: ${idVariation}`)

      for (const template of endpointTemplates) {
        const endpoint = template.replace("{bookingId}", idVariation)

        console.log(`🌐 Testing endpoint: ${endpoint}`)

        try {
          const response = await client.makeAuthenticatedRequest(endpoint)

          console.log(`📡 Response status: ${response.status}`)

          if (response.ok) {
            const data = await response.json()
            console.log(`✅ Found booking at: ${endpoint}`)

            // Handle different response formats
            if (data.id || data.bookingReference) {
              foundBooking = data
            } else if (data.bookedTrip && Array.isArray(data.bookedTrip) && data.bookedTrip.length > 0) {
              foundBooking = data.bookedTrip[0]
            } else if (data.booking) {
              foundBooking = data.booking
            }

            if (foundBooking) {
              successfulEndpoint = endpoint
              break
            }
          } else if (response.status === 404) {
            console.log(`❌ Not found: ${endpoint}`)
          } else {
            console.log(`⚠️ Error ${response.status}: ${endpoint}`)
          }
        } catch (error) {
          console.log(`💥 Network error: ${endpoint}`, error)
        }

        // Small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 50))
      }

      if (foundBooking) break
    }

    if (foundBooking) {
      return NextResponse.json({
        success: true,
        message: `Booking ${bookingId} found successfully`,
        data: {
          booking: {
            id: foundBooking.id || foundBooking.bookingReference,
            bookingReference: foundBooking.bookingReference || foundBooking.id,
            title: foundBooking.title || foundBooking.name,
            clientName: foundBooking.client?.name || foundBooking.clientName,
            clientEmail: foundBooking.client?.email || foundBooking.clientEmail,
            status: foundBooking.status,
            totalPrice: foundBooking.totalPrice?.amount || foundBooking.totalPrice,
          },
          foundAt: successfulEndpoint,
          searchedVariations: idVariations,
        },
      })
    } else {
      return NextResponse.json({
        success: false,
        message: `Booking ${bookingId} not found in Newreisplan microsite`,
        error: "Booking not found after trying all endpoints and ID variations",
        data: {
          searchedVariations: idVariations,
          searchedEndpoints: endpointTemplates.length,
        },
      })
    }
  } catch (error) {
    console.error("💥 Booking test error:", error)

    return NextResponse.json({
      success: false,
      message: "Error testing booking import",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
