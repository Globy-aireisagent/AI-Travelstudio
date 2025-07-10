import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase-client"

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServiceClient()

  try {
    const { data, error } = await supabase.from("bookings").select("*").eq("id", params.id).single()

    if (error || !data) {
      console.error("❌ Supabase error:", error ?? "No booking")
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: data.id,
        bookingReference: data.booking_reference,
        title: data.title,
        client: {
          name: data.client_name,
          email: data.client_email,
          phone: data.client_phone,
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
  } catch (err) {
    console.error("❌ Error fetching booking:", err)
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 })
  }
}
