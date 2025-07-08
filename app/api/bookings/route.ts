import { type NextRequest, NextResponse } from "next/server"
import { safeQuery, isDatabaseAvailable, type Booking } from "@/lib/neon-client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const userId = searchParams.get("userId")

    if (!isDatabaseAvailable()) {
      // Return demo data when database is not configured
      const demoBookings = [
        {
          id: "demo-1",
          booking_reference: "TC-2025-001",
          user_id: "demo-user",
          status: "active",
          destination: "Seoul, Zuid-Korea",
          start_date: "2025-03-15",
          end_date: "2025-03-25",
          total_price: 3450,
          currency: "EUR",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-05T00:00:00Z",
        },
        {
          id: "demo-2",
          booking_reference: "TC-2025-002",
          user_id: "demo-user",
          status: "completed",
          destination: "Tokyo, Japan",
          start_date: "2025-02-10",
          end_date: "2025-02-20",
          total_price: 2800,
          currency: "EUR",
          created_at: "2025-01-02T00:00:00Z",
          updated_at: "2025-01-04T00:00:00Z",
        },
      ]

      return NextResponse.json({
        success: true,
        bookings: demoBookings,
        total: demoBookings.length,
        page,
        limit,
        totalPages: 1,
      })
    }

    // Build query
    let whereClause = "WHERE 1=1"
    const params: any[] = []
    let paramIndex = 1

    if (status) {
      whereClause += ` AND status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    if (userId) {
      whereClause += ` AND user_id = $${paramIndex}`
      params.push(userId)
      paramIndex++
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM bookings ${whereClause}`
    const { data: countResult, error: countError } = await safeQuery<{ total: string }>(countQuery, params)

    if (countError) {
      console.error("Error counting bookings:", countError)
      return NextResponse.json({ success: false, error: "Failed to count bookings" }, { status: 500 })
    }

    const total = Number.parseInt(countResult?.[0]?.total || "0")

    // Get paginated results
    const offset = (page - 1) * limit
    const dataQuery = `
      SELECT * FROM bookings 
      ${whereClause} 
      ORDER BY created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    params.push(limit, offset)

    const { data: bookings, error } = await safeQuery<Booking>(dataQuery, params)

    if (error) {
      console.error("Error fetching bookings:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch bookings" }, { status: 500 })
    }

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      bookings: bookings || [],
      total,
      page,
      limit,
      totalPages,
    })
  } catch (error) {
    console.error("Error in bookings API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 })
    }

    const body = await request.json()
    const {
      booking_reference,
      user_id,
      agency_id,
      status = "pending",
      destination,
      microsite_source,
      start_date,
      end_date,
      total_price = 0,
      currency = "EUR",
      accommodations = [],
      activities = [],
      transports = [],
      vouchers = [],
      raw_data = {},
    } = body

    const query = `
      INSERT INTO bookings (
        booking_reference, user_id, agency_id, status, destination, 
        microsite_source, start_date, end_date, total_price, currency,
        accommodations, activities, transports, vouchers, raw_data
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      ) RETURNING *
    `

    const params = [
      booking_reference,
      user_id,
      agency_id,
      status,
      destination,
      microsite_source,
      start_date,
      end_date,
      total_price,
      currency,
      JSON.stringify(accommodations),
      JSON.stringify(activities),
      JSON.stringify(transports),
      JSON.stringify(vouchers),
      JSON.stringify(raw_data),
    ]

    const { data: bookings, error } = await safeQuery<Booking>(query, params)

    if (error) {
      console.error("Error creating booking:", error)
      return NextResponse.json({ success: false, error: "Failed to create booking" }, { status: 400 })
    }

    return NextResponse.json(
      {
        success: true,
        booking: bookings?.[0],
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
