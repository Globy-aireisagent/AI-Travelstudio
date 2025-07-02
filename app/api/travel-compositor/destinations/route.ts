import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("🌍 Fetching all destinations from Travel Compositor")

    // Use your existing working endpoint structure
    const username = process.env.TRAVEL_COMPOSITOR_USERNAME
    const password = process.env.TRAVEL_COMPOSITOR_PASSWORD
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID

    if (!username || !password || !micrositeId) {
      throw new Error("Missing Travel Compositor credentials")
    }

    const auth = Buffer.from(`${username}:${password}`).toString("base64")

    // Try the destinations endpoint that should exist based on your API docs
    const response = await fetch(`https://api.travelcompositor.com/resources/destinations`, {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        "X-Microsite-Id": micrositeId,
      },
    })

    if (!response.ok) {
      console.error("❌ Destinations API failed:", response.status, response.statusText)
      return NextResponse.json({ error: "Failed to fetch destinations" }, { status: response.status })
    }

    const destinations = await response.json()
    console.log(`✅ Fetched ${destinations.length || 0} destinations`)

    return NextResponse.json(destinations)
  } catch (error: any) {
    console.error("❌ Destinations API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
