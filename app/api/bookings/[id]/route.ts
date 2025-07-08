import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookingId = params.id
    console.log(`🔍 Fetching booking: ${bookingId}`)

    const supabase = getSupabaseServiceClient()
    const { data, error } = await supabase.from("bookings").select("*").eq("id", bookingId).single()

    if (error) {
      console.error("❌ Supabase error:", error)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (!data) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    console.log(`✅ Booking found: ${data.id}`)

    return NextResponse.json({
      success: true,
      booking: {
        id: data.id,
        bookingReference: data.booking_reference,
        title: data.title || "Untitled Booking",
        client: {
          name: data.client_name || "Unknown Client",
          email: data.client_email || "",
          phone: data.client_phone || "",
        },
        destination: data.destination,
        startDate: data.start_date,
        endDate: data.end_date,
        status: data.status,
        totalPrice: data.total_price,
        currency: data.currency,
        accommodations: data.accommodations,
        activities: data.activities,
        transports: data.transports,
        vouchers: data.vouchers,
        webhookReceivedAt: data.webhook_received_at,
        micrositeSource: data.microsite_source,
      },
    })
  } catch (error) {
    console.error("❌ Error fetching booking:", error)
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 })
  }
}
