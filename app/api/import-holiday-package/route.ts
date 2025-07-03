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
    const { micrositeId, holidayPackageId, config = "1" } = await request.json()

    console.log(`📦 Importing holiday package: ${holidayPackageId} from microsite: ${micrositeId}`)

    if (!micrositeId || !holidayPackageId) {
      return NextResponse.json({ success: false, error: "Missing micrositeId or holidayPackageId" }, { status: 400 })
    }

    // Call our API endpoint to get the package data
    const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_BASE_URL || "http://localhost:3000"
    const apiUrl = `${baseUrl}/api/travel-compositor/packages/${micrositeId}/${holidayPackageId}?config=${config}`

    console.log(`🔗 Calling API: ${apiUrl}`)

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `API call failed: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || "Failed to fetch holiday package")
    }

    console.log("✅ Holiday package imported successfully:", data.package.name)

    return NextResponse.json({
      success: true,
      package: data.package,
      message: `Holiday package "${data.package.name}" imported successfully`,
      usedEndpoint: data.usedEndpoint,
    })
  } catch (error) {
    console.error("❌ Error importing holiday package:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
