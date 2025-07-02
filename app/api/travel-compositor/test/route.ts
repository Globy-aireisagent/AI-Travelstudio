import { createTravelCompositorClient, getAvailableConfigurations } from "@/lib/travel-compositor-client"

export async function GET(request: Request) {
  try {
    console.log("🚀 Starting Travel Compositor API test...")

    const url = new URL(request.url)
    const configParam = url.searchParams.get("config")
    const configNumber = configParam ? Number.parseInt(configParam) : undefined

    // Get available configurations
    const availableConfigs = getAvailableConfigurations()

    if (availableConfigs.length === 0) {
      return Response.json(
        {
          success: false,
          error: "No Travel Compositor configurations found",
          details: {
            message: "Please check your Vercel environment variables",
            availableConfigs: [],
          },
        },
        { status: 500 },
      )
    }

    // If specific config requested, test only that one
    if (configNumber) {
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
      const testResult = await client.testConnection()

      return Response.json({
        timestamp: new Date().toISOString(),
        configNumber,
        ...testResult,
      })
    }

    // Test all available configurations
    const results = []
    for (const config of availableConfigs) {
      try {
        const client = createTravelCompositorClient(config)
        const testResult = await client.testConnection()
        results.push({
          configNumber: config,
          ...testResult,
        })
      } catch (error) {
        results.push({
          configNumber: config,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    return Response.json({
      timestamp: new Date().toISOString(),
      availableConfigs,
      results,
      summary: {
        total: results.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
      },
    })
  } catch (error) {
    console.error("❌ Test failed:", error)

    return Response.json(
      {
        success: false,
        error: "Test failed",
        details: {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
      },
      { status: 500 },
    )
  }
}
