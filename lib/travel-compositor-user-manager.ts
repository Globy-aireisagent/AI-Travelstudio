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

export class TravelCompositorUserManager {
  private baseUrl = "https://online.travelcompositor.com"
  private authTokens: Map<string, { token: string; expiry: Date }> = new Map()

  // Authenticatie voor specifieke microsite
  async authenticate(micrositeId: string): Promise<string> {
    const existing = this.authTokens.get(micrositeId)
    if (existing && existing.expiry > new Date()) {
      return existing.token
    }

    // Haal credentials op basis van microsite
    const credentials = this.getCredentialsForMicrosite(micrositeId)

    const response = await fetch(`${this.baseUrl}/resources/authentication/authenticate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      throw new Error(`Authentication failed for microsite ${micrositeId}`)
    }

    const data = await response.json()
    const expiry = new Date(Date.now() + (data.expirationInSeconds || 7200) * 1000 - 60000)

    this.authTokens.set(micrositeId, { token: data.token, expiry })
    return data.token
  }

  private getCredentialsForMicrosite(micrositeId: string) {
    const configs = {
      "1": {
        username: process.env.TRAVEL_COMPOSITOR_USERNAME!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!,
      },
      "2": {
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_2!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_2!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_2!,
      },
      "3": {
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_3!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_3!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3!,
      },
      "4": {
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_4!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_4!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_4!,
      },
    }

    return configs[micrositeId as keyof typeof configs] || configs["1"]
  }

  // Haal alle agencies op van een microsite
  async getAllAgencies(micrositeId: string): Promise<TravelCompositorAgency[]> {
    console.log(`🏢 Fetching all agencies from microsite ${micrositeId}`)

    const token = await this.authenticate(micrositeId)
    const allAgencies: any[] = []
    let first = 0
    const limit = 100

    while (true) {
      const response = await fetch(`${this.baseUrl}/resources/agency/${micrositeId}?first=${first}&limit=${limit}`, {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (!response.ok) break

      const data = await response.json()
      const agencies = data.agency || []

      if (agencies.length === 0) break

      allAgencies.push(...agencies)
      console.log(`📄 Retrieved ${agencies.length} agencies (total: ${allAgencies.length})`)

      if (agencies.length < limit) break
      first += limit
    }

    // Voor elke agency, haal ook de users op
    const enrichedAgencies: TravelCompositorAgency[] = []

    for (const agency of allAgencies) {
      try {
        const users = await this.getUsersByAgency(micrositeId, agency.id)
        const agencyDetails = await this.getAgencyDetails(micrositeId, agency.id)

        enrichedAgencies.push({
          id: agency.id,
          name: agency.name,
          code: agency.code,
          email: agency.email,
          phone: agency.phone,
          address: agency.address || {},
          micrositeId,
          status: agency.status || "active",
          users,
          creditBalance: agencyDetails?.creditBalance || 0,
          settings: agencyDetails?.settings || {},
        })
      } catch (error) {
        console.log(`⚠️ Could not enrich agency ${agency.id}:`, error)
        enrichedAgencies.push({
          id: agency.id,
          name: agency.name,
          code: agency.code,
          email: agency.email,
          phone: agency.phone,
          address: {},
          micrositeId,
          status: "active",
          users: [],
          creditBalance: 0,
          settings: {},
        })
      }
    }

    console.log(`✅ Retrieved ${enrichedAgencies.length} agencies with users`)
    return enrichedAgencies
  }

  // Haal alle users op van een agency
  async getUsersByAgency(micrositeId: string, agencyId: string): Promise<TravelCompositorUser[]> {
    const token = await this.authenticate(micrositeId)

    const response = await fetch(`${this.baseUrl}/resources/user/${micrositeId}/${agencyId}`, {
      headers: {
        "auth-token": token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      console.log(`⚠️ Could not fetch users for agency ${agencyId}`)
      return []
    }

    const data = await response.json()
    const users = data.user || []

    // Voor elke user, haal ook hun bookings en ideas op
    const enrichedUsers: TravelCompositorUser[] = []

    for (const user of users) {
      try {
        // Haal bookings op voor deze user
        const bookings = await this.getUserBookings(micrositeId, user.email)
        const ideas = await this.getUserIdeas(micrositeId, user.email)

        enrichedUsers.push({
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          agencyId,
          micrositeId,
          status: user.status || "active",
          role: user.role || "agent",
          lastLogin: user.lastLogin,
          createdDate: user.createdDate,
          permissions: user.permissions || [],
          bookings,
          ideas,
        })
      } catch (error) {
        console.log(`⚠️ Could not enrich user ${user.email}:`, error)
        enrichedUsers.push({
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          agencyId,
          micrositeId,
          status: "active",
          role: "agent",
          lastLogin: user.lastLogin || "",
          createdDate: user.createdDate || "",
          permissions: [],
          bookings: [],
          ideas: [],
        })
      }
    }

    return enrichedUsers
  }

  // Haal agency details op
  async getAgencyDetails(micrositeId: string, agencyId: string): Promise<any> {
    const token = await this.authenticate(micrositeId)

    const response = await fetch(`${this.baseUrl}/resources/agency/${micrositeId}/${agencyId}`, {
      headers: {
        "auth-token": token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    if (!response.ok) return null
    return await response.json()
  }

  // Haal credit balance op voor agency
  async getAgencyCreditBalance(micrositeId: string, agencyId: string): Promise<number> {
    const token = await this.authenticate(micrositeId)

    const response = await fetch(`${this.baseUrl}/resources/agency/credit/${micrositeId}/${agencyId}`, {
      headers: {
        "auth-token": token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    if (!response.ok) return 0

    const data = await response.json()
    return data.creditBalance || 0
  }

  // Haal bookings op voor specifieke user (via email)
  async getUserBookings(micrositeId: string, userEmail: string): Promise<any[]> {
    try {
      // Gebruik onze bestaande booking API
      const response = await fetch(
        `/api/travel-compositor/booking-super-fast?config=${micrositeId}&clientEmail=${encodeURIComponent(userEmail)}`,
      )

      if (!response.ok) return []

      const data = await response.json()
      return data.bookings || []
    } catch (error) {
      console.log(`⚠️ Could not fetch bookings for user ${userEmail}:`, error)
      return []
    }
  }

  // Haal ideas op voor specifieke user
  async getUserIdeas(micrositeId: string, userEmail: string): Promise<any[]> {
    try {
      // Gebruik onze bestaande ideas API
      const response = await fetch(`/api/travel-compositor/idea-lightning-fast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          micrositeConfig: micrositeId,
          clientEmail: userEmail,
        }),
      })

      if (!response.ok) return []

      const data = await response.json()
      return data.ideas || []
    } catch (error) {
      console.log(`⚠️ Could not fetch ideas for user ${userEmail}:`, error)
      return []
    }
  }

  // Maak nieuwe user aan
  async createUser(
    micrositeId: string,
    agencyId: string,
    userData: {
      username: string
      email: string
      firstName: string
      lastName: string
      password: string
      role?: string
    },
  ): Promise<TravelCompositorUser | null> {
    const token = await this.authenticate(micrositeId)

    const response = await fetch(`${this.baseUrl}/resources/user/${micrositeId}/${agencyId}/create`, {
      method: "POST",
      headers: {
        "auth-token": token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      console.error(`❌ Failed to create user: ${response.status}`)
      return null
    }

    const newUser = await response.json()

    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      agencyId,
      micrositeId,
      status: "active",
      role: userData.role || "agent",
      lastLogin: "",
      createdDate: new Date().toISOString(),
      permissions: [],
      bookings: [],
      ideas: [],
    }
  }

  // Update user
  async updateUser(micrositeId: string, agencyId: string, username: string, updates: any): Promise<boolean> {
    const token = await this.authenticate(micrositeId)

    const response = await fetch(`${this.baseUrl}/resources/user/${micrositeId}/${agencyId}/${username}`, {
      method: "PUT",
      headers: {
        "auth-token": token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(updates),
    })

    return response.ok
  }

  // Deactiveer user
  async deactivateUser(micrositeId: string, agencyId: string, username: string): Promise<boolean> {
    const token = await this.authenticate(micrositeId)

    const response = await fetch(`${this.baseUrl}/resources/user/${micrositeId}/${agencyId}/${username}/deactivate`, {
      method: "POST",
      headers: {
        "auth-token": token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    return response.ok
  }

  // Importeer alle data van alle microsites
  async importAllData(): Promise<{
    agencies: TravelCompositorAgency[]
    totalUsers: number
    totalBookings: number
    totalIdeas: number
  }> {
    console.log("🚀 Starting complete Travel Compositor data import...")

    const allAgencies: TravelCompositorAgency[] = []
    let totalUsers = 0
    let totalBookings = 0
    let totalIdeas = 0

    // Loop door alle microsites
    for (let micrositeId = 1; micrositeId <= 4; micrositeId++) {
      try {
        console.log(`📡 Importing from microsite ${micrositeId}...`)

        const agencies = await this.getAllAgencies(micrositeId.toString())
        allAgencies.push(...agencies)

        // Tel statistieken
        for (const agency of agencies) {
          totalUsers += agency.users.length
          for (const user of agency.users) {
            totalBookings += user.bookings.length
            totalIdeas += user.ideas.length
          }
        }

        console.log(
          `✅ Microsite ${micrositeId}: ${agencies.length} agencies, ${agencies.reduce((sum, a) => sum + a.users.length, 0)} users`,
        )
      } catch (error) {
        console.log(`⚠️ Could not import from microsite ${micrositeId}:`, error)
      }
    }

    console.log(
      `🎯 Import complete: ${allAgencies.length} agencies, ${totalUsers} users, ${totalBookings} bookings, ${totalIdeas} ideas`,
    )

    return {
      agencies: allAgencies,
      totalUsers,
      totalBookings,
      totalIdeas,
    }
  }
}
