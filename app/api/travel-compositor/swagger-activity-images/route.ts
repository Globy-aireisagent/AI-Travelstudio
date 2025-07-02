import { NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET() {
  try {
    console.log("🔍 Analyzing Swagger documentation for activity/ticket image endpoints...")

    const client = createTravelCompositorClient(1)
    await client.authenticate()

    // Get the Swagger documentation
    const response = await client.makeAuthenticatedRequest("/resources/swagger.json")

    if (!response.ok) {
      throw new Error(`Failed to fetch Swagger docs: ${response.status}`)
    }

    const swaggerDoc = await response.json()

    // Look for image-related endpoints
    const imageEndpoints = []
    const ticketEndpoints = []
    const activityEndpoints = []

    if (swaggerDoc.paths) {
      Object.keys(swaggerDoc.paths).forEach((path) => {
        const lowerPath = path.toLowerCase()

        // Look for image endpoints
        if (lowerPath.includes("image") || lowerPath.includes("photo") || lowerPath.includes("picture")) {
          imageEndpoints.push({
            path,
            methods: Object.keys(swaggerDoc.paths[path]),
            details: swaggerDoc.paths[path],
          })
        }

        // Look for ticket endpoints
        if (lowerPath.includes("ticket")) {
          ticketEndpoints.push({
            path,
            methods: Object.keys(swaggerDoc.paths[path]),
            details: swaggerDoc.paths[path],
          })
        }

        // Look for activity endpoints
        if (lowerPath.includes("activity") || lowerPath.includes("excursion") || lowerPath.includes("tour")) {
          activityEndpoints.push({
            path,
            methods: Object.keys(swaggerDoc.paths[path]),
            details: swaggerDoc.paths[path],
          })
        }
      })
    }

    // Look for definitions related to images
    const imageDefinitions = []
    if (swaggerDoc.definitions) {
      Object.keys(swaggerDoc.definitions).forEach((defName) => {
        const lowerDefName = defName.toLowerCase()
        if (lowerDefName.includes("image") || lowerDefName.includes("photo") || lowerDefName.includes("picture")) {
          imageDefinitions.push({
            name: defName,
            definition: swaggerDoc.definitions[defName],
          })
        }
      })
    }

    // Analyze ticket/activity definitions for image properties
    const ticketDefinitions = []
    if (swaggerDoc.definitions) {
      Object.keys(swaggerDoc.definitions).forEach((defName) => {
        const lowerDefName = defName.toLowerCase()
        if (
          lowerDefName.includes("ticket") ||
          lowerDefName.includes("activity") ||
          lowerDefName.includes("excursion")
        ) {
          const definition = swaggerDoc.definitions[defName]

          // Check if this definition has image-related properties
          const imageProperties = []
          if (definition.properties) {
            Object.keys(definition.properties).forEach((propName) => {
              const lowerPropName = propName.toLowerCase()
              if (
                lowerPropName.includes("image") ||
                lowerPropName.includes("photo") ||
                lowerPropName.includes("picture") ||
                lowerPropName.includes("url")
              ) {
                imageProperties.push({
                  name: propName,
                  type: definition.properties[propName].type,
                  description: definition.properties[propName].description,
                })
              }
            })
          }

          ticketDefinitions.push({
            name: defName,
            definition,
            imageProperties,
          })
        }
      })
    }

    return NextResponse.json({
      success: true,
      analysis: {
        totalEndpoints: Object.keys(swaggerDoc.paths || {}).length,
        imageEndpoints: {
          count: imageEndpoints.length,
          endpoints: imageEndpoints,
        },
        ticketEndpoints: {
          count: ticketEndpoints.length,
          endpoints: ticketEndpoints,
        },
        activityEndpoints: {
          count: activityEndpoints.length,
          endpoints: activityEndpoints,
        },
        imageDefinitions: {
          count: imageDefinitions.length,
          definitions: imageDefinitions,
        },
        ticketDefinitions: {
          count: ticketDefinitions.length,
          definitions: ticketDefinitions,
        },
      },
      recommendations: [
        "Check ticket endpoints for image URLs in response data",
        "Look for datasheet endpoints that might contain images",
        "Compare hotel image structure with ticket image structure",
        "Check if tickets have separate image gallery endpoints",
      ],
    })
  } catch (error) {
    console.error("❌ Swagger activity image analysis failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
