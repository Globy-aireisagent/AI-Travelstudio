import { NextResponse } from "next/server"

// Simple Travel Compositor client for testing
class SimpleTravelCompositorClient {
  private config: {
    username: string
    password: string
    micrositeId: string
    baseUrl: string
  }
  private authToken: string | null = null

  constructor(config: { username: string; password: string; micrositeId: string }) {
    this.config = {
      ...config,
      baseUrl: "https://online.travelcompositor.com",
    }
  }

  async authenticate(): Promise<string> {
    try {
      console.log(`🔐 Authenticating microsite: ${this.config.micrositeId}`)

      const response = await fetch(`${this.config.baseUrl}/resources/authentication/authenticate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: this.config.username,
          password: this.config.password,
          micrositeId: this.config.micrositeId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Auth failed: ${response.status}`)
      }

      const data = await response.json()
      this.authToken = data.token

      if (!this.authToken) {
        throw new Error("No token received")
      }

      console.log(`✅ Authentication successful for ${this.config.micrositeId}`)
      return this.authToken
    } catch (error) {
      console.error(`❌ Auth failed for ${this.config.micrositeId}:`, error)
      throw error
    }
  }

  async searchBooking(bookingId: string): Promise<any> {
    try {
      if (!this.authToken) {
        await this.authenticate()
      }

      console.log(`🔍 Searching booking ${bookingId} in ${this.config.micrositeId}`)

      // Try multiple search strategies with broader date ranges
      const searchStrategies = [
        // Direct booking lookup
        {
          endpoint: `/resources/booking/${bookingId}`,
          description: "Direct booking lookup",
        },
        // 2025 bookings
        {
          endpoint: `/resources/booking/getBookings?microsite=${this.config.micrositeId}&from=2025-01-01&to=2025-12-31&first=0&limit=500`,
          description: "2025 bookings search",
        },
        // 2024 bookings
        {
          endpoint: `/resources/booking/getBookings?microsite=${this.config.micrositeId}&from=2024-01-01&to=2024-12-31&first=0&limit=500`,
          description: "2024 bookings search",
        },
        // Broader range (2023-2026)
        {
          endpoint: `/resources/booking/getBookings?microsite=${this.config.micrositeId}&from=2023-01-01&to=2026-12-31&first=0&limit=1000`,
          description: "Broad date range search",
        },
        // Alternative format
        {
          endpoint: `/resources/booking/getBookings?microsite=${this.config.micrositeId}&from=20230101&to=20261231&first=0&limit=1000`,
          description: "Alternative date format search",
        },
        // Recent bookings (last 500)
        {
          endpoint: `/resources/booking/getBookings?microsite=${this.config.micrositeId}&first=0&limit=500`,
          description: "Recent bookings (no date filter)",
        },
      ]

      for (const strategy of searchStrategies) {
        try {
          console.log(`🔍 Trying: ${strategy.description}`)

          const response = await fetch(`${this.config.baseUrl}${strategy.endpoint}`, {
            method: "GET",
            headers: {
              "auth-token": this.authToken!,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          })

          if (response.ok) {
            const data = await response.json()

            // If it's a direct booking lookup
            if (strategy.endpoint.includes(`/booking/${bookingId}`)) {
              if (data && (data.id || data.bookingReference)) {
                console.log(`✅ Found booking ${bookingId} directly`)
                return {
                  ...data,
                  foundVia: strategy.description,
                }
              }
            }

            // If it's a search result with bookedTrip array
            if (data.bookedTrip && Array.isArray(data.bookedTrip)) {
              console.log(`📊 Found ${data.bookedTrip.length} bookings in ${strategy.description}`)

              const booking = data.bookedTrip.find((b: any) => {
                const matches = [
                  b.id === bookingId,
                  b.bookingReference === bookingId,
                  b.customBookingReference === bookingId,
                  b.id?.toString() === bookingId,
                  b.bookingReference?.toString() === bookingId,
                ]
                return matches.some(Boolean)
              })

              if (booking) {
                console.log(`✅ Found booking ${bookingId} in ${strategy.description}`)
                return {
                  ...booking,
                  foundVia: strategy.description,
                  totalBookingsInSearch: data.bookedTrip.length,
                }
              }

              // Log some booking IDs for debugging
              if (data.bookedTrip.length > 0) {
                const sampleIds = data.bookedTrip.slice(0, 5).map((b: any) => b.id || b.bookingReference)
                console.log(`📝 Sample booking IDs in ${strategy.description}:`, sampleIds)
              }
            }

            // If it's a different response structure
            if (data.id || data.bookingReference) {
              console.log(`✅ Found single booking in ${strategy.description}`)
              return {
                ...data,
                foundVia: strategy.description,
              }
            }
          } else {
            console.log(`⚠️ ${strategy.description} returned ${response.status}`)
          }
        } catch (endpointError) {
          console.log(`⚠️ ${strategy.description} failed:`, endpointError)
          continue
        }
      }

      console.log(`❌ Booking ${bookingId} not found in ${this.config.micrositeId} after trying all strategies`)
      return null
    } catch (error) {
      console.error(`❌ Search failed for ${bookingId} in ${this.config.micrositeId}:`, error)
      throw error
    }
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bookingId = searchParams.get("bookingId") || "RRP-9263"

  console.log(`🔍 Debug booking status for: ${bookingId}`)

  try {
    const configs = [
      {
        name: "Config 1",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!,
      },
      {
        name: "Config 2",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_2!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_2!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_2!,
      },
      {
        name: "Config 3",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_3!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_3!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3!,
      },
      {
        name: "Config 4",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_4!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_4!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_4!,
      },
    ]

    const results = []

    for (const config of configs) {
      // Skip if environment variables are missing
      if (!config.username || !config.password || !config.micrositeId) {
        results.push({
          config: config.name,
          micrositeId: config.micrositeId || "missing",
          authStatus: "❌ ENV MISSING",
          bookingFound: "❌ ERROR",
          bookingData: null,
          error: "Environment variables not configured",
        })
        continue
      }

      try {
        console.log(`🔍 Testing ${config.name} (${config.micrositeId})...`)

        const client = new SimpleTravelCompositorClient(config)

        // Test authentication with timeout
        const authPromise = client.authenticate()
        const authTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Auth timeout after 15s")), 15000)
        })

        await Promise.race([authPromise, authTimeout])
        console.log(`✅ ${config.name} authentication successful`)

        // Test booking search with longer timeout
        const searchPromise = client.searchBooking(bookingId)
        const searchTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Search timeout after 30s")), 30000)
        })

        const booking = await Promise.race([searchPromise, searchTimeout])

        results.push({
          config: config.name,
          micrositeId: config.micrositeId,
          authStatus: "✅ SUCCESS",
          bookingFound: booking ? "✅ FOUND" : "❌ NOT FOUND",
          bookingData: booking
            ? {
                id: booking.id,
                title: booking.title || booking.name || "No title",
                client: booking.client?.name || booking.contactPerson?.name || "No client name",
                status: booking.status || "Unknown status",
                startDate: booking.startDate,
                endDate: booking.endDate,
                foundVia: booking.foundVia || "Unknown method",
                totalBookingsInSearch: booking.totalBookingsInSearch || 0,
              }
            : null,
          error: null,
        })

        console.log(`✅ ${config.name} completed - Booking ${booking ? "FOUND" : "NOT FOUND"}`)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error(`❌ ${config.name} failed:`, errorMessage)

        results.push({
          config: config.name,
          micrositeId: config.micrositeId,
          authStatus: errorMessage.includes("Auth") || errorMessage.includes("timeout") ? "❌ AUTH FAILED" : "❌ ERROR",
          bookingFound: "❌ ERROR",
          bookingData: null,
          error: errorMessage,
        })
      }
    }

    const summary = {
      totalConfigs: results.length,
      workingConfigs: results.filter((r) => r.authStatus === "✅ SUCCESS").length,
      foundBooking: results.filter((r) => r.bookingFound === "✅ FOUND").length,
    }

    console.log(`📊 Debug completed:`, summary)

    return NextResponse.json({
      success: true,
      bookingId,
      timestamp: new Date().toISOString(),
      results,
      summary,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("❌ Debug booking status error:", errorMessage)

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        bookingId,
        timestamp: new Date().toISOString(),
        results: [],
        summary: {
          totalConfigs: 0,
          workingConfigs: 0,
          foundBooking: 0,
        },
      },
      { status: 500 },
    )
  }
}
