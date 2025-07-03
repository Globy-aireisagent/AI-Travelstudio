import { type NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { micrositeId: string; holidayPackageId: string } },
) {
  try {
    const { micrositeId, holidayPackageId } = params
    const { searchParams } = new URL(request.url)
    const config = searchParams.get("config") || "1"
    const lang = searchParams.get("lang") || "nl"

    console.log(`📦 Fetching holiday package ${holidayPackageId} from microsite ${micrositeId}`)

    // Get credentials based on config
    let username, password, actualMicrositeId
    switch (config) {
      case "1":
        username = process.env.TRAVEL_COMPOSITOR_USERNAME
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD
        actualMicrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID
        break
      case "2":
        username = process.env.TRAVEL_COMPOSITOR_USERNAME_2
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD_2
        actualMicrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_2
        break
      case "3":
        username = process.env.TRAVEL_COMPOSITOR_USERNAME_3
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD_3
        actualMicrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3
        break
      default:
        username = process.env.TRAVEL_COMPOSITOR_USERNAME
        password = process.env.TRAVEL_COMPOSITOR_PASSWORD
        actualMicrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID
    }

    if (!username || !password || !actualMicrositeId) {
      throw new Error(`Missing credentials for config ${config}`)
    }

    // Authenticate with Travel Compositor
    const authResponse = await fetch("https://online.travelcompositor.com/resources/authentication/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        micrositeId: actualMicrositeId,
      }),
    })

    if (!authResponse.ok) {
      const errorText = await authResponse.text()
      throw new Error(`Authentication failed: ${authResponse.status} - ${errorText}`)
    }

    const authData = await authResponse.json()
    const token = authData.token

    // Fetch Holiday Package details
    const packageResponse = await fetch(
      `https://online.travelcompositor.com/resources/package/${actualMicrositeId}/${holidayPackageId}?lang=${lang}`,
      {
        method: "GET",
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    )

    if (!packageResponse.ok) {
      const errorText = await packageResponse.text()
      throw new Error(`Get holiday package failed: ${packageResponse.status} - ${errorText}`)
    }

    const packageData = await packageResponse.json()
    console.log("🔍 Raw package data from API:", JSON.stringify(packageData, null, 2))

    // Only return actual data from Travel Compositor - no fallbacks or generated content
    const transformedPackage = {
      id: holidayPackageId,
      name: packageData.name || "",
      description: packageData.description || "",
      shortDescription: packageData.shortDescription || "",
      imageUrl: packageData.imageUrl || "",
      duration: packageData.duration || 0,
      destinations: packageData.destinations || [],
      themes: packageData.themes || [],
      priceFrom: packageData.priceFrom || null,
      pricePerPerson: packageData.pricePerPerson || null,
      totalPrice: packageData.totalPrice || null,
      departureDate: packageData.departureDate || "",
      returnDate: packageData.returnDate || "",
      availability: packageData.availability || null,
      inclusions: packageData.inclusions || [],
      exclusions: packageData.exclusions || [],
      itinerary: packageData.itinerary || [],
      accommodations: packageData.accommodations || [],
      transports: packageData.transports || [],
      activities: packageData.activities || [],
      bookingConditions: packageData.bookingConditions || null,
      contact: packageData.contact || null,
      searchMethod: "Holiday Package API",
      micrositeId: actualMicrositeId,
      rawData: packageData,
    }

    console.log("✅ Transformed package (only real data):", JSON.stringify(transformedPackage, null, 2))

    return NextResponse.json({
      success: true,
      package: transformedPackage,
      micrositeId: actualMicrositeId,
      holidayPackageId,
      endpoint: `https://online.travelcompositor.com/resources/package/${actualMicrositeId}/${holidayPackageId}`,
      method: "GET",
    })
  } catch (error) {
    console.error("❌ Error fetching holiday package:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
