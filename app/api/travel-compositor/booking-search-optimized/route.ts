import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const bookingId = searchParams.get("bookingId")
  const mode = searchParams.get("mode") || "multi" // single or multi

  if (!bookingId) {
    return NextResponse.json({ error: "Missing bookingId parameter" }, { status: 400 })
  }

  try {
    if (mode === "single") {
      return await searchSingleMicrosite(bookingId)
    } else {
      return await searchMultiMicrosite(bookingId)
    }
  } catch (error) {
    console.error("❌ Booking search error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

async function searchSingleMicrosite(bookingId: string) {
  console.log(`🔍 Single microsite search for: ${bookingId}`)

  try {
    const client = createTravelCompositorClient(1)
    await client.authenticate()

    // Use the EXACT working endpoint format from debug
    const micrositeId = client.config.micrositeId
    const currentYear = new Date().getFullYear()
    const from = `${currentYear}0101`
    const to = `${currentYear}1231`

    // Use the correct endpoint and include required parameters
    const endpoint = `/booking/getBookings?microsite=${micrositeId}&from=${from}&to=${to}&first=0&limit=1000`

    console.log(`📡 Calling: ${endpoint}`)

    const response = await client.makeAuthenticatedRequest(endpoint)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    const bookings = data.bookedTrip || []

    console.log(`📋 Found ${bookings.length} bookings in ${currentYear}`)

    // Search for the booking
    const booking = bookings.find((b: any) => {
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

    return NextResponse.json({
      success: true,
      found: !!booking,
      booking: booking || null,
      searchDetails: {
        micrositeId,
        totalBookings: bookings.length,
        searchYear: currentYear,
        endpoint,
      },
    })
  } catch (error) {
    console.error("❌ Single microsite search failed:", error)
    return NextResponse.json({
      success: false,
      found: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

async function searchMultiMicrosite(bookingId: string) {
  console.log(`🔍 Multi-microsite search for: ${bookingId}`)

  const results = {
    success: false,
    found: false,
    booking: null as any,
    foundInMicrosite: null as string | null,
    searchResults: [] as any[],
    totalSearchTime: 0,
  }

  const startTime = Date.now()

  // Test both working configurations
  const configs = [
    { num: 1, name: "rondreis-planner" },
    { num: 3, name: "pacificislandtravel" },
  ]

  for (const config of configs) {
    const micrositeStartTime = Date.now()

    try {
      console.log(`🧪 Searching microsite ${config.name}...`)

      const client = createTravelCompositorClient(config.num)
      await client.authenticate()

      const micrositeId = client.config.micrositeId
      const currentYear = new Date().getFullYear()
      const from = `${currentYear}0101`
      const to = `${currentYear}1231`

      // Use smaller batch size and shorter timeout for multi-microsite
      const endpoint = `/booking/getBookings?microsite=${micrositeId}&from=${from}&to=${to}&first=0&limit=500`

      // Add timeout per microsite (10 seconds max)
      const fetchPromise = client.makeAuthenticatedRequest(endpoint)
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout after 10s")), 10000),
      )

      const response = await Promise.race([fetchPromise, timeoutPromise])

      if (response.ok) {
        const data = await response.json()
        const bookings = data.bookedTrip || []

        console.log(`📋 ${config.name}: ${bookings.length} bookings`)

        // Search for the booking
        const booking = bookings.find((b: any) => {
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

        const searchTime = Date.now() - micrositeStartTime

        results.searchResults.push({
          microsite: config.name,
          found: !!booking,
          bookingCount: bookings.length,
          searchTime: `${searchTime}ms`,
        })

        if (booking && !results.found) {
          results.found = true
          results.booking = booking
          results.foundInMicrosite = config.name
          console.log(`✅ Found ${bookingId} in ${config.name}!`)
        }
      } else {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
    } catch (error) {
      const searchTime = Date.now() - micrositeStartTime
      const errorMessage = error instanceof Error ? error.message : String(error)

      console.error(`❌ ${config.name} failed: ${errorMessage}`)

      results.searchResults.push({
        microsite: config.name,
        found: false,
        bookingCount: 0,
        error: errorMessage,
        searchTime: `${searchTime}ms`,
      })
    }
  }

  results.success = true
  results.totalSearchTime = Date.now() - startTime

  return NextResponse.json(results)
}
