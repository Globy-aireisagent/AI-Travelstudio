// Service to fetch complete destination data from Travel Compositor API
export interface DestinationVO {
  code: string
  name: string
  geolocation: {
    latitude: number
    longitude: number
  } | null
  country: string
  provincePostalPrefix: string | null
  active: boolean
  images: string[]
  description: string | null
}

export interface EnrichedDestination extends DestinationVO {
  nights?: number
  hotels?: string[]
  activities?: string[]
  type?: "city" | "airport" | "attraction"
  coordinates?: any
}

export class DestinationService {
  private static cache = new Map<string, DestinationVO>()

  /**
   * Get destination details from Travel Compositor API
   */
  static async getDestinationDetails(destinationCode: string): Promise<DestinationVO | null> {
    try {
      // Check cache first
      if (this.cache.has(destinationCode)) {
        console.log(`📦 Using cached destination data for ${destinationCode}`)
        return this.cache.get(destinationCode)!
      }

      console.log(`🌍 Fetching destination details for: ${destinationCode}`)

      // Use the Travel Compositor API endpoint from your system
      const response = await fetch(`/api/travel-compositor/destinations/${destinationCode}`)

      if (!response.ok) {
        console.warn(`⚠️ Failed to fetch destination ${destinationCode}: ${response.status}`)
        return null
      }

      const destinationData: DestinationVO = await response.json()

      // Cache the result
      this.cache.set(destinationCode, destinationData)

      console.log(`✅ Fetched destination data for ${destinationCode}:`, {
        name: destinationData.name,
        country: destinationData.country,
        images: destinationData.images?.length || 0,
        hasDescription: !!destinationData.description,
        hasGeolocation: !!destinationData.geolocation,
      })

      return destinationData
    } catch (error) {
      console.error(`❌ Error fetching destination ${destinationCode}:`, error)
      return null
    }
  }

  /**
   * Enrich booking destinations with full DestinationVO data
   */
  static async enrichDestinations(destinations: any[]): Promise<EnrichedDestination[]> {
    console.log(`🔄 Enriching ${destinations.length} destinations with DestinationVO data`)

    const enrichedDestinations: EnrichedDestination[] = []

    for (const dest of destinations) {
      let enrichedDest: EnrichedDestination = { ...dest }

      // Fetch full destination data if we have a code
      if (dest.code) {
        const fullDestData = await this.getDestinationDetails(dest.code)

        if (fullDestData) {
          enrichedDest = {
            ...dest, // Keep booking-specific data like nights, hotels
            ...fullDestData, // Override with full DestinationVO data
            // Preserve booking-specific fields
            nights: dest.nights,
            hotels: dest.hotels,
            activities: dest.activities,
            type: dest.type,
          }
        }
      }

      enrichedDestinations.push(enrichedDest)
    }

    console.log(
      `✅ Enriched destinations:`,
      enrichedDestinations.map((d) => ({
        name: d.name,
        code: d.code,
        images: d.images?.length || 0,
        hasDescription: !!d.description,
        nights: d.nights,
      })),
    )

    return enrichedDestinations
  }

  /**
   * Get all available destinations from Travel Compositor
   */
  static async getAllDestinations(): Promise<DestinationVO[]> {
    try {
      console.log("🌍 Fetching all destinations from Travel Compositor")

      const response = await fetch("/api/travel-compositor/destinations")

      if (!response.ok) {
        throw new Error(`Failed to fetch destinations: ${response.status}`)
      }

      const destinations: DestinationVO[] = await response.json()

      // Cache all destinations
      destinations.forEach((dest) => {
        this.cache.set(dest.code, dest)
      })

      console.log(`✅ Fetched ${destinations.length} destinations`)
      return destinations
    } catch (error) {
      console.error("❌ Error fetching all destinations:", error)
      return []
    }
  }

  /**
   * Search destinations by name or code
   */
  static async searchDestinations(query: string): Promise<DestinationVO[]> {
    try {
      const allDestinations = await this.getAllDestinations()

      const searchTerm = query.toLowerCase()
      return allDestinations.filter(
        (dest) =>
          dest.name.toLowerCase().includes(searchTerm) ||
          dest.code.toLowerCase().includes(searchTerm) ||
          dest.country.toLowerCase().includes(searchTerm),
      )
    } catch (error) {
      console.error("❌ Error searching destinations:", error)
      return []
    }
  }

  /**
   * Clear destination cache
   */
  static clearCache() {
    this.cache.clear()
    console.log("🗑️ Destination cache cleared")
  }
}
