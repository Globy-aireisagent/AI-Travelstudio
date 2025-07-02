import { NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function POST(request: Request) {
  try {
    const { ticketId, ticketName } = await request.json()

    console.log(`🔍 Searching for images for activity: ${ticketName} (ID: ${ticketId})`)

    const client = createTravelCompositorClient(4)
    await client.authenticate()

    const results = {
      ticketId,
      ticketName,
      imageSearchResults: [],
      endpointsTried: [],
      potentialImageSources: [],
    }

    // Try different endpoints that might contain activity images
    const endpointsToTry = [
      `/tickets/${ticketId}`,
      `/tickets/${ticketId}/details`,
      `/tickets/${ticketId}/datasheet`,
      `/tickets/${ticketId}/images`,
      `/tickets/${ticketId}/gallery`,
      `/tickets/${ticketId}/media`,
      `/activities/${ticketId}`,
      `/activities/${ticketId}/images`,
      `/excursions/${ticketId}`,
      `/excursions/${ticketId}/images`,
      `/services/${ticketId}`,
      `/services/${ticketId}/images`,
    ]

    for (const endpoint of endpointsToTry) {
      try {
        console.log(`🔍 Trying endpoint: ${endpoint}`)
        const response = await client.makeAuthenticatedRequest(endpoint)

        results.endpointsTried.push({
          endpoint,
          status: response.status,
          success: response.ok,
        })

        if (response.ok) {
          const data = await response.json()

          // Search for image-related content in the response
          const imageContent = findImageContent(data)

          if (imageContent.length > 0) {
            results.imageSearchResults.push({
              endpoint,
              imageContent,
              fullData: data,
            })
          }
        }
      } catch (error) {
        results.endpointsTried.push({
          endpoint,
          status: "error",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    // Try searching by activity name in general endpoints
    const searchEndpoints = [
      `/search?q=${encodeURIComponent(ticketName)}`,
      `/search/activities?q=${encodeURIComponent(ticketName)}`,
      `/search/images?q=${encodeURIComponent(ticketName)}`,
    ]

    for (const endpoint of searchEndpoints) {
      try {
        console.log(`🔍 Trying search endpoint: ${endpoint}`)
        const response = await client.makeAuthenticatedRequest(endpoint)

        results.endpointsTried.push({
          endpoint,
          status: response.status,
          success: response.ok,
        })

        if (response.ok) {
          const data = await response.json()
          const imageContent = findImageContent(data)

          if (imageContent.length > 0) {
            results.imageSearchResults.push({
              endpoint,
              imageContent,
              fullData: data,
            })
          }
        }
      } catch (error) {
        results.endpointsTried.push({
          endpoint,
          status: "error",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    // Analyze patterns from successful hotel/car image endpoints
    results.potentialImageSources = [
      "Check if activities have separate image service endpoints",
      "Look for supplier-specific image APIs",
      "Check if images are stored in external CDN with predictable URLs",
      "Verify if datasheet endpoints contain image references",
      "Check if there's a general media/assets endpoint",
      "Look for image URLs in activity descriptions or metadata",
    ]

    return NextResponse.json({
      success: true,
      results,
      recommendations: [
        "Activities might use different endpoint structure than hotels/cars",
        "Images could be stored in supplier-specific endpoints",
        "Check if there's a separate media service for activity images",
        "Look for image URLs embedded in activity descriptions",
        "Consider using external image search APIs as fallback",
      ],
    })
  } catch (error) {
    console.error("❌ Activity image search failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

function findImageContent(data: any): any[] {
  const imageContent = []

  function searchObject(obj: any, path = "") {
    if (typeof obj !== "object" || obj === null) return

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key
      const lowerKey = key.toLowerCase()

      // Check if this field might contain images
      if (
        lowerKey.includes("image") ||
        lowerKey.includes("photo") ||
        lowerKey.includes("picture") ||
        lowerKey.includes("gallery") ||
        lowerKey.includes("media") ||
        (lowerKey.includes("url") &&
          typeof value === "string" &&
          (value.includes(".jpg") ||
            value.includes(".jpeg") ||
            value.includes(".png") ||
            value.includes(".gif") ||
            value.includes(".webp")))
      ) {
        imageContent.push({
          field: key,
          path: currentPath,
          value: value,
          type: typeof value,
          isArray: Array.isArray(value),
        })
      }

      // Recursively search nested objects and arrays
      if (typeof value === "object") {
        searchObject(value, currentPath)
      }
    }
  }

  searchObject(data)
  return imageContent
}
