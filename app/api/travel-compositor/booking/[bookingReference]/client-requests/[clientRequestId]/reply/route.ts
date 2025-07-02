import { type NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: { bookingReference: string; clientRequestId: string } },
) {
  try {
    const { bookingReference, clientRequestId } = params
    const { searchParams } = new URL(request.url)
    const config = searchParams.get("config") || "1"

    console.log(`💬 Replying to client request ${clientRequestId} for booking ${bookingReference}`)

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

    // Get request body
    const replyMessage = await request.json()

    // Reply to client request
    const response = await fetch(
      `https://online.travelcompositor.com/resources/booking/${bookingReference}/client-requests/${clientRequestId}/reply`,
      {
        method: "POST",
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(replyMessage),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Reply to client request failed: ${response.status} - ${errorText}`)
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      reply: result,
      bookingReference,
      clientRequestId,
    })
  } catch (error) {
    console.error("❌ Error replying to client request:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
