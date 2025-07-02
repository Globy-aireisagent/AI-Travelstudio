import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { bookingReference: string; transportBookingReference: string } },
) {
  try {
    const { bookingReference, transportBookingReference } = params
    console.log(`✈️ Cancelling transport: ${transportBookingReference} in booking: ${bookingReference}`)

    const client = createTravelCompositorClient(1)
    const token = await client.authenticate()

    // Make API call to Travel Compositor
    const response = await fetch(
      `${client.config.baseUrl}/booking/${bookingReference}/transports/${transportBookingReference}`,
      {
        method: "DELETE",
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Transport cancellation failed:", response.status, errorText)

      return NextResponse.json(
        {
          success: false,
          error: `Transport cancellation failed: ${response.status}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const cancelData = await response.json()
    console.log("✅ Transport cancellation successful")

    return NextResponse.json({
      success: true,
      bookingReference,
      transportBookingReference,
      data: cancelData,
      summary: {
        status: cancelData.status,
        cancellationDate: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("❌ Transport cancellation error:", error)

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
