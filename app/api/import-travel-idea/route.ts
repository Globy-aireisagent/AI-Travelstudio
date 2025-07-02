import { type NextRequest, NextResponse } from "next/server"

interface TravelIdea {
  id: number
  user: string
  email: string
  title: string
  largeTitle: string
  description: string
  remarks: string
  imageUrl: string
  creationDate: string
  departureDate: string
  ideaUrl: string
  externalReference: string
  themes: string[]
  pricePerPerson: {
    amount: number
    currency: string
  }
  totalPrice: {
    amount: number
    currency: string
  }
  ribbonText: string
  destinations: Array<{
    type: string
    code: string
    name: string
    nextLocationDistance: string
    fromDay?: number
    toDay?: number
    country?: string
    description?: string
    imageUrls?: string[]
    geolocation?: {
      latitude: number
      longitude: number
    }
  }>
  itinerary: Array<{
    type: string
    code: string
    name: string
    nextLocationDistance: string
  }>
  userB2c: boolean
  customer: {
    courtesyTitle: string
    name: string
    lastName: string
    birthDate: string
    documentNumber: string
    documentType: string
    email: string
    phoneCountry: {
      id: string
      name: string
    }
    phoneNumber: string
  }
  counters: {
    adults: number
    children: number
    destinations: number
    closedTours: number
    hotelNights: number
    transports: number
    hotels: number
    cars: number
    tickets: number
    transfers: number
    insurances: number
    manuals: number
    cruises: number
    rideHailings: number
  }
  // Extended data from detailed endpoint
  tripSpots?: any[]
  closedTours?: any[]
  transports?: any[]
  transfers?: any[]
  hotels?: any[]
  tickets?: any[]
  cars?: any[]
  insurances?: any[]
  manuals?: any[]
  cruises?: any[]
  rideHailing?: any
}

export async function POST(request: NextRequest) {
  try {
    const { ideaId, micrositeId } = await request.json()

    console.log(`🔍 Importing Travel Idea: ${ideaId}`)
    console.log(`🔍 Microsite preference: ${micrositeId || "auto"}`)

    if (!ideaId) {
      return NextResponse.json({ success: false, error: "Travel Idea ID is required" }, { status: 400 })
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

    let foundIdea: TravelIdea | null = null
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

        // Try to get the travel idea
        const ideaResponse = await fetch(
          `https://online.travelcompositor.com/resources/travelidea/${config.micrositeId}/${ideaId}?lang=nl`,
          {
            method: "GET",
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        )

        if (ideaResponse.ok) {
          const ideaData = await ideaResponse.json()
          console.log(`✅ Found travel idea in ${config.name}!`)

          foundIdea = ideaData
          searchMethod = `Found in ${config.name}`
          break
        } else {
          console.log(`❌ Travel idea not found in ${config.name}: ${ideaResponse.status}`)
        }
      } catch (error) {
        console.log(`❌ Error with ${config.name}:`, error)
        continue
      }
    }

    if (!foundIdea) {
      return NextResponse.json(
        {
          success: false,
          error: `Travel Idea ${ideaId} not found in any configured microsite`,
          searchMethod: "Failed - not found in any microsite",
        },
        { status: 404 },
      )
    }

    // Transform the travel idea data for our frontend
    const transformedIdea = {
      id: foundIdea.id?.toString() || ideaId,
      originalIdeaId: ideaId,
      title: foundIdea.title || foundIdea.largeTitle || "Untitled Travel Idea",
      description: foundIdea.description || "",
      remarks: foundIdea.remarks || "",
      imageUrl: foundIdea.imageUrl || "",
      creationDate: foundIdea.creationDate || "",
      departureDate: foundIdea.departureDate || "",
      ideaUrl: foundIdea.ideaUrl || "",
      themes: foundIdea.themes || [],
      pricePerPerson: foundIdea.pricePerPerson || { amount: 0, currency: "EUR" },
      totalPrice: foundIdea.totalPrice || { amount: 0, currency: "EUR" },
      ribbonText: foundIdea.ribbonText || "",
      destinations: foundIdea.destinations || [],
      itinerary: foundIdea.itinerary || [],
      customer: foundIdea.customer || {
        name: "Unknown",
        lastName: "",
        email: "",
        phoneNumber: "",
      },
      counters: foundIdea.counters || {
        adults: 0,
        children: 0,
        destinations: 0,
        hotels: 0,
        transports: 0,
        tickets: 0,
        cars: 0,
      },
      // Extended data
      tripSpots: foundIdea.tripSpots || [],
      closedTours: foundIdea.closedTours || [],
      transports: foundIdea.transports || [],
      transfers: foundIdea.transfers || [],
      hotels: foundIdea.hotels || [],
      tickets: foundIdea.tickets || [],
      cars: foundIdea.cars || [],
      insurances: foundIdea.insurances || [],
      manuals: foundIdea.manuals || [],
      cruises: foundIdea.cruises || [],
      searchMethod,
    }

    console.log(`✅ Travel Idea import successful: ${transformedIdea.title}`)

    return NextResponse.json({
      success: true,
      idea: transformedIdea,
      searchMethod,
      originalData: foundIdea, // For debugging
    })
  } catch (error) {
    console.error("❌ Travel Idea import error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
