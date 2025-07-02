import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get("bookingId") || "RRP-9263"

    console.log(`🔍 Testing remote_bookings endpoint for: ${bookingId}`)

    // Try to discover the remote_bookings endpoint that TravelStudio uses
    const possibleEndpoints = [
      // Based on TravelStudio pattern
      `https://online.travelcompositor.com/remote_bookings?booking=${bookingId}`,
      `https://online.travelcompositor.com/api/remote_bookings?id=${bookingId}`,
      `https://online.travelcompositor.com/resources/remote_bookings?reference=${bookingId}`,

      // Try with our existing auth
      `https://online.travelcompositor.com/resources/booking/search?reference=${bookingId}`,
      `https://online.travelcompositor.com/resources/booking/find?id=${bookingId}`,
    ]

    const results = []

    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`🧪 Testing endpoint: ${endpoint}`)

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "User-Agent": "TravelStudio-Compatible/1.0",
          },
        })

        const result = {
          endpoint,
          status: response.status,
          success: response.ok,
          headers: Object.fromEntries(response.headers.entries()),
          data: null as any,
          error: null as any,
        }

        if (response.ok) {
          try {
            const data = await response.json()
            result.data = data
            console.log(`✅ ${endpoint}: SUCCESS`, data)
          } catch (jsonError) {
            const text = await response.text()
            result.data = text
            console.log(`✅ ${endpoint}: SUCCESS (text)`, text.substring(0, 200))
          }
        } else {
          const errorText = await response.text()
          result.error = errorText
          console.log(`❌ ${endpoint}: ${response.status} - ${errorText.substring(0, 200)}`)
        }

        results.push(result)
      } catch (error) {
        results.push({
          endpoint,
          status: 0,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          data: null,
          headers: {},
        })
        console.log(`❌ ${endpoint}: Network error -`, error)
      }
    }

    return NextResponse.json({
      success: true,
      bookingId,
      message: "Remote bookings endpoint discovery completed",
      results,
      workingEndpoints: results.filter((r) => r.success),
      summary: {
        totalTested: results.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
      },
    })
  } catch (error) {
    console.error("❌ Remote bookings test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
