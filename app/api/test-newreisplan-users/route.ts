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

    // Haal eerst agencies op
    const agenciesResponse = await fetch(
      `https://online.travelcompositor.com/resources/agency/${credentials.micrositeId}?first=0&limit=50`,
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
    const agencies = agenciesData.agency || agenciesData.agencies || []

    console.log(`📋 Found ${agencies.length} agencies, fetching users...`)

    // Haal users op voor elke agency
    const allUsers: any[] = []
    let totalBookings = 0
    let totalIdeas = 0

    for (const agency of agencies.slice(0, 5)) {
      // Limiteer tot 5 agencies voor test
      try {
        console.log(`👥 Fetching users for agency: ${agency.name}`)

        const usersResponse = await fetch(
          `https://online.travelcompositor.com/resources/user/${credentials.micrositeId}/${agency.id}?first=0&limit=20`,
          {
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        )

        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          const users = usersData.user || usersData.users || []

          console.log(`👤 Found ${users.length} users in agency ${agency.name}`)

          // Verrijk users met agency info en tel bookings/ideas
          for (const user of users) {
            const enrichedUser = {
              id: user.id || user.username,
              email: user.email || user.username || "",
              firstName: user.firstName || "",
              lastName: user.lastName || "",
              agencyName: agency.name,
              agencyId: agency.id,
              micrositeId: credentials.micrositeId,
              role: user.role || "agent",
              status: user.status || "active",
              bookingsCount: 0, // We tellen dit later
              ideasCount: 0, // We tellen dit later
              lastLogin: user.lastLogin || "",
            }

            // Probeer bookings te tellen (snel)
            try {
              const bookingsResponse = await fetch(
                `https://online.travelcompositor.com/resources/booking/${credentials.micrositeId}?clientEmail=${encodeURIComponent(user.email || user.username)}&first=0&limit=5`,
                {
                  headers: {
                    "auth-token": token,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                  },
                },
              )

              if (bookingsResponse.ok) {
                const bookingsData = await bookingsResponse.json()
                const bookings = bookingsData.booking || bookingsData.bookings || []
                enrichedUser.bookingsCount = bookings.length
                totalBookings += bookings.length
              }
            } catch (error) {
              console.log(`⚠️ Could not count bookings for ${user.email}`)
            }

            // Probeer ideas te tellen (snel)
            try {
              const ideasResponse = await fetch(
                `https://online.travelcompositor.com/resources/travelideas/${credentials.micrositeId}?clientEmail=${encodeURIComponent(user.email || user.username)}&first=0&limit=5`,
                {
                  headers: {
                    "auth-token": token,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                  },
                },
              )

              if (ideasResponse.ok) {
                const ideasData = await ideasResponse.json()
                const ideas = ideasData.travelIdea || ideasData.ideas || []
                enrichedUser.ideasCount = ideas.length
                totalIdeas += ideas.length
              }
            } catch (error) {
              console.log(`⚠️ Could not count ideas for ${user.email}`)
            }

            allUsers.push(enrichedUser)
          }
        } else {
          console.log(`⚠️ Could not fetch users for agency ${agency.name}: ${usersResponse.status}`)
        }
      } catch (error) {
        console.log(`⚠️ Error processing agency ${agency.name}:`, error)
        continue
      }
    }

    console.log(`✅ Found ${allUsers.length} total users in Newreisplan`)

    return NextResponse.json({
      success: true,
      data: {
        users: allUsers,
        totalUsers: allUsers.length,
        totalBookings,
        totalIdeas,
        agenciesProcessed: Math.min(agencies.length, 5),
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
