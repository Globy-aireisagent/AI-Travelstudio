// Comprehensive booking data analyzer that explores ALL available fields
export interface BookingDataAnalysis {
  structure: any
  availableFields: string[]
  missingFields: string[]
  dataQuality: {
    completeness: number
    hasClientInfo: boolean
    hasTransportDetails: boolean
    hasHotelDetails: boolean
    hasVoucherUrls: boolean
  }
  recommendations: string[]
}

export function analyzeBookingData(rawData: any): BookingDataAnalysis {
  console.log("🔍 Starting comprehensive booking data analysis...")

  // First, let's explore the complete structure
  const structure = exploreDataStructure(rawData, "", 0, 3) // Max depth 3

  // Extract all available field paths
  const availableFields = extractAllFieldPaths(rawData)

  // Check for common missing fields
  const expectedFields = [
    "bookingReference",
    "contactPerson.name",
    "contactPerson.email",
    "hotelservice[0].hotelName",
    "transportservice[0].segment[0].flightNumber",
    "transportservice[0].etickets",
    "voucherUrl",
    "pricebreakdown.totalPrice.microsite.amount",
  ]

  const missingFields = expectedFields.filter((field) => !hasNestedField(rawData, field))

  // Analyze data quality
  const dataQuality = analyzeDataQuality(rawData)

  // Generate recommendations
  const recommendations = generateRecommendations(rawData, missingFields, dataQuality)

  return {
    structure,
    availableFields,
    missingFields,
    dataQuality,
    recommendations,
  }
}

function exploreDataStructure(obj: any, path = "", depth = 0, maxDepth = 3): any {
  if (depth > maxDepth || obj === null || obj === undefined) {
    return typeof obj
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]"
    return {
      type: "array",
      length: obj.length,
      sample: exploreDataStructure(obj[0], `${path}[0]`, depth + 1, maxDepth),
    }
  }

  if (typeof obj === "object") {
    const result: any = {}
    const keys = Object.keys(obj)

    // Show first 10 keys to avoid overwhelming output
    const keysToShow = keys.slice(0, 10)
    const hasMore = keys.length > 10

    keysToShow.forEach((key) => {
      const newPath = path ? `${path}.${key}` : key
      result[key] = exploreDataStructure(obj[key], newPath, depth + 1, maxDepth)
    })

    if (hasMore) {
      result["..."] = `${keys.length - 10} more fields`
    }

    return result
  }

  return typeof obj
}

function extractAllFieldPaths(obj: any, prefix = ""): string[] {
  const paths: string[] = []

  if (obj === null || obj === undefined || typeof obj !== "object") {
    return [prefix]
  }

  if (Array.isArray(obj)) {
    paths.push(`${prefix}[]`)
    if (obj.length > 0) {
      const subPaths = extractAllFieldPaths(obj[0], `${prefix}[0]`)
      paths.push(...subPaths)
    }
    return paths
  }

  Object.keys(obj).forEach((key) => {
    const newPrefix = prefix ? `${prefix}.${key}` : key
    paths.push(newPrefix)

    if (typeof obj[key] === "object" && obj[key] !== null) {
      const subPaths = extractAllFieldPaths(obj[key], newPrefix)
      paths.push(...subPaths)
    }
  })

  return paths
}

function hasNestedField(obj: any, fieldPath: string): boolean {
  const parts = fieldPath.split(".")
  let current = obj

  for (const part of parts) {
    if (part.includes("[") && part.includes("]")) {
      // Handle array notation like 'hotelservice[0]'
      const [arrayName, indexStr] = part.split("[")
      const index = Number.parseInt(indexStr.replace("]", ""))

      if (!current[arrayName] || !Array.isArray(current[arrayName]) || current[arrayName].length <= index) {
        return false
      }
      current = current[arrayName][index]
    } else {
      if (!current || typeof current !== "object" || !(part in current)) {
        return false
      }
      current = current[part]
    }
  }

  return current !== undefined && current !== null
}

function analyzeDataQuality(data: any): BookingDataAnalysis["dataQuality"] {
  const hasClientInfo = !!(data.contactPerson?.name || data.contactPerson?.email || data.user?.email)

  const hasTransportDetails = !!(data.transportservice?.length > 0 && data.transportservice[0]?.segment?.length > 0)

  const hasHotelDetails = !!(data.hotelservice?.length > 0 && data.hotelservice[0]?.hotelName)

  const hasVoucherUrls = !!(
    data.voucherUrl ||
    data.hotelservice?.some((h: any) => h.voucherUrl) ||
    data.transportservice?.some((t: any) => t.voucherUrl)
  )

  // Calculate completeness score
  const checks = [hasClientInfo, hasTransportDetails, hasHotelDetails, hasVoucherUrls]
  const completeness = (checks.filter(Boolean).length / checks.length) * 100

  return {
    completeness,
    hasClientInfo,
    hasTransportDetails,
    hasHotelDetails,
    hasVoucherUrls,
  }
}

function generateRecommendations(
  data: any,
  missingFields: string[],
  quality: BookingDataAnalysis["dataQuality"],
): string[] {
  const recommendations: string[] = []

  if (quality.completeness < 50) {
    recommendations.push("⚠️ Data completeness is low - consider using different API endpoints")
  }

  if (!quality.hasClientInfo) {
    recommendations.push("👤 Missing client information - check contactPerson and user fields")
  }

  if (!quality.hasTransportDetails) {
    recommendations.push("✈️ Missing transport segment details - verify transportservice.segment data")
  }

  if (!quality.hasVoucherUrls) {
    recommendations.push("🎫 Missing voucher URLs - check service-level voucher fields")
  }

  if (missingFields.length > 0) {
    recommendations.push(
      `📋 Missing expected fields: ${missingFields.slice(0, 3).join(", ")}${missingFields.length > 3 ? "..." : ""}`,
    )
  }

  // Check for pagination
  if (data.pagination) {
    recommendations.push("📄 Response contains pagination - consider fetching additional pages")
  }

  // Check for bookedTrip vs other structures
  if (data.bookedTrip) {
    recommendations.push("🎯 Data contains bookedTrip - use this as primary data source")
  }

  return recommendations
}

// Helper function to safely get nested values
export function safeGet(obj: any, path: string, defaultValue: any = null): any {
  try {
    return (
      path.split(".").reduce((current, key) => {
        if (key.includes("[") && key.includes("]")) {
          const [arrayName, indexStr] = key.split("[")
          const index = Number.parseInt(indexStr.replace("]", ""))
          return current?.[arrayName]?.[index]
        }
        return current?.[key]
      }, obj) ?? defaultValue
    )
  } catch {
    return defaultValue
  }
}
