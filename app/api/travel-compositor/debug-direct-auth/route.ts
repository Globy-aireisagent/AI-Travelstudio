import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const configId = searchParams.get("config") || "1"

  try {
    console.log(`🔍 DEBUG: Testing authentication for config ${configId}`)

    // Get credentials
    const credentials = getCredentialsForConfig(Number.parseInt(configId))
    if (!credentials) {
      return NextResponse.json({ error: `No credentials for config ${configId}` }, { status: 400 })
    }

    console.log(`📋 Config ${configId}:`, {
      username: credentials.username ? "✅ Set" : "❌ Missing",
      password: credentials.password ? "✅ Set" : "❌ Missing",
      micrositeId: credentials.micrositeId ? "✅ Set" : "❌ Missing",
    })

    // Test different API endpoints
    const testEndpoints = [
      `https://api.travelcompositor.com/booking/getBookings/${credentials.micrositeId}`,
      `https://api.travelcompositor.com/booking/${credentials.micrositeId}`,
      `https://api.travelcompositor.com/v1/booking/${credentials.micrositeId}`,
      `https://api.travelcompositor.com/health`,
      `https://api.travelcompositor.com/status`,
    ]

    const results = []

    for (const endpoint of testEndpoints) {
      try {
        console.log(`🧪 Testing: ${endpoint}`)

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString("base64")}`,
            Accept: "application/json",
            "User-Agent": "TravelAssistant/1.0",
          },
        })

        const result = {
          endpoint,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          success: response.ok,
        }

        if (response.ok) {
          try {
            const data = await response.json()
            result.dataType = Array.isArray(data) ? `array[${data.length}]` : typeof data
            result.sampleKeys = typeof data === "object" ? Object.keys(data).slice(0, 5) : []
          } catch (e) {
            result.dataType = "non-json"
          }
        } else {
          try {
            result.errorBody = await response.text()
          } catch (e) {
            result.errorBody = "Could not read error body"
          }
        }

        results.push(result)
        console.log(`${response.ok ? "✅" : "❌"} ${endpoint}: ${response.status}`)
      } catch (error) {
        results.push({
          endpoint,
          error: error instanceof Error ? error.message : String(error),
          success: false,
        })
        console.log(`❌ ${endpoint}: ${error}`)
      }
    }

    return NextResponse.json({
      success: true,
      config: configId,
      credentials: {
        username: credentials.username ? "✅ Set" : "❌ Missing",
        password: credentials.password ? "✅ Set" : "❌ Missing",
        micrositeId: credentials.micrositeId,
      },
      testResults: results,
      workingEndpoints: results.filter((r) => r.success),
      failedEndpoints: results.filter((r) => !r.success),
    })
  } catch (error) {
    console.error("❌ Debug auth error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

function getCredentialsForConfig(configId: number) {
  const configs = {
    1: {
      username: process.env.TRAVEL_COMPOSITOR_USERNAME!,
      password: process.env.TRAVEL_COMPOSITOR_PASSWORD!,
      micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!,
    },
    3: {
      username: process.env.TRAVEL_COMPOSITOR_USERNAME_3!,
      password: process.env.TRAVEL_COMPOSITOR_PASSWORD_3!,
      micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3!,
    },
    4: {
      username: process.env.TRAVEL_COMPOSITOR_USERNAME_4!,
      password: process.env.TRAVEL_COMPOSITOR_PASSWORD_4!,
      micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_4!,
    },
  }

  return configs[configId as keyof typeof configs] || null
}
