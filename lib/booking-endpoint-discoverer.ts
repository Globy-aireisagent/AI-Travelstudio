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
    console.log("🔍 Testing known working booking endpoints...")

    const token = await this.authenticate()
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!

    const results = {
      workingEndpoints: [] as any[],
      failedEndpoints: [] as any[],
      agencies: [] as any[],
      sampleBookings: [] as any[],
      year2025Bookings: [] as any[],
    }

    // BEKENDE WERKENDE ENDPOINTS die we eerder hadden
    const knownWorkingEndpoints = [
      // De endpoint die jij noemde
      `/booking/getBookings/${micrositeId}`,

      // Andere bekende werkende endpoints
      `/resources/booking/${micrositeId}`,
      `/resources/booking/${micrositeId}?first=0&limit=100`,
      `/resources/bookings/${micrositeId}`,
      `/resources/bookings/${micrositeId}?first=0&limit=100`,

      // Met sorting
      `/resources/booking/${micrositeId}?first=0&limit=100&sort=id&order=desc`,
      `/resources/booking/${micrositeId}?first=0&limit=100&sort=creationDate&order=desc`,

      // Met datum filters
      `/resources/booking/${micrositeId}?first=0&limit=100&fromDate=2025-01-01`,
      `/resources/booking/${micrositeId}?first=0&limit=100&createdFrom=2025-01-01`,

      // Verschillende varianten
      `/resources/booking/list/${micrositeId}`,
      `/resources/booking/search/${micrositeId}`,
      `/resources/booking/${micrositeId}/list`,
    ]

    for (const endpoint of knownWorkingEndpoints) {
      try {
        console.log(`🔍 Testing known endpoint: ${endpoint}`)

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
            totalCount: data.totalCount || data.total || data.count || 0,
            sampleData: data,
          })

          // Kijk of er bookings in zitten
          const bookings = data.booking || data.bookings || data.results || data.data || []
          if (Array.isArray(bookings) && bookings.length > 0) {
            console.log(`📋 Found ${bookings.length} bookings in ${endpoint}`)
            results.sampleBookings.push(...bookings.slice(0, 20))

            // Filter 2025 bookings
            const bookings2025 = bookings.filter((booking: any) => {
              const bookingDate = booking.creationDate || booking.bookingDate || booking.created || booking.date
              if (bookingDate) {
                return new Date(bookingDate).getFullYear() === 2025
              }
              const bookingId = booking.id || booking.reference || booking.bookingReference || ""
              return String(bookingId).includes("RRP-") && String(bookingId).length > 4
            })

            if (bookings2025.length > 0) {
              console.log(`🎯 Found ${bookings2025.length} bookings from 2025`)
              results.year2025Bookings.push(...bookings2025)
            }
          }

          // Als het een single booking object is
          if (data.id || data.reference || data.bookingReference) {
            results.sampleBookings.push(data)
          }
        } else {
          console.log(`❌ Failed endpoint: ${endpoint} - Status: ${response.status}`)
          const errorText = await response.text()
          results.failedEndpoints.push({
            endpoint,
            status: response.status,
            error: errorText,
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

    // Haal agencies op
    try {
      const agencyResponse = await fetch(`${this.baseUrl}/resources/agency/${micrositeId}?first=0&limit=20`, {
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

        // Test bekende booking endpoints per agency
        for (const agency of agencies.slice(0, 5)) {
          const agencyEndpoints = [
            `/booking/getBookings/${micrositeId}/${agency.id}`,
            `/resources/booking/${micrositeId}/${agency.id}`,
            `/resources/booking/${micrositeId}/${agency.id}?first=0&limit=50`,
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
                  totalCount: data.totalCount || data.total || 0,
                  sampleData: data,
                })

                const bookings = data.booking || data.bookings || data.results || []
                if (Array.isArray(bookings) && bookings.length > 0) {
                  console.log(`📋 Found ${bookings.length} bookings for agency ${agency.name}`)
                  results.sampleBookings.push(...bookings.slice(0, 10))

                  const bookings2025 = bookings.filter((booking: any) => {
                    const bookingDate = booking.creationDate || booking.bookingDate || booking.created
                    if (bookingDate) {
                      return new Date(bookingDate).getFullYear() === 2025
                    }
                    const bookingId = booking.id || booking.reference || ""
                    return String(bookingId).includes("RRP-")
                  })

                  if (bookings2025.length > 0) {
                    results.year2025Bookings.push(...bookings2025)
                  }
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

    console.log(`🎯 Discovery complete: ${results.sampleBookings.length} total bookings found`)
    return results
  }

  async findSpecificBooking(bookingId: string): Promise<any> {
    console.log(`🔍 Searching for booking: ${bookingId}`)

    const token = await this.authenticate()
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!

    // BEKENDE WERKENDE ENDPOINTS voor specifieke booking lookup
    const specificBookingEndpoints = [
      // De endpoint die jij noemde - dit zou moeten werken!
      `/booking/getBookings/${micrositeId}/${bookingId}`,

      // Andere bekende varianten
      `/resources/booking/${micrositeId}/${bookingId}`,
      `/resources/booking/${micrositeId}?reference=${bookingId}`,
      `/resources/booking/${micrositeId}?bookingReference=${bookingId}`,
      `/resources/booking/${micrositeId}?id=${bookingId}`,
      `/resources/bookings/${micrositeId}?reference=${bookingId}`,

      // Met search parameters
      `/resources/booking/${micrositeId}?search=${bookingId}`,
      `/resources/booking/search/${micrositeId}?query=${bookingId}`,
      `/resources/booking/${micrositeId}/search?reference=${bookingId}`,
    ]

    for (const endpoint of specificBookingEndpoints) {
      try {
        console.log(`🔍 Searching in: ${endpoint}`)

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()

          // Check if this is the booking we're looking for
          const bookingIds = [data.id, data.reference, data.bookingReference, data.number].filter(Boolean)
          if (bookingIds.some((id) => String(id) === String(bookingId))) {
            console.log(`✅ Found booking ${bookingId} via ${endpoint}`)
            return data
          }

          // Check if it's in an array
          const bookings = data.booking || data.bookings || data.results || data.data || []
          if (Array.isArray(bookings)) {
            const targetBooking = bookings.find((b: any) => {
              const bIds = [b.id, b.reference, b.bookingReference, b.number].filter(Boolean)
              return bIds.some((id) => String(id) === String(bookingId))
            })

            if (targetBooking) {
              console.log(`✅ Found booking ${bookingId} in array via ${endpoint}`)
              return targetBooking
            }
          }
        } else {
          console.log(`❌ Endpoint ${endpoint} failed: ${response.status}`)
        }
      } catch (error) {
        console.log(`⚠️ Error searching ${endpoint}:`, error)
      }
    }

    throw new Error(`Booking ${bookingId} not found in any known endpoint`)
  }
}
