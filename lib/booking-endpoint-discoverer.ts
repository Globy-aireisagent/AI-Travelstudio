/**
 * BookingEndpointDiscoverer
 *
 * Tests multiple microsite configurations to find working booking endpoints
 */

export interface EndpointResult {
  endpoint: string
  status: number
  dataKeys: string[]
  totalCount: number
  agencyId?: string
  agencyName?: string
  micrositeId?: string
  configName?: string
}

export interface DiscoveryResults {
  workingEndpoints: EndpointResult[]
  failedEndpoints: { endpoint: string; status?: number; error: string; micrositeId?: string }[]
  agencies: { id: string; name: string }[]
  sampleBookings: any[]
  testedConfigs: { name: string; micrositeId: string; status: string }[]
}

export class BookingEndpointDiscoverer {
  private baseUrl = "https://online.travelcompositor.com"
  private authTokens: Map<string, { token: string; expiry: number }> = new Map()

  private getConfigurations() {
    const configs = []

    // Config 1 (primary)
    if (
      process.env.TRAVEL_COMPOSITOR_USERNAME &&
      process.env.TRAVEL_COMPOSITOR_PASSWORD &&
      process.env.TRAVEL_COMPOSITOR_MICROSITE_ID
    ) {
      configs.push({
        name: "Config 1 (Primary)",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID,
      })
    }

    // Config 2
    if (
      process.env.TRAVEL_COMPOSITOR_USERNAME_2 &&
      process.env.TRAVEL_COMPOSITOR_PASSWORD_2 &&
      process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_2
    ) {
      configs.push({
        name: "Config 2",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_2,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_2,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_2,
      })
    }

    // Config 3
    if (
      process.env.TRAVEL_COMPOSITOR_USERNAME_3 &&
      process.env.TRAVEL_COMPOSITOR_PASSWORD_3 &&
      process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3
    ) {
      configs.push({
        name: "Config 3",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_3,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_3,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3,
      })
    }

    return configs
  }

  private async authenticate(config: any): Promise<string> {
    const cacheKey = `${config.username}-${config.micrositeId}`
    const cached = this.authTokens.get(cacheKey)

    if (cached && Date.now() < cached.expiry) {
      return cached.token
    }

    console.log(`🔐 Authenticating ${config.name} (microsite: ${config.micrositeId})...`)

    const res = await fetch(`${this.baseUrl}/resources/authentication/authenticate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        username: config.username,
        password: config.password,
        micrositeId: config.micrositeId,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Authentication failed for ${config.name}: ${res.status} – ${text}`)
    }

    const data: any = await res.json()
    const token = data.token
    const expiry = Date.now() + (data.expirationInSeconds ?? 7200) * 1000 - 60_000

    this.authTokens.set(cacheKey, { token, expiry })
    console.log(`✅ Authentication successful for ${config.name}`)

