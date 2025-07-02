import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const username = process.env.TRAVEL_COMPOSITOR_USERNAME
    const password = process.env.TRAVEL_COMPOSITOR_PASSWORD
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID
    const baseUrl = "https://online.travelcompositor.com/api"

    // Step 1: Check environment variables
    if (!username || !password || !micrositeId) {
      return Response.json({
        step: "env_check",
        error: "Missing environment variables",
        hasUsername: !!username,
        hasPassword: !!password,
        hasMicrositeId: !!micrositeId,
      })
    }

    // Step 2: Test authentication
    const authResponse = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, micrositeId }),
    })

    const authData = await authResponse.json()

    if (!authResponse.ok) {
      return Response.json({
        step: "authentication",
        error: "Auth failed",
        status: authResponse.status,
        response: authData,
        credentials: { username, micrositeId },
      })
    }

    const token = authData.token || authData.access_token

    // Step 3: Test getting bookings
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
        step: "get_bookings",
        error: "Failed to get bookings",
        status: bookingsResponse.status,
        response: errorData,
      })
    }

    const bookingsData = await bookingsResponse.json()

    return Response.json({
      success: true,
      step: "complete",
      bookingsCount: Array.isArray(bookingsData) ? bookingsData.length : "unknown",
      firstFewBookings: Array.isArray(bookingsData)
        ? bookingsData.slice(0, 5).map((b) => ({
            id: b.id,
            title: b.title || b.name || "No title",
            destination: b.destination,
          }))
        : "Not an array",
      micrositeId,
      authToken: token ? "Present" : "Missing",
    })
  } catch (error) {
    return Response.json({
      error: "Debug failed",
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
  }
}
