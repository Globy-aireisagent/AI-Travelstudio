import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { micrositeId: string; agencyId: string } }) {
  try {
    const { micrositeId, agencyId } = params
    const { searchParams } = new URL(request.url)
    const config = searchParams.get("config") || "1"
    const userData = await request.json()

    console.log(`👥 Creating user for agency ${agencyId} in microsite ${micrositeId}`)

    // Get credentials and authenticate
    let username, password, actualMicrositeId
    switch (config) {
      case "1":
        username = process.env.TRAVEL_COMPOSITOR_USERNAME
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD
        actualMicrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID
        break
      default:
        username = process.env.TRAVEL_COMPOSITOR_USERNAME
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD
        actualMicrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID
    }

    if (!username || !password || !actualMicrositeId) {
      throw new Error(`Missing credentials for config ${config}`)
    }

    // Authenticate
    const authResponse = await fetch("https://online.travelcompositor.com/resources/authentication/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        micrositeId: actualMicrositeId,
      }),
    })

    if (!authResponse.ok) {
      throw new Error(`Authentication failed: ${authResponse.status}`)
    }

    const authData = await authResponse.json()
    const token = authData.token

    // Create user
    const response = await fetch(
      `https://online.travelcompositor.com/resources/user/${actualMicrositeId}/${agencyId}/create`,
      {
        method: "POST",
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(userData),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Create user failed: ${response.status} - ${errorText}`)
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      result,
      micrositeId: actualMicrositeId,
      agencyId,
    })
  } catch (error) {
    console.error("❌ Error creating user:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
