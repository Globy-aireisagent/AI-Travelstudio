import { type NextRequest, NextResponse } from "next/server"
import { safeQuery, isDatabaseAvailable, type Booking } from "@/lib/neon-client"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 })
    }

    const query = "SELECT * FROM bookings WHERE id = $1"
    const { data: bookings, error } = await safeQuery<Booking>(query, [params.id])

    if (error) {
      console.error("Error fetching booking:", error)
      return NextResponse.json({ success: false, error: "Database error" }, { status: 500 })
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      booking: bookings[0],
    })
  } catch (error) {
    console.error("Error in booking API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 })
    }

    const body = await request.json()
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    // Build dynamic update query
    Object.entries(body).forEach(([key, value]) => {
      if (key !== "id") {
        updates.push(`${key} = $${paramIndex}`)
        values.push(typeof value === "object" ? JSON.stringify(value) : value)
        paramIndex++
      }
    })

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 })
    }

    updates.push(`updated_at = NOW()`)
    values.push(params.id)

    const query = `
      UPDATE bookings 
      SET ${updates.join(", ")} 
      WHERE id = $${paramIndex} 
      RETURNING *
    `

    const { data: bookings, error } = await safeQuery<Booking>(query, values)

    if (error) {
      console.error("Error updating booking:", error)
      return NextResponse.json({ success: false, error: "Failed to update booking" }, { status: 400 })
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      booking: bookings[0],
    })
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 })
    }

    const query = "DELETE FROM bookings WHERE id = $1 RETURNING id"
    const { data: result, error } = await safeQuery<{ id: string }>(query, [params.id])

    if (error) {
      console.error("Error deleting booking:", error)
      return NextResponse.json({ success: false, error: "Failed to delete booking" }, { status: 400 })
    }

    if (!result || result.length === 0) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting booking:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
