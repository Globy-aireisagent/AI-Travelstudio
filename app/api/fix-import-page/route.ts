import { NextResponse } from "next/server"

// Simple Travel Compositor client for import functionality
class ImportTravelCompositorClient {
  private config: {
    username: string
    password: string
    micrositeId: string
    baseUrl: string
  }
  private authToken: string | null = null

  constructor(config: { username: string; password: string; micrositeId: string }) {
    this.config = {
      ...config,
      baseUrl: "https://online.travelcompositor.com",
    }
  }

  async authenticate(): Promise<string> {
    try {
      console.log(`🔐 Authenticating for import: ${this.config.micrositeId}`)

      const response = await fetch(`${this.config.baseUrl}/resources/authentication/authenticate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: this.config.username,
          password: this.config.password,
          micrositeId: this.config.micrositeId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Auth failed: ${response.status}`)
      }

      const data = await response.json()
      this.authToken = data.token

      if (!this.authToken) {
        throw new Error("No token received")
      }

      return this.authToken
    } catch (error) {
      console.error(`❌ Import auth failed:`, error)
      throw error
    }
  }

  async getBookingForImport(bookingId: string): Promise<any> {
    try {
      if (!this.authToken) {
        await this.authenticate()
      }

      console.log(`📋 Getting booking for import: ${bookingId}`)

      // Try direct booking lookup first
      const directResponse = await fetch(`${this.config.baseUrl}/resources/booking/${bookingId}`, {
        method: "GET",
        headers: {
          "auth-token": this.authToken!,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (directResponse.ok) {
        const booking = await directResponse.json()
        if (booking && booking.id) {
          console.log(`✅ Found booking ${bookingId} for import`)
          return this.transformBookingForImport(booking)
        }
      }

      // If direct lookup fails, try search
      const searchResponse = await fetch(
        `${this.config.baseUrl}/resources/booking/getBookings?microsite=${this.config.micrositeId}&from=20240101&to=20251231&first=0&limit=100`,
        {
          method: "GET",
          headers: {
            "auth-token": this.authToken!,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      )

      if (searchResponse.ok) {
        const data = await searchResponse.json()
        if (data.bookedTrip && Array.isArray(data.bookedTrip)) {
          const booking = data.bookedTrip.find(
            (b: any) =>
              b.id === bookingId || b.bookingReference === bookingId || b.customBookingReference === bookingId,
          )

          if (booking) {
            console.log(`✅ Found booking ${bookingId} in search for import`)
            return this.transformBookingForImport(booking)
          }
        }
      }

      throw new Error(`Booking ${bookingId} not found in microsite ${this.config.micrositeId}`)
    } catch (error) {
      console.error(`❌ Import booking failed:`, error)
      throw error
    }
  }

  private transformBookingForImport(booking: any): any {
    try {
      const contactPerson = booking.contactPerson || {}
      const user = booking.user || {}
      const agency = user.agency || {}

      // Extract destinations
      const destinations = new Set<string>()
      if (booking.hotelservice) {
        booking.hotelservice.forEach((hotel: any) => {
          if (hotel.locationName) destinations.add(hotel.locationName)
          if (hotel.destinationName) destinations.add(hotel.destinationName)
        })
      }

      return {
        id: booking.id,
        bookingReference: booking.bookingReference,
        title: `${booking.bookingReference} - ${Array.from(destinations).join(" & ")}`,
        status: booking.status,
        client: {
          name:
            contactPerson.name && contactPerson.lastName
              ? `${contactPerson.name} ${contactPerson.lastName}`.trim()
              : contactPerson.name || "Unknown",
          email: contactPerson.email || user.email,
          phone: contactPerson.phone
            ? `${contactPerson.phoneCountryCode || ""} ${contactPerson.phone}`.trim()
            : user.telephone,
        },
        period: {
          startDate: booking.startDate,
          endDate: booking.endDate,
          duration: booking.nightsCount || 0,
        },
        destinations: Array.from(destinations),
        hotels: (booking.hotelservice || []).length,
        transports: (booking.transportservice || []).length,
        cars: (booking.carservice || []).length,
        totalPrice: booking.pricebreakdown?.totalPrice?.microsite?.amount,
        currency: booking.pricebreakdown?.totalPrice?.microsite?.currency,
        micrositeId: this.config.micrositeId,
        importedAt: new Date().toISOString(),
        rawData: booking,
      }
    } catch (error) {
      console.error("❌ Transform booking for import failed:", error)
      throw error
    }
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bookingId = searchParams.get("bookingId")

  if (!bookingId) {
    return NextResponse.json({ success: false, error: "Booking ID is required" }, { status: 400 })
  }

  console.log(`📋 Import request for booking: ${bookingId}`)

  try {
    const configs = [
      {
        name: "Config 1",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!,
      },
      {
        name: "Config 2",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_2!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_2!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_2!,
      },
      {
        name: "Config 3",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_3!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_3!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3!,
      },
      {
        name: "Config 4",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_4!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_4!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_4!,
      },
    ]

    // Try each config until we find the booking
    for (const config of configs) {
      if (!config.username || !config.password || !config.micrositeId) {
        continue
      }

      try {
        console.log(`🔍 Trying import from ${config.name} (${config.micrositeId})`)

        const client = new ImportTravelCompositorClient(config)
        const booking = await client.getBookingForImport(bookingId)

        if (booking) {
          console.log(`✅ Successfully imported booking from ${config.name}`)

          return NextResponse.json({
            success: true,
            booking,
            source: config.name,
            micrositeId: config.micrositeId,
            timestamp: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.log(`⚠️ ${config.name} failed:`, error)
        continue
      }
    }

    // If we get here, booking wasn't found in any microsite
    return NextResponse.json(
      {
        success: false,
        error: `Booking ${bookingId} not found in any configured microsite`,
        bookingId,
        timestamp: new Date().toISOString(),
      },
      { status: 404 },
    )
  } catch (error) {
    console.error("❌ Import booking error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        bookingId,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
