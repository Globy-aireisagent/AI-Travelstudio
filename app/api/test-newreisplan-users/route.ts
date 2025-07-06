import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: NextRequest) {
  try {
    console.log("👥 Testing Newreisplan users import...")

    const client = createTravelCompositorClient(1)

    // Authenticate first
    await client.authenticate()
    console.log("✅ Authentication successful")

    // First get agencies using the authenticated client
    console.log("🏢 Getting agencies first...")
    const agenciesResponse = await client.makeAuthenticatedRequest(
      `/resources/agency?microsite=${client.config.micrositeId}&first=0&limit=100`,
    )

    let agencies = []
    if (agenciesResponse.ok) {
      const agenciesData = await agenciesResponse.json()
      agencies = Array.isArray(agenciesData) ? agenciesData : agenciesData.agencies || []
      console.log(`✅ Found ${agencies.length} agencies`)
    }

    const allUsers = []
    let totalBookings = 0
    let totalIdeas = 0

    // Get users from all agencies
    for (const agency of agencies.slice(0, 20)) {
      // Limit to first 20 agencies for testing
      try {
        console.log(`👥 Getting users for agency: ${agency.name} (${agency.id})`)

        // Try multiple user endpoints
        const userEndpoints = [
          `/resources/user/${client.config.micrositeId}/${agency.id}`,
          `/resources/user?microsite=${client.config.micrositeId}&agency=${agency.id}`,
          `/resources/agency/${client.config.micrositeId}/${agency.id}/users`,
        ]

        let agencyUsers = []

        for (const endpoint of userEndpoints) {
          try {
            console.log(`🔍 Trying user endpoint: ${endpoint}`)
            const response = await client.makeAuthenticatedRequest(endpoint)

            if (response.ok) {
              const data = await response.json()

              // Handle different response formats
              if (Array.isArray(data)) {
                agencyUsers = data
              } else if (data.users && Array.isArray(data.users)) {
                agencyUsers = data.users
              } else if (data.user && Array.isArray(data.user)) {
                agencyUsers = data.user
              }

              if (agencyUsers.length > 0) {
                console.log(`✅ Found ${agencyUsers.length} users with endpoint: ${endpoint}`)
                break
              }
            }
          } catch (error) {
            console.log(`❌ User endpoint error:`, error)
          }
        }

        // Transform users and get their bookings/ideas count
        for (const user of agencyUsers) {
          try {
            let bookingsCount = 0
            let ideasCount = 0

            // Try to get user's bookings count
            try {
              const bookingsResponse = await client.makeAuthenticatedRequest(
                `/resources/booking/getBookings?microsite=${client.config.micrositeId}&user=${user.username}&first=0&limit=1`,
              )
              if (bookingsResponse.ok) {
                const bookingsData = await bookingsResponse.json()
                if (bookingsData.pagination) {
                  bookingsCount = bookingsData.pagination.totalResults || 0
                } else if (Array.isArray(bookingsData.bookedTrip)) {
                  bookingsCount = bookingsData.bookedTrip.length
                }
              }
            } catch (error) {
              console.log(`⚠️ Could not get bookings for user ${user.username}`)
            }

            // Try to get user's ideas count
            try {
              const ideasResponse = await client.makeAuthenticatedRequest(
                `/resources/travelideas/${client.config.micrositeId}?user=${user.username}&first=0&limit=1`,
              )
              if (ideasResponse.ok) {
                const ideasData = await ideasResponse.json()
                if (ideasData.pagination) {
                  ideasCount = ideasData.pagination.totalResults || 0
                } else if (Array.isArray(ideasData.travelIdea)) {
                  ideasCount = ideasData.travelIdea.length
                }
              }
            } catch (error) {
              console.log(`⚠️ Could not get ideas for user ${user.username}`)
            }

            totalBookings += bookingsCount
            totalIdeas += ideasCount

            allUsers.push({
              username: user.username,
              email: user.email || user.username,
              agencyName: agency.name,
              bookings: bookingsCount,
              ideas: ideasCount,
            })
          } catch (error) {
            console.log(`❌ Error processing user ${user.username}:`, error)
          }
        }

        console.log(`✅ Processed ${agencyUsers.length} users from ${agency.name}`)
      } catch (error) {
        console.log(`❌ Error getting users for agency ${agency.name}:`, error)
      }
    }

    console.log(`🎯 Final result: ${allUsers.length} users found`)

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${allUsers.length} users`,
      data: {
        users: allUsers,
        summary: {
          totalUsers: allUsers.length,
          totalAgencies: Math.min(agencies.length, 20),
          totalBookings,
          totalIdeas,
          totalItems: totalBookings + totalIdeas,
        },
      },
    })
  } catch (error) {
    console.error("❌ Users import test failed:", error)
    return NextResponse.json({
      success: false,
      message: "Users import test failed",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
