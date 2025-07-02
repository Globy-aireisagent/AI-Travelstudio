import { type NextRequest, NextResponse } from "next/server"
import { UserBookingSyncService } from "@/lib/user-booking-sync"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const userId = searchParams.get("userId")

    if (email) {
      // Search by email
      const user = UserBookingSyncService.searchUserByEmail(email)
      if (user) {
        return NextResponse.json({
          success: true,
          user,
          totalBookings: user.bookings.length,
          totalIdeas: user.ideas.length,
        })
      } else {
        return NextResponse.json(
          {
            success: false,
            error: "User not found",
          },
          { status: 404 },
        )
      }
    }

    if (userId) {
      // Get specific user
      const user = UserBookingSyncService.getUserData(userId)
      if (user) {
        return NextResponse.json({
          success: true,
          user,
          totalBookings: user.bookings.length,
          totalIdeas: user.ideas.length,
        })
      } else {
        return NextResponse.json(
          {
            success: false,
            error: "User not found",
          },
          { status: 404 },
        )
      }
    }

    // Get all users (admin view)
    const allUsers = UserBookingSyncService.getAllUsers()
    return NextResponse.json({
      success: true,
      users: allUsers,
      totalUsers: allUsers.length,
      totalBookings: allUsers.reduce((sum, user) => sum + user.bookings.length, 0),
      totalIdeas: allUsers.reduce((sum, user) => sum + user.ideas.length, 0),
    })
  } catch (error) {
    console.error("❌ Dashboard API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === "start-sync") {
      UserBookingSyncService.startRealTimeSync()
      return NextResponse.json({
        success: true,
        message: "Real-time sync started",
      })
    }

    if (action === "stop-sync") {
      UserBookingSyncService.stopRealTimeSync()
      return NextResponse.json({
        success: true,
        message: "Real-time sync stopped",
      })
    }

    if (action === "manual-sync") {
      await UserBookingSyncService.syncAllUserBookings()
      return NextResponse.json({
        success: true,
        message: "Manual sync completed",
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid action",
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("❌ Dashboard POST error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
