import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 Testing Newreisplan authentication...")

    const credentials = {
      username: process.env.TRAVEL_COMPOSITOR_USERNAME!,
      password: process.env.TRAVEL_COMPOSITOR_PASSWORD!,
      micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!,
    }

    console.log(`🌐 Authenticating with microsite: ${credentials.micrositeId}`)

    const authResponse = await fetch("https://online.travelcompositor.com/resources/authentication/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(credentials),
    })

    if (!authResponse.ok) {
      const errorText = await authResponse.text()
      console.error("❌ Authentication failed:", authResponse.status, errorText)

      return NextResponse.json({
        success: false,
        error: `Authentication failed: ${authResponse.status}`,
        debug: {
          status: authResponse.status,
          errorText: errorText.substring(0, 200),
          credentials: {
            username: credentials.username,
            micrositeId: credentials.micrositeId,
            passwordLength: credentials.password.length,
          },
        },
      })
    }

    const authData = await authResponse.json()
    console.log("✅ Authentication successful")

    return NextResponse.json({
      success: true,
      data: {
        authenticated: true,
        token: authData.token ? "Token received" : "No token",
        micrositeId: credentials.micrositeId,
      },
    })
  } catch (error) {
    console.error("❌ Authentication test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
