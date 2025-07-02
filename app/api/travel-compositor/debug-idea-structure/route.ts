import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ideaId = searchParams.get("ideaId") || "29223863"
    const config = searchParams.get("config") || "1"

    console.log(`🔍 DEBUG: Fetching raw structure for idea ${ideaId}`)

    // Get credentials
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

    // Authenticate
    console.log("🔐 Authenticating...")
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

    // Try ALL possible endpoints for this idea
    const endpoints = [
      `https://online.travelcompositor.com/resources/travelidea/${actualMicrositeId}/info/${ideaId}`,
      `https://online.travelcompositor.com/resources/travelidea/${actualMicrositeId}/${ideaId}`,
      `https://online.travelcompositor.com/resources/travelidea/info/${ideaId}?microsite=${actualMicrositeId}`,
      `https://online.travelcompositor.com/resources/travelidea/${ideaId}?microsite=${actualMicrositeId}`,
      `https://online.travelcompositor.com/resources/travelidea/${actualMicrositeId}/full/${ideaId}`,
      `https://online.travelcompositor.com/resources/travelidea/${actualMicrositeId}/details/${ideaId}`,
      `https://online.travelcompositor.com/resources/travelidea/${actualMicrositeId}/complete/${ideaId}`,
    ]

    const results = []

    for (const endpoint of endpoints) {
      try {
        console.log(`📡 Testing endpoint: ${endpoint}`)

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

        if (response.ok) {
          const data = await response.json()

          // Analyze the structure
          const analysis = {
            endpoint: endpoint,
            status: response.status,
            dataKeys: Object.keys(data),
            hasServices: false,
            serviceKeys: [],
            hasClient: false,
            clientKeys: [],
            hasDates: false,
            dateKeys: [],
            hasImages: false,
            imageKeys: [],
            sampleData: {},
          }

          // Check for services
          Object.keys(data).forEach((key) => {
            const lowerKey = key.toLowerCase()
            if (
              lowerKey.includes("service") ||
              lowerKey.includes("hotel") ||
              lowerKey.includes("transport") ||
              lowerKey.includes("ticket") ||
              lowerKey.includes("car") ||
              lowerKey.includes("tour") ||
              lowerKey.includes("cruise") ||
              lowerKey.includes("insurance") ||
              lowerKey.includes("transfer")
            ) {
              analysis.hasServices = true
              analysis.serviceKeys.push(key)
              analysis.sampleData[key] = Array.isArray(data[key]) ? `Array(${data[key].length})` : typeof data[key]
            }

            if (
              lowerKey.includes("client") ||
              lowerKey.includes("contact") ||
              lowerKey.includes("user") ||
              lowerKey.includes("customer") ||
              lowerKey.includes("booker")
            ) {
              analysis.hasClient = true
              analysis.clientKeys.push(key)
              analysis.sampleData[key] = typeof data[key]
            }

            if (
              lowerKey.includes("date") ||
              lowerKey.includes("start") ||
              lowerKey.includes("end") ||
              lowerKey.includes("departure") ||
              lowerKey.includes("return")
            ) {
              analysis.hasDates = true
              analysis.dateKeys.push(key)
              analysis.sampleData[key] = data[key]
            }

            if (lowerKey.includes("image") || lowerKey.includes("photo") || lowerKey.includes("picture")) {
              analysis.hasImages = true
              analysis.imageKeys.push(key)
              analysis.sampleData[key] = Array.isArray(data[key]) ? `Array(${data[key].length})` : typeof data[key]
            }
          })

          // Store first 3 levels of data structure for analysis
          const getStructure = (obj: any, level = 0): any => {
            if (level > 2) return "[Deep Object]"
            if (Array.isArray(obj)) {
              return obj.length > 0 ? [getStructure(obj[0], level + 1)] : []
            }
            if (obj && typeof obj === "object") {
              const result: any = {}
              Object.keys(obj)
                .slice(0, 10)
                .forEach((key) => {
                  // Limit to first 10 keys
                  result[key] = getStructure(obj[key], level + 1)
                })
              return result
            }
            return typeof obj
          }

          analysis.sampleData.fullStructure = getStructure(data)

          results.push(analysis)
          console.log(`✅ Endpoint ${endpoint} returned data with keys:`, Object.keys(data))
        } else {
          const errorText = await response.text()
          results.push({
            endpoint: endpoint,
            status: response.status,
            error: errorText.substring(0, 200),
          })
          console.log(`❌ Endpoint ${endpoint} failed: ${response.status}`)
        }
      } catch (error) {
        results.push({
          endpoint: endpoint,
          error: error instanceof Error ? error.message : "Unknown error",
        })
        console.log(`❌ Endpoint ${endpoint} error:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      ideaId: ideaId,
      microsite: actualMicrositeId,
      endpointResults: results,
      summary: {
        totalEndpoints: endpoints.length,
        successfulEndpoints: results.filter((r) => r.status === 200).length,
        endpointsWithServices: results.filter((r) => r.hasServices).length,
        endpointsWithClient: results.filter((r) => r.hasClient).length,
        endpointsWithDates: results.filter((r) => r.hasDates).length,
        endpointsWithImages: results.filter((r) => r.hasImages).length,
      },
    })
  } catch (error) {
    console.error("❌ Debug error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
