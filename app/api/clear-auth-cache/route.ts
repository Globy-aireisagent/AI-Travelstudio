import { NextResponse } from "next/server"

// Simple in-memory cache clear
const authTokenCache = new Map()

export async function POST() {
  try {
    console.log("🧹 Clearing authentication cache...")

    // Clear any in-memory caches
    authTokenCache.clear()

    // Force garbage collection if available
    if (global.gc) {
      global.gc()
    }

    return NextResponse.json({
      success: true,
      message: "Authentication cache cleared",
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
