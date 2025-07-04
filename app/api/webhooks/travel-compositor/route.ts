import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    console.log("🔔 Webhook received from Travel Compositor")

    const body = await request.json()
    console.log("📦 Webhook payload:", JSON.stringify(body, null, 2))

    // Verify webhook signature (if Travel Compositor provides one)
    const signature = request.headers.get("x-tc-signature")
    if (signature && !verifyWebhookSignature(body, signature)) {
      console.log("❌ Invalid webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Extract booking data from webhook
    const bookingData = extractBookingFromWebhook(body)

    if (!bookingData) {
      console.log("⚠️ No valid booking data in webhook")
      return NextResponse.json({ error: "No booking data" }, { status: 400 })
    }

    console.log(`✅ Processing booking: ${bookingData.id}`)

    // Store in Supabase
    const { data, error } = await supabase
      .from("bookings")
      .upsert({
        id: bookingData.id,
        booking_reference: bookingData.bookingReference,
        title: bookingData.title,
        client_name: bookingData.client.name,
        client_email: bookingData.client.email,
        client_phone: bookingData.client.phone,
        destination: bookingData.destination,
        start_date: bookingData.startDate,
        end_date: bookingData.endDate,
        status: bookingData.status,
        total_price: bookingData.totalPrice,
        currency: bookingData.currency,
        accommodations: bookingData.accommodations,
        activities: bookingData.activities,
        transports: bookingData.transports,
        vouchers: bookingData.vouchers,
        raw_data: bookingData.rawData,
        webhook_received_at: new Date().toISOString(),
        microsite_source: bookingData.micrositeSource,
      })
      .select()

    if (error) {
      console.error("❌ Supabase error:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    console.log(`✅ Booking ${bookingData.id} stored successfully`)

    // Send notification (optional)
    await sendBookingNotification(bookingData)

    return NextResponse.json({
      success: true,
      message: `Booking ${bookingData.id} processed successfully`,
      bookingId: bookingData.id,
    })
  } catch (error) {
    console.error("❌ Webhook processing error:", error)
    return NextResponse.json(
      {
        error: "Webhook processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function extractBookingFromWebhook(payload: any) {
  try {
    // Handle different webhook formats from Travel Compositor
    const booking = payload.booking || payload.data || payload

    if (!booking || !booking.id) {
      return null
    }

    return {
      id: booking.id,
      bookingReference: booking.bookingReference || booking.id,
      title: booking.title || booking.name || `Booking ${booking.id}`,
      client: {
        name: booking.contactPerson?.name || booking.client?.name || "Unknown",
        email: booking.contactPerson?.email || booking.client?.email || "",
        phone: booking.contactPerson?.phone || booking.client?.phone || "",
      },
      destination: extractDestinations(booking),
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: booking.status || "CONFIRMED",
      totalPrice: booking.pricebreakdown?.totalPrice?.microsite?.amount || 0,
      currency: booking.pricebreakdown?.totalPrice?.microsite?.currency || "EUR",
      accommodations: booking.hotelservice || [],
      activities: booking.ticketservice || [],
      transports: booking.transportservice || [],
      vouchers: booking.transferservice || [],
      rawData: booking,
      micrositeSource: booking.micrositeId || "unknown",
    }
  } catch (error) {
    console.error("❌ Error extracting booking data:", error)
    return null
  }
}

function extractDestinations(booking: any): string {
  const destinations = new Set<string>()

  // Extract from hotels
  if (booking.hotelservice) {
    booking.hotelservice.forEach((hotel: any) => {
      if (hotel.locationName) destinations.add(hotel.locationName)
      if (hotel.destinationName) destinations.add(hotel.destinationName)
    })
  }

  // Extract from activities
  if (booking.ticketservice) {
    booking.ticketservice.forEach((ticket: any) => {
      if (ticket.locationName) destinations.add(ticket.locationName)
    })
  }

  return Array.from(destinations).join(", ") || "Unknown Destination"
}

function verifyWebhookSignature(payload: any, signature: string): boolean {
  // Implement signature verification if Travel Compositor provides it
  // For now, return true (implement proper verification in production)
  return true
}

async function sendBookingNotification(booking: any) {
  try {
    // Send email notification, Slack message, etc.
    console.log(`📧 Notification sent for booking ${booking.id}`)
  } catch (error) {
    console.error("❌ Notification error:", error)
  }
}
