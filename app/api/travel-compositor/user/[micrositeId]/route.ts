import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { micrositeId: string } }) {
  try {
    const { micrositeId } = params
    const { searchParams } = new URL(request.url)
    const config = searchParams.get("config") || "1"
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const ufrom = searchParams.get("ufrom")
    const uto = searchParams.get("uto")
    const first = searchParams.get("first") || "0"
    const limit = searchParams.get("limit") || "100"

    console.log(`👥 Getting users for microsite ${micrositeId}`)

    // Get credentials
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

    // Build query parameters
    const params_obj = new URLSearchParams()
    if (from) params_obj.append("from", from)
    if (to) params_obj.append("to", to)
    if (ufrom) params_obj.append("ufrom", ufrom)
    if (uto) params_obj.append("uto", uto)
    params_obj.append("first", first)
    params_obj.append("limit", limit)

    // Get users
    const response = await fetch(
      `https://online.travelcompositor.com/resources/user/${actualMicrositeId}?${params_obj.toString()}`,
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
      throw new Error(`Get users failed: ${response.status} - ${errorText}`)
    }

    const users = await response.json()

    return NextResponse.json({
      success: true,
      users,
      micrositeId: actualMicrositeId,
      filters: { from, to, ufrom, uto },
      pagination: { first: Number.parseInt(first), limit: Number.parseInt(limit) },
    })
  } catch (error) {
    console.error("❌ Error getting users:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
