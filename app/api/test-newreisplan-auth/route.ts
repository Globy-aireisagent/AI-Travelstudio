import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 Testing Newreisplan authentication...")

    // Gebruik de eerste set credentials (waarschijnlijk de nieuwe Newreisplan)
    const credentials = {
      username: process.env.TRAVEL_COMPOSITOR_USERNAME!,
      password: process.env.TRAVEL_COMPOSITOR_PASSWORD!,
      micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!,
    }

    if (!credentials.username || !credentials.password || !credentials.micrositeId) {
      return NextResponse.json({
        success: false,
        error: "Missing Newreisplan credentials",
        debug: {
          hasUsername: !!credentials.username,
          hasPassword: !!credentials.password,
          hasMicrositeId: !!credentials.micrositeId,
        },
      })
    }

    console.log(`🔑 Testing with username: ${credentials.username}`)
    console.log(`🏢 Microsite ID: ${credentials.micrositeId}`)

    const response = await fetch("https://online.travelcompositor.com/resources/authentication/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Authentication failed:", response.status, errorText)

      return NextResponse.json({
        success: false,
        error: `Authentication failed: ${response.status}`,
        debug: {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText.substring(0, 200),
          credentials: {
            username: credentials.username,
            micrositeId: credentials.micrositeId,
            passwordLength: credentials.password.length,
          },
        },
      })
    }

    const authData = await response.json()

    if (!authData.token) {
      return NextResponse.json({
        success: false,
        error: "No token received from authentication",
        debug: { authData },
      })
    }

    console.log("✅ Newreisplan authentication successful!")

    return NextResponse.json({
      success: true,
      data: {
        tokenReceived: true,
        expirationInSeconds: authData.expirationInSeconds || 7200,
        micrositeId: credentials.micrositeId,
        username: credentials.username,
      },
    })
  } catch (error) {
    console.error("❌ Authentication test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        debug: { errorType: typeof error, errorMessage: error instanceof Error ? error.message : String(error) },
      },
      { status: 500 },
    )
  }
}
