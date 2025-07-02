import { optimizedBookingCache } from "./booking-cache-optimized"

export interface TravelCompositorConfig {
  username: string
  password: string
  micrositeId: string
  baseUrl?: string
}

export interface BookingData {
  id: string
  title: string
  client: {
    name: string
    email: string
  }
  destination: string
  startDate: string
  endDate: string
  status: string
  activities: any[]
  hotels: any[]
  vouchers: any[]
}

export class FastTravelCompositorClient {
  private config: TravelCompositorConfig
  private authToken: string | null = null
  private tokenExpiry: Date | null = null
  private traceId: string

  constructor(config: TravelCompositorConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl || "https://online.travelcompositor.com",
    }
    this.traceId = `TC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  async authenticate(): Promise<string> {
    try {
      console.log("🔐 Fast authenticating...")

      const response = await fetch(`${this.config.baseUrl}/resources/authentication/authenticate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Encoding": "gzip",
          "Travelc-Trace-Id": this.traceId,
          "User-Agent": "FastTravelCompositorClient/2.0",
        },
        body: JSON.stringify({
          username: this.config.username,
          password: this.config.password,
          micrositeId: this.config.micrositeId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`)
      }

      const data = await response.json()
      this.authToken = data.token
      const expirationMs = (data.expirationInSeconds || 7200) * 1000
      this.tokenExpiry = new Date(Date.now() + expirationMs - 60000)

      console.log("✅ Fast auth successful")
      return this.authToken
    } catch (error) {
      console.error("❌ Fast auth error:", error)
      throw error
    }
  }

  private async ensureValidToken(): Promise<string> {
    if (!this.authToken || !this.tokenExpiry || new Date() >= this.tokenExpiry) {
      await this.authenticate()
    }
    return this.authToken!
  }

  // Optimized booking fetch - gebruik alleen de snelste endpoints
  async getAllBookingsFromMicrosite(micrositeId: string): Promise<BookingData[]> {
    try {
      // Check cache eerst
      const cachedBookings = optimizedBookingCache.getBookings(micrositeId)
      if (cachedBookings) {
        return cachedBookings
      }

      console.log(`⚡ Fast fetching bookings from: ${micrositeId}`)

      const token = await this.ensureValidToken()

      // Gebruik alleen de snelste, meest betrouwbare endpoints
      const fastEndpoints = [
        // Meest recente data eerst (snelst)
        `/resources/booking/getBookings?microsite=${micrositeId}&from=20250601&to=20250630`,
        `/resources/booking/getBookings?microsite=${micrositeId}&from=20250101&to=20251231`,
      ]

      let allBookings: any[] = []

      // Parallel fetching voor snelheid
      const fetchPromises = fastEndpoints.map(async (endpoint) => {
        try {
          const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
              "Accept-Encoding": "gzip",
              "Travelc-Trace-Id": this.traceId,
            },
          })

          if (response.ok) {
            const data = await response.json()
            return data.bookedTrip || data.bookings || data || []
          }
          return []
        } catch (error) {
          console.log(`⚠️ Fast endpoint failed: ${endpoint}`)
          return []
        }
      })

      // Wacht op alle parallel requests
      const results = await Promise.all(fetchPromises)

      // Combineer resultaten en filter duplicaten
      for (const bookings of results) {
        if (Array.isArray(bookings) && bookings.length > 0) {
          const newBookings = bookings.filter(
            (newBooking: any) => !allBookings.some((existing: any) => existing.id === newBooking.id),
          )
          allBookings = [...allBookings, ...newBookings]
        }
      }

      // Sorteer voor consistentie
      allBookings.sort((a, b) => {
        const aNum = Number.parseInt(a.id?.replace(/\D/g, "") || "0")
        const bNum = Number.parseInt(b.id?.replace(/\D/g, "") || "0")
        return aNum - bNum
      })

      // Cache het resultaat
      optimizedBookingCache.setBookings(micrositeId, allBookings)

      console.log(`⚡ Fast fetch complete: ${allBookings.length} bookings from ${micrositeId}`)
      return allBookings
    } catch (error) {
      console.error(`❌ Fast fetch error for ${micrositeId}:`, error)
      return []
    }
  }

  // Super snelle booking search
  async findBooking(bookingId: string): Promise<BookingData | null> {
    try {
      // Check search cache eerst
      const cachedResult = optimizedBookingCache.getSearchResult(bookingId)
      if (cachedResult) {
        return cachedResult.booking
      }

      console.log(`⚡ Fast searching for: ${bookingId}`)

      const allBookings = await this.getAllBookingsFromMicrosite(this.config.micrositeId)

      // Optimized search met meerdere match strategieën
      const booking = allBookings.find((b: any) => {
        const possibleIds = [b.id, b.bookingId, b.reservationId, b.bookingReference, b.reference, b.tripId].filter(
          Boolean,
        )

        // Exact match eerst (snelst)
        if (possibleIds.some((id) => String(id).toLowerCase() === bookingId.toLowerCase())) {
          return true
        }

        // Partial match als backup
        return possibleIds.some(
          (id) =>
            String(id).toLowerCase().includes(bookingId.toLowerCase()) ||
            bookingId.toLowerCase().includes(String(id).toLowerCase()),
        )
      })

      // Cache het search resultaat
      optimizedBookingCache.setSearchResult(bookingId, { booking })

      if (booking) {
        console.log(`⚡ Fast search success: ${bookingId}`)
      } else {
        console.log(`⚡ Fast search: ${bookingId} not found`)
      }

      return booking || null
    } catch (error) {
      console.error("❌ Fast search error:", error)
      throw error
    }
  }
}

// Fast Multi-microsite client
export class FastMultiMicrositeClient {
  private clients: Map<string, FastTravelCompositorClient> = new Map()

  constructor(private credentials: Array<{ name: string; username: string; password: string; micrositeId: string }>) {
    this.credentials.forEach((cred) => {
      // Skip Config 2 (bekend probleem)
      if (cred.name.includes("Config 2")) {
        console.log(`⚠️ Skipping ${cred.name} - known auth issues`)
        return
      }

      const client = new FastTravelCompositorClient({
        username: cred.username,
        password: cred.password,
        micrositeId: cred.micrositeId,
      })
      this.clients.set(cred.micrositeId, client)
    })

    console.log(`⚡ Fast multi-microsite client ready with ${this.clients.size} working microsites`)
  }

  async searchBookingAcrossAllMicrosites(bookingId: string): Promise<{
    booking: BookingData | null
    foundInMicrosite: string | null
    searchResults: Array<{ microsite: string; found: boolean; bookingCount: number; error?: string }>
    searchTime: string
  }> {
    const startTime = Date.now()

    // Check global search cache eerst
    const cachedResult = optimizedBookingCache.getSearchResult(`multi_${bookingId}`)
    if (cachedResult) {
      return {
        ...cachedResult,
        searchTime: `${Date.now() - startTime}ms (cached)`,
      }
    }

    console.log(`⚡ Fast multi-search for: ${bookingId}`)

    const searchResults: Array<{ microsite: string; found: boolean; bookingCount: number; error?: string }> = []
    let foundBooking: BookingData | null = null
    let foundInMicrosite: string | null = null

    // Parallel search across all microsites
    const searchPromises = Array.from(this.clients.entries()).map(async ([micrositeId, client]) => {
      try {
        const booking = await client.findBooking(bookingId)
        const allBookings = await client.getAllBookingsFromMicrosite(micrositeId)

        return {
          micrositeId,
          booking,
          bookingCount: allBookings.length,
          found: !!booking,
        }
      } catch (error) {
        return {
          micrositeId,
          booking: null,
          bookingCount: 0,
          found: false,
          error: error instanceof Error ? error.message : String(error),
        }
      }
    })

    const results = await Promise.all(searchPromises)

    // Process results
    for (const result of results) {
      searchResults.push({
        microsite: result.micrositeId,
        found: result.found,
        bookingCount: result.bookingCount,
        error: result.error,
      })

      if (result.booking && !foundBooking) {
        foundBooking = result.booking
        foundInMicrosite = result.micrositeId
      }
    }

    const searchTime = `${Date.now() - startTime}ms`

    const finalResult = {
      booking: foundBooking,
      foundInMicrosite,
      searchResults,
      searchTime,
    }

    // Cache het multi-search resultaat
    optimizedBookingCache.setSearchResult(`multi_${bookingId}`, finalResult)

    console.log(`⚡ Fast multi-search complete in ${searchTime}`)
    return finalResult
  }
}

export function createFastTravelCompositorClient(configNumber = 1): FastTravelCompositorClient {
  const suffix = configNumber === 1 ? "" : `_${configNumber}`

  const config: TravelCompositorConfig = {
    username: process.env[`TRAVEL_COMPOSITOR_USERNAME${suffix}`]!,
    password: process.env[`TRAVEL_COMPOSITOR_PASSWORD${suffix}`]!,
    micrositeId: process.env[`TRAVEL_COMPOSITOR_MICROSITE_ID${suffix}`]!,
  }

  if (!config.username || !config.password || !config.micrositeId) {
    throw new Error(`Missing required Travel Compositor environment variables for config ${configNumber}`)
  }

  return new FastTravelCompositorClient(config)
}

export function createFastMultiMicrositeClient(): FastMultiMicrositeClient {
  const credentials = []

  for (let i = 1; i <= 3; i++) {
    const suffix = i === 1 ? "" : `_${i}`
    const username = process.env[`TRAVEL_COMPOSITOR_USERNAME${suffix}`]
    const password = process.env[`TRAVEL_COMPOSITOR_PASSWORD${suffix}`]
    const micrositeId = process.env[`TRAVEL_COMPOSITOR_MICROSITE_ID${suffix}`]

    if (username && password && micrositeId) {
      credentials.push({
        name: `Config ${i}`,
        username,
        password,
        micrositeId,
      })
    }
  }

  return new FastMultiMicrositeClient(credentials)
}
