import { NextResponse } from "next/server"
import { isDatabaseAvailable, safeQuery } from "@/lib/neon-client"

export async function GET() {
  try {
    // Check if database is configured
    if (!isDatabaseAvailable()) {
      return NextResponse.json({
        success: false,
        error: "Database not configured. Please set DATABASE_URL environment variable.",
        configured: false,
      })
    }

    // Test basic connection
    const connectionTest = await safeQuery("SELECT NOW() as current_time, version() as db_version")

    if (connectionTest.error) {
      return NextResponse.json({
        success: false,
        error: connectionTest.error,
        configured: true,
        connected: false,
      })
    }

    // Test table queries
    const usersTest = await safeQuery("SELECT COUNT(*) as count FROM users")
    const bookingsTest = await safeQuery("SELECT COUNT(*) as count FROM bookings")
    const ideasTest = await safeQuery("SELECT COUNT(*) as count FROM travel_ideas")
    const featuresTest = await safeQuery("SELECT COUNT(*) as count FROM feature_requests")

    // Get sample data
    const sampleUsers = await safeQuery("SELECT id, email, name, role, status FROM users LIMIT 3")
    const sampleBookings = await safeQuery(
      "SELECT id, booking_reference, destination, status, total_price FROM bookings LIMIT 3",
    )

    return NextResponse.json({
      success: true,
      configured: true,
      connected: true,
      database_info: connectionTest.data?.[0],
      table_counts: {
        users: usersTest.data?.[0]?.count || 0,
        bookings: bookingsTest.data?.[0]?.count || 0,
        travel_ideas: ideasTest.data?.[0]?.count || 0,
        feature_requests: featuresTest.data?.[0]?.count || 0,
      },
      sample_data: {
        users: sampleUsers.data || [],
        bookings: sampleBookings.data || [],
      },
      errors: {
        users: usersTest.error,
        bookings: bookingsTest.error,
        ideas: ideasTest.error,
        features: featuresTest.error,
      },
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      configured: isDatabaseAvailable(),
      connected: false,
    })
  }
}
