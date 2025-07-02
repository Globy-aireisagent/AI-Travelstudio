import type { NextRequest } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const configNumber = Number.parseInt(searchParams.get("config") || "1")

    console.log("🔍 DISCOVERING ALL AVAILABLE SCHEMAS AND ENDPOINTS")
    console.log("📋 Using config:", configNumber)

    const client = createTravelCompositorClient(configNumber)
    console.log("🔗 Base URL:", client.config.baseUrl)

    // Get the full Swagger/OpenAPI specification
    const swaggerUrl = "/resources/swagger.json"
    console.log("📡 Fetching Swagger from:", `${client.config.baseUrl}${swaggerUrl}`)

    const swaggerResponse = await client.makeAuthenticatedRequest(swaggerUrl)
    console.log("📊 Swagger Response Status:", swaggerResponse.status)
    console.log("📊 Swagger Response Headers:", Object.fromEntries(swaggerResponse.headers.entries()))

    if (!swaggerResponse.ok) {
      const errorText = await swaggerResponse.text()
      console.error("❌ Swagger Error Response:", errorText)
      throw new Error(`Failed to get Swagger docs: ${swaggerResponse.status} - ${errorText}`)
    }

    const swaggerSpec = await swaggerResponse.json()
    console.log("📋 Swagger spec keys:", Object.keys(swaggerSpec))
    console.log("📋 Components keys:", Object.keys(swaggerSpec.components || {}))
    console.log("📋 Schemas count:", Object.keys(swaggerSpec.components?.schemas || {}).length)
    console.log("📋 Paths count:", Object.keys(swaggerSpec.paths || {}).length)

    // Log first few schema names for debugging
    const schemaNames = Object.keys(swaggerSpec.components?.schemas || {})
    console.log("📋 First 10 schema names:", schemaNames.slice(0, 10))

    // Extract all schemas
    const schemas = swaggerSpec.components?.schemas || {}
    const paths = swaggerSpec.paths || {}

    console.log("🔍 Processing", Object.keys(schemas).length, "schemas...")
    console.log("🔍 Processing", Object.keys(paths).length, "paths...")

    // Rest of the existing code...
    const schemaAnalysis = Object.entries(schemas).map(([name, schema]: [string, any]) => {
      const properties = schema.properties || {}
      const propertyCount = Object.keys(properties).length

      return {
        name,
        type: schema.type || "object",
        description: schema.description || null,
        propertyCount,
        properties: Object.keys(properties),
        hasArrays: Object.values(properties).some((prop: any) => prop.type === "array"),
        hasObjects: Object.values(properties).some((prop: any) => prop.type === "object" || prop.$ref),
        hasEnums: Object.values(properties).some((prop: any) => prop.enum),
        required: schema.required || [],
        example: schema.example || null,
      }
    })

    console.log("✅ Schema analysis complete:", schemaAnalysis.length, "schemas processed")

    // Find destination-related schemas
    const destinationSchemas = schemaAnalysis.filter(
      (s) =>
        s.name.toLowerCase().includes("destination") ||
        s.name.toLowerCase().includes("place") ||
        s.name.toLowerCase().includes("location"),
    )

    console.log(
      "🎯 Found destination schemas:",
      destinationSchemas.map((s) => s.name),
    )

    // Find hotel-related schemas
    const hotelSchemas = schemaAnalysis.filter(
      (s) =>
        s.name.toLowerCase().includes("hotel") ||
        s.name.toLowerCase().includes("accommodation") ||
        s.name.toLowerCase().includes("room"),
    )

    console.log(
      "🏨 Found hotel schemas:",
      hotelSchemas.map((s) => s.name),
    )

    // Find booking-related schemas
    const bookingSchemas = schemaAnalysis.filter(
      (s) =>
        s.name.toLowerCase().includes("booking") ||
        s.name.toLowerCase().includes("trip") ||
        s.name.toLowerCase().includes("reservation") ||
        s.name.toLowerCase().includes("holiday") ||
        s.name.toLowerCase().includes("package"),
    )

    console.log(
      "📅 Found booking schemas:",
      bookingSchemas.map((s) => s.name),
    )

    // Analyze endpoints
    const endpointAnalysis = Object.entries(paths).map(([path, methods]: [string, any]) => {
      const methodList = Object.keys(methods)
      const hasParameters = methodList.some((method) => methods[method].parameters?.length > 0)
      const hasResponses = methodList.some((method) => Object.keys(methods[method].responses || {}).length > 0)

      return {
        path,
        methods: methodList,
        hasParameters,
        hasResponses,
        tags: methods[methodList[0]]?.tags || [],
        summary: methods[methodList[0]]?.summary || null,
        operationId: methods[methodList[0]]?.operationId || null,
      }
    })

    console.log("🛣️ Endpoint analysis complete:", endpointAnalysis.length, "endpoints processed")

    // Find destination endpoints
    const destinationEndpoints = endpointAnalysis.filter(
      (e) => e.path.includes("destination") || e.tags.some((tag: string) => tag.toLowerCase().includes("destination")),
    )

    console.log(
      "🎯 Found destination endpoints:",
      destinationEndpoints.map((e) => e.path),
    )

    // Find hotel endpoints
    const hotelEndpoints = endpointAnalysis.filter(
      (e) =>
        e.path.includes("hotel") ||
        e.path.includes("accommodation") ||
        e.tags.some(
          (tag: string) => tag.toLowerCase().includes("hotel") || tag.toLowerCase().includes("accommodation"),
        ),
    )

    console.log(
      "🏨 Found hotel endpoints:",
      hotelEndpoints.map((e) => e.path),
    )

    const result = {
      success: true,
      debug: {
        swaggerUrl: `${client.config.baseUrl}${swaggerUrl}`,
        totalSchemasFound: Object.keys(schemas).length,
        totalPathsFound: Object.keys(paths).length,
        schemaNames: schemaNames.slice(0, 20),
        samplePaths: Object.keys(paths).slice(0, 10),
      },
      analysis: {
        totalSchemas: schemaAnalysis.length,
        totalEndpoints: endpointAnalysis.length,
        destinationSchemas: destinationSchemas.length,
        hotelSchemas: hotelSchemas.length,
        bookingSchemas: bookingSchemas.length,
        destinationEndpoints: destinationEndpoints.length,
        hotelEndpoints: hotelEndpoints.length,
      },
      schemas: {
        all: schemaAnalysis.slice(0, 50), // Limit for readability
        destinations: destinationSchemas,
        hotels: hotelSchemas,
        bookings: bookingSchemas,
      },
      endpoints: {
        destinations: destinationEndpoints,
        hotels: hotelEndpoints,
        sample: endpointAnalysis.slice(0, 20),
      },
      rawSwaggerUrl: `${client.config.baseUrl}/v3/api-docs`,
      note: "🔍 Complete schema and endpoint discovery from Travel Compositor API",
    }

    console.log("✅ Final result analysis:", result.analysis)
    return Response.json(result)
  } catch (error) {
    console.error("❌ Schema Discovery Error:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        debug: {
          errorType: error?.constructor?.name,
          errorStack: error instanceof Error ? error.stack : null,
        },
      },
      { status: 500 },
    )
  }
}
