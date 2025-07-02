import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { micrositeId: string; agencyId: string } }) {
  try {
    const { micrositeId, agencyId } = params
    const { searchParams } = new URL(request.url)
    const config = searchParams.get("config") || "1"
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const ufrom = searchParams.get("ufrom")
    const uto = searchParams.get("uto")
    const first = searchParams.get("first") || "0"
    const limit = searchParams.get("limit") || "100"

    console.log(`👥 Getting users for agency ${agencyId} in microsite ${micrositeId}`)

    // Get credentials and authenticate (same pattern as above)
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

    // Get agency users
    const response = await fetch(
      `https://online.travelcompositor.com/resources/user/${actualMicrositeId}/${agencyId}?${params_obj.toString()}`,
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
      throw new Error(`Get agency users failed: ${response.status} - ${errorText}`)
    }

    const users = await response.json()

    return NextResponse.json({
      success: true,
      users,
      micrositeId: actualMicrositeId,
      agencyId,
      filters: { from, to, ufrom, uto },
      pagination: { first: Number.parseInt(first), limit: Number.parseInt(limit) },
    })
  } catch (error) {
    console.error("❌ Error getting agency users:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { micrositeId: string; agencyId: string } }) {
  try {
    const { micrositeId, agencyId } = params
    const { searchParams } = new URL(request.url)
    const config = searchParams.get("config") || "1"
    const userData = await request.json()

    console.log(`👥 Updating user for agency ${agencyId} in microsite ${micrositeId}`)

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

    // Update user
    const response = await fetch(
      `https://online.travelcompositor.com/resources/user/${actualMicrositeId}/${agencyId}/update`,
      {
        method: "PUT",
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
      throw new Error(`Update user failed: ${response.status} - ${errorText}`)
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      result,
      micrositeId: actualMicrositeId,
      agencyId,
    })
  } catch (error) {
    console.error("❌ Error updating user:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
