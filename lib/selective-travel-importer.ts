export class SelectiveTravelImporter {
  private baseUrl = "https://online.travelcompositor.com"
  private authToken: string | null = null
  private tokenExpiry: Date | null = null

  async authenticate(): Promise<string> {
    if (this.authToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.authToken
    }

    const credentials = {
      username: process.env.TRAVEL_COMPOSITOR_USERNAME!,
      password: process.env.TRAVEL_COMPOSITOR_PASSWORD!,
      micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!,
    }

    const response = await fetch(`${this.baseUrl}/resources/authentication/authenticate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status}`)
    }

    const data = await response.json()
    this.authToken = data.token
    this.tokenExpiry = new Date(Date.now() + (data.expirationInSeconds || 7200) * 1000 - 60000)

    return this.authToken
  }

  // Import specifieke booking
  async importSpecificBooking(bookingId: string): Promise<any> {
    console.log(`📋 Importing specific booking: ${bookingId}`)

    const token = await this.authenticate()
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!

    // Probeer verschillende booking endpoints
    const endpoints = [
      `/resources/booking/${micrositeId}/${bookingId}`,
      `/resources/booking/${bookingId}`,
      `/resources/booking/${micrositeId}?bookingReference=${bookingId}`,
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
          console.log(`✅ Found booking ${bookingId} via ${endpoint}`)
          return data
        }
      } catch (error) {
        console.log(`⚠️ Endpoint ${endpoint} failed, trying next...`)
      }
    }

    throw new Error(`Booking ${bookingId} not found in any endpoint`)
  }

  // Import specifieke travel idea
  async importSpecificIdea(ideaId: string): Promise<any> {
    console.log(`💡 Importing specific idea: ${ideaId}`)

    const token = await this.authenticate()
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!

    const endpoints = [
      `/resources/travelidea/${micrositeId}/${ideaId}`,
      `/resources/idea/${micrositeId}/${ideaId}`,
      `/resources/travelideas/${micrositeId}?ideaId=${ideaId}`,
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
          console.log(`✅ Found idea ${ideaId} via ${endpoint}`)
          return data
        }
      } catch (error) {
        console.log(`⚠️ Endpoint ${endpoint} failed, trying next...`)
      }
    }

    throw new Error(`Idea ${ideaId} not found in any endpoint`)
  }

  // Import specifieke holiday package
  async importSpecificPackage(packageId: string): Promise<any> {
    console.log(`📦 Importing specific package: ${packageId}`)

    const token = await this.authenticate()
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!

    const endpoints = [
      `/resources/package/rondreis-planner/${packageId}?lang=nl`,
      `/resources/packages/${micrositeId}/${packageId}`,
      `/resources/holidaypackage/${micrositeId}/${packageId}`,
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
          console.log(`✅ Found package ${packageId} via ${endpoint}`)
          return data
        }
      } catch (error) {
        console.log(`⚠️ Endpoint ${endpoint} failed, trying next...`)
      }
    }

    throw new Error(`Package ${packageId} not found in any endpoint`)
  }

  // Zoek items (zonder ze te importeren)
  async searchItems(type: "booking" | "idea" | "package", searchTerm: string): Promise<any[]> {
    console.log(`🔍 Searching for ${type}s matching: ${searchTerm}`)

    const token = await this.authenticate()
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!

    let endpoint = ""
    switch (type) {
      case "booking":
        endpoint = `/resources/booking/${micrositeId}?first=0&limit=20&search=${searchTerm}`
        break
      case "idea":
        endpoint = `/resources/travelideas/${micrositeId}?first=0&limit=20&search=${searchTerm}`
        break
      case "package":
        endpoint = `/resources/packages/${micrositeId}?first=0&limit=20&search=${searchTerm}`
        break
    }

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
        const items = data[type] || data[`${type}s`] || []
        console.log(`🔍 Found ${items.length} ${type}s matching "${searchTerm}"`)
        return items
      }
    } catch (error) {
      console.log(`⚠️ Search failed for ${type}:`, error)
    }

    return []
  }
}
