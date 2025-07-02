import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function POST(request: NextRequest) {
  try {
    console.log("✈️ Starting transport confirmation...")

    const body = await request.json()
    const { transports } = body

    // Validate required fields
    if (!transports || !Array.isArray(transports)) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: transports (array)",
        },
        { status: 400 },
      )
    }

    const client = createTravelCompositorClient(1)
    const token = await client.authenticate()

    // Prepare request payload according to ApiTransportConfirmRequestVO
    const confirmRequest = {
      transports: transports.map((transport: any) => ({
        ...transport,
      })),
    }

    console.log("📋 Transport confirm request:", {
      transportsCount: transports.length,
    })

    // Make API call to Travel Compositor
    const response = await fetch(`${client.config.baseUrl}/booking/transports/confirm`, {
      method: "POST",
      headers: {
        "auth-token": token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(confirmRequest),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Transport confirmation failed:", response.status, errorText)

      return NextResponse.json(
        {
          success: false,
          error: `Transport confirmation failed: ${response.status}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const confirmData = await response.json()
    console.log("✅ Transport confirmation successful")

    return NextResponse.json({
      success: true,
      data: confirmData,
      summary: {
        warnings: confirmData.warnings?.length || 0,
        requiredFields: confirmData.requiredField ? 1 : 0,
        price: confirmData.price,
      },
    })
  } catch (error) {
    console.error("❌ Transport confirmation error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
