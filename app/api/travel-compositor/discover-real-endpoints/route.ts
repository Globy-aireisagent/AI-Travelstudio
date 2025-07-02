import { NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function POST() {
  try {
    console.log("🔍 Discovering real API endpoints from Swagger...")

    const client = createTravelCompositorClient(4)
    await client.authenticate()

    const results = {
      swaggerEndpoints: [],
      imageRelatedEndpoints: [],
      activityEndpoints: [],
      workingEndpoints: [],
      endpointAnalysis: {},
    }

    // First, get the Swagger documentation
    try {
      console.log("📋 Fetching Swagger documentation...")
      const swaggerResponse = await client.makeAuthenticatedRequest("/swagger.json")

      if (swaggerResponse.ok) {
        const swaggerData = await swaggerResponse.json()

        // Extract all endpoints from Swagger
        const paths = swaggerData.paths || {}

        for (const [path, methods] of Object.entries(paths)) {
          const pathStr = path as string

          // Collect all endpoints
          results.swaggerEndpoints.push(pathStr)

          // Look for image-related endpoints
          if (
            pathStr.toLowerCase().includes("image") ||
            pathStr.toLowerCase().includes("photo") ||
            pathStr.toLowerCase().includes("gallery") ||
            pathStr.toLowerCase().includes("media") ||
            pathStr.toLowerCase().includes("picture")
          ) {
            results.imageRelatedEndpoints.push(pathStr)
          }

          // Look for activity/ticket related endpoints
          if (
            pathStr.toLowerCase().includes("ticket") ||
            pathStr.toLowerCase().includes("activity") ||
            pathStr.toLowerCase().includes("excursion") ||
            pathStr.toLowerCase().includes("tour") ||
            pathStr.toLowerCase().includes("service")
          ) {
            results.activityEndpoints.push(pathStr)
          }
        }

        console.log(`📊 Found ${results.swaggerEndpoints.length} total endpoints`)
        console.log(`🖼️ Found ${results.imageRelatedEndpoints.length} image-related endpoints`)
        console.log(`🎯 Found ${results.activityEndpoints.length} activity-related endpoints`)
      } else {
        console.log("❌ Could not fetch Swagger documentation")
      }
    } catch (error) {
      console.log("❌ Error fetching Swagger:", error)
    }

    // Test some of the discovered endpoints to see which ones work
    const endpointsToTest = [
      ...results.imageRelatedEndpoints.slice(0, 5), // Test first 5 image endpoints
      ...results.activityEndpoints.slice(0, 5), // Test first 5 activity endpoints
      "/bookings", // We know this works
      "/hotels", // Test if this exists
      "/cars", // Test if this exists
    ]

    for (const endpoint of endpointsToTest) {
      try {
        console.log(`🧪 Testing endpoint: ${endpoint}`)
        const response = await client.makeAuthenticatedRequest(endpoint)

        const endpointResult = {
          endpoint,
          status: response.status,
          success: response.ok,
          contentType: response.headers.get("content-type"),
        }

        if (response.ok) {
          try {
            const data = await response.json()
            endpointResult.hasData = true
            endpointResult.dataKeys = Object.keys(data).slice(0, 10) // First 10 keys
            endpointResult.sampleData = JSON.stringify(data).substring(0, 500) // First 500 chars
          } catch {
            endpointResult.hasData = false
          }
        }

        results.workingEndpoints.push(endpointResult)
      } catch (error) {
        results.workingEndpoints.push({
          endpoint,
          status: "error",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    // Analyze patterns
    results.endpointAnalysis = {
      totalEndpoints: results.swaggerEndpoints.length,
      imageEndpoints: results.imageRelatedEndpoints.length,
      activityEndpoints: results.activityEndpoints.length,
      workingEndpoints: results.workingEndpoints.filter((e) => e.success).length,
      patterns: {
        hasImageService: results.imageRelatedEndpoints.length > 0,
        hasActivityService: results.activityEndpoints.length > 0,
        commonImagePatterns: results.imageRelatedEndpoints.filter(
          (e) => e.includes("/images") || e.includes("/gallery") || e.includes("/media"),
        ),
        commonActivityPatterns: results.activityEndpoints.filter(
          (e) => e.includes("/tickets") || e.includes("/activities") || e.includes("/services"),
        ),
      },
    }

    return NextResponse.json({
      success: true,
      results,
      insights: [
        `Found ${results.swaggerEndpoints.length} total API endpoints`,
        `${results.imageRelatedEndpoints.length} endpoints might contain images`,
        `${results.activityEndpoints.length} endpoints are activity-related`,
        `${results.workingEndpoints.filter((e) => e.success).length} endpoints responded successfully`,
        "This will help us understand the real API structure for activities",
      ],
    })
  } catch (error) {
    console.error("❌ Endpoint discovery failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
