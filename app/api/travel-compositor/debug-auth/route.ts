import { NextResponse } from "next/server"

export async function GET() {
  const startTime = Date.now()

  try {
    console.log("🔐 Testing all authentication configurations...")

    const configs = [
      {
        id: 1,
        name: "rondreis-planner",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID,
      },
      {
        id: 2,
        name: "reisbureaunederland",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_2,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_2,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_2,
      },
      {
        id: 3,
        name: "pacificislandtravel",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_3,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_3,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3,
      },
    ]

    const results = []

    for (const config of configs) {
      if (!config.username || !config.password || !config.micrositeId) {
        results.push({
          config: config.id,
          name: config.name,
          status: "missing_credentials",
          error: "Missing environment variables",
        })
        continue
      }

      try {
        console.log(`🧪 Testing config ${config.id} (${config.name})...`)

        // Test authentication
        const authResponse = await fetch("https://online.travelcompositor.com/resources/authentication/authenticate", {
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
          const errorText = await authResponse.text()
          results.push({
            config: config.id,
            name: config.name,
            status: "auth_failed",
            error: `${authResponse.status}: ${errorText}`,
          })
          continue
        }

        const authData = await authResponse.json()
        const token = authData.token

        if (!token) {
          results.push({
            config: config.id,
            name: config.name,
            status: "no_token",
            error: "No token in response",
            authData,
          })
          continue
        }

        console.log(`✅ Config ${config.id} authenticated successfully`)

        // Test booking endpoints with different date ranges
        const testEndpoints = [
          `/resources/booking/getBookings?microsite=${config.micrositeId}&from=20250601&to=20250630`,
          `/resources/booking/getBookings?microsite=${config.micrositeId}&from=20250101&to=20251231`,
          `/resources/booking/getBookings?microsite=${config.micrositeId}&from=20240101&to=20241231`,
          `/resources/booking/getBookings?microsite=${config.micrositeId}&from=20230101&to=20231231`,
        ]

        const endpointResults = []
        let totalBookings = 0

        for (const endpoint of testEndpoints) {
          try {
            const bookingResponse = await fetch(`https://online.travelcompositor.com${endpoint}`, {
              headers: {
                "auth-token": token,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            })

            if (bookingResponse.ok) {
              const responseText = await bookingResponse.text()

              if (responseText.trim().length === 0) {
                endpointResults.push({
                  endpoint,
                  status: "empty_response",
                  bookingCount: 0,
                })
                continue
              }

              try {
                const data = JSON.parse(responseText)
                let bookings = []

                if (data.bookedTrip && Array.isArray(data.bookedTrip)) {
                  bookings = data.bookedTrip
                } else if (Array.isArray(data)) {
                  bookings = data
                }

                totalBookings += bookings.length

                endpointResults.push({
                  endpoint,
                  status: "success",
                  bookingCount: bookings.length,
                  sampleIds: bookings.slice(0, 3).map((b) => b.id),
                })
              } catch (jsonError) {
                endpointResults.push({
                  endpoint,
                  status: "json_error",
                  error: jsonError.message,
                  responsePreview: responseText.substring(0, 200),
                })
              }
            } else {
              const errorText = await bookingResponse.text()
              endpointResults.push({
                endpoint,
                status: "http_error",
                httpStatus: bookingResponse.status,
                error: errorText.substring(0, 200),
              })
            }
          } catch (error) {
            endpointResults.push({
              endpoint,
              status: "request_error",
              error: error.message,
            })
          }
        }

        results.push({
          config: config.id,
          name: config.name,
          status: "success",
          totalBookings,
          endpointResults,
          credentials: {
            username: config.username,
            micrositeId: config.micrositeId,
            hasPassword: !!config.password,
          },
        })
      } catch (error) {
        results.push({
          config: config.id,
          name: config.name,
          status: "error",
          error: error.message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      testTime: `${Date.now() - startTime}ms`,
      results,
      summary: {
        totalConfigs: configs.length,
        workingConfigs: results.filter((r) => r.status === "success").length,
        totalBookings: results.reduce((sum, r) => sum + (r.totalBookings || 0), 0),
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        testTime: `${Date.now() - startTime}ms`,
      },
      { status: 500 },
    )
  }
}
