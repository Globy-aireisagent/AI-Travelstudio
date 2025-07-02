import { type NextRequest, NextResponse } from "next/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: { micrositeId: string; agencyId: string; username: string } },
) {
  try {
    const { micrositeId, agencyId, username } = params
    const { searchParams } = new URL(request.url)
    const config = searchParams.get("config") || "1"

    console.log(`🚫 Deactivating user ${username} from agency ${agencyId} in microsite ${micrositeId}`)

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

    // Deactivate user
    const response = await fetch(
      `https://online.travelcompositor.com/resources/user/${actualMicrositeId}/${agencyId}/${username}/deactivate`,
      {
        method: "PUT",
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Deactivate user failed: ${response.status} - ${errorText}`)
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      result,
      micrositeId: actualMicrositeId,
      agencyId,
      username,
      action: "deactivated",
    })
  } catch (error) {
    console.error("❌ Error deactivating user:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
