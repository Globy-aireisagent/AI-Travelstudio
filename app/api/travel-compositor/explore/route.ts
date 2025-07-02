import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const configParam = url.searchParams.get("config")
    const endpoint = url.searchParams.get("endpoint") || "/api"
    const configNumber = configParam ? Number.parseInt(configParam) : 1

    console.log(`🔍 Exploring endpoint: ${endpoint} - Config ${configNumber}`)

    const client = createTravelCompositorClient(configNumber)
    const token = await client.authenticate()

    const response = await fetch(`https://online.travelcompositor.com${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    const result = {
      endpoint,
      status: response.status,
      statusText: response.statusText,
      success: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
    }

    if (response.ok) {
      try {
        const data = await response.json()
        return Response.json({
          ...result,
          dataInfo: {
            type: Array.isArray(data) ? "array" : typeof data,
            length: Array.isArray(data) ? data.length : undefined,
            keys: typeof data === "object" && data !== null ? Object.keys(data) : undefined,
          },
          data: Array.isArray(data) ? data.slice(0, 5) : data, // Limit response size
        })
      } catch (e) {
        const text = await response.text()
        return Response.json({
          ...result,
          dataInfo: { type: "text" },
          data: text.substring(0, 1000), // Limit text response
        })
      }
    } else {
      try {
        const errorText = await response.text()
        return Response.json({
          ...result,
          error: errorText.substring(0, 500),
        })
      } catch (e) {
        return Response.json({
          ...result,
          error: "Could not read error response",
        })
      }
    }
  } catch (error) {
    console.error("❌ Explore failed:", error)
    return Response.json(
      {
        success: false,
        error: "Exploration failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
