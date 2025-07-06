import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: NextRequest) {
  try {
    console.log("🔐 Testing Newreisplan authentication...")

    // Use the Travel Compositor client which has the correct authentication flow
    const client = createTravelCompositorClient(1)

    console.log("📋 Client config:", {
      baseUrl: client.config.baseUrl,
      micrositeId: client.config.micrositeId,
      username: client.config.username ? "***" : "missing",
    })

    // Test authentication using the client's authenticate method
    const token = await client.authenticate()

    if (token) {
      console.log("✅ Authentication successful")
      return NextResponse.json({
        success: true,
        message: "Authentication successful with Travel Compositor",
        data: {
          micrositeId: client.config.micrositeId,
          tokenLength: token.length,
          hasToken: !!token,
          baseUrl: client.config.baseUrl,
        },
      })
    } else {
      console.log("❌ No token received")
      return NextResponse.json({
        success: false,
        message: "No authentication token received",
        error: "Authentication failed - no token returned",
      })
    }
  } catch (error) {
    console.error("❌ Authentication test failed:", error)
    return NextResponse.json({
      success: false,
      message: "Authentication test failed",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
