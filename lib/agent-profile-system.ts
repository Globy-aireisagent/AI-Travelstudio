export interface AgentProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  avatar?: string
  phone?: string

  // Travel Compositor data (if imported)
  travelCompositorId?: string
  micrositeId?: string
  agencyId?: string

  // Agent specifics
  specializations: string[]
  languages: string[]
  certifications: string[]
  experience: number // years

  // Business info
  agencyName?: string
  agencyCode?: string
  territory?: string[]

  // Settings
  preferences: {
    currency: string
    timezone: string
    notifications: {
      email: boolean
      sms: boolean
      push: boolean
    }
  }

  // Stats
  stats: {
    totalBookings: number
    totalRevenue: number
    clientCount: number
    averageRating: number
    completedTrips: number
  }

  // Status
  status: "active" | "inactive" | "pending" | "suspended"
  role: "agent" | "admin" | "super_admin" | "client"

  // Timestamps
  createdAt: string
  updatedAt: string
  lastLoginAt?: string

  // Integration flags
  isImportedFromTC: boolean
  needsPasswordReset: boolean
  isVerified: boolean
}

export interface AgentOnboardingData {
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  professionalInfo: {
    experience: number
    specializations: string[]
    languages: string[]
    certifications: string[]
  }
  businessInfo: {
    agencyName?: string
    territory: string[]
  }
  preferences: {
    currency: string
    timezone: string
  }
}

export class AgentProfileSystem {
  private profiles: Map<string, AgentProfile> = new Map()

  // Create new agent profile (for new registrations)
  async createAgentProfile(onboardingData: AgentOnboardingData): Promise<AgentProfile> {
    const profile: AgentProfile = {
      id: this.generateId(),
      email: onboardingData.personalInfo.email,
      firstName: onboardingData.personalInfo.firstName,
      lastName: onboardingData.personalInfo.lastName,
      displayName: `${onboardingData.personalInfo.firstName} ${onboardingData.personalInfo.lastName}`,
      phone: onboardingData.personalInfo.phone,

      specializations: onboardingData.professionalInfo.specializations,
      languages: onboardingData.professionalInfo.languages,
      certifications: onboardingData.professionalInfo.certifications,
      experience: onboardingData.professionalInfo.experience,

      agencyName: onboardingData.businessInfo.agencyName,
      territory: onboardingData.businessInfo.territory,

      preferences: {
        currency: onboardingData.preferences.currency,
        timezone: onboardingData.preferences.timezone,
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
      },

      stats: {
        totalBookings: 0,
        totalRevenue: 0,
        clientCount: 0,
        averageRating: 0,
        completedTrips: 0,
      },

      status: "pending",
      role: "agent",

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      isImportedFromTC: false,
      needsPasswordReset: false,
      isVerified: false,
    }

    this.profiles.set(profile.id, profile)

    // Save to database (Supabase)
    await this.saveToDatabase(profile)

    return profile
  }

  // Import agent from Travel Compositor
  async importAgentFromTC(tcUser: any, tcAgency?: any): Promise<AgentProfile> {
    // Calculate stats from TC data
    const stats = await this.calculateStatsFromTC(tcUser)

    const profile: AgentProfile = {
      id: this.generateId(),
      email: tcUser.email,
      firstName: tcUser.firstName || "",
      lastName: tcUser.lastName || "",
      displayName: `${tcUser.firstName || ""} ${tcUser.lastName || ""}`.trim() || tcUser.username,

      // TC specific data
      travelCompositorId: tcUser.id,
      micrositeId: tcUser.micrositeId,
      agencyId: tcUser.agencyId,

      // Extract from TC data or set defaults
      specializations: this.extractSpecializations(tcUser),
      languages: this.extractLanguages(tcUser) || ["nl", "en"],
      certifications: tcUser.certifications || [],
      experience: this.calculateExperience(tcUser),

      agencyName: tcAgency?.name,
      agencyCode: tcAgency?.code,
      territory: this.extractTerritory(tcUser, tcAgency),

      preferences: {
        currency: "EUR",
        timezone: "Europe/Amsterdam",
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
      },

      stats,

      status: tcUser.status === "active" ? "active" : "inactive",
      role: tcUser.role || "agent",

      createdAt: tcUser.createdDate || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: tcUser.lastLogin,

      isImportedFromTC: true,
      needsPasswordReset: true, // TC passwords are not imported
      isVerified: true, // Assume TC users are verified
    }

    this.profiles.set(profile.id, profile)
    await this.saveToDatabase(profile)

    return profile
  }

  // Get agent profile
  async getAgentProfile(identifier: string): Promise<AgentProfile | null> {
    // Try by ID first
    if (this.profiles.has(identifier)) {
      return this.profiles.get(identifier)!
    }

    // Try by email
    for (const profile of this.profiles.values()) {
      if (profile.email === identifier) {
        return profile
      }
    }

    // Try from database
    return await this.loadFromDatabase(identifier)
  }

  // Update agent profile
  async updateAgentProfile(id: string, updates: Partial<AgentProfile>): Promise<AgentProfile | null> {
    const profile = await this.getAgentProfile(id)
    if (!profile) return null

    const updatedProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    this.profiles.set(id, updatedProfile)
    await this.saveToDatabase(updatedProfile)

    return updatedProfile
  }

