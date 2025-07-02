import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { micrositeId: string } }) {
  try {
    const { micrositeId } = params
    const { searchParams } = new URL(request.url)
    const config = searchParams.get("config") || "1"
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    console.log(`🔍 Browsing travel ideas in microsite ${micrositeId} using config ${config}`)

    // Get credentials based on config
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

    // Authenticate first
    console.log("🔐 Authenticating with Travel Compositor...")

    const authResponse = await fetch("https://online.travelcompositor.com/resources/authentication/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
        micrositeId: actualMicrositeId,
      }),
    })

    if (!authResponse.ok) {
      throw new Error(`Authentication failed: ${authResponse.status}`)
    }

    const authData = await authResponse.json()
    const token = authData.token

    if (!token) {
      throw new Error("No authentication token received")
    }

    console.log("✅ Authentication successful")

    // Try multiple Ideas listing endpoints
    const listEndpoints = [
      `https://online.travelcompositor.com/resources/travelidea/${actualMicrositeId}/list`,
      `https://online.travelcompositor.com/resources/travelidea/list?microsite=${actualMicrositeId}`,
      `https://online.travelcompositor.com/resources/travelidea/${actualMicrositeId}`,
    ]

    let ideas = []

    for (const endpoint of listEndpoints) {
      try {
        console.log(`📡 Trying Ideas list endpoint: ${endpoint}`)

        const response = await fetch(`${endpoint}?lang=nl&limit=${limit}`, {
          method: "GET",
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
            Accept: "application/json",
            "Accept-Encoding": "gzip",
            "User-Agent": "TravelCompositorClient/1.0",
          },
        })

        if (response.ok) {
          const data = await response.json()
          console.log("✅ Ideas list retrieved from:", endpoint)
          console.log("📊 Response structure:", Object.keys(data))

          // Extract ideas from different possible response structures
          if (Array.isArray(data)) {
            ideas = data
          } else if (data.ideas && Array.isArray(data.ideas)) {
            ideas = data.ideas
          } else if (data.travelIdeas && Array.isArray(data.travelIdeas)) {
            ideas = data.travelIdeas
          } else if (data.results && Array.isArray(data.results)) {
            ideas = data.results
          } else if (data.data && Array.isArray(data.data)) {
            ideas = data.data
          }

          if (ideas.length > 0) {
            console.log(`✅ Found ${ideas.length} ideas`)
            break
          }
        } else {
          const errorText = await response.text()
          console.log(`❌ Endpoint ${endpoint} returned ${response.status}: ${errorText.substring(0, 200)}`)
        }
      } catch (error) {
        console.log(`❌ Endpoint ${endpoint} failed:`, error)
      }
    }

    // Transform ideas for consistent format
    const transformedIdeas = ideas.slice(0, limit).map((idea: any) => ({
      id: idea.id,
      title: idea.title || idea.largeTitle || idea.name || `Idea ${idea.id}`,
      largeTitle: idea.largeTitle || idea.title,
      description: idea.description || idea.summary,
      creationDate: idea.creationDate || idea.created,
      totalPrice: idea.totalPrice || idea.price,
      destinations: idea.destinations || idea.locations || [],
      imageUrl: idea.imageUrl || idea.image,
      status: idea.status || "idea",
    }))

    return NextResponse.json({
      success: true,
      ideas: transformedIdeas,
      total: transformedIdeas.length,
      microsite: actualMicrositeId,
    })
  } catch (error) {
    console.error("❌ Error browsing travel ideas:", error)
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
