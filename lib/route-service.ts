export interface RoutePoint {
  id: string
  name: string
  type: "hotel" | "attraction" | "restaurant" | "transport"
  coordinates: {
    lat: number
    lng: number
  }
  address?: string
  description?: string
  duration?: number // minutes to spend here
  arrivalTime?: string
  departureTime?: string
}

export interface DayRoute {
  day: number
  date: string
  title: string
  startLocation: RoutePoint
  endLocation: RoutePoint
  waypoints: RoutePoint[]
  totalDistance: number // km
  totalDuration: number // minutes
  highlights: string[]
  recommendations: string[]
}

export class RouteService {
  private static readonly GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

  static async generateRouteForBooking(bookingData: any): Promise<DayRoute[]> {
    console.log("🗺️ Generating route for booking:", bookingData.id)

    const routes: DayRoute[] = []
    const hotels = bookingData.hotels || []

    // Geocode alle hotels
    const geocodedHotels = await Promise.all(
      hotels.map(async (hotel: any) => {
        const coordinates = await this.geocodeAddress(hotel.address || hotel.location)
        return {
          ...hotel,
          coordinates,
        }
      }),
    )

    // Genereer dag-voor-dag routes
    for (let i = 0; i < geocodedHotels.length; i++) {
      const currentHotel = geocodedHotels[i]
      const nextHotel = geocodedHotels[i + 1]

      if (nextHotel) {
        const route = await this.calculateRoute(currentHotel, nextHotel)
        routes.push(route)
      }
    }

    return routes
  }

  private static async geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.GOOGLE_MAPS_API_KEY}`,
      )

      const data = await response.json()

      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location
        return {
          lat: location.lat,
          lng: location.lng,
        }
      }

      // Fallback coordinates
      return { lat: 0, lng: 0 }
    } catch (error) {
      console.error("❌ Geocoding error:", error)
      return { lat: 0, lng: 0 }
    }
  }

  private static async calculateRoute(from: any, to: any): Promise<DayRoute> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${from.coordinates.lat},${from.coordinates.lng}&destination=${to.coordinates.lat},${to.coordinates.lng}&key=${this.GOOGLE_MAPS_API_KEY}`,
      )

      const data = await response.json()

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0]
        const leg = route.legs[0]

        return {
          day: 1, // Will be set properly in calling function
          date: from.checkOut,
          title: `${from.location} → ${to.location}`,
          startLocation: {
            id: from.id,
            name: from.name,
            type: "hotel",
            coordinates: from.coordinates,
            address: from.address,
          },
          endLocation: {
            id: to.id,
            name: to.name,
            type: "hotel",
            coordinates: to.coordinates,
            address: to.address,
          },
          waypoints: [],
          totalDistance: Math.round(leg.distance.value / 1000), // Convert to km
          totalDuration: Math.round(leg.duration.value / 60), // Convert to minutes
          highlights: [],
          recommendations: [],
        }
      }

      // Fallback route
      return {
        day: 1,
        date: from.checkOut,
        title: `${from.location} → ${to.location}`,
        startLocation: {
          id: from.id,
          name: from.name,
          type: "hotel",
          coordinates: from.coordinates,
        },
        endLocation: {
          id: to.id,
          name: to.name,
          type: "hotel",
          coordinates: to.coordinates,
        },
        waypoints: [],
        totalDistance: 0,
        totalDuration: 0,
        highlights: [],
        recommendations: [],
      }
    } catch (error) {
      console.error("❌ Route calculation error:", error)
      throw error
    }
  }

  static async findPointsOfInterest(coordinates: { lat: number; lng: number }, radius = 5000): Promise<RoutePoint[]> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinates.lat},${coordinates.lng}&radius=${radius}&type=tourist_attraction&key=${this.GOOGLE_MAPS_API_KEY}`,
      )

      const data = await response.json()

      if (data.results) {
        return data.results.slice(0, 5).map((place: any) => ({
          id: place.place_id,
          name: place.name,
          type: "attraction" as const,
          coordinates: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
          },
          address: place.vicinity,
          description: place.types.join(", "),
        }))
      }

      return []
    } catch (error) {
      console.error("❌ POI search error:", error)
      return []
    }
  }
}
