import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Debug 500 endpoint called")

    // Test environment variables
    const envTest = {
      config1: {
        username: !!process.env.TRAVEL_COMPOSITOR_USERNAME,
        password: !!process.env.TRAVEL_COMPOSITOR_PASSWORD,
        micrositeId: !!process.env.TRAVEL_COMPOSITOR_MICROSITE_ID,
      },
      config2: {
        username: !!process.env.TRAVEL_COMPOSITOR_USERNAME_2,
        password: !!process.env.TRAVEL_COMPOSITOR_PASSWORD_2,
        micrositeId: !!process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_2,
      },
      config3: {
        username: !!process.env.TRAVEL_COMPOSITOR_USERNAME_3,
        password: !!process.env.TRAVEL_COMPOSITOR_PASSWORD_3,
        micrositeId: !!process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3,
      },
    }

    // Test basic imports
    let importTest = {}
    try {
      const { createTravelCompositorClient } = await import("@/lib/travel-compositor-client")
      importTest = { createTravelCompositorClient: "✅ OK" }
    } catch (importError) {
      importTest = {
        createTravelCompositorClient: `❌ ${importError instanceof Error ? importError.message : String(importError)}`,
      }
    }

    // Test basic client creation
    let clientTest = {}
    try {
      const { createTravelCompositorClient } = await import("@/lib/travel-compositor-client")
      const client = createTravelCompositorClient(1)
      clientTest = { creation: "✅ OK", type: typeof client }
    } catch (clientError) {
      clientTest = {
        creation: `❌ ${clientError instanceof Error ? clientError.message : String(clientError)}`,
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tests: {
        environmentVariables: envTest,
        imports: importTest,
        clientCreation: clientTest,
      },
      message: "Debug endpoint working - no 500 error here!",
    })
  } catch (error) {
    console.error("❌ Debug endpoint error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
