import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase-client"
import { UniversalTravelImporter } from "@/lib/universal-travel-importer"

export async function POST(request: NextRequest) {
  try {
    console.log("📋 Starting user bookings import...")

    const { userId, userEmail, micrositeId, importAll = false } = await request.json()

    if (!userId || !userEmail) {
      return NextResponse.json({ error: "User ID and email required" }, { status: 400 })
    }

    const supabase = getSupabaseServiceClient()
    const importer = new UniversalTravelImporter()

    // 1. Haal user op uit database
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError || !user) {
      throw new Error("User not found")
    }

    console.log(`👤 Importing bookings for user: ${user.email}`)

    // 2. Haal bookings op uit Travel Compositor
    const bookings = await fetchUserBookingsFromTC(user, importer)

    console.log(`📋 Found ${bookings.length} bookings for ${user.email}`)

    // 3. Importeer bookings naar Supabase
    const importResults = []

    for (const booking of bookings) {
      try {
        // Check of booking al bestaat
        const { data: existingBooking } = await supabase
          .from("imported_bookings")
          .select("id")
          .eq("tc_booking_id", booking.id)
          .eq("tc_microsite_id", user.microsite_id)
          .single()

        if (existingBooking) {
          console.log(`⏭️ Booking ${booking.id} already exists, skipping`)
          continue
        }

        // Importeer booking
        const bookingData = {
          user_id: user.id,
          tc_booking_id: booking.id,
          tc_microsite_id: user.microsite_id,
          booking_reference: booking.bookingReference || booking.id,
          title: booking.title || `Booking ${booking.id}`,
          destination: booking.destination,
          start_date: booking.startDate,
          end_date: booking.endDate,
          status: booking.status || "confirmed",
          total_price: booking.totalPrice?.amount || booking.totalPrice,
          currency: booking.currency || "EUR",
          client_name: booking.client?.name || booking.clientName,
          client_email: booking.client?.email || booking.clientEmail,
          client_phone: booking.client?.phone || booking.clientPhone,
          full_data: booking,
        }

        const { error: insertError } = await supabase.from("imported_bookings").insert(bookingData)

        if (insertError) {
          console.error(`❌ Failed to import booking ${booking.id}:`, insertError)
          importResults.push({
            success: false,
            bookingId: booking.id,
            error: insertError.message,
          })
        } else {
          console.log(`✅ Imported booking ${booking.id}`)
          importResults.push({
            success: true,
            bookingId: booking.id,
            title: bookingData.title,
          })
        }
      } catch (error) {
        console.error(`❌ Error importing booking ${booking.id}:`, error)
        importResults.push({
          success: false,
          bookingId: booking.id,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    const successful = importResults.filter((r) => r.success).length

    // 4. Log de import actie
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "bookings_import",
      resource_type: "booking",
      details: {
        total_found: bookings.length,
        imported: successful,
        failed: importResults.length - successful,
        microsite_id: user.microsite_id,
      },
    })

    console.log(`✅ Booking import complete: ${successful}/${bookings.length} imported`)

    return NextResponse.json({
      success: true,
      summary: {
        total_found: bookings.length,
        imported: successful,
        failed: importResults.length - successful,
        results: importResults,
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

async function fetchUserBookingsFromTC(user: any, importer: UniversalTravelImporter) {
  try {
    console.log(`🔍 Fetching bookings for ${user.email} from microsite ${user.microsite_id}`)

    // Gebruik de Travel Compositor client om bookings op te halen
    const bookings = await importer.getUserBookings(user.microsite_id, user.email)

    console.log(`📋 Found ${bookings.length} bookings for ${user.email}`)

    return bookings
  } catch (error) {
    console.error(`❌ Failed to fetch bookings for ${user.email}:`, error)
    return []
  }
}
