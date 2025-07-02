import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ideaId = searchParams.get("ideaId") || "29223863"
    const config = searchParams.get("config") || "1"

    console.log(`🧪 SIMPLE TEST: Idea ${ideaId} with config ${config}`)

    // Get credentials
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
      case "4":
        username = process.env.TRAVEL_COMPOSITOR_USERNAME_4
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD_4
        micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_4
        break
      default:
        username = process.env.TRAVEL_COMPOSITOR_USERNAME
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD
        micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID
    }

    console.log(`🔑 Using microsite: ${micrositeId}`)
    console.log(`👤 Using username: ${username}`)

    if (!username || !password || !micrositeId) {
      return NextResponse.json({
        success: false,
        error: `Missing credentials for config ${config}`,
        debug: { username: !!username, password: !!password, micrositeId: !!micrositeId },
      })
    }

    // Step 1: Authenticate (exactly like debug tool)
    console.log("🔐 Step 1: Authenticating...")

    const authResponse = await fetch("https://online.travelcompositor.com/resources/authentication/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
        micrositeId: micrositeId,
      }),
    })

    console.log(`🔐 Auth response status: ${authResponse.status}`)

    if (!authResponse.ok) {
      const errorText = await authResponse.text()
      console.log(`❌ Auth failed: ${errorText}`)
      return NextResponse.json({
        success: false,
        error: `Authentication failed: ${authResponse.status}`,
        debug: { authError: errorText },
      })
    }

    const authData = await authResponse.json()
    console.log(`🔐 Auth data keys: ${Object.keys(authData).join(", ")}`)

    const token = authData.token
    if (!token) {
      return NextResponse.json({
        success: false,
        error: "No token received",
        debug: { authData },
      })
    }

    console.log("✅ Authentication successful")

    // Step 2: Try the EXACT endpoints that worked in debug
    const testEndpoints = [
      // These are the EXACT URLs from your debug screenshots
      `https://online.travelcompositor.com/resources/travelidea/${micrositeId}/info/${ideaId}`,
      `https://online.travelcompositor.com/resources/travelidea/${micrositeId}/${ideaId}`,
    ]

    const results = []

    for (let i = 0; i < testEndpoints.length; i++) {
      const endpoint = testEndpoints[i]
      console.log(`📡 Step 2.${i + 1}: Testing ${endpoint}`)

      try {
        const startTime = Date.now()

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

        const duration = Date.now() - startTime
        console.log(`⏱️ Request ${i + 1} took ${duration}ms`)

        if (response.ok) {
          const data = await response.json()
          const dataStr = JSON.stringify(data)
          const dataSize = dataStr.length

          console.log(`✅ Endpoint ${i + 1} SUCCESS`)
          console.log(`📊 Data size: ${dataSize} chars`)
          console.log(`🔑 Keys: ${Object.keys(data).join(", ")}`)

          // Log specific values
          if (data.title) console.log(`   📝 Title: ${data.title}`)
          if (data.totalPrice) console.log(`   💰 Price: ${data.totalPrice}`)
          if (data.departureDate) console.log(`   📅 Date: ${data.departureDate}`)

          results.push({
            endpoint,
            success: true,
            status: response.status,
            duration,
            dataSize,
            keys: Object.keys(data),
            sampleData: {
              title: data.title,
              totalPrice: data.totalPrice,
              departureDate: data.departureDate,
              hotels: data.hotels ? data.hotels.length : 0,
              transports: data.transports ? data.transports.length : 0,
            },
            rawData: data,
          })
        } else {
          const errorText = await response.text()
          console.log(`❌ Endpoint ${i + 1} FAILED: ${response.status}`)
          console.log(`❌ Error: ${errorText.substring(0, 200)}`)

          results.push({
            endpoint,
            success: false,
            status: response.status,
            duration,
            error: errorText.substring(0, 200),
          })
        }
      } catch (error) {
        console.log(`❌ Endpoint ${i + 1} EXCEPTION:`, error)
        results.push({
          endpoint,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    // Return detailed results
    return NextResponse.json({
      success: true,
      testResults: results,
      summary: {
        totalEndpoints: testEndpoints.length,
        successfulEndpoints: results.filter((r) => r.success).length,
        config: config,
        micrositeId: micrositeId,
        ideaId: ideaId,
      },
    })
  } catch (error) {
    console.error("❌ Simple test error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
