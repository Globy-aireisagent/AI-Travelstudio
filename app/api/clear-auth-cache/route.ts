import { NextResponse } from "next/server"

// Simple in-memory cache for auth tokens
const authCache = new Map<string, { token: string; expires: number }>()

export async function POST() {
  try {
    console.log("🧹 Clearing authentication cache...")

    // Clear the in-memory cache
    authCache.clear()

    console.log("✅ Authentication cache cleared successfully")

    return NextResponse.json({
      success: true,
      message: "Authentication cache cleared successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("❌ Clear auth cache error:", errorMessage)

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const cacheSize = authCache.size
    const cacheKeys = Array.from(authCache.keys())

    return NextResponse.json({
      success: true,
      cacheSize,
      cacheKeys,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
