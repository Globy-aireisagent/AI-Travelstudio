import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function POST(request: NextRequest) {
  try {
    console.log("✈️ Starting transport quote request...")

    const body = await request.json()
    const { journeys, persons, language = "nl", sourceMarket = "NL", tripType = "ROUND_TRIP" } = body

    // Validate required fields
    if (!journeys || !Array.isArray(journeys) || journeys.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: journeys (must be non-empty array)",
        },
        { status: 400 },
      )
    }

    if (!persons || !Array.isArray(persons) || persons.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: persons (must be non-empty array)",
        },
        { status: 400 },
      )
    }

    const client = createTravelCompositorClient(1)
    const token = await client.authenticate()

    // Prepare request payload according to ApiTransportQuoteRequestVO
    const quoteRequest = {
      journeys: journeys.map((journey: any) => ({
        departureDate: journey.departureDate,
        departure: journey.departure,
        departureType: journey.departureType || "AIRPORT",
        arrival: journey.arrival,
        arrivalType: journey.arrivalType || "AIRPORT",
      })),
      persons: persons.map((person: any) => ({
        name: person.name || "Guest",
        lastName: person.lastName || "",
        requestedAge: person.age || person.requestedAge || 30,
        birthDate: person.birthDate,
        documentNumber: person.documentNumber,
        courtesyTitle: person.courtesyTitle || "MR",
        documentType: person.documentType || "PASSPORT",
        email: person.email,
        phone: person.phone,
        country: person.country || "NL",
      })),
      language,
      sourceMarket,
      tripType,
    }

    console.log("📋 Transport quote request:", {
      journeys: quoteRequest.journeys.length,
      persons: quoteRequest.persons.length,
      tripType,
    })

    // Make API call to Travel Compositor
    const response = await fetch(`${client.config.baseUrl}/booking/transports/quote`, {
      method: "POST",
      headers: {
        "auth-token": token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(quoteRequest),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Transport quote failed:", response.status, errorText)

      return NextResponse.json(
        {
          success: false,
          error: `Transport quote failed: ${response.status}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const quoteData = await response.json()
    console.log("✅ Transport quote successful:", {
      services: quoteData.services?.length || 0,
      recommendations: quoteData.recommendations?.length || 0,
    })

    return NextResponse.json({
      success: true,
      data: quoteData,
      summary: {
        totalServices: quoteData.services?.length || 0,
        totalRecommendations: quoteData.recommendations?.length || 0,
        searchCriteria: {
          journeys: journeys.length,
          persons: persons.length,
          tripType,
        },
      },
    })
  } catch (error) {
    console.error("❌ Transport quote error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
