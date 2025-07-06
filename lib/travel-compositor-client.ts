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

export interface PaginatedResponse {
  bookedTrip: BookingData[]
  pagination: {
    firstResult: number
    pageResults: number
    totalResults: number
  }
}

export class TravelCompositorClient {
  private _config: TravelCompositorConfig
  private authToken: string | null = null
  private tokenExpiry: Date | null = null
  private traceId: string

  constructor(config: TravelCompositorConfig) {
    this._config = {
      ...config,
      baseUrl: config.baseUrl || "https://online.travelcompositor.com",
    }
    // Generate unique trace ID for debugging
    this.traceId = `TC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  async authenticate(): Promise<string> {
    try {
      console.log("🔐 Authenticating with Travel Compositor...")

      const response = await fetch(`${this._config.baseUrl}/resources/authentication/authenticate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Encoding": "gzip",
          "Travelc-Trace-Id": this.traceId,
          "User-Agent": "TravelCompositorClient/1.0",
        },
        body: JSON.stringify({
          username: this._config.username,
          password: this._config.password,
          micrositeId: this._config.micrositeId,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Authentication failed:", response.status, errorText)
        throw new Error(`Authentication failed: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log("✅ Authentication successful")

      this.authToken = data.token

      if (!this.authToken) {
        console.error("❌ No token found in response:", data)
        throw new Error("No authentication token received")
      }

      const expirationMs = (data.expirationInSeconds || 7200) * 1000
      this.tokenExpiry = new Date(Date.now() + expirationMs - 60000)

      return this.authToken
    } catch (error) {
      console.error("❌ Authentication error:", error)
      throw error
    }
  }

  private async ensureValidToken(): Promise<string> {
    if (!this.authToken || !this.tokenExpiry || new Date() >= this.tokenExpiry) {
      console.log("🔄 Token expired or missing, re-authenticating...")
      await this.authenticate()
    }
    return this.authToken!
  }

  async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.ensureValidToken()

    return fetch(`${this._config.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        "auth-token": token,
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "Travelc-Trace-Id": this.traceId,
        "User-Agent": "TravelCompositorClient/1.0",
      },
    })
  }

  // Also expose the config for debugging
  get config() {
    return this._config
  }

  async getAllBookingsFromMicrosite(micrositeId: string): Promise<BookingData[]> {
    try {
      console.log(`📋 Fetching bookings from microsite: ${micrositeId}`)

      let allBookings: any[] = []

      // MULTIPLE DATE RANGES - zoek in 2025 en 2024 met volledige paginatie
      const dateRanges = [
        { from: "20250101", to: "20251231", name: "2025" },
        { from: "20240101", to: "20241231", name: "2024" },
      ]

      let pagesProcessed = 0

      for (const dateRange of dateRanges) {
        try {
          console.log(`📅 Processing date range: ${dateRange.name} (${dateRange.from} - ${dateRange.to})`)

          let firstResult = 0
          let hasMore = true
          const pageSize = 50 // Use smaller page size for reliability
          let currentPage = 0
          let totalResults = 0

          while (hasMore) {
            // Use the WORKING endpoint pattern we discovered
            const endpoint = `/resources/booking/getBookings?microsite=${micrositeId}&from=${dateRange.from}&to=${dateRange.to}&first=${firstResult}&limit=${pageSize}`

            console.log(`📄 Fetching page ${currentPage + 1} (results ${firstResult}-${firstResult + pageSize - 1})`)

            const response = await this.makeAuthenticatedRequest(endpoint)

            if (response.ok) {
              const data: PaginatedResponse = await response.json()

              if (data.bookedTrip && Array.isArray(data.bookedTrip)) {
                const pageBookings = data.bookedTrip

                // Filter duplicates based on ID
                const newBookings = pageBookings.filter(
                  (newBooking: any) => !allBookings.some((existing: any) => existing.id === newBooking.id),
                )

                allBookings = [...allBookings, ...newBookings]

                console.log(`✅ Page ${currentPage + 1}: ${pageBookings.length} bookings (+${newBookings.length} new)`)

                // Update pagination info
                if (data.pagination) {
                  totalResults = Math.max(totalResults, data.pagination.totalResults)
                  const expectedPages = Math.ceil(data.pagination.totalResults / pageSize)
                  hasMore = currentPage + 1 < expectedPages && pageBookings.length === pageSize
                } else {
                  // No pagination info, check if we got a full page
                  hasMore = pageBookings.length === pageSize
                }

                pagesProcessed++
                currentPage++
                firstResult += pageSize
              } else {
                console.log(`⚪ No bookings in page ${currentPage + 1}`)
                hasMore = false
              }
            } else {
              console.log(`❌ Page ${currentPage + 1} failed: ${response.status}`)
              hasMore = false
            }
          }
        } catch (error) {
          console.error(`❌ Error processing date range ${dateRange.name}:`, error)
        }
      }

      console.log(`🎯 Final results: ${allBookings.length} unique bookings from ${pagesProcessed} pages`)
      return allBookings
    } catch (error) {
      console.error(`❌ Error fetching bookings from ${micrositeId}:`, error)
      return []
    }
  }

