import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { bookingReference: string } }) {
  try {
    const { bookingReference } = params
    const { searchParams } = new URL(request.url)
    const serviceType = searchParams.get("serviceType")
    const serviceId = searchParams.get("serviceId")
    const config = searchParams.get("config") || "1"

    console.log(`🚫 Cancelling service ${serviceType}/${serviceId} for booking ${bookingReference}`)

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
    const cancelRequest = await request.json()

    // Cancel service
    const cancelResponse = await fetch(
      `https://online.travelcompositor.com/resources/booking/${bookingReference}/${serviceType}/${serviceId}/cancel`,
      {
        method: "PUT",
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(cancelRequest),
      },
    )

    if (!cancelResponse.ok) {
      const errorText = await cancelResponse.text()
      throw new Error(`Cancel service failed: ${cancelResponse.status} - ${errorText}`)
    }

    const result = await cancelResponse.json()

    return NextResponse.json({
      success: true,
      result,
      bookingReference,
      serviceType,
      serviceId,
    })
  } catch (error) {
    console.error("❌ Error cancelling service:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
