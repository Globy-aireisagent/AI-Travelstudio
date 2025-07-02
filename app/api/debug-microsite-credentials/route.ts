import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🔍 Debugging microsite credentials...")

    const configs = [
      {
        name: "Primary (Config 1)",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID,
        hasPassword: !!process.env.TRAVEL_COMPOSITOR_PASSWORD,
      },
      {
        name: "Secondary (Config 2)",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_2,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_2,
        hasPassword: !!process.env.TRAVEL_COMPOSITOR_PASSWORD_2,
      },
      {
        name: "Tertiary (Config 3)",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_3,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3,
        hasPassword: !!process.env.TRAVEL_COMPOSITOR_PASSWORD_3,
      },
      {
        name: "Quaternary (Config 4)",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_4,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_4,
        hasPassword: !!process.env.TRAVEL_COMPOSITOR_PASSWORD_4,
      },
    ]

    return NextResponse.json({
      success: true,
      configs: configs.map((config) => ({
        name: config.name,
        username: config.username ? `${config.username.substring(0, 3)}***` : "MISSING",
        micrositeId: config.micrositeId || "MISSING",
        hasPassword: config.hasPassword,
        isComplete: !!(config.username && config.micrositeId && config.hasPassword),
      })),
      workingClientInfo: {
        note: "The working /api/list-available-bookings uses createTravelCompositorClient(1)",
        likelyUses: "TRAVEL_COMPOSITOR_USERNAME + TRAVEL_COMPOSITOR_PASSWORD + TRAVEL_COMPOSITOR_MICROSITE_ID",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
