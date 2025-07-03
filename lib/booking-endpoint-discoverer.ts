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
    console.log("🔍 Discovering booking endpoints - 2025 bookings only...")

    const token = await this.authenticate()
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!

    // Datum filters voor ALLEEN 2025
    const year2025Start = "2025-01-01"
    const year2025End = "2025-12-31"
    const today = new Date().toISOString().split("T")[0]

    const results = {
      workingEndpoints: [] as any[],
      failedEndpoints: [] as any[],
      agencies: [] as any[],
      sampleBookings: [] as any[],
      recentBookings: [] as any[],
      year2025Bookings: [] as any[],
    }

    // Test booking endpoints MET 2025 datum filters
    const testEndpoints = [
      // Basis endpoints met 2025 filter
      `/resources/booking/${micrositeId}?first=0&limit=100&fromDate=${year2025Start}&toDate=${year2025End}`,
      `/resources/booking/${micrositeId}?first=0&limit=100&createdFrom=${year2025Start}&createdTo=${year2025End}`,
      `/resources/booking/${micrositeId}?first=0&limit=100&bookingDateFrom=${year2025Start}&bookingDateTo=${year2025End}`,
      `/resources/booking/${micrositeId}?first=0&limit=100&creationDateFrom=${year2025Start}&creationDateTo=${year2025End}`,

      // Met verschillende jaar parameters
      `/resources/booking/${micrositeId}?first=0&limit=100&year=2025`,
      `/resources/booking/${micrositeId}?first=0&limit=100&bookingYear=2025`,
      `/resources/booking/${micrositeId}?first=0&limit=100&creationYear=2025`,

      // Vandaag specifiek
      `/resources/booking/${micrositeId}?first=0&limit=100&bookingDate=${today}`,
      `/resources/booking/${micrositeId}?first=0&limit=100&creationDate=${today}`,
      `/resources/booking/${micrositeId}?first=0&limit=100&date=${today}`,

      // Met sorting voor nieuwste eerst (2025)
      `/resources/booking/${micrositeId}?first=0&limit=100&sort=creationDate&order=desc&fromDate=${year2025Start}`,
      `/resources/booking/${micrositeId}?first=0&limit=100&sort=id&order=desc&year=2025`,
      `/resources/booking/${micrositeId}?first=0&limit=100&orderBy=creationDate&direction=desc&createdFrom=${year2025Start}`,

      // Verschillende endpoint varianten met 2025 filter
      `/resources/bookings/${micrositeId}?first=0&limit=100&fromDate=${year2025Start}&toDate=${year2025End}`,
      `/resources/booking/list/${micrositeId}?first=0&limit=100&year=2025`,
      `/resources/booking/search/${micrositeId}?first=0&limit=100&fromDate=${year2025Start}`,

      // Basis endpoints (zonder filter) om te zien wat er is
      `/resources/booking/${micrositeId}?first=0&limit=20`,
      `/resources/bookings/${micrositeId}?first=0&limit=20`,
    ]

    for (const endpoint of testEndpoints) {
      try {
        console.log(`🔍 Testing 2025 endpoint: ${endpoint}`)

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

            // Filter alleen 2025 bookings
            const bookings2025 = bookings.filter((booking: any) => {
              const bookingDate = booking.creationDate || booking.bookingDate || booking.created || booking.date
              if (bookingDate) {
                const year = new Date(bookingDate).getFullYear()
                return year === 2025
              }
              // Als geen datum, check booking ID pattern (RRP-XXXX meestal 2025)
              const bookingId = booking.id || booking.reference || booking.bookingReference || ""
              return String(bookingId).includes("RRP-") || String(bookingId).includes("2025")
            })

            if (bookings2025.length > 0) {
              console.log(`🎯 Found ${bookings2025.length} bookings from 2025`)
              results.year2025Bookings.push(...bookings2025)
              results.sampleBookings.push(...bookings2025.slice(0, 10))
            } else {
              // Voeg alle bookings toe om te zien wat er is
              results.sampleBookings.push(...bookings.slice(0, 5))
            }

            // Filter recente bookings (laatste 7 dagen van 2025)
            const recentBookings = bookings.filter((booking: any) => {
              const bookingDate = booking.creationDate || booking.bookingDate || booking.created || booking.date
              if (bookingDate) {
                const bDate = new Date(bookingDate)
                const today = new Date()
                const daysDiff = Math.abs((today.getTime() - bDate.getTime()) / (1000 * 60 * 60 * 24))
                return daysDiff <= 7 && bDate.getFullYear() === 2025
              }
              return false
            })

            if (recentBookings.length > 0) {
              console.log(`🆕 Found ${recentBookings.length} recent 2025 bookings`)
              results.recentBookings.push(...recentBookings)
            }
          }

          // Als het een single booking object is
          if (data.id || data.reference || data.bookingReference) {
            const bookingDate = data.creationDate || data.bookingDate || data.created || data.date
            if (bookingDate && new Date(bookingDate).getFullYear() === 2025) {
              results.year2025Bookings.push(data)
              results.sampleBookings.push(data)
            }
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

    // Haal agencies op om per agency te zoeken (2025 bookings)
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

        // Test booking endpoints per agency MET 2025 filters
        for (const agency of agencies.slice(0, 5)) {
          const agencyEndpoints = [
            `/resources/booking/${micrositeId}/${agency.id}?first=0&limit=50&fromDate=${year2025Start}&toDate=${year2025End}`,
            `/resources/booking/${micrositeId}/${agency.id}?first=0&limit=50&year=2025`,
            `/resources/booking/${micrositeId}/${agency.id}?first=0&limit=50&sort=id&order=desc`,
            `/resources/bookings/${micrositeId}/${agency.id}?first=0&limit=50&createdFrom=${year2025Start}`,
          ]

          for (const endpoint of agencyEndpoints) {
            try {
              console.log(`🔍 Testing agency 2025 endpoint: ${endpoint}`)

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

                // Kijk of er bookings in zitten
                const bookings = data.booking || data.bookings || data.results || []
                if (Array.isArray(bookings) && bookings.length > 0) {
                  console.log(`📋 Found ${bookings.length} bookings for agency ${agency.name}`)

                  // Filter 2025 bookings
                  const bookings2025 = bookings.filter((booking: any) => {
                    const bookingDate = booking.creationDate || booking.bookingDate || booking.created
                    if (bookingDate) {
                      return new Date(bookingDate).getFullYear() === 2025
                    }
                    const bookingId = booking.id || booking.reference || ""
                    return String(bookingId).includes("RRP-") || String(bookingId).includes("2025")
                  })

                  if (bookings2025.length > 0) {
                    results.year2025Bookings.push(...bookings2025)
                    results.sampleBookings.push(...bookings2025.slice(0, 5))
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

    // Sorteer bookings op datum (nieuwste eerst)
    results.sampleBookings.sort((a: any, b: any) => {
      const dateA = new Date(a.creationDate || a.bookingDate || a.created || 0)
      const dateB = new Date(b.creationDate || b.bookingDate || b.created || 0)
      return dateB.getTime() - dateA.getTime()
    })

    console.log(
      `🎯 2025 Discovery complete: ${results.sampleBookings.length} total bookings, ${results.year2025Bookings.length} from 2025, ${results.recentBookings.length} recent`,
    )

    return results
  }

  async findSpecificBooking(bookingId: string): Promise<any> {
    console.log(`🔍 Searching for 2025 booking: ${bookingId}`)

    const discovery = await this.discoverBookingEndpoints()

    // Zoek in alle 2025 bookings eerst
    const allBookings = [...discovery.year2025Bookings, ...discovery.recentBookings, ...discovery.sampleBookings]

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
        console.log(`✅ Found booking ${bookingId} in 2025 sample data!`)
        return booking
      }
    }

    // Als niet gevonden in samples, probeer alle working endpoints met 2025 filters
    const token = await this.authenticate()
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!

    for (const endpointInfo of discovery.workingEndpoints) {
      const searchEndpoints = [
        `${endpointInfo.endpoint}?bookingId=${bookingId}`,
        `${endpointInfo.endpoint}?reference=${bookingId}`,
        `${endpointInfo.endpoint}?id=${bookingId}`,
        `${endpointInfo.endpoint}?number=${bookingId}`,
        `${endpointInfo.endpoint}/${bookingId}`,
        `${endpointInfo.endpoint}?search=${bookingId}`,
        `${endpointInfo.endpoint}?query=${bookingId}`,
        // Specifieke 2025 zoek endpoints
        `/resources/booking/${micrositeId}/${bookingId}`,
        `/resources/booking/${micrositeId}?reference=${bookingId}&year=2025`,
        `/resources/booking/search/${micrositeId}?query=${bookingId}&fromDate=2025-01-01`,
      ]

      for (const searchEndpoint of searchEndpoints) {
        try {
          console.log(`🔍 Searching 2025 booking in: ${searchEndpoint}`)

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

    throw new Error(`Booking ${bookingId} not found in any 2025 endpoint`)
  }
}
