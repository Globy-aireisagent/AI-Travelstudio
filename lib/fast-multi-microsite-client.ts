interface MicrositeConfig {
  id: string
  name: string
  username: string
  password: string
  micrositeId: string
}

interface SearchResult {
  microsite: string
  success: boolean
  booking?: any
  error?: string
  responseTime: number
  searchMethod?: string
}

interface MultiSearchResult {
  booking: any | null
  foundInMicrosite: string | null
  searchResults: SearchResult[]
  totalTime: number
}

export function createFastMultiMicrositeClient() {
  const configs: MicrositeConfig[] = [
    {
      id: "config1",
      name: "Primary Microsite",
      username: process.env.TRAVEL_COMPOSITOR_USERNAME!,
      password: process.env.TRAVEL_COMPOSITOR_PASSWORD!,
      micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!,
    },
    {
      id: "config3",
      name: "Tertiary Microsite",
      username: process.env.TRAVEL_COMPOSITOR_USERNAME_3!,
      password: process.env.TRAVEL_COMPOSITOR_PASSWORD_3!,
      micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3!,
    },
    {
      id: "config4",
      name: "Quaternary Microsite",
      username: process.env.TRAVEL_COMPOSITOR_USERNAME_4!,
      password: process.env.TRAVEL_COMPOSITOR_PASSWORD_4!,
      micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_4!,
    },
  ].filter((config) => config.username && config.password && config.micrositeId)

  // Token cache per microsite
  const tokenCache = new Map<string, { token: string; expiry: Date }>()

  async function authenticate(config: MicrositeConfig): Promise<string> {
    const cacheKey = config.micrositeId
    const cached = tokenCache.get(cacheKey)

    if (cached && new Date() < cached.expiry) {
      return cached.token
    }

    console.log(`🔐 Authenticating with ${config.name}...`)

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
    if (!data.token) {
      throw new Error("No token received")
    }

    // Cache token with 1 hour expiry (minus 5 minutes for safety)
    const expiry = new Date(Date.now() + 55 * 60 * 1000)
    tokenCache.set(cacheKey, { token: data.token, expiry })

    console.log(`✅ Authenticated with ${config.name}`)
    return data.token
  }

  async function searchInMicrosite(config: MicrositeConfig, bookingId: string, timeout = 15000): Promise<SearchResult> {
    const startTime = Date.now()

    try {
      // Get auth token
      const token = await authenticate(config)

      // Create abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      console.log(`🔍 Searching ${config.name} for: ${bookingId}`)

      // Method 1: Try the getBookings endpoint (this is what works!)
      try {
        const response = await fetch(
          `https://online.travelcompositor.com/resources/booking/getBookings?microsite=${config.micrositeId}&from=20250101&to=20261231&first=0&limit=1000`,
          {
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            signal: controller.signal,
          },
        )

        if (response.ok) {
          const data = await response.json()
          const bookings = data.bookedTrip || data.bookings || []

          console.log(`📋 Found ${bookings.length} bookings in ${config.name}`)

          // Search through bookings for exact match
          const booking = bookings.find((b: any) => {
            const possibleIds = [b.id, b.bookingId, b.reservationId, b.bookingReference, b.reference, b.tripId].filter(
              Boolean,
            )

            return possibleIds.some((id) => String(id).toUpperCase() === bookingId.toUpperCase())
          })

          if (booking) {
            clearTimeout(timeoutId)
            console.log(`✅ Found booking ${bookingId} in ${config.name} via getBookings`)
            return {
              microsite: config.name,
              success: true,
              booking: booking,
              responseTime: Date.now() - startTime,
              searchMethod: "getBookings",
            }
          }
        }
      } catch (error) {
        console.log(`⚠️ getBookings failed in ${config.name}:`, error)
      }

      // Method 2: Try direct booking lookup
      const cleanBookingId = bookingId.replace(/^RRP-?/i, "")
      const searchPatterns = [bookingId.toUpperCase(), `RRP-${cleanBookingId}`, cleanBookingId]

      for (const pattern of searchPatterns) {
        try {
          const response = await fetch(`https://online.travelcompositor.com/resources/booking/${pattern}`, {
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            signal: controller.signal,
          })

          if (response.ok) {
            const data = await response.json()
            clearTimeout(timeoutId)

            console.log(`✅ Found booking ${pattern} in ${config.name} via direct lookup`)
            return {
              microsite: config.name,
              success: true,
              booking: data,
              responseTime: Date.now() - startTime,
              searchMethod: "direct",
            }
          }
        } catch (patternError) {
          continue
        }
      }

      clearTimeout(timeoutId)
      return {
        microsite: config.name,
        success: false,
        error: "Booking not found with any search method",
        responseTime: Date.now() - startTime,
        searchMethod: "none",
      }
    } catch (error) {
      return {
        microsite: config.name,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime: Date.now() - startTime,
        searchMethod: "error",
      }
    }
  }

  async function searchBookingAcrossAllMicrosites(bookingId: string, totalTimeout = 30000): Promise<MultiSearchResult> {
    const startTime = Date.now()
    console.log(`🚀 Starting multi-microsite search for: ${bookingId}`)

    // Search in parallel but with longer timeout per microsite
    const searchPromises = configs.map((config) =>
      searchInMicrosite(config, bookingId, Math.floor(totalTimeout / configs.length)),
    )

    try {
      // Wait for all searches to complete
      const results = await Promise.allSettled(searchPromises)
      const searchResults: SearchResult[] = results.map((result) =>
        result.status === "fulfilled"
          ? result.value
          : {
              microsite: "Unknown",
              success: false,
              error: "Promise rejected",
              responseTime: Date.now() - startTime,
              searchMethod: "rejected",
            },
      )

      // Find first successful result
      const successfulResult = searchResults.find((result) => result.success && result.booking)

      console.log(`🎯 Search completed in ${Date.now() - startTime}ms`, {
        found: !!successfulResult,
        foundIn: successfulResult?.microsite,
        method: successfulResult?.searchMethod,
        totalSearches: searchResults.length,
      })

      return {
        booking: successfulResult?.booking || null,
        foundInMicrosite: successfulResult?.microsite || null,
        searchResults,
        totalTime: Date.now() - startTime,
      }
    } catch (error) {
      return {
        booking: null,
        foundInMicrosite: null,
        searchResults: [],
        totalTime: Date.now() - startTime,
      }
    }
  }

  return {
    searchBookingAcrossAllMicrosites,
    searchInMicrosite,
  }
}
