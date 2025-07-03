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
    console.log("🔍 Discovering booking endpoints with recent data...")

    const token = await this.authenticate()
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!

    // Datum filters voor recente bookings
    const today = new Date()
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())

    const todayStr = today.toISOString().split("T")[0]
    const lastMonthStr = lastMonth.toISOString().split("T")[0]
    const nextMonthStr = nextMonth.toISOString().split("T")[0]

    const results = {
      workingEndpoints: [] as any[],
      failedEndpoints: [] as any[],
      agencies: [] as any[],
      sampleBookings: [] as any[],
      recentBookings: [] as any[],
    }

    // Test verschillende booking endpoints MET datum filters voor recente data
    const testEndpoints = [
      // Basis endpoints
      `/resources/booking/${micrositeId}`,
      `/resources/booking/${micrositeId}?first=0&limit=50`,
      `/resources/bookings/${micrositeId}`,
      `/resources/bookings/${micrositeId}?first=0&limit=50`,

      // Met datum filters voor recente bookings
      `/resources/booking/${micrositeId}?first=0&limit=50&fromDate=${lastMonthStr}&toDate=${nextMonthStr}`,
      `/resources/booking/${micrositeId}?first=0&limit=50&createdFrom=${lastMonthStr}&createdTo=${nextMonthStr}`,
      `/resources/booking/${micrositeId}?first=0&limit=50&bookingDate=${todayStr}`,
      `/resources/booking/${micrositeId}?first=0&limit=50&creationDate=${todayStr}`,

      // Verschillende varianten
      `/resources/booking/list/${micrositeId}?first=0&limit=50`,
      `/resources/booking/search/${micrositeId}?first=0&limit=50`,
      `/resources/booking/${micrositeId}/list?first=0&limit=50`,
      `/resources/booking/${micrositeId}/search?first=0&limit=50`,

      // Met sorting voor nieuwste eerst
      `/resources/booking/${micrositeId}?first=0&limit=50&sort=creationDate&order=desc`,
      `/resources/booking/${micrositeId}?first=0&limit=50&sort=id&order=desc`,
      `/resources/booking/${micrositeId}?first=0&limit=50&orderBy=creationDate&direction=desc`,
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
          const bookings = data.booking || data.bookings || data.results || data.data || []
          if (Array.isArray(bookings) && bookings.length > 0) {
            console.log(`📋 Found ${bookings.length} bookings in ${endpoint}`)
            results.sampleBookings.push(...bookings.slice(0, 10)) // Meer bookings voor betere kans

            // Filter recente bookings (vandaag of gisteren)
            const recentBookings = bookings.filter((booking: any) => {
              const bookingDate = booking.creationDate || booking.bookingDate || booking.created || booking.date
              if (bookingDate) {
                const bDate = new Date(bookingDate)
                const daysDiff = Math.abs((today.getTime() - bDate.getTime()) / (1000 * 60 * 60 * 24))
                return daysDiff <= 2 // Laatste 2 dagen
              }
              return false
            })

            if (recentBookings.length > 0) {
              console.log(`🆕 Found ${recentBookings.length} recent bookings`)
              results.recentBookings.push(...recentBookings)
            }
          }

          // Als het een single booking object is
          if (data.id || data.reference || data.bookingReference) {
            results.sampleBookings.push(data)
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

        // Test booking endpoints per agency MET recente datum filters
        for (const agency of agencies.slice(0, 5)) {
          const agencyEndpoints = [
            `/resources/booking/${micrositeId}/${agency.id}?first=0&limit=20`,
            `/resources/booking/${micrositeId}/${agency.id}?first=0&limit=20&sort=id&order=desc`,
            `/resources/booking/${micrositeId}/${agency.id}?first=0&limit=20&fromDate=${lastMonthStr}`,
            `/resources/bookings/${micrositeId}/${agency.id}?first=0&limit=20`,
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
                  console.log(`📋 Found ${bookings.length} bookings for agency ${agency.name}`)
                  results.sampleBookings.push(...bookings.slice(0, 5))

                  // Filter recente bookings
                  const recentBookings = bookings.filter((booking: any) => {
                    const bookingDate = booking.creationDate || booking.bookingDate || booking.created
                    if (bookingDate) {
                      const bDate = new Date(bookingDate)
                      const daysDiff = Math.abs((today.getTime() - bDate.getTime()) / (1000 * 60 * 60 * 24))
                      return daysDiff <= 2
                    }
                    return false
                  })

                  if (recentBookings.length > 0) {
                    results.recentBookings.push(...recentBookings)
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

    // Sorteer sample bookings op datum (nieuwste eerst)
    results.sampleBookings.sort((a: any, b: any) => {
      const dateA = new Date(a.creationDate || a.bookingDate || a.created || 0)
      const dateB = new Date(b.creationDate || b.bookingDate || b.created || 0)
      return dateB.getTime() - dateA.getTime()
    })

    console.log(
      `🎯 Discovery complete: ${results.sampleBookings.length} total bookings, ${results.recentBookings.length} recent bookings`,
    )

    return results
  }

  async findSpecificBooking(bookingId: string): Promise<any> {
    console.log(`🔍 Searching for specific booking: ${bookingId}`)

    const discovery = await this.discoverBookingEndpoints()

    // Zoek in alle sample bookings (inclusief recente)
    const allBookings = [...discovery.sampleBookings, ...discovery.recentBookings]

    for (const booking of allBookings) {
      const bookingIds = [
        booking.id,
        booking.reference,
        booking.bookingReference,
        booking.bookingId,
        booking.number,
        String(booking.id),
      ].filter(Boolean)

      if (bookingIds.some((id) => String(id) === String(bookingId))) {
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
        `${endpointInfo.endpoint}?number=${bookingId}`,
        `${endpointInfo.endpoint}/${bookingId}`,
        `${endpointInfo.endpoint}?search=${bookingId}`,
        `${endpointInfo.endpoint}?query=${bookingId}`,
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
            const bookingIds = [data.id, data.reference, data.bookingReference, data.number].filter(Boolean)
            if (bookingIds.some((id) => String(id) === String(bookingId))) {
              console.log(`✅ Found booking ${bookingId} via ${searchEndpoint}`)
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