  async getAllBookings(
    options: {
      limit?: number
      offset?: number
      fromDate?: string
      toDate?: string
      includeAll?: boolean
    } = {},
  ): Promise<BookingData[]> {
    // Voor backward compatibility - gebruik de geconfigureerde microsite
    return this.getAllBookingsFromMicrosite(this._config.micrositeId)
  }

  async getBooking(bookingId: string): Promise<BookingData | null> {
    try {
      console.log(`🔍 Fetching booking: ${bookingId}`)

      const allBookings = await this.getAllBookings()
      console.log(`📋 Searching through ${allBookings.length} bookings for ID: ${bookingId}`)

      // Try multiple possible ID fields and formats
      const booking = allBookings.find((b: any) => {
        const possibleIds = [b.id, b.bookingId, b.reservationId, b.bookingReference, b.reference, b.tripId].filter(
          Boolean,
        )

        return possibleIds.some(
          (id) =>
            String(id).toLowerCase() === bookingId.toLowerCase() ||
            String(id).toLowerCase().includes(bookingId.toLowerCase()) ||
            bookingId.toLowerCase().includes(String(id).toLowerCase()),
        )
      })

      if (booking) {
        console.log("✅ Found booking:", {
          id: booking.id,
          bookingId: booking.bookingId,
          reference: booking.reference || booking.bookingReference,
          title: booking.title || booking.name,
        })
        return booking
      }

      console.log("❌ Booking not found in current microsite")
      return null
    } catch (error) {
      console.error("❌ Error fetching booking:", error)
      throw error
    }
  }

  async getBookingVouchers(bookingId: string): Promise<any[]> {
    try {
      console.log(`🎫 Fetching vouchers for booking: ${bookingId}`)
      // Implementation for vouchers
      return []
    } catch (error) {
      console.error("❌ Error fetching vouchers:", error)
      return []
    }
  }

