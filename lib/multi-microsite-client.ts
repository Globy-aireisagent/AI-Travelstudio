// Multi-microsite Travel Compositor client

import { createTravelCompositorClient } from "./travel-compositor-client"

export interface MicrositeCredentials {
  id: string
  name: string
  username: string
  password: string
  micrositeId: string
  baseUrl?: string
}

export interface AgentMicrosites {
  agentId: string
  microsites: MicrositeCredentials[]
}

export class MultiMicrositeClient {
  private clients: Map<string, TravelCompositorClient> = new Map()

  constructor(private agentMicrosites: AgentMicrosites) {
    // Initialize clients for each microsite
    this.agentMicrosites.microsites.forEach((microsite) => {
      const client = createTravelCompositorClient({
        username: microsite.username,
        password: microsite.password,
        micrositeId: microsite.micrositeId,
        baseUrl: microsite.baseUrl || "https://online.travelcompositor.com/api",
      })
      this.clients.set(microsite.id, client)
    })
  }

  getClient(micrositeId: string): TravelCompositorClient | null {
    return this.clients.get(micrositeId) || null
  }

  getAllMicrosites(): MicrositeCredentials[] {
    return this.agentMicrosites.microsites
  }

  async getBookingFromAnyMicrosite(bookingId: string) {
    // Try each microsite until we find the booking
    for (const [micrositeId, client] of this.clients) {
      try {
        const booking = await client.getBooking(bookingId)
        return {
          booking,
          micrositeId,
          micrositeName: this.agentMicrosites.microsites.find((m) => m.id === micrositeId)?.name,
        }
      } catch (error) {
        // Continue to next microsite if booking not found
        continue
      }
    }

    throw new Error(`Booking ${bookingId} not found in any connected microsite`)
  }

  async getAllBookingsFromAllMicrosites() {
    const allBookings = []

    for (const [micrositeId, client] of this.clients) {
      try {
        const bookings = await client.getAllBookings()
        const micrositeName = this.agentMicrosites.microsites.find((m) => m.id === micrositeId)?.name

        allBookings.push({
          micrositeId,
          micrositeName,
          bookings,
        })
      } catch (error) {
        console.error(`Failed to fetch bookings from microsite ${micrositeId}:`, error)
      }
    }

    return allBookings
  }

  /**
   * Search for a booking across all available microsites
   */
  async searchBookingAcrossAllMicrosites(bookingId: string) {
    console.log(`🔍 Searching for booking ${bookingId} across all microsites`)

    // Try each microsite in sequence
    for (const microsite of this.agentMicrosites.microsites) {
      try {
        console.log(`Checking microsite: ${microsite.id}`)
        const client = this.clients.get(microsite.id)
        if (!client) {
          throw new Error(`Client for microsite ${microsite.id} not found`)
        }
        const booking = await client.getBooking(bookingId)

        if (booking) {
          console.log(`✅ Found booking in microsite: ${microsite.id}`)
          return {
            booking,
            foundInMicrosite: microsite.id,
          }
        }
      } catch (error) {
        console.log(`❌ Booking not found in microsite ${microsite.id}:`, error)
        // Continue to next microsite
      }
    }

    // If we get here, the booking wasn't found in any microsite
    console.log(`❌ Booking ${bookingId} not found in any microsite`)
    return {
      booking: null,
      foundInMicrosite: null,
    }
  }
}

// Original single client (keeping for backward compatibility)
export interface TravelCompositorConfig {
  username: string
  password: string
  micrositeId: string
  baseUrl?: string
}

export class TravelCompositorClient {
  private config: TravelCompositorConfig
  private authToken: string | null = null

  constructor(config: TravelCompositorConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl || "https://online.travelcompositor.com/api",
    }
  }

  async authenticate() {
    const response = await fetch(`${this.config.baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: this.config.username,
        password: this.config.password,
        micrositeId: this.config.micrositeId,
      }),
    })

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.statusText}`)
    }

    const data = await response.json()
    this.authToken = data.token || data.access_token
    return this.authToken
  }

  async getAuthHeaders() {
    if (!this.authToken) {
      await this.authenticate()
    }

    return {
      Authorization: `Bearer ${this.authToken}`,
      "Content-Type": "application/json",
      "X-Microsite-ID": this.config.micrositeId,
    }
  }

  async getBooking(bookingId: string) {
    const headers = await this.getAuthHeaders()

    const response = await fetch(`${this.config.baseUrl}/microsites/${this.config.micrositeId}/bookings/${bookingId}`, {
      headers,
    })

    if (!response.ok) {
      if (response.status === 401) {
        this.authToken = null
        const newHeaders = await this.getAuthHeaders()
        const retryResponse = await fetch(
          `${this.config.baseUrl}/microsites/${this.config.micrositeId}/bookings/${bookingId}`,
          {
            headers: newHeaders,
          },
        )

        if (!retryResponse.ok) {
          throw new Error(`Failed to fetch booking: ${retryResponse.statusText}`)
        }

        return retryResponse.json()
      }

      throw new Error(`Failed to fetch booking: ${response.statusText}`)
    }

    return response.json()
  }

  async getAllBookings() {
    const headers = await this.getAuthHeaders()

    const response = await fetch(`${this.config.baseUrl}/microsites/${this.config.micrositeId}/bookings`, {
      headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch bookings: ${response.statusText}`)
    }

    return response.json()
  }

  async updateBooking(bookingId: string, updates: any) {
    const headers = await this.getAuthHeaders()

    const response = await fetch(`${this.config.baseUrl}/microsites/${this.config.micrositeId}/bookings/${bookingId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      throw new Error(`Failed to update booking: ${response.statusText}`)
    }

    return response.json()
  }

  async getVouchers(bookingId: string) {
    const headers = await this.getAuthHeaders()

    const response = await fetch(
      `${this.config.baseUrl}/microsites/${this.config.micrositeId}/bookings/${bookingId}/vouchers`,
      {
        headers,
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch vouchers: ${response.statusText}`)
    }

    return response.json()
  }
}
