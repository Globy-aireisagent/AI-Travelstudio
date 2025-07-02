// Service to fetch real hotel images and data from Travel Compositor
export interface HotelImageResult {
  url: string
  source: string
  alt: string
}

export interface HotelRichData {
  images: string[]
  facilities: string[]
  description: string
  amenities: string[]
  location: {
    description: string
    coordinates?: { lat: number; lng: number }
  }
}

export class HotelImageService {
  private static readonly FALLBACK_IMAGES = {
    hotel: "/placeholder.svg?height=200&width=300&text=Hotel",
    city: "/placeholder.svg?height=200&width=300&text=City",
    default: "/placeholder.svg?height=200&width=300&text=Image",
  }

  /* ---------- IMAGE HELPERS ---------- */

  static async getHotelImage(hotelName: string, location: string): Promise<HotelImageResult> {
    try {
      const response = await fetch("/api/travel-compositor/hotel-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelData: { hotelName, locationName: location },
          micrositeId: process.env.NEXT_PUBLIC_TRAVEL_COMPOSITOR_MICROSITE_ID || "default",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.images?.foundImages?.length) {
          return {
            url: data.images.foundImages[0],
            source: "travel_compositor",
            alt: `${hotelName} in ${location} - Real photo`,
          }
        }
      }

      return {
        url: this.FALLBACK_IMAGES.hotel,
        source: "placeholder",
        alt: `${hotelName} in ${location}`,
      }
    } catch (err) {
      console.error("❌ getHotelImage error:", err)
      return {
        url: this.FALLBACK_IMAGES.hotel,
        source: "placeholder",
        alt: `${hotelName} in ${location}`,
      }
    }
  }

  /* ---------- RICH DATA HELPERS ---------- */

  static async getRichHotelData(hotelId: string, hotelName: string, location: string): Promise<HotelRichData> {
    try {
      const response = await fetch("/api/travel-compositor/get-rich-hotel-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelId,
          hotelName,
          location,
          micrositeId: process.env.NEXT_PUBLIC_TRAVEL_COMPOSITOR_MICROSITE_ID || "default",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.hotelData) {
          return {
            images: data.hotelData.images || [],
            facilities: data.hotelData.facilities || [],
            description: data.hotelData.description || "",
            amenities: data.hotelData.amenities || [],
            location: {
              description: data.hotelData.locationDescription || this.getLocationDescription(location),
            },
          }
        }
      }

      return {
        images: [],
        facilities: [],
        description: "",
        amenities: [],
        location: { description: this.getLocationDescription(location) },
      }
    } catch (err) {
      console.error("❌ getRichHotelData error:", err)
      return {
        images: [],
        facilities: [],
        description: "",
        amenities: [],
        location: { description: this.getLocationDescription(location) },
      }
    }
  }

  /* ---------- TEXT HELPERS ---------- */

  static getLocationDescription(location: string): string {
    const descriptions: Record<string, string> = {
      bilbao: "Moderne havenstad bekend om het Guggenheim Museum en Baskische cultuur",
      "san sebastian": "Elegante kuststad met prachtige stranden en wereldberoemde gastronomie",
      "san sebastián": "Elegante kuststad met prachtige stranden en wereldberoemde gastronomie",
      "cangas de onís": "Pittoresk bergdorp in de Picos de Europa, ideaal voor natuurliefhebbers",
      "cangas de onis": "Pittoresk bergdorp in de Picos de Europa, ideaal voor natuurliefhebbers",
      seoul: "Bruisende hoofdstad van Zuid-Korea met moderne architectuur en rijke cultuur",
      sokcho: "Kustplaats aan de oostkust, bekend om Seoraksan National Park",
      busan: "Grootste havenstad van Zuid-Korea met prachtige stranden",
      jeju: "Vulkanisch eiland bekend om zijn natuurlijke schoonheid (UNESCO-status)",
    }

    return descriptions[location.toLowerCase()] || "Prachtige bestemming"
  }

  static getRoomTypeDescription(roomType: string): string {
    const m: Record<string, string> = {
      "standard double room": "Standaard tweepersoonskamer",
      "room, twin beds, private bathroom": "Kamer met twee aparte bedden en privé badkamer",
      "double 1 0r two beds": "Tweepersoonskamer met kingsize bed of twee aparte bedden",
      "standard, king bed": "Standaard kamer met kingsize bed",
      "double or twin with balcony": "Tweepersoonskamer met balkon en uitzicht",
    }
    return m[roomType.toLowerCase()] || roomType
  }

  static getMealPlanDescription(mealPlan: string): string {
    const m: Record<string, string> = {
      ro: "Alleen logies (Room Only)",
      bb: "Logies met ontbijt (Bed & Breakfast)",
      hb: "Halfpension (ontbijt en diner)",
      fb: "Volpension (alle maaltijden)",
      ai: "All Inclusive",
    }
    return m[mealPlan.toLowerCase()] || mealPlan
  }

  /* ---------- CONVENIENCE ---------- */

  static async getSpecificHotelImage(hotelName: string, location: string, hotelId?: string): Promise<HotelImageResult> {
    if (hotelId) {
      try {
        const rich = await this.getRichHotelData(hotelId, hotelName, location)
        if (rich.images.length) {
          return {
            url: rich.images[0],
            source: "travel_compositor",
            alt: `${hotelName} - Real hotel photo`,
          }
        }
      } catch (err) {
        console.error("❌ getSpecificHotelImage error:", err)
      }
    }
    return this.getHotelImage(hotelName, location)
  }
}
