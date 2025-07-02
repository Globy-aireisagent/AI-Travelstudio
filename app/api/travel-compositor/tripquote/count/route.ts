import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const config = searchParams.get("config") || "1"
    const operatorId = searchParams.get("operatorId") || ""
    const quoteDateFrom = searchParams.get("quoteDateFrom") || ""
    const quoteDateTo = searchParams.get("quoteDateTo") || ""
    const tripType = searchParams.get("tripType") || "MULTI"
    const salesChannel = searchParams.get("salesChannel") || "WEB"

    console.log(`📊 Getting trip quote count`)

    // Get credentials
    let username, password, micrositeId
    switch (config) {
      case "1":
        username = process.env.TRAVEL_COMPOSITOR_USERNAME
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD
        micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID
        break
      case "2":
        username = process.env.TRAVEL_COMPOSITOR_USERNAME_2
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD_2
        micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_2
        break
      default:
        username = process.env.TRAVEL_COMPOSITOR_USERNAME
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD
        micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID
    }

    if (!username || !password || !micrositeId) {
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
        micrositeId,
      }),
    })

    if (!authResponse.ok) {
      throw new Error(`Authentication failed: ${authResponse.status}`)
    }

    const authData = await authResponse.json()
    const token = authData.token

    // Build query parameters
    const params = new URLSearchParams({
      micrositeId,
      ...(operatorId && { operatorId }),
      ...(quoteDateFrom && { quoteDateFrom }),
      ...(quoteDateTo && { quoteDateTo }),
      ...(tripType && { tripType }),
      ...(salesChannel && { salesChannel }),
    })

    // Get trip quote count
    const response = await fetch(`https://online.travelcompositor.com/resources/tripquote/count?${params}`, {
      method: "GET",
      headers: {
        "auth-token": token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Get trip quote count failed: ${response.status} - ${errorText}`)
    }

    const count = await response.json()

    return NextResponse.json({
      success: true,
      count,
      parameters: {
        micrositeId,
        operatorId,
        quoteDateFrom,
        quoteDateTo,
        tripType,
        salesChannel,
      },
    })
  } catch (error) {
    console.error("❌ Error getting trip quote count:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
