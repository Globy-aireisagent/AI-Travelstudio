import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

// Mapping van microsite namen naar configuratie nummers
const MICROSITE_CONFIG_MAPPING = {
  "rondreis-planner": 1,
  reisbureaunederland: 2,
  auto: 3,
  "microsite-4": 4,
}

// Verbeterde error handling en logging
export async function POST(request: NextRequest) {
  try {
    const { bookingId, micrositeId } = await request.json()

    console.log(`🔍 Analyzing booking fields for: ${bookingId} in microsite: ${micrositeId || "all microsites"}`)

    let booking = null
    let foundInMicrosite = null

    try {
      if (micrositeId && micrositeId !== "all") {
        // Search in specific microsite
        console.log(`Searching in specific microsite: ${micrositeId}`)
        const configNumber = MICROSITE_CONFIG_MAPPING[micrositeId as keyof typeof MICROSITE_CONFIG_MAPPING]

        if (!configNumber) {
          throw new Error(`Unknown microsite: ${micrositeId}`)
        }

        const client = createTravelCompositorClient(configNumber)
        booking = await client.getBooking(bookingId)
        foundInMicrosite = micrositeId
      } else {
        // Search across all microsites
        console.log("Searching across all microsites")
        const searchResult = await searchBookingAcrossAllMicrosites(bookingId)
        booking = searchResult.booking
        foundInMicrosite = searchResult.foundInMicrosite

        if (booking) {
          console.log(`✅ Found booking in microsite: ${foundInMicrosite}`)
        }
      }
    } catch (clientError) {
      console.error("Error fetching booking:", clientError)
      return NextResponse.json({
        success: false,
        error: `Error fetching booking: ${clientError instanceof Error ? clientError.message : String(clientError)}`,
      })
    }

    if (!booking) {
      return NextResponse.json({
        success: false,
        error: `Booking ${bookingId} not found in ${micrositeId || "any microsite"}`,
      })
    }

    // Analyze all available fields in the booking
    const analysis = {
      bookingStructure: analyzeObjectStructure(booking, "booking"),
      serviceTypes: {},
      missingFields: [],
      recommendations: [],
      foundInMicrosite,
    }

    // Analyze each service type
    const serviceTypes = [
      "hotelservice",
      "transportservice",
      "ticketservice",
      "transferservice",
      "carservice",
      "closedtourservice",
      "cruiseservice",
      "insuranceservice",
    ]

    serviceTypes.forEach((serviceType) => {
      if (booking[serviceType] && Array.isArray(booking[serviceType]) && booking[serviceType].length > 0) {
        analysis.serviceTypes[serviceType] = {
          count: booking[serviceType].length,
          sampleFields: analyzeObjectStructure(booking[serviceType][0], serviceType),
          allSamples: booking[serviceType].map((service: any, index: number) => ({
            index,
            fields: Object.keys(service),
            sampleData: extractSampleData(service),
          })),
        }
      }
    })

    // Deep search for specific fields we're interested in
    const deepSearchResults = deepSearchForFields(booking, [
      "images",
      "photos",
      "imageUrl",
      "imageUrls",
      "gallery",
      "supplier",
      "provider",
      "vendor",
      "operator",
      "baggage",
      "baggageInfo",
      "luggage",
      "checkedBaggage",
      "handBaggage",
    ])

    analysis.deepSearchResults = deepSearchResults

    // Check for common missing fields
    analysis.missingFields = findMissingFields(booking)
    analysis.recommendations = generateRecommendations(analysis)

    console.log(`✅ Analysis complete for ${bookingId}`)

    return NextResponse.json({
      success: true,
      bookingId,
      foundInMicrosite,
      analysis,
      rawBooking: booking, // Include raw data for inspection
    })
  } catch (error) {
    console.error("❌ Error analyzing booking fields:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

async function searchBookingAcrossAllMicrosites(bookingId: string) {
  console.log(`🔍 Searching for booking ${bookingId} across all microsites`)

  // Try each microsite configuration in sequence
  for (const [micrositeName, configNumber] of Object.entries(MICROSITE_CONFIG_MAPPING)) {
    try {
      console.log(`Checking microsite: ${micrositeName} (config ${configNumber})`)

      const client = createTravelCompositorClient(configNumber)
      const booking = await client.getBooking(bookingId)

      if (booking) {
        console.log(`✅ Found booking in microsite: ${micrositeName}`)
        return {
          booking,
          foundInMicrosite: micrositeName,
        }
      }
    } catch (error) {
      console.log(`❌ Booking not found in microsite ${micrositeName}:`, error)
      // Continue to next microsite
    }
  }

  // If we get here, the booking wasn't found in any microsite
  console.log(`❌ Booking ${bookingId} not found in any microsite`)
  return {
    booking: null,
    foundInMicrosite: null,
  }
}

function analyzeObjectStructure(obj: any, prefix = ""): any {
  if (!obj || typeof obj !== "object") {
    return { type: typeof obj, value: obj }
  }

  const structure: any = {}

  Object.keys(obj).forEach((key) => {
    const value = obj[key]

    if (Array.isArray(value)) {
      structure[key] = {
        type: "array",
        length: value.length,
        sampleItem: value.length > 0 ? analyzeObjectStructure(value[0], `${prefix}.${key}[0]`) : null,
      }
    } else if (value && typeof value === "object") {
      structure[key] = {
        type: "object",
        fields: Object.keys(value),
        structure: analyzeObjectStructure(value, `${prefix}.${key}`),
      }
    } else {
      structure[key] = {
        type: typeof value,
        value: value,
        hasValue: value !== null && value !== undefined && value !== "",
      }
    }
  })

  return structure
}

function deepSearchForFields(obj: any, targetFields: string[], path = "", results: any = {}): any {
  if (!obj || typeof obj !== "object") {
    return results
  }

  // Check if this is an array
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      deepSearchForFields(item, targetFields, `${path}[${index}]`, results)
    })
    return results
  }

  // Check each property of the object
  Object.keys(obj).forEach((key) => {
    const currentPath = path ? `${path}.${key}` : key
    const value = obj[key]

    // Check if this key is one we're looking for
    const lowerKey = key.toLowerCase()
    for (const targetField of targetFields) {
      if (lowerKey.includes(targetField.toLowerCase())) {
        if (!results[targetField]) {
          results[targetField] = []
        }
        results[targetField].push({
          path: currentPath,
          value: value,
          type: typeof value,
          isArray: Array.isArray(value),
          isEmpty:
            value === null ||
            value === undefined ||
            value === "" ||
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0),
        })
      }
    }

    // Recursively search nested objects and arrays
    if (value && typeof value === "object") {
      deepSearchForFields(value, targetFields, currentPath, results)
    }
  })

  return results
}

