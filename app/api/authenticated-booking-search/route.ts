import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get("bookingId") || "RRP-9263"

    console.log(`🔐 Testing authenticated booking search for: ${bookingId}`)

    // Test with all our available configs
    const configs = [1, 2, 3, 4]
    const results = []

    for (const configNumber of configs) {
      try {
        console.log(`🧪 Testing with config ${configNumber}`)

        const client = createTravelCompositorClient(configNumber)
        await client.authenticate()

        // Get the auth token from the client
        const authToken = client.authToken
        if (!authToken) {
          throw new Error("No auth token available")
        }

        console.log(`🔑 Got auth token for config ${configNumber}: ${authToken.substring(0, 20)}...`)

        // Test the discovered endpoints with authentication
        const testEndpoints = [
          {
            name: "booking-search",
            url: `https://online.travelcompositor.com/resources/booking/search?reference=${bookingId}`,
          },
          {
            name: "booking-find",
            url: `https://online.travelcompositor.com/resources/booking/find?id=${bookingId}`,
          },
          {
            name: "booking-search-clean",
            url: `https://online.travelcompositor.com/resources/booking/search?reference=${bookingId.replace(/^RRP-?/i, "")}`,
          },
          {
            name: "booking-find-clean",
            url: `https://online.travelcompositor.com/resources/booking/find?id=${bookingId.replace(/^RRP-?/i, "")}`,
          },
        ]

        for (const endpoint of testEndpoints) {
          try {
            console.log(`🔍 Testing ${endpoint.name}: ${endpoint.url}`)

            const response = await fetch(endpoint.url, {
              method: "GET",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "auth-token": authToken, // Use the authenticated token
                "User-Agent": "TravelCompositor-Client/1.0",
              },
            })

            const result = {
              configNumber,
              endpoint: endpoint.name,
              url: endpoint.url,
              status: response.status,
              success: response.ok,
              headers: Object.fromEntries(response.headers.entries()),
              data: null as any,
              error: null as any,
            }

            if (response.ok) {
              try {
                const data = await response.json()
                result.data = data
                console.log(`✅ ${endpoint.name} SUCCESS:`, data)
              } catch (jsonError) {
                const text = await response.text()
                result.data = text
                console.log(`✅ ${endpoint.name} SUCCESS (text):`, text.substring(0, 200))
              }
            } else {
              const errorText = await response.text()
              result.error = errorText
              console.log(`❌ ${endpoint.name}: ${response.status} - ${errorText.substring(0, 200)}`)
            }

            results.push(result)

            // If we found the booking, we can stop here
            if (response.ok && result.data) {
              console.log(`🎉 FOUND BOOKING using ${endpoint.name} with config ${configNumber}!`)
              return NextResponse.json({
                success: true,
                bookingId,
                method: endpoint.name,
                configUsed: configNumber,
                booking: result.data,
                message: `Found booking using authenticated ${endpoint.name}`,
                allResults: results,
              })
            }
          } catch (endpointError) {
            results.push({
              configNumber,
              endpoint: endpoint.name,
              url: endpoint.url,
              status: 0,
              success: false,
              error: endpointError instanceof Error ? endpointError.message : String(endpointError),
              data: null,
              headers: {},
            })
            console.log(`❌ ${endpoint.name} network error:`, endpointError)
          }
        }
      } catch (configError) {
        console.log(`❌ Config ${configNumber} failed:`, configError.message)
        results.push({
          configNumber,
          endpoint: "authentication",
          url: "N/A",
          status: 0,
          success: false,
          error: `Config ${configNumber} auth failed: ${configError.message}`,
          data: null,
          headers: {},
        })
      }
    }

    return NextResponse.json({
      success: false,
      bookingId,
      message: "Booking not found with any authenticated endpoint",
      results,
      workingEndpoints: results.filter((r) => r.success),
      summary: {
        totalTested: results.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        configsTested: configs.length,
      },
    })
  } catch (error) {
    console.error("❌ Authenticated booking search error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
