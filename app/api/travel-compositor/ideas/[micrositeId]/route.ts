import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { micrositeId: string } }) {
  try {
    const { micrositeId } = params
    const { searchParams } = new URL(request.url)
    const config = searchParams.get("config") || "1"
    const limit = searchParams.get("limit") || "20"

    console.log(`🔍 Fetching ideas from microsite ${micrositeId} using config ${config}`)

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

    // Try multiple possible endpoints for listing ideas
    const endpoints = [
      `https://api.travelcompositor.com/travelidea/${actualMicrositeId}`,
      `https://api.travelcompositor.com/api/travelidea/${actualMicrositeId}`,
      `https://api.travelcompositor.com/travelideas/${actualMicrositeId}`,
      `https://api.travelcompositor.com/api/travelideas/${actualMicrositeId}`,
    ]

    let lastError = null

    for (const apiUrl of endpoints) {
      try {
        console.log(`📡 Trying endpoint: ${apiUrl}`)

        const response = await fetch(`${apiUrl}?lang=nl&limit=${limit}`, {
          method: "GET",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          console.log("✅ Ideas retrieved from:", apiUrl)
          console.log("📊 Response structure:", Object.keys(data))
          console.log("📊 Ideas count:", Array.isArray(data) ? data.length : "Not an array")

          // Handle different response formats
          let ideas = []
          if (Array.isArray(data)) {
            ideas = data
          } else if (data.ideas && Array.isArray(data.ideas)) {
            ideas = data.ideas
          } else if (data.content && Array.isArray(data.content)) {
            ideas = data.content
          } else if (data.results && Array.isArray(data.results)) {
            ideas = data.results
          }

          return NextResponse.json({
            success: true,
            ideas,
            total: ideas.length,
            source: apiUrl,
            rawResponse: data,
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
      error: `No ideas found in microsite ${actualMicrositeId}. Tried ${endpoints.length} endpoints.`,
      lastError,
      endpointsTried: endpoints,
      ideas: [],
    })
  } catch (error) {
    console.error("❌ Error fetching ideas:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        ideas: [],
      },
      { status: 500 },
    )
  }
}
