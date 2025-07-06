export interface ImportRequest {
  type: "booking" | "idea" | "package"
  id: string
  micrositeId?: string
  userEmail?: string
  userRole?: string
}

export interface ImportResult {
  success: boolean
  type: "booking" | "idea" | "package"
  data?: any
  error?: string
  searchMethod?: string
  foundInMicrosite?: string
  debugInfo?: any
}

export class UniversalTravelImporter {
  private baseUrl = "https://online.travelcompositor.com"
  private authTokens: Map<string, { token: string; expiry: Date }> = new Map()

  // Microsites configuratie
  private getMicrositeConfigs() {
    return [
      {
        id: "1",
        name: "Primary Microsite",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!,
      },
      {
        id: "2",
        name: "Secondary Microsite",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_2!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_2!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_2!,
      },
      {
        id: "3",
        name: "Tertiary Microsite",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_3!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_3!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3!,
      },
      {
        id: "4",
        name: "Quaternary Microsite",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_4!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_4!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_4!,
      },
    ].filter((config) => config.username && config.password && config.micrositeId)
  }

  // Authenticatie
  private async authenticate(micrositeId: string): Promise<string> {
    const config = this.getMicrositeConfigs().find((c) => c.micrositeId === micrositeId)
    if (!config) throw new Error(`No config found for microsite ${micrositeId}`)

    const existing = this.authTokens.get(micrositeId)
    if (existing && existing.expiry > new Date()) {
      return existing.token
    }

    console.log(`🔐 Authenticating with ${config.name}...`)

    const response = await fetch(`${this.baseUrl}/resources/authentication/authenticate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        username: config.username,
        password: config.password,
        micrositeId: config.micrositeId,
      }),
    })

    if (!response.ok) {
      throw new Error(`Authentication failed for ${config.name}: ${response.status}`)
    }

    const authData = await response.json()
    const expiry = new Date(Date.now() + (authData.expirationInSeconds || 7200) * 1000 - 60000)

    this.authTokens.set(micrositeId, { token: authData.token, expiry })
    console.log(`✅ Authenticated with ${config.name}`)

    return authData.token
  }

  // Universal import functie met permission checking
  async import(request: ImportRequest): Promise<ImportResult> {
    console.log(`🚀 Starting ${request.type} import for ID: ${request.id}`)

    const configs = request.micrositeId
      ? this.getMicrositeConfigs().filter((c) => c.micrositeId === request.micrositeId)
      : this.getMicrositeConfigs()

    for (const config of configs) {
      try {
        console.log(`🔍 Trying ${config.name} for ${request.type} ${request.id}...`)

        const result = await this.importFromMicrosite(request, config)
        if (result.success) {
          // Permission check
          const hasPermission = await this.checkImportPermission(result.data, request)
          if (!hasPermission) {
            return {
              success: false,
              type: request.type,
              error: "Je hebt geen toestemming om deze data te importeren",
            }
          }

          console.log(`✅ Successfully imported ${request.type} from ${config.name}`)
          return result
        }
      } catch (error) {
        console.log(`❌ Failed with ${config.name}:`, error)
        continue
      }
    }

    return {
      success: false,
      type: request.type,
      error: `${request.type} ${request.id} not found in any microsite`,
    }
  }

  // Permission check voor imported data
  private async checkImportPermission(data: any, request: ImportRequest): Promise<boolean> {
    // Super admins kunnen alles
    if (request.userRole === "super_admin") return true

    // Admins kunnen alles van hun microsites
    if (request.userRole === "admin") return true

    // Agents kunnen alleen hun eigen data
    if (request.userRole === "agent" && request.userEmail) {
      switch (request.type) {
        case "booking":
          const bookingOwnerEmail = data.client?.email || data.clientEmail || data.customer?.email
          return bookingOwnerEmail === request.userEmail

        case "idea":
          const ideaOwnerEmail = data.customer?.email || data.clientEmail || data.user
          return ideaOwnerEmail === request.userEmail

        case "package":
          // Packages zijn meestal publiek
          return true

        default:
          return false
      }
    }

    return false
  }

  // Import van specifieke microsite
  private async importFromMicrosite(request: ImportRequest, config: any): Promise<ImportResult> {
    const token = await this.authenticate(config.micrositeId)

    switch (request.type) {
      case "booking":
        return await this.importBooking(request.id, config, token)
      case "idea":
        return await this.importIdea(request.id, config, token)
      case "package":
        return await this.importPackage(request.id, config, token)
      default:
        throw new Error(`Unknown import type: ${request.type}`)
    }
  }

  // Booking import - ONLY direct API calls
  private async importBooking(bookingId: string, config: any, token: string): Promise<ImportResult> {
    console.log(`📋 Importing booking ${bookingId} from ${config.name}`)

    const cleanBookingId = bookingId.replace(/^RRP-?/i, "")
    const idsToTry = [bookingId, cleanBookingId]

    for (const idToTry of idsToTry) {
      const endpoints = [
        `${this.baseUrl}/resources/booking/${config.micrositeId}/${idToTry}`,
        `${this.baseUrl}/resources/booking/getBooking?microsite=${config.micrositeId}&bookingId=${idToTry}`,
        `${this.baseUrl}/resources/booking/${idToTry}?microsite=${config.micrositeId}`,
      ]

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          })

          if (response.ok) {
            const data = await response.json()

            if (data && (data.id || data.bookingReference || data.bookingId || data.bookedTrip)) {
              return {
                success: true,
                type: "booking",
                data: this.transformBookingData(data, bookingId),
                foundInMicrosite: config.name,
                searchMethod: `Direct booking lookup via ${endpoint}`,
              }
            }
          }
        } catch (error) {
          continue
        }
      }
    }

    throw new Error(`Booking ${bookingId} not found in ${config.name}`)
  }

  // Travel Idea import
  private async importIdea(ideaId: string, config: any, token: string): Promise<ImportResult> {
    console.log(`💡 Importing idea ${ideaId} from ${config.name}`)

    const response = await fetch(`${this.baseUrl}/resources/travelidea/${config.micrositeId}/${ideaId}?lang=nl`, {
      headers: {
        "auth-token": token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Idea ${ideaId} not found in ${config.name}: ${response.status}`)
    }

