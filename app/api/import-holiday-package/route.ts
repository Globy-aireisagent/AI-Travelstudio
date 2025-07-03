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
    const { packageId, micrositeId, holidayPackageId, config } = await request.json()

    // Use holidayPackageId if provided, otherwise use packageId
    const actualPackageId = holidayPackageId || packageId
    const actualMicrositeId = micrositeId || "1" // Default to microsite 1
    const actualConfig = config || "1"

    console.log(`🏖️ Importing Holiday Package: ${actualPackageId}`)
    console.log(`🔍 Microsite: ${actualMicrositeId}, Config: ${actualConfig}`)

    if (!actualPackageId) {
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
      actualMicrositeId && actualMicrositeId !== "auto"
        ? micrositeConfigs.filter((config) => config.id === actualMicrositeId)
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

        // Try multiple endpoints to find the package
        const endpoints = [
          // Try packages list first
          {
            url: `https://online.travelcompositor.com/resources/packages/${config.micrositeId}?lang=nl`,
            name: "packages list",
            isArray: true,
          },
          // Try travel ideas (often used for packages)
          {
            url: `https://online.travelcompositor.com/resources/travelideas/${config.micrositeId}?lang=nl`,
            name: "travel ideas",
            isArray: true,
          },
          // Try specific package endpoint
          {
            url: `https://online.travelcompositor.com/resources/package/${config.micrositeId}/${actualPackageId}?lang=nl`,
            name: "package detail",
            isArray: false,
          },
          // Try specific travel idea endpoint
          {
            url: `https://online.travelcompositor.com/resources/travelidea/${config.micrositeId}/${actualPackageId}?lang=nl`,
            name: "travel idea detail",
            isArray: false,
          },
        ]

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
              console.log(`✅ ${endpoint.name} response:`, JSON.stringify(data, null, 2))

              if (endpoint.isArray) {
                // Search in array response
                const items = data.packages || data.travelIdeas || data.holidayPackages || data || []
                const found = items.find(
                  (item: any) =>
                    item.id === actualPackageId ||
                    item.packageId === actualPackageId ||
                    item.ideaId === actualPackageId ||
                    item.id?.toString() === actualPackageId,
                )

                if (found) {
                  foundPackage = found
                  searchMethod = `Found in ${config.name} via ${endpoint.name}`
                  break
                }
              } else {
                // Direct response
                if (data && (data.id || data.packageId || data.ideaId)) {
                  foundPackage = data
                  searchMethod = `Found in ${config.name} via ${endpoint.name}`
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

        if (foundPackage) break
      } catch (error) {
        console.log(`❌ Error with ${config.name}:`, error)
        continue
      }
    }

    if (!foundPackage) {
      return NextResponse.json(
        {
          success: false,
          error: `Holiday Package ${actualPackageId} not found in any configured microsite`,
          searchMethod: "Failed - not found in any microsite",
        },
        { status: 404 },
      )
    }

    // Transform the holiday package data for our frontend
    const transformedPackage: HolidayPackage = {
      id: foundPackage.id?.toString() || actualPackageId,
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
