import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function POST(request: NextRequest, { params }: { params: { ticketId: string } }) {
  try {
    const ticketId = params.ticketId
    console.log(`🎫 Starting ticket modalities quote for: ${ticketId}`)

    const body = await request.json()
    const { checkIn, checkOut, persons, language = "nl", sourceMarket = "NL", timeout = 30000, micrositeId } = body

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

    const client = createTravelCompositorClient(1)
    const token = await client.authenticate()

    // Prepare request payload according to ApiTicketQuoteSingleTicketRequestVO
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
    }

    console.log(`📋 Ticket ${ticketId} modalities request:`, quoteRequest)

    // Make API call to Travel Compositor
    const response = await fetch(`${client.config.baseUrl}/booking/tickets/${ticketId}/quote`, {
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
      console.error("❌ Ticket modalities quote failed:", response.status, errorText)

      return NextResponse.json(
        {
          success: false,
          error: `Ticket modalities quote failed: ${response.status}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const modalitiesData = await response.json()
    console.log("✅ Ticket modalities quote successful:", {
      ticketId,
      modalitiesFound: modalitiesData.modalities?.length || 0,
    })

    return NextResponse.json({
      success: true,
      ticketId,
      data: modalitiesData,
      summary: {
        ticketId,
        availableModalities: modalitiesData.modalities?.length || 0,
        searchCriteria: {
          checkIn,
          checkOut,
          persons: persons.length,
        },
      },
    })
  } catch (error) {
    console.error("❌ Ticket modalities quote error:", error)

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
