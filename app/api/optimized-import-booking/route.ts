import { NextResponse } from "next/server"
import { extractBookingData } from "@/lib/booking-data-extractor"

export async function POST(request: Request) {
  try {
    const { bookingId, micrositeId } = await request.json()

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 })
    }

    console.log(`🚀 Starting REVERSE import for booking: ${bookingId}`)

    // Use reverse search strategy (start from highest booking numbers)
    const configs = [
      {
        name: "Primary Microsite",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!,
      },
      {
        name: "Tertiary Microsite",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_3!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_3!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3!,
      },
      {
        name: "Quaternary Microsite",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_4!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_4!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_4!,
      },
    ].filter((config) => config.username && config.password && config.micrositeId)

    // If specific microsite requested, filter to that one
    const searchConfigs = micrositeId ? configs.filter((c) => c.micrositeId === micrositeId) : configs

    for (const config of searchConfigs) {
      try {
        console.log(`🔄 Reverse searching ${config.name} for: ${bookingId}`)

        // Authenticate
        const authResponse = await fetch("https://online.travelcompositor.com/resources/authentication/authenticate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            username: config.username,
            password: config.password,
            micrositeId: config.micrositeId,
          }),
        })

        if (!authResponse.ok) {
          console.log(`❌ Auth failed for ${config.name}`)
          continue
        }

        const authData = await authResponse.json()
        const token = authData.token

        // Search from high offsets (newest bookings first) - this is the key!
        const searchOffsets = [900, 800, 700, 600, 500, 400, 300, 200, 100, 0]

        for (const offset of searchOffsets) {
          try {
            const response = await fetch(
              `https://online.travelcompositor.com/resources/booking/getBookings?microsite=${config.micrositeId}&from=20250101&to=20251231&first=${offset}&limit=200`,
              {
                headers: {
                  "auth-token": token,
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
              },
            )

            if (!response.ok) continue

            const data = await response.json()
            const bookings = data.bookedTrip || data.bookings || []

            if (bookings.length === 0) continue

            // Find target booking
            const targetBooking = bookings.find((booking: any) => {
              const possibleIds = [
                booking.id,
                booking.bookingId,
                booking.reservationId,
                booking.bookingReference,
                booking.reference,
                booking.tripId,
              ].filter(Boolean)
              return possibleIds.some((id) => String(id).toUpperCase() === bookingId.toUpperCase())
            })

            if (targetBooking) {
              console.log(`✅ Found ${bookingId} in ${config.name} at offset ${offset}`)

              // Extract booking data using our extractor
              const extractedData = extractBookingData(targetBooking)

              return NextResponse.json({
                success: true,
                booking: {
                  id: extractedData.id,
                  bookingReference: extractedData.id,
                  title: extractedData.title,
                  client: extractedData.client,
                  destination: extractedData.destinations.map((d) => d.name).join(", "),
                  startDate: extractedData.startDate,
                  endDate: extractedData.endDate,
                  status: "BOOKED",
                  totalPrice: extractedData.totalPrice.amount,
                  currency: extractedData.totalPrice.currency,

                  // Ensure arrays are always present
                  accommodations: extractedData.services.hotels || [],
                  activities: extractedData.services.tickets || [],
                  transports: extractedData.services.transports || [],
                  vouchers: extractedData.services.transfers || [],

                  // Import metadata
                  importedAt: new Date().toISOString(),
                  importedFrom: "Travel Compositor",
                  foundInMicrosite: config.name,
                  searchMethod: `Reverse search in ${config.name} (offset ${offset})`,
                  originalBookingId: bookingId,
                  cleanedBookingId: bookingId.replace(/^RRP-?/i, "").trim(),
                },
                searchMethod: `Reverse search in ${config.name} (offset ${offset})`,
                foundInMicrosite: config.name,
              })
            }
          } catch (offsetError) {
            continue
          }
        }
      } catch (configError) {
        console.log(`❌ Error with ${config.name}:`, configError)
        continue
      }
    }

    return NextResponse.json(
      {
        error: `Booking ${bookingId} not found in any microsite using reverse search`,
        searchMethod: "Reverse search (all microsites)",
      },
      { status: 404 },
    )
  } catch (error) {
    console.error("❌ Import booking error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
