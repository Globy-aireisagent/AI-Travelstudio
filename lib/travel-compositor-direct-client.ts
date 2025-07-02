// Direct API client for Travel Compositor using the exact API endpoints
export class TravelCompositorDirectClient {
  private baseUrl = "https://api.travelcompositor.com"
  private micrositeId: string
  private authToken: string

  constructor(micrositeId: string, username: string, password: string) {
    this.micrositeId = micrositeId
    this.authToken = Buffer.from(`${username}:${password}`).toString("base64")
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "auth-token": `Basic ${this.authToken}`,
        Accept: "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getBookingByReference(bookingReference: string, lang = "en"): Promise<any> {
    console.log(`📡 Getting booking ${bookingReference} from microsite ${this.micrositeId}`)

    const endpoint = `/booking/getBookings/${this.micrositeId}/${bookingReference}?lang=${lang}`
    return this.makeRequest(endpoint)
  }

  async getAllBookings(lang = "en"): Promise<any[]> {
    console.log(`📡 Getting all bookings from microsite ${this.micrositeId}`)

    const endpoint = `/booking/getBookings/${this.micrositeId}?lang=${lang}`
    const response = await this.makeRequest(endpoint)

    // The API might return different structures, handle both
    return Array.isArray(response) ? response : response.bookings || [response]
  }
}

export function createDirectClient(configId: number): TravelCompositorDirectClient {
  const configs = {
    1: {
      micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!,
      username: process.env.TRAVEL_COMPOSITOR_USERNAME!,
      password: process.env.TRAVEL_COMPOSITOR_PASSWORD!,
    },
    3: {
      micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3!,
      username: process.env.TRAVEL_COMPOSITOR_USERNAME_3!,
      password: process.env.TRAVEL_COMPOSITOR_PASSWORD_3!,
    },
    4: {
      micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_4!,
      username: process.env.TRAVEL_COMPOSITOR_USERNAME_4!,
      password: process.env.TRAVEL_COMPOSITOR_PASSWORD_4!,
    },
  }

  const config = configs[configId as keyof typeof configs]
  if (!config) {
    throw new Error(`No configuration found for config ID ${configId}`)
  }

  return new TravelCompositorDirectClient(config.micrositeId, config.username, config.password)
}
