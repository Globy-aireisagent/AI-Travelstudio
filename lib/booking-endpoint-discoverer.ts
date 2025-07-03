export class BookingEndpointDiscoverer {
  private baseUrl = "https://online.travelcompositor.com"
  private authToken: string | null = null
  private tokenExpiry: Date | null = null

  async authenticate(): Promise<string> {
    if (this.authToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.authToken
    }

    const credentials = {
      username: process.env.TRAVEL_COMPOSITOR_USERNAME!,
      password: process.env.TRAVEL_COMPOSITOR_PASSWORD!,
      micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!,
    }

    const response = await fetch(`${this.baseUrl}/resources/authentication/authenticate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status}`)
    }

    const data = await response.json()
    this.authToken = data.token
    this.tokenExpiry = new Date(Date.now() + (data.expirationInSeconds || 7200) * 1000 - 60000)

    return this.authToken
  }

  async discoverBookingEndpoints(): Promise<any> {
    console.log("🔍 Discovering booking endpoints...")

    const token = await this.authenticate()
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!

    const results = {
      workingEndpoints: [] as any[],
      failedEndpoints: [] as any[],
      agencies: [] as any[],
      sampleBookings: [] as any[],
    }

    // Test verschillende booking endpoints
    const testEndpoints = [
      `/resources/booking/${micrositeId}`,
      `/resources/booking/${micrositeId}?first=0&limit=10`,
      `/resources/bookings/${micrositeId}`,
      `/resources/bookings/${micrositeId}?first=0&limit=10`,
      `/resources/booking/list/${micrositeId}`,
      `/resources/booking/search/${micrositeId}`,
      `/resources/booking/${micrositeId}/list`,
      `/resources/booking/${micrositeId}/search`,
    ]

    for (const endpoint of testEndpoints) {
      try {
        console.log(`🔍 Testing endpoint: ${endpoint}`)

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`✅ Working endpoint: ${endpoint}`)

          results.workingEndpoints.push({
            endpoint,
            status: response.status,
            dataKeys: Object.keys(data),
            sampleData: data,
          })

          // Kijk of er bookings in zitten
          const bookings = data.booking || data.bookings || data.results || []
          if (Array.isArray(bookings) && bookings.length > 0) {
            results.sampleBookings.push(...bookings.slice(0, 3)) // Eerste 3 bookings
          }
        } else {
          console.log(`❌ Failed endpoint: ${endpoint} - Status: ${response.status}`)
          results.failedEndpoints.push({
            endpoint,
            status: response.status,
            error: await response.text(),
          })
        }
      } catch (error) {
        console.log(`⚠️ Error testing endpoint ${endpoint}:`, error)
        results.failedEndpoints.push({
          endpoint,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    // Haal agencies op om per agency te zoeken
    try {
      const agencyResponse = await fetch(`${this.baseUrl}/resources/agency/${micrositeId}?first=0&limit=10`, {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (agencyResponse.ok) {
        const agencyData = await agencyResponse.json()
        const agencies = agencyData.agency || agencyData.agencies || []
        results.agencies = agencies

        // Test booking endpoints per agency
        for (const agency of agencies.slice(0, 3)) {
          // Test eerste 3 agencies
          const agencyEndpoints = [
            `/resources/booking/${micrositeId}/${agency.id}`,
            `/resources/booking/${micrositeId}/${agency.id}?first=0&limit=5`,
            `/resources/bookings/${micrositeId}/${agency.id}`,
          ]

          for (const endpoint of agencyEndpoints) {
            try {
              console.log(`🔍 Testing agency endpoint: ${endpoint}`)

              const response = await fetch(`${this.baseUrl}${endpoint}`, {
                headers: {
                  "auth-token": token,
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
              })

              if (response.ok) {
                const data = await response.json()
                console.log(`✅ Working agency endpoint: ${endpoint}`)

                results.workingEndpoints.push({
                  endpoint,
                  agencyId: agency.id,
                  agencyName: agency.name,
                  status: response.status,
                  dataKeys: Object.keys(data),
                  sampleData: data,
                })

                // Kijk of er bookings in zitten
                const bookings = data.booking || data.bookings || data.results || []
                if (Array.isArray(bookings) && bookings.length > 0) {
                  results.sampleBookings.push(...bookings.slice(0, 2)) // Eerste 2 bookings per agency
                }
              }
            } catch (error) {
              console.log(`⚠️ Error testing agency endpoint ${endpoint}:`, error)
            }
          }
        }
      }
    } catch (error) {
      console.log("⚠️ Error fetching agencies:", error)
    }

    return results
  }

  async findSpecificBooking(bookingId: string): Promise<any> {
    console.log(`🔍 Searching for specific booking: ${bookingId}`)

    const discovery = await this.discoverBookingEndpoints()

    // Zoek in alle sample bookings
    for (const booking of discovery.sampleBookings) {
      if (
        booking.id === bookingId ||
        booking.reference === bookingId ||
        booking.bookingReference === bookingId ||
        booking.bookingId === bookingId ||
        String(booking.id) === String(bookingId)
      ) {
        console.log(`✅ Found booking ${bookingId} in sample data!`)
        return booking
      }
    }

    // Als niet gevonden in samples, probeer alle working endpoints met de booking ID
    const token = await this.authenticate()

    for (const endpointInfo of discovery.workingEndpoints) {
      const searchEndpoints = [
        `${endpointInfo.endpoint}?bookingId=${bookingId}`,
        `${endpointInfo.endpoint}?reference=${bookingId}`,
        `${endpointInfo.endpoint}?id=${bookingId}`,
        `${endpointInfo.endpoint}/${bookingId}`,
      ]

      for (const searchEndpoint of searchEndpoints) {
        try {
          console.log(`🔍 Searching in: ${searchEndpoint}`)

          const response = await fetch(`${this.baseUrl}${searchEndpoint}`, {
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          })

          if (response.ok) {
            const data = await response.json()

            // Check if this is the booking we're looking for
            if (data.id === bookingId || data.reference === bookingId) {
              console.log(`✅ Found booking ${bookingId} via ${searchEndpoint}`)
              return data
            }

            // Check if it's in an array
            const bookings = data.booking || data.bookings || data.results || []
            if (Array.isArray(bookings)) {
              const targetBooking = bookings.find(
                (b: any) =>
                  b.id === bookingId ||
                  b.reference === bookingId ||
                  b.bookingReference === bookingId ||
                  String(b.id) === String(bookingId),
              )

              if (targetBooking) {
                console.log(`✅ Found booking ${bookingId} in array via ${searchEndpoint}`)
                return targetBooking
              }
            }
          }
        } catch (error) {
          console.log(`⚠️ Error searching ${searchEndpoint}:`, error)
        }
      }
    }

    throw new Error(`Booking ${bookingId} not found in any discovered endpoint`)
  }
}
