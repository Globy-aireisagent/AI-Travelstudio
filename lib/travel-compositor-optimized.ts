export interface OptimizedTravelCompositorConfig {
  username: string
  password: string
  micrositeId: string
  baseUrl?: string
}

export class OptimizedTravelCompositorClient {
  private _config: OptimizedTravelCompositorConfig
  private authToken: string | null = null
  private tokenExpiry: Date | null = null

  constructor(config: OptimizedTravelCompositorConfig) {
    this._config = {
      ...config,
      baseUrl: config.baseUrl || "https://online.travelcompositor.com",
    }
  }

  async authenticate(): Promise<string> {
    const startTime = Date.now()
    console.log("🔐 Fast authentication...")

    try {
      const response = await fetch(`${this._config.baseUrl}/resources/authentication/authenticate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: this._config.username,
          password: this._config.password,
          micrositeId: this._config.micrositeId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`)
      }

      const data = await response.json()
      this.authToken = data.token

      const expirationMs = (data.expirationInSeconds || 7200) * 1000
      this.tokenExpiry = new Date(Date.now() + expirationMs - 60000)

      console.log(`✅ Fast auth completed in ${Date.now() - startTime}ms`)
      return this.authToken!
    } catch (error) {
      console.error(`❌ Fast auth failed in ${Date.now() - startTime}ms:`, error)
      throw error
    }
  }

  private async ensureValidToken(): Promise<string> {
    if (!this.authToken || !this.tokenExpiry || new Date() >= this.tokenExpiry) {
      await this.authenticate()
    }
    return this.authToken!
  }

  async getBookingDirectly(bookingReference: string): Promise<any> {
    const startTime = Date.now()
    console.log(`🎯 DIRECT booking call for: ${bookingReference}`)

    try {
      const token = await this.ensureValidToken()

      // 🚀 SINGLE OPTIMIZED API CALL
      const response = await fetch(`${this._config.baseUrl}/resources/booking/${bookingReference}`, {
        method: "GET",
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      const endTime = Date.now()
      console.log(`📊 API response in ${endTime - startTime}ms - Status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API call failed: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log(`✅ Direct booking retrieved in ${endTime - startTime}ms`)

      return data
    } catch (error) {
      const endTime = Date.now()
      console.error(`❌ Direct booking failed in ${endTime - startTime}ms:`, error)
      throw error
    }
  }
}

export function createOptimizedTravelCompositorClient(configNumber = 1): OptimizedTravelCompositorClient {
  const suffix = configNumber === 1 ? "" : `_${configNumber}`

  const config: OptimizedTravelCompositorConfig = {
    username: process.env[`TRAVEL_COMPOSITOR_USERNAME${suffix}`]!,
    password: process.env[`TRAVEL_COMPOSITOR_PASSWORD${suffix}`]!,
    micrositeId: process.env[`TRAVEL_COMPOSITOR_MICROSITE_ID${suffix}`]!,
  }

  if (!config.username || !config.password || !config.micrositeId) {
    throw new Error(`Missing required Travel Compositor environment variables for config ${configNumber}`)
  }

  return new OptimizedTravelCompositorClient(config)
}
