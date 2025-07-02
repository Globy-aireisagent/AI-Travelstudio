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

export class TravelCompositorClientPaginated {
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
      console.log("🔐 Authenticating with Travel Compositor...")

      const response = await fetch(`${this.config.baseUrl}/resources/authentication/authenticate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Encoding": "gzip",
          "Travelc-Trace-Id": this.traceId,
          "User-Agent": "TravelCompositorClient/1.0",
        },
        body: JSON.stringify({
          username: this.config.username,
          password: this.config.password,
          micrositeId: this.config.micrositeId,
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

  private async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.ensureValidToken()

    return fetch(`${this.config.baseUrl}${endpoint}`, {
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

  async getAllBookingsWithPagination(
    micrositeId: string,
    options: {
      fromDate?: string
      toDate?: string
      pageSize?: number
      maxPages?: number
    } = {},
  ): Promise<{
    bookings: BookingData[]
    totalResults: number
    pagesProcessed: number
    dateRangesProcessed: string[]
  }> {
    const { fromDate, toDate, pageSize = 100, maxPages = 50 } = options

    console.log(`📋 Fetching ALL bookings from microsite: ${micrositeId} with pagination`)

    // Multiple date ranges to ensure we get all data
    const dateRanges = [
      { from: "20250101", to: "20251231", name: "2025" },
      { from: "20240101", to: "20241231", name: "2024" },
      { from: "20230101", to: "20231231", name: "2023" },
      { from: "20220101", to: "20221231", name: "2022" },
      { from: "20210101", to: "20211231", name: "2021" },
    ]

    // Use custom date range if provided
    if (fromDate && toDate) {
      dateRanges.unshift({ from: fromDate, to: toDate, name: "Custom" })
    }

    let allBookings: BookingData[] = []
    let totalResults = 0
    let pagesProcessed = 0
    const dateRangesProcessed: string[] = []

    for (const dateRange of dateRanges) {
      try {
        console.log(`📅 Processing date range: ${dateRange.name} (${dateRange.from} - ${dateRange.to})`)

        let currentPage = 0
        let hasMorePages = true
        let rangeBookings: BookingData[] = []

        while (hasMorePages && currentPage < maxPages) {
          const firstResult = currentPage * pageSize
          const endpoint = `/resources/booking/getBookings?microsite=${micrositeId}&from=${dateRange.from}&to=${dateRange.to}&firstResult=${firstResult}&maxResults=${pageSize}`

          console.log(`📄 Fetching page ${currentPage + 1} (results ${firstResult}-${firstResult + pageSize - 1})`)

          try {
            const response = await this.makeAuthenticatedRequest(endpoint)

            if (response.ok) {
              const data: PaginatedResponse = await response.json()

              if (data.bookedTrip && Array.isArray(data.bookedTrip)) {
                const pageBookings = data.bookedTrip

                // Filter duplicates based on ID
                const newBookings = pageBookings.filter(
                  (newBooking: any) => !allBookings.some((existing: any) => existing.id === newBooking.id),
                )

                rangeBookings = [...rangeBookings, ...newBookings]
                allBookings = [...allBookings, ...newBookings]

                console.log(`✅ Page ${currentPage + 1}: ${pageBookings.length} bookings (+${newBookings.length} new)`)

                // Update pagination info
                if (data.pagination) {
                  totalResults = Math.max(totalResults, data.pagination.totalResults)
                  const expectedPages = Math.ceil(data.pagination.totalResults / pageSize)
                  hasMorePages = currentPage + 1 < expectedPages && pageBookings.length === pageSize
                } else {
                  // No pagination info, check if we got a full page
                  hasMorePages = pageBookings.length === pageSize
                }

                pagesProcessed++
                currentPage++
              } else {
                console.log(`⚪ No bookings in page ${currentPage + 1}`)
                hasMorePages = false
              }
            } else {
              console.log(`❌ Page ${currentPage + 1} failed: ${response.status}`)
              hasMorePages = false
            }
          } catch (pageError) {
            console.error(`❌ Error fetching page ${currentPage + 1}:`, pageError)
            hasMorePages = false
          }
        }

        if (rangeBookings.length > 0) {
          dateRangesProcessed.push(`${dateRange.name}: ${rangeBookings.length} bookings`)
          console.log(`✅ ${dateRange.name}: ${rangeBookings.length} bookings total`)
        }
      } catch (rangeError) {
        console.error(`❌ Error processing date range ${dateRange.name}:`, rangeError)
      }
    }

    // Sort all bookings by ID
    allBookings.sort((a, b) => {
      const aNum = Number.parseInt(a.id?.replace(/\D/g, "") || "0")
      const bNum = Number.parseInt(b.id?.replace(/\D/g, "") || "0")
      return aNum - bNum
    })

    console.log(`🎯 Final results: ${allBookings.length} unique bookings from ${pagesProcessed} pages`)

    return {
      bookings: allBookings,
      totalResults,
      pagesProcessed,
      dateRangesProcessed,
    }
  }

  async getBooking(bookingId: string): Promise<BookingData | null> {
    try {
      console.log(`🔍 Fetching booking: ${bookingId}`)

      const result = await this.getAllBookingsWithPagination(this.config.micrositeId, { maxPages: 10 })
      console.log(`📋 Searching through ${result.bookings.length} bookings for ID: ${bookingId}`)

      const booking = result.bookings.find((b: any) => {
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

      console.log("❌ Booking not found")
      return null
    } catch (error) {
      console.error("❌ Error fetching booking:", error)
      throw error
    }
  }
}

export function createPaginatedTravelCompositorClient(configNumber = 1): TravelCompositorClientPaginated {
  const suffix = configNumber === 1 ? "" : `_${configNumber}`

  const config: TravelCompositorConfig = {
    username: process.env[`TRAVEL_COMPOSITOR_USERNAME${suffix}`]!,
    password: process.env[`TRAVEL_COMPOSITOR_PASSWORD${suffix}`]!,
    micrositeId: process.env[`TRAVEL_COMPOSITOR_MICROSITE_ID${suffix}`]!,
  }

  if (!config.username || !config.password || !config.micrositeId) {
    throw new Error(`Missing required Travel Compositor environment variables for config ${configNumber}`)
  }

  return new TravelCompositorClientPaginated(config)
}
