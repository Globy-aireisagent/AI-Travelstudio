import { type NextRequest, NextResponse } from "next/server"
import { createMultiMicrositeClient } from "@/lib/travel-compositor-client"

// API endpoint voor extern project
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get("bookingId")
    const apiKey = request.headers.get("x-api-key")

    // Verificeer API key
    if (!apiKey || apiKey !== process.env.EXTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID required" }, { status: 400 })
    }

    // Haal booking data op
    const multiClient = createMultiMicrositeClient()
    const result = await multiClient.searchBookingAcrossAllMicrosites(bookingId)

    if (!result) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Transform voor extern gebruik
    const externalData = {
      id: result.booking.id,
      reference: result.booking.bookingReference,
      title: result.booking.title || `${bookingId} - Reis`,
      client: {
        name: result.booking.contactPerson?.name || "Unknown",
        email: result.booking.contactPerson?.email,
        phone: result.booking.contactPerson?.phone,
      },
      period: {
        startDate: result.booking.startDate,
        endDate: result.booking.endDate,
        duration: result.booking.nightsCount || 0,
      },
      destinations: extractDestinations(result.booking),
      hotels: transformHotels(result.booking.hotelservice || []),
      transports: transformTransports(result.booking.transportservice || []),
      status: result.booking.status,
      totalPrice: result.booking.pricebreakdown?.totalPrice?.microsite?.amount,
      currency: result.booking.pricebreakdown?.totalPrice?.microsite?.currency,
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: externalData,
      source: "travel-assistant-api",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ External API Error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function extractDestinations(booking: any): string[] {
  const destinations = new Set<string>()

  // Van hotels
  if (booking.hotelservice) {
    booking.hotelservice.forEach((hotel: any) => {
      if (hotel.locationName) destinations.add(hotel.locationName)
      if (hotel.destinationName) destinations.add(hotel.destinationName)
    })
  }

  return Array.from(destinations)
}

function transformHotels(hotels: any[]) {
  return hotels.map((hotel) => ({
    id: hotel.id,
    name: hotel.hotelName,
    location: hotel.locationName,
    checkIn: hotel.startDate,
    checkOut: hotel.endDate,
    nights: hotel.nights,
    category: hotel.category,
    address: hotel.hotelData?.address,
    coordinates: hotel.hotelData?.coordinates,
  }))
}

function transformTransports(transports: any[]) {
  return transports.map((transport) => ({
    id: transport.id,
    type: transport.transportType || "FLIGHT",
    departure: transport.departureAirport,
    arrival: transport.arrivalAirport,
    departureDate: transport.startDate,
    arrivalDate: transport.endDate,
    provider: transport.providerDescription,
  }))
}
