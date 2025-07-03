import { type NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { micrositeId: string; holidayPackageId: string } },
) {
  try {
    const { searchParams } = new URL(request.url)
    const config = searchParams.get("config") || "1"
    const { micrositeId, holidayPackageId } = params

    console.log(`🏖️ Getting holiday package: ${holidayPackageId} from microsite: ${micrositeId}`)

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

    console.log(`🔑 Authentication successful`)

    // Try different endpoints to find the package
    const endpoints = [
      {
        url: `https://online.travelcompositor.com/resources/package/${actualMicrositeId}/${holidayPackageId}?lang=nl`,
        name: "package detail",
      },
      {
        url: `https://online.travelcompositor.com/resources/travelidea/${actualMicrositeId}/${holidayPackageId}?lang=nl`,
        name: "travel idea detail",
      },
      {
        url: `https://online.travelcompositor.com/resources/packages/${actualMicrositeId}?lang=nl`,
        name: "packages list",
      },
      {
        url: `https://online.travelcompositor.com/resources/travelideas/${actualMicrositeId}?lang=nl`,
        name: "travel ideas list",
      },
    ]

    let foundPackage: any = null
    let usedEndpoint = ""

    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 Trying ${endpoint.name}: ${endpoint.url}`)

        const response = await fetch(endpoint.url, {
          method: "GET",
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`✅ ${endpoint.name} response received`)

          if (endpoint.name.includes("list")) {
            // Search in array response
            const items = data.packages || data.travelIdeas || data.holidayPackages || data || []
            const found = items.find(
              (item: any) =>
                item.id === holidayPackageId ||
                item.packageId === holidayPackageId ||
                item.ideaId === holidayPackageId ||
                item.id?.toString() === holidayPackageId,
            )

            if (found) {
              foundPackage = found
              usedEndpoint = endpoint.name
              break
            }
          } else {
            // Direct response
            if (data && (data.id || data.packageId || data.ideaId)) {
              foundPackage = data
              usedEndpoint = endpoint.name
              break
            }
          }
        } else {
          console.log(`❌ ${endpoint.name} failed: ${response.status}`)
        }
      } catch (error) {
        console.log(`❌ ${endpoint.name} error:`, error)
        continue
      }
    }

    if (!foundPackage) {
      return NextResponse.json(
        {
          success: false,
          error: `Holiday Package ${holidayPackageId} not found in microsite ${micrositeId}`,
        },
        { status: 404 },
      )
    }

    // Transform the package data
    const transformedPackage = {
      id: foundPackage.id?.toString() || holidayPackageId,
      name: foundPackage.name || foundPackage.title || "Untitled Holiday Package",
      description: foundPackage.description || foundPackage.longDescription || "",
      shortDescription: foundPackage.shortDescription || foundPackage.summary || "",
      imageUrl: foundPackage.imageUrl || foundPackage.mainImage || foundPackage.image || "",
      duration: foundPackage.duration || foundPackage.numberOfDays || foundPackage.days || 0,
      destinations: foundPackage.destinations || foundPackage.countries || [],
      themes: foundPackage.themes || foundPackage.categories || [],
      priceFrom: foundPackage.priceFrom || foundPackage.price || { amount: 0, currency: "EUR" },
      pricePerPerson: foundPackage.pricePerPerson || { amount: 0, currency: "EUR" },
      totalPrice: foundPackage.totalPrice || foundPackage.price || { amount: 0, currency: "EUR" },
      departureDate: foundPackage.departureDate || "",
      returnDate: foundPackage.returnDate || "",
      availability: foundPackage.availability || {
        available: true,
        spotsLeft: 0,
        totalSpots: 0,
      },
      inclusions: foundPackage.inclusions || foundPackage.included || [],
      exclusions: foundPackage.exclusions || foundPackage.notIncluded || [],
      itinerary: foundPackage.itinerary || foundPackage.dayByDay || [],
      accommodations: foundPackage.accommodations || foundPackage.hotels || [],
      transports: foundPackage.transports || foundPackage.flights || [],
      activities: foundPackage.activities || foundPackage.excursions || [],
      bookingConditions: foundPackage.bookingConditions || {
        cancellationPolicy: "Standard cancellation policy",
        paymentTerms: "Payment required at booking",
        minimumAge: 0,
        maximumGroupSize: 50,
        requiredDocuments: ["Valid passport"],
      },
      contact: foundPackage.contact || {
        tourOperator: "Travel Compositor",
        phone: "",
        email: "",
        website: "",
      },
    }

    console.log(`✅ Holiday Package found: ${transformedPackage.name}`)

    return NextResponse.json({
      success: true,
      package: transformedPackage,
      usedEndpoint,
      originalData: foundPackage,
    })
  } catch (error) {
    console.error("❌ Error getting holiday package:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
