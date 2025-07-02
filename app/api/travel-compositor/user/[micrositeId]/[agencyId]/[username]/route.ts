import { type NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { micrositeId: string; agencyId: string; username: string } },
) {
  try {
    const { micrositeId, agencyId, username } = params
    const { searchParams } = new URL(request.url)
    const config = searchParams.get("config") || "1"

    console.log(`👤 Getting user ${username} from agency ${agencyId} in microsite ${micrositeId}`)

    // Get credentials and authenticate
    let auth_username, password, actualMicrositeId
    switch (config) {
      case "1":
        auth_username = process.env.TRAVEL_COMPOSITOR_USERNAME
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD
        actualMicrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID
        break
      default:
        auth_username = process.env.TRAVEL_COMPOSITOR_USERNAME
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD
        actualMicrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID
    }

    if (!auth_username || !password || !actualMicrositeId) {
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
        username: auth_username,
        password,
        micrositeId: actualMicrositeId,
      }),
    })

    if (!authResponse.ok) {
      throw new Error(`Authentication failed: ${authResponse.status}`)
    }

    const authData = await authResponse.json()
    const token = authData.token

    // Get user details
    const response = await fetch(
      `https://online.travelcompositor.com/resources/user/${actualMicrositeId}/${agencyId}/${username}`,
      {
        method: "GET",
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Get user failed: ${response.status} - ${errorText}`)
    }

    const user = await response.json()

    return NextResponse.json({
      success: true,
      user,
      micrositeId: actualMicrositeId,
      agencyId,
      username,
    })
  } catch (error) {
    console.error("❌ Error getting user:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
