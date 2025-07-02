import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { micrositeId: string; ideaId: string } }) {
  try {
    const { micrositeId, ideaId } = params
    const { searchParams } = new URL(request.url)
    const config = searchParams.get("config") || "1"

    console.log(`🔍 Fetching idea ${ideaId} from microsite ${micrositeId} using config ${config}`)

    // Get the appropriate credentials based on config
    let username, password, actualMicrositeId

    switch (config) {
      case "1":
        username = process.env.TRAVEL_COMPOSITOR_USERNAME
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD
        actualMicrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID
        break
      case "2":
        username = process.env.TRAVEL_COMPOSITOR_USERNAME_2
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD_2
        actualMicrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_2
        break
      case "3":
        username = process.env.TRAVEL_COMPOSITOR_USERNAME_3
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD_3
        actualMicrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3
        break
      case "4":
        username = process.env.TRAVEL_COMPOSITOR_USERNAME_4
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD_4
        actualMicrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_4
        break
      default:
        username = process.env.TRAVEL_COMPOSITOR_USERNAME
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD
        actualMicrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID
    }

    if (!username || !password || !actualMicrositeId) {
      throw new Error(`Missing credentials for config ${config}`)
    }

    // Create auth header
    const auth = Buffer.from(`${username}:${password}`).toString("base64")

    // Try multiple possible endpoints based on the Swagger documentation
    const endpoints = [
      `https://api.travelcompositor.com/travelidea/${actualMicrositeId}/info/${ideaId}`,
      `https://api.travelcompositor.com/travelidea/${actualMicrositeId}/${ideaId}`,
      `https://api.travelcompositor.com/api/travelidea/${actualMicrositeId}/info/${ideaId}`,
      `https://api.travelcompositor.com/api/travelidea/${actualMicrositeId}/${ideaId}`,
    ]

    let lastError = null

    for (const apiUrl of endpoints) {
      try {
        console.log(`📡 Trying endpoint: ${apiUrl}`)

        const response = await fetch(`${apiUrl}?lang=nl`, {
          method: "GET",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          console.log("✅ Idea retrieved from:", apiUrl)
          console.log("📊 Response structure:", Object.keys(data))

          return NextResponse.json({
            success: true,
            idea: data,
            source: apiUrl,
          })
        } else {
          const errorText = await response.text()
          console.log(`❌ Endpoint ${apiUrl} returned ${response.status}`)
          lastError = `${response.status}: ${errorText.substring(0, 200)}...`
        }
      } catch (error) {
        console.log(`❌ Endpoint ${apiUrl} failed:`, error)
        lastError = error instanceof Error ? error.message : "Unknown error"
      }
    }

    // If all endpoints failed, return error
    return NextResponse.json({
      success: false,
      error: `Idea ${ideaId} not found in microsite ${actualMicrositeId}. Tried ${endpoints.length} endpoints.`,
      lastError,
      endpointsTried: endpoints,
      idea: null,
    })
  } catch (error) {
    console.error("❌ Error fetching idea:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        idea: null,
      },
      { status: 500 },
    )
  }
}
