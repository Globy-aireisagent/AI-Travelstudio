/**
 * BookingEndpointDiscoverer
 *
 * 1. Authenticates against Travel Compositor and caches the token.
 * 2. Tests a list of endpoints and returns which ones work / fail.
 * 3. Can look-up a single booking by trying a few common endpoint variants.
 *
 * NOTE:
 * • The code is defensive: if authentication fails (e.g. no env-vars in dev)
 *   it skips remote calls and returns empty results instead of crashing.
 * • All network requests are done with native fetch, so no extra deps needed.
 */

export interface EndpointResult {
  endpoint: string
  status: number
  dataKeys: string[]
  totalCount: number
  agencyId?: string
  agencyName?: string
}

export interface DiscoveryResults {
  workingEndpoints: EndpointResult[]
  failedEndpoints: { endpoint: string; status?: number; error: string }[]
  agencies: { id: string; name: string }[]
  sampleBookings: any[]
}

export class BookingEndpointDiscoverer {
  private baseUrl = "https://online.travelcompositor.com"
  private authToken: string | null = null
  private tokenExpiry: number | null = null // epoch ms

  /* ------------------------------------------------------------------ */
  /* AUTH                                                               */
  /* ------------------------------------------------------------------ */
  private async authenticate(): Promise<string> {
    // Re-use cached token if still valid
    if (this.authToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.authToken
    }

    const username = process.env.TRAVEL_COMPOSITOR_USERNAME
    const password = process.env.TRAVEL_COMPOSITOR_PASSWORD
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID

    if (!username || !password || !micrositeId) {
      // In a dev preview without env-vars we return a dummy token
      console.warn("TRAVEL_COMPOSITOR_* env-vars not set – running in stub mode (no remote calls).")
      this.authToken = "STUB_TOKEN"
      this.tokenExpiry = Date.now() + 10 * 60 * 1000
      return this.authToken
    }

    const res = await fetch(`${this.baseUrl}/resources/authentication/authenticate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ username, password, micrositeId }),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Authentication failed: ${res.status} – ${text}`)
    }

    const data: any = await res.json()
    this.authToken = data.token
    this.tokenExpiry = Date.now() + (data.expirationInSeconds ?? 7200) * 1000 - 60_000
    return this.authToken
  }

  /* ------------------------------------------------------------------ */
  /* DISCOVERY                                                          */
  /* ------------------------------------------------------------------ */
  public async discoverBookingEndpoints(): Promise<DiscoveryResults> {
    const token = await this.authenticate().catch((e) => {
      console.error("Auth error:", e)
      return null
    })

    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID ?? "0000"

    const endpointsToTest = [
      `/booking/getBookings/${micrositeId}`,
      `/resources/booking/${micrositeId}`,
      `/resources/booking/${micrositeId}?first=0&limit=50`,
    ]

    const results: DiscoveryResults = {
      workingEndpoints: [],
      failedEndpoints: [],
      agencies: [],
      sampleBookings: [],
    }

    // If we’re in stub mode just return empty results
    if (!token || token === "STUB_TOKEN") {
      console.warn("Running in stub mode – skipping remote discovery.")
      return results
    }

    for (const ep of endpointsToTest) {
      try {
        const res = await fetch(`${this.baseUrl}${ep}`, {
          headers: {
            "auth-token": token,
            Accept: "application/json",
          },
        })

        if (res.ok) {
          const data: any = await res.json()
          results.workingEndpoints.push({
            endpoint: ep,
            status: res.status,
            dataKeys: Object.keys(data),
            totalCount: data.totalCount ?? data.total ?? 0,
          })

          const bookings = data.booking ?? data.bookings ?? data.results ?? data.data ?? []
          if (Array.isArray(bookings) && bookings.length > 0) {
            results.sampleBookings.push(...bookings.slice(0, 10))
          }
        } else {
          results.failedEndpoints.push({
            endpoint: ep,
            status: res.status,
            error: await res.text(),
          })
        }
      } catch (err) {
        results.failedEndpoints.push({
          endpoint: ep,
          error: err instanceof Error ? err.message : "Unknown error",
        })
      }
    }

    return results
  }

  /* ------------------------------------------------------------------ */
  /* FIND ONE BOOKING                                                   */
  /* ------------------------------------------------------------------ */
  public async findSpecificBooking(bookingId: string): Promise<any> {
    const token = await this.authenticate().catch((e) => {
      console.error("Auth error:", e)
      return null
    })
    const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID ?? "0000"

    if (!token || token === "STUB_TOKEN") {
      throw new Error("Cannot search bookings in stub mode.")
    }

    const candidateEndpoints = [
      `/booking/getBookings/${micrositeId}/${bookingId}`,
      `/resources/booking/${micrositeId}/${bookingId}`,
      `/resources/booking/${micrositeId}?reference=${bookingId}`,
    ]

    for (const ep of candidateEndpoints) {
      try {
        const res = await fetch(`${this.baseUrl}${ep}`, {
          headers: { "auth-token": token, Accept: "application/json" },
        })
        if (!res.ok) continue
        const data: any = await res.json()

        // single object
        const ids = [data.id, data.reference, data.bookingReference].filter(Boolean)
        if (ids.some((id) => String(id) === String(bookingId))) {
          return data
        }

        // array response
        const arr = data.booking ?? data.bookings ?? data.results ?? []
        if (Array.isArray(arr)) {
          const found = arr.find((b: any) =>
            [b.id, b.reference, b.bookingReference].filter(Boolean).some((id) => String(id) === String(bookingId)),
          )
          if (found) return found
        }
      } catch (err) {
        console.warn("Search error on", ep, err)
      }
    }

    throw new Error(`Booking ${bookingId} not found`)
  }
}
