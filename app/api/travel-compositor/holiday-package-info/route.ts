import { NextResponse } from "next/server"

export async function GET() {
  try {
    const holidayPackageEndpoints = {
      endpoints: [
        {
          name: "Package Details",
          method: "GET",
          url: "/resources/package/{micrositeId}/{holidayPackageId}",
          description: "Haalt gedetailleerde informatie op over een specifiek holiday package",
          parameters: [
            { name: "micrositeId", type: "path", required: true, description: "ID van de microsite" },
            { name: "holidayPackageId", type: "path", required: true, description: "ID van het holiday package" },
            { name: "lang", type: "query", required: false, description: "Taalcode (nl, en, de, fr)" },
          ],
          headers: [{ name: "auth-token", required: true, description: "Authenticatie token" }],
          example: "https://online.travelcompositor.com/resources/package/12345/PKG-001?lang=nl",
        },
        {
          name: "Package Calendar",
          method: "GET",
          url: "/resources/package/calendar/{micrositeId}/{holidayPackageId}",
          description: "Haalt beschikbaarheid en prijzen op voor een holiday package",
          parameters: [
            { name: "micrositeId", type: "path", required: true, description: "ID van de microsite" },
            { name: "holidayPackageId", type: "path", required: true, description: "ID van het holiday package" },
            { name: "currency", type: "query", required: false, description: "Valutacode (EUR, USD, GBP)" },
          ],
          headers: [{ name: "auth-token", required: true, description: "Authenticatie token" }],
          example: "https://online.travelcompositor.com/resources/package/calendar/12345/PKG-001?currency=EUR",
        },
        {
          name: "List All Packages",
          method: "GET",
          url: "/resources/package/{micrositeId}",
          description: "Haalt lijst op van alle beschikbare holiday packages",
          parameters: [
            { name: "micrositeId", type: "path", required: true, description: "ID van de microsite" },
            { name: "lang", type: "query", required: true, description: "Taalcode" },
            { name: "first", type: "query", required: false, description: "Paginatie offset" },
            { name: "limit", type: "query", required: false, description: "Aantal resultaten per pagina" },
            { name: "destination", type: "query", required: false, description: "Filter op bestemming" },
            { name: "theme", type: "query", required: false, description: "Filter op thema" },
          ],
          headers: [{ name: "auth-token", required: true, description: "Authenticatie token" }],
          example: "https://online.travelcompositor.com/resources/package/12345?lang=nl&limit=10",
        },
        {
          name: "Book Package",
          method: "POST",
          url: "/resources/package/book/{micrositeId}/{holidayPackageId}",
          description: "Maakt een boeking aan voor een holiday package",
          parameters: [
            { name: "micrositeId", type: "path", required: true, description: "ID van de microsite" },
            { name: "holidayPackageId", type: "path", required: true, description: "ID van het holiday package" },
          ],
          headers: [
            { name: "auth-token", required: true, description: "Authenticatie token" },
            { name: "Content-Type", required: true, description: "application/json" },
          ],
          body: {
            passengers: "Array van passagier objecten",
            departureDate: "Vertrekdatum (YYYY-MM-DD)",
            paymentMethod: "Betaalmethode",
            specialRequests: "Speciale verzoeken",
          },
          example: "POST https://online.travelcompositor.com/resources/package/book/12345/PKG-001",
        },
      ],
      authentication: {
        method: "POST",
        url: "/resources/authentication/authenticate",
        description: "Authenticeer om een auth-token te krijgen",
        body: {
          username: "Je Travel Compositor gebruikersnaam",
          password: "Je Travel Compositor wachtwoord",
          micrositeId: "ID van de microsite",
        },
      },
      microsites: [
        {
          id: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID,
          name: "rondreis-planner",
          description: "Primaire microsite voor rondreizen",
        },
        {
          id: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_2,
          name: "reisbureaunederland",
          description: "Secundaire microsite",
        },
        {
          id: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3,
          name: "auto",
          description: "Auto microsite",
        },
        {
          id: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_4,
          name: "microsite-4",
          description: "Vierde microsite",
        },
      ],
    }

    return NextResponse.json({
      success: true,
      data: holidayPackageEndpoints,
    })
  } catch (error) {
    console.error("❌ Error getting holiday package info:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
