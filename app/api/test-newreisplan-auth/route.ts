import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("🔐 Testing Newreisplan authentication...")

    const username = process.env.TRAVEL_COMPOSITOR_USERNAME
    const password = process.env.TRAVEL_COMPOSITOR_PASSWORD
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID

    if (!username || !password || !micrositeId) {
      return NextResponse.json({
        success: false,
        message: "Missing credentials in environment variables",
        error: "TRAVEL_COMPOSITOR_USERNAME, TRAVEL_COMPOSITOR_PASSWORD, or TRAVEL_COMPOSITOR_MICROSITE_ID not found",
      })
    }

    console.log("📋 Using credentials:", {
      username: username.substring(0, 3) + "***",
      micrositeId,
      hasPassword: !!password,
    })

    // Test authentication with a simple endpoint
    const authString = Buffer.from(`${username}:${password}`).toString("base64")

    const testUrl = `https://api.travelcompositor.com/api/v1/agency/${micrositeId}`
    console.log("🌐 Testing URL:", testUrl)

    const response = await fetch(testUrl, {
      method: "GET",
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    console.log("📡 Response status:", response.status)
    console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Auth failed:", errorText)

      return NextResponse.json({
        success: false,
        message: `Authentication failed (${response.status})`,
        error: errorText || `HTTP ${response.status}`,
        data: {
          status: response.status,
          statusText: response.statusText,
          url: testUrl,
        },
      })
    }

    const data = await response.json()
    console.log("✅ Auth successful, response:", data)

    return NextResponse.json({
      success: true,
      message: "Authentication successful",
      data: {
        micrositeId,
        responseData: data,
        status: response.status,
      },
    })
  } catch (error) {
    console.error("💥 Auth test error:", error)

    return NextResponse.json({
      success: false,
      message: "Network or server error during authentication",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
