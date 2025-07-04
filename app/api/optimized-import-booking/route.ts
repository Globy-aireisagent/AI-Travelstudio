import { type NextRequest, NextResponse } from "next/server"

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, micrositeId } = body

    if (!bookingId) {
      return NextResponse.json({ success: false, error: "Booking ID is required" }, { status: 400 })
    }

    console.log(`🚀 Starting optimized booking import for: ${bookingId}`)

    // Get microsite configurations
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

    // Filter configs if specific microsite requested
    const targetConfigs = micrositeId ? configs.filter((c) => c.id === micrositeId) : configs

    if (targetConfigs.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid microsite configurations found",
        },
        { status: 500 },
      )
    }

    // Search in parallel across all target microsites
    const searchPromises = targetConfigs.map((config) => searchInMicrosite(config, bookingId))

    try {
      const results = await Promise.allSettled(searchPromises)
      const searchResults: SearchResult[] = results.map((result, index) =>
        result.status === "fulfilled"
          ? result.value
          : {
              microsite: targetConfigs[index].name,
              success: false,
              error: "Search failed",
              responseTime: 0,
              searchMethod: "error",
            },
      )

      // Find first successful result
      const successfulResult = searchResults.find((result) => result.success && result.booking)

      if (successfulResult) {
        console.log(`✅ Booking ${bookingId} found in ${successfulResult.microsite}`)

        return NextResponse.json({
          success: true,
          booking: successfulResult.booking,
          foundInMicrosite: successfulResult.microsite,
          searchMethod: successfulResult.searchMethod,
          searchResults: searchResults,
          message: `Booking ${bookingId} successfully imported from ${successfulResult.microsite}`,
        })
      } else {
        console.log(`❌ Booking ${bookingId} not found in any microsite`)

        return NextResponse.json(
          {
            success: false,
            error: `Booking ${bookingId} not found in any microsite`,
            searchResults: searchResults,
            details: "Searched all available microsites but booking was not found",
          },
          { status: 404 },
        )
      }
    } catch (error) {
      console.error("❌ Search error:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Search operation failed",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ Import booking error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Import operation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function authenticate(config: MicrositeConfig): Promise<string> {
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
    throw new Error(`Authentication failed for ${config.name}: ${response.status}`)
  }

  const data = await response.json()
  if (!data.token) {
    throw new Error(`No token received from ${config.name}`)
  }

  console.log(`✅ Authenticated with ${config.name}`)
  return data.token
}

async function searchInMicrosite(config: MicrositeConfig, bookingId: string): Promise<SearchResult> {
  const startTime = Date.now()

  try {
    // Get auth token
    const token = await authenticate(config)

    console.log(`🔍 Searching ${config.name} for: ${bookingId}`)

    // Clean the booking ID
    const cleanBookingId = bookingId.replace(/^RRP-?/i, "")
    const searchPatterns = [bookingId.toUpperCase(), `RRP-${cleanBookingId}`, cleanBookingId]

    // Method 1: Try direct booking lookup
    for (const pattern of searchPatterns) {
      try {
        const response = await fetch(`https://online.travelcompositor.com/resources/booking/${pattern}`, {
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data && (data.id || data.bookingReference || data.bookingId)) {
            console.log(`✅ Found booking ${pattern} in ${config.name} via direct lookup`)
            return {
              microsite: config.name,
              success: true,
              booking: transformBookingData(data, bookingId),
              responseTime: Date.now() - startTime,
              searchMethod: "direct",
            }
          }
        }
      } catch (error) {
        console.log(`⚠️ Direct lookup failed for ${pattern} in ${config.name}`)
        continue
      }
    }

    // Method 2: Try getBookings endpoint with recent date range
    try {
      const response = await fetch(
        `https://online.travelcompositor.com/resources/booking/getBookings?microsite=${config.micrositeId}&from=20240101&to=20261231&first=0&limit=1000`,
        {
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
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
          console.log(`✅ Found booking ${bookingId} in ${config.name} via getBookings`)
          return {
            microsite: config.name,
            success: true,
            booking: transformBookingData(booking, bookingId),
            responseTime: Date.now() - startTime,
            searchMethod: "getBookings",
          }
        }
      }
    } catch (error) {
      console.log(`⚠️ getBookings failed in ${config.name}:`, error)
    }

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

function transformBookingData(rawData: any, bookingId: string) {
  return {
    id: rawData.id || bookingId,
    bookingReference: rawData.bookingReference || rawData.id || bookingId,
    title: rawData.title || rawData.name || `Booking ${bookingId}`,
    client: {
      name: rawData.client?.name || rawData.clientName || "Unknown Client",
      email: rawData.client?.email || rawData.clientEmail || "",
      phone: rawData.client?.phone || rawData.clientPhone || "",
    },
    destination: rawData.destination || "Unknown Destination",
    startDate: rawData.startDate || rawData.departureDate,
    endDate: rawData.endDate || rawData.returnDate,
    status: rawData.status || "Confirmed",
    totalPrice: rawData.totalPrice?.amount || rawData.totalPrice || 0,
    currency: rawData.currency || "EUR",
    accommodations: rawData.accommodations || rawData.hotels || [],
    activities: rawData.activities || rawData.tickets || [],
    transports: rawData.transports || [],
    vouchers: rawData.vouchers || rawData.transfers || [],
    importedAt: new Date().toISOString(),
    originalData: rawData,
  }
}
