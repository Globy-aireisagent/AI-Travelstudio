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
    const limit = 50 // Kleinere batches

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

    // Voor nu, return de agencies zonder users om te testen
    const simpleAgencies: TravelCompositorAgency[] = allAgencies.map((agency) => ({
      id: agency.id,
      name: agency.name,
      code: agency.code,
      email: agency.email,
      phone: agency.phone,
      address: agency.address || {},
      micrositeId: micrositeId,
      status: agency.status || "active",
      users: [], // Eerst zonder users
      creditBalance: 0,
      settings: {},
    }))

    return simpleAgencies
  }

  // Simpele import - alleen agencies
  async importAgenciesOnly(): Promise<{
    agencies: TravelCompositorAgency[]
    totalAgencies: number
  }> {
    console.log("🚀 Starting simple agency import from microsite 1...")

    const agencies = await this.getAllAgencies()

    console.log(`🎯 Import complete: ${agencies.length} agencies`)

    return {
      agencies,
      totalAgencies: agencies.length,
    }
  }
}
