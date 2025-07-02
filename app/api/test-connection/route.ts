import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Test basic environment variables
    const configs = []

    if (process.env.TRAVEL_COMPOSITOR_USERNAME && process.env.TRAVEL_COMPOSITOR_PASSWORD) {
      configs.push({
        config: 1,
        username: process.env.TRAVEL_COMPOSITOR_USERNAME,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID,
        hasCredentials: true,
      })
    }

    if (process.env.TRAVEL_COMPOSITOR_USERNAME_2 && process.env.TRAVEL_COMPOSITOR_PASSWORD_2) {
      configs.push({
        config: 2,
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_2,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_2,
        hasCredentials: true,
      })
    }

    if (process.env.TRAVEL_COMPOSITOR_USERNAME_3 && process.env.TRAVEL_COMPOSITOR_PASSWORD_3) {
      configs.push({
        config: 3,
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_3,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3,
        hasCredentials: true,
      })
    }

    if (process.env.TRAVEL_COMPOSITOR_USERNAME_4 && process.env.TRAVEL_COMPOSITOR_PASSWORD_4) {
      configs.push({
        config: 4,
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_4,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_4,
        hasCredentials: true,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Connection test completed",
      availableConfigs: configs.length,
      configs: configs,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Connection test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
