import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function PUT(
  request: NextRequest,
  { params }: { params: { bookingReference: string; transportBookingReference: string } },
) {
  try {
    const { bookingReference, transportBookingReference } = params
    console.log(`✈️ Refreshing transport booking: ${transportBookingReference} in booking: ${bookingReference}`)

    const client = createTravelCompositorClient(1)
    const token = await client.authenticate()

    // Make API call to Travel Compositor
    const response = await fetch(
      `${client.config.baseUrl}/booking/${bookingReference}/transports/${transportBookingReference}`,
      {
        method: "PUT",
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Transport refresh failed:", response.status, errorText)

      return NextResponse.json(
        {
          success: false,
          error: `Transport refresh failed: ${response.status}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const refreshData = await response.json()
    console.log("✅ Transport refresh successful")

    return NextResponse.json({
      success: true,
      bookingReference,
      transportBookingReference,
      data: refreshData,
      summary: {
        status: refreshData.status,
        externalReference: refreshData.externalReference,
      },
    })
  } catch (error) {
    console.error("❌ Transport refresh error:", error)

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
