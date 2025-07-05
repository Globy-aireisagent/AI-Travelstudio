import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("👥 Testing Newreisplan users import...")

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

    // First get all agencies
    console.log("🏢 Getting agencies first...")
    const agenciesResponse = await fetch(`https://api.travelcompositor.com/api/v1/agency/${micrositeId}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    if (!agenciesResponse.ok) {
      return NextResponse.json({
        success: false,
        message: "Failed to fetch agencies for user lookup",
        error: `HTTP ${agenciesResponse.status}`,
      })
    }

    const agenciesData = await agenciesResponse.json()
    const agencies = Array.isArray(agenciesData)
      ? agenciesData
      : agenciesData.agencies
        ? agenciesData.agencies
        : [agenciesData]

    console.log(`🏢 Found ${agencies.length} agencies to check for users`)

    const allUsers: any[] = []
    let totalBookings = 0
    let totalIdeas = 0

    // Get users from each agency
    for (const agency of agencies) {
      const agencyId = agency.id || agency.agencyId
      if (!agencyId) continue

      console.log(`👥 Checking agency ${agencyId} for users...`)

      // Try multiple endpoints for users
      const userEndpoints = [
        `https://api.travelcompositor.com/api/v1/user/${micrositeId}/${agencyId}`,
        `https://api.travelcompositor.com/api/v1/users/${micrositeId}/${agencyId}`,
        `https://api.travelcompositor.com/api/v1/agency/${micrositeId}/${agencyId}/users`,
        `https://api.travelcompositor.com/api/v1/microsite/${micrositeId}/agency/${agencyId}/users`,
      ]

      let agencyUsers: any[] = []

      for (const endpoint of userEndpoints) {
        try {
          console.log(`🔍 Trying users endpoint: ${endpoint}`)

          const response = await fetch(endpoint, {
            method: "GET",
            headers: {
              Authorization: `Basic ${authString}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          })

          if (response.ok) {
            const data = await response.json()
            console.log(`✅ Users endpoint worked: ${endpoint}`)

            if (Array.isArray(data)) {
              agencyUsers = data
            } else if (data && typeof data === "object" && data.users) {
              agencyUsers = data.users
            } else if (data && typeof data === "object" && data.data) {
              agencyUsers = data.data
            }

            if (agencyUsers.length > 0) {
              console.log(`👥 Found ${agencyUsers.length} users in agency ${agencyId}`)
              break
            }
          }
        } catch (error) {
          console.log(`❌ Users endpoint failed: ${endpoint}`, error)
        }
      }

      // Add agency info to users and count their content
      for (const user of agencyUsers) {
        user.agencyId = agencyId
        user.agencyName = agency.name || agency.agencyName || `Agency ${agencyId}`

        // Try to get user's bookings and ideas count
        user.bookings = 0
        user.ideas = 0

        // Try different endpoints for user content
        const contentEndpoints = [
          `https://api.travelcompositor.com/api/v1/booking/${micrositeId}?userId=${user.id}`,
          `https://api.travelcompositor.com/api/v1/bookings/${micrositeId}/${agencyId}/${user.username}`,
          `https://api.travelcompositor.com/api/v1/travelideas/${micrositeId}?userId=${user.id}`,
          `https://api.travelcompositor.com/api/v1/ideas/${micrositeId}/${agencyId}/${user.username}`,
        ]

        for (const contentEndpoint of contentEndpoints) {
          try {
            const contentResponse = await fetch(contentEndpoint, {
              method: "GET",
              headers: {
                Authorization: `Basic ${authString}`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            })

            if (contentResponse.ok) {
              const contentData = await contentResponse.json()

              if (contentEndpoint.includes("booking")) {
                const bookings = Array.isArray(contentData)
                  ? contentData
                  : contentData.bookings
                    ? contentData.bookings
                    : []
                user.bookings = bookings.length
                totalBookings += bookings.length
              } else if (contentEndpoint.includes("idea")) {
                const ideas = Array.isArray(contentData) ? contentData : contentData.ideas ? contentData.ideas : []
                user.ideas = ideas.length
                totalIdeas += ideas.length
              }
            }
          } catch (error) {
            // Silently continue - content counting is optional
          }
        }

        allUsers.push(user)
      }

      // Small delay between agencies
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    console.log(`🎉 Total users found: ${allUsers.length}`)
    console.log(`📊 Total bookings: ${totalBookings}`)
    console.log(`💡 Total ideas: ${totalIdeas}`)

    return NextResponse.json({
      success: true,
      message: `Found ${allUsers.length} users across ${agencies.length} agencies`,
      data: {
        users: allUsers,
        summary: {
          totalUsers: allUsers.length,
          totalAgencies: agencies.length,
          totalBookings,
          totalIdeas,
          totalItems: totalBookings + totalIdeas,
        },
      },
    })
  } catch (error) {
    console.error("💥 Users test error:", error)

    return NextResponse.json({
      success: false,
      message: "Error fetching users",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
