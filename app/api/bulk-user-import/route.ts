import { type NextRequest, NextResponse } from "next/server"
import { UserBookingSyncService } from "@/lib/user-booking-sync"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting bulk user import from Travel Compositor...")

    // Start de sync service
    UserBookingSyncService.startRealTimeSync()

    // Wacht even voor initial sync
    await new Promise((resolve) => setTimeout(resolve, 5000))

    // Haal alle gesynchroniseerde users op
    const allUsers = UserBookingSyncService.getAllUsers()

    console.log(`✅ Bulk import completed: ${allUsers.length} users with their bookings and ideas`)

    return NextResponse.json({
      success: true,
      message: "Bulk user import started successfully",
      totalUsers: allUsers.length,
      totalBookings: allUsers.reduce((sum, user) => sum + user.bookings.length, 0),
      totalIdeas: allUsers.reduce((sum, user) => sum + user.ideas.length, 0),
      users: allUsers.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        micrositeId: user.micrositeId,
        bookingsCount: user.bookings.length,
        ideasCount: user.ideas.length,
        lastSynced: user.lastSynced,
      })),
    })
  } catch (error) {
    console.error("❌ Bulk user import failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Geef status van huidige sync
    const allUsers = UserBookingSyncService.getAllUsers()

    return NextResponse.json({
      success: true,
      isRunning: true, // Je zou dit kunnen tracken
      totalUsers: allUsers.length,
      totalBookings: allUsers.reduce((sum, user) => sum + user.bookings.length, 0),
      totalIdeas: allUsers.reduce((sum, user) => sum + user.ideas.length, 0),
      lastSync: allUsers.length > 0 ? Math.max(...allUsers.map((u) => new Date(u.lastSynced || 0).getTime())) : null,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to get sync status" }, { status: 500 })
  }
}
