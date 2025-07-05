import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🏢 Testing Newreisplan agencies import...")

    // Authenticeer eerst
    const credentials = {
      username: process.env.TRAVEL_COMPOSITOR_USERNAME!,
      password: process.env.TRAVEL_COMPOSITOR_PASSWORD!,
      micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!,
    }

    const authResponse = await fetch("https://online.travelcompositor.com/resources/authentication/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(credentials),
    })

    if (!authResponse.ok) {
      throw new Error(`Authentication failed: ${authResponse.status}`)
    }

    const authData = await authResponse.json()
    const token = authData.token

    // Haal ALLE agencies op - probeer verschillende limits
    console.log(`📋 Fetching ALL agencies from microsite ${credentials.micrositeId}...`)

    const allAgencies: any[] = []
    let currentPage = 0
    const pageSize = 100 // Grotere page size

    while (true) {
      const agenciesResponse = await fetch(
        `https://online.travelcompositor.com/resources/agency/${credentials.micrositeId}?first=${currentPage * pageSize}&limit=${pageSize}`,
        {
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      )

      if (!agenciesResponse.ok) {
        const errorText = await agenciesResponse.text()
        console.error("❌ Agencies fetch failed:", agenciesResponse.status, errorText)

        return NextResponse.json({
          success: false,
          error: `Agencies fetch failed: ${agenciesResponse.status}`,
          debug: {
            status: agenciesResponse.status,
            errorText: errorText.substring(0, 200),
            page: currentPage,
          },
        })
      }

      const agenciesData = await agenciesResponse.json()
      console.log(`📊 Page ${currentPage} agencies response:`, agenciesData)

      const pageAgencies = agenciesData.agency || agenciesData.agencies || []

      if (pageAgencies.length === 0) {
        console.log(`📄 No more agencies found on page ${currentPage}`)
        break
      }

      allAgencies.push(...pageAgencies)
      console.log(`📋 Added ${pageAgencies.length} agencies from page ${currentPage}, total: ${allAgencies.length}`)

      // Als we minder dan pageSize krijgen, zijn we klaar
      if (pageAgencies.length < pageSize) {
        break
      }

      currentPage++

      // Safety break na 10 pagina's
      if (currentPage >= 10) {
        console.log("⚠️ Breaking after 10 pages to prevent infinite loop")
        break
      }
    }

    // Verrijk agencies met extra info
    const enrichedAgencies = allAgencies.map((agency) => ({
      id: agency.id,
      name: agency.name || `Agency ${agency.id}`,
      email: agency.email || agency.contactEmail || "",
      phone: agency.phone || agency.contactPhone || "",
      address: agency.address || "",
      city: agency.city || "",
      country: agency.country || "",
      status: agency.status || "active",
      createdDate: agency.createdDate || "",
    }))

    console.log(`✅ Found ${enrichedAgencies.length} total agencies in Newreisplan`)

    return NextResponse.json({
      success: true,
      data: {
        agencies: enrichedAgencies,
        totalAgencies: enrichedAgencies.length,
        pagesProcessed: currentPage + 1,
        micrositeId: credentials.micrositeId,
      },
    })
  } catch (error) {
    console.error("❌ Agencies test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
