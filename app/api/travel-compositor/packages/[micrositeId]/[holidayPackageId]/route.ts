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

    // Transform the API response to our internal format
    const transformedPackage = {
      id: holidayPackageId,
      name: packageData.name || packageData.title || "Holiday Package",
      description: packageData.description || packageData.longDescription || "",
      shortDescription: packageData.shortDescription || packageData.summary || "",
      imageUrl: packageData.imageUrl || packageData.mainImage || (packageData.images && packageData.images[0]) || "",
      duration: packageData.duration || packageData.numberOfDays || packageData.days || 7,
      destinations: packageData.destinations
        ? packageData.destinations.map((dest: any) => ({
            name: dest.name || dest.code || dest.description,
            code: dest.code,
            country: dest.country,
            description: dest.description,
          }))
        : [],
      themes: packageData.themes || packageData.categories || [],
      priceFrom: packageData.priceFrom || packageData.price || { amount: 0, currency: "EUR" },
      pricePerPerson: packageData.pricePerPerson || packageData.pricePerAdult || { amount: 0, currency: "EUR" },
      totalPrice: packageData.totalPrice || packageData.price || { amount: 0, currency: "EUR" },
      departureDate: packageData.departureDate || packageData.startDate,
      returnDate: packageData.returnDate || packageData.endDate,
      availability: {
        available: packageData.available !== false,
        spotsLeft: packageData.spotsLeft || packageData.availableSpots || 0,
        totalSpots: packageData.totalSpots || packageData.maxParticipants || 0,
      },
      inclusions: packageData.inclusions || packageData.included || [],
      exclusions: packageData.exclusions || packageData.notIncluded || [],
      itinerary: packageData.itinerary || packageData.schedule || packageData.program || [],
      accommodations: packageData.accommodations || packageData.hotels || [],
      transports: packageData.transports || packageData.transportation || [],
      activities: packageData.activities || packageData.excursions || [],
      bookingConditions: packageData.bookingConditions || {
        cancellationPolicy: "Standard cancellation policy",
        paymentTerms: "Payment required at booking",
        minimumAge: 0,
        maximumGroupSize: 50,
        requiredDocuments: ["Valid passport"],
      },
      contact: packageData.contact || {
        tourOperator: "Travel Compositor",
        phone: "",
        email: "",
        website: "",
      },
      searchMethod: "Holiday Package API",
      micrositeId: actualMicrositeId,
    }

    return NextResponse.json({
      success: true,
      package: transformedPackage,
      rawData: packageData, // Include raw data for debugging
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
