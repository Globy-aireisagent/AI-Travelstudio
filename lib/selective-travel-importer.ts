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

  // Haal alle agencies op om users te vinden
  async getAllAgencies(): Promise<any[]> {
    const token = await this.authenticate()
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!

    try {
      const response = await fetch(`${this.baseUrl}/resources/agency/${micrositeId}?first=0&limit=100`, {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        return data.agency || data.agencies || []
      }
    } catch (error) {
      console.log("⚠️ Error fetching agencies:", error)
    }

    return []
  }

  // Haal users op voor een agency
  async getUsersForAgency(agencyId: string): Promise<any[]> {
    const token = await this.authenticate()
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!

    try {
      const response = await fetch(`${this.baseUrl}/resources/user/${micrositeId}/${agencyId}?first=0&limit=100`, {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        return data.user || data.users || []
      }
    } catch (error) {
      console.log(`⚠️ Error fetching users for agency ${agencyId}:`, error)
    }

    return []
  }

  // Import specifieke booking - nu met user-based zoeken
  async importSpecificBooking(bookingId: string): Promise<any> {
    console.log(`📋 Importing specific booking: ${bookingId}`)

    const token = await this.authenticate()
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!

    // Eerst proberen directe booking endpoints
    const directEndpoints = [
      `/resources/booking/${micrositeId}/${bookingId}`,
      `/resources/booking/${bookingId}`,
      `/resources/booking/${micrositeId}?bookingReference=${bookingId}`,
      `/resources/booking/${micrositeId}?reference=${bookingId}`,
      `/resources/booking/${micrositeId}?id=${bookingId}`,
    ]

    for (const endpoint of directEndpoints) {
      try {
        console.log(`🔍 Trying direct endpoint: ${endpoint}`)
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`✅ Found booking ${bookingId} via direct endpoint: ${endpoint}`)
          return data
        } else {
          console.log(`❌ Direct endpoint ${endpoint} failed: ${response.status}`)
        }
      } catch (error) {
        console.log(`⚠️ Direct endpoint ${endpoint} error:`, error)
      }
    }

    // Als directe endpoints falen, zoek via agencies en users
    console.log(`🔍 Direct endpoints failed, searching via agencies and users...`)

    const agencies = await this.getAllAgencies()
    console.log(`🏢 Found ${agencies.length} agencies to search`)

    for (const agency of agencies) {
      console.log(`🏢 Searching in agency: ${agency.name} (${agency.id})`)

      // Probeer booking endpoints per agency
      const agencyEndpoints = [
        `/resources/booking/${micrositeId}/${agency.id}?bookingReference=${bookingId}`,
        `/resources/booking/${micrositeId}/${agency.id}?reference=${bookingId}`,
        `/resources/booking/${micrositeId}/${agency.id}?id=${bookingId}`,
        `/resources/booking/${micrositeId}/${agency.id}`,
      ]

      for (const endpoint of agencyEndpoints) {
        try {
          console.log(`🔍 Trying agency endpoint: ${endpoint}`)
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

            // Zoek de specifieke booking
            const targetBooking = bookings.find(
              (booking: any) =>
                booking.id === bookingId ||
                booking.reference === bookingId ||
                booking.bookingReference === bookingId ||
                booking.bookingId === bookingId,
            )

            if (targetBooking) {
              console.log(`✅ Found booking ${bookingId} in agency ${agency.name}`)
              return targetBooking
            } else if (bookings.length > 0) {
              console.log(`📋 Found ${bookings.length} bookings in agency ${agency.name}, but not the target booking`)
            }
          }
        } catch (error) {
          console.log(`⚠️ Agency endpoint ${endpoint} error:`, error)
        }
      }

      // Probeer ook via users in deze agency
      const users = await this.getUsersForAgency(agency.id)
      console.log(`👥 Found ${users.length} users in agency ${agency.name}`)

      for (const user of users) {
        const userEndpoints = [
          `/resources/booking/${micrositeId}/${agency.id}/${user.username}?bookingReference=${bookingId}`,
          `/resources/booking/${micrositeId}/${agency.id}/${user.username}`,
        ]

        for (const endpoint of userEndpoints) {
          try {
            console.log(`🔍 Trying user endpoint: ${endpoint}`)
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

              const targetBooking = bookings.find(
                (booking: any) =>
                  booking.id === bookingId ||
                  booking.reference === bookingId ||
                  booking.bookingReference === bookingId ||
                  booking.bookingId === bookingId,
              )

              if (targetBooking) {
                console.log(`✅ Found booking ${bookingId} for user ${user.username} in agency ${agency.name}`)
                return targetBooking
              }
            }
          } catch (error) {
            console.log(`⚠️ User endpoint ${endpoint} error:`, error)
          }
        }
      }
    }

    throw new Error(`Booking ${bookingId} not found in any agency or user`)
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
