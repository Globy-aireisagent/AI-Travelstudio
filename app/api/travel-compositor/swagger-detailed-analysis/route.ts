import { NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET() {
  try {
    console.log("🔍 Analyzing Travel Compositor Swagger documentation in detail...")

    const client = createTravelCompositorClient(1)
    await client.authenticate()

    // Get the Swagger documentation
    const response = await client.makeAuthenticatedRequest("/resources/swagger.json")

    if (!response.ok) {
      throw new Error(`Failed to fetch Swagger docs: ${response.status}`)
    }

    const swaggerDoc = await response.json()

    // Analyze the Swagger documentation
    const analysis = {
      info: swaggerDoc.info || {},
      basePath: swaggerDoc.basePath || "",
      host: swaggerDoc.host || "",
      schemes: swaggerDoc.schemes || [],
      paths: {},
      bookingEndpoints: [],
      allEndpoints: [],
      parameters: {},
      definitions: {},
    }

    // Extract all paths and analyze them
    if (swaggerDoc.paths) {
      analysis.paths = swaggerDoc.paths
      analysis.allEndpoints = Object.keys(swaggerDoc.paths)

      // Find booking-related endpoints
      analysis.bookingEndpoints = Object.keys(swaggerDoc.paths).filter((path) => path.toLowerCase().includes("booking"))
    }

    // Extract definitions/models
    if (swaggerDoc.definitions) {
      analysis.definitions = swaggerDoc.definitions
    }

    // Analyze booking endpoints in detail
    const bookingEndpointDetails = {}
    for (const endpoint of analysis.bookingEndpoints) {
      const pathInfo = swaggerDoc.paths[endpoint]
      bookingEndpointDetails[endpoint] = {
        methods: Object.keys(pathInfo),
        details: pathInfo,
      }
    }

    // Look for getBookings specifically
    const getBookingsEndpoints = Object.keys(swaggerDoc.paths || {}).filter(
      (path) => path.toLowerCase().includes("getbookings") || path.toLowerCase().includes("get-bookings"),
    )

    return NextResponse.json({
      success: true,
      swaggerInfo: {
        title: swaggerDoc.info?.title,
        version: swaggerDoc.info?.version,
        description: swaggerDoc.info?.description,
      },
      apiStructure: {
        basePath: analysis.basePath,
        host: analysis.host,
        schemes: analysis.schemes,
        totalEndpoints: analysis.allEndpoints.length,
        bookingEndpoints: analysis.bookingEndpoints.length,
      },
      bookingEndpoints: analysis.bookingEndpoints,
      bookingEndpointDetails,
      getBookingsEndpoints,
      allEndpoints: analysis.allEndpoints,
      rawSwaggerDoc: swaggerDoc, // Include full doc for detailed inspection
    })
  } catch (error) {
    console.error("❌ Detailed Swagger analysis failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
