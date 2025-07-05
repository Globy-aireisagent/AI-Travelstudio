import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("🏢 Testing Newreisplan agencies import...")

    const username = process.env.TRAVEL_COMPOSITOR_USERNAME
    const password = process.env.TRAVEL_COMPOSITOR_PASSWORD
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID

    if (!username || !password || !micrositeId) {
      return NextResponse.json({
        success: false,
        message: "Missing credentials",
        error: "Environment variables not configured",
      })
    }

    const authString = Buffer.from(`${username}:${password}`).toString("base64")
    const allAgencies: any[] = []
    let page = 1
    const pageSize = 100
    let hasMore = true

    console.log("📄 Starting paginated agency fetch...")

    while (hasMore && page <= 10) {
      // Safety limit
      const url = `https://api.travelcompositor.com/api/v1/agency/${micrositeId}?page=${page}&pageSize=${pageSize}`
      console.log(`📄 Fetching page ${page}:`, url)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Basic ${authString}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        console.error(`❌ Page ${page} failed:`, response.status)
        break
      }

      const data = await response.json()
      console.log(`📄 Page ${page} response:`, {
        type: typeof data,
        isArray: Array.isArray(data),
        length: Array.isArray(data) ? data.length : "not array",
        keys: typeof data === "object" ? Object.keys(data) : "not object",
      })

      if (Array.isArray(data)) {
        allAgencies.push(...data)
        hasMore = data.length === pageSize
        console.log(`✅ Page ${page}: ${data.length} agencies, total: ${allAgencies.length}`)
      } else if (data && typeof data === "object") {
        // Handle different response formats
        if (data.agencies && Array.isArray(data.agencies)) {
          allAgencies.push(...data.agencies)
          hasMore = data.agencies.length === pageSize
        } else if (data.data && Array.isArray(data.data)) {
          allAgencies.push(...data.data)
          hasMore = data.data.length === pageSize
        } else {
          console.log("🔍 Unexpected response format, treating as single agency")
          allAgencies.push(data)
          hasMore = false
        }
      } else {
        console.log("❌ Unexpected response type")
        hasMore = false
      }

      page++

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    console.log(`🎉 Total agencies found: ${allAgencies.length}`)

    // Try alternative endpoints if we got no results
    if (allAgencies.length === 0) {
      console.log("🔄 Trying alternative endpoints...")

      const alternativeUrls = [
        `https://api.travelcompositor.com/api/v1/agencies/${micrositeId}`,
        `https://api.travelcompositor.com/api/v1/microsite/${micrositeId}/agencies`,
        `https://api.travelcompositor.com/api/v1/agency?micrositeId=${micrositeId}`,
      ]

      for (const altUrl of alternativeUrls) {
        console.log("🔄 Trying:", altUrl)
        try {
          const response = await fetch(altUrl, {
            method: "GET",
            headers: {
              Authorization: `Basic ${authString}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          })

          if (response.ok) {
            const data = await response.json()
            console.log("✅ Alternative endpoint worked:", altUrl)

            if (Array.isArray(data)) {
              allAgencies.push(...data)
            } else if (data && typeof data === "object" && data.agencies) {
              allAgencies.push(...data.agencies)
            }
            break
          }
        } catch (error) {
          console.log("❌ Alternative endpoint failed:", altUrl, error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Found ${allAgencies.length} agencies`,
      data: {
        agencies: allAgencies,
        summary: {
          totalAgencies: allAgencies.length,
          pagesChecked: page - 1,
        },
      },
    })
  } catch (error) {
    console.error("💥 Agencies test error:", error)

    return NextResponse.json({
      success: false,
      message: "Error fetching agencies",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
