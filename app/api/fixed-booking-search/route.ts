import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { bookingId, configNumber = 1 } = await request.json()

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 })
    }

    console.log(`🔍 Fixed search for: ${bookingId} using config ${configNumber}`)

    const cleanBookingId = bookingId.replace(/^RRP-?/i, "").trim()
    const targetNumber = Number.parseInt(cleanBookingId)

    // Get configuration
    const suffix = configNumber === 1 ? "" : `_${configNumber}`
    const username = process.env[`TRAVEL_COMPOSITOR_USERNAME${suffix}`]
    const password = process.env[`TRAVEL_COMPOSITOR_PASSWORD${suffix}`]
    const micrositeId = process.env[`TRAVEL_COMPOSITOR_MICROSITE_ID${suffix}`]

    if (!username || !password || !micrositeId) {
      return NextResponse.json({ error: `Configuration ${configNumber} not found` }, { status: 400 })
    }

    const baseUrl = "https://online.travelcompositor.com"

    // Step 1: Authenticate
    console.log(`🔐 Authenticating with config ${configNumber}...`)
    const authResponse = await fetch(`${baseUrl}/resources/authentication/authenticate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        micrositeId,
      }),
    })

    if (!authResponse.ok) {
      const errorText = await authResponse.text()
      return NextResponse.json(
        {
          error: "Authentication failed",
          status: authResponse.status,
          details: errorText,
        },
        { status: 401 },
      )
    }

    const authData = await authResponse.json()
    const token = authData.token

    console.log(`✅ Authentication successful`)

    // Step 2: Search with CURRENT date ranges (2025 focus)
    const searchStrategies = [
      {
        name: "Recent 2025 bookings (June-December)",
        from: "20250601",
        to: "20251231",
        description: "Focus on recent 2025 bookings",
      },
      {
        name: "All 2025 bookings",
        from: "20250101",
        to: "20251231",
        description: "Complete 2025 year",
      },
      {
        name: "Extended range (2024-2026)",
        from: "20240101",
        to: "20261231",
        description: "Wide date range",
      },
    ]

    const searchResults = []

    for (const strategy of searchStrategies) {
      console.log(`🔍 Trying strategy: ${strategy.name}`)

      try {
        // Get first batch to understand the data
        const initialResponse = await fetch(
          `${baseUrl}/resources/booking/getBookings?microsite=${micrositeId}&from=${strategy.from}&to=${strategy.to}&first=0&limit=200`,
          {
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        )

        if (!initialResponse.ok) {
          console.log(`❌ Strategy ${strategy.name} failed: ${initialResponse.status}`)
          continue
        }

        const initialData = await initialResponse.json()
        const totalBookings = initialData.pagination?.totalResults || 0
        const initialBookings = initialData.bookedTrip || []

        console.log(`📊 Strategy ${strategy.name}: ${totalBookings} total bookings`)

        // Analyze the booking numbers in this batch
        const bookingNumbers = initialBookings
          .map((b) => {
            const id = b.id || b.bookingReference || ""
            const match = id.match(/RRP-?(\d+)/i)
            return match ? Number.parseInt(match[1]) : null
          })
          .filter((n) => n !== null)
          .sort((a, b) => b - a) // Sort descending (highest first)

        const minNumber = bookingNumbers.length > 0 ? Math.min(...bookingNumbers) : 0
        const maxNumber = bookingNumbers.length > 0 ? Math.max(...bookingNumbers) : 0

        console.log(`📊 Range in first 200: ${minNumber} - ${maxNumber}`)

        const strategyResult = {
          strategy: strategy.name,
          dateRange: `${strategy.from} - ${strategy.to}`,
          totalBookings,
          sampleRange: { min: minNumber, max: maxNumber },
          found: false,
          booking: null,
          searchedPages: 0,
          searchedBookings: 0,
        }

        // Check if target is likely in this range
        if (targetNumber >= minNumber && targetNumber <= maxNumber) {
          console.log(`🎯 Target ${targetNumber} is in range! Searching...`)

          // Search through pages to find the booking
          let found = false
          let searchedCount = 0
          let pageCount = 0
          const maxPages = 20 // Limit search to prevent timeout

          for (let page = 0; page < maxPages && !found; page++) {
            const offset = page * 200
            if (offset >= totalBookings) break

            console.log(`📄 Searching page ${page + 1} (offset: ${offset})`)

            const pageResponse = await fetch(
              `${baseUrl}/resources/booking/getBookings?microsite=${micrositeId}&from=${strategy.from}&to=${strategy.to}&first=${offset}&limit=200`,
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
              searchedCount += pageBookings.length
              pageCount++

              // Look for our target booking
              const foundBooking = pageBookings.find((booking) => {
                const possibleIds = [booking.id, booking.bookingReference, booking.reference].filter(Boolean)
                return possibleIds.some((id) => {
                  const match = String(id).match(/RRP-?(\d+)/i)
                  return match && Number.parseInt(match[1]) === targetNumber
                })
              })

              if (foundBooking) {
                console.log(`✅ FOUND! ${foundBooking.id} in page ${page + 1}`)
                strategyResult.found = true
                strategyResult.booking = foundBooking
                found = true
                break
              }

              // Show some sample IDs from this page
              const sampleIds = pageBookings.slice(0, 5).map((b) => b.id || b.bookingReference)
              console.log(`📋 Page ${page + 1} sample IDs: ${sampleIds.join(", ")}`)
            }
          }

          strategyResult.searchedPages = pageCount
          strategyResult.searchedBookings = searchedCount
        } else {
          console.log(`⚠️ Target ${targetNumber} is OUT OF RANGE (${minNumber}-${maxNumber})`)
        }

        searchResults.push(strategyResult)

        // If we found it, stop searching other strategies
        if (strategyResult.found) {
          console.log(`🎉 Found booking with strategy: ${strategy.name}`)
          break
        }
      } catch (error) {
        console.error(`❌ Error with strategy ${strategy.name}:`, error)
        searchResults.push({
          strategy: strategy.name,
          error: error.message,
          found: false,
        })
      }
    }

    // Summary
    const foundResult = searchResults.find((r) => r.found)

    return NextResponse.json({
      success: true,
      bookingId: bookingId,
      cleanBookingId: cleanBookingId,
      targetNumber: targetNumber,
      configUsed: configNumber,
      micrositeId: micrositeId,
      searchResults: searchResults,
      summary: {
        found: !!foundResult,
        foundWithStrategy: foundResult?.strategy || null,
        booking: foundResult?.booking || null,
        totalStrategiesTried: searchResults.length,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Fixed booking search error:", error)
    return NextResponse.json(
      {
        error: "Fixed booking search failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
