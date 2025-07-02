import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { bookingId, maxPages = 3 } = await request.json()

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 })
    }

    console.log(`🔍 Multi-microsite search for: ${bookingId}`)

    const cleanBookingId = bookingId.replace(/^RRP-?/i, "").trim()
    const targetNumber = Number.parseInt(cleanBookingId)

    // Get all available configurations
    const configs = []
    for (let i = 1; i <= 4; i++) {
      const suffix = i === 1 ? "" : `_${i}`
      const username = process.env[`TRAVEL_COMPOSITOR_USERNAME${suffix}`]
      const password = process.env[`TRAVEL_COMPOSITOR_PASSWORD${suffix}`]
      const micrositeId = process.env[`TRAVEL_COMPOSITOR_MICROSITE_ID${suffix}`]

      if (username && password && micrositeId) {
        configs.push({
          config: i,
          username,
          password,
          micrositeId,
        })
      }
    }

    console.log(`📋 Found ${configs.length} configurations to search`)

    const baseUrl = "https://online.travelcompositor.com"
    const searchResults = []

    // Search each microsite
    for (const config of configs) {
      console.log(`🔍 Searching microsite ${config.config}: ${config.micrositeId}`)

      const micrositeResult = {
        config: config.config,
        micrositeId: config.micrositeId,
        username: config.username,
        authenticated: false,
        bookingRange: null,
        found: false,
        booking: null,
        error: null,
        searchedBookings: 0,
      }

      try {
        // Step 1: Authenticate
        const authResponse = await fetch(`${baseUrl}/resources/authentication/authenticate`, {
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

        if (!authResponse.ok) {
          micrositeResult.error = `Authentication failed: ${authResponse.status}`
          searchResults.push(micrositeResult)
          continue
        }

        const authData = await authResponse.json()
        const token = authData.token
        micrositeResult.authenticated = true

        // Step 2: Get booking range
        const sampleResponse = await fetch(
          `${baseUrl}/resources/booking/getBookings?microsite=${config.micrositeId}&from=20240101&to=20261231&first=0&limit=100`,
          {
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        )

        if (!sampleResponse.ok) {
          micrositeResult.error = `Failed to get bookings: ${sampleResponse.status}`
          searchResults.push(micrositeResult)
          continue
        }

        const sampleData = await sampleResponse.json()
        const totalBookings = sampleData.pagination?.totalResults || 0
        const sampleBookings = sampleData.bookedTrip || []

        // Analyze booking range
        const bookingNumbers = sampleBookings
          .map((b) => {
            const id = b.id || b.bookingReference || ""
            const match = id.match(/RRP-?(\d+)/i)
            return match ? Number.parseInt(match[1]) : null
          })
          .filter((n) => n !== null)
          .sort((a, b) => a - b)

        const minNumber = bookingNumbers.length > 0 ? Math.min(...bookingNumbers) : 0
        const maxNumber = bookingNumbers.length > 0 ? Math.max(...bookingNumbers) : 0

        micrositeResult.bookingRange = {
          min: minNumber,
          max: maxNumber,
          total: totalBookings,
        }

        console.log(`📊 Microsite ${config.config} range: ${minNumber} - ${maxNumber} (total: ${totalBookings})`)

        // Step 3: Check if target is in range
        if (targetNumber >= minNumber && targetNumber <= maxNumber) {
          console.log(`🎯 Target ${targetNumber} is in range for microsite ${config.config}!`)

          // Smart search in this microsite
          let found = false
          let searchedCount = 0

          // Estimate position and search around it
          const estimatedPosition = Math.floor(((targetNumber - minNumber) / (maxNumber - minNumber)) * totalBookings)
          const searchPositions = [
            Math.max(0, estimatedPosition - 100),
            Math.max(0, estimatedPosition - 50),
            estimatedPosition,
            Math.min(totalBookings - 100, estimatedPosition + 50),
            Math.min(totalBookings - 100, estimatedPosition + 100),
          ]

          for (const position of searchPositions) {
            if (found) break

            console.log(`🔍 Searching at position ${position}`)

            const searchResponse = await fetch(
              `${baseUrl}/resources/booking/getBookings?microsite=${config.micrositeId}&from=20240101&to=20261231&first=${position}&limit=100`,
              {
                headers: {
                  "auth-token": token,
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
              },
            )

            if (searchResponse.ok) {
              const searchData = await searchResponse.json()
              const searchBookings = searchData.bookedTrip || []
              searchedCount += searchBookings.length

              const foundBooking = searchBookings.find((booking) => {
                const possibleIds = [booking.id, booking.bookingReference, booking.reference].filter(Boolean)
                return possibleIds.some((id) => {
                  const match = String(id).match(/RRP-?(\d+)/i)
                  return match && Number.parseInt(match[1]) === targetNumber
                })
              })

              if (foundBooking) {
                micrositeResult.found = true
                micrositeResult.booking = foundBooking
                found = true
                console.log(`✅ Found booking in microsite ${config.config}: ${foundBooking.id}`)
                break
              }
            }
          }

          micrositeResult.searchedBookings = searchedCount
        } else {
          console.log(
            `⚠️ Target ${targetNumber} is OUT OF RANGE for microsite ${config.config} (${minNumber}-${maxNumber})`,
          )
        }
      } catch (error) {
        micrositeResult.error = error.message
        console.error(`❌ Error searching microsite ${config.config}:`, error)
      }

      searchResults.push(micrositeResult)
    }

    // Summary
    const foundResults = searchResults.filter((r) => r.found)
    const authenticatedMicrosites = searchResults.filter((r) => r.authenticated)

    return NextResponse.json({
      success: true,
      bookingId: bookingId,
      cleanBookingId: cleanBookingId,
      targetNumber: targetNumber,
      totalMicrosites: configs.length,
      authenticatedMicrosites: authenticatedMicrosites.length,
      foundIn: foundResults.length,
      searchResults: searchResults,
      summary: {
        found: foundResults.length > 0,
        foundInMicrosite: foundResults.length > 0 ? foundResults[0].config : null,
        booking: foundResults.length > 0 ? foundResults[0].booking : null,
        allRanges: searchResults.map((r) => ({
          config: r.config,
          micrositeId: r.micrositeId,
          range: r.bookingRange,
          authenticated: r.authenticated,
        })),
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Multi-microsite search error:", error)
    return NextResponse.json(
      {
        error: "Multi-microsite search failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
