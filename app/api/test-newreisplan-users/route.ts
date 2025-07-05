import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("👥 Testing Newreisplan users import...")

    // Authenticeer eerst
    const credentials = {
      username: process.env.TRAVEL_COMPOSITOR_USERNAME!,
      password: process.env.TRAVEL_COMPOSITOR_PASSWORD!,
      micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!,
    }

    const authResponse = await fetch("https://online.travelcompositor.com/resources/authentication/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(credentials),
    })

    if (!authResponse.ok) {
      throw new Error(`Authentication failed: ${authResponse.status}`)
    }

    const authData = await authResponse.json()
    const token = authData.token

    // Haal eerst ALLE agencies op
    const allAgencies: any[] = []
    let currentPage = 0
    const pageSize = 100

    while (true) {
      const agenciesResponse = await fetch(
        `https://online.travelcompositor.com/resources/agency/${credentials.micrositeId}?first=${currentPage * pageSize}&limit=${pageSize}`,
        {
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      )

      if (!agenciesResponse.ok) {
        throw new Error(`Agencies fetch failed: ${agenciesResponse.status}`)
      }

      const agenciesData = await agenciesResponse.json()
      const pageAgencies = agenciesData.agency || agenciesData.agencies || []

      if (pageAgencies.length === 0) break

      allAgencies.push(...pageAgencies)

      if (pageAgencies.length < pageSize) break

      currentPage++
      if (currentPage >= 10) break
    }

    console.log(`📋 Found ${allAgencies.length} agencies, fetching ALL users...`)

    // Haal ALLE users op voor ALLE agencies
    const allUsers: any[] = []
    let totalBookings = 0
    let totalIdeas = 0

    for (const agency of allAgencies) {
      try {
        console.log(`👥 Fetching ALL users for agency: ${agency.name} (ID: ${agency.id})`)

        // Haal alle users op voor deze agency (met paginering)
        let userPage = 0
        const userPageSize = 100

        while (true) {
          const usersResponse = await fetch(
            `https://online.travelcompositor.com/resources/user/${credentials.micrositeId}/${agency.id}?first=${userPage * userPageSize}&limit=${userPageSize}`,
            {
              headers: {
                "auth-token": token,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            },
          )

          if (!usersResponse.ok) {
            console.log(`⚠️ Could not fetch users for agency ${agency.name}: ${usersResponse.status}`)
            break
          }

          const usersData = await usersResponse.json()
          const pageUsers = usersData.user || usersData.users || []

          if (pageUsers.length === 0) {
            break
          }

          console.log(`👤 Found ${pageUsers.length} users on page ${userPage} for agency ${agency.name}`)

          // Verrijk users met agency info
          for (const user of pageUsers) {
            const enrichedUser = {
              id: user.id || user.username,
              email: user.email || user.username || "",
              firstName: user.firstName || "",
              lastName: user.lastName || "",
              fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || user.username,
              agencyName: agency.name,
              agencyId: agency.id,
              micrositeId: credentials.micrositeId,
              role: user.role || "agent",
              status: user.status || "active",
              lastLogin: user.lastLogin || "",
              createdDate: user.createdDate || "",
              bookingsCount: 0,
              ideasCount: 0,
            }

            // Probeer bookings te tellen (met verschillende endpoints)
            try {
              const bookingEndpoints = [
                `https://online.travelcompositor.com/resources/booking/${credentials.micrositeId}?clientEmail=${encodeURIComponent(user.email || user.username)}&first=0&limit=10`,
                `https://online.travelcompositor.com/resources/booking/${credentials.micrositeId}?agentEmail=${encodeURIComponent(user.email || user.username)}&first=0&limit=10`,
                `https://online.travelcompositor.com/resources/booking/${credentials.micrositeId}?userId=${user.id}&first=0&limit=10`,
              ]

              for (const endpoint of bookingEndpoints) {
                try {
                  const bookingsResponse = await fetch(endpoint, {
                    headers: {
                      "auth-token": token,
                      "Content-Type": "application/json",
                      Accept: "application/json",
                    },
                  })

                  if (bookingsResponse.ok) {
                    const bookingsData = await bookingsResponse.json()
                    const bookings = bookingsData.booking || bookingsData.bookings || []
                    if (bookings.length > 0) {
                      enrichedUser.bookingsCount = bookings.length
                      totalBookings += bookings.length
                      console.log(`📋 Found ${bookings.length} bookings for ${user.email}`)
                      break // Stop bij eerste werkende endpoint
                    }
                  }
                } catch (error) {
                  continue
                }
              }
            } catch (error) {
              console.log(`⚠️ Could not count bookings for ${user.email}`)
            }

            // Probeer ideas te tellen (met verschillende endpoints)
            try {
              const ideaEndpoints = [
                `https://online.travelcompositor.com/resources/travelideas/${credentials.micrositeId}?clientEmail=${encodeURIComponent(user.email || user.username)}&first=0&limit=10`,
                `https://online.travelcompositor.com/resources/travelideas/${credentials.micrositeId}?agentEmail=${encodeURIComponent(user.email || user.username)}&first=0&limit=10`,
                `https://online.travelcompositor.com/resources/travelideas/${credentials.micrositeId}?userId=${user.id}&first=0&limit=10`,
              ]

              for (const endpoint of ideaEndpoints) {
                try {
                  const ideasResponse = await fetch(endpoint, {
                    headers: {
                      "auth-token": token,
                      "Content-Type": "application/json",
                      Accept: "application/json",
                    },
                  })

                  if (ideasResponse.ok) {
                    const ideasData = await ideasResponse.json()
                    const ideas = ideasData.travelIdea || ideasData.ideas || []
                    if (ideas.length > 0) {
                      enrichedUser.ideasCount = ideas.length
                      totalIdeas += ideas.length
                      console.log(`💡 Found ${ideas.length} ideas for ${user.email}`)
                      break // Stop bij eerste werkende endpoint
                    }
                  }
                } catch (error) {
                  continue
                }
              }
            } catch (error) {
              console.log(`⚠️ Could not count ideas for ${user.email}`)
            }

            allUsers.push(enrichedUser)
          }

          // Als we minder dan pageSize krijgen, zijn we klaar met deze agency
          if (pageUsers.length < userPageSize) {
            break
          }

          userPage++

          // Safety break
          if (userPage >= 10) {
            console.log(`⚠️ Breaking after 10 pages for agency ${agency.name}`)
            break
          }
        }
      } catch (error) {
        console.log(`⚠️ Error processing agency ${agency.name}:`, error)
        continue
      }
    }

    console.log(`✅ Found ${allUsers.length} total users in Newreisplan`)
    console.log(`📊 Total bookings: ${totalBookings}, Total ideas: ${totalIdeas}`)

    return NextResponse.json({
      success: true,
      data: {
        users: allUsers,
        totalUsers: allUsers.length,
        totalBookings,
        totalIdeas,
        agenciesProcessed: allAgencies.length,
        micrositeId: credentials.micrositeId,
      },
    })
  } catch (error) {
    console.error("❌ Users test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
