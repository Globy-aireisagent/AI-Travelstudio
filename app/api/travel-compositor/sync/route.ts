import { type NextRequest, NextResponse } from "next/server"
import { BookingSyncService } from "@/lib/booking-sync-service"

// Manual sync trigger voor admin
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const configNumber = Number.parseInt(searchParams.get("config") || "1")

    console.log(`🔄 Manual sync triggered for config ${configNumber}`)

    const bookings = await BookingSyncService.ensureBookingsAvailable(configNumber)

    return NextResponse.json({
      success: true,
      message: `Sync completed for config ${configNumber}`,
      bookingCount: bookings.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Manual sync failed:", error)
    return NextResponse.json({ success: false, error: "Sync failed" }, { status: 500 })
  }
}

// Check sync status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const configNumber = Number.parseInt(searchParams.get("config") || "1")

    // Implementeer status check
    return NextResponse.json({
      success: true,
      config: configNumber,
      // status info
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Status check failed" }, { status: 500 })
  }
}
