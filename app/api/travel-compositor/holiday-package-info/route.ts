import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const config = searchParams.get("config") || "1"
    const lang = searchParams.get("lang") || "nl"

    console.log(`🏖️ Getting holiday package info for config ${config}`)

    // Get credentials based on config
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
      case "3":
        username = process.env.TRAVEL_COMPOSITOR_USERNAME_3
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD_3
        micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3
        break
      default:
        username = process.env.TRAVEL_COMPOSITOR_USERNAME
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD
        micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID
    }

    if (!username || !password || !micrositeId) {
      throw new Error(`Missing credentials for config ${config}`)
    }

    // Authenticate with Travel Compositor
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
      const errorText = await authResponse.text()
      throw new Error(`Authentication failed: ${authResponse.status} - ${errorText}`)
    }

    const authData = await authResponse.json()
    const token = authData.token

    console.log(`🔑 Authentication successful for microsite ${micrositeId}`)

    // Try different endpoints to get holiday package information
    const endpoints = [
      {
        url: `https://online.travelcompositor.com/resources/packages/${micrositeId}?lang=${lang}`,
        name: "packages",
      },
      {
        url: `https://online.travelcompositor.com/resources/travelideas/${micrositeId}?lang=${lang}`,
        name: "travel ideas",
      },
      {
        url: `https://online.travelcompositor.com/resources/destination/${micrositeId}?lang=${lang}`,
        name: "destinations",
      },
    ]

    const results: any = {}

    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 Trying ${endpoint.name}: ${endpoint.url}`)

        const response = await fetch(endpoint.url, {
          method: "GET",
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          results[endpoint.name] = {
            success: true,
            data: data,
            count: Array.isArray(data) ? data.length : Object.keys(data).length,
          }
          console.log(`✅ ${endpoint.name}: ${results[endpoint.name].count} items`)
        } else {
          results[endpoint.name] = {
            success: false,
            error: `HTTP ${response.status}`,
          }
          console.log(`❌ ${endpoint.name} failed: ${response.status}`)
        }
      } catch (error) {
        results[endpoint.name] = {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }
        console.log(`❌ ${endpoint.name} error:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      micrositeId,
      config,
      results,
      summary: {
        packagesAvailable: results.packages?.success || false,
        travelIdeasAvailable: results["travel ideas"]?.success || false,
        destinationsAvailable: results.destinations?.success || false,
        totalPackages: results.packages?.count || 0,
        totalTravelIdeas: results["travel ideas"]?.count || 0,
        totalDestinations: results.destinations?.count || 0,
      },
    })
  } catch (error) {
    console.error("❌ Error getting holiday package info:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
