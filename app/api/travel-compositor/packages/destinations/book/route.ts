import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const config = searchParams.get("config") || "1"

    console.log(`📦 Booking destination package`)

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

    // Get request body
    const bookingRequest = await request.json()

    // Book destination package
    const response = await fetch("https://online.travelcompositor.com/resources/package/destinations/book", {
      method: "POST",
      headers: {
        "auth-token": token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(bookingRequest),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Package booking failed: ${response.status} - ${errorText}`)
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      booking: result,
      micrositeId,
    })
  } catch (error) {
    console.error("❌ Error booking destination package:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
