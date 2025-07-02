import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  // DEBUG MODE: Check for debug parameter
  const url = new URL(request.url)
  if (url.searchParams.get("debug") === "travel") {
    try {
      const username = process.env.TRAVEL_COMPOSITOR_USERNAME
      const password = process.env.TRAVEL_COMPOSITOR_PASSWORD
      const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID
      const baseUrl = "https://online.travelcompositor.com/api"

      // Check if env vars exist
      if (!username || !password || !micrositeId) {
        return Response.json({
          error: "Missing environment variables",
          hasUsername: !!username,
          hasPassword: !!password,
          hasMicrositeId: !!micrositeId,
        })
      }

      // Test authentication
      const authResponse = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          micrositeId,
        }),
      })

      const authData = await authResponse.json()

      if (!authResponse.ok) {
        return Response.json({
          step: "authentication",
          error: "Auth failed",
          status: authResponse.status,
          response: authData,
          micrositeId,
          baseUrl,
        })
      }

      const token = authData.token || authData.access_token

      // Test getting all bookings
      const bookingsResponse = await fetch(`${baseUrl}/microsites/${micrositeId}/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Microsite-ID": micrositeId,
        },
      })

      if (!bookingsResponse.ok) {
        const errorData = await bookingsResponse.json()
        return Response.json({
          step: "get_all_bookings",
          error: "Failed to get bookings",
          status: bookingsResponse.status,
          response: errorData,
          micrositeId,
          endpoint: `${baseUrl}/microsites/${micrositeId}/bookings`,
        })
      }

      const bookingsData = await bookingsResponse.json()

      return Response.json({
        success: true,
        authWorked: true,
        bookingsCount: Array.isArray(bookingsData) ? bookingsData.length : "unknown",
        firstFewBookings: Array.isArray(bookingsData)
          ? bookingsData.slice(0, 10).map((b) => ({ id: b.id, title: b.title || b.name }))
          : bookingsData,
        micrositeId,
        endpoint: `${baseUrl}/microsites/${micrositeId}/bookings`,
      })
    } catch (error) {
      return Response.json({
        debugError: true,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
    }
  }

  return Response.json({ message: "Chat API - use POST for chat, GET with ?debug=travel for debug" })
}

export async function POST(req: NextRequest) {
  try {
    const { messages, customerSlug, customerInfo, intakeData, bookingData } = await req.json()

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    const systemPrompt = bookingData
      ? `Je bent TravelBuddy, de persoonlijke AI reis-assistent voor ${intakeData?.naam || "de reiziger"}.

BOOKING INFORMATIE:
- Booking ID: ${bookingData.id}
- Bestemming: ${bookingData.destination}
- Periode: ${bookingData.startDate} tot ${bookingData.endDate}
- Totaalprijs: €${bookingData.totalPrice}
- Klant: ${bookingData.client?.name}

HOTELS & ACCOMMODATIES:
${
  bookingData.hotels
    ?.map(
      (hotel: any, index: number) =>
        `${index + 1}. ${hotel.name || hotel.title} - ${hotel.location || hotel.city || ""}`,
    )
    .join("\n") || "Geen hotels gevonden"
}

ACTIVITEITEN & SERVICES:
${
  bookingData.services
    ?.map(
      (service: any, index: number) => `${index + 1}. ${service.name || service.title} - ${service.description || ""}`,
    )
    .join("\n") || "Geen services gevonden"
}

PERSOONLIJKE VOORKEUREN:
${
  intakeData
    ? `
- Interesses: ${intakeData.interests?.join(", ") || "Niet opgegeven"}
- Activiteitsniveau: ${intakeData.activityLevel || "Niet opgegeven"}
- Budget voorkeur: ${intakeData.budget || "Niet opgegeven"}
- Reisgezelschap: ${intakeData.travelCompanions || "Niet opgegeven"}
- Speciale wensen: ${intakeData.specialRequests || "Geen"}
`
    : ""
}

INSTRUCTIES:
- Beantwoord vragen SPECIFIEK over deze booking
- Verwijs naar concrete hotels, activiteiten en data uit de booking
- Gebruik de persoonlijke voorkeuren voor gepersonaliseerde adviezen
- Spreek de reiziger bij naam aan (${intakeData?.naam})
- Geef praktische tips voor ${bookingData.destination}
- Wees enthousiast en behulpzaam in het Nederlands`
      : `Je bent Reisbuddy, een AI-assistent voor ${customerInfo?.name || "de reiziger"} die naar ${customerInfo?.destination || "hun bestemming"} gaat.

Gebruik deze informatie over de reiziger:
${
  intakeData
    ? `
- Interesses: ${intakeData.interests?.join(", ") || "Niet opgegeven"}
- Activiteitsniveau: ${intakeData.activityLevel || "Niet opgegeven"}
- Budget: ${intakeData.budget || "Niet opgegeven"}
- Reisgezelschap: ${intakeData.travelCompanions || "Niet opgegeven"}
`
    : ""
}

Geef persoonlijke, behulpzame reisadviezen in het Nederlands. Wees vriendelijk en enthousiast.`

    const result = await streamText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      messages,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
