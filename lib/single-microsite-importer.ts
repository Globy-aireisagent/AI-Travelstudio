export interface TravelCompositorUser {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  agencyId: string
  micrositeId: string
  status: "active" | "inactive" | "suspended"
  role: "agent" | "admin" | "client"
  lastLogin: string
  createdDate: string
  permissions: string[]
  bookings: any[]
  ideas: any[]
}

export interface TravelCompositorAgency {
  id: string
  name: string
  code: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    country: string
    postalCode: string
  }
  micrositeId: string
  status: "active" | "inactive"
  users: TravelCompositorUser[]
  creditBalance: number
  settings: any
}

export class SingleMicrositeImporter {
  private baseUrl = "https://online.travelcompositor.com"
  private authToken: string | null = null
  private tokenExpiry: Date | null = null

  // Authenticatie voor microsite 1
  async authenticate(): Promise<string> {
    console.log("🔐 Authenticating for microsite 1...")

    if (this.authToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      console.log("✅ Using cached token")
      return this.authToken
    }

    const credentials = {
      username: process.env.TRAVEL_COMPOSITOR_USERNAME!,
      password: process.env.TRAVEL_COMPOSITOR_PASSWORD!,
      micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!,
    }

    if (!credentials.username || !credentials.password || !credentials.micrositeId) {
      throw new Error("Missing Travel Compositor credentials for microsite 1")
    }

    console.log(`🔑 Authenticating with username: ${credentials.username}`)
    console.log(`🏢 Microsite ID: ${credentials.micrositeId}`)

    const response = await fetch(`${this.baseUrl}/resources/authentication/authenticate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Authentication failed:", response.status, errorText)
      throw new Error(`Authentication failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    if (!data.token) {
      throw new Error("No token received from authentication")
    }

    this.authToken = data.token
    this.tokenExpiry = new Date(Date.now() + (data.expirationInSeconds || 7200) * 1000 - 60000)

    console.log("✅ Authentication successful!")
    return this.authToken
  }

  // Test de authenticatie
  async testAuthentication(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.authenticate()
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  // Haal alle agencies op
  async getAllAgencies(): Promise<TravelCompositorAgency[]> {
    console.log("🏢 Fetching all agencies from microsite 1...")

    const token = await this.authenticate()
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!
    const allAgencies: any[] = []
    let first = 0
    const limit = 50

    while (true) {
      console.log(`📄 Fetching agencies ${first}-${first + limit}...`)

      const response = await fetch(`${this.baseUrl}/resources/agency/${micrositeId}?first=${first}&limit=${limit}`, {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Failed to fetch agencies:`, response.status, errorText)
        break
      }

      const data = await response.json()
      console.log("📊 Agency API response:", data)

      const agencies = data.agency || data.agencies || []

      if (agencies.length === 0) {
        console.log("📄 No more agencies found")
        break
      }

      allAgencies.push(...agencies)
      console.log(`📄 Retrieved ${agencies.length} agencies (total: ${allAgencies.length})`)

      if (agencies.length < limit) break
      first += limit
    }

    console.log(`🎯 Total agencies found: ${allAgencies.length}`)
    return allAgencies
  }

  // Haal users op voor een agency
  async getUsersForAgency(agencyId: string): Promise<any[]> {
    console.log(`👥 Fetching users for agency ${agencyId}...`)

    const token = await this.authenticate()
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!
    const allUsers: any[] = []
    let first = 0
    const limit = 50

    try {
      while (true) {
        const response = await fetch(
          `${this.baseUrl}/resources/user/${micrositeId}/${agencyId}?first=${first}&limit=${limit}`,
          {
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        )

        if (!response.ok) {
          console.log(`⚠️ No users found for agency ${agencyId} (${response.status})`)
          break
        }

        const data = await response.json()
        const users = data.user || data.users || []

        if (users.length === 0) break

        allUsers.push(...users)
        console.log(`👥 Retrieved ${users.length} users for agency ${agencyId} (total: ${allUsers.length})`)

        if (users.length < limit) break
        first += limit
      }
    } catch (error) {
      console.log(`⚠️ Error fetching users for agency ${agencyId}:`, error)
    }

    return allUsers
  }

  // Haal bookings op voor een user
  async getBookingsForUser(agencyId: string, username: string): Promise<any[]> {
    console.log(`📋 Fetching bookings for user ${username} in agency ${agencyId}...`)

    const token = await this.authenticate()
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!
    const allBookings: any[] = []

    try {
      // Probeer verschillende booking endpoints
      const endpoints = [
        `/resources/booking/${micrositeId}/${agencyId}/${username}`,
        `/resources/booking/${micrositeId}/${agencyId}`,
        `/resources/booking/${micrositeId}`,
      ]

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${this.baseUrl}${endpoint}?first=0&limit=100`, {
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          })

          if (response.ok) {
            const data = await response.json()
            const bookings = data.booking || data.bookings || []

            // Filter bookings voor deze user als we een breed endpoint gebruiken
            const userBookings = bookings.filter(
              (booking: any) => booking.username === username || booking.agentUsername === username,
            )

            allBookings.push(...userBookings)
            console.log(`📋 Found ${userBookings.length} bookings for user ${username}`)
            break
          }
        } catch (error) {
          console.log(`⚠️ Endpoint ${endpoint} failed, trying next...`)
        }
      }
    } catch (error) {
      console.log(`⚠️ Error fetching bookings for user ${username}:`, error)
    }

    return allBookings
  }

  // Haal travel ideas op voor een user
  async getIdeasForUser(agencyId: string, username: string): Promise<any[]> {
    console.log(`💡 Fetching ideas for user ${username} in agency ${agencyId}...`)

    const token = await this.authenticate()
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!
    const allIdeas: any[] = []

    try {
      const response = await fetch(`${this.baseUrl}/resources/travelideas/${micrositeId}?first=0&limit=100`, {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        const ideas = data.travelidea || data.travelideas || data.ideas || []

        // Filter ideas voor deze user
        const userIdeas = ideas.filter((idea: any) => idea.username === username || idea.agentUsername === username)

        allIdeas.push(...userIdeas)
        console.log(`💡 Found ${userIdeas.length} ideas for user ${username}`)
      }
    } catch (error) {
      console.log(`⚠️ Error fetching ideas for user ${username}:`, error)
    }

    return allIdeas
  }

  // Complete import met alles
  async importComplete(): Promise<{
    agencies: TravelCompositorAgency[]
    totalAgencies: number
    totalUsers: number
    totalBookings: number
    totalIdeas: number
  }> {
    console.log("🚀 Starting complete import from microsite 1...")

    const rawAgencies = await this.getAllAgencies()
    const processedAgencies: TravelCompositorAgency[] = []
    let totalUsers = 0
    let totalBookings = 0
    let totalIdeas = 0

    // Verwerk elke agency
    for (const agency of rawAgencies.slice(0, 5)) {
      // Limiteer tot 5 agencies voor test
      console.log(`🏢 Processing agency: ${agency.name}`)

      const users = await this.getUsersForAgency(agency.id)
      const processedUsers: TravelCompositorUser[] = []

      // Verwerk elke user
      for (const user of users.slice(0, 3)) {
        // Limiteer tot 3 users per agency
        console.log(`👤 Processing user: ${user.username}`)

        const bookings = await this.getBookingsForUser(agency.id, user.username)
        const ideas = await this.getIdeasForUser(agency.id, user.username)

        processedUsers.push({
          id: user.id || user.username,
          username: user.username,
          email: user.email || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          agencyId: agency.id,
          micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!,
          status: user.status || "active",
          role: user.role || "agent",
          lastLogin: user.lastLogin || "",
          createdDate: user.createdDate || "",
          permissions: user.permissions || [],
          bookings: bookings,
          ideas: ideas,
        })

        totalBookings += bookings.length
        totalIdeas += ideas.length
      }

      processedAgencies.push({
        id: agency.id,
        name: agency.name,
        code: agency.code || agency.id,
        email: agency.email || "",
        phone: agency.phone || "",
        address: agency.address || {},
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!,
        status: agency.status || "active",
        users: processedUsers,
        creditBalance: agency.creditBalance || 0,
        settings: agency.settings || {},
      })

      totalUsers += processedUsers.length
      console.log(
        `✅ Processed agency ${agency.name}: ${processedUsers.length} users, ${totalBookings} bookings, ${totalIdeas} ideas`,
      )
    }

    console.log(
      `🎯 Complete import finished: ${processedAgencies.length} agencies, ${totalUsers} users, ${totalBookings} bookings, ${totalIdeas} ideas`,
    )

    return {
      agencies: processedAgencies,
      totalAgencies: processedAgencies.length,
      totalUsers,
      totalBookings,
      totalIdeas,
    }
  }
}
