import { NextResponse } from "next/server"

export async function GET() {
  try {
    const microsites = []

    // Check which microsites are available based on environment variables
    if (
      process.env.TRAVEL_COMPOSITOR_USERNAME &&
      process.env.TRAVEL_COMPOSITOR_PASSWORD &&
      process.env.TRAVEL_COMPOSITOR_MICROSITE_ID
    ) {
      microsites.push({
        id: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID,
        name: "Primary Microsite",
        code: "CONFIG1",
        configNumber: 1,
        username: process.env.TRAVEL_COMPOSITOR_USERNAME,
      })
    }

    if (
      process.env.TRAVEL_COMPOSITOR_USERNAME_2 &&
      process.env.TRAVEL_COMPOSITOR_PASSWORD_2 &&
      process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_2
    ) {
      microsites.push({
        id: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_2,
        name: "Secondary Microsite",
        code: "CONFIG2",
        configNumber: 2,
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_2,
      })
    }

    if (
      process.env.TRAVEL_COMPOSITOR_USERNAME_3 &&
      process.env.TRAVEL_COMPOSITOR_PASSWORD_3 &&
      process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3
    ) {
      microsites.push({
        id: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3,
        name: "Tertiary Microsite",
        code: "CONFIG3",
        configNumber: 3,
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_3,
      })
    }

    if (
      process.env.TRAVEL_COMPOSITOR_USERNAME_4 &&
      process.env.TRAVEL_COMPOSITOR_PASSWORD_4 &&
      process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_4
    ) {
      microsites.push({
        id: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_4,
        name: "Quaternary Microsite",
        code: "CONFIG4",
        configNumber: 4,
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_4,
      })
    }

    return NextResponse.json({
      success: true,
      microsites,
      total: microsites.length,
    })
  } catch (error) {
    console.error("❌ Get microsites error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get microsites",
        microsites: [],
      },
      { status: 500 },
    )
  }
}
