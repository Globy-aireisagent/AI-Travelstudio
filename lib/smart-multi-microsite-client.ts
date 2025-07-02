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
  searchStrategy?: string
}

interface MultiSearchResult {
  booking: any | null
  foundInMicrosite: string | null
  searchResults: SearchResult[]
  totalTime: number
}

export function createSmartMultiMicrositeClient() {
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

    // Cache token with 1 hour expiry
    const expiry = new Date(Date.now() + 55 * 60 * 1000)
    tokenCache.set(cacheKey, { token: data.token, expiry })

    return data.token
  }

  function getSmartSearchStrategies(bookingId: string, totalCount = 0) {
    const bookingNumber = Number.parseInt(bookingId.replace(/^RRP-?/i, ""))
    const strategies = []

    if (bookingNumber > 9000) {
      // Very recent bookings - start from the end
      strategies.push({ first: Math.max(0, totalCount - 200), limit: 200, name: "Last 200" })
      strategies.push({ first: Math.max(0, totalCount - 500), limit: 500, name: "Last 500" })
      strategies.push({ first: Math.max(0, totalCount - 1000), limit: 1000, name: "Last 1000" })
    } else if (bookingNumber > 8000) {
      strategies.push({ first: Math.max(0, totalCount - 1000), limit: 1000, name: "Last 1000" })
      strategies.push({ first: Math.max(0, totalCount - 2000), limit: 2000, name: "Last 2000" })
    } else if (bookingNumber > 7000) {
      strategies.push({ first: Math.max(0, totalCount - 2000), limit: 2000, name: "Last 2000" })
      strategies.push({ first: 0, limit: 2000, name: "First 2000" })
    } else {
      // Older bookings - start from beginning
      strategies.push({ first: 0, limit: 1000, name: "First 1000" })
      strategies.push({ first: 0, limit: 2000, name: "First 2000" })
    }

    return strategies
  }

  async function smartSearchInMicrosite(
    config: MicrositeConfig,
    bookingId: string,
    timeout = 20000,
  ): Promise<SearchResult> {
    const startTime = Date.now()

    try {
      const token = await authenticate(config)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      console.log(`🧠 Smart searching ${config.name} for: ${bookingId}`)

      // Get total count first
      let totalCount = 0
      try {
        const countResponse = await fetch(
          `https://online.travelcompositor.com/resources/booking/getBookings?microsite=${config.micrositeId}&from=20200101&to=20261231&first=0&limit=1`,
          {
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            signal: controller.signal,
          },
        )

        if (countResponse.ok) {
          const countData = await countResponse.json()
          totalCount = countData.totalCount || countData.total || 0
        }
      } catch (error) {
        console.log(`⚠️ Could not get total count for ${config.name}`)
      }

      // Get smart search strategies based on booking number
      const strategies = getSmartSearchStrategies(bookingId, totalCount)

      for (const strategy of strategies) {
        try {
          console.log(`🎯 Trying ${strategy.name} in ${config.name}`)

          const response = await fetch(
            `https://online.travelcompositor.com/resources/booking/getBookings?microsite=${config.micrositeId}&from=20200101&to=20261231&first=${strategy.first}&limit=${strategy.limit}`,
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

            const targetBooking = bookings.find((b: any) => {
              const possibleIds = [
                b.id,
                b.bookingId,
                b.reservationId,
                b.bookingReference,
                b.reference,
                b.tripId,
              ].filter(Boolean)
              return possibleIds.some((id) => String(id).toUpperCase() === bookingId.toUpperCase())
            })

            if (targetBooking) {
              clearTimeout(timeoutId)
              console.log(`✅ Found ${bookingId} in ${config.name} using ${strategy.name}`)
              return {
                microsite: config.name,
                success: true,
                booking: targetBooking,
                responseTime: Date.now() - startTime,
                searchStrategy: strategy.name,
              }
            }
          }
        } catch (strategyError) {
          console.log(`⚠️ Strategy ${strategy.name} failed in ${config.name}`)
          continue
        }
      }

      clearTimeout(timeoutId)
      return {
        microsite: config.name,
        success: false,
        error: "Booking not found with any smart search strategy",
        responseTime: Date.now() - startTime,
        searchStrategy: "none",
      }
    } catch (error) {
      return {
        microsite: config.name,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime: Date.now() - startTime,
        searchStrategy: "error",
      }
    }
  }

  async function searchBookingAcrossAllMicrosites(bookingId: string, totalTimeout = 45000): Promise<MultiSearchResult> {
    const startTime = Date.now()
    console.log(`🚀 Starting smart multi-microsite search for: ${bookingId}`)

    const searchPromises = configs.map((config) =>
      smartSearchInMicrosite(config, bookingId, Math.floor(totalTimeout / configs.length)),
    )

    try {
      const results = await Promise.allSettled(searchPromises)
      const searchResults: SearchResult[] = results.map((result) =>
        result.status === "fulfilled"
          ? result.value
          : {
              microsite: "Unknown",
              success: false,
              error: "Promise rejected",
              responseTime: Date.now() - startTime,
              searchStrategy: "rejected",
            },
      )

      const successfulResult = searchResults.find((result) => result.success && result.booking)

      console.log(`🎯 Smart search completed in ${Date.now() - startTime}ms`, {
        found: !!successfulResult,
        foundIn: successfulResult?.microsite,
        strategy: successfulResult?.searchStrategy,
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
    smartSearchInMicrosite,
  }
}
