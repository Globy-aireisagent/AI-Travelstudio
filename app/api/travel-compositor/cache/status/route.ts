import { NextResponse } from "next/server"
import { persistentBookingCache } from "@/lib/persistent-booking-cache"

export async function GET() {
  try {
    const stats = persistentBookingCache.getStats()

    return NextResponse.json({
      success: true,
      ...stats,
      sampleBookingIds: persistentBookingCache.getSampleBookingIds(20),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  try {
    console.log("🔄 Manual cache refresh requested...")
    await persistentBookingCache.forceRefresh()

    return NextResponse.json({
      success: true,
      message: "Cache refreshed successfully",
      stats: persistentBookingCache.getStats(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
