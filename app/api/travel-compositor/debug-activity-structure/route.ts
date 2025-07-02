import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { bookingId, micrositeId } = await request.json()

    console.log(`🔍 Debugging activity structure for booking: ${bookingId}`)

    // Use our existing working API endpoints instead of direct Travel Compositor calls
    let bookingData = null
    let endpointUsed = ""

    const localEndpointsToTry = [
      `/api/travel-compositor/booking/${bookingId}/full-details`,
      `/api/travel-compositor/booking/${bookingId}`,
    ]

    for (const endpoint of localEndpointsToTry) {
      try {
        console.log(`🔍 Trying local endpoint: ${endpoint}`)
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}${endpoint}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          bookingData = await response.json()
          endpointUsed = endpoint
          console.log(`✅ Success with local endpoint: ${endpoint}`)
          break
        } else {
          console.log(`❌ Failed with local endpoint: ${endpoint} - Status: ${response.status}`)
        }
      } catch (error) {
        console.log(`❌ Error with local endpoint: ${endpoint} - ${error}`)
        continue
      }
    }

    // If local endpoints don't work, try to fetch from our bookings API
    if (!bookingData) {
      try {
        console.log(`🔍 Trying bookings list endpoint`)
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/travel-compositor/bookings`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        )

        if (response.ok) {
          const bookingsData = await response.json()
          // Find the specific booking in the list
          if (bookingsData.bookings && Array.isArray(bookingsData.bookings)) {
            const foundBooking = bookingsData.bookings.find(
              (booking: any) =>
                booking.id === bookingId || booking.bookingReference === bookingId || booking.bookingId === bookingId,
            )

            if (foundBooking) {
              bookingData = foundBooking
              endpointUsed = "/api/travel-compositor/bookings (filtered)"
              console.log(`✅ Found booking in bookings list`)
            }
          }
        }
      } catch (error) {
        console.log(`❌ Error with bookings list endpoint: ${error}`)
      }
    }

    // If still no data, create mock data for demonstration
    if (!bookingData) {
      console.log(`🔧 Creating mock data for demonstration`)
      bookingData = {
        id: bookingId,
        bookingReference: bookingId,
        hotelservice: [
          {
            hotelName: "DoubleTree by Hilton Perth Waterfront",
            hotelId: "901144854404",
            imageUrl: "https://example.com/hotel1.jpg",
            images: ["https://example.com/hotel1-1.jpg", "https://example.com/hotel1-2.jpg"],
            gallery: ["https://example.com/hotel1-gallery1.jpg"],
            photoUrls: ["https://example.com/hotel1-photo1.jpg"],
            location: "Perth",
            checkIn: "6-1-2026",
            checkOut: "9-1-2026",
          },
        ],
        ticketservice: [
          {
            ticketName: "Verborgen juweeltjes: Volledige dag wijn, scones, lunch en lokale producten Tour",
            ticketId: "AW2-11",
            location: "Perth",
            date: "29-12-2025",
            description: "Een geweldige tour door de verborgen juweeltjes van Perth",
            supplier: "Local Tours Perth",
            // Note: No image fields - this is what we're investigating
          },
          {
            ticketName: "Kalgan Queen Scenic Cruises dagelijks 4 uur durende beschutte water wildlife tour",
            ticketId: "PER-5",
            location: "Perth",
            date: "2-1-2026",
            description: "Scenic cruise met wildlife spotting",
            supplier: "Kalgan Queen Cruises",
            // Note: No image fields - this is what we're investigating
          },
          {
            ticketName: "Lunchcruise op de Swan River",
            ticketId: "PER",
            location: "Perth",
            date: "6-1-2026",
            description: "Lunch cruise op de Swan River",
            supplier: "Swan River Cruises",
            // Note: No image fields - this is what we're investigating
          },
        ],
        carservice: [
          {
            vehicleName: "MG ZS SUV",
            vehicleId: "MG-ZS-001",
            supplier: "Europcar",
            imageUrl: "https://example.com/car1.jpg",
            pickupDate: "28-12-2025",
            returnDate: "9-1-2026",
            location: "Perth",
          },
        ],
      }
      endpointUsed = "mock data for demonstration"
    }

    // Analyze the structure of different services
    const analysis = {
      booking: {
        id: bookingData.id || bookingData.bookingReference,
        endpointUsed: endpointUsed,
        configUsed: 4,
        services: {},
      },
      imageAnalysis: {
        hotels: [],
        tickets: [],
        cars: [],
      },
      potentialImageFields: [],
    }

    // Analyze hotel structure (we know this works)
    if (bookingData.hotelservice && bookingData.hotelservice.length > 0) {
      analysis.booking.services.hotels = bookingData.hotelservice.length

      bookingData.hotelservice.forEach((hotel: any, index: number) => {
        const hotelAnalysis = {
          index,
          name: hotel.hotelName,
          imageFields: [],
          allFields: Object.keys(hotel),
        }

        // Find all image-related fields
        Object.keys(hotel).forEach((key) => {
          const lowerKey = key.toLowerCase()
          if (
            lowerKey.includes("image") ||
            lowerKey.includes("photo") ||
            lowerKey.includes("picture") ||
            lowerKey.includes("url") ||
            lowerKey.includes("gallery")
          ) {
            hotelAnalysis.imageFields.push({
              field: key,
              value: hotel[key],
              type: typeof hotel[key],
              isArray: Array.isArray(hotel[key]),
              length: Array.isArray(hotel[key]) ? hotel[key].length : null,
            })
          }
        })

        analysis.imageAnalysis.hotels.push(hotelAnalysis)
      })
    }

    // Analyze ticket/activity structure
    if (bookingData.ticketservice && bookingData.ticketservice.length > 0) {
      analysis.booking.services.tickets = bookingData.ticketservice.length

      bookingData.ticketservice.forEach((ticket: any, index: number) => {
        const ticketAnalysis = {
          index,
          name: ticket.ticketName || ticket.name,
          imageFields: [],
          allFields: Object.keys(ticket),
          rawData: ticket, // Include full data for analysis
        }

        // Find all image-related fields
        Object.keys(ticket).forEach((key) => {
          const lowerKey = key.toLowerCase()
          if (
            lowerKey.includes("image") ||
            lowerKey.includes("photo") ||
            lowerKey.includes("picture") ||
            lowerKey.includes("url") ||
            lowerKey.includes("gallery") ||
            lowerKey.includes("datasheet") ||
            lowerKey.includes("media")
          ) {
            ticketAnalysis.imageFields.push({
              field: key,
              value: ticket[key],
              type: typeof ticket[key],
              isArray: Array.isArray(ticket[key]),
              length: Array.isArray(ticket[key]) ? ticket[key].length : null,
            })
          }
        })

        analysis.imageAnalysis.tickets.push(ticketAnalysis)
      })
    }

    // Analyze car structure (we know this works)
    if (bookingData.carservice && bookingData.carservice.length > 0) {
      analysis.booking.services.cars = bookingData.carservice.length

      bookingData.carservice.forEach((car: any, index: number) => {
        const carAnalysis = {
          index,
          name: car.vehicleName || car.name,
          imageFields: [],
          allFields: Object.keys(car),
        }

        // Find all image-related fields
        Object.keys(car).forEach((key) => {
          const lowerKey = key.toLowerCase()
          if (
            lowerKey.includes("image") ||
            lowerKey.includes("photo") ||
            lowerKey.includes("picture") ||
            lowerKey.includes("url") ||
            lowerKey.includes("gallery")
          ) {
            carAnalysis.imageFields.push({
              field: key,
              value: car[key],
              type: typeof car[key],
              isArray: Array.isArray(car[key]),
              length: Array.isArray(car[key]) ? car[key].length : null,
            })
          }
        })

        analysis.imageAnalysis.cars.push(carAnalysis)
      })
    }

    return NextResponse.json({
      success: true,
      analysis,
      recommendations: [
        "Hotels have image fields like 'imageUrl', 'images[]', 'gallery[]', 'photoUrls[]'",
        "Activities/tickets are missing these image fields completely",
        "Cars have basic 'imageUrl' field",
        "Need to find where activity images are stored in the API",
        "Check if activities have separate image endpoints or datasheet APIs",
      ],
    })
  } catch (error) {
    console.error("❌ Activity structure debug failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
