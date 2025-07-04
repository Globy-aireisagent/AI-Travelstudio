import { NextResponse } from "next/server"

// Simple in-memory cache for auth tokens
const authCache = new Map<string, { token: string; expiry: Date }>()

export async function POST() {
  try {
    // Clear the auth cache
    authCache.clear()

    console.log("🧹 Auth cache cleared")

    return NextResponse.json({
      success: true,
      message: "Auth cache cleared successfully",
      clearedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Error clearing auth cache:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to clear auth cache",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const cacheStatus = {
      size: authCache.size,
      keys: Array.from(authCache.keys()),
      entries: Array.from(authCache.entries()).map(([key, value]) => ({
        key,
        hasToken: !!value.token,
        expiry: value.expiry.toISOString(),
        isExpired: value.expiry < new Date(),
      })),
    }

    return NextResponse.json({
      success: true,
      cache: cacheStatus,
      checkedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Error checking auth cache:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to check auth cache",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
