import { type NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { micrositeId: string; holidayPackageId: string } },
) {
  try {
    const { micrositeId, holidayPackageId } = params
    const { searchParams } = new URL(request.url)
    const config = searchParams.get("config") || "1"
    const currency = searchParams.get("currency") || "EUR"

    console.log(`📅 Fetching package calendar for ${holidayPackageId}`)

    // Get credentials
    let username, password, actualMicrositeId
    switch (config) {
      case "1":
        username = process.env.TRAVEL_COMPOSITOR_USERNAME
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD
        actualMicrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID
        break
      default:
        username = process.env.TRAVEL_COMPOSITOR_USERNAME
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD
        actualMicrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID
    }

    if (!username || !password || !actualMicrositeId) {
      throw new Error(`Missing credentials for config ${config}`)
    }

    // Authenticate
    const authResponse = await fetch("https://online.travelcompositor.com/resources/authentication/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        micrositeId: actualMicrositeId,
      }),
    })

    if (!authResponse.ok) {
      throw new Error(`Authentication failed: ${authResponse.status}`)
    }

    const authData = await authResponse.json()
    const token = authData.token

    // Get package calendar
    const response = await fetch(
      `https://online.travelcompositor.com/resources/package/calendar/${actualMicrositeId}/${holidayPackageId}?currency=${currency}`,
      {
        method: "GET",
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Get package calendar failed: ${response.status} - ${errorText}`)
    }

    const calendarData = await response.json()

    return NextResponse.json({
      success: true,
      calendar: calendarData,
      micrositeId: actualMicrositeId,
      holidayPackageId,
      currency,
    })
  } catch (error) {
    console.error("❌ Error fetching package calendar:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
