import { type NextRequest, NextResponse } from "next/server"

interface HolidayPackage {
  id: string
  name: string
  description: string
  shortDescription: string
  imageUrl: string
  duration: number
  destinations: string[]
  themes: string[]
  priceFrom: {
    amount: number
    currency: string
  }
  pricePerPerson: {
    amount: number
    currency: string
  }
  totalPrice: {
    amount: number
    currency: string
  }
  departureDate: string
  returnDate: string
  availability: {
    available: boolean
    spotsLeft: number
    totalSpots: number
  }
  inclusions: string[]
  exclusions: string[]
  itinerary: Array<{
    day: number
    title: string
    description: string
    activities: string[]
    accommodation: string
    meals: string[]
  }>
  accommodations: Array<{
    name: string
    type: string
    category: number
    location: string
    description: string
    amenities: string[]
    images: string[]
  }>
  transports: Array<{
    type: string
    from: string
    to: string
    date: string
    time: string
    duration: string
    company: string
  }>
  activities: Array<{
    name: string
    type: string
    description: string
    duration: string
    included: boolean
    price?: {
      amount: number
      currency: string
    }
  }>
  bookingConditions: {
    cancellationPolicy: string
    paymentTerms: string
    minimumAge: number
    maximumGroupSize: number
    requiredDocuments: string[]
  }
  contact: {
    tourOperator: string
    phone: string
    email: string
    website: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const { packageId, micrositeId } = await request.json()

    console.log(`🏖️ Importing Holiday Package: ${packageId}`)
    console.log(`🔍 Microsite preference: ${micrositeId || "auto"}`)

    if (!packageId) {
      return NextResponse.json({ success: false, error: "Holiday Package ID is required" }, { status: 400 })
    }

    // Get credentials for different microsites
    const micrositeConfigs = [
      {
        id: "1",
        name: "rondreis-planner",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID,
      },
      {
        id: "2",
        name: "reisbureaunederland",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_2,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_2,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_2,
      },
      {
        id: "3",
        name: "auto",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_3,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_3,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3,
      },
      {
        id: "4",
        name: "microsite-4",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_4,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_4,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_4,
      },
    ]

    // Filter configs based on user preference
    const configsToTry =
      micrositeId && micrositeId !== "auto"
        ? micrositeConfigs.filter((config) => config.id === micrositeId)
        : micrositeConfigs

    let foundPackage: any = null
    let searchMethod = ""

    // Try each microsite configuration
    for (const config of configsToTry) {
      if (!config.username || !config.password || !config.micrositeId) {
        console.log(`⚠️ Skipping config ${config.id} - missing credentials`)
        continue
      }

      try {
        console.log(`🔍 Trying microsite ${config.name} (${config.id})...`)

        // Authenticate
        const authResponse = await fetch("https://online.travelcompositor.com/resources/authentication/authenticate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            username: config.username,
            password: config.password,
            micrositeId: config.micrositeId,
          }),
        })

        if (!authResponse.ok) {
          console.log(`❌ Auth failed for ${config.name}: ${authResponse.status}`)
          continue
        }

        const authData = await authResponse.json()
        const token = authData.token

        if (!token) {
          console.log(`❌ No token received for ${config.name}`)
          continue
        }

        // Try to get the holiday package
        const packageResponse = await fetch(
          `https://online.travelcompositor.com/resources/package/${config.micrositeId}/${packageId}?lang=nl`,
          {
            method: "GET",
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        )

        if (packageResponse.ok) {
          const packageData = await packageResponse.json()
          console.log(`✅ Found holiday package in ${config.name}!`)

          // Also try to get calendar/availability data
          try {
            const calendarResponse = await fetch(
              `https://online.travelcompositor.com/resources/package/calendar/${config.micrositeId}/${packageId}?currency=EUR`,
              {
                method: "GET",
                headers: {
                  "auth-token": token,
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
              },
            )

            if (calendarResponse.ok) {
              const calendarData = await calendarResponse.json()
              packageData.calendar = calendarData
              console.log(`✅ Also found calendar data for package`)
            }
          } catch (error) {
            console.log(`⚠️ Could not fetch calendar data: ${error}`)
          }

          foundPackage = packageData
          searchMethod = `Found in ${config.name}`
          break
        } else {
          console.log(`❌ Holiday package not found in ${config.name}: ${packageResponse.status}`)
        }
      } catch (error) {
        console.log(`❌ Error with ${config.name}:`, error)
        continue
      }
    }

    if (!foundPackage) {
      return NextResponse.json(
        {
          success: false,
          error: `Holiday Package ${packageId} not found in any configured microsite`,
          searchMethod: "Failed - not found in any microsite",
        },
        { status: 404 },
      )
    }

    // Transform the holiday package data for our frontend
    const transformedPackage: HolidayPackage = {
      id: foundPackage.id?.toString() || packageId,
      name: foundPackage.name || foundPackage.title || "Untitled Holiday Package",
      description: foundPackage.description || foundPackage.longDescription || "",
      shortDescription: foundPackage.shortDescription || foundPackage.summary || "",
      imageUrl: foundPackage.imageUrl || foundPackage.mainImage || "",
      duration: foundPackage.duration || foundPackage.numberOfDays || 0,
      destinations: foundPackage.destinations || foundPackage.countries || [],
      themes: foundPackage.themes || foundPackage.categories || [],
      priceFrom: foundPackage.priceFrom || { amount: 0, currency: "EUR" },
      pricePerPerson: foundPackage.pricePerPerson || { amount: 0, currency: "EUR" },
      totalPrice: foundPackage.totalPrice || { amount: 0, currency: "EUR" },
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

    console.log(`✅ Holiday Package import successful: ${transformedPackage.name}`)

    return NextResponse.json({
      success: true,
      package: transformedPackage,
      searchMethod,
      originalData: foundPackage, // For debugging
    })
  } catch (error) {
    console.error("❌ Holiday Package import error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
