import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function POST(request: NextRequest) {
  try {
    console.log("✈️ Starting transport booking...")

    const body = await request.json()
    const { recommendationKey, externalReference, fakeBooking = false } = body

    // Validate required fields
    if (!recommendationKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: recommendationKey",
        },
        { status: 400 },
      )
    }

    const client = createTravelCompositorClient(1)
    const token = await client.authenticate()

    // Prepare request payload according to ApiTransportBookRequestVO
    const bookRequest = {
      transports: {
        recommendationKey,
      },
      ...(externalReference && { externalReference }),
      ...(fakeBooking && {
        fakeBooking: {
          fakeBooking: true,
        },
      }),
    }

    console.log("📋 Transport book request:", {
      recommendationKey,
      externalReference,
      fakeBooking,
    })

    // Make API call to Travel Compositor
    const response = await fetch(`${client.config.baseUrl}/booking/transports/book`, {
      method: "POST",
      headers: {
        "auth-token": token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(bookRequest),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Transport booking failed:", response.status, errorText)

      return NextResponse.json(
        {
          success: false,
          error: `Transport booking failed: ${response.status}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const bookingData = await response.json()
    console.log("✅ Transport booking successful:", {
      bookingReference: bookingData.bookingReference,
      status: bookingData.status,
    })

    return NextResponse.json({
      success: true,
      data: bookingData,
      summary: {
        bookingReference: bookingData.bookingReference,
        externalReference: bookingData.externalReference,
        status: bookingData.status,
        price: bookingData.price,
      },
    })
  } catch (error) {
    console.error("❌ Transport booking error:", error)

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