    return token
  }

  public async discoverBookingEndpoints(): Promise<DiscoveryResults> {
    const configs = this.getConfigurations()

    if (configs.length === 0) {
      console.warn("No Travel Compositor configurations found in environment variables")
      return {
        workingEndpoints: [],
        failedEndpoints: [],
        agencies: [],
        sampleBookings: [],
        testedConfigs: [],
      }
    }

    const results: DiscoveryResults = {
      workingEndpoints: [],
      failedEndpoints: [],
      agencies: [],
      sampleBookings: [],
      testedConfigs: [],
    }

    console.log(`🔍 Testing ${configs.length} microsite configurations...`)

    for (const config of configs) {
      console.log(`\n🧪 Testing ${config.name} with microsite ID: ${config.micrositeId}`)

      try {
        const token = await this.authenticate(config)

        results.testedConfigs.push({
          name: config.name,
          micrositeId: config.micrositeId,
          status: "authenticated",
        })

        // Test different endpoint patterns for this microsite
        const endpointsToTest = [
          `/resources/booking/getBookings?microsite=${config.micrositeId}&first=0&limit=50`,
          `/resources/booking/getBookings?microsite=${config.micrositeId}&from=20250101&to=20251231`,
          `/resources/booking/${config.micrositeId}`,
          `/resources/booking/${config.micrositeId}?first=0&limit=50`,
          `/booking/getBookings/${config.micrositeId}`,
          `/resources/bookings/${config.micrositeId}`,
        ]

        for (const endpoint of endpointsToTest) {
          try {
            console.log(`  🔍 Testing: ${endpoint}`)

            const res = await fetch(`${this.baseUrl}${endpoint}`, {
              headers: {
                "auth-token": token,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            })

            if (res.ok) {
              const data: any = await res.json()
              console.log(`  ✅ SUCCESS: ${endpoint} (${res.status})`)

              results.workingEndpoints.push({
                endpoint,
                status: res.status,
                dataKeys: Object.keys(data),
                totalCount: data.totalCount ?? data.total ?? 0,
                micrositeId: config.micrositeId,
                configName: config.name,
              })

              // Extract bookings
              const bookings = data.bookedTrip ?? data.booking ?? data.bookings ?? data.results ?? data.data ?? []
              if (Array.isArray(bookings) && bookings.length > 0) {
                console.log(`  📋 Found ${bookings.length} bookings`)
                results.sampleBookings.push(...bookings.slice(0, 5))
              }
            } else {
              const errorText = await res.text()
              console.log(`  ❌ FAILED: ${endpoint} (${res.status}) - ${errorText}`)

              results.failedEndpoints.push({
                endpoint,
                status: res.status,
                error: errorText,
                micrositeId: config.micrositeId,
              })
            }
          } catch (err) {
            console.log(`  ⚠️ ERROR: ${endpoint} - ${err}`)
            results.failedEndpoints.push({
              endpoint,
              error: err instanceof Error ? err.message : "Unknown error",
              micrositeId: config.micrositeId,
            })
          }
        }

        // Test agencies for this microsite
        try {
          console.log(`  🏢 Testing agencies for ${config.micrositeId}...`)
          const agencyRes = await fetch(`${this.baseUrl}/resources/agency/${config.micrositeId}`, {
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          })

          if (agencyRes.ok) {
            const agencyData: any = await agencyRes.json()
            const agencies = agencyData.agency ?? agencyData.agencies ?? []
            console.log(`  ✅ Found ${agencies.length} agencies`)
            results.agencies.push(...agencies)
          }
        } catch (err) {
          console.log(`  ⚠️ Could not fetch agencies: ${err}`)
        }
      } catch (authError) {
        console.log(`❌ Authentication failed for ${config.name}: ${authError}`)
        results.testedConfigs.push({
          name: config.name,
          micrositeId: config.micrositeId,
          status: `auth_failed: ${authError}`,
        })
      }
    }

    // Remove duplicate bookings
    const uniqueBookings = results.sampleBookings.filter(
      (booking, index, self) =>
        index === self.findIndex((b) => (b.id || b.reference) === (booking.id || booking.reference)),
    )
    results.sampleBookings = uniqueBookings

    console.log(`\n🎯 Discovery complete:`)
    console.log(`  - ${results.workingEndpoints.length} working endpoints`)
    console.log(`  - ${results.failedEndpoints.length} failed endpoints`)
    console.log(`  - ${results.sampleBookings.length} sample bookings`)
    console.log(`  - ${results.agencies.length} agencies`)

    return results
  }

  public async findSpecificBooking(bookingId: string): Promise<any> {
    const configs = this.getConfigurations()

    console.log(`🔍 Searching for booking ${bookingId} across ${configs.length} configurations...`)

    for (const config of configs) {
      try {
        const token = await this.authenticate(config)

        const searchEndpoints = [
          `/resources/booking/getBookings?microsite=${config.micrositeId}&reference=${bookingId}`,
          `/resources/booking/getBookings?microsite=${config.micrositeId}&bookingReference=${bookingId}`,
          `/resources/booking/${config.micrositeId}/${bookingId}`,
          `/resources/booking/${config.micrositeId}?reference=${bookingId}`,
          `/booking/getBookings/${config.micrositeId}/${bookingId}`,
        ]

        for (const endpoint of searchEndpoints) {
          try {
            console.log(`  🔍 Searching in: ${endpoint}`)

            const res = await fetch(`${this.baseUrl}${endpoint}`, {
              headers: {
                "auth-token": token,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            })

            if (res.ok) {
              const data: any = await res.json()

              // Check if this is the booking we're looking for
              const bookingIds = [data.id, data.reference, data.bookingReference, data.number].filter(Boolean)
              if (bookingIds.some((id) => String(id) === String(bookingId))) {
                console.log(`✅ Found booking ${bookingId} via ${endpoint}`)
                return data
              }

              // Check if it's in an array
              const bookings = data.bookedTrip ?? data.booking ?? data.bookings ?? data.results ?? data.data ?? []
              if (Array.isArray(bookings)) {
                const targetBooking = bookings.find((b: any) => {
                  const bIds = [b.id, b.reference, b.bookingReference, b.number].filter(Boolean)
                  return bIds.some((id) => String(id) === String(bookingId))
                })

                if (targetBooking) {
                  console.log(`✅ Found booking ${bookingId} in array via ${endpoint}`)
                  return targetBooking
                }
              }
            }
          } catch (err) {
            console.log(`  ⚠️ Error searching ${endpoint}: ${err}`)
          }
        }
      } catch (authError) {
        console.log(`❌ Auth failed for ${config.name}: ${authError}`)
      }
    }

    throw new Error(`Booking ${bookingId} not found in any configuration`)
  }
}
