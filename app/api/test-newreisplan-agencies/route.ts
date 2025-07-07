import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: NextRequest) {
  try {
    console.log("🏢 Testing Newreisplan agencies import...")

    const client = createTravelCompositorClient(1)

    // Authenticate first
    await client.authenticate()
    console.log("✅ Authentication successful")

    const agencies = []
    let currentPage = 0
    let hasMore = true
    const pageSize = 100

    console.log("📋 Fetching agencies with pagination...")

    while (hasMore && currentPage < 10) {
      // Safety limit
      const firstResult = currentPage * pageSize

      console.log(`📄 Fetching page ${currentPage + 1} (results ${firstResult}-${firstResult + pageSize - 1})`)

      // Try multiple agency endpoints using the authenticated client
      const endpoints = [
        `/resources/agency?microsite=${client.config.micrositeId}&first=${firstResult}&limit=${pageSize}`,
        `/resources/agency/getAgencies?microsite=${client.config.micrositeId}&first=${firstResult}&limit=${pageSize}`,
        `/resources/agency/${client.config.micrositeId}?first=${firstResult}&limit=${pageSize}`,
      ]

      let pageAgencies = []

      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Trying endpoint: ${endpoint}`)
          const response = await client.makeAuthenticatedRequest(endpoint)

          if (response.ok) {
            const data = await response.json()
            console.log("📊 Response structure:", Object.keys(data))

            // Handle different response formats
            if (Array.isArray(data)) {
              pageAgencies = data
            } else if (data.agencies && Array.isArray(data.agencies)) {
              pageAgencies = data.agencies
            } else if (data.agency && Array.isArray(data.agency)) {
              pageAgencies = data.agency
            } else if (data.results && Array.isArray(data.results)) {
              pageAgencies = data.results
            }

            if (pageAgencies.length > 0) {
              console.log(`✅ Found ${pageAgencies.length} agencies with endpoint: ${endpoint}`)
              break
            }
          } else {
            console.log(`❌ Endpoint failed: ${response.status}`)
          }
        } catch (error) {
          console.log(`❌ Endpoint error:`, error)
        }
      }

      if (pageAgencies.length > 0) {
        // Transform and add agencies
        const transformedAgencies = pageAgencies.map((agency: any) => ({
          id: agency.id || agency.agencyId,
          name: agency.name || agency.agencyName || "Unknown Agency",
          email: agency.email || agency.contactEmail || "No email",
        }))

        agencies.push(...transformedAgencies)
        console.log(
          `✅ Page ${currentPage + 1}: Added ${transformedAgencies.length} agencies (total: ${agencies.length})`,
        )

        // Check if we should continue
        hasMore = pageAgencies.length === pageSize
        currentPage++
      } else {
        console.log(`⚪ No agencies found on page ${currentPage + 1}`)
        hasMore = false
      }
    }

    console.log(`🎯 Final result: ${agencies.length} agencies found`)

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${agencies.length} agencies`,
      data: {
        agencies: agencies,
        summary: {
          totalAgencies: agencies.length,
          pagesProcessed: currentPage,
        },
      },
    })
  } catch (error) {
    console.error("❌ Agencies import test failed:", error)
    return NextResponse.json({
      success: false,
      message: "Agencies import test failed",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
