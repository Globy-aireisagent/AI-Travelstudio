import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { bookingId, configNumber = 1 } = await request.json()

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 })
    }

    console.log(`🔍 Testing booking lookup for: ${bookingId} with config ${configNumber}`)

    // Get environment variables for the specified config
    const suffix = configNumber === 1 ? "" : `_${configNumber}`
    const username = process.env[`TRAVEL_COMPOSITOR_USERNAME${suffix}`]
    const password = process.env[`TRAVEL_COMPOSITOR_PASSWORD${suffix}`]
    const micrositeId = process.env[`TRAVEL_COMPOSITOR_MICROSITE_ID${suffix}`]

    if (!username || !password || !micrositeId) {
      return NextResponse.json(
        {
          error: `Configuration ${configNumber} not found or incomplete`,
          details: {
            hasUsername: !!username,
            hasPassword: !!password,
            hasMicrositeId: !!micrositeId,
          },
        },
        { status: 400 },
      )
    }

    console.log(`📋 Using config ${configNumber}: ${username} -> microsite ${micrositeId}`)

    // Use the correct base URL from our existing client
    const baseUrl = "https://online.travelcompositor.com"

    // Clean booking ID
    const cleanBookingId = bookingId.replace(/^RRP-?/i, "").trim()
    console.log(`🧹 Cleaned booking ID: ${cleanBookingId}`)

    // Test results object
    const testResults = {
      authentication: null,
      directBookingLookup: null,
      bookingsList: null,
      searchInList: null,
    }

    // Step 1: Test Authentication
    try {
      console.log(`🔐 Step 1: Testing authentication`)
      const authResponse = await fetch(`${baseUrl}/resources/authentication/authenticate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Encoding": "gzip",
          "User-Agent": "TravelCompositorClient/1.0",
        },
        body: JSON.stringify({
          username: username,
          password: password,
          micrositeId: micrositeId,
        }),
      })

      if (authResponse.ok) {
        const authData = await authResponse.json()
        testResults.authentication = {
          success: true,
          token: authData.token ? "✅ Token received" : "❌ No token",
          expirationInSeconds: authData.expirationInSeconds || "Unknown",
          status: authResponse.status,
        }
        console.log(`✅ Authentication successful`)

        // Step 2: Test Direct Booking Lookup with auth token
        if (authData.token) {
          try {
            console.log(`📋 Step 2: Direct booking lookup with auth token`)
            const directResponse = await fetch(`${baseUrl}/resources/booking/${cleanBookingId}`, {
              headers: {
                "auth-token": authData.token,
                "Content-Type": "application/json",
                Accept: "application/json",
                "Accept-Encoding": "gzip",
                "User-Agent": "TravelCompositorClient/1.0",
              },
            })

            if (directResponse.ok) {
              const directData = await directResponse.json()
              testResults.directBookingLookup = {
                success: true,
                data: directData,
                status: directResponse.status,
              }
              console.log(`✅ Direct booking lookup successful`)
            } else {
              const errorText = await directResponse.text()
              testResults.directBookingLookup = {
                success: false,
                status: directResponse.status,
                error: errorText.substring(0, 200) + "...",
              }
              console.log(`❌ Direct booking lookup failed: ${directResponse.status}`)
            }
          } catch (error) {
            testResults.directBookingLookup = {
              success: false,
              error: error.message,
            }
            console.log(`❌ Direct booking lookup error:`, error.message)
          }

          // Step 3: Test Bookings List
          try {
            console.log(`📋 Step 3: Get bookings list from microsite ${micrositeId}`)

            // Use the correct endpoint format from our existing client
            const listResponse = await fetch(
              `${baseUrl}/resources/booking/getBookings?microsite=${micrositeId}&from=20250101&to=20251231&first=0&limit=50`,
              {
                headers: {
                  "auth-token": authData.token,
                  "Content-Type": "application/json",
                  Accept: "application/json",
                  "Accept-Encoding": "gzip",
                  "User-Agent": "TravelCompositorClient/1.0",
                },
              },
            )

            if (listResponse.ok) {
              const listData = await listResponse.json()
              const bookings = listData.bookedTrip || listData.bookings || []

              testResults.bookingsList = {
                success: true,
                count: bookings.length,
                status: listResponse.status,
                sample: bookings.slice(0, 3).map((b) => ({
                  id: b.id,
                  bookingReference: b.bookingReference,
                  title: b.title || b.name,
                  client: b.client?.name || b.clientName,
                })),
                totalResults: listData.pagination?.totalResults || bookings.length,
              }
              console.log(`✅ Bookings list retrieved: ${bookings.length} bookings`)

              // Step 4: Search in the list
              const foundBooking = bookings.find((booking) => {
                const possibleIds = [
                  booking.id,
                  booking.bookingId,
                  booking.bookingReference,
                  booking.reference,
                  booking.reservationId,
                  booking.tripId,
                ].filter(Boolean)

                return possibleIds.some((id) => {
                  const cleanId = String(id)
                    .replace(/^RRP-?/i, "")
                    .trim()
                  return (
                    cleanId === cleanBookingId || cleanId.includes(cleanBookingId) || cleanBookingId.includes(cleanId)
                  )
                })
              })

              testResults.searchInList = {
                success: !!foundBooking,
                found: foundBooking
                  ? {
                      id: foundBooking.id,
                      bookingReference: foundBooking.bookingReference,
                      title: foundBooking.title || foundBooking.name,
                      client: foundBooking.client?.name || foundBooking.clientName,
                    }
                  : null,
                searchedIn: bookings.length,
              }

              if (foundBooking) {
                console.log(`✅ Found booking in list: ${foundBooking.id}`)
              } else {
                console.log(`❌ Booking not found in first ${bookings.length} bookings`)
              }
            } else {
              const errorText = await listResponse.text()
              testResults.bookingsList = {
                success: false,
                status: listResponse.status,
                error: errorText.substring(0, 200) + "...",
              }
              console.log(`❌ Bookings list failed: ${listResponse.status}`)
            }
          } catch (error) {
            testResults.bookingsList = {
              success: false,
              error: error.message,
            }
            console.log(`❌ Bookings list error:`, error.message)
          }
        }
      } else {
        const errorText = await authResponse.text()
        testResults.authentication = {
          success: false,
          status: authResponse.status,
          error: errorText.substring(0, 200) + "...",
        }
        console.log(`❌ Authentication failed: ${authResponse.status}`)
      }
    } catch (error) {
      testResults.authentication = {
        success: false,
        error: error.message,
      }
      console.log(`❌ Authentication error:`, error.message)
    }

    return NextResponse.json({
      success: true,
      bookingId: bookingId,
      cleanBookingId: cleanBookingId,
      configUsed: configNumber,
      micrositeId: micrositeId,
      baseUrl: baseUrl,
      testResults: testResults,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Simple booking test error:", error)
    return NextResponse.json(
      {
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
