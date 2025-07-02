import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const configParam = url.searchParams.get("config")
    const configNumber = configParam ? Number.parseInt(configParam) : 1

    console.log(`🔍 Debug Travel Compositor API - Config ${configNumber}`)

    const client = createTravelCompositorClient(configNumber)

    // First authenticate
    const token = await client.authenticate()
    console.log("✅ Authentication successful")

    // Try different endpoints to find the right one
    const endpointsToTry = [
      "/resources/admin/bookings",
      "/resources/bookings",
      "/resources/reservations",
      "/resources/orders",
      "/resources/trips",
      "/resources/admin/reservations",
      "/resources/admin/orders",
      "/resources/admin/trips",
      "/resources/booking",
      "/resources/reservation",
      "/resources/order",
      "/resources/trip",
      "/resources/admin",
      "/resources",
      "/api/bookings",
      "/api/reservations",
      "/api/admin/bookings",
    ]

    const results = []

    for (const endpoint of endpointsToTry) {
      try {
        console.log(`🧪 Testing endpoint: ${endpoint}`)

        const response = await fetch(`https://online.travelcompositor.com${endpoint}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })

        const result = {
          endpoint,
          status: response.status,
          statusText: response.statusText,
          success: response.ok,
          headers: Object.fromEntries(response.headers.entries()),
        }

        if (response.ok) {
          try {
            const data = await response.json()
            result.data = Array.isArray(data)
              ? {
                  type: "array",
                  length: data.length,
                  sample: data.slice(0, 2),
                }
              : {
                  type: typeof data,
                  keys: Object.keys(data || {}),
                  sample: data,
                }
          } catch (e) {
            const text = await response.text()
            result.data = { type: "text", content: text.substring(0, 200) }
          }
        } else {
          try {
            const errorText = await response.text()
            result.error = errorText.substring(0, 500)
          } catch (e) {
            result.error = "Could not read error response"
          }
        }

        results.push(result)
        console.log(`${response.ok ? "✅" : "❌"} ${endpoint}: ${response.status}`)
      } catch (error) {
        results.push({
          endpoint,
          status: "ERROR",
          error: error instanceof Error ? error.message : String(error),
          success: false,
        })
        console.log(`❌ ${endpoint}: ${error}`)
      }
    }

    return Response.json({
      timestamp: new Date().toISOString(),
      configNumber,
      authenticationSuccess: true,
      endpointResults: results,
      summary: {
        total: results.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        successfulEndpoints: results.filter((r) => r.success).map((r) => r.endpoint),
      },
    })
  } catch (error) {
    console.error("❌ Debug failed:", error)
    return Response.json(
      {
        success: false,
        error: "Debug failed",
        details: {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
      },
      { status: 500 },
    )
  }
}
