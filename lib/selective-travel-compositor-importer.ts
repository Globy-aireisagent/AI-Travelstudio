export interface ImportFilter {
  // Agency filters
  agencies?: {
    includeInactive?: boolean
    minCreditBalance?: number
    specificAgencyIds?: string[]
    excludeAgencyIds?: string[]
  }

  // User filters
  users?: {
    includeInactive?: boolean
    roles?: ("agent" | "admin" | "client")[]
    lastLoginAfter?: Date
    hasBookings?: boolean
    hasIdeas?: boolean
    specificEmails?: string[]
  }

  // Booking filters
  bookings?: {
    dateFrom?: Date
    dateTo?: Date
    minValue?: number
    status?: string[]
    includeCompleted?: boolean
    includeCancelled?: boolean
  }

  // Idea filters
  ideas?: {
    dateFrom?: Date
    dateTo?: Date
    hasImages?: boolean
    isPublished?: boolean
  }

  // General filters
  microsites?: string[]
  maxRecords?: number
  includeTestData?: boolean
}

export interface ImportPreview {
  agencies: {
    total: number
    active: number
    withCredit: number
    selected: number
  }
  users: {
    total: number
    active: number
    agents: number
    admins: number
    clients: number
    selected: number
  }
  bookings: {
    total: number
    recent: number
    completed: number
    selected: number
    totalValue: number
  }
  ideas: {
    total: number
    published: number
    withImages: number
    selected: number
  }
}

export class SelectiveTravelCompositorImporter {
  private baseUrl = "https://online.travelcompositor.com"
  private authTokens: Map<string, { token: string; expiry: Date }> = new Map()

  // Preview wat er geïmporteerd zou worden
  async previewImport(filter: ImportFilter): Promise<ImportPreview> {
    console.log("🔍 Previewing import with filters:", filter)

    const preview: ImportPreview = {
      agencies: { total: 0, active: 0, withCredit: 0, selected: 0 },
      users: { total: 0, active: 0, agents: 0, admins: 0, clients: 0, selected: 0 },
      bookings: { total: 0, recent: 0, completed: 0, selected: 0, totalValue: 0 },
      ideas: { total: 0, published: 0, withImages: 0, selected: 0 },
    }

    const microsites = filter.microsites || ["1", "2", "3", "4"]

    for (const micrositeId of microsites) {
      try {
        // Preview agencies
        const agencies = await this.getFilteredAgencies(micrositeId, filter.agencies)
        preview.agencies.total += agencies.length
        preview.agencies.active += agencies.filter((a) => a.status === "active").length
        preview.agencies.withCredit += agencies.filter((a) => a.creditBalance > 0).length
        preview.agencies.selected += agencies.length

        // Preview users voor elke agency
        for (const agency of agencies) {
          const users = await this.getFilteredUsers(micrositeId, agency.id, filter.users)
          preview.users.total += users.length
          preview.users.active += users.filter((u) => u.status === "active").length
          preview.users.agents += users.filter((u) => u.role === "agent").length
          preview.users.admins += users.filter((u) => u.role === "admin").length
          preview.users.clients += users.filter((u) => u.role === "client").length
          preview.users.selected += users.length

          // Preview bookings en ideas voor elke user
          for (const user of users) {
            if (filter.bookings !== false) {
              const bookings = await this.getFilteredBookings(micrositeId, user.email, filter.bookings)
              preview.bookings.total += bookings.length
              preview.bookings.selected += bookings.length
              preview.bookings.totalValue += bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
            }

            if (filter.ideas !== false) {
              const ideas = await this.getFilteredIdeas(micrositeId, user.email, filter.ideas)
              preview.ideas.total += ideas.length
              preview.ideas.selected += ideas.length
            }
          }
        }
      } catch (error) {
        console.log(`⚠️ Could not preview microsite ${micrositeId}:`, error)
      }
    }

    return preview
  }

  // Gefilterde agencies ophalen
  private async getFilteredAgencies(micrositeId: string, filter?: ImportFilter["agencies"]): Promise<any[]> {
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

      if (agencies.length < limit) break
      first += limit
    }

    // Apply filters
    let filteredAgencies = allAgencies

    if (filter) {
      if (!filter.includeInactive) {
        filteredAgencies = filteredAgencies.filter((a) => a.status === "active")
      }

      if (filter.minCreditBalance) {
        filteredAgencies = filteredAgencies.filter((a) => (a.creditBalance || 0) >= filter.minCreditBalance!)
      }

      if (filter.specificAgencyIds?.length) {
        filteredAgencies = filteredAgencies.filter((a) => filter.specificAgencyIds!.includes(a.id))
      }

      if (filter.excludeAgencyIds?.length) {
        filteredAgencies = filteredAgencies.filter((a) => !filter.excludeAgencyIds!.includes(a.id))
      }
    }

