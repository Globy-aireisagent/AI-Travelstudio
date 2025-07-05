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

    // Probeer verschillende variaties van het booking ID
    const originalId = bookingId.toString()
    const cleanId = originalId.replace(/^(RRP-?|NRP-?)/i, "")
    const withRRP = `RRP-${cleanId}`
    const withNRP = `NRP-${cleanId}`

    const idsToTry = [originalId, cleanId, withRRP, withNRP]

    console.log(`🔍 Trying booking IDs: ${idsToTry.join(", ")}`)

    // Probeer verschillende endpoints voor elke ID variant
    for (const idToTry of idsToTry) {
      const endpoints = [
        // Direct booking lookup
        `https://online.travelcompositor.com/resources/booking/${credentials.micrositeId}/${idToTry}`,

        // Search endpoints
        `https://online.travelcompositor.com/resources/booking/${credentials.micrositeId}?bookingReference=${encodeURIComponent(idToTry)}&first=0&limit=1`,
        `https://online.travelcompositor.com/resources/booking/${credentials.micrositeId}?bookingId=${encodeURIComponent(idToTry)}&first=0&limit=1`,
        `https://online.travelcompositor.com/resources/booking/${credentials.micrositeId}?id=${encodeURIComponent(idToTry)}&first=0&limit=1`,

        // Alternative formats
        `https://online.travelcompositor.com/resources/booking/getBooking?microsite=${credentials.micrositeId}&bookingId=${encodeURIComponent(idToTry)}`,
        `https://online.travelcompositor.com/resources/booking/${idToTry}?microsite=${credentials.micrositeId}`,

        // Search in all bookings (last resort)
        `https://online.travelcompositor.com/resources/booking/${credentials.micrositeId}?first=0&limit=100`,
      ]

      for (const [index, endpoint] of endpoints.entries()) {
        try {
          console.log(`🔍 Trying endpoint ${index + 1}/${endpoints.length}: ${endpoint}`)

          const response = await fetch(endpoint, {
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          })

          if (response.ok) {
            const data = await response.json()
            console.log(`📊 Response from ${endpoint}:`, data)

            // Check if we got a single booking
            if (data && (data.id || data.bookingReference || data.bookingId)) {
              const booking = data
              if (
                booking.id?.toString() === idToTry ||
                booking.bookingReference?.toString() === idToTry ||
                booking.bookingId?.toString() === idToTry
              ) {
                console.log(`✅ Found exact booking match: ${idToTry}`)
                return NextResponse.json({
                  success: true,
                  data: {
                    id: booking.id || idToTry,
                    bookingReference: booking.bookingReference || booking.id || idToTry,
                    title: booking.title || booking.name || `Booking ${idToTry}`,
                    client: {
                      name: booking.client?.name || booking.clientName || "Unknown Client",
                      email: booking.client?.email || booking.clientEmail || "",
                    },
                    destination: booking.destination || "Unknown Destination",
                    startDate: booking.startDate || booking.departureDate,
                    endDate: booking.endDate || booking.returnDate,
                    status: booking.status || "Confirmed",
                    totalPrice: booking.totalPrice?.amount || booking.totalPrice || 0,
                    currency: booking.totalPrice?.currency || booking.currency || "EUR",
                    foundVia: endpoint,
                    micrositeId: credentials.micrositeId,
                  },
                })
              }
            }

            // Check if we got an array of bookings
            if (data && (data.booking || data.bookings)) {
              const bookings = data.booking || data.bookings || []
              console.log(`📋 Found ${bookings.length} bookings, searching for ${idToTry}`)

              for (const booking of bookings) {
                if (
                  booking.id?.toString() === idToTry ||
                  booking.bookingReference?.toString() === idToTry ||
                  booking.bookingId?.toString() === idToTry ||
                  booking.id?.toString().includes(cleanId) ||
                  booking.bookingReference?.toString().includes(cleanId)
                ) {
                  console.log(`✅ Found booking in array: ${idToTry}`)
                  return NextResponse.json({
                    success: true,
                    data: {
                      id: booking.id || idToTry,
                      bookingReference: booking.bookingReference || booking.id || idToTry,
                      title: booking.title || booking.name || `Booking ${idToTry}`,
                      client: {
                        name: booking.client?.name || booking.clientName || "Unknown Client",
                        email: booking.client?.email || booking.clientEmail || "",
                      },
                      destination: booking.destination || "Unknown Destination",
                      startDate: booking.startDate || booking.departureDate,
                      endDate: booking.endDate || booking.returnDate,
                      status: booking.status || "Confirmed",
                      totalPrice: booking.totalPrice?.amount || booking.totalPrice || 0,
                      currency: booking.totalPrice?.currency || booking.currency || "EUR",
                      foundVia: endpoint,
                      micrositeId: credentials.micrositeId,
                    },
                  })
                }
              }
            }
          } else {
            console.log(`❌ Endpoint failed: ${response.status} - ${response.statusText}`)
          }
        } catch (error) {
          console.log(`⚠️ Endpoint error: ${error}`)
          continue
        }
      }
    }

    // Als we hier komen, is de booking niet gevonden
    console.log(`❌ Booking ${bookingId} not found after trying all endpoints`)

    return NextResponse.json({
      success: false,
      error: `Booking ${bookingId} not found in Newreisplan microsite`,
      debug: {
        triedIds: idsToTry,
        micrositeId: credentials.micrositeId,
        suggestion: "Try a different booking ID or check if the booking exists in the system",
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
