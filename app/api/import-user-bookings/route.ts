import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase-client"
import { UniversalTravelImporter } from "@/lib/universal-travel-importer"

export async function POST(request: NextRequest) {
  try {
    console.log("📋 Starting user bookings import...")

    const { userId, userEmail, micrositeId, limit = 50 } = await request.json()

    if (!userId || !userEmail) {
      return NextResponse.json({ error: "User ID and email required" }, { status: 400 })
    }

    const supabase = getSupabaseServiceClient()
    const importer = new UniversalTravelImporter()

    // 1. Haal user op uit database
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log(`👤 Importing bookings for user: ${user.email}`)

    // 2. Haal bookings op uit Travel Compositor
    const microsites = micrositeId ? [micrositeId] : [user.microsite_id]
    let allBookings: any[] = []

    for (const msId of microsites) {
      if (!msId) continue

      try {
        const bookings = await importer.getUserBookings(msId, userEmail)
        allBookings.push(...bookings.map((b) => ({ ...b, microsite_id: msId })))
        console.log(`📋 Found ${bookings.length} bookings in microsite ${msId}`)
      } catch (error) {
        console.log(`⚠️ Failed to get bookings from microsite ${msId}:`, error)
        continue
      }
    }

    // 3. Limiteer aantal bookings
    if (allBookings.length > limit) {
      allBookings = allBookings.slice(0, limit)
      console.log(`⚠️ Limited to ${limit} bookings`)
    }

    // 4. Importeer bookings naar Supabase
    const importResults = []

    for (const booking of allBookings) {
      try {
        const result = await importBookingToDatabase(booking, user, supabase)
        importResults.push(result)
      } catch (error) {
        console.error(`❌ Failed to import booking ${booking.id}:`, error)
        importResults.push({
          success: false,
          bookingId: booking.id,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    const successful = importResults.filter((r) => r.success).length

    console.log(`✅ Booking import complete: ${successful}/${allBookings.length} imported`)

    return NextResponse.json({
      success: true,
      results: importResults,
      summary: {
        total: allBookings.length,
        successful,
        failed: allBookings.length - successful,
        userId,
        userEmail,
      },
    })
  } catch (error) {
    console.error("❌ Booking import failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

async function importBookingToDatabase(booking: any, user: any, supabase: any) {
  try {
    // Check of booking al bestaat
    const { data: existingBooking } = await supabase
      .from("bookings")
      .select("id")
      .eq("tc_booking_id", booking.id || booking.bookingId)
      .eq("microsite_id", booking.microsite_id)
      .single()

    if (existingBooking) {
      return {
        success: false,
        bookingId: booking.id,
        error: "Booking already exists",
      }
    }

    // Importeer booking
    const bookingData = {
      user_id: user.id,
      tc_booking_id: booking.id || booking.bookingId || booking.bookingReference,
      booking_reference: booking.bookingReference || booking.reference,
      microsite_id: booking.microsite_id,
      title: booking.title || booking.name || `Booking ${booking.id}`,
      destination: booking.destination || extractDestination(booking),
      start_date: booking.startDate || booking.departureDate,
      end_date: booking.endDate || booking.returnDate,
      status: booking.status || "confirmed",
      client_name: booking.client?.name || booking.clientName,
      client_email: booking.client?.email || booking.clientEmail,
      client_phone: booking.client?.phone || booking.clientPhone,
      total_price: extractPrice(booking),
      currency: booking.currency || "EUR",
      accommodations: booking.accommodations || booking.hotels || [],
      activities: booking.activities || booking.tickets || [],
      transports: booking.transports || [],
      vouchers: booking.vouchers || booking.transfers || [],
      original_data: booking,
    }

    const { error: insertError } = await supabase.from("bookings").insert(bookingData)

    if (insertError) {
      throw new Error(`Database insert failed: ${insertError.message}`)
    }

    return {
      success: true,
      bookingId: booking.id,
    }
  } catch (error) {
    return {
      success: false,
      bookingId: booking.id,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

function extractDestination(booking: any): string {
  if (booking.destination) return booking.destination
  if (booking.destinations && booking.destinations.length > 0) {
    return booking.destinations[0].name || booking.destinations[0]
  }
  if (booking.accommodations && booking.accommodations.length > 0) {
    return booking.accommodations[0].destination || booking.accommodations[0].city
  }
  return "Unknown Destination"
}

function extractPrice(booking: any): number {
  if (booking.totalPrice) {
    if (typeof booking.totalPrice === "number") return booking.totalPrice
    if (booking.totalPrice.amount) return booking.totalPrice.amount
  }
  if (booking.total_price) return booking.total_price
  if (booking.price) {
    if (typeof booking.price === "number") return booking.price
    if (booking.price.amount) return booking.price.amount
  }
  return 0
}
