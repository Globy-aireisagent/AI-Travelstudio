import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const status = searchParams.get("status")
    const clientEmail = searchParams.get("client_email")

    console.log(`📋 Fetching bookings (limit: ${limit}, offset: ${offset})`)

    let query = supabase
      .from("bookings")
      .select("*")
      .order("webhook_received_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq("status", status)
    }

    if (clientEmail) {
      query = query.eq("client_email", clientEmail)
    }

    const { data, error, count } = await query

    if (error) {
      console.error("❌ Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
    }

    console.log(`✅ Found ${data?.length || 0} bookings`)

    return NextResponse.json({
      success: true,
      bookings:
        data?.map((booking) => ({
          id: booking.id,
          bookingReference: booking.booking_reference,
          title: booking.title,
          client: {
            name: booking.client_name,
            email: booking.client_email,
          },
          destination: booking.destination,
          startDate: booking.start_date,
          endDate: booking.end_date,
          status: booking.status,
          totalPrice: booking.total_price,
          currency: booking.currency,
          webhookReceivedAt: booking.webhook_received_at,
        })) || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
      },
    })
  } catch (error) {
    console.error("❌ Error fetching bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}
