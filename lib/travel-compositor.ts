// Updated Travel Compositor client with microsite support

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
      baseUrl: config.baseUrl || "https://online.travelcompositor.com/api"
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
    
    // Use microsite-specific endpoint
    const response = await fetch(`${this.config.baseUrl}/microsites/${this.config.micrositeId}/bookings/${bookingId}`, {
      headers,
    })

    if (!response.ok) {
      // Try re-authenticating if unauthorized
      if (response.status === 401) {
        this.authToken = null
        const newHeaders = await this.getAuthHeaders()
        const retryResponse = await fetch(`${this.config.baseUrl}/microsites/${this.config.micrositeId}/bookings/${bookingId}`, {
          headers: newHeaders,
        })
        
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
    
    const response = await fetch(`${this.config.baseUrl}/microsites/${this.config.micrositeId}/bookings/${bookingId}/vouchers`, {
      headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch vouchers: ${response.statusText}`)
    }

    return response.json()
  }
}

// Initialize client with microsite support
export const travelCompositorClient = new TravelCompositorClient({
  username: process.env.TRAVEL_COMPOSITOR_USERNAME!,
  password: process.env.TRAVEL_COMPOSITOR_PASSWORD!,
  micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!,
  baseUrl: "https://online.travelcompositor.com/api",
})
