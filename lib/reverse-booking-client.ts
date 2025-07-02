export function createReverseBookingClient() {
  async function authenticate(config: any): Promise<string> {
    const response = await fetch("https://online.travelcompositor.com/resources/authentication/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        username: config.username,
        password: config.password,
        micrositeId: config.micrositeId,
      }),
    })

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status}`)
    }

    const data = await response.json()
    return data.token
  }

  async function searchFromHighestBooking(bookingId: string): Promise<any> {
    const configs = [
      {
        name: "Primary Microsite",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!,
      },
      {
        name: "Tertiary Microsite",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_3!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_3!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3!,
      },
      {
        name: "Quaternary Microsite",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_4!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_4!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_4!,
      },
    ].filter((config) => config.username && config.password && config.micrositeId)

    for (const config of configs) {
      try {
        console.log(`🔄 Reverse searching ${config.name} for: ${bookingId}`)

        const token = await authenticate(config)

        // Search from high offsets (newest bookings first)
        const searchOffsets = [900, 800, 700, 600, 500, 400, 300, 200, 100, 0]

        for (const offset of searchOffsets) {
          try {
            const response = await fetch(
              `https://online.travelcompositor.com/resources/booking/getBookings?microsite=${config.micrositeId}&from=20250101&to=20251231&first=${offset}&limit=200`,
              {
                headers: {
                  "auth-token": token,
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
              },
            )

            if (!response.ok) continue

            const data = await response.json()
            const bookings = data.bookedTrip || data.bookings || []

            if (bookings.length === 0) continue

            // Find target booking
            const targetBooking = bookings.find((booking: any) => {
              const possibleIds = [
                booking.id,
                booking.bookingId,
                booking.reservationId,
                booking.bookingReference,
                booking.reference,
                booking.tripId,
              ].filter(Boolean)
              return possibleIds.some((id) => String(id).toUpperCase() === bookingId.toUpperCase())
            })

            if (targetBooking) {
              console.log(`✅ Found ${bookingId} in ${config.name} at offset ${offset}`)
              return {
                booking: targetBooking,
                found: true,
                foundInMicrosite: config.name,
                foundAtOffset: offset,
              }
            }
          } catch (offsetError) {
            continue
          }
        }
      } catch (configError) {
        console.log(`❌ Error with ${config.name}:`, configError)
        continue
      }
    }

    return {
      booking: null,
      found: false,
      foundInMicrosite: null,
      foundAtOffset: null,
    }
  }

  return {
    searchFromHighestBooking,
  }
}