  // Search agents
  async searchAgents(criteria: {
    specialization?: string
    language?: string
    territory?: string
    agency?: string
    status?: string
    role?: string
  }): Promise<AgentProfile[]> {
    const results: AgentProfile[] = []

    for (const profile of this.profiles.values()) {
      let matches = true

      if (criteria.specialization && !profile.specializations.includes(criteria.specialization)) {
        matches = false
      }

      if (criteria.language && !profile.languages.includes(criteria.language)) {
        matches = false
      }

      if (criteria.territory && !profile.territory?.includes(criteria.territory)) {
        matches = false
      }

      if (criteria.agency && profile.agencyName !== criteria.agency) {
        matches = false
      }

      if (criteria.status && profile.status !== criteria.status) {
        matches = false
      }

      if (criteria.role && profile.role !== criteria.role) {
        matches = false
      }

      if (matches) {
        results.push(profile)
      }
    }

    return results
  }

  // Get agent dashboard data
  async getAgentDashboard(agentId: string): Promise<{
    profile: AgentProfile
    recentBookings: any[]
    upcomingTrips: any[]
    pendingTasks: any[]
    performance: any
  } | null> {
    const profile = await this.getAgentProfile(agentId)
    if (!profile) return null

    // Get recent bookings (from TC or our system)
    const recentBookings = await this.getAgentBookings(profile, { limit: 10, recent: true })

    // Get upcoming trips
    const upcomingTrips = await this.getAgentBookings(profile, {
      limit: 5,
      status: "confirmed",
      dateFrom: new Date(),
    })

    // Get pending tasks
    const pendingTasks = await this.getAgentTasks(profile)

    // Get performance metrics
    const performance = await this.getAgentPerformance(profile)

    return {
      profile,
      recentBookings,
      upcomingTrips,
      pendingTasks,
      performance,
    }
  }

  // Sync with Travel Compositor (for imported agents)
  async syncWithTravelCompositor(agentId: string): Promise<boolean> {
    const profile = await this.getAgentProfile(agentId)
    if (!profile || !profile.isImportedFromTC) return false

    try {
      // Fetch latest data from TC
      const tcData = await this.fetchFromTravelCompositor(profile.micrositeId!, profile.travelCompositorId!)

      // Update stats
      const updatedStats = await this.calculateStatsFromTC(tcData.user)

      await this.updateAgentProfile(agentId, {
        stats: updatedStats,
        lastLoginAt: tcData.user.lastLogin,
        status: tcData.user.status === "active" ? "active" : "inactive",
      })

      return true
    } catch (error) {
      console.error("Failed to sync with Travel Compositor:", error)
      return false
    }
  }

  // Helper methods
  private generateId(): string {
    return `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async calculateStatsFromTC(tcUser: any): Promise<AgentProfile["stats"]> {
    const bookings = tcUser.bookings || []
    const ideas = tcUser.ideas || []

    return {
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0),
      clientCount: new Set(bookings.map((b: any) => b.clientEmail)).size,
      averageRating: 4.2, // Would need to calculate from reviews
      completedTrips: bookings.filter((b: any) => b.status === "completed").length,
    }
  }

  private extractSpecializations(tcUser: any): string[] {
    // Extract from TC user data or bookings
    const bookings = tcUser.bookings || []
    const destinations = bookings.flatMap((b: any) => b.destinations || [])

    const specializations = new Set<string>()

    // Analyze destinations to determine specializations
    destinations.forEach((dest: string) => {
      if (dest.includes("Asia")) specializations.add("Asia")
      if (dest.includes("Europe")) specializations.add("Europe")
      if (dest.includes("America")) specializations.add("Americas")
      // Add more logic based on your needs
    })

    return Array.from(specializations)
  }

  private extractLanguages(tcUser: any): string[] {
    // Default languages based on microsite or user data
    return ["nl", "en"] // Default for Dutch travel agents
  }

  private calculateExperience(tcUser: any): number {
    if (tcUser.createdDate) {
      const created = new Date(tcUser.createdDate)
      const now = new Date()
      return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 365))
    }
    return 0
  }

  private extractTerritory(tcUser: any, tcAgency?: any): string[] {
    // Extract from agency or user data
    if (tcAgency?.territory) return tcAgency.territory
    return ["Netherlands"] // Default
  }

  private async getAgentBookings(profile: AgentProfile, filters: any): Promise<any[]> {
    if (profile.isImportedFromTC && profile.micrositeId) {
      // Fetch from Travel Compositor
      const response = await fetch(
        `/api/travel-compositor/booking-super-fast?config=${profile.micrositeId}&agentEmail=${profile.email}`,
      )
      if (response.ok) {
        const data = await response.json()
        return data.bookings || []
      }
    }

    // Fetch from our own system
    return []
  }

  private async getAgentTasks(profile: AgentProfile): Promise<any[]> {
    // Get pending tasks for agent
    return [
      { id: 1, title: "Follow up with client John Doe", priority: "high", dueDate: "2025-01-08" },
      { id: 2, title: "Prepare itinerary for Smith family", priority: "medium", dueDate: "2025-01-10" },
    ]
  }

  private async getAgentPerformance(profile: AgentProfile): Promise<any> {
    return {
      thisMonth: {
        bookings: 12,
        revenue: 15000,
        newClients: 3,
      },
      lastMonth: {
        bookings: 8,
        revenue: 12000,
        newClients: 2,
      },
      trend: "up",
    }
  }

  private async fetchFromTravelCompositor(micrositeId: string, tcUserId: string): Promise<any> {
    // Implementation to fetch from TC API
    return { user: {} }
  }

  private async saveToDatabase(profile: AgentProfile): Promise<void> {
    // Save to Supabase or your database
    console.log("Saving agent profile to database:", profile.id)
  }

  private async loadFromDatabase(identifier: string): Promise<AgentProfile | null> {
    // Load from Supabase or your database
    console.log("Loading agent profile from database:", identifier)
    return null
  }
}

// Singleton instance
export const agentProfileSystem = new AgentProfileSystem()
