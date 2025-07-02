import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: NextRequest) {
  let bookingId: string
  let configId: number

  try {
    const { searchParams } = new URL(request.url)
    bookingId = searchParams.get("bookingId") || "RRP-9263"
    configId = Number.parseInt(searchParams.get("config") || "1") as 1 | 2 | 3

    console.log(`🔍 Getting EXACT booking: ${bookingId} (config: ${configId})`)

    // Use the working Travel Compositor client
    const client = createTravelCompositorClient(configId)

    console.log(`📡 Using client config: ${client.config.micrositeId}`)

    // ONLY get the exact booking by reference - NO FALLBACK
    const booking = await client.getBookingByReference(bookingId)

    console.log("✅ Found EXACT booking by reference")
    console.log("📋 Booking structure:", Object.keys(booking))

    // Look for transport data in the EXACT booking
    const transportLocations = {
      transportservice: booking.transportservice,
      transportService: booking.transportService,
      transports: booking.transports,
      transport: booking.transport,
      services: booking.services,
    }

    console.log("🚀 Transport data check:")
    let transportData = []
    let foundLocation = "none"

    for (const [key, value] of Object.entries(transportLocations)) {
      if (value) {
        console.log(`✅ Found ${key}:`, Array.isArray(value) ? `Array(${value.length})` : typeof value)

        if (Array.isArray(value) && value.length > 0) {
          transportData = value
          foundLocation = key
          break
        } else if (key === "services" && value.transports) {
          transportData = value.transports
          foundLocation = "services.transports"
          break
        }
      }
    }

    console.log(`📍 Using transport data from: ${foundLocation}`)
    console.log(`🎯 Found ${transportData.length} transport services`)

    // Extract transport details
    const transports = transportData.map((transport: any, index: number) => {
      console.log(`🔍 Transport ${index + 1} keys:`, Object.keys(transport))

      return {
        index: index + 1,
        id: transport.id,
        displayName: `${transport.departureAirport || "???"} → ${transport.arrivalAirport || "???"}`,

        // Basic flight info
        departureAirport: transport.departureAirport,
        arrivalAirport: transport.arrivalAirport,
        departureDate: transport.startDate,
        arrivalDate: transport.endDate,

        // Return flight
        returnDepartureAirport: transport.returnDepartureAirport,
        returnArrivalAirport: transport.returnArrivalAirport,
        returnDepartureDate: transport.returnDepartureDate,
        returnArrivalDate: transport.returnArrivalDate,

        // Provider info
        provider: transport.provider,
        operatorProvider: transport.operatorProvider,
        providerDescription: transport.providerDescription,

        // Status and references
        status: transport.status,
        bookingReference: transport.bookingReference,
        providerBookingReference: transport.providerBookingReference,

        // Additional info
        includedBaggage: transport.includedBaggage,
        onewayPrice: transport.onewayPrice,

        // Price info
        price: transport.pricebreakdown?.totalPrice?.microsite
          ? {
              amount: transport.pricebreakdown.totalPrice.microsite.amount,
              currency: transport.pricebreakdown.totalPrice.microsite.currency,
            }
          : null,

        // Segments
        segments: (transport.segment || []).map((seg: any) => ({
          departureAirport: seg.departureAirport,
          arrivalAirport: seg.arrivalAirport,
          departureAirportName: seg.departureAirportName,
          arrivalAirportName: seg.arrivalAirportName,
          departureDate: seg.departureDate,
          arrivalDate: seg.arrivalDate,
          marketingAirlineCode: seg.marketingAirlineCode,
          operatingAirlineCode: seg.operatingAirlineCode,
          flightNumber: seg.flightNumber,
          bookingClass: seg.bookingClass,
          cabinClass: seg.cabinClass,
          durationInMinutes: seg.durationInMinutes,
          transportType: seg.transportType,
          fareType: seg.fareType,
        })),

        // Baggage
        baggage: transport.baggage || [],

        // E-tickets
        etickets: transport.etickets || [],

        // Voucher
        voucherUrl: transport.voucherUrl,
      }
    })

    return NextResponse.json({
      success: true,
      bookingId,
      configId,
      micrositeId: client.config.micrositeId,
      debug: {
        bookingKeys: Object.keys(booking),
        transportLocations: Object.keys(transportLocations).filter((key) => transportLocations[key]),
        foundLocation,
        transportCount: transportData.length,
      },
      booking: {
        id: booking.bookingReference || booking.id,
        reference: booking.bookingReference,
        title: booking.title || booking.name,
        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status,
        client: {
          name: `${booking.contactPerson?.name || ""} ${booking.contactPerson?.lastName || ""}`.trim(),
          email: booking.contactPerson?.email || booking.user?.email || "",
          phone: booking.contactPerson?.phone || booking.user?.telephone || "",
        },
      },
      transports,
      rawFirstTransport: transportData[0] || null, // For debugging
    })
  } catch (error) {
    console.error("❌ EXACT booking lookup failed:", error)
    return NextResponse.json({
      success: false,
      error: `EXACT booking ${bookingId} not found: ${error instanceof Error ? error.message : "Unknown error"}`,
      bookingId,
      configId,
    })
  }
}
