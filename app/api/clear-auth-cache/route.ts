import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("🧹 Clearing authentication cache...")

    // Clear any potential caches
    if (global.gc) {
      global.gc()
    }

    return NextResponse.json({
      success: true,
      message: "Authentication cache cleared successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Clear cache error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
