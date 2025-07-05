import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🏢 Testing Newreisplan agencies import...")

    // Authenticeer eerst
    const credentials = {
      username: process.env.TRAVEL_COMPOSITOR_USERNAME!,
      password: process.env.TRAVEL_COMPOSITOR_PASSWORD!,
      micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!,
    }

    const authResponse = await fetch("https://online.travelcompositor.com/resources/authentication/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(credentials),
    })

    if (!authResponse.ok) {
      throw new Error(`Authentication failed: ${authResponse.status}`)
    }

    const authData = await authResponse.json()
    const token = authData.token

    // Haal agencies op
    console.log(`📋 Fetching agencies from microsite ${credentials.micrositeId}...`)

    const agenciesResponse = await fetch(
      `https://online.travelcompositor.com/resources/agency/${credentials.micrositeId}?first=0&limit=50`,
      {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    )

    if (!agenciesResponse.ok) {
      const errorText = await agenciesResponse.text()
      console.error("❌ Agencies fetch failed:", agenciesResponse.status, errorText)

      return NextResponse.json({
        success: false,
        error: `Agencies fetch failed: ${agenciesResponse.status}`,
        debug: {
          status: agenciesResponse.status,
          errorText: errorText.substring(0, 200),
        },
      })
    }

    const agenciesData = await agenciesResponse.json()
    console.log("📊 Agencies API response:", agenciesData)

    const agencies = agenciesData.agency || agenciesData.agencies || []

    console.log(`✅ Found ${agencies.length} agencies in Newreisplan`)

    return NextResponse.json({
      success: true,
      data: {
        agencies: agencies,
        totalAgencies: agencies.length,
        micrositeId: credentials.micrositeId,
      },
    })
  } catch (error) {
    console.error("❌ Agencies test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
