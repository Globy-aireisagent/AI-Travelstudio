import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    console.log("🧪 Simple test starting...")

    // Test 1: Client creation
    const client = createTravelCompositorClient(1)
    console.log("✅ Client created successfully")

    // Test 2: Authentication
    const token = await client.authenticate()
    console.log("✅ Authentication successful, token length:", token.length)

    // Test 3: Simple fetch test
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!
    const testEndpoint = `/resources/booking/getBookings?microsite=${micrositeId}&from=20250601&to=20250630`

    console.log("🧪 Testing endpoint:", testEndpoint)

    const response = await fetch(`https://online.travelcompositor.com${testEndpoint}`, {
      headers: {
        "auth-token": token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    console.log("📡 Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API call failed: ${response.status} - ${errorText}`)
    }

    const responseText = await response.text()
    console.log("📄 Response length:", responseText.length)

    if (responseText.trim().length === 0) {
      throw new Error("Empty response from API")
    }

    const data = JSON.parse(responseText)
    const bookings = data.bookedTrip || data.bookings || data || []

    console.log("✅ Found bookings:", bookings.length)

    // Test 4: Search for RRP-9236
    const targetBooking = bookings.find(
      (b: any) => b.id === "RRP-9236" || b.bookingReference === "RRP-9236" || b.reference === "RRP-9236",
    )

    const searchTime = `${Date.now() - startTime}ms`

    return NextResponse.json({
      success: true,
      searchTime,
      tests: {
        clientCreation: "✅ OK",
        authentication: "✅ OK",
        apiCall: "✅ OK",
        dataProcessing: "✅ OK",
      },
      results: {
        totalBookings: bookings.length,
        targetBookingFound: !!targetBooking,
        targetBooking: targetBooking || null,
        sampleBookings: bookings.slice(0, 5).map((b: any) => ({
          id: b.id,
          reference: b.reference || b.bookingReference,
          status: b.status,
        })),
      },
      endpoint: testEndpoint,
      micrositeId,
    })
  } catch (error) {
    const searchTime = `${Date.now() - startTime}ms`
    console.error("❌ Simple test error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        searchTime,
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
