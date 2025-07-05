import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json({
        success: false,
        error: "Booking ID is required",
      })
    }

    console.log(`📋 Testing booking import for: ${bookingId}`)

    // Authenticeer eerst
    const credentials = {
      username: process.env.TRAVEL_COMPOSITOR_USERNAME!,
      password: process.env.TRAVEL_COMPOSITOR_PASSWORD!,
      micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!,
    }

    const authResponse = await fetch("https://online.travelcompositor.com/resources/authentication/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(credentials),
    })

    if (!authResponse.ok) {
      throw new Error(`Authentication failed: ${authResponse.status}`)
    }

    const authData = await authResponse.json()
    const token = authData.token

    // Probeer booking te vinden
    const cleanBookingId = bookingId.replace(/^RRP-?/i, "")
    const idsToTry = [bookingId, cleanBookingId]

    for (const idToTry of idsToTry) {
      const endpoints = [
        `https://online.travelcompositor.com/resources/booking/${credentials.micrositeId}/${idToTry}`,
        `https://online.travelcompositor.com/resources/booking/getBooking?microsite=${credentials.micrositeId}&bookingId=${idToTry}`,
        `https://online.travelcompositor.com/resources/booking/${idToTry}?microsite=${credentials.micrositeId}`,
      ]

      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Trying endpoint: ${endpoint}`)

          const response = await fetch(endpoint, {
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          })

          if (response.ok) {
            const data = await response.json()
            console.log("📊 Booking data received:", data)

            if (data && (data.id || data.bookingReference || data.bookingId)) {
              console.log(`✅ Found booking ${bookingId} in Newreisplan!`)

              return NextResponse.json({
                success: true,
                data: {
                  id: data.id || bookingId,
                  bookingReference: data.bookingReference || data.id || bookingId,
                  title: data.title || data.name || `Booking ${bookingId}`,
                  client: {
                    name: data.client?.name || data.clientName || "Unknown Client",
                    email: data.client?.email || data.clientEmail || "",
                  },
                  destination: data.destination || "Unknown Destination",
                  startDate: data.startDate || data.departureDate,
                  status: data.status || "Confirmed",
                  totalPrice: data.totalPrice?.amount || data.totalPrice || 0,
                  foundVia: endpoint,
                  micrositeId: credentials.micrositeId,
                },
              })
            }
          } else {
            console.log(`❌ Endpoint failed: ${response.status}`)
          }
        } catch (error) {
          console.log(`⚠️ Endpoint error: ${error}`)
          continue
        }
      }
    }

    return NextResponse.json({
      success: false,
      error: `Booking ${bookingId} not found in Newreisplan microsite`,
      debug: {
        triedIds: idsToTry,
        micrositeId: credentials.micrositeId,
      },
    })
  } catch (error) {
    console.error("❌ Booking test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
