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

      // MULTIPLE DATE RANGES - zoek in 2025 en 2026 met volledige paginatie
      const dateRanges = [
        { from: "20250101", to: "20251231", name: "2025" },
        { from: "20260101", to: "20261231", name: "2026" },
      ]

      let pagesProcessed = 0

      for (const dateRange of dateRanges) {
        try {
          console.log(`📅 Processing date range: ${dateRange.name} (${dateRange.from} - ${dateRange.to})`)

          const firstResult = 0
          let hasMore = true
          const pageSize = 100 // API geeft 100 per pagina
          let currentPage = 0
          let totalResults = 0

          while (hasMore) {
            const endpoint = `/resources/booking/getBookings?microsite=${micrositeId}&from=${dateRange.from}&to=${dateRange.to}&firstResult=${firstResult}&maxResults=${pageSize}`

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

  async getServiceCancellationFee(bookingReference: string, serviceType: string): Promise<any> {
    try {
      console.log(`💰 Fetching cancellation fee for ${serviceType} in booking ${bookingReference}`)

      const endpoint = `/resources/booking/${bookingReference}/cancellation-fee?serviceType=${encodeURIComponent(serviceType)}`
      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Cancellation fee retrieved for ${serviceType}`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get cancellation fee: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get cancellation fee: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching service cancellation fee:", error)
      throw error
    }
  }

  async getAllServiceCancellationFees(bookingReference: string): Promise<any> {
    try {
      console.log(`💰 Fetching all cancellation fees for booking ${bookingReference}`)

      // Common service types based on the API documentation
      const serviceTypes = [
        "ACCOMMODATION",
        "TRANSPORT",
        "ACTIVITY",
        "TICKET",
        "HOTEL",
        "FLIGHT",
        "TRANSFER",
        "EXCURSION",
        "MEAL",
        "GUIDE",
        "INSURANCE",
      ]

      const cancellationFees: any = {}

      for (const serviceType of serviceTypes) {
        try {
          const fee = await this.getServiceCancellationFee(bookingReference, serviceType)
          if (fee && fee.cancellationFee) {
            cancellationFees[serviceType] = fee
          }
        } catch (error) {
          // Service type might not exist for this booking, continue
          console.log(`⚪ No ${serviceType} cancellation fee available`)
        }
      }

      console.log(`✅ Retrieved cancellation fees for ${Object.keys(cancellationFees).length} service types`)
      return cancellationFees
    } catch (error) {
      console.error("❌ Error fetching all service cancellation fees:", error)
      throw error
    }
  }

  // Detailed booking information methods
  async getAccommodationDetails(bookingReference: string, accommodationBookingReference: string): Promise<any> {
    try {
      console.log(
        `🏨 Fetching accommodation details: ${accommodationBookingReference} from booking ${bookingReference}`,
      )

      const endpoint = `/resources/booking/${bookingReference}/accommodations/${accommodationBookingReference}`
      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Accommodation details retrieved for ${accommodationBookingReference}`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get accommodation details: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get accommodation details: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching accommodation details:", error)
      throw error
    }
  }

  async getAccommodationCancellationFee(bookingReference: string, accommodationBookingReference: string): Promise<any> {
    try {
      console.log(`💰 Fetching accommodation cancellation fee: ${accommodationBookingReference}`)

      const endpoint = `/resources/booking/${bookingReference}/accommodations/${accommodationBookingReference}/cancellation-fee`
      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Accommodation cancellation fee retrieved`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get accommodation cancellation fee: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get accommodation cancellation fee: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching accommodation cancellation fee:", error)
      throw error
    }
  }

  async getTicketDetails(bookingReference: string, ticketBookingReference: string): Promise<any> {
    try {
      console.log(`🎫 Fetching ticket details: ${ticketBookingReference} from booking ${bookingReference}`)

      const endpoint = `/resources/booking/${bookingReference}/tickets/${ticketBookingReference}`
      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Ticket details retrieved for ${ticketBookingReference}`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get ticket details: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get ticket details: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching ticket details:", error)
      throw error
    }
  }

  async getTicketCancellationFee(bookingReference: string, ticketBookingReference: string): Promise<any> {
    try {
      console.log(`💰 Fetching ticket cancellation fee: ${ticketBookingReference}`)

      const endpoint = `/resources/booking/${bookingReference}/tickets/${ticketBookingReference}/cancellation-fee`
      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Ticket cancellation fee retrieved`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get ticket cancellation fee: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get ticket cancellation fee: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching ticket cancellation fee:", error)
      throw error
    }
  }

  async getTransportDetails(bookingReference: string, transportBookingReference: string): Promise<any> {
    try {
      console.log(`✈️ Fetching transport details: ${transportBookingReference} from booking ${bookingReference}`)

      const endpoint = `/resources/booking/${bookingReference}/transports/${transportBookingReference}`
      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Transport details retrieved for ${transportBookingReference}`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get transport details: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get transport details: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching transport details:", error)
      throw error
    }
  }

  async getTransportCancellationFee(bookingReference: string, transportBookingReference: string): Promise<any> {
    try {
      console.log(`💰 Fetching transport cancellation fee: ${transportBookingReference}`)

      const endpoint = `/resources/booking/${bookingReference}/transports/${transportBookingReference}/cancellation-fee`
      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Transport cancellation fee retrieved`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get transport cancellation fee: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get transport cancellation fee: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching transport cancellation fee:", error)
      throw error
    }
  }

  // Supplier and Contract Management Methods

  async getClosedTourOptions(supplierId: number, closedTourCode: string, optionCode: string): Promise<any> {
    try {
      console.log(`🎯 Fetching closed tour options: ${closedTourCode}/${optionCode} from supplier ${supplierId}`)

      const endpoint = `/resources/closedtour/${supplierId}/${closedTourCode}/${optionCode}`
      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Closed tour options retrieved for ${closedTourCode}/${optionCode}`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get closed tour options: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get closed tour options: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching closed tour options:", error)
      throw error
    }
  }

  async getGolfContractsBySupplierId(supplierId: number, first = 0, limit = 100): Promise<any> {
    try {
      console.log(`⛳ Fetching golf contracts from supplier ${supplierId} (first: ${first}, limit: ${limit})`)

      const endpoint = `/resources/golf/${supplierId}?first=${first}&limit=${limit}`
      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Golf contracts retrieved from supplier ${supplierId}`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get golf contracts: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get golf contracts: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching golf contracts:", error)
      throw error
    }
  }

  async getGolfContractDetails(supplierId: number, contractCode: string): Promise<any> {
    try {
      console.log(`⛳ Fetching golf contract details: ${contractCode} from supplier ${supplierId}`)

      const endpoint = `/resources/golf/${supplierId}/${contractCode}`
      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Golf contract details retrieved for ${contractCode}`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get golf contract details: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get golf contract details: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching golf contract details:", error)
      throw error
    }
  }

  async getHotelsBySupplierId(supplierId: number): Promise<any> {
    try {
      console.log(`🏨 Fetching hotels from supplier ${supplierId}`)

      const endpoint = `/resources/hotel/${supplierId}`
      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Hotels retrieved from supplier ${supplierId}`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get hotels: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get hotels: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching hotels:", error)
      throw error
    }
  }

  async getHotelByProviderCode(supplierId: number, providerCode: string): Promise<any> {
    try {
      console.log(`🏨 Fetching hotel details: ${providerCode} from supplier ${supplierId}`)

      const endpoint = `/resources/hotel/${supplierId}/${providerCode}`
      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Hotel details retrieved for ${providerCode}`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get hotel details: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get hotel details: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching hotel details:", error)
      throw error
    }
  }

  // Comprehensive supplier data methods
  async getAllGolfContractsFromSupplier(supplierId: number): Promise<any[]> {
    try {
      console.log(`⛳ Fetching ALL golf contracts from supplier ${supplierId}`)

      let allContracts: any[] = []
      let first = 0
      const limit = 100
      let hasMore = true

      while (hasMore) {
        const response = await this.getGolfContractsBySupplierId(supplierId, first, limit)

        if (response.golfcontracts && response.golfcontracts.length > 0) {
          allContracts = [...allContracts, ...response.golfcontracts]
          console.log(`📄 Retrieved ${response.golfcontracts.length} golf contracts (total: ${allContracts.length})`)

          // Check if we have more data
          if (response.pagination) {
            const { totalResults, pageResults } = response.pagination
            hasMore = first + pageResults < totalResults
          } else {
            hasMore = response.golfcontracts.length === limit
          }

          first += limit
        } else {
          hasMore = false
        }

        // Safety check
        if (first > 10000) {
          console.log("⚠️ Safety limit reached for golf contracts")
          hasMore = false
        }
      }

      console.log(`✅ Retrieved ${allContracts.length} total golf contracts from supplier ${supplierId}`)
      return allContracts
    } catch (error) {
      console.error("❌ Error fetching all golf contracts:", error)
      throw error
    }
  }

  async getSupplierInventoryOverview(supplierId: number): Promise<any> {
    try {
      console.log(`📊 Getting complete inventory overview for supplier ${supplierId}`)

      const overview = {
        supplierId,
        hotels: [],
        golfContracts: [],
        totalHotels: 0,
        totalGolfContracts: 0,
        retrievedAt: new Date().toISOString(),
      }

      // Get all hotels
      try {
        const hotelsResponse = await this.getHotelsBySupplierId(supplierId)
        overview.hotels = hotelsResponse.hotel || []
        overview.totalHotels = overview.hotels.length
        console.log(`🏨 Found ${overview.totalHotels} hotels`)
      } catch (error) {
        console.log(`⚠️ Could not retrieve hotels for supplier ${supplierId}:`, error)
      }

      // Get all golf contracts
      try {
        const golfContracts = await this.getAllGolfContractsFromSupplier(supplierId)
        overview.golfContracts = golfContracts
        overview.totalGolfContracts = golfContracts.length
        console.log(`⛳ Found ${overview.totalGolfContracts} golf contracts`)
      } catch (error) {
        console.log(`⚠️ Could not retrieve golf contracts for supplier ${supplierId}:`, error)
      }

      console.log(
        `✅ Supplier ${supplierId} inventory: ${overview.totalHotels} hotels, ${overview.totalGolfContracts} golf contracts`,
      )
      return overview
    } catch (error) {
      console.error("❌ Error getting supplier inventory overview:", error)
      throw error
    }
  }

  // Content and Inventory Management Methods

  async getAccommodationDatasheet(accommodationId: string, language = "en"): Promise<any> {
    try {
      console.log(`🏨 Fetching accommodation datasheet: ${accommodationId} (language: ${language})`)

      const endpoint = `/resources/accommodations/${accommodationId}/datasheet?lang=${language}`
      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Accommodation datasheet retrieved for ${accommodationId}`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get accommodation datasheet: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get accommodation datasheet: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching accommodation datasheet:", error)
      throw error
    }
  }

  async getActiveAccommodations(first = 0, limit = 100): Promise<any> {
    try {
      console.log(`🏨 Fetching active accommodations (first: ${first}, limit: ${limit})`)

      const endpoint = `/resources/accommodations?first=${first}&limit=${limit}`
      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Active accommodations retrieved`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get active accommodations: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get active accommodations: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching active accommodations:", error)
      throw error
    }
  }

  async getAccommodationDatasheets(accommodationIds: string[], language = "en"): Promise<any> {
    try {
      console.log(
        `🏨 Fetching accommodation datasheets for ${accommodationIds.length} properties (language: ${language})`,
      )

      const endpoint = `/resources/accommodations/datasheet?accommodationId=${accommodationIds.join(",")}&lang=${language}`
      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Accommodation datasheets retrieved for ${accommodationIds.length} properties`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get accommodation datasheets: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get accommodation datasheets: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching accommodation datasheets:", error)
      throw error
    }
  }

  async getPreferredAccommodations(
    micrositeId: string,
    options: {
      destinationId?: string
      countryCode?: string
      first?: number
      limit?: number
      language?: string
    } = {},
  ): Promise<any> {
    try {
      console.log(`🏨 Fetching preferred accommodations for microsite: ${micrositeId}`)

      const params = new URLSearchParams()
      if (options.destinationId) params.append("destinationId", options.destinationId)
      if (options.countryCode) params.append("countryCode", options.countryCode)
      if (options.first !== undefined) params.append("first", options.first.toString())
      if (options.limit !== undefined) params.append("limit", options.limit.toString())
      if (options.language) params.append("lang", options.language)

      const queryString = params.toString()
      const endpoint = `/resources/accommodations/preferred/${micrositeId}${queryString ? `?${queryString}` : ""}`

      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Preferred accommodations retrieved for microsite ${micrositeId}`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get preferred accommodations: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get preferred accommodations: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching preferred accommodations:", error)
      throw error
    }
  }

  async getAirlinesByMicrosite(micrositeId: string, language = "en"): Promise<any> {
    try {
      console.log(`✈️ Fetching airlines for microsite: ${micrositeId} (language: ${language})`)

      const endpoint = `/resources/airline/${micrositeId}?lang=${language}`
      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Airlines retrieved for microsite ${micrositeId}`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get airlines: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get airlines: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching airlines:", error)
      throw error
    }
  }

  async getCruiseDepartures(micrositeId: string, cruiseId: string): Promise<any> {
    try {
      console.log(`🚢 Fetching cruise departures for cruise: ${cruiseId} in microsite: ${micrositeId}`)

      const endpoint = `/resources/cruise/${micrositeId}/${cruiseId}/departures`
      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Cruise departures retrieved for cruise ${cruiseId}`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get cruise departures: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get cruise departures: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching cruise departures:", error)
      throw error
    }
  }

  // Comprehensive cruise data methods
  async getAllCruisePortsComplete(): Promise<any[]> {
    try {
      console.log(`🏝️ Fetching ALL cruise ports`)

      let allPorts: any[] = []
      let first = 0
      const limit = 100
      let hasMore = true

      while (hasMore) {
        const response = await this.getAllCruisePorts(first, limit)

        if (response.cruisePort && response.cruisePort.length > 0) {
          allPorts = [...allPorts, ...response.cruisePort]
          console.log(`📄 Retrieved ${response.cruisePort.length} cruise ports (total: ${allPorts.length})`)

          // Check if we have more data
          if (response.pagination) {
            const { totalResults, pageResults } = response.pagination
            hasMore = first + pageResults < totalResults
          } else {
            hasMore = response.cruisePort.length === limit
          }

          first += limit
        } else {
          hasMore = false
        }

        // Safety check
        if (first > 10000) {
          console.log("⚠️ Safety limit reached for cruise ports")
          hasMore = false
        }
      }

      console.log(`✅ Retrieved ${allPorts.length} total cruise ports`)
      return allPorts
    } catch (error) {
      console.error("❌ Error fetching all cruise ports:", error)
      throw error
    }
  }

  async getCruiseShip(micrositeId: string, shipId: string, language = "en"): Promise<any> {
    try {
      console.log(`🛳️ Fetching cruise ship: ${shipId} for microsite: ${micrositeId}`)

      const endpoint = `/resources/cruise/${micrositeId}/ship/${shipId}?lang=${language}`
      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Cruise ship retrieved for ${shipId}`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get cruise ship: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get cruise ship: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching cruise ship:", error)
      throw error
    }
  }

  async getAllCruiseShips(
    micrositeId: string,
    options: {
      cruiseLine?: string
      first?: number
      limit?: number
    } = {},
  ): Promise<any> {
    try {
      console.log(`🛳️ Fetching all cruise ships for microsite: ${micrositeId}`)

      const params = new URLSearchParams()
      if (options.cruiseLine) params.append("cruiseLine", options.cruiseLine)
      if (options.first !== undefined) params.append("first", options.first.toString())
      if (options.limit !== undefined) params.append("limit", options.limit.toString())

      const queryString = params.toString()
      const endpoint = `/resources/cruise/${micrositeId}/ship${queryString ? `?${queryString}` : ""}`

      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ All cruise ships retrieved for microsite ${micrositeId}`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get all cruise ships: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get all cruise ships: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching all cruise ships:", error)
      throw error
    }
  }

  // Comprehensive cruise data methods
  async getAllCruisePortsComplete(): Promise<any[]> {
    try {
      console.log(`🏝️ Fetching ALL cruise ports`)

      let allPorts: any[] = []
      let first = 0
      const limit = 100
      let hasMore = true

      while (hasMore) {
        const response = await this.getAllCruisePorts(first, limit)

        if (response.cruisePort && response.cruisePort.length > 0) {
          allPorts = [...allPorts, ...response.cruisePort]
          console.log(`📄 Retrieved ${response.cruisePort.length} cruise ports (total: ${allPorts.length})`)

          // Check if we have more data
          if (response.pagination) {
            const { totalResults, pageResults } = response.pagination
            hasMore = first + pageResults < totalResults
          } else {
            hasMore = response.cruisePort.length === limit
          }

          first += limit
        } else {
          hasMore = false
        }

        // Safety check
        if (first > 10000) {
          console.log("⚠️ Safety limit reached for cruise ports")
          hasMore = false
        }
      }

      console.log(`✅ Retrieved ${allPorts.length} total cruise ports`)
      return allPorts
    } catch (error) {
      console.error("❌ Error fetching all cruise ports:", error)
      throw error
    }
  }

  async getCruiseShip(micrositeId: string, shipId: string, language = "en"): Promise<any> {
    try {
      console.log(`🛳️ Fetching cruise ship: ${shipId} for microsite: ${micrositeId}`)

      const endpoint = `/resources/cruise/${micrositeId}/ship/${shipId}?lang=${language}`
      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Cruise ship retrieved for ${shipId}`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get cruise ship: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get cruise ship: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching cruise ship:", error)
      throw error
    }
  }

  async getAllCruiseShips(
    micrositeId: string,
    options: {
      cruiseLine?: string
      first?: number
      limit?: number
    } = {},
  ): Promise<any> {
    try {
      console.log(`🛳️ Fetching all cruise ships for microsite: ${micrositeId}`)

      const params = new URLSearchParams()
      if (options.cruiseLine) params.append("cruiseLine", options.cruiseLine)
      if (options.first !== undefined) params.append("first", options.first.toString())
      if (options.limit !== undefined) params.append("limit", options.limit.toString())

      const queryString = params.toString()
      const endpoint = `/resources/cruise/${micrositeId}/ship${queryString ? `?${queryString}` : ""}`

      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ All cruise ships retrieved for microsite ${micrositeId}`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get all cruise ships: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get all cruise ships: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching all cruise ships:", error)
      throw error
    }
  }

  // Comprehensive cruise data methods
  async getAllCruisePortsComplete(): Promise<any[]> {
    try {
      console.log(`🏝️ Fetching ALL cruise ports`)

      let allPorts: any[] = []
      let first = 0
      const limit = 100
      let hasMore = true

      while (hasMore) {
        const response = await this.getAllCruisePorts(first, limit)

        if (response.cruisePort && response.cruisePort.length > 0) {
          allPorts = [...allPorts, ...response.cruisePort]
          console.log(`📄 Retrieved ${response.cruisePort.length} cruise ports (total: ${allPorts.length})`)

          // Check if we have more data
          if (response.pagination) {
            const { totalResults, pageResults } = response.pagination
            hasMore = first + pageResults < totalResults
          } else {
            hasMore = response.cruisePort.length === limit
          }

          first += limit
        } else {
          hasMore = false
        }

        // Safety check
        if (first > 10000) {
          console.log("⚠️ Safety limit reached for cruise ports")
          hasMore = false
        }
      }

      console.log(`✅ Retrieved ${allPorts.length} total cruise ports`)
      return allPorts
    } catch (error) {
      console.error("❌ Error fetching all cruise ports:", error)
      throw error
    }
  }

  async getAllCruiseShipsComplete(micrositeId: string, cruiseLine?: string): Promise<any[]> {
    try {
      console.log(
        `🛳️ Fetching ALL cruise ships for microsite: ${micrositeId}${cruiseLine ? ` (cruise line: ${cruiseLine})` : ""}`,
      )

      let allShips: any[] = []
      let first = 0
      const limit = 100
      let hasMore = true

      while (hasMore) {
        const response = await this.getAllCruiseShips(micrositeId, {
          cruiseLine,
          first,
          limit,
        })

        if (response.cruiseShip && response.cruiseShip.length > 0) {
          allShips = [...allShips, ...response.cruiseShip]
          console.log(`📄 Retrieved ${response.cruiseShip.length} cruise ships (total: ${allShips.length})`)

          // Check if we have more data
          if (response.pagination) {
            const { totalResults, pageResults } = response.pagination
            hasMore = first + pageResults < totalResults
          } else {
            hasMore = response.cruiseShip.length === limit
          }

          first += limit
        } else {
          hasMore = false
        }

        // Safety check
        if (first > 10000) {
          console.log("⚠️ Safety limit reached for cruise ships")
          hasMore = false
        }
      }

      console.log(`✅ Retrieved ${allShips.length} total cruise ships`)
      return allShips
    } catch (error) {
      console.error("❌ Error fetching all cruise ships:", error)
      throw error
    }
  }

  async getEnhancedCruiseDetails(micrositeId: string, cruiseId: string): Promise<any> {
    try {
      console.log(`🚢 Getting enhanced cruise details for: ${cruiseId}`)

      // Get basic cruise information from the catalog
      const allCruises = await this.getAllCruises(micrositeId, { first: 0, limit: 100 })
      const cruise = allCruises.cruiseDatasheet?.find((c: any) => c.id === cruiseId)

      if (!cruise) {
        throw new Error(`Cruise ${cruiseId} not found`)
      }

      const enhancedCruise = { ...cruise }

      // Get detailed itinerary
      try {
        const itinerary = await this.getCruiseItinerary(cruiseId)
        enhancedCruise.detailedItinerary = itinerary
      } catch (error) {
        console.log(`⚠️ Could not get detailed itinerary for cruise ${cruiseId}:`, error)
      }

      // Get cruise line characteristics
      if (cruise.cruiseLine) {
        try {
          const cruiseLineInfo = await this.getCruiseLineCharacteristics(micrositeId, cruise.cruiseLine)
          enhancedCruise.cruiseLineCharacteristics = cruiseLineInfo
        } catch (error) {
          console.log(`⚠️ Could not get cruise line characteristics for ${cruise.cruiseLine}:`, error)
        }
      }

      // Get ship details
      if (cruise.shipId) {
        try {
          const shipDetails = await this.getCruiseShip(micrositeId, cruise.shipId)
          enhancedCruise.shipDetails = shipDetails
        } catch (error) {
          console.log(`⚠️ Could not get ship details for ${cruise.shipId}:`, error)
        }
      }

      // Get departure information
      try {
        const departures = await this.getCruiseDepartures(micrositeId, cruiseId)
        enhancedCruise.departures = departures
      } catch (error) {
        console.log(`⚠️ Could not get departures for cruise ${cruiseId}:`, error)
      }

      console.log(`✅ Enhanced cruise details retrieved for ${cruiseId}`)
      return enhancedCruise
    } catch (error) {
      console.error("❌ Error getting enhanced cruise details:", error)
      throw error
    }
  }

  // Destination and Content Management Methods

  async getCountriesByMicrosite(micrositeId: string, language = "en"): Promise<any> {
    try {
      console.log(`🌍 Fetching countries for microsite: ${micrositeId} (language: ${language})`)

      const endpoint = `/resources/destination/countries/${micrositeId}?lang=${language}`
      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Countries retrieved for microsite ${micrositeId}`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get countries: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get countries: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching countries:", error)
      throw error
    }
  }

  async getDestinationById(micrositeId: string, destinationId: string, language = "en"): Promise<any> {
    try {
      console.log(`🏙️ Fetching destination: ${destinationId} for microsite: ${micrositeId} (language: ${language})`)

      const endpoint = `/resources/destination/${micrositeId}/${destinationId}?lang=${language}`
      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Destination retrieved for ${destinationId}`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get destination: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get destination: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching destination:", error)
      throw error
    }
  }

  async getDestinationsByMicrosite(
    micrositeId: string,
    options: {
      countryCode?: string
      language?: string
      iata?: string
    } = {},
  ): Promise<any> {
    try {
      console.log(`🏙️ Fetching destinations for microsite: ${micrositeId}`)

      const params = new URLSearchParams()
      if (options.countryCode) params.append("countryCode", options.countryCode)
      if (options.language) params.append("lang", options.language)
      if (options.iata) params.append("iata", options.iata)

      const queryString = params.toString()
      const endpoint = `/resources/destination/${micrositeId}${queryString ? `?${queryString}` : ""}`

      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Destinations retrieved for microsite ${micrositeId}`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get destinations: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get destinations: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching destinations:", error)
      throw error
    }
  }

  async getAllFacilities(language = "en"): Promise<any> {
    try {
      console.log(`🏨 Fetching all facilities (language: ${language})`)

      const endpoint = `/resources/facilities?lang=${language}`
      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ All facilities retrieved`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get facilities: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get facilities: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching facilities:", error)
      throw error
    }
  }

  async getMealPlansByMicrosite(micrositeId: string, language = "en"): Promise<any> {
    try {
      console.log(`🍽️ Fetching meal plans for microsite: ${micrositeId} (language: ${language})`)

      const endpoint = `/resources/mealplan/${micrositeId}?lang=${language}`
      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Meal plans retrieved for microsite ${micrositeId}`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get meal plans: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get meal plans: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching meal plans:", error)
      throw error
    }
  }

  async getProviderConfigurations(micrositeId: string): Promise<any> {
    try {
      console.log(`⚙️ Fetching provider configurations for microsite: ${micrositeId}`)

      const endpoint = `/resources/providers/configurations/${micrositeId}`
      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Provider configurations retrieved for microsite ${micrositeId}`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get provider configurations: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get provider configurations: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching provider configurations:", error)
      throw error
    }
  }

  async getThemesByMicrosite(micrositeId: string): Promise<any> {
    try {
      console.log(`🎨 Fetching themes for microsite: ${micrositeId}`)

      const endpoint = `/resources/theme/${micrositeId}`
      const response = await this.makeAuthenticatedRequest(endpoint)

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Themes retrieved for microsite ${micrositeId}`)
        return data
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to get themes: ${response.status} - ${errorText}`)
        throw new Error(`Failed to get themes: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Error fetching themes:", error)
      throw error
    }
  }

  // Comprehensive destination and content management methods

  async getCompleteDestinationOverview(micrositeId: string, language = "en"): Promise<any> {
    try {
      console.log(`📊 Getting complete destination overview for microsite ${micrositeId}`)

      const overview = {
        micrositeId,
        countries: [],
        destinations: [],
        facilities: [],
        mealPlans: [],
        themes: [],
        providerConfigurations: [],
        totalCountries: 0,
        totalDestinations: 0,
        totalFacilities: 0,
        totalMealPlans: 0,
        totalThemes: 0,
        retrievedAt: new Date().toISOString(),
      }

      // Get countries
      try {
        const countriesResponse = await this.getCountriesByMicrosite(micrositeId, language)
        overview.countries = countriesResponse.country || []
        overview.totalCountries = overview.countries.length
        console.log(`🌍 Found ${overview.totalCountries} countries`)
      } catch (error) {
        console.log(`⚠️ Could not retrieve countries for microsite ${micrositeId}:`, error)
      }

      // Get destinations
      try {
        const destinationsResponse = await this.getDestinationsByMicrosite(micrositeId, { language })
        overview.destinations = destinationsResponse.destination || []
        overview.totalDestinations = overview.destinations.length
        console.log(`🏙️ Found ${overview.totalDestinations} destinations`)
      } catch (error) {
        console.log(`⚠️ Could not retrieve destinations for microsite ${micrositeId}:`, error)
      }

      // Get facilities
      try {
        const facilitiesResponse = await this.getAllFacilities(language)
        overview.facilities = facilitiesResponse.facilities || []
        overview.totalFacilities = overview.facilities.length
        console.log(`🏨 Found ${overview.totalFacilities} facilities`)
      } catch (error) {
        console.log(`⚠️ Could not retrieve facilities:`, error)
      }

      // Get meal plans
      try {
        const mealPlansResponse = await this.getMealPlansByMicrosite(micrositeId, language)
        overview.mealPlans = mealPlansResponse.mealplan || []
        overview.totalMealPlans = overview.mealPlans.length
        console.log(`🍽️ Found ${overview.totalMealPlans} meal plans`)
      } catch (error) {
        console.log(`⚠️ Could not retrieve meal plans for microsite ${micrositeId}:`, error)
      }

      // Get themes
      try {
        const themesResponse = await this.getThemesByMicrosite(micrositeId)
        overview.themes = themesResponse.theme || []
        overview.totalThemes = overview.themes.length
        console.log(`🎨 Found ${overview.totalThemes} themes`)
      } catch (error) {
        console.log(`⚠️ Could not retrieve themes for microsite ${micrositeId}:`, error)
      }

      // Get provider configurations
      try {
        const providerConfigsResponse = await this.getProviderConfigurations(micrositeId)
        overview.providerConfigurations = Array.isArray(providerConfigsResponse)
          ? providerConfigsResponse
          : [providerConfigsResponse]
        console.log(`⚙️ Found provider configurations`)
      } catch (error) {
        console.log(`⚠️ Could not retrieve provider configurations for microsite ${micrositeId}:`, error)
      }

      console.log(
        `✅ Microsite ${micrositeId} content overview: ${overview.totalCountries} countries, ${overview.totalDestinations} destinations, ${overview.totalFacilities} facilities, ${overview.totalMealPlans} meal plans, ${overview.totalThemes} themes`,
      )
      return overview
    } catch (error) {
      console.error("❌ Error getting complete destination overview:", error)
      throw error
    }
  }

  async getEnhancedDestinationDetails(micrositeId: string, destinationId: string, language = "en"): Promise<any> {
    try {
      console.log(`🏙️ Getting enhanced destination details for: ${destinationId}`)

      // Get basic destination information
      const destination = await this.getDestinationById(micrositeId, destinationId, language)
      const enhancedDestination = { ...destination }

      // Get country information if available
      if (destination.country) {
        try {
          const countries = await this.getCountriesByMicrosite(micrositeId, language)
          const countryInfo = countries.country?.find((c: any) => c.code === destination.country)
          if (countryInfo) {
            enhancedDestination.countryDetails = countryInfo
          }
        } catch (error) {
          console.log(`⚠️ Could not get country details for ${destination.country}:`, error)
        }
      }

      // Get related accommodations if available
      try {
        const preferredAccommodations = await this.getPreferredAccommodations(micrositeId, {
          destinationId: destinationId,
          language: language,
        })
        enhancedDestination.preferredAccommodations = preferredAccommodations.hotel || []
      } catch (error) {
        console.log(`⚠️ Could not get preferred accommodations for destination ${destinationId}:`, error)
      }

      console.log(`✅ Enhanced destination details retrieved for ${destinationId}`)
      return enhancedDestination
    } catch (error) {
      console.error("❌ Error getting enhanced destination details:", error)
      throw error
    }
  }

  async getDestinationsByCountry(micrositeId: string, countryCode: string, language = "en"): Promise<any> {
    try {
      console.log(`🏙️ Getting destinations for country: ${countryCode} in microsite: ${micrositeId}`)

      const destinations = await this.getDestinationsByMicrosite(micrositeId, {
        countryCode,
        language,
      })

      // Enhance with country information
      const countries = await this.getCountriesByMicrosite(micrositeId, language)
      const countryInfo = countries.country?.find((c: any) => c.code === countryCode)

      return {
        country: countryInfo,
        destinations: destinations.destination || [],
        totalDestinations: destinations.destination?.length || 0,
      }
    } catch (error) {
      console.error("❌ Error getting destinations by country:", error)
      throw error
    }
  }
}

/* -----------------------------------------------------------------------
 *  FACTORY HELPERS & ENV-AWARE UTILITIES
 *  These are used throughout the dashboard/tests and must stay in-sync
 * -------------------------------------------------------------------- */

/**
 * Create a TravelCompositorClient based on one of up-to-three
 * credential sets supplied via environment variables.
 *
 *   #1  -> TRAVEL_COMPOSITOR_USERNAME,  TRAVEL_COMPOSITOR_PASSWORD,  TRAVEL_COMPOSITOR_MICROSITE_ID
 *   #2  -> TRAVEL_COMPOSITOR_USERNAME_2,TRAVEL_COMPOSITOR_PASSWORD_2,TRAVEL_COMPOSITOR_MICROSITE_ID_2
 *   #3  -> TRAVEL_COMPOSITOR_USERNAME_3,TRAVEL_COMPOSITOR_PASSWORD_3,TRAVEL_COMPOSITOR_MICROSITE_ID_3
 */
export function createTravelCompositorClient(configNumber: 1 | 2 | 3 = 1): TravelCompositorClient {
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
 * Build a map of clients – one per working microsite.
 * Skips configs with incomplete credentials or known issues.
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
}

/**
 * Build a map of clients – one per working microsite.
 * Skips configs with incomplete credentials or known issues.
 */
export function createMultiMicrositeClient(): MultiMicrositeClient {
  const creds: Array<{
    name: string
    username: string
    password: string
    micrositeId: string
  }> = []

  for (let i = 1 as 1 | 2 | 3; i <= 3; i++) {
    const suffix = i === 1 ? "" : `_${i}`
    const username = process.env[`TRAVEL_COMPOSITOR_USERNAME${suffix}`]
    const password = process.env[`TRAVEL_COMPOSITOR_PASSWORD${suffix}`]
    const micrositeId = process.env[`TRAVEL_COMPOSITOR_MICROSITE_ID${suffix}`]

    // Skip if any piece is missing
    if (!username || !password || !micrositeId) continue

    // Example: config 2 might be disabled for known auth issues
    if (i === 2) {
      console.log("⚠️  Skipping Config 2 – known authentication issues")
      continue
    }

    creds.push({ name: `Config ${i}`, username, password, micrositeId })
  }

  if (creds.length === 0) {
    throw new Error("No valid Travel Compositor credentials found.")
  }

  return new MultiMicrositeClient(creds)
}

/**
 * Same as above but intended for high-frequency callers that prefer
 * to keep client instances short-lived and skip the heavier cache
 * layer some services might add externally.
 */
export function createFastTravelCompositorClient(configNumber: 1 | 2 | 3 = 1): TravelCompositorClient {
  return createTravelCompositorClient(configNumber) // currently identical
}

/**
 * Return an array with the indexes (1, 2, 3) of every credential
 * group that exists in the current environment.
 */
export function getAvailableConfigurations(): number[] {
  const configs: number[] = []

  for (let i = 1 as 1 | 2 | 3; i <= 3; i++) {
    const suffix = i === 1 ? "" : `_${i}`
    const username = process.env[`TRAVEL_COMPOSITOR_USERNAME${suffix}`]
    const password = process.env[`TRAVEL_COMPOSITOR_PASSWORD${suffix}`]
    const micrositeId = process.env[`TRAVEL_COMPOSITOR_MICROSITE_ID${suffix}`]

    if (username && password && micrositeId) configs.push(i)
  }

  return configs
}
