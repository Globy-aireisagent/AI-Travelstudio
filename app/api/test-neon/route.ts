import { type NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseAvailable } from "@/lib/neon-client"

export async function GET(request: NextRequest) {
  const result = {
    success: false,
    configured: false,
    connected: false,
    error: null as string | null,
    database_info: null as any,
    table_counts: null as any,
    sample_data: null as any,
    errors: {} as any,
  }

  try {
    // Check if database is configured
    result.configured = isDatabaseAvailable()

    if (!result.configured) {
      result.error = "DATABASE_URL environment variable not found"
      return NextResponse.json(result)
    }

    // Test basic connection
    try {
      const { rows: timeRows } = await sql`SELECT NOW() as current_time, version() as db_version`
      result.connected = true
      result.database_info = {
        current_time: timeRows[0]?.current_time,
        db_version: timeRows[0]?.db_version,
      }
    } catch (error) {
      result.error = `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`
      return NextResponse.json(result)
    }

    // Test table access and get counts
    const tableCounts = {
      users: 0,
      bookings: 0,
      travel_ideas: 0,
      feature_requests: 0,
    }

    const sampleData = {
      users: [],
      bookings: [],
    }

    // Test users table
    try {
      const { rows: userCountRows } = await sql`SELECT COUNT(*) as count FROM users`
      tableCounts.users = Number.parseInt(userCountRows[0]?.count || "0")

      const { rows: sampleUsers } = await sql`SELECT id, email, name, role, status FROM users LIMIT 3`
      sampleData.users = sampleUsers
    } catch (error) {
      result.errors.users = error instanceof Error ? error.message : "Unknown error"
    }

    // Test bookings table
    try {
      const { rows: bookingCountRows } = await sql`SELECT COUNT(*) as count FROM bookings`
      tableCounts.bookings = Number.parseInt(bookingCountRows[0]?.count || "0")

      const { rows: sampleBookings } =
        await sql`SELECT id, booking_reference, destination, status, total_price FROM bookings LIMIT 3`
      sampleData.bookings = sampleBookings
    } catch (error) {
      result.errors.bookings = error instanceof Error ? error.message : "Unknown error"
    }

    // Test travel_ideas table
    try {
      const { rows: ideasCountRows } = await sql`SELECT COUNT(*) as count FROM travel_ideas`
      tableCounts.travel_ideas = Number.parseInt(ideasCountRows[0]?.count || "0")
    } catch (error) {
      result.errors.ideas = error instanceof Error ? error.message : "Unknown error"
    }

    // Test feature_requests table
    try {
      const { rows: featuresCountRows } = await sql`SELECT COUNT(*) as count FROM feature_requests`
      tableCounts.feature_requests = Number.parseInt(featuresCountRows[0]?.count || "0")
    } catch (error) {
      result.errors.features = error instanceof Error ? error.message : "Unknown error"
    }

    result.table_counts = tableCounts
    result.sample_data = sampleData
    result.success = true

    return NextResponse.json(result)
  } catch (error) {
    result.error = `Test failed: ${error instanceof Error ? error.message : "Unknown error"}`
    return NextResponse.json(result)
  }
}
