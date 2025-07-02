import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { micrositeId: string; ideaId: string } }) {
  try {
    const { micrositeId, ideaId } = params
    const { searchParams } = new URL(request.url)
    const config = searchParams.get("config") || "1"

    console.log(`🔍 Fetching travel idea ${ideaId} from microsite ${micrositeId} using config ${config}`)

    // Map microsite names to config numbers if needed
    const micrositeNameToConfig = {
      "rondreis-planner": "1",
      reisbureaunederland: "2",
      auto: "3",
      "microsite-4": "4",
    }

    // If micrositeId is a name, convert to config number
    const actualConfig = micrositeNameToConfig[micrositeId] || config

    // Get credentials based on config
    let username, password, actualMicrositeId

    switch (actualConfig) {
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
      throw new Error(`Missing credentials for config ${actualConfig}`)
    }

    console.log(`🔑 Using credentials for config ${actualConfig}:`)
    console.log(`   - Username: ${username?.substring(0, 3)}***`)
    console.log(`   - Microsite ID: ${actualMicrositeId}`)

    // Authenticate
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

    console.log(`🔐 Auth response status: ${authResponse.status}`)

    if (!authResponse.ok) {
      const authErrorText = await authResponse.text()
      console.error(`❌ Authentication failed: ${authResponse.status}`)
      console.error(`❌ Auth error response: ${authErrorText}`)
      throw new Error(`Authentication failed: ${authResponse.status} - ${authErrorText}`)
    }

    const authData = await authResponse.json()
    const token = authData.token

    if (!token) {
      console.error("❌ No token in auth response:", authData)
      throw new Error("No authentication token received")
    }

    console.log("✅ Authentication successful, token received")

    // Try the working endpoint from simple test
    const endpoint = `https://online.travelcompositor.com/resources/travelidea/${actualMicrositeId}/${ideaId}`

    console.log(`📡 Fetching idea: ${endpoint}`)

    const response = await fetch(`${endpoint}?lang=nl`, {
      method: "GET",
      headers: {
        "auth-token": token,
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "User-Agent": "TravelCompositorClient/1.0",
      },
    })

    console.log(`📡 API response status: ${response.status}`)
    console.log(`📡 API response headers:`, Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ API call failed: ${response.status}`)
      console.error(`❌ Error response: ${errorText}`)
      throw new Error(`API call failed: ${response.status} - ${errorText}`)
    }

    // 🚨 CHECK CONTENT TYPE BEFORE PARSING
    const contentType = response.headers.get("content-type")
    console.log(`📡 Response content-type: ${contentType}`)

    if (!contentType || !contentType.includes("application/json")) {
      const responseText = await response.text()
      console.error(`❌ Expected JSON but got: ${contentType}`)
      console.error(`❌ Response body: ${responseText.substring(0, 500)}...`)
      throw new Error(`Expected JSON response but got ${contentType}. Response: ${responseText.substring(0, 200)}`)
    }

    const rawIdea = await response.json()

    // 🚨 EXTENSIVE DEBUGGING - LOG EVERYTHING
    console.log("🔍 RAW IDEA DATA STRUCTURE:")
    console.log("📊 Top level keys:", Object.keys(rawIdea))

    // 🚨 RETURN RAW DATA - LET FRONTEND TRANSFORM IT
    console.log("✅ Returning RAW idea data for frontend transformation")

    return NextResponse.json({
      success: true,
      idea: rawIdea, // 🎯 RAW DATA, NOT TRANSFORMED!
      source: endpoint,
      debug: {
        rawDataKeys: Object.keys(rawIdea),
        endpointUsed: endpoint,
        contentType: contentType,
        responseStatus: response.status,
        configUsed: actualConfig,
        micrositeId: actualMicrositeId,
      },
    })
  } catch (error) {
    console.error("❌ Error fetching travel idea:", error)
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