    return filteredAgencies
  }

  // Gefilterde users ophalen
  private async getFilteredUsers(
    micrositeId: string,
    agencyId: string,
    filter?: ImportFilter["users"],
  ): Promise<any[]> {
    const token = await this.authenticate(micrositeId)

    const response = await fetch(`${this.baseUrl}/resources/user/${micrositeId}/${agencyId}`, {
      headers: {
        "auth-token": token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    if (!response.ok) return []

    const data = await response.json()
    let users = data.user || []

    // Apply filters
    if (filter) {
      if (!filter.includeInactive) {
        users = users.filter((u: any) => u.status === "active")
      }

      if (filter.roles?.length) {
        users = users.filter((u: any) => filter.roles!.includes(u.role))
      }

      if (filter.lastLoginAfter) {
        users = users.filter((u: any) => {
          if (!u.lastLogin) return false
          return new Date(u.lastLogin) > filter.lastLoginAfter!
        })
      }

      if (filter.specificEmails?.length) {
        users = users.filter((u: any) => filter.specificEmails!.includes(u.email))
      }
    }

    return users
  }

  // Gefilterde bookings ophalen
  private async getFilteredBookings(
    micrositeId: string,
    userEmail: string,
    filter?: ImportFilter["bookings"],
  ): Promise<any[]> {
    try {
      // Gebruik onze bestaande booking API
      const response = await fetch(
        `/api/travel-compositor/booking-super-fast?config=${micrositeId}&clientEmail=${encodeURIComponent(userEmail)}`,
      )

      if (!response.ok) return []

      const data = await response.json()
      let bookings = data.bookings || []

      // Apply filters
      if (filter) {
        if (filter.dateFrom) {
          bookings = bookings.filter((b: any) => new Date(b.departureDate || b.createdDate) >= filter.dateFrom!)
        }

        if (filter.dateTo) {
          bookings = bookings.filter((b: any) => new Date(b.departureDate || b.createdDate) <= filter.dateTo!)
        }

        if (filter.minValue) {
          bookings = bookings.filter((b: any) => (b.totalPrice || 0) >= filter.minValue!)
        }

        if (filter.status?.length) {
          bookings = bookings.filter((b: any) => filter.status!.includes(b.status))
        }

        if (!filter.includeCompleted) {
          bookings = bookings.filter((b: any) => b.status !== "completed")
        }

        if (!filter.includeCancelled) {
          bookings = bookings.filter((b: any) => b.status !== "cancelled")
        }
      }

      return bookings
    } catch (error) {
      return []
    }
  }

  // Gefilterde ideas ophalen
  private async getFilteredIdeas(
    micrositeId: string,
    userEmail: string,
    filter?: ImportFilter["ideas"],
  ): Promise<any[]> {
    try {
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
      let ideas = data.ideas || []

      // Apply filters
      if (filter) {
        if (filter.dateFrom) {
          ideas = ideas.filter((i: any) => new Date(i.createdDate) >= filter.dateFrom!)
        }

        if (filter.dateTo) {
          ideas = ideas.filter((i: any) => new Date(i.createdDate) <= filter.dateTo!)
        }

        if (filter.hasImages) {
          ideas = ideas.filter((i: any) => i.images && i.images.length > 0)
        }

        if (filter.isPublished !== undefined) {
          ideas = ideas.filter((i: any) => i.published === filter.isPublished)
        }
      }

      return ideas
    } catch (error) {
      return []
    }
  }

  // Selectieve import uitvoeren
  async executeSelectiveImport(filter: ImportFilter): Promise<{
    success: boolean
    imported: {
      agencies: number
      users: number
      bookings: number
      ideas: number
    }
    data: any
  }> {
    console.log("🚀 Starting selective import with filters:", filter)

    const importedData = {
      agencies: [] as any[],
      users: [] as any[],
      bookings: [] as any[],
      ideas: [] as any[],
    }

    const microsites = filter.microsites || ["1", "2", "3", "4"]

    for (const micrositeId of microsites) {
      try {
        console.log(`📡 Processing microsite ${micrositeId}...`)

        // Import gefilterde agencies
        const agencies = await this.getFilteredAgencies(micrositeId, filter.agencies)

        for (const agency of agencies) {
          // Voeg agency toe
          importedData.agencies.push({
            ...agency,
            micrositeId,
            importedAt: new Date().toISOString(),
          })

          // Import gefilterde users
          const users = await this.getFilteredUsers(micrositeId, agency.id, filter.users)

          for (const user of users) {
            // Voeg user toe
            const userData = {
              ...user,
              agencyId: agency.id,
              micrositeId,
              importedAt: new Date().toISOString(),
            }
            importedData.users.push(userData)

            // Import gefilterde bookings
            if (filter.bookings !== false) {
              const bookings = await this.getFilteredBookings(micrositeId, user.email, filter.bookings)
              bookings.forEach((booking) => {
                importedData.bookings.push({
                  ...booking,
                  userId: user.id,
                  userEmail: user.email,
                  agencyId: agency.id,
                  micrositeId,
                  importedAt: new Date().toISOString(),
                })
              })
            }

            // Import gefilterde ideas
            if (filter.ideas !== false) {
              const ideas = await this.getFilteredIdeas(micrositeId, user.email, filter.ideas)
              ideas.forEach((idea) => {
                importedData.ideas.push({
                  ...idea,
                  userId: user.id,
                  userEmail: user.email,
                  agencyId: agency.id,
                  micrositeId,
                  importedAt: new Date().toISOString(),
                })
              })
            }
          }
        }

        console.log(`✅ Microsite ${micrositeId} processed: ${agencies.length} agencies`)
      } catch (error) {
        console.log(`⚠️ Could not process microsite ${micrositeId}:`, error)
      }
    }

    return {
      success: true,
      imported: {
        agencies: importedData.agencies.length,
        users: importedData.users.length,
        bookings: importedData.bookings.length,
        ideas: importedData.ideas.length,
      },
      data: importedData,
    }
  }

  // Authenticatie helper
  private async authenticate(micrositeId: string): Promise<string> {
    const existing = this.authTokens.get(micrositeId)
    if (existing && existing.expiry > new Date()) {
      return existing.token
    }

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
}
