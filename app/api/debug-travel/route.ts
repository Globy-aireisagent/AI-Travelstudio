import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const username = process.env.TRAVEL_COMPOSITOR_USERNAME
    const password = process.env.TRAVEL_COMPOSITOR_PASSWORD
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID
    const baseUrl = "https://online.travelcompositor.com/api"

    // Check if env vars exist
    if (!username || !password || !micrositeId) {
      return Response.json({
        error: "Missing environment variables",
        hasUsername: !!username,
        hasPassword: !!password,
        hasMicrositeId: !!micrositeId,
      })
    }

    // Step 1: Test authentication
    console.log("Testing authentication...")
    const authResponse = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        micrositeId,
      }),
    })

    const authData = await authResponse.json()

    if (!authResponse.ok) {
      return Response.json({
        step: "authentication",
        error: "Auth failed",
        status: authResponse.status,
        response: authData,
      })
    }

    const token = authData.token || authData.access_token

    // Step 2: Test getting all bookings
    console.log("Testing get all bookings...")
    const bookingsResponse = await fetch(`${baseUrl}/microsites/${micrositeId}/bookings`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Microsite-ID": micrositeId,
      },
    })

    if (!bookingsResponse.ok) {
      const errorData = await bookingsResponse.json()
      return Response.json({
        step: "get_all_bookings",
        error: "Failed to get bookings",
        status: bookingsResponse.status,
        response: errorData,
      })
    }

    const bookingsData = await bookingsResponse.json()

    return Response.json({
      success: true,
      authWorked: true,
      bookingsCount: Array.isArray(bookingsData) ? bookingsData.length : "unknown",
      firstFewBookings: Array.isArray(bookingsData)
        ? bookingsData.slice(0, 5).map((b) => ({ id: b.id, title: b.title || b.name }))
        : bookingsData,
      micrositeId,
    })
  } catch (error) {
    return Response.json({
      error: "Debug failed",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
