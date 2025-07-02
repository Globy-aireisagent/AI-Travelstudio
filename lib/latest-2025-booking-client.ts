interface BookingSearchResult {
  booking: any | null
  found: boolean
  totalBookings: number
  searchTime: number
}

export function createLatest2025BookingClient() {
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

  async function searchLatest2025Bookings(bookingId: string): Promise<BookingSearchResult> {
    const startTime = Date.now()

    for (const config of configs) {
      try {
        console.log(`🎯 Searching latest 2025 bookings in ${config.name} for: ${bookingId}`)

        const token = await authenticate(config)

        // Get ALL 2025 bookings with high limit
        const response = await fetch(
          `https://online.travelcompositor.com/resources/booking/getBookings?microsite=${config.micrositeId}&from=20250101&to=20251231&first=0&limit=5000`,
          {
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        )

        if (!response.ok) {
          console.log(`⚠️ API call failed for ${config.name}: ${response.status}`)
          continue
        }

        const data = await response.json()
        const allBookings = data.bookedTrip || data.bookings || []

        console.log(`📋 Found ${allBookings.length} total 2025 bookings in ${config.name}`)

        // Sort by booking number (newest first)
        const sortedBookings = allBookings
          .map((booking: any) => {
            const bookingNumber = Number.parseInt((booking.id || booking.bookingReference || "").replace(/^RRP-?/i, ""))
            return {
              ...booking,
              bookingNumber: isNaN(bookingNumber) ? 0 : bookingNumber,
            }
          })
          .filter((booking: any) => booking.bookingNumber > 0)
          .sort((a: any, b: any) => b.bookingNumber - a.bookingNumber) // Newest first

        // Search in the latest bookings first (most likely to find recent bookings)
        const targetBooking = sortedBookings.find((booking: any) => {
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
          console.log(`✅ Found ${bookingId} in ${config.name}!`)
          return {
            booking: targetBooking,
            found: true,
            totalBookings: allBookings.length,
            searchTime: Date.now() - startTime,
          }
        }
      } catch (error) {
        console.log(`❌ Error searching ${config.name}:`, error)
        continue
      }
    }

    return {
      booking: null,
      found: false,
      totalBookings: 0,
      searchTime: Date.now() - startTime,
    }
  }

  return {
    searchLatest2025Bookings,
  }
}
