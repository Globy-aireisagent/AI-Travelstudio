import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { bookingId, configNumber = 1, maxPages = 5 } = await request.json()

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 })
    }

    console.log(`🔍 Smart search for: ${bookingId} with config ${configNumber}`)

    // Get environment variables
    const suffix = configNumber === 1 ? "" : `_${configNumber}`
    const username = process.env[`TRAVEL_COMPOSITOR_USERNAME${suffix}`]
    const password = process.env[`TRAVEL_COMPOSITOR_PASSWORD${suffix}`]
    const micrositeId = process.env[`TRAVEL_COMPOSITOR_MICROSITE_ID${suffix}`]

    if (!username || !password || !micrositeId) {
      return NextResponse.json({ error: `Configuration ${configNumber} not found` }, { status: 400 })
    }

    const baseUrl = "https://online.travelcompositor.com"
    const cleanBookingId = bookingId.replace(/^RRP-?/i, "").trim()
    const targetNumber = Number.parseInt(cleanBookingId)

    console.log(`🎯 Looking for booking number: ${targetNumber}`)

    // Step 1: Authenticate
    const authResponse = await fetch(`${baseUrl}/resources/authentication/authenticate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ username, password, micrositeId }),
    })

    if (!authResponse.ok) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    const authData = await authResponse.json()
    const token = authData.token

    // Step 2: Get total count and sample to understand the range
    console.log(`📊 Getting booking range analysis...`)
    const sampleResponse = await fetch(
      `${baseUrl}/resources/booking/getBookings?microsite=${micrositeId}&from=20240101&to=20261231&first=0&limit=100`,
      {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    )

    if (!sampleResponse.ok) {
      return NextResponse.json({ error: "Failed to get bookings sample" }, { status: 500 })
    }

    const sampleData = await sampleResponse.json()
    const totalBookings = sampleData.pagination?.totalResults || 0
    const sampleBookings = sampleData.bookedTrip || []

    // Analyze the booking ID range
    const bookingNumbers = sampleBookings
      .map((b) => {
        const id = b.id || b.bookingReference || ""
        const match = id.match(/RRP-?(\d+)/i)
        return match ? Number.parseInt(match[1]) : null
      })
      .filter((n) => n !== null)
      .sort((a, b) => a - b)

    const minNumber = Math.min(...bookingNumbers)
    const maxNumber = Math.max(...bookingNumbers)

    console.log(`📈 Booking range: ${minNumber} - ${maxNumber} (total: ${totalBookings})`)

    // Step 3: Smart search strategy
    const searchResults = {
      found: false,
      booking: null,
      searchStrategy: "",
      pagesSearched: 0,
      totalSearched: 0,
      bookingRange: { min: minNumber, max: maxNumber, total: totalBookings },
    }

    // Strategy 1: If target is in the higher range, search from the end
    if (targetNumber > (minNumber + maxNumber) / 2) {
      console.log(`🔄 Strategy 1: Searching from end (target ${targetNumber} > average ${(minNumber + maxNumber) / 2})`)
      searchResults.searchStrategy = "Reverse search (high to low)"

      // Calculate starting position (search from end)
      const estimatedPosition = Math.max(0, totalBookings - 200) // Start 200 from end
      let currentFirst = estimatedPosition

      for (let page = 0; page < maxPages && !searchResults.found; page++) {
        console.log(`📄 Reverse page ${page + 1}: first=${currentFirst}`)

        const pageResponse = await fetch(
          `${baseUrl}/resources/booking/getBookings?microsite=${micrositeId}&from=20240101&to=20261231&first=${currentFirst}&limit=100`,
          {
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        )

        if (pageResponse.ok) {
          const pageData = await pageResponse.json()
          const pageBookings = pageData.bookedTrip || []

          searchResults.pagesSearched++
          searchResults.totalSearched += pageBookings.length

          // Search in this page
          const foundBooking = pageBookings.find((booking) => {
            const possibleIds = [booking.id, booking.bookingReference, booking.reference].filter(Boolean)
            return possibleIds.some((id) => {
              const match = String(id).match(/RRP-?(\d+)/i)
              return match && Number.parseInt(match[1]) === targetNumber
            })
          })

          if (foundBooking) {
            searchResults.found = true
            searchResults.booking = foundBooking
            console.log(`✅ Found booking: ${foundBooking.id}`)
            break
          }

          // Move to previous page (going backwards)
          currentFirst = Math.max(0, currentFirst - 100)
        }
      }
    }

    // Strategy 2: If not found, try forward search
    if (!searchResults.found && targetNumber <= (minNumber + maxNumber) / 2) {
      console.log(`🔄 Strategy 2: Forward search (target ${targetNumber} <= average)`)
      searchResults.searchStrategy = "Forward search (low to high)"

      for (let page = 0; page < maxPages && !searchResults.found; page++) {
        const currentFirst = page * 100

        console.log(`📄 Forward page ${page + 1}: first=${currentFirst}`)

        const pageResponse = await fetch(
          `${baseUrl}/resources/booking/getBookings?microsite=${micrositeId}&from=20240101&to=20261231&first=${currentFirst}&limit=100`,
          {
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        )

        if (pageResponse.ok) {
          const pageData = await pageResponse.json()
          const pageBookings = pageData.bookedTrip || []

          searchResults.pagesSearched++
          searchResults.totalSearched += pageBookings.length

          const foundBooking = pageBookings.find((booking) => {
            const possibleIds = [booking.id, booking.bookingReference, booking.reference].filter(Boolean)
            return possibleIds.some((id) => {
              const match = String(id).match(/RRP-?(\d+)/i)
              return match && Number.parseInt(match[1]) === targetNumber
            })
          })

          if (foundBooking) {
            searchResults.found = true
            searchResults.booking = foundBooking
            console.log(`✅ Found booking: ${foundBooking.id}`)
            break
          }
        }
      }
    }

    // Strategy 3: Binary search approach (if still not found)
    if (!searchResults.found) {
      console.log(`🔄 Strategy 3: Binary search approach`)
      searchResults.searchStrategy += " + Binary search"

      // Try to find the approximate position
      const estimatedPosition = Math.floor(((targetNumber - minNumber) / (maxNumber - minNumber)) * totalBookings)
      const searchStart = Math.max(0, estimatedPosition - 50)

      console.log(`🎯 Estimated position: ${estimatedPosition}, searching from: ${searchStart}`)

      const binaryResponse = await fetch(
        `${baseUrl}/resources/booking/getBookings?microsite=${micrositeId}&from=20240101&to=20261231&first=${searchStart}&limit=100`,
        {
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      )

      if (binaryResponse.ok) {
        const binaryData = await binaryResponse.json()
        const binaryBookings = binaryData.bookedTrip || []

        searchResults.pagesSearched++
        searchResults.totalSearched += binaryBookings.length

        const foundBooking = binaryBookings.find((booking) => {
          const possibleIds = [booking.id, booking.bookingReference, booking.reference].filter(Boolean)
          return possibleIds.some((id) => {
            const match = String(id).match(/RRP-?(\d+)/i)
            return match && Number.parseInt(match[1]) === targetNumber
          })
        })

        if (foundBooking) {
          searchResults.found = true
          searchResults.booking = foundBooking
          console.log(`✅ Found booking via binary search: ${foundBooking.id}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      bookingId: bookingId,
      cleanBookingId: cleanBookingId,
      targetNumber: targetNumber,
      configUsed: configNumber,
      micrositeId: micrositeId,
      searchResults: searchResults,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Smart booking search error:", error)
    return NextResponse.json(
      {
        error: "Search failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
