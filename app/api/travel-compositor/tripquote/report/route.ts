import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const config = searchParams.get("config") || "1"
    const operatorId = searchParams.get("operatorId") || ""
    const quoteDateFrom = searchParams.get("quoteDateFrom") || ""
    const quoteDateTo = searchParams.get("quoteDateTo") || ""
    const tripType = searchParams.get("tripType") || "MULTI"
    const page = searchParams.get("page") || "0"

    console.log(`📈 Getting trip quote report`)

    // Get credentials
    let username, password, micrositeId
    switch (config) {
      case "1":
        username = process.env.TRAVEL_COMPOSITOR_USERNAME
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD
        micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID
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
      page,
      ...(operatorId && { operatorId }),
      ...(quoteDateFrom && { quoteDateFrom }),
      ...(quoteDateTo && { quoteDateTo }),
      ...(tripType && { tripType }),
    })

    // Get trip quote report
    const response = await fetch(`https://online.travelcompositor.com/resources/tripquote/report?${params}`, {
      method: "GET",
      headers: {
        "auth-token": token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Get trip quote report failed: ${response.status} - ${errorText}`)
    }

    const report = await response.json()

    return NextResponse.json({
      success: true,
      report,
      parameters: {
        micrositeId,
        operatorId,
        quoteDateFrom,
        quoteDateTo,
        tripType,
        page,
      },
    })
  } catch (error) {
    console.error("❌ Error getting trip quote report:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
