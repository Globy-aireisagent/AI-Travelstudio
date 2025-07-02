import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const configParam = url.searchParams.get("config")
    const configNumber = configParam ? Number.parseInt(configParam) : 1

    console.log(`🔍 Fetching Swagger documentation - Config ${configNumber}`)

    const client = createTravelCompositorClient(configNumber)

    // First authenticate to get access
    await client.authenticate()

    // Try to fetch the Swagger/OpenAPI documentation
    const swaggerEndpoints = [
      "/api/swagger.json",
      "/api/swagger",
      "/api/docs",
      "/api/openapi.json",
      "/api",
      "/swagger.json",
      "/docs",
    ]

    for (const endpoint of swaggerEndpoints) {
      try {
        const response = await fetch(`https://online.travelcompositor.com${endpoint}`, {
          headers: {
            Accept: "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          return Response.json({
            success: true,
            endpoint,
            documentation: data,
            availableEndpoints: data.paths ? Object.keys(data.paths) : [],
          })
        }
      } catch (error) {
        continue
      }
    }

    // If no swagger docs found, try to explore the API structure
    const apiExploration = await client.exploreAPI()

    return Response.json({
      success: false,
      message: "No Swagger documentation found",
      apiExploration,
      testedEndpoints: swaggerEndpoints,
    })
  } catch (error) {
    console.error("❌ Swagger fetch failed:", error)
    return Response.json(
      {
        success: false,
        error: "Failed to fetch API documentation",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
