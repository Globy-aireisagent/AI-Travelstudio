import { createTravelCompositorClient, getAvailableConfigurations } from "@/lib/travel-compositor-client"

export async function GET(request: Request) {
  try {
    console.log("🔍 Starting Travel Compositor endpoint discovery...")

    const url = new URL(request.url)
    const configParam = url.searchParams.get("config")
    const configNumber = configParam ? Number.parseInt(configParam) : 1

    // Get available configurations
    const availableConfigs = getAvailableConfigurations()

    if (!availableConfigs.includes(configNumber)) {
      return Response.json(
        {
          success: false,
          error: `Configuration ${configNumber} not available`,
          availableConfigs,
        },
        { status: 400 },
      )
    }

    const client = createTravelCompositorClient(configNumber)
    const discoveryResult = await client.discoverEndpoints()

    return Response.json({
      timestamp: new Date().toISOString(),
      configNumber,
      ...discoveryResult,
    })
  } catch (error) {
    console.error("❌ Discovery failed:", error)

    return Response.json(
      {
        success: false,
        error: "Discovery failed",
        details: {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
      },
      { status: 500 },
    )
  }
}
