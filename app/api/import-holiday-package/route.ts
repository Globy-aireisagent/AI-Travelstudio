import { type NextRequest, NextResponse } from "next/server"

// Multi-microsite client configuration
const MICROSITE_CONFIGS = [
  {
    id: "primary",
    username: process.env.TRAVEL_COMPOSITOR_USERNAME!,
    password: process.env.TRAVEL_COMPOSITOR_PASSWORD!,
    micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!,
  },
  {
    id: "secondary",
    username: process.env.TRAVEL_COMPOSITOR_USERNAME_2!,
    password: process.env.TRAVEL_COMPOSITOR_PASSWORD_2!,
    micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_2!,
  },
  {
    id: "tertiary",
    username: process.env.TRAVEL_COMPOSITOR_USERNAME_3!,
    password: process.env.TRAVEL_COMPOSITOR_PASSWORD_3!,
    micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3!,
  },
  {
    id: "quaternary",
    username: process.env.TRAVEL_COMPOSITOR_USERNAME_4!,
    password: process.env.TRAVEL_COMPOSITOR_PASSWORD_4!,
    micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_4!,
  },
  {
    id: "quinary",
    username: process.env.TRAVEL_COMPOSITOR_USERNAME_5!,
    password: process.env.TRAVEL_COMPOSITOR_PASSWORD_5!,
    micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_5!,
  },
]

