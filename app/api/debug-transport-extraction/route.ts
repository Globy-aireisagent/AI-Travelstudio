import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const bookingId = searchParams.get("bookingId") || "RRP-9263"

  try {
    console.log(`🔍 Debugging transport extraction for: ${bookingId}`)

    // Get the raw booking data
    const response = await fetch(
      `${request.nextUrl.origin}/api/travel-compositor/booking-super-fast?bookingId=${bookingId}&config=1`,
    )
    const result = await response.json()

    if (!result.success) {
      return Response.json({ success: false, error: result.error })
    }

    const booking = result.booking
    const rawData = booking.rawData || booking

    console.log("🔍 Raw booking keys:", Object.keys(rawData))

    // Check all possible transport locations
    const transportChecks = {
      transportservice: rawData.transportservice,
      transportService: rawData.transportService,
      transports: rawData.transports,
      transport: rawData.transport,
      services_transports: rawData.services?.transports,
      flights: rawData.flights,
      flight: rawData.flight,
    }

    console.log("🚀 Transport data locations:")
    Object.entries(transportChecks).forEach(([key, value]) => {
      if (value) {
        console.log(`✅ Found ${key}:`, Array.isArray(value) ? `Array(${value.length})` : typeof value)
        if (Array.isArray(value) && value.length > 0) {
          console.log(`   First item keys:`, Object.keys(value[0]))
          console.log(`   First item sample:`, {
            id: value[0].id,
            departureAirport: value[0].departureAirport,
            arrivalAirport: value[0].arrivalAirport,
            startDate: value[0].startDate,
            endDate: value[0].endDate,
            provider: value[0].provider,
            operatorProvider: value[0].operatorProvider,
            pricebreakdown: value[0].pricebreakdown ? "Present" : "Missing",
          })
        }
      } else {
        console.log(`❌ Missing ${key}`)
      }
    })

    // Find the actual transport data
    let transports = []
    const transportData =
      rawData.transportservice || rawData.transportService || rawData.transports || rawData.services?.transports || []

    if (Array.isArray(transportData)) {
      transports = transportData.map((transport, index) => {
        console.log(`🔍 Processing transport ${index}:`, {
          id: transport.id,
          departureAirport: transport.departureAirport,
          arrivalAirport: transport.arrivalAirport,
          startDate: transport.startDate,
          endDate: transport.endDate,
          provider: transport.provider,
          operatorProvider: transport.operatorProvider,
          segments: transport.segment ? transport.segment.length : 0,
          priceAmount: transport.pricebreakdown?.totalPrice?.microsite?.amount,
          priceCurrency: transport.pricebreakdown?.totalPrice?.microsite?.currency,
        })

        return {
          // Basic info
          id: transport.id,
          type: "FLIGHT",
          provider: transport.provider || transport.operatorProvider || "Unknown",
          operatorProvider: transport.operatorProvider,
          providerDescription: transport.providerDescription,

          // Booking references
          bookingReference: transport.bookingReference,
          providerBookingReference: transport.providerBookingReference,

          // Flight details
          departureAirport: transport.departureAirport,
          arrivalAirport: transport.arrivalAirport,
          departureDate: transport.startDate,
          arrivalDate: transport.endDate,
          startDate: transport.startDate, // Keep both for compatibility
          endDate: transport.endDate,

          // Return flight
          returnDepartureAirport: transport.returnDepartureAirport,
          returnArrivalAirport: transport.returnArrivalAirport,
          returnDepartureDate: transport.returnDepartureDate,
          returnArrivalDate: transport.returnArrivalDate,

          // Additional info
          includedBaggage: transport.includedBaggage,
          onewayPrice: transport.onewayPrice,
          status: transport.status,

          // Segments
          segment: transport.segment || [],
          segments: (transport.segment || []).map((seg: any) => ({
            departureAirport: seg.departureAirport,
            arrivalAirport: seg.arrivalAirport,
            departureAirportName: seg.departureAirportName,
            arrivalAirportName: seg.arrivalAirportName,
            departureDate: seg.departureDate,
            arrivalDate: seg.arrivalDate,
            flightNumber: seg.flightNumber,
            marketingAirlineCode: seg.marketingAirlineCode,
            operatingAirlineCode: seg.operatingAirlineCode,
            bookingClass: seg.bookingClass,
            cabinClass: seg.cabinClass,
            durationInMinutes: seg.durationInMinutes,
          })),

          // Price - FIX THE [object Object] ISSUE
          price: transport.pricebreakdown?.totalPrice?.microsite
            ? {
                amount: transport.pricebreakdown.totalPrice.microsite.amount,
                currency: transport.pricebreakdown.totalPrice.microsite.currency,
              }
            : { amount: 0, currency: "EUR" },

          // Baggage
          baggage: transport.baggage || [],

          // E-tickets
          etickets: transport.etickets || [],

          // Voucher
          voucherUrl: transport.voucherUrl,

          // Raw for debugging
          _raw: transport,
        }
      })
    }

    return Response.json({
      success: true,
      debug: {
        bookingId,
        foundTransportLocations: Object.keys(transportChecks).filter((key) => transportChecks[key]),
        transportCount: transports.length,
        rawDataKeys: Object.keys(rawData),
      },
      transports,
      rawTransportData: transportData,
    })
  } catch (error) {
    console.error("❌ Debug transport error:", error)
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
