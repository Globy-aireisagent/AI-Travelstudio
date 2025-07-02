import { type NextRequest, NextResponse } from "next/server"
import { createTravelCompositorClient } from "@/lib/travel-compositor-client"

export async function POST(request: NextRequest) {
  try {
    console.log("🏨 Hotel Images API called")

    const body = await request.json()
    console.log("📋 Request body:", body)

    const { hotelData, micrositeId, hotelName, location } = body

    // Handle different request formats
    const finalHotelName = hotelName || hotelData?.hotelName || hotelData?.name || "Unknown Hotel"
    const finalLocation = location || hotelData?.locationName || hotelData?.location || "Unknown Location"
    const finalMicrositeId = micrositeId || process.env.TRAVEL_COMPOSITOR_MICROSITE_ID

    console.log(`🏨 Processing: ${finalHotelName} in ${finalLocation} (microsite: ${finalMicrositeId})`)

    if (!finalMicrositeId) {
      throw new Error("No microsite ID available")
    }

    console.log(`🏨 Fetching hotel images and details for: ${finalHotelName}`)

    const client = createTravelCompositorClient()
    const token = await client.authenticate()

    const searchResults = {
      foundImages: [] as string[],
      hotelDescription: null as string | null,
      facilities: [] as string[],
      amenities: [] as string[],
      roomFacilities: [] as string[],
      hotelServices: [] as string[],
      searchMethods: [] as any[],
      reservationNumber: null as string | null,
    }

    // Extract reservation number from hotel data
    if (hotelData.reservationNumber) {
      searchResults.reservationNumber = hotelData.reservationNumber
    } else if (hotelData.bookingReference) {
      searchResults.reservationNumber = hotelData.bookingReference
    } else if (hotelData.confirmationNumber) {
      searchResults.reservationNumber = hotelData.confirmationNumber
    } else if (hotelData.hotelBookingReference) {
      searchResults.reservationNumber = hotelData.hotelBookingReference
    } else if (hotelData.reference) {
      searchResults.reservationNumber = hotelData.reference
    }

    // Method 1: Hotel Datasheet (most comprehensive)
    if (hotelData.hotelId) {
      try {
        console.log(`📋 Trying hotel datasheet for ID: ${hotelData.hotelId}`)

        const datasheetResponse = await fetch(
          `https://online.travelcompositor.com/resources/accommodations/${hotelData.hotelId}/datasheet?lang=nl`,
          {
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        )

        if (datasheetResponse.ok) {
          const datasheetData = await datasheetResponse.json()
          console.log("✅ Hotel datasheet found")

          // Extract images
          extractImages(datasheetData, searchResults)

          // Extract description
          extractDescription(datasheetData, searchResults)

          // Extract facilities comprehensively
          extractFacilities(datasheetData, searchResults)

          searchResults.searchMethods.push({
            method: "Hotel Datasheet",
            success: true,
            images: searchResults.foundImages.length,
            hasDescription: !!searchResults.hotelDescription,
            facilities: searchResults.facilities.length,
            amenities: searchResults.amenities.length,
          })
        } else {
          console.log("⚠️ Hotel datasheet not found")
          searchResults.searchMethods.push({
            method: "Hotel Datasheet",
            success: false,
            error: `HTTP ${datasheetResponse.status}`,
          })
        }
      } catch (error) {
        console.error("❌ Error fetching hotel datasheet:", error)
        searchResults.searchMethods.push({
          method: "Hotel Datasheet",
          success: false,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    // Method 2: Accommodations Search by Name and Location
    try {
      console.log(`🔍 Searching accommodations: ${hotelData.hotelName} in ${hotelData.locationName}`)

      const searchResponse = await fetch(
        `https://online.travelcompositor.com/resources/accommodations/search/${micrositeId}?name=${encodeURIComponent(
          hotelData.hotelName,
        )}&location=${encodeURIComponent(hotelData.locationName || "")}&lang=nl`,
        {
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      )

      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        console.log(`✅ Found ${searchData.length || 0} accommodation search results`)

        if (searchData && Array.isArray(searchData) && searchData.length > 0) {
          // Find the best match
          const bestMatch =
            searchData.find(
              (hotel: any) =>
                hotel.name?.toLowerCase().includes(hotelData.hotelName.toLowerCase()) ||
                hotelData.hotelName.toLowerCase().includes(hotel.name?.toLowerCase()),
            ) || searchData[0]

          if (bestMatch) {
            extractImages(bestMatch, searchResults)
            extractDescription(bestMatch, searchResults)
            extractFacilities(bestMatch, searchResults)
          }
        }

        searchResults.searchMethods.push({
          method: "Accommodations Search",
          success: true,
          results: searchData?.length || 0,
        })
      } else {
        searchResults.searchMethods.push({
          method: "Accommodations Search",
          success: false,
          error: `HTTP ${searchResponse.status}`,
        })
      }
    } catch (error) {
      console.error("❌ Error searching accommodations:", error)
      searchResults.searchMethods.push({
        method: "Accommodations Search",
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }

    // Method 3: Hotel Details by Location
    try {
      console.log(`🏨 Fetching hotels in location: ${hotelData.locationName}`)

      const locationResponse = await fetch(
        `https://online.travelcompositor.com/resources/hotels/${micrositeId}?location=${encodeURIComponent(
          hotelData.locationName || "",
        )}&lang=nl`,
        {
          headers: {
            "auth-token": token,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      )

      if (locationResponse.ok) {
        const locationData = await locationResponse.json()

        if (locationData && Array.isArray(locationData)) {
          const matchingHotel = locationData.find(
            (hotel: any) =>
              hotel.name?.toLowerCase().includes(hotelData.hotelName.toLowerCase()) ||
              hotelData.hotelName.toLowerCase().includes(hotel.name?.toLowerCase()),
          )

          if (matchingHotel) {
            extractImages(matchingHotel, searchResults)
            extractDescription(matchingHotel, searchResults)
            extractFacilities(matchingHotel, searchResults)
          }
        }

        searchResults.searchMethods.push({
          method: "Hotels by Location",
          success: true,
          results: locationData?.length || 0,
        })
      } else {
        searchResults.searchMethods.push({
          method: "Hotels by Location",
          success: false,
          error: `HTTP ${locationResponse.status}`,
        })
      }
    } catch (error) {
      searchResults.searchMethods.push({
        method: "Hotels by Location",
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }

    // Clean up and deduplicate results
    searchResults.foundImages = [...new Set(searchResults.foundImages.filter(Boolean))]
    searchResults.facilities = [...new Set(searchResults.facilities.filter(Boolean))]
    searchResults.amenities = [...new Set(searchResults.amenities.filter(Boolean))]
    searchResults.roomFacilities = [...new Set(searchResults.roomFacilities.filter(Boolean))]
    searchResults.hotelServices = [...new Set(searchResults.hotelServices.filter(Boolean))]

    console.log(`✅ Hotel search complete:`)
    console.log(`   - Images: ${searchResults.foundImages.length}`)
    console.log(`   - Description: ${searchResults.hotelDescription ? "Yes" : "No"}`)
    console.log(`   - Facilities: ${searchResults.facilities.length}`)
    console.log(`   - Amenities: ${searchResults.amenities.length}`)
    console.log(`   - Room Facilities: ${searchResults.roomFacilities.length}`)
    console.log(`   - Hotel Services: ${searchResults.hotelServices.length}`)
    console.log(`   - Reservation Number: ${searchResults.reservationNumber || "Not found"}`)

    return NextResponse.json({
      success: true,
      images: searchResults,
      hotel: hotelData.hotelName,
      location: hotelData.locationName,
    })
  } catch (error) {
    console.error("❌ Hotel Images API Error:", error)
    console.error("❌ Error stack:", error instanceof Error ? error.stack : "No stack")

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        details: error instanceof Error ? error.stack : "Unknown error details",
        images: {
          foundImages: [],
          hotelDescription: null,
          facilities: [],
          amenities: [],
          roomFacilities: [],
          hotelServices: [],
          reservationNumber: null,
          searchMethods: [
            {
              method: "API Error",
              success: false,
              error: error instanceof Error ? error.message : String(error),
            },
          ],
        },
      },
      { status: 500 },
    )
  }
}

function extractImages(data: any, results: any) {
  const imageFields = ["images", "gallery", "photos", "imageUrls", "imageUrl", "image", "mainImage", "thumbnailUrl"]

  imageFields.forEach((field) => {
    if (data[field]) {
      if (Array.isArray(data[field])) {
        results.foundImages.push(
          ...data[field].map((img: any) => {
            if (typeof img === "string") return img
            return img.url || img.src || img.href || img.imageUrl
          }),
        )
      } else if (typeof data[field] === "string") {
        results.foundImages.push(data[field])
      } else if (typeof data[field] === "object") {
        results.foundImages.push(data[field].url || data[field].src || data[field].href)
      }
    }
  })
}

function extractDescription(data: any, results: any) {
  if (!results.hotelDescription) {
    const descriptionFields = [
      "description",
      "longDescription",
      "hotelDescription",
      "shortDescription",
      "detailedDescription",
      "summary",
    ]

    for (const field of descriptionFields) {
      if (data[field] && typeof data[field] === "string") {
        results.hotelDescription = data[field]
        break
      }
    }
  }
}

function extractFacilities(data: any, results: any) {
  // Hotel Facilities
  const facilityFields = [
    "facilities",
    "hotelFacilities",
    "generalFacilities",
    "publicFacilities",
    "hotelServices",
    "services",
    "features",
  ]

  facilityFields.forEach((field) => {
    if (data[field]) {
      if (Array.isArray(data[field])) {
        results.facilities.push(
          ...data[field].map((item: any) => {
            if (typeof item === "string") return item
            return item.name || item.description || item.title || item.facility || String(item)
          }),
        )
      } else if (typeof data[field] === "object") {
        // Handle nested facility objects
        Object.values(data[field]).forEach((item: any) => {
          if (typeof item === "string") {
            results.facilities.push(item)
          } else if (item && typeof item === "object") {
            results.facilities.push(item.name || item.description || item.title)
          }
        })
      }
    }
  })

  // Room Facilities
  const roomFacilityFields = ["roomFacilities", "roomServices", "roomAmenities", "inRoomFacilities"]

  roomFacilityFields.forEach((field) => {
    if (data[field]) {
      if (Array.isArray(data[field])) {
        results.roomFacilities.push(
          ...data[field].map((item: any) => {
            if (typeof item === "string") return item
            return item.name || item.description || item.title || String(item)
          }),
        )
      }
    }
  })

  // Amenities
  const amenityFields = ["amenities", "hotelAmenities", "generalAmenities", "extras"]

  amenityFields.forEach((field) => {
    if (data[field]) {
      if (Array.isArray(data[field])) {
        results.amenities.push(
          ...data[field].map((item: any) => {
            if (typeof item === "string") return item
            return item.name || item.description || item.title || String(item)
          }),
        )
      }
    }
  })

  // Hotel Services (separate from facilities)
  const serviceFields = ["hotelServices", "additionalServices", "extraServices", "conciergeServices"]

  serviceFields.forEach((field) => {
    if (data[field]) {
      if (Array.isArray(data[field])) {
        results.hotelServices.push(
          ...data[field].map((item: any) => {
            if (typeof item === "string") return item
            return item.name || item.description || item.title || String(item)
          }),
        )
      }
    }
  })

  // Check for nested accommodation data
  if (data.accommodation) {
    extractFacilities(data.accommodation, results)
  }

  // Check for hotel details
  if (data.hotelDetails) {
    extractFacilities(data.hotelDetails, results)
  }
}
