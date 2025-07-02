// New utility to properly extract booking data from Travel Compositor responses
export interface ExtractedBookingData {
  id: string
  title: string
  client: {
    name: string
    email: string
    phone: string
    company: string
    address?: {
      street: string
      city: string
      postCode: string
      country: string
    }
    agencyBookingReference?: string
  }
  startDate: string
  endDate: string
  totalPrice: {
    amount: number
    currency: string
    breakdown: any
  }
  services: {
    hotels: any[]
    transports: any[]
    tickets: any[]
    transfers: any[]
    cars: any[]
    closedTours: any[]
    cruises: any[]
    insurances: any[]
    manualServices?: any[]
    itemServices?: any[]
  }
  destinations: any[]
  images: string[]
  descriptions: any
  metadata?: {
    nightsCount: number
    destinationCount: number
    adultCount: number
    childCount: number
    creationDate: string
    language: string
    salesChannel: string
    sourceMarket: any
    cancellationPolicies: any[]
    payment: any
    infantCount?: number
    lastUpdateDate?: string
    manualPayments?: any
    emergencyContact?: any
    residentDiscount?: any
    webSessionId?: any
  }
  rawData: any
  vouchers?: any[]
  facilities?: any[]
}

export function extractBookingData(rawBooking: any): ExtractedBookingData {
  console.log("🔄 Extracting booking data from:", Object.keys(rawBooking))

  // Check if this is a single hotel service or complete booking
  const isHotelService = !!(rawBooking.hotelId && rawBooking.hotelName && rawBooking.locationName)
  const isCompleteBooking = !!(rawBooking.hotelservice || rawBooking.ticketservice || rawBooking.contactPerson)

  console.log("🔍 Data type detection:", { isHotelService, isCompleteBooking })

  let extractedData: ExtractedBookingData

  if (isHotelService) {
    // This is a single hotel service - convert to booking format
    extractedData = extractFromHotelService(rawBooking)
  } else if (isCompleteBooking) {
    // This is a complete booking with multiple services
    extractedData = extractFromCompleteBooking(rawBooking)
  } else {
    // Unknown format - try to extract what we can
    extractedData = extractFromUnknownFormat(rawBooking)
  }

  console.log("✅ Extracted booking data:", {
    id: extractedData.id,
    title: extractedData.title,
    hotels: extractedData.services.hotels.length,
    client: extractedData.client.name,
    totalPrice: extractedData.totalPrice.amount,
  })

  return extractedData
}

function extractFromHotelService(hotelService: any): ExtractedBookingData {
  console.log("🏨 Extracting from hotel service:", hotelService.hotelName)

  // Generate title from location and hotel
  const title = `${hotelService.destinationName || hotelService.locationName} - ${hotelService.hotelName}`

  // Extract hotel data
  const hotel = {
    id: hotelService.id,
    displayName: hotelService.hotelName,
    name: hotelService.hotelName,
    location: hotelService.locationName,
    city: hotelService.locationName,
    country: hotelService.country,
    address: hotelService.hotelData?.address,
    postalCode: hotelService.hotelData?.postalCode,
    phone: hotelService.hotelData?.phoneNumber,
    checkInDate: hotelService.startDate,
    checkOutDate: hotelService.endDate,
    nights: hotelService.nights,
    mealPlan: hotelService.mealPlan,
    category: hotelService.category,
    roomType: hotelService.room?.[0]?.roomType,
    hotelId: hotelService.hotelId,
    providerHotelId: hotelService.providerHotelId,
    provider: hotelService.provider,
    destinationCode: hotelService.destinationCode,
  }

  // Extract price
  const totalPrice = {
    amount: hotelService.pricebreakdown?.totalPrice?.microsite?.amount || 0,
    currency: hotelService.pricebreakdown?.totalPrice?.microsite?.currency || "EUR",
    breakdown: hotelService.pricebreakdown,
  }

  // Extract destination
  const destination = {
    name: hotelService.destinationName || hotelService.locationName,
    code: hotelService.destinationCode,
    country: hotelService.country,
    type: "city",
  }

  return {
    id: hotelService.bookingReference || hotelService.id,
    title,
    client: {
      name: "Klant gegevens niet beschikbaar", // Hotel service doesn't contain client info
      email: "",
      phone: "",
      company: "",
    },
    startDate: hotelService.startDate,
    endDate: hotelService.endDate,
    totalPrice,
    services: {
      hotels: [hotel],
      transports: [],
      tickets: [],
      transfers: [],
      cars: [],
      closedTours: [],
      cruises: [],
      insurances: [],
    },
    destinations: [destination],
    images: [], // Will be fetched separately
    descriptions: {
      title,
      description: `${hotelService.nights} nachten in ${hotelService.hotelName}, ${hotelService.locationName}`,
      provider: hotelService.providerDescription,
      mealPlan: hotelService.mealPlan,
      category: hotelService.category,
    },
    rawData: hotelService,
  }
}

