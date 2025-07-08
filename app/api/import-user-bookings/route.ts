import { type NextRequest, NextResponse } from "next/server"
import { getSqlClient, isDatabaseAvailable } from "@/lib/neon-client"
import { UniversalTravelImporter } from "@/lib/universal-travel-importer"

export async function POST(request: NextRequest) {
  try {
    console.log("📋 Starting user bookings import...")

    // Check if database is available
    if (!isDatabaseAvailable) {
      return NextResponse.json(
        {
          error: "Database not configured - check DATABASE_URL environment variable",
          demo: true,
        },
        { status: 500 },
      )
    }

    const { userId, userEmail, micrositeId, limit = 50 } = await request.json()

    if (!userId || !userEmail) {
      return NextResponse.json({ error: "User ID and email required" }, { status: 400 })
    }

    const sql = getSqlClient()
    const importer = new UniversalTravelImporter()

    // 1. Haal user op uit database
    const users = await sql`SELECT * FROM users WHERE id = ${userId}`
    const user = users[0]

    if (!user) {
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

    // 4. Importeer bookings naar database
    const importResults = []

    for (const booking of allBookings) {
      try {
        const result = await importBookingToDatabase(booking, user, sql)
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

async function importBookingToDatabase(booking: any, user: any, sql: any) {
  try {
    // Check of booking al bestaat
    const existingBookings = await sql`
      SELECT id FROM bookings 
      WHERE tc_booking_id = ${booking.id || booking.bookingId}
      AND microsite_id = ${booking.microsite_id}
    `

    if (existingBookings.length > 0) {
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
      accommodations: JSON.stringify(booking.accommodations || booking.hotels || []),
      activities: JSON.stringify(booking.activities || booking.tickets || []),
      transports: JSON.stringify(booking.transports || []),
      vouchers: JSON.stringify(booking.vouchers || booking.transfers || []),
      original_data: JSON.stringify(booking),
    }

    await sql`
      INSERT INTO bookings ${sql(bookingData)}
    `

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