function extractSampleData(service: any): any {
  const sample: any = {}

  // Extract key fields that might contain supplier, images, baggage info
  const keyFields = [
    "supplier",
    "provider",
    "vendor",
    "operator",
    "images",
    "imageUrl",
    "imageUrls",
    "photos",
    "gallery",
    "baggage",
    "baggageInfo",
    "luggage",
    "checkedBaggage",
    "handBaggage",
    "included",
    "excluded",
    "features",
    "amenities",
    "facilities",
    "description",
    "longDescription",
    "shortDescription",
    "remarks",
    "notes",
    "comments",
    "bookingReference",
    "confirmationNumber",
    "reservationNumber",
    "startDate",
    "endDate",
    "departureDate",
    "arrivalDate",
    "departureTime",
    "arrivalTime",
    "duration",
    "name",
    "title",
    "hotelName",
    "ticketName",
    "vehicleName",
    "location",
    "locationName",
    "destination",
    "address",
    "price",
    "totalPrice",
    "amount",
    "currency",
  ]

  keyFields.forEach((field) => {
    if (service[field] !== undefined) {
      sample[field] = service[field]
    }
  })

  // Also include any field that might be supplier-related
  Object.keys(service).forEach((key) => {
    const lowerKey = key.toLowerCase()
    if (
      lowerKey.includes("supplier") ||
      lowerKey.includes("provider") ||
      lowerKey.includes("vendor") ||
      lowerKey.includes("operator") ||
      lowerKey.includes("image") ||
      lowerKey.includes("photo") ||
      lowerKey.includes("baggage") ||
      lowerKey.includes("luggage")
    ) {
      sample[key] = service[key]
    }
  })

  return sample
}

function findMissingFields(booking: any): string[] {
  const missing: string[] = []

  // Check transport services for baggage info
  if (booking.transportservice && booking.transportservice.length > 0) {
    const transport = booking.transportservice[0]
    if (!transport.baggage && !transport.baggageInfo && !transport.luggage) {
      missing.push("transportservice.baggage - No baggage information found")
    }
    if (!transport.supplier && !transport.provider && !transport.vendor) {
      missing.push("transportservice.supplier - No supplier information found")
    }
  }

  // Check ticket services for images and supplier
  if (booking.ticketservice && booking.ticketservice.length > 0) {
    const ticket = booking.ticketservice[0]
    if (!ticket.images && !ticket.imageUrl && !ticket.imageUrls && !ticket.photos) {
      missing.push("ticketservice.images - No image information found")
    }
    if (!ticket.supplier && !ticket.provider && !ticket.vendor && !ticket.operator) {
      missing.push("ticketservice.supplier - No supplier information found")
    }
  }

  // Check car services for images
  if (booking.carservice && booking.carservice.length > 0) {
    const car = booking.carservice[0]
    if (!car.images && !car.imageUrl && !car.imageUrls && !car.photos) {
      missing.push("carservice.images - No image information found")
    }
  }

  return missing
}

function generateRecommendations(analysis: any): string[] {
  const recommendations: string[] = []

  recommendations.push("Check all service objects for supplier/provider/vendor/operator fields")
  recommendations.push("Look for image fields: images, imageUrl, imageUrls, photos, gallery")
  recommendations.push("Check transport services for baggage/baggageInfo/luggage fields")
  recommendations.push("Examine nested objects that might contain additional data")

  // Add specific recommendations based on deep search results
  const deepSearch = analysis.deepSearchResults || {}

  if (deepSearch.images && deepSearch.images.length > 0) {
    recommendations.push(`Found potential image fields at: ${deepSearch.images.map((i: any) => i.path).join(", ")}`)
  }

  if (deepSearch.supplier && deepSearch.supplier.length > 0) {
    recommendations.push(
      `Found potential supplier fields at: ${deepSearch.supplier.map((i: any) => i.path).join(", ")}`,
    )
  }

  if (deepSearch.provider && deepSearch.provider.length > 0) {
    recommendations.push(
      `Found potential provider fields at: ${deepSearch.provider.map((i: any) => i.path).join(", ")}`,
    )
  }

  return recommendations
}
