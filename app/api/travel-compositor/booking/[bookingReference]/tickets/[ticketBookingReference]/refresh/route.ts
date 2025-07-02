import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function PUT(
  request: NextRequest,
  { params }: { params: { bookingReference: string; ticketBookingReference: string } },
) {
  try {
    const { bookingReference, ticketBookingReference } = params
    console.log(`🎫 Refreshing ticket booking: ${ticketBookingReference} in booking: ${bookingReference}`)

    const client = createTravelCompositorClient(1)
    const token = await client.authenticate()

    // Make API call to Travel Compositor
    const response = await fetch(
      `${client.config.baseUrl}/booking/${bookingReference}/tickets/${ticketBookingReference}`,
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
      console.error("❌ Ticket refresh failed:", response.status, errorText)

      return NextResponse.json(
        {
          success: false,
          error: `Ticket refresh failed: ${response.status}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const refreshData = await response.json()
    console.log("✅ Ticket refresh successful")

    return NextResponse.json({
      success: true,
      bookingReference,
      ticketBookingReference,
      data: refreshData,
      summary: {
        status: refreshData.status,
        externalReference: refreshData.externalReference,
      },
    })
  } catch (error) {
    console.error("❌ Ticket refresh error:", error)

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
