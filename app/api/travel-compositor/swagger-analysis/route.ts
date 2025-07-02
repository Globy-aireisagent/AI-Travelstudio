import { NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET() {
  try {
    console.log("🔍 Fetching Travel Compositor Swagger documentation...")

    const client = createTravelCompositorClient(1)
    await client.authenticate()

    // Try multiple possible Swagger endpoints
    const swaggerEndpoints = [
      "/swagger.json",
      "/api-docs",
      "/swagger/v1/swagger.json",
      "/resources/swagger.json",
      "/docs/swagger.json",
      "/swagger-ui.html",
      "/api/swagger.json",
      "/v1/api-docs",
      "/swagger/swagger.json",
    ]

    const results = []

    for (const endpoint of swaggerEndpoints) {
      try {
        console.log(`🧪 Trying: ${endpoint}`)
        const response = await client.makeAuthenticatedRequest(endpoint)

        if (response.ok) {
          const contentType = response.headers.get("content-type") || ""

          if (contentType.includes("application/json")) {
            const data = await response.json()
            results.push({
              endpoint,
              status: response.status,
              contentType,
              data,
              success: true,
            })
            console.log(`✅ Found Swagger at: ${endpoint}`)
          } else {
            const text = await response.text()
            results.push({
              endpoint,
              status: response.status,
              contentType,
              preview: text.substring(0, 500),
              success: true,
            })
          }
        } else {
          results.push({
            endpoint,
            status: response.status,
            error: `HTTP ${response.status}`,
            success: false,
          })
        }
      } catch (error) {
        results.push({
          endpoint,
          error: error instanceof Error ? error.message : String(error),
          success: false,
        })
      }
    }

    // Also try to discover endpoints by examining the base URL
    try {
      console.log("🔍 Trying base URL discovery...")
      const baseResponse = await client.makeAuthenticatedRequest("/")
      const baseText = await baseResponse.text()

      results.push({
        endpoint: "/ (base)",
        status: baseResponse.status,
        preview: baseText.substring(0, 1000),
        success: baseResponse.ok,
      })
    } catch (error) {
      console.error("Base URL discovery failed:", error)
    }

    // Try to get available resources/endpoints
    try {
      console.log("🔍 Trying resources discovery...")
      const resourcesResponse = await client.makeAuthenticatedRequest("/resources")
      const resourcesText = await resourcesResponse.text()

      results.push({
        endpoint: "/resources",
        status: resourcesResponse.status,
        preview: resourcesText.substring(0, 1000),
        success: resourcesResponse.ok,
      })
    } catch (error) {
      console.error("Resources discovery failed:", error)
    }

    return NextResponse.json({
      success: true,
      baseUrl: client.config.baseUrl,
      micrositeId: client.config.micrositeId,
      swaggerSearchResults: results,
      summary: {
        totalEndpointsTested: swaggerEndpoints.length,
        successfulEndpoints: results.filter((r) => r.success).length,
        foundSwaggerDocs: results.filter((r) => r.success && r.data).length,
      },
    })
  } catch (error) {
    console.error("❌ Swagger analysis failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