    const data = await response.json()

    return {
      success: true,
      type: "idea",
      data: this.transformIdeaData(data, ideaId),
      foundInMicrosite: config.name,
      searchMethod: `Direct idea lookup`,
    }
  }

  // Holiday Package import
  private async importPackage(packageId: string, config: any, token: string): Promise<ImportResult> {
    console.log(`📦 Importing package ${packageId} from ${config.name}`)

    const endpoints = [
      `${this.baseUrl}/resources/package/${config.micrositeId}/${packageId}?lang=nl`,
      `${this.baseUrl}/resources/package/${config.micrositeId}/${packageId}`,
      `${this.baseUrl}/resources/holidaypackage/${config.micrositeId}/${packageId}?lang=nl`,
    ]

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()

          return {
            success: true,
            type: "package",
            data: this.transformPackageData(data, packageId),
            foundInMicrosite: config.name,
            searchMethod: `Direct package lookup via ${endpoint}`,
          }
        }
      } catch (error) {
        continue
      }
    }

    throw new Error(`Package ${packageId} not found in ${config.name}`)
  }

  // Haal bookings op voor specifieke user
  async getUserBookings(micrositeId: string, userEmail: string): Promise<any[]> {
    try {
      const token = await this.authenticate(micrositeId)

      const endpoints = [
        `/resources/booking/${micrositeId}?clientEmail=${encodeURIComponent(userEmail)}`,
        `/resources/booking/${micrositeId}?email=${encodeURIComponent(userEmail)}`,
        `/resources/booking/${micrositeId}?client=${encodeURIComponent(userEmail)}`,
      ]

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${this.baseUrl}${endpoint}`, {
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          })

          if (response.ok) {
            const data = await response.json()
            const bookings = data.booking || data.bookings || []
            if (bookings.length > 0) {
              return bookings
            }
          }
        } catch (error) {
          continue
        }
      }

      return []
    } catch (error) {
      console.log(`⚠️ Could not fetch bookings for user ${userEmail}:`, error)
      return []
    }
  }

  // Haal ideas op voor specifieke user
  async getUserIdeas(micrositeId: string, userEmail: string): Promise<any[]> {
    try {
      const token = await this.authenticate(micrositeId)

      const endpoints = [
        `/resources/travelideas/${micrositeId}?clientEmail=${encodeURIComponent(userEmail)}`,
        `/resources/ideas/${micrositeId}?email=${encodeURIComponent(userEmail)}`,
        `/resources/travelidea/${micrositeId}?client=${encodeURIComponent(userEmail)}`,
      ]

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${this.baseUrl}${endpoint}`, {
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          })

          if (response.ok) {
            const data = await response.json()
            const ideas = data.travelIdea || data.ideas || data.travelideas || []
            if (ideas.length > 0) {
              return ideas
            }
          }
        } catch (error) {
          continue
        }
      }

      return []
    } catch (error) {
      console.log(`⚠️ Could not fetch ideas for user ${userEmail}:`, error)
      return []
    }
  }

  // Data transformers
  private transformBookingData(rawData: any, bookingId: string) {
    return {
      id: rawData.id || bookingId,
      bookingReference: rawData.bookingReference || rawData.id || bookingId,
      title: rawData.title || rawData.name || `Booking ${bookingId}`,
      client: {
        name: rawData.client?.name || rawData.clientName || "Unknown Client",
        email: rawData.client?.email || rawData.clientEmail || "",
        phone: rawData.client?.phone || rawData.clientPhone || "",
      },
      destination: rawData.destination || "Unknown Destination",
      startDate: rawData.startDate || rawData.departureDate,
      endDate: rawData.endDate || rawData.returnDate,
      status: rawData.status || "Confirmed",
      totalPrice: rawData.totalPrice?.amount || rawData.totalPrice || 0,
      currency: rawData.currency || "EUR",
      accommodations: rawData.accommodations || rawData.hotels || [],
      activities: rawData.activities || rawData.tickets || [],
      transports: rawData.transports || [],
      vouchers: rawData.vouchers || rawData.transfers || [],
      importedAt: new Date().toISOString(),
      originalData: rawData,
    }
  }

  private transformIdeaData(rawData: any, ideaId: string) {
    return {
      id: rawData.id?.toString() || ideaId,
      title: rawData.title || rawData.largeTitle || `Travel Idea ${ideaId}`,
      description: rawData.description || "",
      imageUrl: rawData.imageUrl || "",
      creationDate: rawData.creationDate || "",
      departureDate: rawData.departureDate || "",
      themes: rawData.themes || [],
      pricePerPerson: rawData.pricePerPerson || { amount: 0, currency: "EUR" },
      totalPrice: rawData.totalPrice || { amount: 0, currency: "EUR" },
      destinations: rawData.destinations || [],
      customer: rawData.customer || {},
      counters: rawData.counters || {},
      importedAt: new Date().toISOString(),
      originalData: rawData,
    }
  }

  private transformPackageData(rawData: any, packageId: string) {
    return {
      id: rawData.id?.toString() || packageId,
      title: rawData.title || rawData.name || rawData.packageName || `Holiday Package ${packageId}`,
      description: rawData.description || rawData.shortDescription || "",
      price: {
        amount: rawData.price?.amount || rawData.priceFrom?.amount || 0,
        currency: rawData.price?.currency || rawData.currency || "EUR",
      },
      startDate: rawData.startDate || rawData.validFrom,
      endDate: rawData.endDate || rawData.validTo,
      destinations: rawData.destinations || rawData.locations || [],
      theme: rawData.theme || rawData.category || rawData.type,
      duration: {
        nights: rawData.nights || rawData.duration?.nights,
        days: rawData.days || rawData.duration?.days,
      },
      images: rawData.images || rawData.photos || [],
      importedAt: new Date().toISOString(),
      originalData: rawData,
    }
  }

  // Batch import functie
  async batchImport(requests: ImportRequest[]): Promise<ImportResult[]> {
    console.log(`🚀 Starting batch import of ${requests.length} items`)

    const results: ImportResult[] = []

    for (const request of requests) {
      try {
        const result = await this.import(request)
        results.push(result)
      } catch (error) {
        results.push({
          success: false,
          type: request.type,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return results
  }
}