function extractFromCompleteBooking(booking: any): ExtractedBookingData {
  console.log("📋 Extracting from complete booking:", booking.bookingReference)

  // Extract hotels with full details
  const hotels = (booking.hotelservice || []).map((hotel: any) => ({
    id: hotel.id,
    displayName: hotel.hotelName,
    name: hotel.hotelName,
    location: hotel.locationName,
    city: hotel.locationName,
    country: hotel.country,
    address: hotel.hotelData?.address,
    postalCode: hotel.hotelData?.postalCode,
    phone: hotel.hotelData?.phoneNumber,
    checkInDate: hotel.startDate,
    checkOutDate: hotel.endDate,
    nights: hotel.nights,
    mealPlan: hotel.mealPlan,
    category: hotel.category,
    roomType: hotel.room?.[0]?.roomType,
    roomDescription: hotel.room?.[0]?.roomTypeDescription,
    hotelId: hotel.hotelId,
    providerHotelId: hotel.providerHotelId,
    provider: hotel.provider,
    providerDescription: hotel.providerDescription,
    destinationCode: hotel.destinationCode,
    destinationName: hotel.destinationName,
    price: {
      amount: hotel.pricebreakdown?.totalPrice?.microsite?.amount || 0,
      currency: hotel.pricebreakdown?.totalPrice?.microsite?.currency || "EUR",
    },
    bookingReference: hotel.bookingReference,
    status: hotel.status,
    ...hotel,
  }))

  // Extract transport services (flights, etc.) - FIXED VERSION
  const transports = (
    booking.transportservice ||
    booking.transportService ||
    booking.transports ||
    booking.services?.transports ||
    []
  ).map((transport: any) => {
    console.log("🚀 Processing transport:", {
      id: transport.id,
      departureAirport: transport.departureAirport,
      arrivalAirport: transport.arrivalAirport,
      priceAmount: transport.pricebreakdown?.totalPrice?.microsite?.amount,
    })

    return {
      id: transport.id,
      displayName: `${transport.departureAirport || "???"} → ${transport.arrivalAirport || "???"}`,
      type: "FLIGHT",
      provider: transport.provider || transport.operatorProvider || "Unknown Airline",
      operatorProvider: transport.operatorProvider,
      providerDescription: transport.providerDescription,
      bookingReference: transport.bookingReference,
      providerBookingReference: transport.providerBookingReference,

      // Main flight details - FIXED
      departureAirport: transport.departureAirport,
      arrivalAirport: transport.arrivalAirport,
      departureDate: transport.startDate,
      arrivalDate: transport.endDate,
      startDate: transport.startDate, // Keep both for compatibility
      endDate: transport.endDate,

      // Return flight details
      returnDepartureAirport: transport.returnDepartureAirport,
      returnArrivalAirport: transport.returnArrivalAirport,
      returnDepartureDate: transport.returnDepartureDate,
      returnArrivalDate: transport.returnArrivalDate,

      // Additional flight info
      includedBaggage: transport.includedBaggage,
      onewayPrice: transport.onewayPrice,
      status: transport.status,

      // FLIGHT SEGMENTS - FIXED
      segment: transport.segment || [],
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
        airlineReference: seg.airlineReference,
        fareType: seg.fareType,
        technicalStops: seg.technicalStops || [],
        seats: seg.seat || [],
      })),

      // BAGGAGE INFO - FIXED
      baggage: (transport.baggage || []).map((bag: any) => ({
        perPerson: bag.perPerson,
        personId: bag.personId,
        quantity: bag.quantity,
        weight: bag.weight,
        totalPrice: bag.totalPrice
          ? {
              amount: bag.totalPrice.amount,
              currency: bag.totalPrice.currency,
            }
          : null,
        isReturn: bag.return,
      })),

      // E-TICKETS
      etickets: transport.etickets || [],

      // FARE BREAKDOWN per person
      personFareBreakdown: transport.personFareBreakdown || [],

      // PRICE - FIX THE [object Object] ISSUE!
      price: transport.pricebreakdown?.totalPrice?.microsite
        ? {
            amount: Number(transport.pricebreakdown.totalPrice.microsite.amount) || 0,
            currency: transport.pricebreakdown.totalPrice.microsite.currency || "EUR",
          }
        : { amount: 0, currency: "EUR" },

      // Status and dates
      cancelationDate: transport.cancelationDate,
      providerCancellationDate: transport.providerCancellationDate,
      voucherUrl: transport.voucherUrl,

      // Keep all original data for debugging
      ...transport,
    }
  })

  // Extract other services
  const tickets = (booking.ticketservice || []).map((ticket: any) => ({
    id: ticket.id,
    displayName: ticket.name || ticket.title,
    name: ticket.name || ticket.title,
    location: ticket.location || ticket.city,
    date: ticket.date,
    price: {
      amount: ticket.pricebreakdown?.totalPrice?.microsite?.amount || 0,
      currency: ticket.pricebreakdown?.totalPrice?.microsite?.currency || "EUR",
    },
    ...ticket,
  }))

  // Extract client info from contactPerson
  const client = {
    name: `${booking.contactPerson?.name || ""} ${booking.contactPerson?.lastName || ""}`.trim(),
    email: booking.contactPerson?.email || booking.user?.email || "",
    phone: booking.contactPerson?.phone || booking.user?.telephone || "",
    company: booking.user?.agency?.name || "",
    address: booking.contactPerson?.address
      ? {
          street: booking.contactPerson.address.street,
          city: booking.contactPerson.address.city,
          postCode: booking.contactPerson.address.postCode,
          country: booking.contactPerson.country,
        }
      : null,
    agencyBookingReference: booking.agencyBookingReference,
  }

  // Extract total price from main booking
  const totalPrice = {
    amount: booking.pricebreakdown?.totalPrice?.microsite?.amount || 0,
    currency: booking.pricebreakdown?.totalPrice?.microsite?.currency || "EUR",
    breakdown: booking.pricebreakdown,
  }

  // Generate comprehensive title
  const destinations = [...new Set(hotels.map((h) => h.destinationName || h.location).filter(Boolean))]
  const title = destinations.length > 0 ? `Rondreis ${destinations.join(" - ")}` : `Reis ${booking.bookingReference}`

  // Extract destinations with more detail from multiple sources
  const destinationList = []

  // From hotels - use destination codes to fetch full DestinationVO data
  hotels.forEach((hotel) => {
    if (hotel.destinationCode || hotel.destinationName || hotel.location) {
      const existingDest = destinationList.find(
        (d) => d.code === hotel.destinationCode || d.name === (hotel.destinationName || hotel.location),
      )

      if (!existingDest) {
        destinationList.push({
          code: hotel.destinationCode,
          name: hotel.destinationName || hotel.location,
          country: hotel.country,
          type: "city",
          nights: hotel.nights || 0,
          hotels: [hotel.name],
          coordinates: hotel.coordinates,
          // These will be populated from DestinationVO API call
          geolocation: null,
          images: [],
          description: null,
          provincePostalPrefix: null,
          active: true,
        })
      } else {
        existingDest.nights += hotel.nights || 0
        existingDest.hotels.push(hotel.name)
      }
    }
  })

  // From transport services - airports as destinations
  transports.forEach((transport) => {
    ;[
      { code: transport.departureAirport, name: transport.departureCity },
      { code: transport.arrivalAirport, name: transport.arrivalCity },
    ].forEach((airport) => {
      if (airport.code && !destinationList.find((d) => d.code === airport.code)) {
        destinationList.push({
          code: airport.code,
          name: airport.name || airport.code,
          type: "airport",
          nights: 0,
          geolocation: null,
          images: [],
          description: null,
        })
      }
    })
  })

  // From ticket services - attraction destinations
  tickets.forEach((ticket) => {
    if (ticket.destinationCode || ticket.location) {
      const destCode = ticket.destinationCode
      const destName = ticket.location || ticket.city

      if (destCode && !destinationList.find((d) => d.code === destCode)) {
        destinationList.push({
          code: destCode,
          name: destName,
          type: "attraction",
          nights: 0,
          activities: [ticket.name],
          geolocation: null,
          images: [],
          description: null,
        })
      }
    }
  })

  // Extract vouchers and documents
  const vouchers = []

  // Main voucher URL
  if (booking.voucherUrl) {
    vouchers.push({
      type: "main",
      url: booking.voucherUrl,
      title: "Hoofdvoucher",
    })
  }

  // PDF documents
  if (booking.pdfs && Array.isArray(booking.pdfs)) {
    booking.pdfs.forEach((pdf) => {
      vouchers.push({
        type: "pdf",
        url: pdf.url,
        title: pdf.title || pdf.name || "Document",
        description: pdf.description,
      })
    })
  }

  // Service-specific vouchers
  hotels.forEach((hotel) => {
    if (hotel.voucherUrl || hotel.confirmationUrl) {
      vouchers.push({
        type: "hotel",
        serviceId: hotel.id,
        serviceName: hotel.name,
        url: hotel.voucherUrl || hotel.confirmationUrl,
        title: `Hotel voucher - ${hotel.name}`,
      })
    }
  })

  transports.forEach((transport) => {
    if (transport.voucherUrl || transport.ticketUrl) {
      vouchers.push({
        type: "transport",
        serviceId: transport.id,
        serviceName: transport.displayName,
        url: transport.voucherUrl || transport.ticketUrl,
        title: `Transport voucher - ${transport.displayName}`,
      })
    }
  })

  // Extract facilities and amenities
  const facilities = []

  // Hotel facilities
  hotels.forEach((hotel) => {
    if (hotel.facilities && Array.isArray(hotel.facilities)) {
      hotel.facilities.forEach((facility) => {
        if (!facilities.find((f) => f.code === facility.code)) {
          facilities.push({
            code: facility.code,
            name: facility.name,
            description: facility.description,
            category: facility.category || "hotel",
            serviceType: "accommodation",
            serviceId: hotel.id,
            serviceName: hotel.name,
          })
        }
      })
    }

    // Room facilities
    if (hotel.room && hotel.room[0] && hotel.room[0].facilities) {
      hotel.room[0].facilities.forEach((facility) => {
        facilities.push({
          code: facility.code,
          name: facility.name,
          category: "room",
          serviceType: "accommodation",
          serviceId: hotel.id,
          serviceName: hotel.name,
          roomType: hotel.room[0].roomType,
        })
      })
    }
  })

  // Activity/ticket facilities
  tickets.forEach((ticket) => {
    if (ticket.facilities && Array.isArray(ticket.facilities)) {
      ticket.facilities.forEach((facility) => {
        facilities.push({
          code: facility.code,
          name: facility.name,
          category: "activity",
          serviceType: "ticket",
          serviceId: ticket.id,
          serviceName: ticket.name,
        })
      })
    }
  })

  // Calculate trip duration
  const startDate = booking.startDate
  const endDate = booking.endDate
  const nightsCount = booking.nightsCount || 0
  const destinationCount = booking.destinationCount || destinations.length

  return {
    id: booking.bookingReference || booking.id,
    title,
    client,
    startDate,
    endDate,
    totalPrice,
    services: {
      hotels,
      transports,
      tickets,
      transfers: booking.transferservice || [],
      cars: booking.carservice || [],
      closedTours: booking.closedtourservice || [],
      cruises: booking.cruiseservice || [],
      insurances: booking.insuranceservice || [],
      manualServices: booking.manualServices || [],
      itemServices: booking.itemservice || [],
    },
    destinations: destinationList,
    vouchers,
    facilities,
    images: [], // Will be fetched separately
    descriptions: {
      title,
      description: `${nightsCount} nachten rondreis door ${destinationCount} bestemmingen`,
      provider: hotels[0]?.providerDescription || "Travel Compositor",
      tripType: booking.tripType,
      status: booking.status,
      notes: booking.notes,
      bookedNotes: booking.bookedNotes,
      ideaUrl: booking.ideaUrl,
      voucherUrl: booking.voucherUrl,
      themes: booking.themesAssociated || [],
    },
    metadata: {
      nightsCount,
      destinationCount,
      adultCount: booking.adultCount,
      childCount: booking.childCount,
      infantCount: booking.infantCount,
      creationDate: booking.creationDate,
      lastUpdateDate: booking.lastUpdateDate,
      language: booking.language,
      salesChannel: booking.salesChannel,
      sourceMarket: booking.sourceMarket,
      cancellationPolicies: booking.cancellationPolicies,
      payment: booking.payment,
      manualPayments: booking.manualPayments,
      emergencyContact: booking.emergencyContact,
      residentDiscount: booking.residentDiscount,
      webSessionId: booking.webSessionId,
    },
    rawData: booking,
  }
}

function extractFromUnknownFormat(data: any): ExtractedBookingData {
  console.log("❓ Extracting from unknown format")

  return {
    id: data.id || "UNKNOWN-" + Date.now(),
    title: data.title || data.name || "Onbekende Reis",
    client: {
      name: "Niet beschikbaar",
      email: "",
      phone: "",
      company: "",
    },
    startDate: data.startDate || null,
    endDate: data.endDate || null,
    totalPrice: {
      amount: 0,
      currency: "EUR",
      breakdown: null,
    },
    services: {
      hotels: [],
      transports: [],
      tickets: [],
      transfers: [],
      cars: [],
      closedTours: [],
      cruises: [],
      insurances: [],
    },
    destinations: [],
    images: [],
    descriptions: {
      title: data.title || "Onbekende Reis",
      description: "",
    },
    rawData: data,
  }
}
