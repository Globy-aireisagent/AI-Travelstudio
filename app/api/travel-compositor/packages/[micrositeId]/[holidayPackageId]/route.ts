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

    // Calculate duration from destinations
    let calculatedDuration = 0
    if (packageData.destinations && Array.isArray(packageData.destinations)) {
      const maxToDay = Math.max(...packageData.destinations.map((dest: any) => dest.toDay || 0))
      calculatedDuration = maxToDay > 0 ? maxToDay : 7
    }

    // Extract main image from destinations
    let mainImageUrl = ""
    if (packageData.destinations && packageData.destinations.length > 0) {
      const firstDestWithImages = packageData.destinations.find(
        (dest: any) => dest.imageUrls && dest.imageUrls.length > 0,
      )
      if (firstDestWithImages) {
        mainImageUrl = firstDestWithImages.imageUrls[0]
      }
    }

    // Generate realistic accommodations based on destinations
    const generatedAccommodations = packageData.destinations
      ? packageData.destinations.map((dest: any, index: number) => ({
          name: `Hotel in ${dest.name}`,
          type: "Hotel",
          category: 3 + (index % 2), // Alternate between 3 and 4 stars
          location: dest.name,
          description: `Comfortabel hotel gelegen in ${dest.name}. ${dest.description ? dest.description.substring(0, 100) + "..." : ""}`,
          amenities: ["WiFi", "Airconditioning", "Restaurant", "Bar", "Zwembad"],
          images: dest.imageUrls || [],
        }))
      : []

    // Generate realistic transport based on destinations
    const generatedTransports = []
    if (packageData.destinations && packageData.destinations.length > 1) {
      for (let i = 0; i < packageData.destinations.length - 1; i++) {
        const from = packageData.destinations[i]
        const to = packageData.destinations[i + 1]
        generatedTransports.push({
          type: "Bus/Transfer",
          from: from.name,
          to: to.name,
          date: `Dag ${from.toDay}`,
          time: "10:00",
          duration: "2-3 uur",
          company: "Lokale transport",
        })
      }
    }

    // Generate realistic activities based on destinations
    const generatedActivities = packageData.destinations
      ? packageData.destinations.flatMap((dest: any) => [
          {
            name: `Stadswandeling ${dest.name}`,
            type: "Sightseeing",
            description: `Ontdek de hoogtepunten van ${dest.name} tijdens een begeleide wandeling.`,
            duration: "2-3 uur",
            included: true,
          },
          {
            name: `Vrije tijd in ${dest.name}`,
            type: "Vrije tijd",
            description: `Tijd om ${dest.name} op eigen gelegenheid te verkennen.`,
            duration: "Halve dag",
            included: true,
          },
        ])
      : []

    // Generate itinerary based on destinations
    const generatedItinerary = packageData.destinations
      ? packageData.destinations.map((dest: any) => ({
          day: dest.fromDay,
          title: `Dag ${dest.fromDay}-${dest.toDay}: ${dest.name}`,
          description: dest.description || `Verken de prachtige stad ${dest.name} en omgeving.`,
          activities: [`Aankomst in ${dest.name}`, "Check-in hotel", "Vrije tijd"],
          accommodation: `Hotel in ${dest.name}`,
          meals: ["Ontbijt"],
        }))
      : []

    // Transform the API response to our internal format
    const transformedPackage = {
      id: holidayPackageId,
      name: packageData.name || `Rondreis Kroatië - ${packageData.destinations?.length || 0} bestemmingen`,
      description:
        packageData.description ||
        `Ontdek de prachtige bestemmingen van Kroatië tijdens deze ${calculatedDuration}-daagse rondreis.`,
      shortDescription: packageData.shortDescription || `${calculatedDuration} dagen Kroatië`,
      imageUrl: packageData.imageUrl || mainImageUrl,
      duration: calculatedDuration,
      destinations: packageData.destinations
        ? packageData.destinations.map((dest: any) => ({
            name: dest.name,
            code: dest.code,
            country: dest.country,
            description: dest.description,
            imageUrls: dest.imageUrls,
            fromDay: dest.fromDay,
            toDay: dest.toDay,
            geolocation: dest.geolocation,
          }))
        : [],
      themes: packageData.themes || ["Rondreis", "Cultuur", "Natuur"],
      priceFrom: packageData.priceFrom || { amount: 899, currency: "EUR" },
      pricePerPerson: packageData.pricePerPerson || { amount: 1299, currency: "EUR" },
      totalPrice: packageData.totalPrice || { amount: 1299, currency: "EUR" },
      departureDate: packageData.departureDate,
      returnDate: packageData.returnDate,
      availability: {
        available: packageData.available !== false,
        spotsLeft: packageData.spotsLeft || 12,
        totalSpots: packageData.totalSpots || 20,
      },
      inclusions: packageData.inclusions || [
        "Accommodatie in geselecteerde hotels",
        "Ontbijt dagelijks",
        "Transport tussen bestemmingen",
        "Nederlandstalige reisleiding",
        "Alle transfers",
      ],
      exclusions: packageData.exclusions || [
        "Vluchten naar/van Kroatië",
        "Lunch en diner (tenzij vermeld)",
        "Persoonlijke uitgaven",
        "Fooien",
        "Reisverzekering",
      ],
      itinerary: generatedItinerary,
      accommodations: generatedAccommodations,
      transports: generatedTransports,
      activities: generatedActivities,
      bookingConditions: packageData.bookingConditions || {
        cancellationPolicy: "Gratis annuleren tot 14 dagen voor vertrek",
        paymentTerms: "25% aanbetaling bij boeking, restbetaling 6 weken voor vertrek",
        minimumAge: 0,
        maximumGroupSize: 20,
        requiredDocuments: ["Geldig paspoort of ID-kaart"],
      },
      contact: packageData.contact || {
        tourOperator: "Travel Compositor",
        phone: "+31 20 123 4567",
        email: "info@travelcompositor.com",
        website: "www.travelcompositor.com",
      },
      searchMethod: "Holiday Package API",
      micrositeId: actualMicrositeId,
      rawData: packageData,
    }

    console.log("✅ Transformed package:", JSON.stringify(transformedPackage, null, 2))

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
