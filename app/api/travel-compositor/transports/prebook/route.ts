import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function POST(request: NextRequest) {
  try {
    console.log("✈️ Starting transport prebooking...")

    const body = await request.json()
    const { transports, persons } = body

    // Validate required fields
    if (!transports) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: transports",
        },
        { status: 400 },
      )
    }

    const client = createTravelCompositorClient(1)
    const token = await client.authenticate()

    // Prepare request payload according to ApiTransportPrebookRequestVO
    const prebookRequest = {
      transports,
      ...(persons && { persons }),
    }

    console.log("📋 Transport prebook request:", {
      hasTransports: !!transports,
      personsCount: persons?.length || 0,
    })

    // Make API call to Travel Compositor
    const response = await fetch(`${client.config.baseUrl}/booking/transports/prebook`, {
      method: "POST",
      headers: {
        "auth-token": token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(prebookRequest),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Transport prebooking failed:", response.status, errorText)

      return NextResponse.json(
        {
          success: false,
          error: `Transport prebooking failed: ${response.status}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const prebookData = await response.json()
    console.log("✅ Transport prebooking successful")

    return NextResponse.json({
      success: true,
      data: prebookData,
      summary: {
        warnings: prebookData.warnings?.length || 0,
        price: prebookData.price,
        distributions: prebookData.distributions?.length || 0,
      },
    })
  } catch (error) {
    console.error("❌ Transport prebooking error:", error)

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
