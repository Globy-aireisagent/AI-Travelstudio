import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params
    console.log(`🌍 Getting destination details for: ${code}`)

    const username = process.env.TRAVEL_COMPOSITOR_USERNAME
    const password = process.env.TRAVEL_COMPOSITOR_PASSWORD
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID

    if (!username || !password || !micrositeId) {
      throw new Error("Missing Travel Compositor credentials")
    }

    const auth = Buffer.from(`${username}:${password}`).toString("base64")

    // Try to get destination details
    const response = await fetch(`https://api.travelcompositor.com/resources/destinations/${code}`, {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        "X-Microsite-Id": micrositeId,
      },
    })

    if (!response.ok) {
      console.error(`❌ Destination ${code} API failed:`, response.status, response.statusText)
      return NextResponse.json({ error: "Destination not found" }, { status: 404 })
    }

    const destination = await response.json()
    console.log(`✅ Fetched destination ${code}:`, destination.name)

    return NextResponse.json(destination)
  } catch (error: any) {
    console.error(`❌ Destination ${params.code} API error:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
