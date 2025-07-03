import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const config = searchParams.get("config") || "1"

    console.log(`📋 Getting holiday package info for config ${config}`)

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

    console.log(`🔑 Authentication successful, exploring available endpoints`)

    const results = {
      micrositeId,
      availablePackages: [],
      availableIdeas: [],
      availableDestinations: [],
      endpoints: [],
    }

    // Try different endpoints to see what's available
    const endpointsToTry = [
      {
        name: "packages",
        url: `https://online.travelcompositor.com/resources/packages/${micrositeId}`,
      },
      {
        name: "travel-ideas",
        url: `https://online.travelcompositor.com/resources/travelideas/${micrositeId}`,
      },
      {
        name: "destinations",
        url: `https://online.travelcompositor.com/resources/destination/${micrositeId}`,
      },
      {
        name: "accommodations",
        url: `https://online.travelcompositor.com/resources/accommodations`,
      },
    ]

    for (const endpoint of endpointsToTry) {
      try {
        console.log(`🔍 Trying endpoint: ${endpoint.name}`)

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
          console.log(`✅ ${endpoint.name} success:`, Object.keys(data))

          results.endpoints.push({
            name: endpoint.name,
            url: endpoint.url,
            status: "success",
            dataKeys: Object.keys(data),
            sampleData: JSON.stringify(data).substring(0, 500) + "...",
          })

          // Extract specific data types
          if (endpoint.name === "packages" && data.packages) {
            results.availablePackages = data.packages.slice(0, 5).map((pkg: any) => ({
              id: pkg.id,
              name: pkg.name,
              description: pkg.description?.substring(0, 100),
            }))
          }

          if (endpoint.name === "travel-ideas" && data.travelIdeas) {
            results.availableIdeas = data.travelIdeas.slice(0, 5).map((idea: any) => ({
              id: idea.id,
              name: idea.name,
              description: idea.description?.substring(0, 100),
            }))
          }

          if (endpoint.name === "destinations" && data.destination) {
            results.availableDestinations = data.destination.slice(0, 10).map((dest: any) => ({
              id: dest.id,
              name: dest.name,
              country: dest.country,
            }))
          }
        } else {
          console.log(`❌ ${endpoint.name} failed: ${response.status}`)
          results.endpoints.push({
            name: endpoint.name,
            url: endpoint.url,
            status: "failed",
            error: `HTTP ${response.status}`,
          })
        }
      } catch (error) {
        console.log(`❌ ${endpoint.name} error:`, error)
        results.endpoints.push({
          name: endpoint.name,
          url: endpoint.url,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    console.log("📊 Holiday package info results:", results)

    return NextResponse.json({
      success: true,
      data: results,
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
