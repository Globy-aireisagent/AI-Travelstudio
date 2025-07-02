import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const bookingId = searchParams.get("bookingId") || "RRP-9200"
  const configNumber = Number.parseInt(searchParams.get("config") || "1")

  console.log(`🔧 Fixing booking endpoints for: ${bookingId}`)

  try {
    const client = createTravelCompositorClient(configNumber)
    await client.authenticate()

    // Gebaseerd op de debug resultaten: de booking bestaat in 2021
    // Laten we de correcte endpoint structuur vinden
    const workingEndpoint = await findWorkingEndpoint(client, bookingId)

    if (workingEndpoint) {
      // Nu zoeken we de specifieke booking
      const booking = await findSpecificBooking(client, bookingId, workingEndpoint)

      return NextResponse.json({
        success: true,
        bookingId,
        workingEndpoint: workingEndpoint.endpoint,
        totalBookingsFound: workingEndpoint.totalBookings,
        booking,
        searchStrategy: workingEndpoint.strategy,
      })
    } else {
      return NextResponse.json({
        success: false,
        message: "No working endpoint found",
        bookingId,
      })
    }
  } catch (error) {
    console.error("❌ Fix booking endpoints error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

async function findWorkingEndpoint(client: any, bookingId: string) {
  const micrositeId = client.config.micrositeId

  // Gebaseerd op debug: probeer 2021 date range eerst
  const strategies = [
    {
      name: "2021 Date Range",
      endpoint: `/resources/booking/getBookings?microsite=${micrositeId}&from=20210101&to=20211231&limit=10000`,
      strategy: "date_range_2021",
    },
    {
      name: "2021 with pagination",
      endpoint: `/resources/booking/getBookings?microsite=${micrositeId}&from=20210101&to=20211231&first=0&limit=10000`,
      strategy: "paginated_2021",
    },
    {
      name: "All bookings no date",
      endpoint: `/resources/booking/getBookings?microsite=${micrositeId}&limit=10000`,
      strategy: "no_date_filter",
    },
    {
      name: "Wide date range",
      endpoint: `/resources/booking/getBookings?microsite=${micrositeId}&from=20200101&to=20251231&limit=10000`,
      strategy: "wide_range",
    },
  ]

  for (const strategy of strategies) {
    try {
      console.log(`🧪 Testing strategy: ${strategy.name}`)

      const response = await client.makeAuthenticatedRequest(strategy.endpoint)

      if (response.ok) {
        const data = await response.json()
        const bookings = extractBookingsFromResponse(data)

        if (bookings.length > 0) {
          console.log(`✅ Found ${bookings.length} bookings with strategy: ${strategy.name}`)

          return {
            endpoint: strategy.endpoint,
            strategy: strategy.strategy,
            totalBookings: bookings.length,
            bookings: bookings,
          }
        }
      } else {
        console.log(`❌ Strategy ${strategy.name} failed: ${response.status}`)
      }
    } catch (error) {
      console.log(`❌ Strategy ${strategy.name} error:`, error)
    }
  }

  return null
}

async function findSpecificBooking(client: any, bookingId: string, workingEndpoint: any) {
  console.log(`🔍 Searching for ${bookingId} in ${workingEndpoint.totalBookings} bookings`)

  const booking = workingEndpoint.bookings.find((b: any) => {
    const possibleIds = [
      b.id,
      b.bookingId,
      b.reservationId,
      b.bookingReference,
      b.reference,
      b.tripId,
      b.customBookingReference,
      b.externalId,
      b.bookingNumber,
      b.reservationNumber,
    ].filter(Boolean)

    // Exact match eerst
    const exactMatch = possibleIds.some((id) => String(id).toLowerCase() === bookingId.toLowerCase())

    if (exactMatch) {
      console.log(`🎯 Exact match found for ${bookingId}`)
      return true
    }

    // Partial match
    const partialMatch = possibleIds.some(
      (id) =>
        String(id).toLowerCase().includes(bookingId.toLowerCase()) ||
        bookingId.toLowerCase().includes(String(id).toLowerCase()),
    )

    if (partialMatch) {
      console.log(`🎯 Partial match found for ${bookingId}`)
      return true
    }

    return false
  })

  if (booking) {
    console.log(`✅ Found booking:`, {
      id: booking.id,
      bookingId: booking.bookingId,
      reference: booking.reference,
      title: booking.title,
      client: booking.client?.name,
      startDate: booking.startDate,
      endDate: booking.endDate,
    })

    return {
      ...booking,
      matchedFields: {
        id: booking.id,
        bookingId: booking.bookingId,
        reference: booking.reference,
        bookingReference: booking.bookingReference,
      },
    }
  }

  // Als niet gevonden, geef sample bookings terug voor debugging
  console.log(`❌ Booking ${bookingId} not found. Sample bookings:`)
  const sampleBookings = workingEndpoint.bookings.slice(0, 10).map((b: any) => ({
    id: b.id,
    bookingId: b.bookingId,
    reference: b.reference,
    title: b.title,
    startDate: b.startDate,
  }))

  console.log(sampleBookings)

  return {
    found: false,
    sampleBookings,
    totalSearched: workingEndpoint.totalBookings,
  }
}

function extractBookingsFromResponse(data: any): any[] {
  if (data.bookedTrip && Array.isArray(data.bookedTrip)) {
    return data.bookedTrip
  }
  if (data.bookings && Array.isArray(data.bookings)) {
    return data.bookings
  }
  if (data.trips && Array.isArray(data.trips)) {
    return data.trips
  }
  if (data.reservations && Array.isArray(data.reservations)) {
    return data.reservations
  }
  if (Array.isArray(data)) {
    return data
  }
  if (data.data && Array.isArray(data.data)) {
    return data.data
  }
  if (data.results && Array.isArray(data.results)) {
    return data.results
  }

  return []
}
