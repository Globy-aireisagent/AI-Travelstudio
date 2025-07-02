import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function POST(request: NextRequest) {
  try {
    console.log("🎫 Starting ticket quote request...")

    const body = await request.json()
    const {
      checkIn,
      checkOut,
      persons,
      language = "nl",
      sourceMarket = "NL",
      timeout = 30000,
      destinationId,
      micrositeId,
    } = body

    // Validate required fields
    if (!checkIn || !checkOut || !persons || !Array.isArray(persons)) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: checkIn, checkOut, persons",
        },
        { status: 400 },
      )
    }

    // Use provided micrositeId or default to config 1
    const configNumber = micrositeId ? 1 : 1 // Can be enhanced to map micrositeId to config
    const client = createTravelCompositorClient(configNumber)

    // Authenticate
    const token = await client.authenticate()

    // Prepare request payload according to ApiTicketQuoteRequestVO
    const quoteRequest = {
      checkIn,
      checkOut,
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
      timeout,
      ...(destinationId && { destinationId }),
    }

    console.log("📋 Quote request payload:", quoteRequest)

    // Make API call to Travel Compositor
    const response = await fetch(`${client.config.baseUrl}/booking/tickets/quote`, {
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
      console.error("❌ Ticket quote failed:", response.status, errorText)

      return NextResponse.json(
        {
          success: false,
          error: `Ticket quote failed: ${response.status}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const quoteData = await response.json()
    console.log("✅ Ticket quote successful:", {
      total: quoteData.total,
      ticketsFound: quoteData.tickets?.length || 0,
    })

    return NextResponse.json({
      success: true,
      data: quoteData,
      summary: {
        totalTickets: quoteData.total || 0,
        availableTickets: quoteData.tickets?.length || 0,
        searchCriteria: {
          checkIn,
          checkOut,
          persons: persons.length,
          destination: destinationId,
        },
      },
    })
  } catch (error) {
    console.error("❌ Ticket quote error:", error)

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