  async getBookingByReference(bookingReference: string): Promise<any> {
    try {
      console.log(`📋 Fetching booking by reference: ${bookingReference}`)

      const endpoint = `/resources/booking/${bookingReference}`
      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Booking details retrieved for ${bookingReference}`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get booking details: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get booking details: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching booking by reference:", error)
      throw error
    }
  }

  // NEW: Get booking with full details using the working endpoint pattern
  async getBookingWithFullDetails(bookingReference: string): Promise<any> {
    try {
      console.log(`🔍 Fetching full booking details for: ${bookingReference}`)

      // First try to get the booking from our list
      const allBookings = await this.getAllBookings()
      const booking = allBookings.find(
        (b: any) =>
          b.id === bookingReference ||
          b.bookingReference === bookingReference ||
          b.customBookingReference === bookingReference,
      )

      if (booking) {
        console.log(`✅ Found full booking details for ${bookingReference}`)
        return booking
      }

      // If not found in list, try direct endpoint
      return await this.getBookingByReference(bookingReference)
    } catch (error) {
      console.error("❌ Error fetching full booking details:", error)
      throw error
    }
  }

  // NEW: Transform booking data to roadbook format
  transformBookingToRoadbook(booking: any): any {
    try {
      console.log(`🔄 Transforming booking ${booking.id} to roadbook format`)

      const contactPerson = booking.contactPerson || {}
      const user = booking.user || {}
      const agency = user.agency || {}

      // Extract destinations from hotels
      const destinations = new Set<string>()
      if (booking.hotelservice) {
        booking.hotelservice.forEach((hotel: any) => {
          if (hotel.locationName) destinations.add(hotel.locationName)
          if (hotel.destinationName) destinations.add(hotel.destinationName)
        })
      }

      // Transform hotels
      const hotels = (booking.hotelservice || []).map((hotel: any) => ({
        id: hotel.id,
        name: hotel.hotelName,
        location: hotel.locationName,
        checkIn: hotel.startDate,
        checkOut: hotel.endDate,
        nights: hotel.nights,
        category: hotel.category,
        mealPlan: hotel.mealPlan,
        provider: hotel.providerDescription,
        address: hotel.hotelData?.address,
        phone: hotel.hotelData?.phoneNumber,
        rooms: hotel.room || [],
        remarks: hotel.remarks || [],
        totalPrice: hotel.pricebreakdown?.totalPrice?.microsite?.amount,
        currency: hotel.pricebreakdown?.totalPrice?.microsite?.currency,
      }))

      // Transform transport
      const transports = (booking.transportservice || []).map((transport: any) => ({
        id: transport.id,
        type: "FLIGHT",
        provider: transport.providerDescription,
        departureAirport: transport.departureAirport,
        arrivalAirport: transport.arrivalAirport,
        departureDate: transport.startDate,
        arrivalDate: transport.endDate,
        returnDepartureAirport: transport.returnDepartureAirport,
        returnArrivalAirport: transport.returnArrivalAirport,
        returnDepartureDate: transport.returnDepartureDate,
        returnArrivalDate: transport.returnArrivalDate,
        segments: transport.segment || [],
        totalPrice: transport.pricebreakdown?.totalPrice?.microsite?.amount,
        currency: transport.pricebreakdown?.totalPrice?.microsite?.currency,
      }))

      // Transform car rentals
      const cars = (booking.carservice || []).map((car: any) => ({
        id: car.id,
        provider: car.providerDescription,
        vendor: car.vendor,
        vehicleName: car.vehicleName,
        pickup: car.pickup,
        dropoff: car.dropoff,
        startDate: car.startDate,
        endDate: car.endDate,
        totalPrice: car.pricebreakdown?.totalPrice?.microsite?.amount,
        currency: car.pricebreakdown?.totalPrice?.microsite?.currency,
      }))

      const roadbook = {
        id: booking.id,
        bookingReference: booking.bookingReference,
        title: `${booking.bookingReference} - ${Array.from(destinations).join(" & ")}`,
        status: booking.status,
        tripType: booking.tripType,
        client: {
          name:
            contactPerson.name && contactPerson.lastName
              ? `${contactPerson.name} ${contactPerson.lastName}`.trim()
              : contactPerson.name || "Unknown",
          email: contactPerson.email || user.email,
          phone: contactPerson.phone
            ? `${contactPerson.phoneCountryCode || ""} ${contactPerson.phone}`.trim()
            : user.telephone,
          company: agency.name,
        },
        period: {
          startDate: booking.startDate,
          endDate: booking.endDate,
          duration: booking.nightsCount || 0,
        },
        destinations: Array.from(destinations).map((name) => ({ name })),
        hotels,
        transports,
        cars,
        totalPrice: booking.pricebreakdown?.totalPrice?.microsite?.amount,
        currency: booking.pricebreakdown?.totalPrice?.microsite?.currency,
        voucherUrl: booking.voucherUrl,
        ideaUrl: booking.ideaUrl,
        creationDate: booking.creationDate,
        rawData: booking, // Keep original data for debugging
      }

      console.log(`✅ Transformed booking to roadbook:`, {
        id: roadbook.id,
        title: roadbook.title,
        hotels: hotels.length,
        transports: transports.length,
        cars: cars.length,
        destinations: destinations.size,
      })

      return roadbook
    } catch (error) {
      console.error("❌ Error transforming booking to roadbook:", error)
      throw error
    }
  }
}

/* -----------------------------------------------------------------------
 *  FACTORY HELPERS & ENV-AWARE UTILITIES
 *  These are used throughout the dashboard/tests and must stay in-sync
 * -------------------------------------------------------------------- */

/**
 * Create a TravelCompositorClient based on one of up-to-four
 * credential sets supplied via environment variables.
 */
export function createTravelCompositorClient(configNumber: 1 | 2 | 3 | 4 = 1): TravelCompositorClient {
  const suffix = configNumber === 1 ? "" : `_${configNumber}`

  const username = process.env[`TRAVEL_COMPOSITOR_USERNAME${suffix}`]
  const password = process.env[`TRAVEL_COMPOSITOR_PASSWORD${suffix}`]
  const micrositeId = process.env[`TRAVEL_COMPOSITOR_MICROSITE_ID${suffix}`]

  if (!username || !password || !micrositeId) {
    throw new Error(`Missing Travel Compositor env vars for config ${configNumber}`)
  }

  return new TravelCompositorClient({ username, password, micrositeId })
}

/**
 * Same as `createTravelCompositorClient` but kept for backward-compat
 * with older services that expect the “Fast” variant.
 */
export function createFastTravelCompositorClient(configNumber: 1 | 2 | 3 | 4 = 1): TravelCompositorClient {
  return createTravelCompositorClient(configNumber)
}

/**
 * Build a map of clients – one per working microsite.
 */
export class MultiMicrositeClient {
  private clients: Map<string, TravelCompositorClient> = new Map()

  constructor(
    creds: Array<{
      name: string
      username: string
      password: string
      micrositeId: string
    }>,
  ) {
    for (const c of creds) {
      this.clients.set(c.name, new TravelCompositorClient(c))
    }
  }

  getClient(name: string): TravelCompositorClient | undefined {
    return this.clients.get(name)
  }

  getAllClients(): TravelCompositorClient[] {
    return Array.from(this.clients.values())
  }

  async searchBookingAcrossAllMicrosites(
    bookingId: string,
  ): Promise<{ client: TravelCompositorClient; booking: any } | null> {
    console.log(`🔍 Searching for booking ${bookingId} across all microsites`)

    for (const [name, client] of this.clients) {
      try {
        console.log(`🔍 Searching in ${name} (${client.config.micrositeId})`)
        const booking = await client.getBookingWithFullDetails(bookingId)

        if (booking) {
          console.log(`✅ Found booking ${bookingId} in ${name}`)
          return { client, booking }
        }
      } catch (error) {
        console.log(`⚠️ Error searching in ${name}:`, error)
      }
    }

    console.log(`❌ Booking ${bookingId} not found in any microsite`)
    return null
  }
}

/**
 * Build a map of clients – one per working microsite.
 */
export function createMultiMicrositeClient(): MultiMicrositeClient {
  const creds: Array<{
    name: string
    username: string
    password: string
    micrositeId: string
  }> = []

  for (let i = 1 as 1 | 2 | 3 | 4; i <= 4; i++) {
    const suffix = i === 1 ? "" : `_${i}`
    const username = process.env[`TRAVEL_COMPOSITOR_USERNAME${suffix}`]
    const password = process.env[`TRAVEL_COMPOSITOR_PASSWORD${suffix}`]
    const micrositeId = process.env[`TRAVEL_COMPOSITOR_MICROSITE_ID${suffix}`]

    // Skip if any piece is missing
    if (!username || !password || !micrositeId) continue

    creds.push({ name: `Config ${i}`, username, password, micrositeId })
  }

  if (creds.length === 0) {
    throw new Error("No valid Travel Compositor credentials found.")
  }

  return new MultiMicrositeClient(creds)
}

/**
 * Return an array with the indexes (1, 2, 3, 4) of every credential
 * group that exists in the current environment.
 */
export function getAvailableConfigurations(): number[] {
  const configs: number[] = []

  for (let i = 1 as 1 | 2 | 3 | 4; i <= 4; i++) {
    const suffix = i === 1 ? "" : `_${i}`
    const username = process.env[`TRAVEL_COMPOSITOR_USERNAME${suffix}`]
    const password = process.env[`TRAVEL_COMPOSITOR_PASSWORD${suffix}`]
    const micrositeId = process.env[`TRAVEL_COMPOSITOR_MICROSITE_ID${suffix}`]

    if (username && password && micrositeId) configs.push(i)
  }

  return configs
}