interface HolidayPackageResponse {
  id: string
  name: string
  description: string
  shortDescription: string
  imageUrl: string
  duration: number
  destinations: Array<{
    code: string
    name: string
    fromDay: number
    toDay: number
    country: string
    description: string
    imageUrls: string[]
    geolocation: {
      latitude: number
      longitude: number
    }
    recommendedAirportCode: string
    recommendedAirportName: string
    moreInfoUrl: string
  }>
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

async function searchHolidayPackageInMicrosite(config: any, packageId: string): Promise<HolidayPackageResponse | null> {
  try {
    console.log(`🔍 Searching for holiday package ${packageId} in microsite ${config.id}`)

    // Create authentication header
    const auth = Buffer.from(`${config.username}:${config.password}`).toString("base64")

    // Try to fetch the holiday package
    const response = await fetch(`https://api.travelcompositor.com/v1/packages/${config.micrositeId}/${packageId}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 10000,
    })

    if (!response.ok) {
      console.log(`❌ Holiday package ${packageId} not found in microsite ${config.id}: ${response.status}`)
      return null
    }

    const packageData = await response.json()
    console.log(`✅ Found holiday package ${packageId} in microsite ${config.id}`)

    // Transform the data to ensure all values are serializable
    const transformedPackage: HolidayPackageResponse = {
      id: String(packageData.id || packageId),
      name: String(packageData.name || "Untitled Holiday Package"),
      description: String(packageData.description || ""),
      shortDescription: String(packageData.shortDescription || ""),
      imageUrl: String(packageData.imageUrl || ""),
      duration: Number(packageData.duration || 0),
      destinations: Array.isArray(packageData.destinations)
        ? packageData.destinations.map((dest: any) => ({
            code: String(dest.code || ""),
            name: String(dest.name || ""),
            fromDay: Number(dest.fromDay || 0),
            toDay: Number(dest.toDay || 0),
            country: String(dest.country || ""),
            description: String(dest.description || ""),
            imageUrls: Array.isArray(dest.imageUrls) ? dest.imageUrls.map(String) : [],
            geolocation: {
              latitude: Number(dest.geolocation?.latitude || 0),
              longitude: Number(dest.geolocation?.longitude || 0),
            },
            recommendedAirportCode: String(dest.recommendedAirportCode || ""),
            recommendedAirportName: String(dest.recommendedAirportName || ""),
            moreInfoUrl: String(dest.moreInfoUrl || ""),
          }))
        : [],
      themes: Array.isArray(packageData.themes) ? packageData.themes.map(String) : [],
      priceFrom: {
        amount: Number(packageData.priceFrom?.amount || 0),
        currency: String(packageData.priceFrom?.currency || "EUR"),
      },
      pricePerPerson: {
        amount: Number(packageData.pricePerPerson?.amount || 0),
        currency: String(packageData.pricePerPerson?.currency || "EUR"),
      },
      totalPrice: {
        amount: Number(packageData.totalPrice?.amount || 0),
        currency: String(packageData.totalPrice?.currency || "EUR"),
      },
      departureDate: String(packageData.departureDate || ""),
      returnDate: String(packageData.returnDate || ""),
      availability: {
        available: Boolean(packageData.availability?.available ?? true),
        spotsLeft: Number(packageData.availability?.spotsLeft || 0),
        totalSpots: Number(packageData.availability?.totalSpots || 0),
      },
      inclusions: Array.isArray(packageData.inclusions) ? packageData.inclusions.map(String) : [],
      exclusions: Array.isArray(packageData.exclusions) ? packageData.exclusions.map(String) : [],
      itinerary: Array.isArray(packageData.itinerary)
        ? packageData.itinerary.map((day: any) => ({
            day: Number(day.day || 0),
            title: String(day.title || ""),
            description: String(day.description || ""),
            activities: Array.isArray(day.activities) ? day.activities.map(String) : [],
            accommodation: String(day.accommodation || ""),
            meals: Array.isArray(day.meals) ? day.meals.map(String) : [],
          }))
        : [],
      accommodations: Array.isArray(packageData.accommodations)
        ? packageData.accommodations.map((acc: any) => ({
            name: String(acc.name || ""),
            type: String(acc.type || ""),
            category: Number(acc.category || 0),
            location: String(acc.location || ""),
            description: String(acc.description || ""),
            amenities: Array.isArray(acc.amenities) ? acc.amenities.map(String) : [],
            images: Array.isArray(acc.images) ? acc.images.map(String) : [],
          }))
        : [],
      transports: Array.isArray(packageData.transports)
        ? packageData.transports.map((transport: any) => ({
            type: String(transport.type || ""),
            from: String(transport.from || ""),
            to: String(transport.to || ""),
            date: String(transport.date || ""),
            time: String(transport.time || ""),
            duration: String(transport.duration || ""),
            company: String(transport.company || ""),
          }))
        : [],
      activities: Array.isArray(packageData.activities)
        ? packageData.activities.map((activity: any) => ({
            name: String(activity.name || ""),
            type: String(activity.type || ""),
            description: String(activity.description || ""),
            duration: String(activity.duration || ""),
            included: Boolean(activity.included),
            price: activity.price
              ? {
                  amount: Number(activity.price.amount || 0),
                  currency: String(activity.price.currency || "EUR"),
                }
              : undefined,
          }))
        : [],
      bookingConditions: {
        cancellationPolicy: String(packageData.bookingConditions?.cancellationPolicy || "Standard cancellation policy"),
        paymentTerms: String(packageData.bookingConditions?.paymentTerms || "Payment required at booking"),
        minimumAge: Number(packageData.bookingConditions?.minimumAge || 0),
        maximumGroupSize: Number(packageData.bookingConditions?.maximumGroupSize || 50),
        requiredDocuments: Array.isArray(packageData.bookingConditions?.requiredDocuments)
          ? packageData.bookingConditions.requiredDocuments.map(String)
          : ["Valid passport"],
      },
      contact: {
        tourOperator: String(packageData.contact?.tourOperator || "Travel Compositor"),
        phone: String(packageData.contact?.phone || ""),
        email: String(packageData.contact?.email || ""),
        website: String(packageData.contact?.website || ""),
      },
    }

    return transformedPackage
  } catch (error) {
    console.error(`❌ Error searching holiday package ${packageId} in microsite ${config.id}:`, error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { packageId } = body

    if (!packageId) {
      return NextResponse.json({ error: "Package ID is required" }, { status: 400 })
    }

    console.log(`🔍 Starting holiday package search for: ${packageId}`)

    // Search through all microsites
    for (const config of MICROSITE_CONFIGS) {
      if (!config.username || !config.password || !config.micrositeId) {
        console.log(`⚠️ Skipping microsite ${config.id} - missing credentials`)
        continue
      }

      const packageData = await searchHolidayPackageInMicrosite(config, packageId)

      if (packageData) {
        // Add search metadata
        const enrichedPackage = {
          ...packageData,
          searchMethod: `Travel Compositor API (${config.id})`,
          searchTimestamp: new Date().toISOString(),
          micrositeId: config.micrositeId,
        }

        console.log(`✅ Holiday package import successful from microsite ${config.id}`)

        return NextResponse.json({
          success: true,
          data: enrichedPackage,
          message: `Holiday package ${packageId} successfully imported from ${config.id} microsite`,
          source: `Travel Compositor API (${config.id})`,
        })
      }
    }

    // If not found in any microsite, create a mock package for testing
    console.log(`❌ Holiday package ${packageId} not found in any microsite, creating mock data`)

    const mockPackage: HolidayPackageResponse = {
      id: packageId,
      name: `Holiday Package ${packageId}`,
      description:
        "This is a mock holiday package created for testing purposes. The actual package was not found in the Travel Compositor system.",
      shortDescription: "Mock holiday package for testing",
      imageUrl: "/placeholder.svg?height=400&width=600&text=Holiday+Package",
      duration: 7,
      destinations: [
        {
          code: "DEST001",
          name: "Beautiful Destination",
          fromDay: 1,
          toDay: 7,
          country: "Example Country",
          description: "A beautiful destination for your holiday",
          imageUrls: ["/placeholder.svg?height=300&width=400&text=Destination"],
          geolocation: {
            latitude: 52.3676,
            longitude: 4.9041,
          },
          recommendedAirportCode: "AMS",
          recommendedAirportName: "Amsterdam Airport Schiphol",
          moreInfoUrl: "https://example.com",
        },
      ],
      themes: ["Adventure", "Culture", "Relaxation"],
      priceFrom: {
        amount: 1299,
        currency: "EUR",
      },
      pricePerPerson: {
        amount: 1299,
        currency: "EUR",
      },
      totalPrice: {
        amount: 2598,
        currency: "EUR",
      },
      departureDate: "2024-06-15",
      returnDate: "2024-06-22",
      availability: {
        available: true,
        spotsLeft: 8,
        totalSpots: 20,
      },
      inclusions: [
        "Round-trip flights",
        "7 nights accommodation",
        "Daily breakfast",
        "Airport transfers",
        "Local guide services",
      ],
      exclusions: ["Travel insurance", "Personal expenses", "Optional excursions", "Meals not mentioned"],
      itinerary: [
        {
          day: 1,
          title: "Arrival Day",
          description: "Arrive at destination and check into hotel",
          activities: ["Airport transfer", "Hotel check-in", "Welcome dinner"],
          accommodation: "Hotel Example",
          meals: ["Dinner"],
        },
        {
          day: 2,
          title: "City Tour",
          description: "Explore the main attractions of the city",
          activities: ["City walking tour", "Museum visit", "Local market"],
          accommodation: "Hotel Example",
          meals: ["Breakfast", "Lunch"],
        },
      ],
      accommodations: [
        {
          name: "Hotel Example",
          type: "Hotel",
          category: 4,
          location: "City Center",
          description: "A comfortable 4-star hotel in the heart of the city",
          amenities: ["WiFi", "Pool", "Restaurant", "Gym", "Spa"],
          images: ["/placeholder.svg?height=200&width=300&text=Hotel"],
        },
      ],
      transports: [
        {
          type: "Flight",
          from: "Amsterdam (AMS)",
          to: "Destination Airport",
          date: "2024-06-15",
          time: "10:00",
          duration: "2h 30m",
          company: "Example Airlines",
        },
      ],
      activities: [
        {
          name: "City Walking Tour",
          type: "Cultural",
          description: "Guided walking tour of the historic city center",
          duration: "3 hours",
          included: true,
        },
        {
          name: "Optional Boat Trip",
          type: "Leisure",
          description: "Scenic boat trip along the coast",
          duration: "2 hours",
          included: false,
          price: {
            amount: 45,
            currency: "EUR",
          },
        },
      ],
      bookingConditions: {
        cancellationPolicy:
          "Free cancellation up to 14 days before departure. 50% refund up to 7 days before departure.",
        paymentTerms: "25% deposit required at booking, full payment 30 days before departure.",
        minimumAge: 18,
        maximumGroupSize: 20,
        requiredDocuments: ["Valid passport", "Travel insurance"],
      },
      contact: {
        tourOperator: "Example Travel Company",
        phone: "+31 20 123 4567",
        email: "info@exampletravel.com",
        website: "https://www.exampletravel.com",
      },
    }

    const enrichedMockPackage = {
      ...mockPackage,
      searchMethod: "Mock Data (Testing)",
      searchTimestamp: new Date().toISOString(),
      micrositeId: "mock",
    }

    return NextResponse.json({
      success: true,
      data: enrichedMockPackage,
      message: `Mock holiday package ${packageId} created for testing`,
      source: "Mock Data (Testing)",
      warning: "This is mock data - the actual package was not found in Travel Compositor",
    })
  } catch (error) {
    console.error("❌ Holiday package import error:", error)
    return NextResponse.json(
      {
        error: "Failed to import holiday package",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
